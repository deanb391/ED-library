"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { trackReferralClick } from "@/lib/api/contest_performance";

function TrackerInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      const trackedRef = localStorage.getItem("contest_referral_tracked");
      localStorage.setItem("contest_referral_id", ref);
      localStorage.setItem("contest_referral_time", Date.now().toString());

      if (trackedRef !== ref) {
        trackReferralClick(ref)
          .then(success => {
            if (success) {
              localStorage.setItem("contest_referral_tracked", ref);
            }
          })
          .catch(err => console.error("Referral track error:", err));
      }
    }
  }, [searchParams]);

  return null;
}

export default function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  );
}
