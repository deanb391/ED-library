"use client";

import React, { useState } from 'react';
import { GraduationCap, ArrowRight, Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/appwrite';
import { useUser } from '@/context/UserContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {refreshUser} = useUser()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);


    setIsLoading(false);
    await signIn(email, password)
    refreshUser();
    router.push('/'); 

  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col items-center justify-center p-6 font-sans text-gray-900">
      
      {/* --- Main Card --- */}
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10 animate-in fade-in zoom-in duration-300">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <GraduationCap size={28} />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Sign In</h1>
          <p className="text-sm text-gray-500 leading-relaxed px-4">
            Please enter your credentials to access the dashboard.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <label 
              htmlFor="email" 
              className="block text-xs font-bold text-gray-700 ml-1"
            >
              Email
            </label>
            <div className="relative group">
              <input 
                id="email"
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@academics.edu"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm group-hover:border-gray-400"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label 
              htmlFor="password" 
              className="block text-xs font-bold text-gray-700 ml-1"
            >
              Password
            </label>
            <div className="relative group">
              <input 
                id="password"
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm group-hover:border-gray-400 font-mono tracking-widest"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
    active:scale-[0.98]
    active:bg-gray-50
    cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing In...</span>
              </div>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer / Divider */}
        <div className="mt-10">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-white px-3 text-[10px] font-bold text-gray-400 tracking-widest uppercase">
              Authorized Personnel Only
            </span>
          </div>
        </div>
      </div>
      


    </div>
  );
}