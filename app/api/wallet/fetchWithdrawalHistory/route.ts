import { NextResponse } from "next/server";
import { fetchWithdrawalHistoryByUserService } from "@/lib/services/withdrawals.service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const wallet_history = await fetchWithdrawalHistoryByUserService(userId);

  return NextResponse.json(wallet_history);
}