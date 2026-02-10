import { NextRequest, NextResponse } from "next/server";
import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_KEY!,
  region: process.env.AWS_REGION!,
});

const BUCKET_NAME = process.env.AWS_BUCKET!;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "misc";
    const type = (formData.get("type") as string);

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    let extension;
    if (type === "image") {
        extension = "jpg"
    } else if (type === "video" ) {
        extension = 'mp4'
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `${folder}/${uuidv4()}.${extension}`;

    await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type || "image/jpeg",
    }).promise();

    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  try {
    const s3Url = req.nextUrl.searchParams.get("url");
    if (!s3Url) return NextResponse.json({ error: "Missing key" }, { status: 400 });

    const url = new URL(s3Url);
    const bucket = url.hostname.split(".")[0]; // ed-library-bucket
    const key = url.pathname.slice(1); // remove leading "/"

    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: bucket,
      Key: key,
      Expires: 60, // valid for 60 seconds
      ResponseContentDisposition: "attachment", // forces download
    });

    



    return NextResponse.json({ signedUrl });
  } catch (err) {
    console.error("Failed to build download URL:", err);
    return NextResponse.json({ error: "Failed to build download URL" }, { status: 500 });
  }
}