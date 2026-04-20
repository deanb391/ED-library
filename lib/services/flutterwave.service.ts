const FLW_BASE = "https://api.flutterwave.com/v3";

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function initFlutterwavePayment(params: {
  amount: number;
  email: string;
  tx_ref: string;
  description: string;
  redirect_url: string;
}) {
  const res = await fetch(`${FLW_BASE}/payments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      tx_ref: params.tx_ref,
      amount: params.amount,
      currency: "NGN",
      redirect_url: params.redirect_url,
      customer: {
        email: params.email,
      },
      customizations: {
        title: "ED-Library",
        description: params.description,
      },
    }),
  });

  const data = await res.json();

  console.log("Flutterwave init:", data);

  return data;
}

export async function verifyFlutterwaveTransaction(tx_ref: string) {
  const res = await fetch(
    `${FLW_BASE}/transactions/verify_by_reference?tx_ref=${tx_ref}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return res.json();
}