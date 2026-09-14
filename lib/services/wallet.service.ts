import prisma from "@/lib/prisma";
import { createPaymentService } from "./payments.service";
import { initFlutterwavePayment } from "./flutterwave.service";
import { getBankName, processWithdrawal, verifyAccount } from "./withdrawals.service";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { trackWalletTopupSuccessful, trackWithdrawalInitiated, trackWithdrawalSuccessful } from "@/lib/analytics/trackers";
import { randomUUID } from "crypto";

export type Wallet = {
  $id: string;
  user: string;
  balance: number;
  cashout_account?: string;
  $createdAt: string;
  $updatedAt: string;
};

// helper mapper
export function mapWallet(doc: any): Wallet {
  if (!doc) return null as any;
  return {
    $id: doc.id || doc.$id,
    user: doc.userId || doc.user || "",
    balance: Number(doc.balance) || 0,
    cashout_account: doc.cashout_account || "",
    $createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.$createdAt || new Date().toISOString()),
    $updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.$updatedAt || new Date().toISOString()),
  };
}

// ONLY ONE WALLET PER USER
export async function createWalletService(userId: string): Promise<Wallet> {
  if (!userId) {
    throw new Error("createWalletService: userId is required");
  }

  const existing = await prisma.wallet.findFirst({
    where: { userId },
  });

  if (existing) {
    return mapWallet(existing);
  }

  const id = randomUUID();
  const doc = await prisma.wallet.create({
    data: {
      id,
      userId,
      balance: 0,
      cashout_account: "",
    },
  });

  return mapWallet(doc);
}

export async function fetchWalletByUserService(userId: string): Promise<Wallet | null> {
  const doc = await prisma.wallet.findFirst({
    where: { userId },
  });

  if (!doc) return null;

  return mapWallet(doc);
}

export async function fetchWalletHistoryByUserService(userId: string) {
  const docs = await prisma.walletHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return docs.map((d) => ({
    $id: d.id,
    id: d.id,
    user: d.userId || "",
    type: d.type,
    amount: d.amount,
    description: d.description,
    $createdAt: d.createdAt.toISOString(),
    $updatedAt: d.updatedAt.toISOString(),
  }));
}

export async function topUpWalletService(params: {
  userId: string;
  email: string;
  amount: number;
}) {
  const payment = await createPaymentService({
    type: "wallet_topup",
    amount: params.amount,
    status: "pending",
    user: params.userId,
    description: "Wallet top-up",
    provider: "flutterwave",
  });

  if (!payment) {
    throw new Error("Failed to create payment record");
  }

  const flutter = await initFlutterwavePayment({
    amount: params.amount,
    email: params.email,
    tx_ref: payment.$id,
    description: "Wallet Top-up",
    redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet/topup/verify?paymentId=${payment.$id}`,
  });

  return {
    checkoutUrl: flutter.data.link,
    paymentId: payment.$id,
  };
}

export async function walletDepositSuccess(userId: string, amount: number, paymentId: string) {
  trackWalletTopupSuccessful(userId, amount, { paymentId });
}

export async function debitWalletService(
  userId: string,
  amount: number,
  description?: string
) {
  const wallet = await fetchWalletByUserService(userId);

  if (!wallet) throw new Error("Wallet not found");
  if (wallet.balance < amount) {
    trackEvent("WALLET_INSUFFICIENT_BALANCE", {
      distinctId: userId,
      userId: userId,
      metadata: { balance: wallet.balance, amountNeeded: amount }
    });
    throw new Error("Insufficient balance");
  }

  const updated = await prisma.wallet.update({
    where: { id: wallet.$id },
    data: {
      balance: wallet.balance - amount,
    },
  });

  await recordWalletHistory(wallet?.user, "debit", amount, description ? description : "Payment For Course");

  return mapWallet(updated);
}

export async function creditWalletService(
  userId: string,
  amount: number,
  description?: string,
): Promise<Wallet> {
  let wallet = await fetchWalletByUserService(userId);

  if (!wallet) {
    wallet = await createWalletService(userId);
  }

  const updated = await prisma.wallet.update({
    where: { id: wallet.$id },
    data: {
      balance: wallet.balance + amount,
    },
  });

  await recordWalletHistory(wallet?.user, "credit", amount, description ? description : "Top Up");

  return mapWallet(updated);
}

export async function recordWalletHistory(
  userId: string,
  type: string,
  amount: number,
  description: string
) {
  const id = randomUUID();
  return await prisma.walletHistory.create({
    data: {
      id,
      userId,
      type: type,
      amount: amount,
      description: description,
    },
  });
}

export async function updateCashoutAccountService(params: {
  userId: string;
  number: string;
  bank: string;
  name: string;
}) {
  const wallet = await fetchWalletByUserService(params.userId);

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const res = await verifyAccount({ account_number: params.number, account_bank: params.bank });

  if (!res.success) {
    return { success: false, message: "We couldn't verify this account, please check your details or try a different account." };
  }

  const accountPayload = {
    number: res.account_number,
    bank: getBankName(params.bank),
    name: res.account_name,
  };

  const updated = await prisma.wallet.update({
    where: { id: wallet.$id },
    data: {
      cashout_account: JSON.stringify(accountPayload),
    },
  });

  return { success: true, value: mapWallet(updated) };
}

function parseCashoutAccount(cashout?: string) {
  try {
    return cashout ? JSON.parse(cashout) : null;
  } catch {
    return null;
  }
}

export async function withdrawWalletService(userId: string, amount: string) {
  try {
    const wallet = await fetchWalletByUserService(userId);

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const account = parseCashoutAccount(wallet.cashout_account);

    if (!account) {
      throw new Error("No cashout account set");
    }

    return await processWithdrawal({ userId: userId, amount: Number(amount), account_number: account.number, account_bank: account.bank });
  } catch (error) {
    throw new Error(`Withdrawal Failed: ${(error as Error).message}`);
  }
}