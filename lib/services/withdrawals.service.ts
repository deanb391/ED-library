import prisma from "@/lib/prisma";
import { creditWalletService, debitWalletService, fetchWalletByUserService } from "@/lib/services/wallet.service";
import { initiateWithdrawal } from "./flutterwave.service";
import { createTransactionService } from "./transactions.service";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { randomUUID } from "crypto";

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

function mapWithdrawal(doc: any) {
  if (!doc) return null;
  return {
    ...doc,
    $id: doc.id || doc.$id,
    user: doc.userId || doc.user || "",
    amount: Number(doc.amount),
    $createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.$createdAt || new Date().toISOString()),
    $updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.$updatedAt || new Date().toISOString()),
  };
}

export async function createWIthdrawalService(payload: WithdrawalPayload) {
  const id = randomUUID();
  const doc = await prisma.withdrawal.create({
    data: {
      id,
      userId: payload.user,
      amount: payload.amount,
      status: payload.status,
      description: payload.description || "",
    },
  });

  return mapWithdrawal(doc);
}

export async function updateWithdrawalService(
  withdrawalId: string,
  updates: Partial<WithdrawalPayload & { status: WithdrawalStatus }>
) {
  const doc = await prisma.withdrawal.update({
    where: { id: withdrawalId },
    data: {
      ...(updates.amount !== undefined && { amount: updates.amount }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.user !== undefined && { userId: updates.user }),
      ...(updates.description !== undefined && { description: updates.description }),
    },
  });

  return mapWithdrawal(doc);
}

export async function getWithdrawalById(withdrawalId: string) {
  try {
    const doc = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });
    return mapWithdrawal(doc);
  } catch (error) {
    console.error(`Failed to fetch withdrawal with ID ${withdrawalId}:`, error);
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
    const FEE_WAIVER_END = new Date("2026-07-26T00:00:00Z");
    const isFeeWaived = new Date() < FEE_WAIVER_END;
    
    const ed_cut = isFeeWaived ? 0 : 0.05 * amount;
    const before_cut = amount - ed_cut;
    let flutter_charge = 10.8;
    if (before_cut - flutter_charge > 5000 && before_cut - flutter_charge < 50000) {
      flutter_charge = 26.9;
    } else if (before_cut - flutter_charge > 50000) {
      flutter_charge = 53.8;
    }
    const balance = before_cut - flutter_charge;

    const bankCode = getBankCode(account_bank) || account_bank;

    await debitWalletService(userId, amount, "Withdrawal");
    await createTransactionService({ user: userId, type: "withdrawal", direction: "debit", amount: amount, reference: "Withdrawal" });
    
    if (ed_cut > 0) {
      await createTransactionService({ user: "admin", type: "withdrawal_fee", direction: "debit", amount: ed_cut, reference: "Earning from withdrawal" });
    }
    await createTransactionService({ user: "admin", type: "withdrawal_processing_fee", direction: "debit", amount: flutter_charge, reference: "FlutterWave Charge" });

    const flw = await initiateWithdrawal({
      amount: balance,
      account_number,
      account_bank: bankCode,
      narration: "ED-Library Withdrawal",
      reference: withdrawal.$id,
    });

    if (flw.status === "network_error") {
      throw new Error("network_error");
    }

    if (flw.status === "error") {
      throw new Error(`Flutterwave error: ${flw.message}`);
    }

    trackEvent("WALLET_WITHDRAWAL_SUCCESS", {
      distinctId: userId,
      userId: userId,
      metadata: { withdrawalId: withdrawal.$id, amount, status: flw.status }
    });
    return { success: true, receipt: withdrawal, message: flw.message || "Transfer processing" };

  } catch (err) {
    const errorMessage = (err as Error).message || "";
    console.error("processWithdrawal Error:", errorMessage);

    const isNetworkError = errorMessage === "network_error" || errorMessage.includes("fetch failed") || (err as Error).name === "TypeError";

    if (!isNetworkError) {
      await refundUser(userId, amount);
      const receipt = await updateWithdrawalStatus(withdrawal.$id, "failed");
      trackEvent("WALLET_WITHDRAWAL_FAILED", {
        distinctId: userId,
        userId: userId,
        metadata: { withdrawalId: withdrawal.$id, amount, error: errorMessage }
      });
      return { success: false, receipt, error: errorMessage };
    }

    return { success: true, receipt: withdrawal, message: "Transfer is taking longer than expected. Status is pending." };
  }
}

export async function refundUser(userId: string, amount: number) {
  await creditWalletService(userId, amount, "refund");
  trackEvent("WALLET_WITHDRAWAL_REFUNDED", {
    distinctId: userId,
    userId: userId,
    metadata: { amount }
  });
}

export async function fetchWithdrawalHistoryByUserService(userId: string) {
  const docs = await prisma.withdrawal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return docs.map(mapWithdrawal);
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
  const docs = await prisma.withdrawal.findMany({
    where: { status: "pending" },
    take: 50,
  });
  return docs.map(mapWithdrawal);
}
