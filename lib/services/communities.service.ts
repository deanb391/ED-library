import prisma from '@/lib/prisma';
import { fetchContributorService } from './contributors.service';
import { randomUUID } from 'crypto';

export async function createCommunityService(contributorId: string) {
  const id = randomUUID();
  const doc = await prisma.community.create({
    data: {
      id,
      contributorId,
    },
  });
  return {
    ...doc,
    contributors: doc.contributorId || contributorId,
    $id: doc.id,
    $createdAt: doc.createdAt.toISOString(),
    $updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function fetchCommunityByContributorService(contributorId: string) {
  const doc = await prisma.community.findFirst({
    where: { contributorId },
  });
  if (!doc) return null;
  return {
    ...doc,
    contributors: doc.contributorId || contributorId,
    $id: doc.id,
    $createdAt: doc.createdAt.toISOString(),
    $updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function getFollowedCommunitiesService(followingContributors: string[]) {
  if (!followingContributors || followingContributors.length === 0) return [];

  const docs = await prisma.community.findMany({
    where: { contributorId: { in: followingContributors } },
    take: 50,
  });

  const communitiesWithDetails = await Promise.all(docs.map(async (community) => {
    let latestThread = null;
    let contributorDetails = null;

    try {
      if (community.contributorId) {
        contributorDetails = await fetchContributorService(community.contributorId);
      }
    } catch (e) {
      console.error("Error fetching contributor for community", community.id, e);
    }

    try {
      const thread = await prisma.thread.findFirst({
        where: {
          communityId: community.id,
          parentId: null,
        },
        orderBy: { createdAt: 'desc' },
      });
      if (thread) {
        latestThread = {
          ...thread,
          $id: thread.id,
          $createdAt: thread.createdAt.toISOString(),
          $updatedAt: thread.updatedAt.toISOString(),
        };
      }
    } catch (e) {
      console.error("Error fetching latest thread for community", community.id, e);
    }

    return {
      ...community,
      contributors: community.contributorId || "",
      $id: community.id,
      $createdAt: community.createdAt.toISOString(),
      $updatedAt: community.updatedAt.toISOString(),
      contributorDetails,
      latestThread
    };
  }));

  return communitiesWithDetails;
}

export async function getSuggestedCommunitiesService(followingContributors: string[]) {
  const where: any = {};
  if (followingContributors && followingContributors.length > 0) {
    where.contributorId = { notIn: followingContributors };
  }

  const docs = await prisma.community.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const communitiesWithDetails = await Promise.all(docs.map(async (community) => {
    let contributorDetails = null;
    try {
      if (community.contributorId) {
        contributorDetails = await fetchContributorService(community.contributorId);
      }
    } catch (e) {
      console.error("Error fetching contributor", e);
    }
    return {
      ...community,
      contributors: community.contributorId || "",
      $id: community.id,
      $createdAt: community.createdAt.toISOString(),
      $updatedAt: community.updatedAt.toISOString(),
      contributorDetails
    };
  }));

  return communitiesWithDetails;
}
