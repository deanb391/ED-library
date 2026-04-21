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
  Home,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import clsx from "clsx";

/**
 * Small media query hook
 */


export default function Header() {
  const {
    user,
    loading,
    hasWallet,
    hasLibrary,
    contributor,
    contributorLoading,
  } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const hasContributorAccount = Boolean(contributor);
  const showContributorMenu = Boolean(user && !loading && !contributorLoading);
  const contributorDashboardHref = user ? `/contributor/dashboard/${user.$id}` : "/";

  const avatarSrc =
  hasContributorAccount
    ? contributor?.profileImage
    : user?.avatar;

  const closeMenu = () => setMenuOpen(false);

  function HeaderSkeleton() {
    return (
      <div className="h-9 w-20 rounded-lg bg-gray-200 animate-pulse" />
    );
  }

  const MenuItems = ({ onSelect }: { onSelect: () => void }) => (
    <div className="py-2 text-sm w-full">
      <MenuItem icon={Home} label="Home" href="/" onSelect={onSelect} />
      <div className="my-5 h-px bg-gray-100" style={{marginTop: 10, marginBottom: 10}}/>
      <MenuItem icon={User} label="Account" href="/account" onSelect={onSelect} />
      <div className="my-5 h-px bg-gray-100" style={{marginTop: 10, marginBottom: 10}}/>
      {showContributorMenu && (
        hasContributorAccount ? (
          <>
            <MenuItem
              icon={Megaphone}
              label="Dashboard"
              href={contributorDashboardHref}
              onSelect={onSelect}
            />
            <div className="my-5 h-px bg-gray-100" style={{marginTop: 10, marginBottom: 10}}/>
          </>
        ) : (
          <>
            <MenuItem
              icon={Megaphone}
              label="Become A Contributor"
              href="/become-a-contributor"
              onSelect={onSelect}
            />
            <div className="my-5 h-px bg-gray-100" style={{marginTop: 10, marginBottom: 10}}/>
          </>
        )
      )}

      {user?.isAdmin && (
        <>
          <MenuItem
            icon={Plus}
            label="Create Course"
            href="/contributor/dashboard/create-course"
            onSelect={onSelect}
          />
          <div className="my-5 h-px bg-gray-100" style={{marginTop: 10, marginBottom: 10}}/>
          <MenuItem
            icon={Upload}
            label="Upload"
            href="/admin/upload"
            onSelect={onSelect}
          />
          <div className="my-5 h-px bg-gray-100" style={{marginTop: 10, marginBottom: 10}}/>
          <MenuItem
            icon={Megaphone}
            label="Ads"
            href="/admin/ads"
            onSelect={onSelect}
          />
        </>
      )}

      {
        hasLibrary && (
          <>
          <div className="my-5 h-px bg-gray-100" style={{marginTop: 10, marginBottom: 10}} />

      <MenuItem icon={Info} label="Library" href="/library" onSelect={onSelect} />
          </>
          
        )
      }

      {
        hasWallet && (
          <>
          <div className="my-5 h-px bg-gray-100" style={{marginTop: 10, marginBottom: 10}} />

      <MenuItem icon={Info} label="Wallet" href="/wallet" onSelect={onSelect} />
          </>
          
        )
      }

      <div className="my-5 h-px bg-gray-100" style={{marginTop: 10, marginBottom: 10}} />

      <MenuItem icon={Info} label="About" href="/about" onSelect={onSelect} />

      <div className="my-5 h-px bg-gray-100" style={{marginTop: 10, marginBottom: 10}}/>

      <MenuItem icon={Phone} label="Contact" href="#" onSelect={onSelect} />
    </div>
  );

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      {/* LEFT */}
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
          <Link href="/account" className="hover:text-blue-600">
            Account
          </Link>
          {showContributorMenu && (
            hasContributorAccount ? (
              <Link href={contributorDashboardHref} className="hover:text-blue-600">
                Dashboard
              </Link>
            ) : (
              <Link href="/become-a-contributor" className="hover:text-blue-600">
                Become A Contributor
              </Link>
            )
          )}

          {
            hasLibrary && (
              <Link href="/library" className="hover:text-blue-600">
            Library
          </Link>
            )
          }

          {
            hasWallet && (
              <Link href="/wallet" className="hover:text-blue-600">
            Wallet
          </Link>
            )
          }

          <Link href="#" className="hover:text-blue-600">
            About
          </Link>
          <Link href="#" className="hover:text-blue-600">
            Contact
          </Link>

        </div>
      </div>

      {/* RIGHT */}
      {loading ? (
        <HeaderSkeleton />
      ) : (
        <div className="flex items-center gap-3 relative">
          {/* Auth */}
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

          {/* USER MENU */}
          {user && (
            <>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="relative z-100 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all active:scale-[0.90]"
              >
                <span
                  className={clsx(
                    "absolute transition-all duration-300",
                    menuOpen ? "rotate-45 opacity-0" : "opacity-100"
                  )}
                >
                  <Menu size={25} style={{ color: "rgb(37 99 255)" }} />
                </span>

                <span
                  className={clsx(
                    "absolute transition-all duration-300",
                    menuOpen ? "opacity-100 rotate-0" : "opacity-0"
                  )}
                >
                  <X size={25} style={{ color: "rgb(239 68 68)" }} />
                </span>
              </button>

              {/* ================= MOBILE MENU ================= */}
  
                {/* ================= MOBILE MENU ================= */}
<>
  {/* Backdrop */}
  <div
    onClick={closeMenu}
    className={clsx(
      "fixed inset-0 bg-black/30 backdrop-blur-sm z-60 transition-opacity duration-300",
      menuOpen
        ? "opacity-100 pointer-events-auto"
        : "opacity-0 pointer-events-none"
    )}
  />

  

  {/* Drawer */}
  {
    menuOpen && (

      <div
    className={clsx(
      "fixed right-0 top-0 h-full w-full max-w-lvh bg-white shadow-xl z-70 transition-transform duration-300 ease-out",
      menuOpen
        ? "translate-x-0 pointer-events-auto"
        : "translate-x-full pointer-events-none"
    )}
    style={{paddingTop: 50, paddingRight: 30, paddingLeft: 10}}
  >
    {/* User header */}
    <div className="flex items-center gap-3 px-4 py-4 border-b"
    
      >
      <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100">
        {user.avatar ? (
          <Image
            src={avatarSrc || "/default-avatar.png"}
            alt="Avatar"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-600">
            {user.username?.[0]?.toUpperCase() || "U"}
          </div>
        )}
      </div>

      <div>
        <p className="font-semibold text-gray-900">
          {user.username || "User"}
        </p>
        <p className="text-xs text-gray-500">View profile</p>
      </div>
    </div>

    <MenuItems onSelect={closeMenu}/>
  </div>
    )
  }
</>
            

              {/* ================= DESKTOP MENU ================= */}
              
            </>
          )}
        </div>
      )}
    </nav>
  );
}

/**
 * Shared menu item
 */
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
      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 transition-all active:scale-[0.98]"
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}