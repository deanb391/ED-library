import { Client, Databases, ID, Query } from "node-appwrite";
import { getLfuCache, setLfuCache, invalidateLfuCache } from "@/lib/lfu-cache";
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
  .setKey(process.env.APPWRITE_API_KEY || "");

const databases = new Databases(client);
const DATABASE_ID = "69617e75000c6c010a75";
const DOCUMENT_REVIEWS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_DOCUMENT_REVIEWS_COLLECTION || "document_reviews";
const DOCUMENTS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTS_COLLECTION || "documents";

export type DocumentReviewStatus = "pending" | "approved" | "rejected";

export type DocumentReviewRequest = {
  $id?: string;
  documents: string;
  courses: string;
  contributors: string;
  complaint: string;
  status: DocumentReviewStatus;
  adminReason?: string;
  $createdAt?: string;
};

export async function createDocumentReviewRequestService(data: { documents: string, courses: string, contributors: string, complaint: string }) {
  const req = await databases.createDocument(
    DATABASE_ID,
    DOCUMENT_REVIEWS_COLLECTION,
    ID.unique(),
    {
      ...data,
      status: "pending",
    }
  );
  await invalidateLfuCache("admin:document_reviews", "all");
  return req;
}

const USER_COLLECTION = "user";
const COURSE_COLLECTION = "courses";

export async function fetchDocumentReviewRequestsService() {
  const cached = await getLfuCache<any>("admin:document_reviews", "all");
  if (cached) return cached;

  const response = await databases.listDocuments(
    DATABASE_ID,
    DOCUMENT_REVIEWS_COLLECTION,
    [Query.orderDesc("$createdAt")]
  );

  const populated = await Promise.all(response.documents.map(async (doc) => {
    const getPopulated = (val: any) => {
      if (!val) return null;
      if (Array.isArray(val)) return val.length > 0 && typeof val[0] === 'object' ? val[0] : null;
      if (typeof val === 'object' && val.$id) return val;
      return null;
    };

    const getIdStr = (val: any) => {
      if (!val) return null;
      if (Array.isArray(val)) return typeof val[0] === 'string' ? val[0] : val[0]?.$id;
      if (typeof val === 'object') return val.$id;
      return val;
    };

    let documentDetails = getPopulated(doc.documents);
    let courseDetails = getPopulated(doc.courses);
    let userDetails = getPopulated(doc.contributors);

    if (!documentDetails && getIdStr(doc.documents)) {
      try { documentDetails = await databases.getDocument(DATABASE_ID, DOCUMENTS_COLLECTION, getIdStr(doc.documents)); } catch (e) { }
    }
    if (!courseDetails && getIdStr(doc.courses)) {
      try { courseDetails = await databases.getDocument(DATABASE_ID, COURSE_COLLECTION, getIdStr(doc.courses)); } catch (e) { }
    }
    if (!userDetails && getIdStr(doc.contributors)) {
      try { userDetails = await databases.getDocument(DATABASE_ID, USER_COLLECTION, getIdStr(doc.contributors)); } catch (e) { }
    }

    return {
      ...doc,
      documentDetails,
      courseDetails,
      userDetails
    };
  }));

  await setLfuCache("admin:document_reviews", "all", populated, 20);

  return populated;
}

export async function resolveDocumentReviewRequestService(requestId: string, status: "approved" | "rejected", adminReason: string, documentId: any) {
  // Helper to extract string ID from potentially populated object/array
  const getRelId = (val: any) => {
    if (!val) return null;
    if (Array.isArray(val)) return val[0]?.$id || val[0] || null;
    if (typeof val === 'object') return val.$id;
    return val;
  };

  const docIdStr = getRelId(documentId);

  // Fetch existing request to extract all string relationship IDs
  const existing = await databases.getDocument(DATABASE_ID, DOCUMENT_REVIEWS_COLLECTION, requestId);
  const existingDocId = getRelId(existing.documents);
  const existingCourseId = getRelId(existing.courses);
  const existingContributorId = getRelId(existing.contributors);

  const payload: any = { status, adminReason };

  // Explicitly set relationship fields as strings in the update to bypass Appwrite's merge validation bug
  if (existingDocId) payload.documents = existingDocId;
  if (existingCourseId) payload.courses = existingCourseId;
  if (existingContributorId) payload.contributors = existingContributorId;

  // Update the review request
  const reviewReq = await databases.updateDocument(
    DATABASE_ID,
    DOCUMENT_REVIEWS_COLLECTION,
    requestId,
    payload
  );

  const finalDocIdStr = docIdStr || existingDocId;

  // If approved, update the document status to approved
  if (finalDocIdStr) {
    if (status === "approved") {
      await databases.updateDocument(
        DATABASE_ID,
        DOCUMENTS_COLLECTION,
        finalDocIdStr,
        { status: "approved", reviewReason: "Approved by Admin: " + adminReason }
      );
    } else if (status === "rejected") {
      await databases.updateDocument(
        DATABASE_ID,
        DOCUMENTS_COLLECTION,
        finalDocIdStr,
        { reviewReason: "Rejected by Admin: " + adminReason, status: "rejected" }
      );
    }
  }

  await invalidateLfuCache("admin:document_reviews", "all");

  return reviewReq;
}
