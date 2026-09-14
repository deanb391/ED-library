"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "@/components/useRouter";
import { useState } from "react";
import { completePasswordRecovery } from "@/lib/services/auth.service";
import { Eye, EyeOff } from "lucide-react";


export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !secret) {
      alert("Invalid recovery link");
      return;
    }

    if (password.length < 8){
        alert("Password must be at least 8 characters!");
        return;
    }

    try {
      setLoading(true);
      await completePasswordRecovery(userId, secret, password);
      alert("Password updated successfully");
      router.replace("/signin");
    } catch (err) {
      console.error(err);
      alert("Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8] dark:bg-gray-950 p-6 text-gray-900 dark:text-white">
      <form
        onSubmit={handleReset}
        className="w-full max-w-[420px] bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl dark:shadow-none border border-gray-100 dark:border-gray-800"
      >
        <h1 className="text-xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Reset Password
        </h1>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full px-4 py-3 pr-11 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-400 p-3"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg active:scale-[0.98] transition-all disabled:opacity-70"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
