import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const contributorId = searchParams.get("contributorId");

    if (!userId || !contributorId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const contributor = await prisma.contributor.findUnique({
      where: { id: contributorId },
      select: { followersIds: true },
    });

    if (!contributor) {
      return NextResponse.json({ error: "Contributor not found" }, { status: 404 });
    }

    const raw = contributor.followersIds;
    let followersIds: string[] = [];
    if (raw) {
      try {
        followersIds = JSON.parse(raw);
        if (!Array.isArray(followersIds)) followersIds = [];
      } catch {
        followersIds = [];
      }
    }

    const isFollowing = followersIds.includes(userId);

    return NextResponse.json({ isFollowing });
  } catch (err) {
    console.error("CHECK FOLLOW ROUTE ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
