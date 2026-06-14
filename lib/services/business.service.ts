// lib/services/business.service.ts

import { ID, Query } from "appwrite";
import { databases } from "@/lib/appwrite/server";

const DATABASE_ID = "69617e75000c6c010a75";
const BUSINESSES_COLLECTION = "businesses";

export type Business = {
  $id: string;
  name: string;
  phone: string;
  bannerImage: string;
  user: string;
  status: string;
  $createdAt: string;
  $updatedAt: string;
};

function mapBusiness(doc: any): Business {
  return {
    $id: doc.$id,
    name: doc.name || "",
    phone: doc.phone || "",
    bannerImage: doc.bannerImage || "",
    user: doc.user || "",
    status: doc.status || "live",
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

export async function createBusinessService(data: {
  name: string;
  phone: string;
  bannerImage: string;
  user: string;
}): Promise<Business> {
  const now = new Date().toISOString();
  const payload = {
    ...data,
    status: "live",
    $createdAt: now,
    $updatedAt: now,
  };

  const doc = await databases.createDocument(
    DATABASE_ID,
    BUSINESSES_COLLECTION,
    ID.unique(),
    payload
  );

  return mapBusiness(doc);
}

export async function fetchBusinessByUserIdService(userId: string): Promise<Business | null> {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      BUSINESSES_COLLECTION,
      [Query.equal("user", userId)]
    );

    if (res.documents.length === 0) {
      return null;
    }

    return mapBusiness(res.documents[0]);
  } catch (err) {
    console.error("Error fetching business by userId:", err);
    return null;
  }
}

export async function updateBusinessService(
  businessId: string,
  updates: Partial<{ name: string; phone: string; bannerImage: string }>
): Promise<Business> {
  const now = new Date().toISOString();
  const payload = {
    ...updates,
    $updatedAt: now,
  };

  const doc = await databases.updateDocument(
    DATABASE_ID,
    BUSINESSES_COLLECTION,
    businessId,
    payload
  );

  return mapBusiness(doc);
}
