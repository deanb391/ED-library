export async function createWallet(userId: string) {
  const res = await fetch("/api/wallet/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ userId }),
});

  return res.json();
}

export async function fetchWallet(userId: string) {
  const res = await fetch(`/api/wallet/fetch?userId=${userId}`);
  return res.json();
}

export async function topUpWallet(userId: string, amount: number, email: string) {
  const res = await fetch("/api/wallet/topup", {
    method: "POST",
    headers: {
    "Content-Type": "application/json",
  },
    body: JSON.stringify({ userId, amount, email }),
  });

  return res.json();
}

export async function debitWallet(userId: string, amount: number, description: string) {
  const res = await fetch("/api/wallet/debit", {
    method: "POST",
    body: JSON.stringify({ userId, amount, description }),
  });

  return res.json();
}

export async function creditWallet(userId: string, amount: number) {
  const res = await fetch("/api/wallet/credit", {
    method: "POST",
    body: JSON.stringify({ userId, amount }),
  });

  return res.json();
}

export async function verifyPayment(paymentId: string) {
  const res = await fetch(`/api/wallet/verify?paymentId=${encodeURIComponent(paymentId)}&`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Failed to verify payment");
  }

  const data = await res.json();
  return data;
}