import { NextResponse } from "next/server";
import { fetchLibraryByUserService } from "@/lib/services/library.service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const wallet = await fetchLibraryByUserService(userId);

  return NextResponse.json({ wallet });
}