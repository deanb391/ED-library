import { NextResponse } from "next/server";
import { getFollowedCommunitiesService } from "@/lib/services/communities.service";
import { getUserById } from "@/lib/appwrite/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const userDoc = await getUserById(userId);
    let following: string[] = [];
    if (userDoc?.followingContributors) {
      try { following = typeof userDoc.followingContributors === 'string' ? JSON.parse(userDoc.followingContributors) : userDoc.followingContributors; } catch(e){}
    }

    const communities = await getFollowedCommunitiesService(following);

    return NextResponse.json({ communities });
  } catch (err) {
    console.error("GET FOLLOWED COMMUNITIES ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
