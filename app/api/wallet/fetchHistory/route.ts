import { NextResponse } from "next/server";
import { fetchWalletHistoryByUserService } from "@/lib/services/wallet.service";
import { AuthService } from "@/services/auth.service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const user = await AuthService.getUserFromRequest(req);
  if (!user || user.userId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wallet_history = await fetchWalletHistoryByUserService(userId);

  return NextResponse.json(wallet_history);
}