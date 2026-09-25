"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ArrowRight,
  Mail,
  Lock,
  User,
  Building2,
  Layers,
  Eye,
  EyeOff,
  BookOpen,
} from "lucide-react";
import { useRouter } from "@/components/useRouter";
import { createUser, googleSignIn } from "@/lib/services/auth.service";
import { useUser } from "@/context/UserContext";
import { trackReferralSignup } from "@/lib/api/contest_performance";

export default function SignUpPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isContributorSignUp, setIsContributorSignUp] = useState(false);
  const { refreshUser } = useUser()

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlRef = urlParams.get("ref");
      const urlMRef = urlParams.get("mref");
      
      if (urlMRef) {
        const trackedMRef = localStorage.getItem("media_source_tracked");
        if (trackedMRef !== urlMRef) {
          import("@/lib/api/sources").then(({ trackSourceClick }) => {
            trackSourceClick(urlMRef)
              .then(success => {
                if (success) {
                  localStorage.setItem("media_source_tracked", urlMRef);
                  localStorage.setItem("media_source_id", urlMRef);
                }
              })
              .catch(err => console.error("Media track error:", err));
          });
        }
      }
      
      if (urlRef) {
        const trackedRef = localStorage.getItem("contest_referral_tracked");
        if (trackedRef !== urlRef) {
          import("@/lib/api/contest_performance").then(({ trackReferralClick }) => {
            trackReferralClick(urlRef)
              .then(success => {
                if (success) {
                  localStorage.setItem("contest_referral_tracked", urlRef);
                  localStorage.setItem("contest_referral_id", urlRef);
                }
              })
              .catch(err => console.error("Referral track error:", err));
          });
        }
      }
    }
  }, []);

  const LEVELS = ["Pre-Degree", 100, 200, 300, 400, 500, 600, "Post-Graduate"];






  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length <= 8 || confirmPassword.length <= 8) {
      alert("Password must not be less than 8, and must be one which is not common")
      return;
    }

    const num_level = Number(level)
    setIsLoading(true);

    try {
      await createUser({ email, password, username, level: num_level, department })
      await refreshUser()
      
      // Track referral signup if exists
      const urlParams = new URLSearchParams(window.location.search);
      const urlRef = urlParams.get("ref");
      const ref = urlRef || localStorage.getItem("contest_referral_id");
      
      if (ref) {
        try {
          await trackReferralSignup(ref);
          // Clear it so it doesn't trigger again
          localStorage.removeItem("contest_referral_id");
          localStorage.removeItem("contest_referral_time");
        } catch (err) {
          console.error("Referral signup track error:", err);
        }
      }

      const urlMRef = urlParams.get("mref");
      const mref = urlMRef || localStorage.getItem("media_source_id");
      
      if (mref) {
        import("@/lib/api/sources").then(({ trackSourceSignup }) => {
          trackSourceSignup(mref).catch(err => console.error(err));
          localStorage.removeItem("media_source_id");
        });
      }

      if (isContributorSignUp) {
        router.replace("/onboarding/step-1");
      } else {
        router.replace("/");
      }
    } catch (err: any) {
      // console.error(err)
      let message = err.message;
      if (err.message.includes("A user with the same id, email, or phone already exists in this project.")) message = "Account with this email already exists"
      alert("Failed to create account: " + message)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex font-sans text-gray-900 dark:text-white">
      {/* Left Panel: Image / Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex w-[45%] relative flex-col justify-between p-12 overflow-hidden border-r border-gray-100 dark:border-gray-800 bg-black">
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
          <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight mt-12 text-white drop-shadow-md">
            Start your <br/> educational journey.
          </h2>
          <p className="mt-6 text-lg text-gray-200 max-w-md drop-shadow">
            Create an account to access premium course materials and connect with top contributors.
          </p>
        </div>
        
        <div className="relative z-10 text-sm font-medium text-gray-300 drop-shadow">
          © {new Date().getFullYear()} ED-Library. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-10 xl:p-16 relative overflow-y-auto">
        <div className="w-full max-w-xl">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-10 w-fit">
            <div className="bg-blue-600 text-white p-1.5 rounded-md">
              <BookOpen size={24} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">
              ED-Library
            </span>
          </Link>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-white">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Join the community today.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-5">
            
            {/* 2-Column Grid on Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Username */}
              <Input
                label="Username"
                icon={<User size={18} className="text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors" />}
                value={username}
                onChange={setUsername}
                placeholder="john_doe"
              />

              {/* Email */}
              <Input
                label="Email"
                type="email"
                icon={<Mail size={18} className="text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors" />}
                value={email}
                onChange={setEmail}
                placeholder="johndoe@gmail.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Level */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-200">
                  Level
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Layers size={18} className="text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors" />
                  </div>
                  <select
                    required
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent text-gray-900 dark:text-white rounded-xl text-sm font-medium focus:outline-none focus:border-black dark:focus:border-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="text-gray-500">
                      Select level
                    </option>
                    {LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Department */}
              <Input
                label="Department"
                icon={<Building2 size={18} className="text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors" />}
                value={department}
                onChange={setDepartment}
                placeholder="Mechanical Eng"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-200">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:border-black dark:focus:border-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Sign Up As Contributor Switch */}
            <div className="flex items-center justify-between py-4 border-y border-gray-100 dark:border-gray-800 mt-2">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Sign Up As Contributor</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Apply to publish your own courses.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsContributorSignUp(v => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                  isContributorSignUp ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${
                    isContributorSignUp ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl transition-transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 shadow-lg shadow-black/10 dark:shadow-white/10"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="py-6 flex items-center gap-4">
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

          {/* Sign In Link */}
          <div className="mt-8 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/signin")}
              className="text-black dark:text-white font-bold hover:underline"
            >
              Sign In
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

/* ---------- Reusable Input ---------- */

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-bold text-gray-900 dark:text-gray-200">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${icon ? "pl-11" : "pl-4"} pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 rounded-xl text-sm font-medium focus:outline-none focus:border-black dark:focus:border-white transition-all ${mono ? "font-mono tracking-widest" : ""}`}
        />
      </div>
    </div>
  );
}
