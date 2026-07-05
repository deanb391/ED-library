import { NextResponse } from "next/server";
import { debitWalletService } from "@/lib/services/wallet.service";

export async function POST(req: Request) {
  const { userId, amount, description } = await req.json();

  const wallet = await debitWalletService(userId, amount, description);

  return NextResponse.json({ wallet });
}