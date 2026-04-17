import { ID } from "appwrite";
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
