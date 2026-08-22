import { NextResponse } from "next/server";
import { deleteDocumentService } from "@/lib/services/documents.service";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");
    
    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    await deleteDocumentService(documentId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete document error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
