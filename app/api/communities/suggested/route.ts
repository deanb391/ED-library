import { NextResponse } from "next/server";
import { getSuggestedCommunitiesService } from "@/lib/services/communities.service";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let following: string[] = [];
    if (userId) {
      const userDoc = await prisma.user.findUnique({ where: { id: userId } });
      if (userDoc?.followingContributors) {
        try {
          following = typeof userDoc.followingContributors === 'string'
            ? JSON.parse(userDoc.followingContributors)
            : userDoc.followingContributors;
        } catch (e) {}
      }
    }

    const communities = await getSuggestedCommunitiesService(following);

    return NextResponse.json({ communities });
  } catch (err) {
    console.error("GET SUGGESTED COMMUNITIES ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
