import { NextResponse } from "next/server";
import { extractTextFromUrl, reviewDocumentWithAI } from "@/lib/services/ai-reviewer.service";
import { Client, Databases } from "node-appwrite";

// Note: API routes should use node-appwrite with API key for admin privileges
// to update document statuses without user session constraints.
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
  .setKey(process.env.APPWRITE_API_KEY || ""); // Make sure user has this set

const databases = new Databases(client);
const DATABASE_ID = "69617e75000c6c010a75";
const DOCUMENTS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTS_COLLECTION || "documents";

export async function POST(req: Request) {
  try {
    if (!DOCUMENTS_COLLECTION) {
      return NextResponse.json({ error: "Missing DOCUMENTS_COLLECTION" }, { status: 500 });
    }
    
    const { documentId, fileUrl, fileType } = await req.json();

    if (!documentId || !fileUrl || !fileType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Extract Text
    const text = await extractTextFromUrl(fileUrl, fileType);
    
    if (!text || text.trim().length === 0) {
      await databases.updateDocument(DATABASE_ID, DOCUMENTS_COLLECTION, documentId, {
        status: "rejected",
        reviewReason: "No readable text found in the document.",
      });
      return NextResponse.json({ status: "rejected", reason: "No text found" });
    }

    // 2. AI Review
    const result = await reviewDocumentWithAI(text);

    // 3. Update Appwrite Document
    await databases.updateDocument(DATABASE_ID, DOCUMENTS_COLLECTION, documentId, {
      status: result.status,
      reviewReason: result.reason || null,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Document review error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
