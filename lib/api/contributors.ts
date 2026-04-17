import { ContributorDraft } from "@/lib/services/contributors.service";

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
