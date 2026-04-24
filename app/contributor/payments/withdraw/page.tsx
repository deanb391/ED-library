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
import { fetchWallet, updateWalletAccount, Wallet as WalletType, withdraw } from '@/lib/api/wallet';

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


const BRAND_BLUE = "#2563EB";

export default function WithdrawPage() {
  const [amount, setAmount] = useState('1000');
  const [saving, setSaving] = useState(false);

  const [wallet, setWallet] = useState<WalletType | null>(null);
const [loading, setLoading] = useState(true);
const [showModal, setShowModal] = useState(false);
const [accountName, setAccountName] = useState("");
const [accountNumber, setAccountNumber] = useState("");
const [bank, setBank] = useState("");
const [withdrawing, setWithdrawing] = useState(false);

const MIN_WITHDRAWAL = 100;

const isValidAmount = Number(amount) >= MIN_WITHDRAWAL;

  const { user } = useUser()

useEffect(() => {
  async function loadWallet() {
    if (!user?.$id) return;

    try {
      const res = await fetchWallet(user.$id);
      setWallet(res.wallet);
      const account = JSON.parse(res.wallet.cashout_account);
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

const handleWithdraw = async () => {
  if (!user?.$id || !amount) return;

  try {
    setWithdrawing(true);
    const response = await withdraw(
      user?.$id,
      amount
    )
  } catch (error) {
    setWithdrawing(false);
  }
}

const handleSaveAccount = async () => {
  if (!user?.$id) return;

  const payload = JSON.stringify({
    name: accountName,
    number: accountNumber,
    bank,
  });

  try {
    setSaving(true);
    await updateWalletAccount(user.$id, accountNumber, bank, accountName);

    setWallet((prev) =>
      prev ? { ...prev, cashout_account: payload } : prev
    );

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

if (loading) {
    return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
    <p className="text-gray-700 text-sm">Loading, please wait...</p>
  </div>
);
   }

  return (
    <div
  style={{
    minHeight: "100vh",
    backgroundColor: "#F8F9FB",
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
        <span>Min. withdrawal: ₦1,000</span>
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
              Min. withdrawal: NGN 1,000
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
          disabled={!isValidAmount || !wallet?.cashout_account}
          style={{
            width: "100%",
            backgroundColor: (!isValidAmount || !wallet?.cashout_account) ? "#9ca3af" : (BRAND_BLUE || "#2563eb"),
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
        {RECENT_WITHDRAWALS.map((tx) => (
          <div key={tx.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "#111827", margin: 0 }}>
                {tx.type}
              </p>
              <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.125rem 0 0 0" }}>
                {tx.date}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "0.875rem", fontWeight: "700", color: "#111827", margin: 0 }}>
                {tx.amount}
              </p>
              <p style={{ fontSize: "10px", fontWeight: "600", color: "#059669", margin: "0.125rem 0 0 0" }}>
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

          <option value="opay">Opay</option>
        </select>

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
</div>
  );
}