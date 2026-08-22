import { ContestPerformance } from "@/lib/services/contest_performance.service";

export async function getContestPerformance(contributorId: string): Promise<ContestPerformance | null> {
  const res = await fetch(`/api/contest/performance?contributorId=${encodeURIComponent(contributorId)}`);
  
  if (!res.ok) {
    throw new Error("Failed to fetch contest performance");
  }

  const data = await res.json();
  return data.performance;
}

export async function trackReferralClick(contributorId: string): Promise<boolean> {
  const res = await fetch("/api/contest/referral/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contributorId }),
  });
  
  if (!res.ok) {
    throw new Error("Failed to track referral click");
  }

  const data = await res.json();
  return data.success;
}

export async function trackReferralSignup(contributorId: string): Promise<boolean> {
  const res = await fetch("/api/contest/referral/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contributorId }),
  });
  
  if (!res.ok) {
    throw new Error("Failed to track referral signup");
  }

  const data = await res.json();
  return data.success;
}

