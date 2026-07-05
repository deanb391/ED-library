import { NextResponse } from "next/server";
import { fetchPendingWithdrawalsService, refundUser, updateWithdrawalStatus } from "@/lib/services/withdrawals.service";
import { verifyFlutterwaveTransfer } from "@/lib/services/flutterwave.service";

export async function POST(req: Request) {
  try {
    // Note: In a production environment, you should protect this endpoint with an admin secret
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const pendingWithdrawals = await fetchPendingWithdrawalsService();

    const results = [];

    for (const withdrawal of pendingWithdrawals) {
      try {
        // 1. Check Flutterwave status
        const flwRes = await verifyFlutterwaveTransfer(withdrawal.$id);

        // /transfers?reference=X typically returns a list of transfers in the data array
        const transfers = Array.isArray(flwRes.data) ? flwRes.data : (flwRes.data ? [flwRes.data] : []);
        const transfer = transfers.find((t: any) => t.reference === withdrawal.$id);

        if (!transfer) {
          // If Flutterwave has no record of it, it might have failed to queue entirely. 
          // However, to be safe against replication lags, we only take action if it's explicitly failed.
          results.push({ id: withdrawal.$id, status: "not_found_in_flw" });
          continue;
        }

        const statusLower = transfer.status.toLowerCase();

        if (statusLower === "successful") {
          await updateWithdrawalStatus(withdrawal.$id, "successful");
          results.push({ id: withdrawal.$id, new_status: "successful" });
          
          try {
            const { databases } = await import("@/lib/appwrite/server");
            const userDoc = await databases.getDocument("69617e75000c6c010a75", "user", withdrawal.user);
            if (userDoc.email) {
              const { sendWithdrawalSuccessEmail } = await import("@/lib/email/events");
              sendWithdrawalSuccessEmail(userDoc.email, userDoc.username || "User", withdrawal.amount);
            }
          } catch (err) {
            console.error("Failed to send withdrawal email:", err);
          }
        } else if (statusLower === "failed") {
          await refundUser(withdrawal.user, withdrawal.amount);
          await updateWithdrawalStatus(withdrawal.$id, "failed");
          results.push({ id: withdrawal.$id, new_status: "failed", refunded: true });
        } else {
          // still processing / pending
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
