"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Menu,
  X,
  User,
  Plus,
  Upload,
  Megaphone,
  Info,
  Phone,
  LayoutGrid,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import clsx from "clsx";

export default function Header() {
  const { user, loading } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  function HeaderSkeleton() {
    return <div className="h-9 w-20 rounded-lg bg-gray-200 animate-pulse" />;
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      {/* Left */}
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="flex items-center gap-2 transition-all active:scale-[0.90]"
        >
          <div className="bg-blue-600 text-white p-1 rounded-md">
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">
            ED-Library
          </span>
        </Link>

        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="text-gray-900 hover:text-blue-600">
            Home
          </Link>
          <Link href="#" className="hover:text-blue-600">
            Browse
          </Link>
          <Link href="#" className="hover:text-blue-600">
            About
          </Link>
        </div>
      </div>

      {/* Right */}
      {loading ? (
        <HeaderSkeleton />
      ) : (
        <div className="flex items-center gap-3 relative">
          {/* Auth buttons stay as-is */}
          {user === null && (
            <>
              <Link href="/signin">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-all active:scale-[0.90]">
                  Sign in
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all active:scale-[0.90]">
                  Sign Up
                </button>
              </Link>
            </>
          )}

          {/* Menu button (logged in users) */}
          {user && (
            <>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="relative z-50 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all active:scale-[0.90]"
              >
                <span
                  className={clsx(
                    "absolute transition-all duration-300",
                    menuOpen ? "rotate-45 scale-110 opacity-0" : "opacity-100"
                  )}
                >
                  <Menu size={25} color="blue" />
                </span>
                <span
                  className={clsx(
                    "absolute transition-all duration-300",
                    menuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-45"
                  )}
                >
                  <X size={25} color="blue"/>
                </span>
              </button>

              {/* Popup */}
              <div
                className={clsx(
                  "absolute right-0 top-1 mt-10 w-72 rounded-xl border bg-white shadow-lg overflow-hidden transition-all origin-top-right",
                  menuOpen
                    ? "scale-100 opacity-100"
                    : "scale-95 opacity-0 pointer-events-none"
                )}
                style={{ width: 200 }}
              >
                <div className="py-2 text-sm w-90">
                  <MenuItem icon={User} label="Account" href="/account"  onSelect={closeMenu}/>
                  {user.isAdmin && (
                    <>
                      <MenuItem
                        icon={Plus}
                        label="Create Course"
                        href="/admin/create-course"
                         onSelect={closeMenu}
                      />
                      <MenuItem
                        icon={Upload}
                        label="Upload"
                        href="/admin/upload"
                         onSelect={closeMenu}
                      />
                      <MenuItem
                        icon={Megaphone}
                        label="Ads"
                        href="/admin/ads"
                         onSelect={closeMenu}
                      />
                    </>
                  )}
                  <div className="my-1 h-px bg-gray-100"  onSelect={closeMenu}/>
                  <MenuItem icon={Info} label="About" href="/about"  onSelect={closeMenu}/>
                  <MenuItem icon={Phone} label="Contact" href="#"  onSelect={closeMenu}/>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function MenuItem({
  icon: Icon,
  label,
  href,
  onSelect,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
       onClick={onSelect}
      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 transition-all active:scale-[0.90]"
    >
      <Icon size={19} />
      <span>{label}</span>
    </Link>
  );
}
