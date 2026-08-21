import { ID, Query } from 'appwrite';
import { databases } from '@/lib/appwrite/server';
import { fetchContributorService } from './contributors.service';

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

export async function getFollowedCommunitiesService(followingContributors: string[]) {
  if (!followingContributors || followingContributors.length === 0) return [];

  const res = await databases.listDocuments(
    DATABASE_ID,
    COMMUNITIES_COLLECTION,
    [
      Query.equal('contributors', followingContributors),
      Query.limit(50)
    ]
  );

  const communitiesWithDetails = await Promise.all(res.documents.map(async (community) => {
    let latestThread = null;
    let contributorDetails = null;

    try {
      contributorDetails = await fetchContributorService(community.contributors);
    } catch (e) {
      console.error("Error fetching contributor for community", community.$id, e);
    }

    try {
      const threadRes = await databases.listDocuments(
        DATABASE_ID,
        'threads',
        [
          Query.equal('communityId', community.$id),
          Query.isNull('parentId'),
          Query.orderDesc('$createdAt'),
          Query.limit(1)
        ]
      );
      if (threadRes.documents.length > 0) {
        latestThread = threadRes.documents[0];
      }
    } catch (e) {
      console.error("Error fetching latest thread for community", community.$id, e);
    }

    return {
      ...community,
      contributorDetails,
      latestThread
    };
  }));

  return communitiesWithDetails;
}

export async function getSuggestedCommunitiesService(followingContributors: string[]) {
  const queries = [
    Query.orderDesc('$createdAt'),
    Query.limit(20)
  ];

  const res = await databases.listDocuments(
    DATABASE_ID,
    COMMUNITIES_COLLECTION,
    queries
  );

  let suggested = res.documents;
  if (followingContributors && followingContributors.length > 0) {
    suggested = suggested.filter((c: any) => !followingContributors.includes(c.contributors));
  }

  const communitiesWithDetails = await Promise.all(suggested.map(async (community) => {
    let contributorDetails = null;
    try {
      contributorDetails = await fetchContributorService(community.contributors);
    } catch (e) {
      console.error("Error fetching contributor", e);
    }
    return {
      ...community,
      contributorDetails
    };
  }));

  return communitiesWithDetails;
}
