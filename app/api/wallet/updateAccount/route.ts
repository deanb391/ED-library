import { NextResponse } from "next/server";
import { debitWalletService, updateCashoutAccountService } from "@/lib/services/wallet.service";

export async function POST(req: Request) {
  const { userId, number, bank, name } = await req.json();

  if (!userId || !number || !bank || !name) {
    return NextResponse.json({ success: false, message: "Payload Incomplete!!" });
  }

  const wallet = await updateCashoutAccountService({
    userId, 
    number,
    bank,
    name
  });

  return NextResponse.json({ wallet });
}