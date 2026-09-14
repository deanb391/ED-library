import { NextRequest, NextResponse } from 'next/server';
import prisma from '../lib/prisma';
import { AuthService } from '../services/auth.service';

export class StreakController {
  static async getStreak(req: NextRequest, targetUserId?: string) {
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

      const streak = await prisma.streak.findFirst({
        where: { userId },
      });

      return NextResponse.json({
        streak: streak ? { ...streak, $id: streak.id } : null,
      }, { status: 200 });
    } catch (error) {
      console.error('Get streak error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async recordActivity(req: NextRequest) {
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

      const today = new Date().toISOString().split('T')[0];
      let streak = await prisma.streak.findFirst({ where: { userId: decoded.userId } });

      if (!streak) {
        streak = await prisma.streak.create({
          data: {
            id: `str_${decoded.userId}`,
            userId: decoded.userId,
            currentStreak: 1,
            longestStreak: 1,
            joinedDate: today,
            lastUploadDate: today,
            streakHistory: JSON.stringify([today]),
          },
        });
      } else {
        const lastUpload = streak.lastUploadDate;
        let newCurrent = streak.currentStreak || 0;
        let newLongest = streak.longestStreak || 0;

        if (lastUpload !== today) {
          newCurrent += 1;
          if (newCurrent > newLongest) newLongest = newCurrent;

          let history: string[] = [];
          try {
            history = streak.streakHistory ? JSON.parse(streak.streakHistory) : [];
          } catch {
            history = [];
          }
          if (!history.includes(today)) history.push(today);

          streak = await prisma.streak.update({
            where: { id: streak.id },
            data: {
              currentStreak: newCurrent,
              longestStreak: newLongest,
              lastUploadDate: today,
              streakHistory: JSON.stringify(history),
            },
          });
        }
      }

      return NextResponse.json({ streak: { ...streak, $id: streak.id } }, { status: 200 });
    } catch (error) {
      console.error('Record streak activity error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
