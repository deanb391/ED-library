import { NextResponse } from "next/server";
import { creditWalletService } from "@/lib/services/wallet.service";

export async function POST(req: Request) {
  const { userId, amount } = await req.json();

  const wallet = await creditWalletService(userId, amount);

  return NextResponse.json({ wallet });
}