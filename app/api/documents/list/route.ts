import { NextResponse } from "next/server";
import { fetchDocumentsService } from "@/lib/services/documents.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    
    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const docs = await fetchDocumentsService(courseId);
    return NextResponse.json({ documents: docs });
  } catch (error: any) {
    console.error("List documents error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
