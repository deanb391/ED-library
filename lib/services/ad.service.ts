// lib/services/ad.service.ts

import prisma from "@/lib/prisma";
import { getLfuCache, setLfuCache, invalidateLfuCache, clearLfuCacheNamespace } from "@/lib/lfu-cache";
import { randomUUID } from "crypto";

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

export function mapAd(doc: any) {
  if (!doc) return null;
  return {
    id: doc.id || doc.$id,
    $id: doc.id || doc.$id,
    name: doc.name || "",
    smallImages: parseJsonArray(doc.smallImages),
    mediumImages: parseJsonArray(doc.mediumImages),
    largeImages: parseJsonArray(doc.largeImages),
    videos: parseJsonArray(doc.videos),
    views: doc.views ?? 0,
    clicks: doc.clicks ?? 0,
    isExpired: Boolean(doc.isExpired),
    endTime: doc.endTime instanceof Date ? doc.endTime.toISOString() : (doc.endTime || ""),
    type: doc.type || "",
    link: doc?.link || "",
    user: doc.userId || (typeof doc.user === 'string' ? doc.user : doc.user?.id) || "",
    userId: doc.userId,
    price: Number(doc.price) || 0,
    $createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.$createdAt || new Date().toISOString()),
    $updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.$updatedAt || new Date().toISOString()),
  };
}

export async function createAdService(data: any) {
  const id = randomUUID();
  const doc = await prisma.ad.create({
    data: {
      id,
      name: data.name || "",
      smallImages: Array.isArray(data.smallImages) ? data.smallImages : (data.smallImages ? [data.smallImages] : []),
      mediumImages: Array.isArray(data.mediumImages) ? data.mediumImages : (data.mediumImages ? [data.mediumImages] : []),
      largeImages: Array.isArray(data.largeImages) ? data.largeImages : (data.largeImages ? [data.largeImages] : []),
      videos: Array.isArray(data.videos) ? data.videos : (data.videos ? [data.videos] : []),
      views: 0,
      clicks: 0,
      uniqueUsers: [],
      isExpired: data.isExpired !== undefined ? Boolean(data.isExpired) : false,
      endTime: data.endTime ? new Date(data.endTime) : null,
      type: data.type || "",
      link: data.link || "",
      userId: data.user || data.userId || null,
    },
  });
  await clearLfuCacheNamespace("ad:lists");
  return mapAd(doc);
}

export async function fetchAdsService(queries?: any) {
  const cacheKey = JSON.stringify(queries || {});
  const cached = await getLfuCache<any>("ad:lists", cacheKey);
  if (cached) return cached;

  const docs = await prisma.ad.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const result = {
    ads: docs.map(mapAd),
    nextCursor:
      docs.length > 0
        ? docs[docs.length - 1].id
        : null,
  };
  await setLfuCache("ad:lists", cacheKey, result, 50);
  return result;
}

export async function fetchActiveAdsService() {
  const cached = await getLfuCache<any[]>("ad:lists", "active");
  if (cached) return cached;

  const docs = await prisma.ad.findMany({
    where: { isExpired: false },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const mapped = docs.map(mapAd);
  await setLfuCache("ad:lists", "active", mapped, 20);
  return mapped;
}

export async function fetchAdByIdService(adId: string) {
  const cached = await getLfuCache<any>("ad:details", adId);
  if (cached) return cached;

  const doc = await prisma.ad.findUnique({
    where: { id: adId },
  });
  if (!doc) return null;

  const mapped = mapAd(doc);
  await setLfuCache("ad:details", adId, mapped, 50);
  return mapped;
}

export async function fetchAdByIdRawService(adId: string) {
  return prisma.ad.findUnique({
    where: { id: adId },
  });
}

export async function updateAdService(adId: string, data: any) {
  await invalidateLfuCache("ad:details", adId);
  await clearLfuCacheNamespace("ad:lists");

  const updateData: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (key === "smallImages" || key === "mediumImages" || key === "largeImages" || key === "videos" || key === "uniqueUsers") {
        updateData[key] = Array.isArray(value) ? value : (typeof value === "string" ? [value] : []);
      } else if (key === "endTime") {
        updateData[key] = value ? new Date(value as string) : null;
      } else {
        updateData[key] = value;
      }
    }
  }

  return prisma.ad.update({
    where: { id: adId },
    data: updateData,
  });
}

export async function deleteAdService(adId: string) {
  await invalidateLfuCache("ad:details", adId);
  await clearLfuCacheNamespace("ad:lists");
  return prisma.ad.delete({
    where: { id: adId },
  });
}