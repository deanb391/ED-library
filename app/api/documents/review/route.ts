import { NextResponse } from "next/server";
import { extractTextFromUrl, reviewDocumentWithAI } from "@/lib/services/ai-reviewer.service";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { documentId, fileUrl, fileType } = await req.json();

    if (!documentId || !fileUrl || !fileType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Extract Text
    const text = await extractTextFromUrl(fileUrl, fileType);
    
    if (!text || text.trim().length === 0) {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: "rejected",
          reviewReason: "No readable text found in the document.",
        },
      });
      return NextResponse.json({ status: "rejected", reason: "No text found" });
    }

    // 2. AI Review
    const result = await reviewDocumentWithAI(text);

    // 3. Update Document
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: result.status,
        reviewReason: result.reason || null,
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Document review error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
