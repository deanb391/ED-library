"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { verifyPremiumPayment } from "@/lib/api/premium";
import { PremiumSuccessOverlay, PremiumFailOverlay } from "@/components/PremiumOverlays";

function PremiumVerifyContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    if (!paymentId) {
      setSuccess(false);
      setVerifying(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await verifyPremiumPayment(paymentId);
        if (res.success) {
          setSuccess(true);
        } else {
          setSuccess(false);
        }
      } catch (err) {
        console.error("Verification failed:", err);
        setSuccess(false);
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [paymentId]);

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
        <p className="text-gray-700 dark:text-gray-300 font-medium">Verifying your upgrade...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {success ? (
        <PremiumSuccessOverlay isOpen={showOverlay} onClose={() => setShowOverlay(false)} />
      ) : (
        <PremiumFailOverlay isOpen={showOverlay} onClose={() => setShowOverlay(false)} />
      )}
    </div>
  );
}

export default function PremiumVerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
      </div>
    }>
      <PremiumVerifyContent />
    </Suspense>
  );
}
