// lib/services/business.service.ts

import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

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

export function mapBusiness(doc: any): Business {
  if (!doc) return null as any;
  return {
    $id: doc.id || doc.$id,
    name: doc.name || "",
    phone: doc.phone || "",
    bannerImage: doc.bannerImage || "",
    user: doc.userId || (typeof doc.user === 'string' ? doc.user : doc.user?.id) || "",
    status: doc.status || "live",
    $createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.$createdAt || new Date().toISOString()),
    $updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.$updatedAt || new Date().toISOString()),
  };
}

export async function createBusinessService(data: {
  name: string;
  phone: string;
  bannerImage: string;
  user: string;
}): Promise<Business> {
  const id = randomUUID();
  const doc = await prisma.business.create({
    data: {
      id,
      name: data.name,
      phone: data.phone,
      bannerImage: data.bannerImage,
      userId: data.user,
      status: "live",
    },
  });

  return mapBusiness(doc);
}

export async function fetchBusinessByUserIdService(userId: string): Promise<Business | null> {
  try {
    const doc = await prisma.business.findFirst({
      where: { userId },
    });

    if (!doc) {
      return null;
    }

    return mapBusiness(doc);
  } catch (err) {
    console.error("Error fetching business by userId:", err);
    return null;
  }
}

export async function updateBusinessService(
  businessId: string,
  updates: Partial<{ name: string; phone: string; bannerImage: string }>
): Promise<Business> {
  const doc = await prisma.business.update({
    where: { id: businessId },
    data: updates,
  });

  return mapBusiness(doc);
}
