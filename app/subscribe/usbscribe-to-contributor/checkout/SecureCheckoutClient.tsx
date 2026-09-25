"use client";

import React, { useEffect, useState } from "react";
import {
  Lock,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/components/useRouter";
import { fetchCourseById } from "@/lib/api/courses";
import { payForCourse } from "@/lib/api/payments";
import { fetchWallet } from "@/lib/api/wallet";
import { useUser } from "@/context/UserContext";
import { getContributor, getMyContributor } from "@/lib/api/contributors";
import { Contributor } from "@/lib/services/contributors.service";
import { fetchAllPosts } from "@/lib/api/courses";
import { addCourseToLibrary, addSubscriptionsCoursesToLibrary } from "@/lib/api/library";
import { fetchLibrary } from "@/lib/api/library";
import { checkSubscriptionAccess } from "@/lib/api/subscriptions";

type CheckoutCourse = {
  id: string;
  title: string;
  price: number;
  user: string;
  alreadyOwned?: boolean; // true if already paid/actively subscribed
};

export default function SecureCheckoutPage() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("courses");
  const type = searchParams.get("type");
  const courseIds = idsParam ? idsParam.split(",") : [];


  const [courses, setCourses] = useState<CheckoutCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [showFreeModal, setShowFreeModal] = React.useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"wallet" | "flutterwave">("flutterwave");
  const { user } = useUser()
  const [contributor, setContributor] = useState<Contributor>()
  const [showPaymentTransferModal, setShowPaymentTransferModal] = useState(false)
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false)

  const router = useRouter();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);

        const results: CheckoutCourse[] = [];

        for (const id of courseIds) {
          try {
            const course = await fetchCourseById(id);

            let finalPrice = 0;
            try {
              if (course?.price && typeof course.price === 'string' && course.price.includes('{')) {
                const priceData = JSON.parse(course.price);
                finalPrice = priceData.isFree ? 0 : (priceData.amount || 0);
                if (priceData.type === "one-time") {
                  finalPrice = finalPrice * (course?.pageCount || 0);
                }
              } else if (course?.price) {
                finalPrice = Number(course.price) || 0;
              }
            } catch (e) {}




            results.push({
              id: course.id,
              title: course.title,
              price: finalPrice,
              user: typeof course.user === 'object' ? course.user?.id : (course.user || course.userId),
              alreadyOwned: false, // resolved below
            });

          } catch (err) {
            console.error("Failed to fetch course:", id, err);
          }
        }

        // ✅ Guardrail: check if user already owns/has active sub for each course
        if (user?.$id) {
          try {
            const lib = (await fetchLibrary(user.$id)).wallet;
            const oneTimeIds: string[] = lib?.oneTime ? JSON.parse(lib.oneTime) : [];
            const subIds: string[] = lib?.subscription ? JSON.parse(lib.subscription) : [];

            for (const c of results) {
              if (type === "one-time") {
                c.alreadyOwned = oneTimeIds.includes(c.id);
              } else if (type === "subscription") {
                if (subIds.includes(c.id)) {
                  // Only blocked if subscription doc is still active
                  const isActive = await checkSubscriptionAccess(user.$id, c.id).catch(() => false);
                  c.alreadyOwned = isActive;
                }
              }
            }
          } catch (err) {
            console.error("Ownership check failed:", err);
          }
        }

        setCourses(results);

        const res = await getMyContributor(results[0].user)
        if (!res) return;
        setContributor(res);


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
    
    // Save current checkout URL for the Failed page to redirect back
    if (typeof window !== "undefined") {
      localStorage.setItem("lastCheckoutUrl", window.location.href);
    }
  }, [idsParam, user?.$id]);

  const total = courses.reduce((sum, c) => sum + c.price, 0);
  const isFreeFlow = total === 0;

  const [processingFree, setProcessingFree] = useState(false);

  const handleShowModel = async () => {
    if (isFreeFlow) {
      setShowFreeModal(true);
      if (!user) return;
      if (!type) return;
      const ids = courses.map((c) => c.id);
      try {
        setProcessingFree(true);
        if (type === "subscription") {
          await addSubscriptionsCoursesToLibrary(user.$id, ids);
        } else {
          await addCourseToLibrary(user.$id, ids, type);
        }
      } catch (err) {
        console.error("Free addition failed:", err);
      } finally {
        setProcessingFree(false);
      }
      return;
    }

    setShowConfirmPaymentModal(true);
  }

  const handleInitiatePayment = () => {
    setShowConfirmPaymentModal(false);
    if (selectedPaymentMethod === "flutterwave") {
      setShowPaymentTransferModal(true);
    } else if (selectedPaymentMethod === "wallet") {
      handleConfirm();
    }
  }

  const handleConfirm = async () => {
    if (courses.length === 0 || !user?.$id || !user?.email) return;

    try {
      setShowPaymentTransferModal(false);
      setLoading(true);
      const ids = courses.map((c) => c.id);
      
      const paymentType = type || "one-time";
      const contributorId = contributor?.$id || courses[0]?.user;
      
      if (!contributorId) {
        console.error("Missing contributor ID");
        return;
      }

      if (selectedPaymentMethod === "wallet") {
        setShowPaymentModal(true);
        const res = await payForCourse(ids, user.$id, user.email, "wallet", paymentType, contributorId);
        if (res.success) {
          router.push("/subscribe/usbscribe-to-contributor/success");
        } else {
          router.push("/subscribe/usbscribe-to-contributor/failed");
        }
        setShowPaymentModal(false);
      } else {
        const res = await payForCourse(ids, user.$id, user.email, "flutterwave", paymentType, contributorId);
        if (res.checkoutUrl) {
          window.location.href = res.checkoutUrl;
        }
      }
    } catch (err) {
      console.error("Payment failed:", err);
      setShowPaymentModal(false);
      router.push("/subscribe/usbscribe-to-contributor/failed");
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-transparent flex justify-center px-4 py-8">
      <div className="w-full max-w-lg space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black dark:bg-white">
            <Lock size={18} className="text-white dark:text-black" />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Checkout
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ED-Library {type === "subscription" ? "Subscription" : "Course Payment"}
            </p>
          </div>
        </div>

        {/* Courses */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400">
            Selected Courses
          </div>

          <div>
            {courses.map((course, index) => (
              <div
                key={course.id}
                className={`flex items-center justify-between px-4 py-4 ${index !== courses.length - 1
                  ? "border-b border-gray-100 dark:border-gray-800"
                  : ""
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <BookOpen size={16} className="text-gray-600 dark:text-gray-400" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {course.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {type === "subscription" ? "Monthly access" : "FullTime Access"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {course.alreadyOwned ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#dcfce7", color: "#166534" }}>
                      {type === "subscription" ? "Active" : "Owned"}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {course.price === 0 ? "Free" : `₦${course?.price?.toLocaleString()}`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Total</span>
            <span>₦{total?.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-base font-semibold text-gray-900 dark:text-white">
            <span>Amount to pay</span>
            <span>
              ₦{total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col gap-5 w-full">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Payment Method
          </h3>

          {/* Wallet Option */}
          <div
            className={`flex flex-col p-4 rounded-xl border-2 transition-all ${
              selectedPaymentMethod === "wallet"
                ? "border-black dark:border-white bg-gray-50 dark:bg-gray-900"
                : "border-gray-200 dark:border-gray-800 bg-transparent"
            }`}
            style={{ opacity: (!wallet || wallet.balance < total) ? 0.75 : 1 }}
          >
            <label
              className={`flex items-center gap-3 m-0 ${(!wallet || wallet.balance < total) ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="wallet"
                checked={selectedPaymentMethod === "wallet"}
                onChange={(e) => setSelectedPaymentMethod(e.target.value as "wallet" | "flutterwave")}
                disabled={!wallet || wallet.balance < total}
                className="w-5 h-5 accent-black dark:accent-white cursor-inherit"
              />
              <span className="text-[0.95rem] font-semibold text-gray-900 dark:text-white">
                Wallet
              </span>
            </label>

            {wallet ? (
              <div className="ml-[32px] mt-2 text-[0.85rem] text-gray-600 dark:text-gray-400 flex flex-col gap-2">
                <div>
                  Balance: ₦{wallet?.balance?.toLocaleString()}
                  {wallet?.balance < total && (
                    <span className="text-red-600 dark:text-red-400 font-semibold ml-2 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-xl text-xs">
                      Insufficient balance
                    </span>
                  )}
                </div>

                {wallet?.balance < total && (
                  <div>
                    <button
                      onClick={() => router.push("/wallet/topup")}
                      className="bg-transparent border-none text-black dark:text-white p-0 text-[0.85rem] font-semibold cursor-pointer text-left underline underline-offset-[3px]"
                    >
                      Top Up Wallet
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-[32px] mt-2">
                <button
                  onClick={() => router.push("/wallet/create")}
                  className="bg-transparent border-none text-black dark:text-white p-0 text-[0.85rem] font-semibold cursor-pointer text-left underline underline-offset-[3px]"
                >
                  Create Wallet
                </button>
              </div>
            )}
          </div>

          {/* Flutterwave Option */}
          <div
            className={`flex flex-col p-4 rounded-xl border-2 transition-all ${
              selectedPaymentMethod === "flutterwave"
                ? "border-black dark:border-white bg-gray-50 dark:bg-gray-900"
                : "border-gray-200 dark:border-gray-800 bg-transparent"
            }`}
          >
            <label className="flex items-center gap-3 cursor-pointer m-0">
              <input
                type="radio"
                name="paymentMethod"
                value="flutterwave"
                checked={selectedPaymentMethod === "flutterwave"}
                onChange={(e) => setSelectedPaymentMethod(e.target.value as "wallet" | "flutterwave")}
                className="w-5 h-5 accent-black dark:accent-white cursor-inherit"
              />
              <span className="text-[0.95rem] font-semibold text-gray-900 dark:text-white">
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
                  fill="currentColor"
                  className="text-black dark:text-white"
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

        {showPaymentTransferModal && (
          <div
            onClick={() => setShowPaymentTransferModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              zIndex: 1000,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 400,
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Payment Information
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                You will be redirected to complete your payment.
                If you are paying via bank transfer, the account name may appear as:
              </p>

              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Blessed Okori (ED-Library)
                </p>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                This is the official payment account for ED-Library.
                Please proceed only if the details match.
              </p>

              <button
                onClick={handleConfirm}
                className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold"
              >
                Continue
              </button>
            </div>
          </div>
        )}


        {showFreeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]">
            <div className="w-full max-w-[400px] bg-white dark:bg-gray-900 rounded-2xl p-8 text-center shadow-2xl border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                You're Good to Go
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                The selected course{courses.length > 1 ? "s are" : " is"} free.
                You can start learning immediately.
              </p>

              <button
                disabled={processingFree}
                onClick={() => {
                  setShowFreeModal(false);
                  router.replace('/library');
                }}
                className="w-full py-3.5 rounded-xl text-white dark:text-black font-semibold text-base bg-black dark:bg-white transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {processingFree ? "Preparing your library..." : "Go to Courses"}
              </button>
            </div>
          </div>
        )}

        {/* CTA */}
        {(() => {
          const allOwned = courses.length > 0 && courses.every((c) => c.alreadyOwned);
          return (
            <>
              {allOwned && (
                <div className="text-center text-sm font-medium rounded-xl py-3 px-4" style={{ backgroundColor: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
                  {type === "subscription"
                    ? "You already have an active subscription for all selected courses."
                    : "You already own all selected courses."}
                </div>
              )}
              <button
                onClick={handleShowModel}
                disabled={courses.length === 0 || allOwned}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
                  (courses.length === 0 || allOwned)
                    ? "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "bg-black dark:bg-white text-white dark:text-black cursor-pointer hover:bg-gray-900 dark:hover:bg-gray-100"
                }`}
              >
                <CheckCircle2 size={18} />
                Confirm Payment
              </button>
            </>
          );
        })()}

        {/* Cancel */}
        <button className="w-full py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 transition">
          Cancel
        </button>
      </div>

      {/* Confirm Payment Modal (from CourseDetailsClient) */}
      {showConfirmPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowConfirmPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white transition"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Confirm Payment</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              You are about to purchase <strong>{courses.map(c => c.title).join(", ")}</strong> for NGN {total.toLocaleString()}.
              A transaction fee of NGN 50 will be applied.
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 mb-6 border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Course Price</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">NGN {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Transaction Fee</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">NGN 50</span>
              </div>
              <div className="h-px bg-gray-200 dark:bg-gray-800 my-3"></div>
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                <span className="text-lg font-black text-gray-900 dark:text-white">NGN {(total + 50).toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handleInitiatePayment}
              className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-2xl transition hover:opacity-90"
            >
              Pay Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}