import { NextResponse } from "next/server";
import { createWalletService } from "@/lib/services/wallet.service";

export async function POST(req: Request) {
  const body = await req.json();

  if (!body?.userId) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  const wallet = await createWalletService(body.userId);

  return NextResponse.json({ wallet });
}