import { NextRequest, NextResponse } from 'next/server';
import { fetchThreadsService } from '@/lib/services/threads.service';

export async function GET(req: NextRequest) {
  try {
    const communityId = req.nextUrl.searchParams.get('communityId');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20', 10);
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0', 10);

    if (!communityId) return NextResponse.json({ error: 'Missing communityId' }, { status: 400 });

    const threads = await fetchThreadsService(communityId, limit, offset);

    return NextResponse.json({ threads });
  } catch (err) {
    console.error('Fetch threads failed:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
