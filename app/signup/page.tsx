"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  ArrowRight,
  Mail,
  Lock,
  User,
  Building2,
  Layers,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createUser } from "@/lib/appwrite";
import { useUser } from "@/context/UserContext";

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
const {refreshUser} = useUser()

    const LEVELS = [100, 200, 300, 400, 500, 600];

const DEPARTMENTS = [
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Computer Engineering",
  "Chemical Engineering",
  "Petroleum Engineering",
  "Agricultural Engineering",
  "Marine Engineering",
];





  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length <= 8 || confirmPassword.length <= 8) {
        alert("Password must not be less than 8, and must be one which is not common")
    }

    const num_level = Number(level)
    setIsLoading(true);

    await createUser({email, password, username, level: num_level, department})
    setIsLoading(false);
    refreshUser()
    router.replace("/");
  };

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
          <h1 className="text-2xl font-bold mb-2">Create Account</h1>
          <p className="text-sm text-gray-500 px-4">
            Create your account to access course materials.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-5">
          
          {/* Username */}
          <Input
            label="Username"
            icon={<User size={16} />}
            value={username}
            onChange={setUsername}
            placeholder="john doe"
          />

          {/* Email */}
          <Input
            label="Email"
            type="email"
            icon={<Mail size={16} />}
            value={email}
            onChange={setEmail}
            placeholder="johndoe@gmail.com"
          />

          {/* Level */}
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
<div className="space-y-1.5">
  <label className="block text-xs font-bold text-gray-700 ml-1">
    Department
  </label>
  <select
    required
    value={department}
    onChange={(e) => setDepartment(e.target.value)}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
  >
    <option value="" disabled>
      Select department
    </option>
    {DEPARTMENTS.map((dept) => (
      <option key={dept} value={dept}>
        {dept}
      </option>
    ))}
  </select>
</div>


          {/* Password */}
<div className="space-y-1.5">
  <label className="block text-xs font-bold text-gray-700 ml-1">
    Password
  </label>
  <div className="relative group">
    <input
      type={showPassword ? "text" : "password"}
      required
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="••••••••"
      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
    />
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
</div>


{/* Confirm Password */}
<div className="space-y-1.5">
  <label className="block text-xs font-bold text-gray-700 ml-1">
    Confirm Password
  </label>
  <div className="relative group">
    <input
      type={showConfirmPassword ? "text" : "password"}
      required
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      placeholder="••••••••"
      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
    />
    <button
      type="button"
      onClick={() => setShowConfirmPassword((v) => !v)}
      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
    >
      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
</div>


          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70
            active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-8 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google Sign In */}
        <button
          onClick={() => {router.push("/signin")}}
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all
          active:scale-[0.98]"
        >
          Sign In
        </button>
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
