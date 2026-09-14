import { NextResponse } from "next/server";
import { updateCashoutAccountService } from "@/lib/services/wallet.service";
import { AuthService } from "@/services/auth.service";

export async function POST(req: Request) {
  const { userId, number, bank, name } = await req.json();

  if (!userId || !number || !bank || !name) {
    return NextResponse.json({ success: false, message: "Payload Incomplete!!" });
  }

  const user = await AuthService.getUserFromRequest(req);
  if (!user || user.userId !== userId) {
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