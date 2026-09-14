import { NextRequest, NextResponse } from 'next/server';
import prisma from '../lib/prisma';
import { AuthService } from '../services/auth.service';

export class ContestController {
  static async getLeaderboard(req: NextRequest) {
    try {
      const performances = await prisma.contestPerformance.findMany({
        include: {
          contributor: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { totalPoints: 'desc' },
      });

      const formatted = performances.map((p: any, index: number) => ({
        ...p,
        rank: index + 1,
        $id: p.id,
        $createdAt: p.createdAt.toISOString(),
        $updatedAt: p.updatedAt.toISOString(),
      }));

      return NextResponse.json({ leaderboard: formatted, total: formatted.length }, { status: 200 });
    } catch (error) {
      console.error('Get leaderboard error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async join(req: NextRequest) {
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

      const contributor = await prisma.contributor.findUnique({
        where: { userId: decoded.userId },
      });

      if (!contributor) {
        return NextResponse.json({ error: 'Contributor profile required to join contest' }, { status: 400 });
      }

      await prisma.contributor.update({
        where: { id: contributor.id },
        data: {
          joinedContest: true,
          joinedContestAt: new Date().toISOString(),
        },
      });

      let perf = await prisma.contestPerformance.findFirst({
        where: { contributorId: contributor.id },
      });

      if (!perf) {
        perf = await prisma.contestPerformance.create({
          data: {
            id: `cp_${contributor.id}`,
            contributorId: contributor.id,
            totalPoints: 0,
          },
        });
      }

      return NextResponse.json({ success: true, contestPerformance: perf }, { status: 200 });
    } catch (error) {
      console.error('Join contest error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
