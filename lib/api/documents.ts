const jsonHeaders = {
  "Content-Type": "application/json",
};

export type DocumentStatus = "pending" | "approved" | "rejected";

export type CourseDocument = {
  $id?: string;
  courses: string;
  user: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  description?: string;
  status: DocumentStatus;
  reviewReason?: string;
  $createdAt?: string;
};

export async function createDocument(data: Omit<CourseDocument, "$id" | "status" | "reviewReason" | "$createdAt">) {
  const res = await fetch("/api/documents/create", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create document");
  }

  const result = await res.json();
  return result;
}

export async function fetchDocuments(courseId: string): Promise<CourseDocument[]> {
  const res = await fetch(`/api/documents/list?courseId=${courseId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch documents");
  }

  const result = await res.json();
  return result.documents;
}

export async function deleteDocument(documentId: string) {
  const res = await fetch(`/api/documents/delete?documentId=${documentId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete document");
  }

  return await res.json();
}

export async function createDocumentReviewRequest(data: { documents: string, courses: string, contributors: string, complaint: string }) {
  const res = await fetch(`/api/document-reviews/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to submit review request");
  }

  return await res.json();
}

export async function fetchDocumentReviewRequests() {
  const res = await fetch(`/api/document-reviews`, {
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error("Failed to fetch review requests");
  }

  const result = await res.json();
  return result.reviewRequests;
}

export async function resolveDocumentReviewRequest(data: { requestId: string, status: "approved" | "rejected", adminReason: string, documentId: string }) {
  const res = await fetch(`/api/document-reviews/resolve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to resolve review request");
  }

  return await res.json();
}
