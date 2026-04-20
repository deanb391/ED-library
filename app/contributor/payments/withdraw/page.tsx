"use client";

import React, { useState } from 'react';
import { 
  Menu, 
  Wallet, 
  CheckCircle2, 
  Landmark, 
  ChevronRight, 
  Send, 
  Info,
  LayoutGrid, 
  BarChart3, 
  Banknote 
} from 'lucide-react';

// --- Dummy Data ---
const RECENT_WITHDRAWALS = [
  {
    id: 1,
    type: 'Bank Transfer',
    date: 'Oct 12, 2023',
    amount: '-$500.00',
    status: 'Completed',
  },
  {
    id: 2,
    type: 'Bank Transfer',
    date: 'Sep 05, 2023',
    amount: '-$1,250.00',
    status: 'Completed',
  },
  {
    id: 3,
    type: 'Bank Transfer',
    date: 'Aug 20, 2023',
    amount: '-$800.00',
    status: 'Completed',
  },
];

export default function WithdrawPage() {
  const [amount, setAmount] = useState('1000');

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans text-gray-900 pb-20">
      

      {/* --- Main Content --- */}
      <main className="flex-1 px-4 py-2 space-y-6">
        
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Withdraw Funds</h2>
          <p className="text-sm text-gray-500 leading-relaxed pr-4">
            Manage your course earnings and transfer funds to your linked account.
          </p>
        </div>

        {/* Card 1: Available Balance */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative">
          <div className="absolute top-6 right-6 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
            <Wallet size={16} strokeWidth={2.5} />
          </div>
          
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            Available Balance
          </h3>
          
          <div className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            $4,250.00
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 size={16} className="text-emerald-500" fill="#10B981" color="white" />
            <span>Funds are ready for withdrawal.</span>
          </div>
        </div>

        {/* Card 2: Initiate Transfer Form */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Initiate Transfer</h3>
          
          <div className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Amount
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3.5 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <span className="text-gray-500 font-medium mr-2">$</span>
                <input 
                  type="text" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 w-full bg-transparent border-none focus:outline-none text-gray-900 text-base"
                  placeholder="0.00"
                />
                <span className="text-gray-500 font-medium ml-2">USD</span>
              </div>
              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-sm text-gray-500">Min. withdrawal: $50.00</span>
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  Withdraw All
                </button>
              </div>
            </div>

            {/* Destination Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Destination
              </label>
              <button className="w-full flex items-center justify-between border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-700">
                    <Landmark size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">University Credit Union</p>
                    <p className="text-xs text-gray-500 mt-0.5">Checking •••• 4589</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Submit Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 mt-2">
              <Send size={18} />
              Withdraw Funds
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-[#F0F5FF] border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
          <div className="text-blue-600 shrink-0 mt-0.5">
            <Info size={20} fill="currentColor" className="text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-900 mb-1">Processing Times</h4>
            <p className="text-sm text-blue-800/80 leading-relaxed">
              Standard bank transfers typically take 1-3 business days to appear in your account. Withdrawals requested after 5 PM EST will begin processing the next business day.
            </p>
          </div>
        </div>

        {/* Card 3: Recent Withdrawals */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Withdrawals</h3>
            <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">
              View All
            </button>
          </div>

          <div className="space-y-6">
            {RECENT_WITHDRAWALS.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{tx.type}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{tx.amount}</p>
                  <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

    </div>
  );
}