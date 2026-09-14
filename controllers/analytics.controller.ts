import { NextRequest, NextResponse } from 'next/server';
import prisma from '../lib/prisma';
import { AuthService } from '../services/auth.service';

export class AnalyticsController {
  static async recordEvent(req: NextRequest) {
    try {
      const authHeader = req.headers.get('authorization');
      let userId: string | null = null;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const decoded = AuthService.verifyToken(authHeader.split(' ')[1]);
        if (decoded?.userId) userId = decoded.userId;
      }

      const body = await req.json();
      const generatedId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const event = await prisma.analyticsEvent.create({
        data: {
          id: generatedId,
          eventName: body.eventName || body.event || 'generic',
          distinctId: body.distinctId || userId || 'anonymous',
          userId: userId || body.userId || null,
          metadata: typeof body.metadata === 'object' ? JSON.stringify(body.metadata) : body.metadata || null,
          value: body.value ? parseFloat(body.value) : null,
        },
      });

      return NextResponse.json({ success: true, event: { ...event, $id: event.id } }, { status: 201 });
    } catch (error) {
      console.error('Record analytics event error:', error);
      return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
    }
  }

  static async getDailyMetrics(req: NextRequest) {
    try {
      const { searchParams } = req.nextUrl;
      const limit = parseInt(searchParams.get('limit') || '30', 10);

      const metrics = await prisma.analyticsDailyMetric.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return NextResponse.json({ metrics: metrics.map((m: any) => ({ ...m, $id: m.id })) }, { status: 200 });
    } catch (error) {
      console.error('Get daily metrics error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
