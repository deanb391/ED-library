import { Client, Databases, ID, Query } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
  .setKey(process.env.APPWRITE_API_KEY || "");

const databases = new Databases(client);

const DATABASE_ID = "69617e75000c6c010a75";
const DOCUMENTS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTS_COLLECTION || "documents";

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

export async function createDocumentService(data: Omit<CourseDocument, "$id" | "status" | "reviewReason" | "$createdAt">) {
  if (!DOCUMENTS_COLLECTION) throw new Error("Documents collection ID is missing");

  const doc = await databases.createDocument(
    DATABASE_ID,
    DOCUMENTS_COLLECTION,
    ID.unique(),
    {
      ...data,
      status: "pending",
    }
  );

  return doc;
}

export async function fetchDocumentsService(courseId: string) {
  if (!DOCUMENTS_COLLECTION) return [];

  const response = await databases.listDocuments(
    DATABASE_ID,
    DOCUMENTS_COLLECTION,
    [
      Query.equal("courses", courseId),
      Query.orderDesc("$createdAt")
    ]
  );

  return response.documents;
}

export async function deleteDocumentService(documentId: string) {
  if (!DOCUMENTS_COLLECTION) throw new Error("Documents collection ID is missing");

  await databases.deleteDocument(DATABASE_ID, DOCUMENTS_COLLECTION, documentId);
  return { success: true };
}
