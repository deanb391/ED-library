import { NextResponse } from "next/server";
import { trackSourceContributorService } from "@/lib/services/sources.service";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ success: false, error: "Missing name" }, { status: 400 });

    await trackSourceContributorService(name);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in source contributor route:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
