import { NextResponse } from "next/server";
import { debitWalletService, updateCashoutAccountService } from "@/lib/services/wallet.service";
import { getAuthenticatedUser } from "@/lib/appwrite/auth";

export async function POST(req: Request) {
  const { userId, number, bank, name } = await req.json();

  if (!userId || !number || !bank || !name) {
    return NextResponse.json({ success: false, message: "Payload Incomplete!!" });
  }

  const user = await getAuthenticatedUser(req);
  if (!user || user.$id !== userId) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const wallet = await updateCashoutAccountService({
    userId, 
    number,
    bank,
    name
  });

  return NextResponse.json({ wallet });
}