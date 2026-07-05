// lib/api/subscriptions.ts
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

const jsonHeaders = {
  "Content-Type": "application/json",
};

export async function fetchSubscription(userId: string, courseId: string): Promise<Subscription | null> {
  const res = await fetch(`/api/subscriptions/fetch?userId=${encodeURIComponent(userId)}&courseId=${encodeURIComponent(courseId)}`);
  const data = await res.json();
  return data.subscription ?? null;
}

export async function checkSubscriptionAccess(userId: string, courseId: string): Promise<boolean> {
  const res = await fetch(`/api/subscriptions/check?userId=${encodeURIComponent(userId)}&courseId=${encodeURIComponent(courseId)}`);
  const data = await res.json();
  return data.hasAccess ?? false;
}

export async function handleSubscription(userId: string, courseId: string): Promise<Subscription> {
  const res = await fetch("/api/subscriptions/handle", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ userId, courseId }),
  });
  const data = await res.json();
  return data.subscription;
}

export async function fetchUserSubscriptions(userId: string): Promise<Subscription[]> {
  const res = await fetch(`/api/subscriptions/list?userId=${encodeURIComponent(userId)}`);
  const data = await res.json();
  return data.subscriptions ?? [];
}
