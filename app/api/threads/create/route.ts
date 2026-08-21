import { NextRequest, NextResponse } from 'next/server';
import { createThreadService } from '@/lib/services/threads.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { communityId, posterId, isPosterAContributor, content, mediaUrl, mediaType, parentId, mediaData } = body;

    if (!communityId || !posterId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const thread = await createThreadService({
      communityId,
      posterId,
      isPosterAContributor: !!isPosterAContributor,
      content,
      mediaUrl,
      mediaType,
      parentId
    });

    return NextResponse.json({ thread });
  } catch (err) {
    console.error('Create thread failed:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

