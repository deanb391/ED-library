import { NextRequest, NextResponse } from 'next/server';
import prisma from '../lib/prisma';

export class AdController {
  static async listAds(req: NextRequest) {
    try {
      const now = new Date();
      const ads = await prisma.ad.findMany({
        where: {
          isExpired: false,
          OR: [
            { endTime: null },
            { endTime: { gt: now } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = ads.map(a => ({
        ...a,
        $id: a.id,
        $createdAt: a.createdAt.toISOString(),
        $updatedAt: a.updatedAt.toISOString(),
      }));

      return NextResponse.json({ total: formatted.length, documents: formatted, ads: formatted }, { status: 200 });
    } catch (error) {
      console.error('List ads error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  static async recordImpression(req: NextRequest, id: string) {
    try {
      await prisma.ad.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error('Record impression error:', error);
      return NextResponse.json({ error: 'Failed to record impression' }, { status: 500 });
    }
  }

  static async recordClick(req: NextRequest, id: string) {
    try {
      await prisma.ad.update({
        where: { id },
        data: { clicks: { increment: 1 } },
      });
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error('Record click error:', error);
      return NextResponse.json({ error: 'Failed to record click' }, { status: 500 });
    }
  }
}
