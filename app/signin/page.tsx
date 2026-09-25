"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  BookOpen,
} from "lucide-react";
import { useRouter } from "@/components/useRouter";
import { signIn, sendPasswordRecovery, googleSignIn } from "@/lib/services/auth.service";
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
    } catch (err: any) {
      alert(err?.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex font-sans text-gray-900 dark:text-white">
      {/* Left Panel: Image / Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-gray-100 dark:border-gray-800 bg-black">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 opacity-40 dark:opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-6 w-fit">
            <div className="bg-blue-600 text-white p-1.5 rounded-md">
              <BookOpen size={24} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white drop-shadow-md">
              ED-Library
            </span>
          </Link>
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight mt-12 text-white drop-shadow-md">
            Unlock your <br/> learning potential.
          </h2>
          <p className="mt-6 text-lg text-gray-200 max-w-md drop-shadow">
            Join thousands of students and contributors sharing knowledge and building a better future.
          </p>
        </div>

        <div className="relative z-10 text-sm font-medium text-gray-300 drop-shadow">
          © {new Date().getFullYear()} ED-Library. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-12 w-fit">
            <div className="bg-blue-600 text-white p-1.5 rounded-md">
              <BookOpen size={24} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">
              ED-Library
            </span>
          </Link>

          {/* Title */}
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-white">Welcome back</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-200">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 rounded-xl text-sm font-medium focus:outline-none focus:border-black dark:focus:border-white transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-200">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:border-black dark:focus:border-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
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
                className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl transition-transform active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 shadow-lg shadow-black/10 dark:shadow-white/10"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="py-4 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
              <span className="text-xs font-bold text-gray-400 tracking-wider">OR</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            </div>

            {/* Google Sign In */}
            <button
              onClick={async () => {
                try {
                  await googleSignIn();
                } catch (err) {
                  console.error(err);
                }
              }}
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <button
              onClick={() => router.push("/signup")}
              className="text-black dark:text-white font-bold hover:underline"
            >
              Sign up
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
