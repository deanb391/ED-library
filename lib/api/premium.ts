export async function subscribeToPremium(userId: string, email: string) {
  const res = await fetch("/api/premium/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, email }),
  });

  if (!res.ok) {
    throw new Error("Failed to initiate premium subscription");
  }

  const data = await res.json();
  return data;
}

export async function verifyPremiumPayment(paymentId: string) {
  const res = await fetch(`/api/premium/verify?paymentId=${encodeURIComponent(paymentId)}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Failed to verify premium payment");
  }

  const data = await res.json();
  return data;
}
