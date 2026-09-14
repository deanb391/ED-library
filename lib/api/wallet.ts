import { getAuthToken } from "@/lib/services/auth.service";

export type Wallet = {
  $id: string;
  user: string;
  balance: number;
  cashout_account?: string;
  $createdAt: string;
  $updatedAt: string;
};

export async function createWallet(userId: string) {
  const token = getAuthToken();
  const res = await fetch("/api/wallet/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ userId }),
  });

  return res.json();
}

export async function fetchWallet(userId: string) {
  const token = getAuthToken();
  const res = await fetch(`/api/wallet/fetch?userId=${userId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.json();
}

export async function fetchWalletHistory(userId: string) {
  const token = getAuthToken();
  const res = await fetch(`/api/wallet/fetchHistory?userId=${userId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.json();
}

export async function fetchWithdrawalHistory(userId: string) {
  const token = getAuthToken();
  const res = await fetch(`/api/wallet/fetchWithdrawalHistory?userId=${userId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.json();
}

export async function topUpWallet(userId: string, amount: number, email: string) {
  const token = getAuthToken();
  const res = await fetch("/api/wallet/topup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ userId, amount, email }),
  });

  return res.json();
}

export async function verifyAccount(account_number: string, account_bank: string) {
  const token = getAuthToken();
  const res = await fetch("/api/wallet/verifyAccount", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ account_number, account_bank }),
  });

  return res.json();
}

export async function updateWalletAccount(userId: string, number: string, bank: string, name: string) {
  const token = getAuthToken();
  const res = await fetch("/api/wallet/updateAccount", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ userId, number, bank, name }),
  });

  return res.json();
}

export async function debitWallet(userId: string, amount: number, description: string) {
  const token = getAuthToken();
  const res = await fetch("/api/wallet/debit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ userId, amount, description }),
  });

  return res.json();
}

export async function verifyPayment(paymentId: string) {
  const res = await fetch(`/api/wallet/verify?paymentId=${encodeURIComponent(paymentId)}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Failed to verify payment");
  }

  const data = await res.json();
  return data;
}

export async function withdraw(userId: string, amount: string) {
  const token = getAuthToken();

  const res = await fetch("/api/wallet/withdraw", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ userId, amount }),
  });

  return res.json();
}

export async function verifyPendingWithdrawals() {
  const token = getAuthToken();
  const res = await fetch("/api/wallet/verify-pending", {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.json();
}