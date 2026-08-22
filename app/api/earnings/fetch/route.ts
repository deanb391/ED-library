import { NextResponse } from "next/server";
import { fetchContributorEarningsService } from "@/lib/services/earnings.service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const contributorId = searchParams.get("contributorId");

  if (!contributorId) {
    return NextResponse.json({ error: "Missing contributorId" }, { status: 400 });
  }

  const earnings = await fetchContributorEarningsService(contributorId);

  return NextResponse.json({ earnings });
}