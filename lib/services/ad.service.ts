// lib/services/ad.service.ts

import { ID, Query } from "appwrite";
import { databases } from "@/lib/appwrite/server";

const DATABASE_ID = "69617e75000c6c010a75";
const ADS_COLLECTION = "ads";

export function mapAd(doc: any) {
  return {
    id: doc.$id,
    name: doc.name,
    smallImages: doc.smallImages || [],
    mediumImages: doc.mediumImages || [],
    largeImages: doc.largeImages || [],
    videos: doc.videos || [],
    views: doc.views ?? 0,
    clicks: doc.clicks ?? 0,
    isExpired: doc.isExpired,
    endTime: doc.endTime,
    type: doc.type,
    link: doc?.link,
    user: doc.user || "",
    price: doc.price || 0,
  };
}

export async function createAdService(data: any) {
  return databases.createDocument(
    DATABASE_ID,
    ADS_COLLECTION,
    ID.unique(),
    {
      ...data,
      views: 0,
      uniqueUsers: [],
      isExpired: data.isExpired !== undefined ? data.isExpired : false,
    }
  );
}

export async function fetchAdsService(queries: any[]) {
  const res = await databases.listDocuments(DATABASE_ID, ADS_COLLECTION, queries);
  return {
    ads: res.documents.map(mapAd),
    nextCursor:
      res.documents.length > 0
        ? res.documents[res.documents.length - 1].$id
        : null,
  };
}

export async function fetchActiveAdsService() {
  const res = await databases.listDocuments(
    DATABASE_ID,
    ADS_COLLECTION,
    [
      Query.equal("isExpired", false),
      Query.orderDesc("$createdAt"),
      Query.limit(10),
    ]
  );

  return res.documents.map(mapAd);
}

export async function fetchAdByIdService(adId: string) {
  const doc = await databases.getDocument(DATABASE_ID, ADS_COLLECTION, adId);
  return mapAd(doc);
}

export async function fetchAdByIdRawService(adId: string) {
  return databases.getDocument(DATABASE_ID, ADS_COLLECTION, adId);
}

export async function updateAdService(adId: string, data: any) {
  return databases.updateDocument(DATABASE_ID, ADS_COLLECTION, adId, data);
}

export async function deleteAdService(adId: string) {
  return databases.deleteDocument(DATABASE_ID, ADS_COLLECTION, adId);
}