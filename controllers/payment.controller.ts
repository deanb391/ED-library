import { NextRequest, NextResponse } from 'next/server';
import prisma from '../lib/prisma';
import { AuthService } from '../services/auth.service';

export class PaymentController {
  static async listUserPayments(req: NextRequest) {
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

      const payments = await prisma.payment.findMany({
        where: { userId: decoded.userId },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = payments.map((p: any) => ({
        ...p,
        $id: p.id,
        $createdAt: p.createdAt.toISOString(),
        $updatedAt: p.updatedAt.toISOString(),
      }));

      return NextResponse.json({ payments: formatted }, { status: 200 });
    } catch (error) {
      console.error('List user payments error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async createPaymentRecord(req: NextRequest) {
    try {
      const body = await req.json();
      const generatedId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const payment = await prisma.payment.create({
        data: {
          id: generatedId,
          type: body.type || 'course_purchase',
          status: body.status || 'successful',
          userId: body.userId || body.user || null,
          description: body.description || null,
          transactionId: body.transactionId || null,
          courses: typeof body.courses === 'object' ? JSON.stringify(body.courses) : body.courses || null,
          provider: body.provider || 'flutterwave',
          amount: body.amount ? parseFloat(body.amount) : null,
        },
      });

      return NextResponse.json({
        payment: {
          ...payment,
          $id: payment.id,
          $createdAt: payment.createdAt.toISOString(),
          $updatedAt: payment.updatedAt.toISOString(),
        },
      }, { status: 201 });
    } catch (error) {
      console.error('Create payment error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
