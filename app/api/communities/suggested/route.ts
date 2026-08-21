import { NextResponse } from "next/server";
import { getSuggestedCommunitiesService } from "@/lib/services/communities.service";
import { getUserById } from "@/lib/appwrite/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let following: string[] = [];
    if (userId) {
      const userDoc = await getUserById(userId);
      following = userDoc?.followingContributors || [];
    }

    const communities = await getSuggestedCommunitiesService(following);

    return NextResponse.json({ communities });
  } catch (err) {
    console.error("GET SUGGESTED COMMUNITIES ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
