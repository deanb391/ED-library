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
  try {
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

    if (!res.ok) {
      console.error(`Flutterwave init failed with status: ${res.status}`);
      try {
        const errorData = await res.json();
        return { status: "error", message: errorData.message || "Payment initialization failed" };
      } catch (e) {
        return { status: "error", message: `Payment initialization failed with status ${res.status}` };
      }
    }

    const data = await res.json();
    console.log("Flutterwave init:", data);
    return data;
  } catch (error) {
    console.error("Flutterwave init network error:", (error as Error).message);
    return { status: "network_error", message: "Network error connecting to payment gateway" };
  }
}

export async function verifyFlutterwaveTransaction(tx_ref: string) {
  try {
    const res = await fetch(
      `${FLW_BASE}/transactions/verify_by_reference?tx_ref=${tx_ref}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    if (!res.ok) {
      return { status: "error", message: `Verification failed with status ${res.status}` };
    }

    return await res.json();
  } catch (error) {
    console.error("Flutterwave verify transaction network error:", (error as Error).message);
    return { status: "network_error", message: "Network error during verification" };
  }
}


export async function createTransferRecipient(params: {
  account_number: string;
  account_bank: string;
  name: string;
}) {
  try {
    const res = await fetch(`${FLW_BASE}/beneficiaries`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        account_number: params.account_number,
        account_bank: params.account_bank,
        beneficiary_name: params.name,
      }),
    });

    if (!res.ok) {
      try {
        const errorData = await res.json();
        return { status: "error", message: errorData.message || "Failed to create recipient" };
      } catch (e) {
        return { status: "error", message: `Failed to create recipient with status ${res.status}` };
      }
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Flutterwave create recipient network error:", (error as Error).message);
    return { status: "network_error", message: "Network error connecting to payment gateway" };
  }
}


export async function initiateWithdrawal(params: {
  amount: number;
  account_number: string;
  account_bank: string;
  narration: string;
  reference: string;
}) {
  try {
    console.log("Initiating transfer");
    const body = {
      "account_bank": params.account_bank, // e.g. "044"
      "account_number": params.account_number,
      "amount": params.amount,
      "currency": "NGN",
      "narration": params.narration,
      "reference": params.reference,
      "debit_currency": "NGN",
    }

    console.log("Flutterwave transfer body:", body);

    const res = await fetch(`${FLW_BASE}/transfers`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    console.log("Flutterwave transfer:", res);

    if (!res.ok) {
      console.error(`Flutterwave transfer failed with status: ${res.status}`);
      try {
        const errorData = await res.json();
        return { status: "error", message: errorData.message || "Transfer initialization failed" };
      } catch (e) {
        return { status: "error", message: `Transfer initialization failed with status ${res.status}` };
      }
    }

    const data = await res.json();
    console.log("Flutterwave transfer:", data);
    return data;
  } catch (error) {
    console.error("Flutterwave transfer network error:", (error as Error).message);
    return { status: "network_error", message: "Network error connecting to payment gateway" };
  }
}

export async function verifyFlutterwaveTransfer(reference: string) {
  try {
    const res = await fetch(`${FLW_BASE}/transfers?reference=${reference}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!res.ok) {
      return { status: "error", message: `Transfer verification failed with status ${res.status}` };
    }

    const data = await res.json();
    console.log("Flutterwave verify transfer:", data);
    return data;
  } catch (error) {
    console.error("Flutterwave verify transfer network error:", (error as Error).message);
    return { status: "network_error", message: "Network error connecting to payment gateway" };
  }
}