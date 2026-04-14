"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { account, databases } from "@/lib/appwrite";

const DATABASE_ID = "69617e75000c6c010a75";
const USER_COLLECTION = "user";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the current user from the session
        const authUser = await account.get();

        if (!authUser) {
          router.replace("/signin");
          return;
        }

        // Check if user document exists
        try {
          await databases.getDocument(
            DATABASE_ID,
            USER_COLLECTION,
            authUser.$id
          );

          // User exists, redirect to home
          router.replace("/");
        } catch {
          // User document doesn't exist, redirect to complete profile
          router.replace("/complete-profile");
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        router.replace("/signin");
      }
    };

    handleCallback();
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