import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/appwrite/auth";
import { databases } from "@/lib/appwrite/server";

const DATABASE_ID = "69617e75000c6c010a75";
const USER_COLLECTION = "user";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lastTime } = await req.json();

    if (!lastTime) {
      return NextResponse.json({ error: "Missing lastTime" }, { status: 400 });
    }

    const updatedUser = await databases.updateDocument(
      DATABASE_ID,
      USER_COLLECTION,
      user.$id,
      { lastTime: new Date(lastTime) }
    );

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Activity tracking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
