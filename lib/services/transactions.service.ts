import { databases } from "@/lib/appwrite/server";
import { ID } from "appwrite";

const DATABASE_ID = "69617e75000c6c010a75";
const TRANSACTIONS_COLLECTION = "transactions";

export type TransactionType =
  | "deposit"
  | "deposit_fee"
  | "earning"
  | "debit"
  | "platform_cut"
  | "withdrawal"
  | "withdrawal_fee"
  | "payment_processing_fee"
  | "withdrawal_processing_fee";

export type TransactionDirection = "credit" | "debit";

export interface CreateTransactionPayload {
  user: string;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  reference?: string;
}

export async function createTransactionService(
  payload: CreateTransactionPayload
) {
  if (payload.amount <= 0) {
    throw new Error("Transaction amount must be greater than zero");
  }

  const doc = await databases.createDocument(
    DATABASE_ID,
    TRANSACTIONS_COLLECTION,
    ID.unique(),
    {
      user: payload.user,
      type: payload.type,
      direction: payload.direction,
      amount: payload.amount,
      reference: payload.reference ?? null,
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
    }
  );

  return doc;
}