import { ID, Query } from 'appwrite';
import { databases, getUserById } from '@/lib/appwrite/server';
import { fetchContributorService } from './contributors.service';

const DATABASE_ID = '69617e75000c6c010a75';
const THREADS_COLLECTION = 'threads';

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
  const doc = await databases.createDocument(
    DATABASE_ID,
    THREADS_COLLECTION,
    ID.unique(),
    payload
  );

  if (payload.parentId) {
    try {
      const parentDoc = await databases.getDocument(DATABASE_ID, THREADS_COLLECTION, payload.parentId);
      await databases.updateDocument(DATABASE_ID, THREADS_COLLECTION, payload.parentId, {
        commentCount: (parentDoc.commentCount || 0) + 1
      });
    } catch (err) {
      console.error('Error updating parent thread comment count:', err);
    }
  }

  return doc;
}

export async function fetchThreadsService(communityId: string, limit = 20, offset = 0, parentId?: string) {
  const queries = [
    Query.equal('communityId', communityId),
    Query.orderDesc('$createdAt'),
    Query.limit(limit),
    Query.offset(offset)
  ];

  if (parentId) {
    queries.push(Query.equal('parentId', parentId));
  } else {
    // Fallback if isNull doesn't work well in some appwrite versions, 
    // but ideally we'd use Query.isNull('parentId'). 
    // Since we can't reliably know if older documents have it as null or missing, we just fetch them.
    // If we only want root threads, we can filter in memory or use isNull. Let's try isNull.
    queries.push(Query.isNull('parentId'));
  }

  const res = await databases.listDocuments(
    DATABASE_ID,
    THREADS_COLLECTION,
    queries
  );
  
  const threads = await Promise.all(res.documents.map(async (doc) => {
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
         const user = await getUserById(doc.posterId);
         posterDetails = {
           name: user?.username || 'User',
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
      posterDetails,
      likesArray
    };
  }));
  
  return threads;
}

export async function likeThreadService(threadId: string, userId: string) {
  const doc = await databases.getDocument(DATABASE_ID, THREADS_COLLECTION, threadId);
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
  return await databases.updateDocument(DATABASE_ID, THREADS_COLLECTION, threadId, {
    likes: JSON.stringify(likesArray)
  });
}

