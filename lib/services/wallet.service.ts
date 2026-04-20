import { ID, Query } from "appwrite";
import { databases } from "@/lib/appwrite/server";
import { createPaymentService } from "./payments.service";
import { initFlutterwavePayment } from "./flutterwave.service";

const DATABASE_ID = "69617e75000c6c010a75";
const WALLET_COLLECTION = "wallet";

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



export async function debitWalletService(
  userId: string,
  amount: number,
  description: string
) {
  const wallet = await fetchWalletByUserService(userId);

  if (!wallet) throw new Error("Wallet not found");
  if (wallet.balance < amount) throw new Error("Insufficient balance");

  const updated = await databases.updateDocument(
    DATABASE_ID,
    WALLET_COLLECTION,
    wallet.$id,
    {
      balance: wallet.balance - amount,
    }
  );

  return mapWallet(updated);
}

export async function creditWalletService(
  userId: string,
  amount: number
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

  return mapWallet(updated);
}