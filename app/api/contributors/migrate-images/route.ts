import { NextResponse } from "next/server";
import * as AWS from "aws-sdk";
import { fetchContributorsService } from "@/lib/services/contributors.service";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_KEY!,
  region: process.env.AWS_REGION!,
});

const BUCKET_NAME = process.env.AWS_BUCKET!;

/**
 * Applies a bucket policy that makes ALL objects in the bucket publicly
 * readable via HTTP GET. This is the correct approach when the bucket has
 * "Object Ownership = Bucket owner enforced" (ACLs disabled).
 *
 * Why a bucket policy instead of per-object ACLs?
 *   AWS's modern default disables ACLs (AccessControlListNotSupported).
 *   A bucket-level public-read policy is the recommended replacement.
 *
 * The policy only grants s3:GetObject — no write, delete, or list access.
 */
export async function POST() {
  try {
    // ── Step 1: Build the public-read bucket policy ──────────────────────────
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicReadGetObject",
          Effect: "Allow",
          Principal: "*",
          Action: "s3:GetObject",
          Resource: `arn:aws:s3:::${BUCKET_NAME}/*`,
        },
      ],
    };

    await s3
      .putBucketPolicy({
        Bucket: BUCKET_NAME,
        Policy: JSON.stringify(policy),
      })
      .promise();

    // ── Step 2: Count contributors so we can return a useful summary ─────────
    const allContributors: any[] = [];
    let cursor: string | undefined = undefined;
    let hasMore = true;

    while (hasMore) {
      const page = await fetchContributorsService(undefined, 100, cursor);
      allContributors.push(...page.contributors);
      cursor = page.nextCursor;
      hasMore = page.hasMore;
    }

    return NextResponse.json({
      ok: true,
      results: {
        policyApplied: true,
        contributorsFound: allContributors.length,
        message:
          "Bucket policy set to public-read. All existing and future objects are now publicly accessible.",
      },
    });
  } catch (err: any) {
    console.error("[migrate-images] Fatal error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Migration failed" },
      { status: 500 }
    );
  }
}
