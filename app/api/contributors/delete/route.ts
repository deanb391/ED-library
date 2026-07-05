import { NextRequest, NextResponse } from "next/server";
import { deleteContributorService } from "@/lib/services/contributors.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { contributorId } = body;

    if (!contributorId) {
      return NextResponse.json(
        { error: "Missing contributorId" },
        { status: 400 }
      );
    }

    await deleteContributorService(contributorId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE CONTRIBUTOR ERROR:", err);
    return NextResponse.json(
      { error: "Failed to delete contributor" },
      { status: 500 }
    );
  }
}
