"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { handleOAuthSignIn } from "@/lib/services/auth.service";
import { useUser } from "@/context/UserContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const hasRun = useRef(false);
  const { refreshUser } = useUser();

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const userId = params.get("userId");
        const secret = params.get("secret");

        if (!userId || !secret) {
          router.replace("/signin");
          return;
        }

        const result = await handleOAuthSignIn(userId, secret);

        // clean URL (important, don’t leak secret)
        window.history.replaceState({}, document.title, "/auth/callback");

        if (result.status === "EXISTS") {
          refreshUser()
          router.replace("/");
        } else {
          router.replace("/complete-profile");
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        router.replace("/signin");
      }
    };

    run();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign-in...</p>
      </div>
    </div>
  );
}