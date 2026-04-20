import { ID, Query } from "appwrite";
import { databases } from "@/lib/appwrite/server";

const DATABASE_ID = "69617e75000c6c010a75";
const EARNINGS_COLLECTION = "earnings";

export async function createEarningService(data: {
  amount: number;
  description: string;
  courses?: string;
  type: string;
  contributorId: string;
}) {
  const doc = await databases.createDocument(
    DATABASE_ID,
    EARNINGS_COLLECTION,
    ID.unique(),
    {
      amount: data.amount,
      description: data.description,
      courses: data.courses || "",
      type: data.type,
      contributors: data.contributorId,
    }
  );

  return doc;
}


export async function fetchContributorEarningsService(contributorId: string) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    EARNINGS_COLLECTION,
    [Query.equal("contributors", contributorId)]
  );

  return res.documents;
}