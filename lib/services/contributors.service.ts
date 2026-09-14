import prisma from "@/lib/prisma";
import { createCommunityService } from "./communities.service";
import { fetchCoursesByAdminService, updateCourseService } from "./course.service";
import { sendContributorUnderReviewEmail, sendContributorApprovedEmail, sendNewFollowerEmail } from "@/lib/email/events";
import { trackContributorApplication } from "@/lib/analytics/trackers";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { createContestPerformanceService, getContestPerformanceByContributorService } from "./contest_performance.service";
import { safeRedisOp } from "@/lib/redis";
import { getLfuCache, setLfuCache, invalidateLfuCache, clearLfuCacheNamespace } from "@/lib/lfu-cache";
import { randomUUID } from "crypto";

export type ContributorDraft = {
  username: string;
  institution: string;
  phone: string;
  bio: string;
  category: string[];
  reviewImages: string[];
  profileImage: string;
  status: string;
  hasSeenCelebration?: boolean;
  agreed?: boolean;
  uploadCount?: number;
  weeklyUploadCount?: number;
  isTopContributor?: boolean;
  topContributorWeek?: string;
  joinedContest?: boolean;
  joinedContestAt?: string;
};

export type Contributor = ContributorDraft & {
  $id: string;
  user: string;
  $createdAt: string;
  $updatedAt: string;
  approvalNotes: string;
  followers?: number;
  followersIds?: string;
  uploadCount?: number;
  weeklyUploadCount?: number;
  isTopContributor?: boolean;
  topContributorWeek?: string;
  joinedContest?: boolean;
  joinedContestAt?: string;
};

function parseJsonArray(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function mapContributor(doc: any): Contributor {
  if (!doc) return null as any;
  return {
    $id: doc.id || doc.$id,
    username: doc.username || "",
    institution: doc.institution || "",
    phone: doc.phone || "",
    bio: doc.bio || "",
    category: parseJsonArray(doc.category),
    reviewImages: parseJsonArray(doc.reviewImages),
    profileImage: doc.profileImage || "",
    status: doc.status || "pending",
    user: doc.userId || (typeof doc.user === 'string' ? doc.user : doc.user?.id) || "",
    $createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.$createdAt || new Date().toISOString()),
    $updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.$updatedAt || new Date().toISOString()),
    approvalNotes: doc.approvalNotes || "",
    followers: doc.followers || 0,
    followersIds: doc.followersIds || "[]",
    hasSeenCelebration: Boolean(doc.hasSeenCelebration),
    agreed: Boolean(doc.agreed),
    uploadCount: doc.uploadCount || 0,
    weeklyUploadCount: doc.weeklyUploadCount || 0,
    isTopContributor: Boolean(doc.isTopContributor),
    topContributorWeek: doc.topContributorWeek || "",
    joinedContest: Boolean(doc.joinedContest),
    joinedContestAt: doc.joinedContestAt ? (doc.joinedContestAt instanceof Date ? doc.joinedContestAt.toISOString() : String(doc.joinedContestAt)) : "",
  };
}

export async function createContributorService(
  draft: ContributorDraft,
  user: string
): Promise<Contributor> {
  const id = randomUUID();
  const doc = await prisma.contributor.create({
    data: {
      id,
      userId: user,
      username: draft.username,
      institution: draft.institution,
      phone: draft.phone,
      bio: draft.bio,
      category: draft.category || [],
      reviewImages: draft.reviewImages || [],
      profileImage: draft.profileImage || "",
      status: "pending",
      approvalNotes: "",
      followers: 0,
      followersIds: "[]",
      hasSeenCelebration: draft.hasSeenCelebration || false,
      agreed: draft.agreed || false,
      uploadCount: 0,
      weeklyUploadCount: 0,
      isTopContributor: false,
      topContributorWeek: "",
      joinedContest: draft.joinedContest || false,
      joinedContestAt: draft.joinedContestAt || null,
    },
  });

  try {
    const userDoc = await prisma.user.findUnique({ where: { id: user } });
    if (userDoc?.email) {
      sendContributorUnderReviewEmail(userDoc.email, draft.username);
    }
  } catch (err) {
    console.error("Failed to fetch user for email notification", err);
  }

  trackContributorApplication(user, { username: draft.username, institution: draft.institution });
  await clearLfuCacheNamespace("contributor:lists");

  return mapContributor(doc);
}

export async function editContributorService(
  contributorId: string,
  updates: Partial<ContributorDraft>,
  type?: string,
  editingUserId?: string,
): Promise<Contributor> {
  let isAdmin = false;
  if (editingUserId) {
    try {
      const userDoc = await prisma.user.findUnique({ where: { id: editingUserId } });
      if (userDoc?.isAdmin) {
        isAdmin = true;
      }
    } catch (e) {
      console.error("Failed to fetch editing user", e);
    }
  }

  const dataToUpdate: any = {};

  if (isAdmin) {
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        if (key === "joinedContestAt") {
          dataToUpdate[key] = value ? String(value) : null;
        } else {
          dataToUpdate[key] = value;
        }
      }
    }
  } else {
    const safeFields = ['username', 'institution', 'phone', 'bio', 'category', 'reviewImages', 'profileImage', 'hasSeenCelebration', 'agreed', 'joinedContest', 'joinedContestAt'];
    for (const field of safeFields) {
      const val = updates[field as keyof ContributorDraft];
      if (val !== undefined) {
        if (field === "joinedContestAt") {
          dataToUpdate[field] = val ? String(val) : null;
        } else {
          dataToUpdate[field] = val;
        }
      }
    }
  }

  const doc = await prisma.contributor.update({
    where: { id: contributorId },
    data: dataToUpdate,
  });

  if (updates.joinedContest === true) {
    try {
      const existingPerf = await getContestPerformanceByContributorService(contributorId);
      if (!existingPerf) {
        await createContestPerformanceService(contributorId);
      }
    } catch (e) {
      console.error("Failed to init contest performance doc", e);
    }
  }

  if (type) {
    let status = "";
    if (type === "approval") status = "live";
    else if (type === "reject") status = "not-live";

    const userId = doc.userId;
    if (userId) {
      const courses = await fetchCoursesByAdminService(userId);
      await Promise.all(
        courses.filter(Boolean).map((course) =>
          updateCourseService(course!.id, {
            status: status,
          })
        )
      );

      if (type === "approval") {
        try {
          const userDoc = await prisma.user.findUnique({ where: { id: userId } });
          if (userDoc?.email) {
            sendContributorApprovedEmail(userDoc.email, doc.username || "Contributor");
          }
        } catch (err) {
          console.error("Failed to fetch user for approval email notification", err);
        }
      }

      trackEvent(type === "approval" ? "CONTRIBUTOR_APPROVED" : "CONTRIBUTOR_REJECTED", {
        distinctId: userId,
        metadata: { contributorId, username: doc.username }
      });
    }
  }

  await invalidateLfuCache("contributor:details", contributorId);
  await clearLfuCacheNamespace("contributor:lists");

  return mapContributor(doc);
}

export async function deleteContributorService(contributorId: string): Promise<void> {
  await clearLfuCacheNamespace("contributor:lists");
  await prisma.contributor.delete({
    where: { id: contributorId },
  });
}

export async function fetchContributorService(contributorId: string): Promise<Contributor> {
  const cached = await getLfuCache<Contributor>("contributor:details", contributorId);
  if (cached) return cached;

  const doc = await prisma.contributor.findUnique({
    where: { id: contributorId },
  });

  if (!doc) {
    throw new Error(`Contributor ${contributorId} not found`);
  }

  const mapped = mapContributor(doc);
  await setLfuCache("contributor:details", contributorId, mapped, 100);

  return mapped;
}

export async function getContributorByUserIdService(userId: string): Promise<Contributor | null> {
  try {
    const doc = await prisma.contributor.findFirst({
      where: { userId },
    });

    if (!doc) {
      return null;
    }

    return mapContributor(doc);
  } catch (err) {
    console.error("Error fetching contributor by userId:", err);
    return null;
  }
}

export async function toggleFollowContributorService(
  userId: string,
  contributorId: string
): Promise<boolean> {
  try {
    const contributor = await fetchContributorService(contributorId);
    const followerDoc = await prisma.user.findUnique({ where: { id: userId } });

    const raw = contributor.followersIds;
    let followersIds: string[] = [];

    if (raw) {
      try {
        followersIds = JSON.parse(raw);
        if (!Array.isArray(followersIds)) followersIds = [];
      } catch {
        followersIds = [];
      }
    }

    let followingContributors: string[] = [];
    if (followerDoc?.followingContributors) {
      try {
        followingContributors = typeof followerDoc.followingContributors === 'string'
          ? JSON.parse(followerDoc.followingContributors)
          : followerDoc.followingContributors;
      } catch (e) {}
    }

    const isFollowing = followersIds.includes(userId);

    if (isFollowing) {
      followersIds = followersIds.filter((id) => id !== userId);
      followingContributors = followingContributors.filter((id) => id !== contributorId);
    } else {
      followersIds.push(userId);
      if (!followingContributors.includes(contributorId)) {
        followingContributors.push(contributorId);
      }
    }

    const updatedFollowersCount = followersIds.length;

    await prisma.contributor.update({
      where: { id: contributorId },
      data: {
        followers: updatedFollowersCount,
        followersIds: JSON.stringify(followersIds),
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        followingContributors: JSON.stringify(followingContributors),
      },
    });

    await invalidateLfuCache("contributor:details", contributorId);
    await clearLfuCacheNamespace("contributor:lists");

    if (!isFollowing) {
      try {
        const contributorUserDoc = await prisma.user.findUnique({ where: { id: contributor.user } });
        if (contributorUserDoc?.email) {
          sendNewFollowerEmail(
            contributorUserDoc.email,
            contributor.username || "Contributor",
            followerDoc?.name || followerDoc?.email || "A user"
          );
        }
      } catch (err) {
        console.error("Failed to send new follower email:", err);
      }

      trackEvent("CONTRIBUTOR_FOLLOWED", {
        distinctId: userId,
        userId,
        metadata: { contributorId, username: contributor.username }
      });
    }

    return true;
  } catch (err) {
    console.error("toggleFollowContributorService error:", err);
    return false;
  }
}

export async function fetchTopContributorsCoursesService(limit = 50, offset = 0) {
  const cacheKey = `top:${limit}:${offset}`;
  const cached = await getLfuCache<Contributor[]>("contributor:lists", cacheKey);
  if (cached) return cached;

  const docs = await prisma.contributor.findMany({
    orderBy: { followers: 'desc' },
    take: limit,
    skip: offset,
  });

  const mapped = docs.map(mapContributor);
  await setLfuCache("contributor:lists", cacheKey, mapped, 50);

  return mapped;
}

export async function fetchNewContributorsCoursesService(limit = 50, offset = 0) {
  const cacheKey = `new:${limit}:${offset}`;
  const cached = await getLfuCache<Contributor[]>("contributor:lists", cacheKey);
  if (cached) return cached;

  const docs = await prisma.contributor.findMany({
    where: { status: "live" },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });

  const mapped = docs.map(mapContributor);
  await setLfuCache("contributor:lists", cacheKey, mapped, 50);

  return mapped;
}

export async function fetchContestContributorsService(): Promise<Contributor[]> {
  const docs = await prisma.contributor.findMany({
    where: { joinedContest: true },
    take: 100,
  });

  return docs.map(mapContributor);
}

export async function searchContributorsService(query: string) {
  const docs = await prisma.contributor.findMany({
    where: {
      OR: [
        { username: { contains: query, mode: "insensitive" } },
        { institution: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { updatedAt: 'desc' },
    take: 30,
  });

  return docs.map(mapContributor);
}

export async function fetchContributorsService(
  type?: string,
  limit = 5,
  cursor?: string,
  search?: string
): Promise<{
  contributors: Contributor[];
  nextCursor?: string;
  hasMore: boolean;
}> {
  const cacheKey = `all:${type || "all"}:${limit}:${cursor || "none"}:${search || "none"}`;
  const cached = await getLfuCache<any>("contributor:lists", cacheKey);
  if (cached) return cached;

  const where: any = {};
  if (type) {
    where.status = type;
  }
  if (search) {
    where.username = { contains: search, mode: "insensitive" };
  }

  const findOptions: any = {
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  };

  if (cursor) {
    findOptions.cursor = { id: cursor };
    findOptions.skip = 1;
  }

  const docs = await prisma.contributor.findMany(findOptions);
  const contributors = docs.map(mapContributor);
  const nextCursor =
    docs.length === limit
      ? docs[docs.length - 1].id
      : undefined;

  const result = {
    contributors,
    nextCursor,
    hasMore: Boolean(nextCursor),
  };

  await setLfuCache("contributor:lists", cacheKey, result, 50);

  return result;
}
