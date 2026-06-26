"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  ArrowRight,
  User,
  Building2,
  Layers,
} from "lucide-react";
import { useRouter } from "@/components/useRouter";
import { account, databases } from "@/lib/appwrite";
import { useUser } from "@/context/UserContext";
import { createUserProfile } from "@/lib/services/auth.service";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { refreshUser } = useUser();

  const [username, setUsername] = useState("");
  const [level, setLevel] = useState("");
  const [department, setDepartment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);
  const [isContributorSignUp, setIsContributorSignUp] = useState(false);

  const LEVELS = [100, 200, 300, 400, 500, 600];


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await account.get();
        setAuthUser(user);
        setUsername(user.name || "");
      } catch {
        router.replace("/signin");
      }
    };
    checkAuth();
  }, [router]);

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authUser) return;

    setIsLoading(true);

    try {

      await createUserProfile(authUser, {
        username,
        level: Number(level),
        department,
      });

      await refreshUser();
      if (isContributorSignUp) {
        router.replace("/onboarding/step-1");
      } else {
        router.replace("/");
      }
    } catch (error) {
      console.error("Error completing profile:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!authUser) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col items-center justify-center p-6 font-sans text-gray-900">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10 animate-in fade-in zoom-in duration-300">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <GraduationCap size={28} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-sm text-gray-500 px-4">
            Just a few more details to get started.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleCompleteProfile} className="space-y-5">

          {/* Username */}
          <Input
            label="Username"
            icon={<User size={16} />}
            value={username}
            onChange={setUsername}
            placeholder="john doe"
          />

          {/* Level */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 ml-1">
              Level
            </label>
            <select
              required
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
            >
              <option value="" disabled>
                Select level
              </option>
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <Input
            label="Department"
            icon={<Building2 size={16} />}
            value={department}
            onChange={setDepartment}
            placeholder="Mechanical Engineering"
          />

          {/* Sign Up As Contributor Switch */}
          <div className="flex items-center justify-between py-2 border-t border-b border-gray-100">
            <div>
              <p className="text-sm font-bold text-gray-800">Sign Up As Contributor</p>
              <p className="text-xs text-gray-500">Enable to apply as a contributor after completing profile.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsContributorSignUp(v => !v)}
              className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 ${
                isContributorSignUp ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${
                  isContributorSignUp ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete Profile</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
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
      <label className="block text-xs font-bold text-gray-700 ml-1">
        {label}
      </label>
      <div className="relative group">
        <input
          type={type}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm group-hover:border-gray-400 ${
            mono ? "font-mono tracking-widest" : ""
          }`}
        />
      </div>
    </div>
  );
}