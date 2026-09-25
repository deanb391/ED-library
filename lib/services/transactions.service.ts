import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

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

  const id = randomUUID();
  const doc = await prisma.transaction.create({
    data: {
      id,
      userId: payload.user || null,
      type: payload.type,
      direction: payload.direction,
      amount: payload.amount,
      reference: payload.reference ?? null,
    },
  });

  return {
    ...doc,
    $id: doc.id,
    $createdAt: doc.createdAt.toISOString(),
    $updatedAt: doc.updatedAt.toISOString(),
  };
}