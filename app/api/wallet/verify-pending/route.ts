import { NextResponse } from "next/server";
import { fetchPendingWithdrawalsService, refundUser, updateWithdrawalStatus } from "@/lib/services/withdrawals.service";
import { verifyFlutterwaveTransfer } from "@/lib/services/flutterwave.service";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const pendingWithdrawals = await fetchPendingWithdrawalsService();

    const results = [];

    for (const withdrawal of pendingWithdrawals) {
      try {
        const flwRes = await verifyFlutterwaveTransfer(withdrawal.$id);

        if (flwRes.status === "error") {
          results.push({ id: withdrawal.$id, error: flwRes.message });
          continue;
        }

        const transfers = Array.isArray(flwRes.data) ? flwRes.data : (flwRes.data ? [flwRes.data] : []);
        const transfer = transfers.find((t: any) => t.reference === withdrawal.$id);

        if (!transfer) {
          results.push({ id: withdrawal.$id, status: "not_found_in_flw" });
          continue;
        }

        const statusLower = transfer.status.toLowerCase();

        if (statusLower === "successful") {
          await updateWithdrawalStatus(withdrawal.$id, "successful");
          results.push({ id: withdrawal.$id, new_status: "successful" });
          
          try {
            const userDoc = await prisma.user.findUnique({ where: { id: withdrawal.user } });
            if (userDoc?.email) {
              const { sendWithdrawalSuccessEmail } = await import("@/lib/email/events");
              sendWithdrawalSuccessEmail(userDoc.email, userDoc.name || "User", withdrawal.amount);
            }
          } catch (err) {
            console.error("Failed to send withdrawal email:", err);
          }
        } else if (statusLower === "failed") {
          await refundUser(withdrawal.user, withdrawal.amount);
          await updateWithdrawalStatus(withdrawal.$id, "failed");
          results.push({ id: withdrawal.$id, new_status: "failed", refunded: true });
        } else {
          results.push({ id: withdrawal.$id, new_status: "pending" });
        }
      } catch (err) {
        console.error(`Error verifying withdrawal ${withdrawal.$id}:`, err);
        results.push({ id: withdrawal.$id, error: "Verification check failed" });
      }
    }

    return NextResponse.json({ success: true, processed: pendingWithdrawals.length, results });

  } catch (error) {
    console.error("Verification Endpoint Error:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
