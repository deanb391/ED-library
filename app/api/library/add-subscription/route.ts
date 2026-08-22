import { NextResponse } from "next/server";
import { addSubscriptionsCoursesToLibraryService } from "@/lib/services/library.service";

export async function POST(req: Request) {
  try {
    const { userId, courseIds } = await req.json();

    if (!userId || !courseIds || !Array.isArray(courseIds)) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const results = await addSubscriptionsCoursesToLibraryService(courseIds, userId);

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("API LIBRARY ADD SUBSCRIPTION ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
