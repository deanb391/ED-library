import { databases } from "@/lib/appwrite/server";
import { ID } from "appwrite";
import { fetchCourseByIdService } from "@/lib/services/course.service";
import {  creditWalletService, debitWalletService, fetchWalletByUserService } from "@/lib/services/wallet.service";
import { initFlutterwavePayment, initiateWithdrawal } from "./flutterwave.service";
import { verifyFlutterwaveTransaction } from "./flutterwave.service";
import { createEarningService } from "./earnings.service";
import { addCourseToLibraryService } from "./library.service";
import { fetchContributorService } from "./contributors.service";
import { createTransactionService } from "./transactions.service";
import { use } from "react";
import { error } from "console";

const DATABASE_ID = "69617e75000c6c010a75";
const WITHDRAWAL_SERVICE = "withdrawals";

export type WithdrawalStatus = "pending" | "successful" | "failed";
export type WithdrawalType = "subscription" | "one-time" | "wallet_topup" | "withdrawal" | "debit";

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
  // 1. Create withdrawal record
  const withdrawal = await createWIthdrawalService({
    amount,
    status: "pending",
    user: userId,
    description: "Withdrawal",
  });

  try {

    // 
    const wallet = await fetchWalletByUserService(userId)
    if(!wallet) return;

    if (wallet.balance < amount) {
        return { success: false, error: "Bad Request: Balance Insufficient"}
    }

    const ed_cut = 0.10 * amount;
    const before_cut = 0.90 * amount;
    const flutter_charge = 100
    const balance = before_cut - flutter_charge

    // 2. Debit wallet first


    // 3. Call Flutterwave
    const flw = await initiateWithdrawal({
      amount: balance,
      account_number,
      account_bank,
      narration: "ED-Library Withdrawal",
      reference: withdrawal.$id,
    });


    if (flw.status !== "success") {
      throw new Error("Transfer failed");
    }

    // 4. Mark success
    await updateWithdrawalStatus(withdrawal.$id, "successful");

    await debitWalletService(userId, amount, "Withdrawal");

    await  createTransactionService({user: userId, type: "withdrawal", direction: "debit", amount: amount, reference: "Withdrawal"})

    await  createTransactionService({user: "admin", type: "withdrawal_fee", direction: "debit", amount: ed_cut, reference: "Earning from withdrawal"})

    await  createTransactionService({user: "admin", type: "withdrawal_processing_fee", direction: "debit", amount: ed_cut, reference: "FlutterWave Charge"})

    return { success: true };

  } catch (err) {
    console.error(err);

    await updateWithdrawalStatus(withdrawal.$id, "failed");

    return { success: false };
  }
}
