import { ID, Query } from "appwrite";
import { databases } from "@/lib/appwrite/server";

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
    followersIds: doc.followersIds
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

  return mapContributor(doc);
}

export async function editContributorService(
  contributorId: string,
  updates: Partial<ContributorDraft>
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