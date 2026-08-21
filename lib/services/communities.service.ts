import { ID, Query } from 'appwrite';
import { databases } from '@/lib/appwrite/server';

const DATABASE_ID = '69617e75000c6c010a75';
const COMMUNITIES_COLLECTION = 'communities';

export async function createCommunityService(contributorId: string) {
  return await databases.createDocument(
    DATABASE_ID,
    COMMUNITIES_COLLECTION,
    ID.unique(),
    { contributors: contributorId }
  );
}

export async function fetchCommunityByContributorService(contributorId: string) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COMMUNITIES_COLLECTION,
    [Query.equal('contributors', contributorId), Query.limit(1)]
  );
  if (res.documents.length === 0) return null;
  return res.documents[0];
}
