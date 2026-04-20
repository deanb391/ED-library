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
    throw new Error("Failed to create contributor");
  }

  const data = await res.json();
  return data.data;
}

export async function editContributor(
  contributorId: string,
  updates: Partial<ContributorDraft>
): Promise<any> {
  const res = await fetch("/api/contributors/edit", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ contributorId, updates }),
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