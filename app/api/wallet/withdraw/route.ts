import { NextResponse } from "next/server";
import { withdrawWalletService } from "@/lib/services/wallet.service";

export async function POST(req: Request) {
  try {
    const { userId, amount } = await req.json();

    const wallet = await withdrawWalletService(userId, amount);

    return NextResponse.json({ wallet });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}