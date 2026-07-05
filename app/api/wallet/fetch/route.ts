import { NextResponse } from "next/server";
import { fetchWalletByUserService } from "@/lib/services/wallet.service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const wallet = await fetchWalletByUserService(userId);

  return NextResponse.json({ wallet });
}