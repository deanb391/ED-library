import { ID, Query } from "appwrite";
import { databases } from "@/lib/appwrite/server";
import { trackEvent } from "@/lib/analytics/trackEvent";

const DATABASE_ID = "69617e75000c6c010a75";
const SUBSCRIPTION_COLLECTION = "subscriptions";

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

function mapSubscription(doc: Record<string, unknown>): Subscription {
  return {
    $id: doc.$id as string,
    userId: doc.user as string,
    courseId: doc.courses as string,
    startDate: doc.startDate as string,
    endDate: doc.endDate as string,
    status: doc.status as "active" | "expired",
    $createdAt: doc.$createdAt as string,
    $updatedAt: doc.$updatedAt as string,
  };
}

export async function handleSubscriptionService(
  userId: string,
  courseId: string
): Promise<Subscription> {
  const now = new Date();
  const endDate = new Date();
  endDate.setDate(now.getDate() + 30);

  const existing = await databases.listDocuments(
    DATABASE_ID,
    SUBSCRIPTION_COLLECTION,
    [Query.equal("user", userId), Query.equal("courses", courseId)]
  );

  if (existing.documents.length > 0) {
    const docId = existing.documents[0].$id;
    const updated = await databases.updateDocument(
      DATABASE_ID,
      SUBSCRIPTION_COLLECTION,
      docId,
      {
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        status: "active",
      }
    );
    const sub = mapSubscription(updated as unknown as Record<string, unknown>);
    trackEvent("SUBSCRIPTION_RENEWED", {
      distinctId: userId,
      userId,
      metadata: { subscriptionId: sub.$id, courseId }
    });
    return sub;
  }

  const created = await databases.createDocument(
    DATABASE_ID,
    SUBSCRIPTION_COLLECTION,
    ID.unique(),
    {
      user: userId,
      courses: courseId,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      status: "active",
    }
  );
  const sub = mapSubscription(created as unknown as Record<string, unknown>);
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
  const existing = await databases.listDocuments(
    DATABASE_ID,
    SUBSCRIPTION_COLLECTION,
    [Query.equal("user", userId), Query.equal("courses", courseId)]
  );

  if (existing.documents.length > 0) {
    return mapSubscription(existing.documents[0] as unknown as Record<string, unknown>);
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
  const res = await databases.listDocuments(
    DATABASE_ID,
    SUBSCRIPTION_COLLECTION,
    [Query.equal("user", userId), Query.orderDesc("$createdAt")]
  );
  return res.documents.map((doc) =>
    mapSubscription(doc as unknown as Record<string, unknown>)
  );
}

export async function expireSubscriptionsCronService(): Promise<number> {
  const now = new Date().toISOString();

  const activeSubs = await databases.listDocuments(
    DATABASE_ID,
    SUBSCRIPTION_COLLECTION,
    [
      Query.equal("status", "active"),
      Query.lessThanEqual("endDate", now),
      Query.limit(100),
    ]
  );

  let expiredCount = 0;
  for (const doc of activeSubs.documents) {
    await databases.updateDocument(
      DATABASE_ID,
      SUBSCRIPTION_COLLECTION,
      doc.$id,
      { status: "expired" }
    );
    trackEvent("SUBSCRIPTION_EXPIRED", {
      distinctId: doc.user as string,
      userId: doc.user as string,
      metadata: { subscriptionId: doc.$id, courseId: doc.courses as string }
    });
    expiredCount++;
  }

  return expiredCount;
}
