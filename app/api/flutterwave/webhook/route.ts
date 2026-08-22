// app/api/flutterwave/webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getWithdrawalById, refundUser, updateWithdrawalStatus } from "@/lib/services/withdrawals.service";
import { creditWalletService } from "@/lib/services/wallet.service";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // 1. verify signature here (MUST)
  const signature = req.headers.get("verif-hash");

//   if (!isValidSignature(rawBody, signature)) {
//     return NextResponse.json({ error: "unauthorized" }, { status: 401 });
//   }

  const payload = JSON.parse(rawBody);

  const { event, data } = payload;
  const reference = data.reference;

  if (!reference) {
    return NextResponse.json({ error: "missing reference" }, { status: 400 });
  }

  // 2. fetch withdrawal from DB
  const withdrawal = await getWithdrawalById(reference);

  if (!withdrawal || withdrawal.status !== "pending") {
    return NextResponse.json({ received: true });
  }

  // 3. handle events safely
  switch (event) {
    case "transfer.completed":
      await updateWithdrawalStatus(reference, "successful");
      break;

    case "transfer.failed":
      await refundUser(withdrawal.user, withdrawal.amount);
      await updateWithdrawalStatus(reference, "failed");
      break;

    default:
      break;
  }

  return NextResponse.json({ received: true });
}