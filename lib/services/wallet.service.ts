import { ID, Query } from "appwrite";
import { databases } from "@/lib/appwrite/server";
import { createPaymentService } from "./payments.service";
import { initFlutterwavePayment } from "./flutterwave.service";
import { getBankName, processWithdrawal, verifyAccount } from "./withdrawals.service";
import { trackEvent } from "@/lib/analytics/trackEvent";

const DATABASE_ID = "69617e75000c6c010a75";
const WALLET_COLLECTION = "wallet";
const WALLET_HISTORY_COLLECTION = "wallet_history"

export type Wallet = {
  $id: string;
  user: string;
  balance: number;
  cashout_account?: string;
  $createdAt: string;
  $updatedAt: string;
};

// helper mapper
function mapWallet(doc: any): Wallet {
  return {
    $id: doc.$id,
    user: doc.user,
    balance: doc.balance || 0,
    cashout_account: doc.cashout_account || "",
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

// ONLY ONE WALLET PER USER
export async function createWalletService(userId: string): Promise<Wallet> {
  if (!userId) {
    throw new Error("createWalletService: userId is required");
  }

  const existing = await databases.listDocuments(
    DATABASE_ID,
    WALLET_COLLECTION,
    [Query.equal("user", userId)]
  );

  if (existing.documents.length > 0) {
    return mapWallet(existing.documents[0]);
  }

  const doc = await databases.createDocument(
    DATABASE_ID,
    WALLET_COLLECTION,
    ID.unique(),
    {
      user: userId,
      balance: 0,
      cashout_account: "",
    }
  );

  return mapWallet(doc);
}

export async function fetchWalletByUserService(userId: string): Promise<Wallet | null> {
  const res = await databases.listDocuments(
    DATABASE_ID,
    WALLET_COLLECTION,
    [Query.equal("user", userId)]
  );

  if (res.documents.length === 0) return null;

  return mapWallet(res.documents[0]);
}

export async function fetchWalletHistoryByUserService(userId: string) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    WALLET_HISTORY_COLLECTION,
    [Query.equal("user", userId), Query.orderDesc("$createdAt"), Query.limit(10)]
  );
  return res.documents;
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
  trackEvent("WALLET_DEPOSIT", {
    distinctId: userId,
    userId: userId,
    metadata: { amount, paymentId }
  });
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

  const updated = await databases.updateDocument(
    DATABASE_ID,
    WALLET_COLLECTION,
    wallet.$id,
    {
      balance: wallet.balance - amount,
    }
  );

  await recordWalletHistory(wallet?.user, "debit", amount,description ? description :  "Payment For Course")

  return mapWallet(updated);
}

export async function creditWalletService(
  userId: string,
  amount: number,
  description?: string,
): Promise<Wallet> {
  const wallet = await fetchWalletByUserService(userId);

  // If they somehow don't have a wallet, create one or throw an error
  if (!wallet) {
    throw new Error("Wallet not found. Cannot credit.");
  }

  const updated = await databases.updateDocument(
    DATABASE_ID,
    WALLET_COLLECTION,
    wallet.$id,
    {
      balance: wallet.balance + amount,
    }
  );

  await recordWalletHistory(wallet?.user, "credit", amount, description ? description : "Top Up")

  return mapWallet(updated);
}

export async function recordWalletHistory(
  userId: string,
  type: string,
  amount: number,
  description: string
) {

  return await databases.createDocument(
    DATABASE_ID, 
    WALLET_HISTORY_COLLECTION,
    ID.unique(),
    {
      user: userId,
      type: type,
      amount: amount,
      description: description
    }
  )
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

  const res = await verifyAccount({account_number: params.number, account_bank: params.bank})

  if (!res.success) {
    return {success: false, message: "We couldn't verify this account, please check your details or try a different account."}
  }

  const accountPayload = {
    number: params.number,
    bank: getBankName(params.bank),
    name: params.name,
  };

  const updated = await databases.updateDocument(
    DATABASE_ID,
    WALLET_COLLECTION,
    wallet.$id,
    {
      cashout_account: JSON.stringify(accountPayload),
    }
  );

  return {success: true, value: mapWallet(updated)};
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

    return await processWithdrawal({userId: userId, amount: Number(amount), account_number: account.number, account_bank: account.bank})

    // later: create withdrawal record + call flutterwave transfer
  } catch (error) {
    throw new Error(`Withdrawal Failed: ${(error as Error).message}`);
  }
}