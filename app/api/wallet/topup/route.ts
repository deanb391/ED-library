import { NextResponse } from "next/server";
import { topUpWalletService } from "@/lib/services/wallet.service";

export async function POST(req: Request) {
  const body = await req.json();

  const result = await topUpWalletService(body);

  return NextResponse.json(result);
}