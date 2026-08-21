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
}) {
  return await databases.createDocument(
    DATABASE_ID,
    THREADS_COLLECTION,
    ID.unique(),
    payload
  );
}

export async function fetchThreadsService(communityId: string, limit = 20, offset = 0) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    THREADS_COLLECTION,
    [
      Query.equal('communityId', communityId),
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
      Query.offset(offset)
    ]
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
           avatar: user?.profileImage || '',
           isContributor: false
         };
      } catch(e) { console.error('Error fetching user:', e); }
    }
    
    return {
      ...doc,
      posterDetails
    };
  }));
  
  return threads;
}
