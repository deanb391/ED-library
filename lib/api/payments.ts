export async function payForCourse(courseIds: string[], userId: string, email: string, paymentMethod: string, type: string) {
  const res = await fetch("/api/payments/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ courseIds, userId, email, paymentMethod, type}),
  });

  if (!res.ok) {
    throw new Error("Failed to initiate subscription");
  }

  const data = await res.json();
  return data; 
}


export async function verifyPayment(paymentId: string) {
  const res = await fetch(`/api/payments/verify?paymentId=${encodeURIComponent(paymentId)}&`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Failed to verify payment");
  }

  const data = await res.json();
  return data;
}