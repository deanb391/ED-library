import { NextResponse } from "next/server";
import { trackSourceSignupService } from "@/lib/services/sources.service";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ success: false, error: "Missing name" }, { status: 400 });

    await trackSourceSignupService(name);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in source signup route:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
