import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { fetchContributorService } from '@/lib/services/contributors.service';

export async function GET(req: NextRequest) {
  try {
    const threadId = req.nextUrl.searchParams.get('threadId');
    if (!threadId) return NextResponse.json({ error: 'Missing threadId' }, { status: 400 });

    const doc = await prisma.thread.findUnique({
      where: { id: threadId },
    });

    if (!doc) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });

    let posterDetails: any = null;
    if (doc.isPosterAContributor) {
      try {
        const contributor = await fetchContributorService(doc.posterId);
        posterDetails = { name: contributor.username, avatar: contributor.profileImage, isContributor: true };
      } catch(e) {}
    } else {
      try {
        const user = await prisma.user.findUnique({ where: { id: doc.posterId } });
        posterDetails = { name: user?.name || user?.email || 'User', avatar: user?.avatar || '', isContributor: false };
      } catch(e) {}
    }
    
    let likesArray = [];
    if (doc.likes) {
      try { likesArray = JSON.parse(doc.likes); } catch(e) {}
    }

    const thread = {
      ...doc,
      $id: doc.id,
      $createdAt: doc.createdAt.toISOString(),
      $updatedAt: doc.updatedAt.toISOString(),
      posterDetails,
      likesArray
    };
    return NextResponse.json({ thread });
  } catch (err) {
    console.error('Fetch single thread failed:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
