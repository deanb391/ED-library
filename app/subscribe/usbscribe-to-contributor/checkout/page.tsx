"use client";

import React, { useEffect, useState } from "react";
import {
  Lock,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchCourse } from "@/lib/api/courses";
import { payForCourse } from "@/lib/api/payments";
import { fetchWallet } from "@/lib/api/wallet";
import { useUser } from "@/context/UserContext";

const BRAND_BLUE = "#1C64F2";

type CheckoutCourse = {
  id: string;
  title: string;
  price: number;
};

export default function SecureCheckoutPage() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("courses");
  const courseIds = idsParam ? idsParam.split(",") : [];

  const [courses, setCourses] = useState<CheckoutCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [showFreeModal, setShowFreeModal] = React.useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"wallet" | "flutterwave">("flutterwave");
  const {user} = useUser()

  const router = useRouter();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);

        const results: CheckoutCourse[] = [];

        for (const id of courseIds) {
          try {
            const course = await fetchCourse(id);

            const priceData = course?.price
              ? JSON.parse(course.price)
              : null;

            results.push({
              id: course.id,
              title: course.title,
              price: priceData?.isFree ? 0 : priceData?.amount || 0,
            });
          } catch (err) {
            console.error("Failed to fetch course:", id, err);
          }
        }

        setCourses(results);
      } catch (err) {
        console.error("Checkout fetch failed:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    const loadWallet = async () => {
      try {
        if (user?.$id) {
          const walletData = await fetchWallet(user.$id);
          console.log("Waller=t, ", walletData.wallet)
          setWallet(walletData.wallet);
        }
      } catch (err) {
        console.error("Wallet fetch failed:", err);
      }
    };

    if (courseIds.length > 0) {
      loadCourses();
    } else {
      setLoading(false);
    }

    loadWallet();
  }, [idsParam, user?.$id]);

  const total = courses.reduce((sum, c) => sum + c.price, 0);
  const isFreeFlow = total === 0;

const handleConfirm = async () => {
  if (courses.length === 0 || !user?.$id || !user?.email) return;

  try {
    setLoading(true);
    const ids = courses.map((c) => c.id);

    if (isFreeFlow) {
      setShowFreeModal(true);
      return
    }

    if (selectedPaymentMethod === "wallet") {
      setShowPaymentModal(true);
      const res = await payForCourse(ids, user.$id, user.email, "wallet", "subscription");
      if (res.success) {
        router.push("/subscribe/usbscribe-to-contributor/success");
      } else {
        router.push("/subscribe/usbscribe-to-contributor/failed");
      }
      setShowPaymentModal(false);
    } else {
      const res = await payForCourse(ids, user.$id, user.email, "flutterwave", "subscription");
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      }
    }
  } catch (err) {
    console.error("Payment failed:", err);
    setShowPaymentModal(false);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
        <p className="text-gray-700 text-sm">Loading, please wait...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex justify-center px-4 py-8">
      <div className="w-full max-w-lg space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: BRAND_BLUE }}
          >
            <Lock size={18} className="text-white" />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Checkout
            </h1>
            <p className="text-sm text-gray-500">
              ED-Library Subscription
            </p>
          </div>
        </div>

        {/* Courses */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 text-sm font-medium text-gray-500">
            Selected Courses
          </div>

          <div>
            {courses.map((course, index) => (
              <div
                key={course.id}
                className={`flex items-center justify-between px-4 py-4 ${
                  index !== courses.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                    <BookOpen size={16} className="text-gray-600" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {course.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Monthly access
                    </p>
                  </div>
                </div>

                <span className="text-sm font-semibold text-gray-900">
                  {course.price === 0
                    ? "Free"
                    : `₦${course?.price?.toLocaleString()}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Total</span>
            <span>₦{total?.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-base font-semibold text-gray-900">
            <span>Amount to pay</span>
            <span style={{ color: BRAND_BLUE }}>
              ₦{total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payment Method */}
        <div
  style={{
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    boxSizing: "border-box",
    width: "100%",
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }}
>
  <h3
    style={{
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#374151",
      margin: 0,
      textTransform: "uppercase",
      letterSpacing: "0.05em"
    }}
  >
    Payment Method
  </h3>

  {/* Wallet Option */}
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      padding: "1rem",
      border: selectedPaymentMethod === "wallet" ? "2px solid #2563eb" : "1px solid #e5e7eb",
      borderRadius: "12px",
      backgroundColor: selectedPaymentMethod === "wallet" ? "#eff6ff" : "transparent",
      opacity: (!wallet || wallet.balance < total) ? 0.75 : 1,
      transition: "all 0.2s ease-in-out"
    }}
  >
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        cursor: (!wallet || wallet.balance < total) ? "not-allowed" : "pointer",
        margin: 0
      }}
    >
      <input
        type="radio"
        name="paymentMethod"
        value="wallet"
        checked={selectedPaymentMethod === "wallet"}
        onChange={(e) => setSelectedPaymentMethod(e.target.value as "wallet" | "flutterwave")}
        disabled={!wallet || wallet.balance < total}
        style={{
          width: "18px",
          height: "18px",
          cursor: "inherit",
          accentColor: "#2563eb"
        }}
      />
      <span
        style={{
          fontSize: "0.95rem",
          fontWeight: "600",
          color: "#111827"
        }}
      >
        Wallet
      </span>
    </label>

    {wallet ? (
      <div
        style={{
          marginLeft: "30px", // Align perfectly with the label text, skipping the radio button
          marginTop: "0.5rem",
          fontSize: "0.85rem",
          color: "#4b5563",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem"
        }}
      >
        <div>
          Balance: ₦{wallet?.balance?.toLocaleString()}
          {wallet?.balance < total && (
            <span
              style={{
                color: "#dc2626",
                fontWeight: "600",
                marginLeft: "0.5rem",
                backgroundColor: "#fef2f2",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "0.75rem"
              }}
            >
              Insufficient balance
            </span>
          )}
        </div>
        
        {wallet?.balance < total && (
          <div>
            <button
              onClick={() => router.push("/wallet/topup")}
              style={{
                background: "none",
                border: "none",
                color: "#2563eb",
                padding: 0,
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer",
                textAlign: "left",
                textDecoration: "underline",
                textUnderlineOffset: "3px"
              }}
            >
              Top Up Wallet
            </button>
          </div>
        )}
      </div>
    ) : (
      <div
        style={{
          marginLeft: "30px",
          marginTop: "0.5rem"
        }}
      >
        <button
          onClick={() => router.push("/wallet/create")}
          style={{
            background: "none",
            border: "none",
            color: "#2563eb",
            padding: 0,
            fontSize: "0.85rem",
            fontWeight: "600",
            cursor: "pointer",
            textAlign: "left",
            textDecoration: "underline",
            textUnderlineOffset: "3px"
          }}
        >
          Create Wallet
        </button>
      </div>
    )}
  </div>

  {/* Flutterwave Option */}
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      padding: "1rem",
      border: selectedPaymentMethod === "flutterwave" ? "2px solid #2563eb" : "1px solid #e5e7eb",
      borderRadius: "12px",
      backgroundColor: selectedPaymentMethod === "flutterwave" ? "#eff6ff" : "transparent",
      transition: "all 0.2s ease-in-out"
    }}
  >
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        cursor: "pointer",
        margin: 0
      }}
    >
      <input
        type="radio"
        name="paymentMethod"
        value="flutterwave"
        checked={selectedPaymentMethod === "flutterwave"}
        onChange={(e) => setSelectedPaymentMethod(e.target.value as "wallet" | "flutterwave")}
        style={{
          width: "18px",
          height: "18px",
          cursor: "inherit",
          accentColor: "#2563eb"
        }}
      />
      <span
        style={{
          fontSize: "0.95rem",
          fontWeight: "600",
          color: "#111827"
        }}
      >
        Card / Bank Transfer
      </span>
    </label>
  </div>
</div>

        {showPaymentModal && (
          <div
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
    padding: "1rem",
    zIndex: 1000,
    boxSizing: "border-box",
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }}
>
  <div
    style={{
      width: "100%",
      maxWidth: "400px",
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "2rem",
      textAlign: "center",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      boxSizing: "border-box",
    }}
  >
    {/* Self-contained animated SVG spinner */}
    <svg
      style={{
        margin: "0 auto 1.25rem auto",
        width: "40px",
        height: "40px",
      }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="#e5e7eb"
        strokeWidth="4"
      ></circle>
      <path
        fill={BRAND_BLUE}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
    </svg>

    <h2
      style={{
        fontSize: "1.25rem",
        fontWeight: "600",
        color: "#111827",
        marginTop: 0,
        marginBottom: "0.5rem"
      }}
    >
      Processing Payment
    </h2>
    
    <p
      style={{
        fontSize: "0.875rem",
        color: "#4b5563",
        margin: 0,
        lineHeight: 1.5
      }}
    >
      Please wait while we process your wallet payment...
    </p>
  </div>
</div>
        )}

        {showFreeModal && (
          <div
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(4px)", // Adds a professional blur effect to the background
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    zIndex: 1000,
    boxSizing: "border-box",
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }}
>
  <div
    style={{
      width: "100%",
      maxWidth: "400px",
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "2rem",
      textAlign: "center",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      boxSizing: "border-box",
    }}
  >
    <h2
      style={{
        fontSize: "1.25rem",
        fontWeight: "600",
        color: "#111827",
        marginTop: 0,
        marginBottom: "0.5rem"
      }}
    >
      You're Good to Go
    </h2>

    <p
      style={{
        fontSize: "0.875rem",
        color: "#4b5563",
        margin: "0 0 1.5rem 0",
        lineHeight: 1.5
      }}
    >
      The selected course{courses.length > 1 ? "s are" : " is"} free.  
      You can start learning immediately.
    </p>

    <button
      onClick={() => {
        setShowFreeModal(false);
      }}
      style={{
        width: "100%",
        padding: "0.875rem",
        borderRadius: "12px",
        color: "#ffffff",
        fontWeight: "600",
        fontSize: "1rem",
        backgroundColor: BRAND_BLUE,
        border: "none",
        cursor: "pointer",
        transition: "opacity 0.2s ease-in-out"
      }}
    >
      Go to Courses
    </button>
  </div>
</div>
        )}

        {/* CTA */}
        <button
          onClick={handleConfirm}
          disabled={courses.length === 0}
          className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition"
          style={{
            backgroundColor: courses.length === 0 ? "#D1D5DB" : BRAND_BLUE,
            cursor: courses.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          <CheckCircle2 size={18} />
          Confirm Payment
        </button>

        {/* Cancel */}
        <button className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition">
          Cancel
        </button>
      </div>
    </div>
  );
}