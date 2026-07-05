// lib/api/businesses.ts

import { Business } from "@/lib/services/business.service";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export async function fetchBusinessByUserId(userId: string): Promise<Business | null> {
  const res = await fetch(`/api/businesses/get?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) {
    throw new Error("Failed to fetch business profile");
  }
  return res.json();
}

export async function createBusiness(data: {
  name: string;
  phone: string;
  bannerImage: string;
  user: string;
}): Promise<any> {
  const res = await fetch("/api/businesses/create", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create business profile");
  }

  const result = await res.json();
  return result.data;
}

export async function updateBusiness(
  businessId: string,
  updates: Partial<{ name: string; phone: string; bannerImage: string }>
): Promise<any> {
  const res = await fetch("/api/businesses/update", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ businessId, updates }),
  });

  if (!res.ok) {
    throw new Error("Failed to update business profile");
  }

  const result = await res.json();
  return result.data;
}
