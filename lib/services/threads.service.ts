import prisma from '@/lib/prisma';
import { fetchContributorService } from './contributors.service';
import { randomUUID } from 'crypto';

export async function createThreadService(payload: {
  communityId: string;
  posterId: string;
  isPosterAContributor: boolean;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  mediaData?: string;
  parentId?: string;
}) {
  const id = randomUUID();
  const doc = await prisma.thread.create({
    data: {
      id,
      communityId: payload.communityId,
      posterId: payload.posterId,
      isPosterAContributor: payload.isPosterAContributor,
      content: payload.content,
      mediaUrl: payload.mediaUrl || null,
      mediaType: payload.mediaType || null,
      mediaData: payload.mediaData || null,
      parentId: payload.parentId || null,
      likes: "[]",
      commentCount: 0,
    },
  });

  if (payload.parentId) {
    try {
      const parentDoc = await prisma.thread.findUnique({
        where: { id: payload.parentId },
      });
      if (parentDoc) {
        await prisma.thread.update({
          where: { id: payload.parentId },
          data: {
            commentCount: (parentDoc.commentCount || 0) + 1,
          },
        });
      }
    } catch (err) {
      console.error('Error updating parent thread comment count:', err);
    }
  }

  return {
    ...doc,
    $id: doc.id,
    $createdAt: doc.createdAt.toISOString(),
    $updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function fetchThreadsService(communityId: string, limit = 20, offset = 0, parentId?: string) {
  const where: any = { communityId };
  if (parentId) {
    where.parentId = parentId;
  } else {
    where.parentId = null;
  }

  const docs = await prisma.thread.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
  
  const threads = await Promise.all(docs.map(async (doc) => {
    let posterDetails: any = null;
    if (doc.isPosterAContributor) {
      try {
         const contributor = await fetchContributorService(doc.posterId);
         posterDetails = {
           name: contributor.username,
           avatar: contributor.profileImage,
           isContributor: true
         };
      } catch(e) { console.error('Error fetching contributor:', e); }
    } else {
      try {
         const user = await prisma.user.findUnique({ where: { id: doc.posterId } });
         posterDetails = {
           name: user?.name || user?.email || 'User',
           avatar: user?.avatar || '',
           isContributor: false
         };
      } catch(e) { console.error('Error fetching user:', e); }
    }
    
    // Parse likes
    let likesArray = [];
    if (doc.likes) {
      try { likesArray = JSON.parse(doc.likes); } catch(e) {}
    }

    return {
      ...doc,
      $id: doc.id,
      $createdAt: doc.createdAt.toISOString(),
      $updatedAt: doc.updatedAt.toISOString(),
      posterDetails,
      likesArray
    };
  }));
  
  return threads;
}

export async function likeThreadService(threadId: string, userId: string) {
  const doc = await prisma.thread.findUnique({ where: { id: threadId } });
  if (!doc) throw new Error("Thread not found");

  let likesArray: string[] = [];
  if (doc.likes) {
    try {
      likesArray = JSON.parse(doc.likes);
    } catch(e) {}
  }
  const idx = likesArray.indexOf(userId);
  if (idx > -1) {
    likesArray.splice(idx, 1);
  } else {
    likesArray.push(userId);
  }
  const updated = await prisma.thread.update({
    where: { id: threadId },
    data: {
      likes: JSON.stringify(likesArray),
    },
  });

  return {
    ...updated,
    $id: updated.id,
    $createdAt: updated.createdAt.toISOString(),
    $updatedAt: updated.updatedAt.toISOString(),
  };
}
