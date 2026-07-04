import {
  ContributorDraft,
  Contributor,
} from "@/lib/services/contributors.service";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export async function createContributor(
  draft: ContributorDraft,
  userId: string
): Promise<any> {
  const res = await fetch("/api/contributors/create", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ draft, userId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create contributor");
  }

  const data = await res.json();
  return data.data;
}

export async function editContributor(
  contributorId: string,
  updates: Partial<ContributorDraft>,
  type?: string,
  editingUserId?: string,
): Promise<any> {
  const res = await fetch("/api/contributors/edit", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ contributorId, updates, type, editingUserId }),
  });

  if (!res.ok) {
    throw new Error("Failed to edit contributor");
  }

  const data = await res.json();
  return data.data;
}

export async function deleteContributor(contributorId: string): Promise<void> {
  const res = await fetch("/api/contributors/delete", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ contributorId }),
  });

  if (!res.ok) {
    throw new Error("Failed to delete contributor");
  }
}

export async function getMyContributor(userId: string): Promise<Contributor | null> {
  const res = await fetch(`/api/contributors/me?userId=${encodeURIComponent(userId)}`, {
    method: "GET",
    headers: jsonHeaders,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch contributor status");
  }

  const data = await res.json();
  return data.contributor;
}

export async function getContributor(contributorId: string): Promise<Contributor | null> {
  const res = await fetch(`/api/contributors/fetch_contributor?contributorId=${encodeURIComponent(contributorId)}`, {
    method: "GET",
    headers: jsonHeaders,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch contributor status");
  }

  const data = await res.json();
  return data.contributor;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function getContributorService(contributorId: string): Promise<Contributor | null> {
  try {
    const res = await fetch(`${baseUrl}/api/contributors/fetch_contributor?contributorId=${encodeURIComponent(contributorId)}`, {
      method: "GET",
      headers: jsonHeaders,
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.contributor ?? null;
  } catch {
    return null;
  }
}

export async function searchContributors(q: string) {
  const res = await fetch(`/api/contributors/search?q=${encodeURIComponent(q)}`);
  return res.json();
}

export async function getTopContributors(limit = 10, offset = 0): Promise<Contributor[] | []> {

  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const res = await fetch(`/api/contributors/top-contributor?${query}`, {
    method: "GET",
    headers: jsonHeaders,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch contributor status");
  }

  const data = await res.json();
  return data;
}

export async function getNewContributors(limit = 10, offset = 0): Promise<Contributor[] | []> {

  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const res = await fetch(`/api/contributors/new-contributor?${query}`, {
    method: "GET",
    headers: jsonHeaders,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch contributor status");
  }

  const data = await res.json();
  return data;
}

export async function hasContributorAccount(userId: string): Promise<boolean> {
  try {
    const contributor = await getMyContributor(userId);
    return contributor !== null;
  } catch (err) {
    console.error("Error checking contributor status:", err);
    return false;
  }
}

export async function toggleFollowContributor(
  userId: string,
  contributorId: string
): Promise<boolean> {
  const res = await fetch("/api/contributors/follow", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ userId, contributorId }),
  });

  if (!res.ok) {
    throw new Error("Failed to toggle follow");
  }

  const data = await res.json();
  return data.success;
}

export async function fetchContributors(
  limit = 20,
  status?: string,
  cursor?: string,
  search?: string
) {
  const query = new URLSearchParams();

  query.append("limit", String(limit));

  if (status) query.append("status", status);
  if (cursor) query.append("cursor", cursor);
  if (search) query.append("search", search);

  const res = await fetch(`/api/contributors/fetch?${query}`);

  if (!res.ok) throw new Error("Failed");

  return res.json();
}

export async function getContributorByUserId(userId: string) {
  const res = await fetch(`/api/contributors/fetch_contributor_by_user?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch contributor");
  return res.json();
}