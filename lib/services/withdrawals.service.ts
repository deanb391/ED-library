import { databases } from "@/lib/appwrite/server";
import { ID, Query } from "appwrite";
import { fetchCourseByIdService } from "@/lib/services/course.service";
import { creditWalletService, debitWalletService, fetchWalletByUserService } from "@/lib/services/wallet.service";
import { initFlutterwavePayment, initiateWithdrawal } from "./flutterwave.service";
import { verifyFlutterwaveTransaction } from "./flutterwave.service";
import { createEarningService } from "./earnings.service";
import { addCourseToLibraryService } from "./library.service";
import { fetchContributorService } from "./contributors.service";
import { createTransactionService } from "./transactions.service";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { use } from "react";
import { error } from "console";

const DATABASE_ID = "69617e75000c6c010a75";
const WITHDRAWAL_SERVICE = "withdrawals";

export type WithdrawalStatus = "pending" | "successful" | "failed";
export type WithdrawalType = "subscription" | "one-time" | "wallet_topup" | "withdrawal" | "debit";


const bankCodes: Record<string, string> = {
  "Access Bank": "044",
  "Citibank": "023",
  "Ecobank": "050",
  "Fidelity Bank": "070",
  "First Bank of Nigeria": "011",
  "First City Monument Bank (FCMB)": "214",
  "Guaranty Trust Bank (GTBank)": "058",
  "Heritage Bank": "030",
  "Keystone Bank": "082",
  "Lotus Bank": "303",
  "Moniepoint": "090405",
  "OPay": "100004",
  "PalmPay": "100033",
  "Premium Trust Bank": "105",
  "Polaris Bank": "076",
  "Stanbic IBTC Bank": "221",
  "Standard Chartered Bank": "068",
  "Sterling Bank": "232",
  "SunTrust Bank": "100",
  "Union Bank": "032",
  "United Bank for Africa (UBA)": "033",
  "Unity Bank": "215",
  "VFD Microfinance Bank": "090110",
  "Wema Bank": "035",
  "Zenith Bank": "057",
};

export function getBankCode(bankName: string): string | null {
  const code = bankCodes[bankName];
  if (!code) {
    console.warn(`Bank code not found for: "${bankName}"`);
    return null;
  }
  return code;
}

const bankNamesByCode: Record<string, string> = Object.entries(bankCodes).reduce(
  (acc, [name, code]) => {
    acc[code] = name;
    return acc;
  },
  {} as Record<string, string>
);

export function getBankName(bankCode: string): string | null {
  const name = bankNamesByCode[bankCode];

  if (!name) {
    console.warn(`Bank name not found for code: "${bankCode}"`);
    return null;
  }

  return name;
}

export interface WithdrawalPayload {
  amount: number;
  status: WithdrawalStatus;
  user: string;
  description?: string;
}

export async function createWIthdrawalService(payload: WithdrawalPayload) {
  const now = new Date().toISOString();

  const doc = await databases.createDocument(
    DATABASE_ID,
    WITHDRAWAL_SERVICE,
    ID.unique(),
    {
      ...payload,
      $createdAt: now,
      $updatedAt: now,
    }
  );

  return doc;
}

export async function updateWithdrawalService(
  withdrawalId: string,
  updates: Partial<WithdrawalPayload & { status: WithdrawalStatus }>
) {
  const doc = await databases.updateDocument(
    DATABASE_ID,
    WITHDRAWAL_SERVICE,
    withdrawalId,
    {
      ...updates,
      $updatedAt: new Date().toISOString(),
    }
  );

  return doc;
}

export async function getWithdrawalById(withdrawalId: string) {
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      WITHDRAWAL_SERVICE,
      withdrawalId
    );
    return doc;
  } catch (error) {
    console.error(`Failed to fetch payment with ID ${withdrawalId}:`, error);
    return null;
  }
}


export async function updateWithdrawalStatus(withdrawalId: string, status: WithdrawalStatus) {
  return await updateWithdrawalService(withdrawalId, { status });
}


export async function processWithdrawal({
  userId,
  amount,
  account_number,
  account_bank,
}: {
  userId: string;
  amount: number;
  account_number: string;
  account_bank: string;
}) {
  const wallet = await fetchWalletByUserService(userId);
  if (!wallet) return { success: false, error: "Wallet not found" };

  if (wallet.balance < amount) {
    return { success: false, error: "Bad Request: Balance Insufficient" };
  }

  // 1. Create withdrawal record (Pending)
  let withdrawal = await createWIthdrawalService({
    amount,
    status: "pending",
    user: userId,
    description: "Withdrawal",
  });

  trackEvent("WALLET_WITHDRAWAL_INITIATED", {
    distinctId: userId,
    userId: userId,
    metadata: { withdrawalId: withdrawal.$id, amount }
  });

  try {
    const ed_cut = 0.05 * amount;
    const before_cut = 0.95 * amount;
    let flutter_charge = 10.8;
    if (before_cut - flutter_charge > 5000 && before_cut - flutter_charge < 50000) {
      flutter_charge = 26.9;
    } else if (before_cut - flutter_charge > 50000) {
      flutter_charge = 53.8;
    }
    const balance = before_cut - flutter_charge;

    const bankCode = getBankCode(account_bank) || account_bank;

    // 2. Debit wallet first (Pessimistic approach to prevent double-debits)
    await debitWalletService(userId, amount, "Withdrawal");
    await createTransactionService({ user: userId, type: "withdrawal", direction: "debit", amount: amount, reference: "Withdrawal" });
    await createTransactionService({ user: "admin", type: "withdrawal_fee", direction: "debit", amount: ed_cut, reference: "Earning from withdrawal" });
    await createTransactionService({ user: "admin", type: "withdrawal_processing_fee", direction: "debit", amount: ed_cut, reference: "FlutterWave Charge" });

    // 3. Call Flutterwave
    const flw = await initiateWithdrawal({
      amount: balance,
      account_number,
      account_bank: bankCode,
      narration: "ED-Library Withdrawal",
      reference: withdrawal.$id,
    });

    if (flw.status === "error") {
      // Synchronous definitive failure from Flutterwave
      throw new Error(`Flutterwave error: ${flw.message}`);
    }

    // Queued or Successful. Leave as pending for webhook to mark successful.
    trackEvent("WALLET_WITHDRAWAL_SUCCESS", {
      distinctId: userId,
      userId: userId,
      metadata: { withdrawalId: withdrawal.$id, amount, status: flw.status }
    });
    return { success: true, receipt: withdrawal, message: flw.message || "Transfer processing" };

  } catch (err) {
    console.error("processWithdrawal Error:", err);

    // Determine if it was a network error/timeout (fetch failed) vs an API rejection
    const errorMessage = (err as Error).message || "";
    const isNetworkError = errorMessage.includes("fetch failed") || (err as Error).name === "TypeError";

    if (!isNetworkError) {
      // Explicit failure: Safe to refund immediately
      await refundUser(userId, amount);
      const receipt = await updateWithdrawalStatus(withdrawal.$id, "failed");
      trackEvent("WALLET_WITHDRAWAL_FAILED", {
        distinctId: userId,
        userId: userId,
        metadata: { withdrawalId: withdrawal.$id, amount, error: errorMessage }
      });
      return { success: false, receipt, error: errorMessage };
    }

    // Network timeout: Do NOT refund. Leave as pending.
    return { success: true, receipt: withdrawal, message: "Transfer is taking longer than expected. Status is pending." };
  }
}


export async function refundUser(userId: string, amount: number) {
  await creditWalletService(userId, amount, "refund")
  trackEvent("WALLET_WITHDRAWAL_REFUNDED", {
    distinctId: userId,
    userId: userId,
    metadata: { amount }
  });
}


export async function fetchWithdrawalHistoryByUserService(userId: string) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    WITHDRAWAL_SERVICE,
    [Query.equal("user", userId), Query.orderDesc("$createdAt"), Query.limit(10)]
  );
  return res.documents;
}


interface VerifyAccountParams {
  account_number: string;
  account_bank: string;
}

interface VerifyAccountResponse {
  success: boolean;
  account_name?: string;
  account_number?: string;
  message?: string;
}

export async function verifyAccount(params: VerifyAccountParams): Promise<VerifyAccountResponse> {
  try {
    const response = await fetch("https://api.flutterwave.com/v3/accounts/resolve", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account_number: params.account_number,
        account_bank: params.account_bank,
      }),
    });

    const data = await response.json();
    console.log("Data: ", data)

    if (data.status === "success") {
      return {
        success: true,
        account_name: data.data.account_name,
        account_number: data.data.account_number,
      };
    }

    return {
      success: false,
      message: data.message || "Account verification failed.",
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while verifying the account.",
    };
  }
}

export async function fetchPendingWithdrawalsService() {
  const res = await databases.listDocuments(
    DATABASE_ID,
    WITHDRAWAL_SERVICE,
    [Query.equal("status", "pending"), Query.limit(50)]
  );
  return res.documents;
}
