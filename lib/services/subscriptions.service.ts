import prisma from "@/lib/prisma";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { randomUUID } from "crypto";

export type Subscription = {
  $id: string;
  userId: string;
  courseId: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired";
  $createdAt: string;
  $updatedAt: string;
};

export function mapSubscription(doc: any): Subscription {
  if (!doc) return null as any;
  return {
    $id: doc.id || doc.$id,
    userId: doc.userId || doc.user || "",
    courseId: doc.courseId || doc.courses || "",
    startDate: doc.startDate instanceof Date ? doc.startDate.toISOString() : (doc.startDate || ""),
    endDate: doc.endDate instanceof Date ? doc.endDate.toISOString() : (doc.endDate || ""),
    status: (doc.status as "active" | "expired") || "active",
    $createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.$createdAt || new Date().toISOString()),
    $updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.$updatedAt || new Date().toISOString()),
  };
}

export async function handleSubscriptionService(
  userId: string,
  courseId: string
): Promise<Subscription> {
  const now = new Date();
  const endDate = new Date();
  endDate.setDate(now.getDate() + 30);

  const existing = await prisma.subscription.findFirst({
    where: { userId, courseId },
  });

  if (existing) {
    const updated = await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        startDate: now,
        endDate: endDate,
        status: "active",
      },
    });
    const sub = mapSubscription(updated);
    trackEvent("SUBSCRIPTION_RENEWED", {
      distinctId: userId,
      userId,
      metadata: { subscriptionId: sub.$id, courseId }
    });
    return sub;
  }

  const id = randomUUID();
  const created = await prisma.subscription.create({
    data: {
      id,
      userId,
      courseId,
      startDate: now,
      endDate: endDate,
      status: "active",
    },
  });
  const sub = mapSubscription(created);
  trackEvent("SUBSCRIPTION_CREATED", {
    distinctId: userId,
    userId,
    metadata: { subscriptionId: sub.$id, courseId }
  });
  return sub;
}

export async function fetchSubscriptionService(
  userId: string,
  courseId: string
): Promise<Subscription | null> {
  const doc = await prisma.subscription.findFirst({
    where: { userId, courseId },
  });

  if (doc) {
    return mapSubscription(doc);
  }
  return null;
}

export async function checkSubscriptionAccessService(
  userId: string,
  courseId: string
): Promise<boolean> {
  const sub = await fetchSubscriptionService(userId, courseId);
  if (!sub) return false;
  const now = new Date().toISOString();
  return sub.status === "active" && sub.endDate > now;
}

export async function fetchUserSubscriptionsService(
  userId: string
): Promise<Subscription[]> {
  const docs = await prisma.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return docs.map(mapSubscription);
}

export async function expireSubscriptionsCronService(): Promise<number> {
  const now = new Date();

  const activeSubs = await prisma.subscription.findMany({
    where: {
      status: "active",
      endDate: { lte: now },
    },
    take: 100,
  });

  let expiredCount = 0;
  for (const doc of activeSubs) {
    await prisma.subscription.update({
      where: { id: doc.id },
      data: { status: "expired" },
    });
    trackEvent("SUBSCRIPTION_EXPIRED", {
      distinctId: doc.userId || "",
      userId: doc.userId || "",
      metadata: { subscriptionId: doc.id, courseId: doc.courseId || "" }
    });
    expiredCount++;
  }

  return expiredCount;
}
