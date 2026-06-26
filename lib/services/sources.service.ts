import { ID, Query } from "appwrite";
import { databases } from "@/lib/appwrite/server";

const DATABASE_ID = "69617e75000c6c010a75";
const SOURCES_COLLECTION = "sources";

export type Source = {
  $id?: string;
  name: string;
  clickCount: number;
  signUpCount: number;
  contributorCount: number;
};

export async function getSourceByName(name: string): Promise<Source | null> {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      SOURCES_COLLECTION,
      [Query.equal("name", name)]
    );
    if (res.documents.length === 0) return null;
    return res.documents[0] as unknown as Source;
  } catch (err) {
    console.error("Error fetching source:", err);
    return null;
  }
}

export async function createSource(name: string): Promise<Source> {
  const payload = {
    name,
    clickCount: 0,
    signUpCount: 0,
    contributorCount: 0,
  };
  const doc = await databases.createDocument(
    DATABASE_ID,
    SOURCES_COLLECTION,
    ID.unique(),
    payload
  );
  return doc as unknown as Source;
}

export async function trackSourceClickService(name: string): Promise<Source> {
  let source = await getSourceByName(name);
  if (!source) {
    source = await createSource(name);
  }
  
  const doc = await databases.updateDocument(
    DATABASE_ID,
    SOURCES_COLLECTION,
    source.$id!,
    {
      clickCount: source.clickCount + 1
    }
  );
  return doc as unknown as Source;
}

export async function trackSourceSignupService(name: string): Promise<Source | null> {
  let source = await getSourceByName(name);
  if (!source) {
    source = await createSource(name);
  }
  
  const doc = await databases.updateDocument(
    DATABASE_ID,
    SOURCES_COLLECTION,
    source.$id!,
    {
      signUpCount: source.signUpCount + 1
    }
  );
  return doc as unknown as Source;
}

export async function trackSourceContributorService(name: string): Promise<Source | null> {
  let source = await getSourceByName(name);
  if (!source) {
    source = await createSource(name);
  }
  
  const doc = await databases.updateDocument(
    DATABASE_ID,
    SOURCES_COLLECTION,
    source.$id!,
    {
      contributorCount: source.contributorCount + 1
    }
  );
  return doc as unknown as Source;
}
