import { NextResponse } from "next/server";
import { createDocumentService } from "@/lib/services/documents.service";
import { trackAnalyticsEvent } from "@/lib/analytics/services/analytics.service";
import { recordUploadStreak } from "@/lib/services/streak.service";
import { incrementUploadCount } from "@/lib/services/leaderboard.service";
import { getContributorByUserIdService } from "@/lib/services/contributors.service";
import { fetchCourseByIdService, updateCourseService } from "@/lib/services/course.service";
import { notifyFollowersOfPost } from "@/lib/services/follower-notifications.service";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // 1. Create document
    const doc = await createDocumentService(data);

    // 2. Trigger the review process asynchronously (fire and forget)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get("origin") || `http://${req.headers.get("host")}`;
    
    fetch(`${baseUrl}/api/documents/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        documentId: doc.$id, 
        fileUrl: doc.fileUrl, 
        fileType: doc.fileType 
      })
    }).catch(console.error);

    // 3. Streak, Leaderboard, Analytics tracking
    let streakData = null;
    const courseId = data.courses;

    try {
      await updateCourseService(courseId, { lastOperation: "Now" });
      const course = await fetchCourseByIdService(courseId);
      const userId = course.user ?? "unknown";

      trackAnalyticsEvent(
        {
          eventName: "COURSE_ASSET_UPLOADED",
          distinctId: userId,
          userId: userId !== "unknown" ? userId : undefined,
          metadata: {
            documentId: doc.$id,
            courseId,
            documentType: data.fileType,
          },
        },
        [
          { metric: "DAILY_UPLOADS", amount: 1 },
          { metric: "TOTAL_UPLOADS", amount: 1 },
        ]
      ).catch(err => console.error("[Analytics] upload tracking failed:", err));

      if (userId !== "unknown") {
        const contributor = await getContributorByUserIdService(userId);
        if (contributor) {
          streakData = await recordUploadStreak(
            contributor.$id,
            userId,
            contributor.$createdAt?.slice(0, 10) || ""
          );

          incrementUploadCount(contributor.$id, 1)
            .catch((err) => console.error("[Leaderboard] tracking failed:", err));

          notifyFollowersOfPost(
            contributor.$id, 
            course.title || "Course", 
            data.description || `New ${data.fileType.toUpperCase()} Document Uploaded`
          ).catch((err) => console.error("[Followers Notification] failed for document:", err));
        }
      }
    } catch (err) {
      console.error("[Rewards/Analytics] processing failed for document:", err);
    }

    return NextResponse.json({ success: true, doc, streakData });
  } catch (error: any) {
    console.error("Create document error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
