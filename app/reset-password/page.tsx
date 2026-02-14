"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { completePasswordRecovery } from "@/lib/appwrite";
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
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8] p-6">
      <form
        onSubmit={handleReset}
        className="w-full max-w-[420px] bg-white p-8 rounded-2xl shadow-lg"
      >
        <h1 className="text-xl font-bold mb-6 text-center" style={{color: "#000"}}>
          Reset Password
        </h1>

        <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="New password"
    className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 font-mono tracking-widest"
    style={{ color: "#000" }}
  />

  <button
    type="button"
    onClick={() => setShowPassword((prev) => !prev)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-3"
  >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
</div>


        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-lg"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
