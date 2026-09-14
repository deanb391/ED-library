import { NextRequest, NextResponse } from 'next/server';
import prisma from '../lib/prisma';
import { AuthService } from '../services/auth.service';

export class WalletController {
  static async getWallet(req: NextRequest, targetUserId?: string) {
    try {
      const { searchParams } = req.nextUrl;
      let userId = targetUserId || searchParams.get('userId');

      if (!userId) {
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const decoded = AuthService.verifyToken(authHeader.split(' ')[1]);
          if (decoded?.userId) userId = decoded.userId;
        }
      }

      if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
      }

      let wallet = await prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: {
            id: `wlt_${userId}`,
            userId,
            balance: 0,
          },
        });
      }

      return NextResponse.json({
        wallet: {
          ...wallet,
          $id: wallet.id,
          $createdAt: wallet.createdAt.toISOString(),
          $updatedAt: wallet.updatedAt.toISOString(),
        },
      }, { status: 200 });
    } catch (error) {
      console.error('Get wallet error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async createWallet(req: NextRequest) {
    try {
      const body = await req.json();
      const userId = body.userId || body.user;

      if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
      }

      let wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: {
            id: `wlt_${userId}`,
            userId,
            balance: 0,
            cashout_account: body.cashout_account || null,
          },
        });
      }

      return NextResponse.json({
        wallet: {
          ...wallet,
          $id: wallet.id,
          $createdAt: wallet.createdAt.toISOString(),
          $updatedAt: wallet.updatedAt.toISOString(),
        },
      }, { status: 200 });
    } catch (error) {
      console.error('Create wallet error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async updateCashout(req: NextRequest) {
    try {
      const authHeader = req.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const token = authHeader.split(' ')[1];
      const decoded = AuthService.verifyToken(token);
      if (!decoded || !decoded.userId) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      const body = await req.json();
      const { cashout_account } = body;

      const updated = await prisma.wallet.upsert({
        where: { userId: decoded.userId },
        update: {
          cashout_account: typeof cashout_account === 'object' ? JSON.stringify(cashout_account) : cashout_account,
        },
        create: {
          id: `wlt_${decoded.userId}`,
          userId: decoded.userId,
          balance: 0,
          cashout_account: typeof cashout_account === 'object' ? JSON.stringify(cashout_account) : cashout_account,
        },
      });

      return NextResponse.json({
        wallet: {
          ...updated,
          $id: updated.id,
          $createdAt: updated.createdAt.toISOString(),
          $updatedAt: updated.updatedAt.toISOString(),
        },
      }, { status: 200 });
    } catch (error) {
      console.error('Update cashout error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async getHistory(req: NextRequest, targetUserId?: string) {
    try {
      const { searchParams } = req.nextUrl;
      const userId = targetUserId || searchParams.get('userId');

      if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
      }

      const [transactions, walletHistory, withdrawals] = await Promise.all([
        prisma.transaction.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        prisma.walletHistory.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        prisma.withdrawal.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
      ]);

      return NextResponse.json({
        transactions: transactions.map((t: any) => ({ ...t, $id: t.id })),
        walletHistory: walletHistory.map((w: any) => ({ ...w, $id: w.id })),
        withdrawals: withdrawals.map((w: any) => ({ ...w, $id: w.id })),
      }, { status: 200 });
    } catch (error) {
      console.error('Get wallet history error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async requestWithdrawal(req: NextRequest) {
    try {
      const authHeader = req.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const token = authHeader.split(' ')[1];
      const decoded = AuthService.verifyToken(token);
      if (!decoded || !decoded.userId) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      const body = await req.json();
      const amount = parseFloat(body.amount);

      if (!amount || amount <= 0) {
        return NextResponse.json({ error: 'Invalid withdrawal amount' }, { status: 400 });
      }

      const wallet = await prisma.wallet.findUnique({ where: { userId: decoded.userId } });
      if (!wallet || (wallet.balance || 0) < amount) {
        return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
      }

      const generatedId = `wd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const [withdrawal] = await prisma.$transaction([
        prisma.withdrawal.create({
          data: {
            id: generatedId,
            userId: decoded.userId,
            amount,
            status: 'pending',
            description: body.description || 'Withdrawal request',
          },
        }),
        prisma.wallet.update({
          where: { userId: decoded.userId },
          data: { balance: { decrement: amount } },
        }),
        prisma.walletHistory.create({
          data: {
            id: `wh_${Date.now()}`,
            userId: decoded.userId,
            type: 'withdrawal',
            description: `Pending withdrawal of ${amount}`,
            amount: -amount,
          },
        }),
      ]);

      return NextResponse.json({
        withdrawal: {
          ...withdrawal,
          $id: withdrawal.id,
          $createdAt: withdrawal.createdAt.toISOString(),
          $updatedAt: withdrawal.updatedAt.toISOString(),
        },
      }, { status: 201 });
    } catch (error) {
      console.error('Request withdrawal error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
