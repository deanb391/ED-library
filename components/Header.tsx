// components/Header.tsx
"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Plus } from 'lucide-react';
import { getCurrentUser } from '@/lib/appwrite';
import Image from "next/image";

export default function Header() {
    const [user, setUser] = useState()
    
      useEffect(() =>{
        const getUser = async () => {
          const doc = await getCurrentUser()
          console.log("User")
          if (doc) setUser(doc)
        }
      getUser()
      }, [])
      
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1 rounded-md">
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">ED-Library</span>
        </Link>
        
        {/* Nav Links */}
        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="text-gray-900 hover:text-blue-600">Home</Link>
          <Link href="/browse" className="hover:text-blue-600">Browse</Link>
          <Link href="/about" className="hover:text-blue-600">About</Link>
        </div>
      </div>

      {/* Right Actions */}
      {
        user && (
            <div className="flex items-center gap-3">
                <Link href="/admin/create-course">
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-small transition-colors">

  Create Course
</button>

                </Link>

                <Link href="/admin/upload">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Upload
          </button>
        </Link>
                
                
{/*                 
                <div className="w-9 h-9 rounded-full bg-orange-100 border border-orange-200 overflow-hidden relative">
                

                <Image
                src="/assets/images/admin-profile.jpg"
                alt="User"
                width={200}
                height={200}
                className="object-cover"
                />

                </div> */}
            </div>
        )
      }
    </nav>
  );
}