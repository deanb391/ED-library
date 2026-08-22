"use client";

import React from 'react';
import { 
  BookOpen, 
  Compass, 
  Book, 
  Users, 
  User, 
  Calendar, 
  GraduationCap, 
  BarChart2, 
  ScrollText 
} from 'lucide-react';

// --- Custom Brand Blue extracted from the uploaded image ---
const BRAND_BLUE = "#2563EB"; 
const BRAND_BLUE_LIGHT = "#EFF6FF"; // Light background for active states

// --- Dummy Data ---
const SUBSCRIPTIONS = [
  {
    id: 1,
    title: 'Advanced Algorithms & Data Structures',
    code: 'CS101',
    icon: <GraduationCap size={12} strokeWidth={3} />,
    price: 49,
    description: 'Master complex algorithms and data manipulation techniques...',
    nextBilling: 'Oct 15, 2023',
    image: '/api/placeholder/400/160', 
  },
  {
    id: 2,
    title: 'Applied Machine Learning Models',
    code: 'DAT205',
    icon: <BarChart2 size={12} strokeWidth={3} />,
    price: 79,
    description: 'Practical implementation of predictive models using Python,...',
    nextBilling: 'Oct 22, 2023',
    image: '/api/placeholder/400/160',
  },
  {
    id: 3,
    title: 'Modern European History Seminars',
    code: 'HIS310',
    icon: <ScrollText size={12} strokeWidth={3} />,
    price: 35,
    description: 'In-depth analysis of 20th-century geopolitical shifts, cultural...',
    nextBilling: 'Nov 01, 2023',
    image: '/api/placeholder/400/160',
  }
];

export default function ActiveSubscriptionsPage() {
  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans text-gray-900 dark:text-white pb-24">
      
      {/* --- Top App Bar --- */}
      <header className="bg-transparent px-4 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-1.5">
          <BookOpen size={22} fill="currentColor" className="text-gray-900 dark:text-white" />
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: BRAND_BLUE }}>
            Azure Scholar
          </h1>
        </div>
        
        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm shrink-0">
          <img 
            src="/api/placeholder/32/32" 
            alt="Current User" 
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 px-4 py-2 w-full max-w-md mx-auto space-y-5">
        
        {/* Header Section */}
        <section className="mb-6">
          <h1 className="text-[28px] font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight leading-tight">
            Active Subscriptions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed pr-2 font-medium">
            Manage your enrolled courses and upcoming billing dates.
          </p>
        </section>

        {/* Subscriptions List */}
        <section className="space-y-4">
          {SUBSCRIPTIONS.map((sub) => (
            <div key={sub.id} className="bg-white dark:bg-gray-900 rounded-[20px] overflow-hidden shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 flex flex-col">
              
              {/* Image Header with Badge */}
              <div className="relative w-full h-32 bg-gray-200 dark:bg-gray-800">
                <img 
                  src={sub.image} 
                  alt={sub.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Course Code Badge */}
                <div className="absolute top-3 right-3 bg-white dark:bg-gray-900/95 backdrop-blur-sm text-gray-900 dark:text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm uppercase tracking-wider">
                  <span style={{ color: BRAND_BLUE }}>{sub.icon}</span>
                  <span style={{ color: BRAND_BLUE }}>{sub.code}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1.5 gap-4">
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white leading-snug">
                    {sub.title}
                  </h3>
                  <div className="text-right shrink-0 mt-0.5">
                    <span className="text-lg font-extrabold" style={{ color: BRAND_BLUE }}>
                      ${sub.price}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">/mo</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2 pr-4 font-medium">
                  {sub.description}
                </p>

                {/* Divider */}
                <div className="w-full border-t border-gray-100 dark:border-gray-800 mb-3" />

                {/* Card Footer (Billing Date & Action) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <Calendar size={14} strokeWidth={2.5} />
                    <span className="text-[11px] font-semibold">
                      Next billing: {sub.nextBilling}
                    </span>
                  </div>
                  
                  <button className="bg-[#F3F4F6] hover:bg-[#E5E7EB] text-gray-900 dark:text-white text-[10px] font-extrabold px-3 py-2 rounded-lg uppercase tracking-widest transition-colors">
                    Manage
                  </button>
                </div>
              </div>

            </div>
          ))}
        </section>

      </main>

      {/* --- Bottom Navigation Bar --- */}
      <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-2 py-2 flex justify-around items-center pb-safe z-50">
        
        <button className="flex flex-col items-center justify-center w-16 h-14 text-gray-400 hover:text-gray-600 dark:text-gray-400 transition-colors">
          <Compass size={22} strokeWidth={2.5} className="mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Explore</span>
        </button>

        {/* Active Tab */}
        <button 
          className="flex flex-col items-center justify-center w-20 h-14 rounded-2xl transition-colors"
          style={{ backgroundColor: BRAND_BLUE_LIGHT, color: BRAND_BLUE }}
        >
          <Book size={22} strokeWidth={2.5} className="mb-1" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Learning</span>
        </button>

        <button className="flex flex-col items-center justify-center w-16 h-14 text-gray-400 hover:text-gray-600 dark:text-gray-400 transition-colors">
          <Users size={22} strokeWidth={2.5} className="mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Creators</span>
        </button>

        <button className="flex flex-col items-center justify-center w-16 h-14 text-gray-400 hover:text-gray-600 dark:text-gray-400 transition-colors">
          <User size={22} strokeWidth={2.5} className="mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Account</span>
        </button>
        
      </nav>

    </div>
  );
}