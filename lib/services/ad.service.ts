// lib/services/ad.service.ts

import { ID, Query } from "appwrite";
import { databases } from "@/lib/appwrite/server";
import { getLfuCache, setLfuCache, invalidateLfuCache, clearLfuCacheNamespace } from "@/lib/lfu-cache";

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
  const doc = databases.createDocument(
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
  await clearLfuCacheNamespace("ad:lists");
  return doc;
}

export async function fetchAdsService(queries: any[]) {
  const cacheKey = JSON.stringify(queries);
  const cached = await getLfuCache<any>("ad:lists", cacheKey);
  if (cached) return cached;

  const res = await databases.listDocuments(DATABASE_ID, ADS_COLLECTION, queries);
  const result = {
    ads: res.documents.map(mapAd),
    nextCursor:
      res.documents.length > 0
        ? res.documents[res.documents.length - 1].$id
        : null,
  };
  await setLfuCache("ad:lists", cacheKey, result, 50);
  return result;
}

export async function fetchActiveAdsService() {
  const cached = await getLfuCache<any[]>("ad:lists", "active");
  if (cached) return cached;

  const res = await databases.listDocuments(
    DATABASE_ID,
    ADS_COLLECTION,
    [
      Query.equal("isExpired", false),
      Query.orderDesc("$createdAt"),
      Query.limit(10),
    ]
  );

  const mapped = res.documents.map(mapAd);
  await setLfuCache("ad:lists", "active", mapped, 20);
  return mapped;
}

export async function fetchAdByIdService(adId: string) {
  const cached = await getLfuCache<any>("ad:details", adId);
  if (cached) return cached;

  const doc = await databases.getDocument(DATABASE_ID, ADS_COLLECTION, adId);
  const mapped = mapAd(doc);
  await setLfuCache("ad:details", adId, mapped, 50);
  return mapped;
}

export async function fetchAdByIdRawService(adId: string) {
  return databases.getDocument(DATABASE_ID, ADS_COLLECTION, adId);
}

export async function updateAdService(adId: string, data: any) {
  await invalidateLfuCache("ad:details", adId);
  await clearLfuCacheNamespace("ad:lists");
  return databases.updateDocument(DATABASE_ID, ADS_COLLECTION, adId, data);
}

export async function deleteAdService(adId: string) {
  await invalidateLfuCache("ad:details", adId);
  await clearLfuCacheNamespace("ad:lists");
  return databases.deleteDocument(DATABASE_ID, ADS_COLLECTION, adId);
}