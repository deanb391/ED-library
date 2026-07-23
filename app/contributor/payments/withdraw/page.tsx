"use client";

import React, { useEffect, useState } from 'react';
import {
  Menu,
  CheckCircle2,
  Wallet,
  Landmark,
  ChevronRight,
  Send,
  Info,
  LayoutGrid,
  BarChart3,
  Banknote
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { fetchWallet, fetchWithdrawalHistory, updateWalletAccount, Wallet as WalletType, withdraw, verifyPendingWithdrawals } from '@/lib/api/wallet';

// --- Dummy Data ---
const RECENT_WITHDRAWALS = [
  {
    id: 1,
    type: 'Bank Transfer',
    date: 'Oct 12, 2023',
    amount: '-$500.00',
    status: 'Completed',
  },
  {
    id: 2,
    type: 'Bank Transfer',
    date: 'Sep 05, 2023',
    amount: '-$1,250.00',
    status: 'Completed',
  },
  {
    id: 3,
    type: 'Bank Transfer',
    date: 'Aug 20, 2023',
    amount: '-$800.00',
    status: 'Completed',
  },
];



const bankCodes: Record<string, string> = {
  "Access Bank": "044",
  "Citibank": "023",
  "Ecobank": "050",
  "Fidelity Bank": "070",
  "First Bank of Nigeria": "011",
  "First City Monument Bank (FCMB)": "214",
  "Guaranty Trust Bank (GTBank)": "058",
  "Heritage Bank": "030",
  "Keystone Bank": "082",
  "Lotus Bank": "303",
  "Moniepoint": "090405",
  "OPay": "100004",
  "PalmPay": "100033",
  "Premium Trust Bank": "105",
  "Polaris Bank": "076",
  "Stanbic IBTC Bank": "221",
  "Standard Chartered Bank": "068",
  "Sterling Bank": "232",
  "SunTrust Bank": "100",
  "Union Bank": "032",
  "United Bank for Africa (UBA)": "033",
  "Unity Bank": "215",
  "VFD Microfinance Bank": "090110",
  "Wema Bank": "035",
  "Zenith Bank": "057",
};

export function getBankCode(bankName: string): string | null {
  const code = bankCodes[bankName];
  if (!code) {
    console.warn(`Bank code not found for: "${bankName}"`);
    return null;
  }
  return code;
}

const bankNamesByCode: Record<string, string> = Object.entries(bankCodes).reduce(
  (acc, [name, code]) => {
    acc[code] = name;
    return acc;
  },
  {} as Record<string, string>
);

function getBankName(bankCode: string): string | null {
  const name = bankNamesByCode[bankCode];

  if (!name) {
    console.warn(`Bank name not found for code: "${bankCode}"`);
    return null;
  }

  return name;
}


const BRAND_BLUE = "#2563EB";

export default function WithdrawPage() {
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  type WithdrawalStatus = "pending" | "successful" | "failed";
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bank, setBank] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [receipt, setReceipt] = useState<any>()
  const [showReceipt, setShowReceipt] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showFailedVerification, setShowFailedVerification] = useState(false);


  const MIN_WITHDRAWAL = 100;

  let isValidAmount = (Number(amount) >= MIN_WITHDRAWAL);

  const { user } = useUser()

  useEffect(() => {
    async function loadWallet() {
      if (!user?.$id) return;

      try {

        const [res1, ses2] = await Promise.all(
          [
            fetchWallet(user.$id),
            fetchWithdrawalHistory(user.$id)
          ]
        )
        setWallet(res1.wallet);
        setHistory(ses2)

        const account = JSON.parse(res1.wallet.cashout_account);
        setBank(account.bank);
        setAccountName(account.name)
        setAccountNumber(account.number)
      } catch (err) {
        console.error("Failed to fetch wallet:", err);
      } finally {
        setLoading(false);
      }
    }

    loadWallet();
  }, [user]);

  const parsedAmount = Number(amount);

  const hasValidAmount =
    !isNaN(parsedAmount) &&
    parsedAmount >= MIN_WITHDRAWAL &&
    wallet?.balance &&
    parsedAmount <= wallet.balance;

  const feeBreakdown =
    hasValidAmount ? calculateWithdrawal(parsedAmount) : null;

  const handleWithdraw = async () => {
    if (!user?.$id || !amount) return;

    try {
      setWithdrawing(true);
      const response = await withdraw(
        user?.$id,
        amount
      )
      console.log("Response: ", response);

      if (response.error) {
        alert("Error: " + response.error);
        setWithdrawing(false);
        return;
      }

      const { success, receipt, error, message } = response.wallet || {};

      if (error && !receipt) {
        alert("Error: " + error);
        setWithdrawing(false);
        return;
      }

      if (!receipt) {
        alert("Unknown error occurred");
        setWithdrawing(false);
        return;
      }

      // Optional: display message if any
      if (message) {
        console.log("Status Message:", message);
      }

      setWithdrawing(false)
      setReceipt(receipt)
      setShowReceipt(true)

      // Optional: Refresh wallet balance and history
      const [walletRes, historyRes] = await Promise.all([
        fetchWallet(user.$id),
        fetchWithdrawalHistory(user.$id)
      ]);
      if (walletRes.wallet) setWallet(walletRes.wallet);
      if (historyRes) setHistory(historyRes);

    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred. Please try again.");
      setWithdrawing(false);
    }
  }

  function calculateWithdrawal(amount: number) {
    const ed_cut = 0.05 * amount;
    const before_cut = 0.95 * amount;

    let flutter_charge = 10.8;

    if (before_cut - flutter_charge > 5000 && before_cut - flutter_charge < 50000) {
      flutter_charge = 26.9;
    } else if (before_cut - flutter_charge > 50000) {
      flutter_charge = 53.8;
    }

    const charges = flutter_charge + ed_cut;
    const net = before_cut - flutter_charge;

    return {
      ed_cut,
      flutter_charge,
      charges,
      net,
      before_cut,
    };
  }

  const handleSaveAccount = async () => {
    if (!user?.$id) return;

    const payload = JSON.stringify({
      name: accountName,
      number: accountNumber,
      bank: getBankName(bank),
    });

    try {
      setSaving(true);
      setShowFailedVerification(false);
      const res = await updateWalletAccount(user.$id, accountNumber, bank, accountName);

      if (!res.wallet.success) {
        console.log(res)
        setShowFailedVerification(true)
        return;
      }



      setWallet((prev) =>
        prev ? { ...prev, cashout_account: res.wallet.value.cashout_account } : prev
      );


      setBank(JSON.parse(res.wallet.value.cashout_account).bank);
      setAccountName(JSON.parse(res.wallet.value.cashout_account).name)
      setAccountNumber(JSON.parse(res.wallet.value.cashout_account).number)
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save account:", err);
    } finally {
      setSaving(false);
    }
  };

  const cashout = wallet?.cashout_account
    ? JSON.parse(wallet.cashout_account)
    : null;


  const getStatusMeta = (status: WithdrawalStatus) => {
    switch (status) {
      case "pending":
        return {
          title: "Processing Withdrawal",
          color: "#f59e0b",
          message:
            "Your transaction is being processed. Please wait. If it fails, the amount will be refunded to your wallet.",
        };

      case "successful":
        return {
          title: "Withdrawal Successful",
          color: "#16a34a",
          message:
            "Your specified account has been credited successfully.",
        };

      case "failed":
        return {
          title: "Withdrawal Failed",
          color: "#dc2626",
          message:
            "Your transaction failed. The amount has been refunded to your wallet.",
        };

      default:
        return {
          title: "Withdrawal",
          color: "#6b7280",
          message: "",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
        <p className="text-gray-700 dark:text-gray-300 text-sm">Loading, please wait...</p>
      </div>
    );
  }

  if (withdrawing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
        <p className="text-gray-700 dark:text-gray-300 text-sm">Processing, please wait...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: "#111827",
        paddingBottom: "5rem",
        boxSizing: "border-box"
      }}
    >
      {/* --- Main Content --- */}
      <main
        style={{
          flex: "1 1 auto",
          width: "100%",
          maxWidth: "672px", // Limits width on desktop
          margin: "0 auto",
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          boxSizing: "border-box"
        }}
      >
        {/* Page Header */}
        <div>
          <h2
            style={{
              fontSize: "1.875rem",
              fontWeight: "800",
              color: "#111827",
              margin: "0 0 0.5rem 0",
              letterSpacing: "-0.025em"
            }}
          >
            Withdraw Funds
          </h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#6b7280",
              margin: 0,
              lineHeight: 1.625,
              paddingRight: "1rem"
            }}
          >
            Manage your course earnings and transfer funds to your linked account.
          </p>
        </div>

        {/* Card 1: Available Balance */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "1.5rem", // 24px
            padding: "1.5rem",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            border: "1px solid #f3f4f6",
            position: "relative",
            boxSizing: "border-box"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "1.5rem",
              right: "1.5rem",
              width: "2rem",
              height: "2rem",
              backgroundColor: "#eff6ff",
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: BRAND_BLUE || "#2563eb"
            }}
          >
            <Wallet size={16} strokeWidth={2.5} />
          </div>

          <h3
            style={{
              fontSize: "0.75rem",
              fontWeight: "700",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              margin: "0 0 0.75rem 0"
            }}
          >
            Available Balance
          </h3>

          <div
            style={{
              fontSize: "2.25rem", // Responsive scaling is tricky in pure inline, 2.25rem works great for all
              fontWeight: "800",
              color: "#111827",
              letterSpacing: "-0.025em",
              margin: "0 0 1rem 0"
            }}
          >
            NGN {wallet?.balance?.toLocaleString() || "0"}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#4b5563",
              fontSize: "0.875rem"
            }}
          >
            <CheckCircle2 size={16} fill="#10B981" color="white" />
            <span>Min. withdrawal: ₦100</span>
          </div>
        </div>

        {/* Card 2: Initiate Transfer Form */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "1.5rem",
            padding: "1.5rem",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            border: "1px solid #f3f4f6",
            boxSizing: "border-box"
          }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "700",
              color: "#111827",
              margin: "0 0 1.5rem 0"
            }}
          >
            Initiate Transfer
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Amount Input */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                  margin: "0 0 0.5rem 0"
                }}
              >
                Withdrawal Amount
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.75rem",
                  padding: "0.875rem 1rem",
                  backgroundColor: "#ffffff",
                  boxSizing: "border-box"
                }}
              >
                <span style={{ color: "#6b7280", fontWeight: "500", marginRight: "0.5rem" }}>
                  NGN
                </span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    flex: "1 1 auto",
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#111827",
                    fontSize: "1rem"
                  }}
                />
                <span style={{ color: "#6b7280", fontWeight: "500", marginLeft: "0.5rem" }}>
                  NGN
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "0.5rem",
                  padding: "0 0.25rem"
                }}
              >
                <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  Min. withdrawal: NGN 100
                </span>
                <button
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: BRAND_BLUE || "#2563eb",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  Withdraw All
                </button>
              </div>

              {feeBreakdown && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.75rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                      Amount
                    </span>
                    <strong style={{ fontSize: "0.85rem" }}>
                      ₦{parsedAmount.toLocaleString()}
                    </strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                      Charges
                    </span>
                    <strong style={{ fontSize: "0.85rem", color: "#dc2626" }}>
                      -₦{feeBreakdown.charges.toLocaleString()}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: "0.25rem",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      You receive
                    </span>
                    <strong style={{ fontSize: "0.9rem", color: "#16a34a" }}>
                      ₦{feeBreakdown.net.toLocaleString()}
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* Destination Selector */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                  margin: "0 0 0.5rem 0"
                }}
              >
                Transfer Destination
              </label>
              {cashout ? (
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    boxSizing: "border-box"
                  }}
                >
                  <p style={{ fontSize: "0.875rem", fontWeight: "600", margin: "0 0 0.25rem 0" }}>
                    {cashout.name}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>
                    {cashout.bank} • {cashout.number}
                  </p>

                  <button
                    onClick={() => setShowModal(true)}
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: BRAND_BLUE || "#2563eb",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0
                    }}
                  >
                    Edit
                  </button>

                </div>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: BRAND_BLUE || "#2563eb",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  Add Cashout Account
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={() => handleWithdraw()}
              disabled={!hasValidAmount || !wallet?.cashout_account}
              style={{
                width: "100%",
                backgroundColor: (!hasValidAmount || !wallet?.cashout_account) ? "#9ca3af" : (BRAND_BLUE || "#2563eb"),
                color: "#ffffff",
                fontWeight: "700",
                padding: "0.875rem",
                borderRadius: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                border: "none",
                cursor: (!isValidAmount || !wallet?.cashout_account) ? "not-allowed" : "pointer",
                marginTop: "0.5rem",
                transition: "all 0.2s ease-in-out"
              }}
            >
              <Send size={18} />
              Withdraw Funds
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div
          style={{
            backgroundColor: "#eff6ff",
            border: "1px solid #dbeafe",
            borderRadius: "1rem",
            padding: "1.25rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            boxSizing: "border-box"
          }}
        >
          <div style={{ color: BRAND_BLUE || "#2563eb", flexShrink: 0, marginTop: "0.125rem" }}>
            <Info size={20} fill="currentColor" color="white" />
          </div>
          <div>
            <h4 style={{ fontSize: "0.875rem", fontWeight: "700", color: "#1e3a8a", margin: "0 0 0.25rem 0" }}>
              Processing Times
            </h4>
            <p style={{ fontSize: "0.875rem", color: "#1e40af", opacity: 0.9, lineHeight: 1.625, margin: 0 }}>
              Standard bank transfers typically take 1-3 business days to appear in your account. Withdrawals requested after 5 PM EST will begin processing the next business day.
            </p>
          </div>
        </div>

        {/* Card 3: Recent Withdrawals */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "1.5rem",
            padding: "1.5rem",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            border: "1px solid #f3f4f6",
            marginBottom: "1rem",
            boxSizing: "border-box"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem"
            }}
          >
            <h3 style={{ fontSize: "1.125rem", fontWeight: "700", color: "#111827", margin: 0 }}>
              Recent Withdrawals
            </h3>
            <button
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                color: BRAND_BLUE || "#2563eb",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0
              }}
            >
              View All
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {history?.map((tx) => (
              <div key={tx.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                onClick={() => {
                  setReceipt(tx);
                  setShowReceipt(true)
                }}
              >
                <div>
                  <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#111827", margin: 0 }}>
                    Withdrawal
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.125rem 0 0 0" }}>
                    {new Date(tx.$createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "1.2rem", fontWeight: "700", color: "#111827", margin: 0 }}>
                    {tx.amount}
                  </p>
                  <p style={{ fontSize: "10px", fontWeight: "600", color: tx.status === "successful" ? "#059669" : "red", margin: "0.125rem 0 0 0" }}>
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
            boxSizing: "border-box"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "1rem",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "384px", // max-w-sm
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              boxSizing: "border-box",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <h3 style={{ fontWeight: "700", fontSize: "1.125rem", margin: 0 }}>
              Add Bank Account
            </h3>

            <input
              placeholder="Account Name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                padding: "0.75rem",
                boxSizing: "border-box",
                outline: "none",
                fontSize: "1rem"
              }}
            />

            <input
              placeholder="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                padding: "0.75rem",
                boxSizing: "border-box",
                outline: "none",
                fontSize: "1rem"
              }}
            />

            <select
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                padding: "0.75rem",
                boxSizing: "border-box",
                outline: "none",
                fontSize: "1rem",
                backgroundColor: "#ffffff"
              }}
            >
              <option value="">Select Bank</option>

              <option value="044">Access Bank</option>
              <option value="023">Citibank</option>
              <option value="050">Ecobank</option>
              <option value="070">Fidelity Bank</option>
              <option value="011">First Bank of Nigeria</option>
              <option value="214">First City Monument Bank (FCMB)</option>
              <option value="058">Guaranty Trust Bank (GTBank)</option>
              <option value="030">Heritage Bank</option>
              <option value="082">Keystone Bank</option>
              <option value="303">Lotus Bank</option>
              <option value="090405">Moniepoint</option>
              <option value="100004">OPay</option>
              <option value="100033">PalmPay</option>
              <option value="105">Premium Trust Bank</option>
              <option value="076">Polaris Bank</option>
              <option value="221">Stanbic IBTC Bank</option>
              <option value="068">Standard Chartered Bank</option>
              <option value="232">Sterling Bank</option>
              <option value="100">SunTrust Bank</option>
              <option value="032">Union Bank</option>
              <option value="033">United Bank for Africa (UBA)</option>
              <option value="215">Unity Bank</option>
              <option value="090110">VFD Microfinance Bank</option>
              <option value="035">Wema Bank</option>
              <option value="057">Zenith Bank</option>

            </select>

            {
              showFailedVerification && (
                <div style={{ padding: 5, color: "red", fontSize: 12 }}>
                  We couldn't verify this account, please check your details or try a different account.
                </div>
              )
            }

            <button
              onClick={handleSaveAccount}
              disabled={saving}
              style={{
                width: "100%",
                backgroundColor: BRAND_BLUE || "#2563eb",
                color: "#ffffff",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "none",
                fontWeight: "600",
                cursor: saving ? "not-allowed" : "pointer",
                marginTop: "0.5rem",
                transition: "opacity 0.2s",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving..." : "Save Account"}
            </button>
          </div>
        </div>
      )}

      {showReceipt && receipt && (() => {
        const meta = getStatusMeta(receipt.status);


        const amount = receipt.amount ?? 0;
        const ed_cut = 0.05 * amount;
        const before_cut = 0.95 * amount;
        let flutter_charge = 10.8;
        if (((before_cut - flutter_charge) > 5000) && ((before_cut - flutter_charge) < 50000)) {
          flutter_charge = 26.9
        } else if ((before_cut - flutter_charge > 50000)) {
          flutter_charge = 53.8
        }
        const net = before_cut - flutter_charge
        const charges = flutter_charge + ed_cut;

        return (
          <div
            onClick={() => setShowModal(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: "1rem",
              boxSizing: "border-box",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "1rem",
                padding: "1.5rem",
                width: "100%",
                maxWidth: "384px",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                boxSizing: "border-box",
                boxShadow:
                  "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              }}
            >
              {/* Header */}
              <div>
                <h3 style={{ fontWeight: 700, fontSize: "1.125rem", margin: 0 }}>
                  {meta.title}
                </h3>

                <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: meta.color }}>
                  {receipt.status.toUpperCase()}
                </p>
              </div>

              {/* Amount section */}
              <div
                style={{
                  padding: "0.75rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "#f9fafb",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Amount</span>
                  <strong>₦{amount.toLocaleString()}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Charges</span>
                  <strong>₦{charges.toLocaleString()}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Net</span>
                  <strong>₦{net.toLocaleString()}</strong>
                </div>
              </div>

              {/* Description (optional field) */}
              {receipt.description && (
                <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                  {receipt.description}
                </div>
              )}

              {/* Status message block */}
              <div
                style={{
                  padding: "0.75rem",
                  borderRadius: "0.75rem",
                  backgroundColor:
                    receipt.status === "pending"
                      ? "#fffbeb"
                      : receipt.status === "successful"
                        ? "#ecfdf5"
                        : "#fef2f2",
                  fontSize: "0.85rem",
                  lineHeight: 1.4,
                }}
              >
                {meta.message}
              </div>

              {/* Timestamp */}
              <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                {new Date(receipt.$createdAt).toLocaleString()}
              </div>

              {receipt.status === "pending" && (
                <button
                  onClick={async () => {
                    setWithdrawing(true);
                    try {
                      await verifyPendingWithdrawals();
                      const [walletRes, historyRes] = await Promise.all([
                        fetchWallet(user?.$id || ""),
                        fetchWithdrawalHistory(user?.$id || "")
                      ]);
                      if (walletRes.wallet) setWallet(walletRes.wallet);
                      if (historyRes) {
                        setHistory(historyRes);
                        const updatedReceipt = historyRes.find((r: any) => r.$id === receipt.$id);
                        if (updatedReceipt) setReceipt(updatedReceipt);
                      }
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setWithdrawing(false);
                    }
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: "#f59e0b",
                    color: "#ffffff",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Refresh Status
                </button>
              )}

              {/* Close button */}
              <button
                onClick={() => setShowReceipt(false)}
                style={{
                  width: "100%",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}