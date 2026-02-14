"use client";

import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {  signIn, sendPasswordRecovery } from "@/lib/appwrite";
import { useUser } from "@/context/UserContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { refreshUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useUser();

  // useEffect(() => {
  //   const runCheck = async () => {
  //     if (user ){
  //       alert("You are already signed in")
  //       router.replace("/")
  //     }
  //   } 
  //   runCheck()
  // }, [user])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user) {
      alert("A session is already active")
      router.replace("/")
      return;
    }

    try {
      setIsLoading(true);
      await signIn(email, password);
      await refreshUser();
      router.replace("/");
    } catch (err) {
      alert("Invalid credentials");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-6 text-gray-900">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
        
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <GraduationCap size={28} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Sign In</h1>
          <p className="text-sm text-gray-500">
            Please enter your credentials.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 ml-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 ml-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 font-mono tracking-widest"
              />

              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 px-2"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="text-right">
  <button
    type="button"
    onClick={async () => {
      if (!email) {
        alert("Enter your email first");
        return;
      }

      try {
        await sendPasswordRecovery(email);
        alert("Recovery email sent");
      } catch (err) {
        console.error(err);
        alert("Something went wrong");
      }
    }}
    className="text-xs text-blue-600 hover:underline"
  >
    Forgot password?
  </button>
</div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

                  {/* Divider */}
        <div className="my-8 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google Sign In */}
        <button
          onClick={() => { router.push("/signup")}}
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all
          active:scale-[0.98]"
        >
          Sign up 
        </button>
        </form>
      </div>
    </div>
  );
}
