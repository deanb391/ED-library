import { NextRequest, NextResponse } from 'next/server';
import { likeThreadService } from '@/lib/services/threads.service';

export async function POST(req: NextRequest) {
  try {
    const { threadId, userId } = await req.json();
    if (!threadId || !userId) {
      return NextResponse.json({ error: 'Missing threadId or userId' }, { status: 400 });
    }

    const thread = await likeThreadService(threadId, userId);
    return NextResponse.json({ success: true, thread });
  } catch (err) {
    console.error('Like thread failed:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
