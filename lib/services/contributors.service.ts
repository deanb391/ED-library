import { ID, Query } from "appwrite";
import { databases } from "@/lib/appwrite/server";
import { fetchCoursesByAdminService, updateCourseService } from "./course.service";
import { sendContributorUnderReviewEmail, sendContributorApprovedEmail, sendNewFollowerEmail } from "@/lib/email/events";
import { trackEvent } from "@/lib/analytics/trackEvent";

const DATABASE_ID = "69617e75000c6c010a75";
const CONTRIBUTORS_COLLECTION = "contributors";

export type ContributorDraft = {
  username: string;
  institution: string;
  country: string;
  bio: string;
  category: string[];
  reviewImages: string[];
  profileImage: string;
  status: string;
  hasSeenCelebration?: boolean;
};

export type Contributor = ContributorDraft & {
  $id: string;
  user: string;
  $createdAt: string;
  $updatedAt: string;
  approvalNotes: string;
  followers?: number;
  followersIds?: string;
};

function mapContributor(doc: any): Contributor {
  return {
    $id: doc.$id,
    username: doc.username,
    institution: doc.institution,
    country: doc.country,
    bio: doc.bio,
    category: doc.category || [],
    reviewImages: doc.reviewImages || [],
    profileImage: doc.profileImage,
    status: doc.status,
    user: doc.user,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    approvalNotes: doc.approvalNotes || "",
    followers: doc.followers || 0,
    followersIds: doc.followersIds,
    hasSeenCelebration: doc.hasSeenCelebration || false,
  };
}

export async function createContributorService(
  draft: ContributorDraft,
  user: string
): Promise<Contributor> {
  const now = new Date().toISOString();

  const payload = {
    ...draft,
    user,
    status: "pending",
    $createdAt: now,
    $updatedAt: now,
    approvalNotes: "",
  };

  const doc = await databases.createDocument(
    DATABASE_ID,
    CONTRIBUTORS_COLLECTION,
    ID.unique(),
    payload
  );

  // Fetch user to get email for notification
  try {
    const userDoc = await databases.getDocument(DATABASE_ID, "user", user);
    if (userDoc.email) {
      sendContributorUnderReviewEmail(userDoc.email, draft.username);
    }
  } catch (err) {
    console.error("Failed to fetch user for email notification", err);
  }

  trackEvent("CONTRIBUTOR_APPLIED", {
    distinctId: user,
    userId: user,
    metadata: { username: draft.username, institution: draft.institution }
  });

  return mapContributor(doc);
}

export async function editContributorService(
  contributorId: string,
  updates: Partial<ContributorDraft>,
  type?: string,
): Promise<Contributor> {
  const now = new Date().toISOString();

  const payload = {
    ...updates,
    $updatedAt: now,
  };

  const doc = await databases.updateDocument(
    DATABASE_ID,
    CONTRIBUTORS_COLLECTION,
    contributorId,
    payload
  );

  if (type) {
    let status = "";
    if (type === "approval") status = "live";
    else if (type === "reject") status = "not-live"
    console.log("DOC USER: ", doc.user.$id || doc.user)
    const courses = await fetchCoursesByAdminService(doc.user.$id || doc.user);
    courses.map( async (course) => {
      await updateCourseService(course.id, {
        status: status
      })
    })

    if (type === "approval") {
      try {
        const userId = typeof doc.user === 'string' ? doc.user : doc.user.$id;
        const userDoc = await databases.getDocument(DATABASE_ID, "user", userId);
        if (userDoc.email) {
          sendContributorApprovedEmail(userDoc.email, doc.username || "Contributor");
        }
      } catch (err) {
        console.error("Failed to fetch user for approval email notification", err);
      }
    }

    trackEvent(type === "approval" ? "CONTRIBUTOR_APPROVED" : "CONTRIBUTOR_REJECTED", {
      distinctId: typeof doc.user === 'string' ? doc.user : doc.user.$id,
      metadata: { contributorId, username: doc.username }
    });
  }

  return mapContributor(doc);
}

export async function deleteContributorService(
  contributorId: string
): Promise<void> {
  await databases.deleteDocument(
    DATABASE_ID,
    CONTRIBUTORS_COLLECTION,
    contributorId
  );
}

export async function fetchContributorService(
  contributorId: string
): Promise<Contributor> {
  const doc = await databases.getDocument(
    DATABASE_ID,
    CONTRIBUTORS_COLLECTION,
    contributorId
  );

  return mapContributor(doc);
}

export async function getContributorByUserIdService(
  userId: string
): Promise<Contributor | null> {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      CONTRIBUTORS_COLLECTION,
      [Query.equal("user", userId)]
    );

    if (res.documents.length === 0) {
      return null;
    }

    return mapContributor(res.documents[0]);
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

    const isFollowing = followersIds.includes(userId);

    if (isFollowing) {
      followersIds = followersIds.filter((id) => id !== userId);
    } else {
      followersIds.push(userId);
    }

    const updatedFollowersCount = followersIds.length;

    await databases.updateDocument(
      DATABASE_ID,
      CONTRIBUTORS_COLLECTION,
      contributorId,
      {
        followers: updatedFollowersCount,
        followersIds: JSON.stringify(followersIds),
      }
    );

    // Send email only when it is a new follow, not an unfollow
    if (!isFollowing) {
      try {
        const followerDoc = await databases.getDocument(DATABASE_ID, "user", userId);
        const contributorUserDoc = await databases.getDocument(DATABASE_ID, "user", contributor.user);
        if (contributorUserDoc?.email) {
          sendNewFollowerEmail(
            contributorUserDoc.email,
            contributor.username || "Contributor",
            followerDoc?.username || "A user"
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

export async function fetchTopContributorsCoursesService(limit = 10, offset = 0) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    CONTRIBUTORS_COLLECTION,
    [
      Query.orderDesc("followers"),
      Query.limit(limit),
      Query.offset(offset),
    ]
  );

  return res.documents.map(mapContributor);
}


export async function searchContributorsService(query: string) {
  const base = [
    Query.orderDesc("$updatedAt"),
    Query.limit(30),
  ];

  const [title, code, ] = await Promise.all([
    databases.listDocuments(DATABASE_ID, CONTRIBUTORS_COLLECTION, [
      Query.search("username", query),
      ...base,
    ]),
    databases.listDocuments(DATABASE_ID, CONTRIBUTORS_COLLECTION, [
      Query.search("institution", query),
      ...base,
    ]),
  ]);

  const map = new Map();


[...title.documents, ...code.documents].forEach((doc: any) => {
  map.set(doc.$id, doc);
});

  return Array.from(map.values()).map(mapContributor);
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


  const queries: any[] = [
    Query.orderDesc("$createdAt"),
    Query.limit(limit),
  ];

  if (type) {
    queries.push(Query.equal("status", type))
  }

  if (cursor) {
    queries.push(Query.cursorAfter(cursor));
  }
  if (search) {
    queries.push(Query.contains("username", search))
  }

  const res = await databases.listDocuments(
    DATABASE_ID,
    CONTRIBUTORS_COLLECTION,
    queries
  );


  const contributors = res.documents.map(mapContributor);
  const nextCursor =
    res.documents.length === limit
      ? res.documents[res.documents.length - 1].$id
      : undefined;

  // // Hydrate user data
  // const userIds = [...new Set(reviews.map(review => review.user as string))];
  // const userPromises = userIds.map(userId => getUserById(userId));
  // const users = await Promise.all(userPromises);
  // const userMap = new Map(userIds.map((id, index) => [id, users[index]]));

  // reviews.forEach(review => {
  //   const userDoc = userMap.get(review.user as string);
  //   if (userDoc) {
  //     review.user = userDoc;
  //   }
  // });

  return {
    contributors,
    nextCursor,
    hasMore: Boolean(nextCursor),
  };
}