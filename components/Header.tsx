"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Menu,
  X,
  User,
  Megaphone,
  Phone,
  Home,
  BookMarked,
  Wallet,
  CircleHelp,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import ThemeToggle from "@/components/ThemeToggle";
import clsx from "clsx";

function HeaderSkeleton() {
  return (
    <div className="h-9 w-20 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
  );
}

type MenuItemsProps = {
  onSelect: () => void;
  showContributorMenu: boolean;
  hasContributorAccount: boolean;
  contributorDashboardHref: string;
  hasLibrary: boolean;
  user: {
    isAdmin?: boolean;
    $id?: string;
    avatar?: string;
    username?: string;
  } | null | undefined;
  userIsAdmin: boolean;
};

function MenuItems({
  onSelect,
  showContributorMenu,
  hasContributorAccount,
  contributorDashboardHref,
  hasLibrary,
  user,
  userIsAdmin,
}: MenuItemsProps) {
  return (
    <div className="py-2 text-sm w-full">
      <MenuItem icon={Home} label="Home" href="/" onSelect={onSelect} />
      <div className="my-5 h-px bg-gray-100 dark:bg-gray-800 mt-2.5 mb-2.5" />
      <MenuItem icon={User} label="Account" href="/account" onSelect={onSelect} />
      <div className="my-5 h-px bg-gray-100 dark:bg-gray-800 mt-2.5 mb-2.5" />
      {showContributorMenu && (
        hasContributorAccount ? (
          <>
            <MenuItem
              icon={Megaphone}
              label="Dashboard"
              href={contributorDashboardHref}
              onSelect={onSelect}
            />
            <div className="my-5 h-px bg-gray-100 dark:bg-gray-800 mt-2.5 mb-2.5" />
          </>
        ) : (
          <>
            <MenuItem
              icon={Megaphone}
              label="Become A Contributor"
              href="/become-a-contributor"
              onSelect={onSelect}
            />
            <div className="my-5 h-px bg-gray-100 dark:bg-gray-800 mt-2.5 mb-2.5" />
          </>
        )
      )}

      {userIsAdmin && (
        <>
          <MenuItem icon={User} label="Admin" href="/admin" onSelect={onSelect} />
        </>
      )}

      {hasLibrary && (
        <>
          <div className="my-5 h-px bg-gray-100 dark:bg-gray-800 mt-2.5 mb-2.5" />
          <MenuItem icon={BookMarked} label="Library" href="/library" onSelect={onSelect} />
        </>
      )}

      {user && (
        <>
          <div className="my-5 h-px bg-gray-100 dark:bg-gray-800 mt-2.5 mb-2.5" />
          <MenuItem icon={Wallet} label="Wallet" href="/wallet" onSelect={onSelect} />
        </>
      )}

      <div className="my-5 h-px bg-gray-100 dark:bg-gray-800 mt-2.5 mb-2.5" />
      <MenuItem icon={Megaphone} label="Advertise" href="/advertise" onSelect={onSelect} />
      <div className="my-5 h-px bg-gray-100 dark:bg-gray-800 mt-2.5 mb-2.5" />
      <MenuItem icon={CircleHelp} label="About" href="/about" onSelect={onSelect} />
      <div className="my-5 h-px bg-gray-100 dark:bg-gray-800 mt-2.5 mb-2.5" />
      <MenuItem icon={Phone} label="Contact" href="/contact" onSelect={onSelect} />
    </div>
  );
}

export default function Header() {
  const {
    user,
    loading,
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

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors duration-200">
      {/* LEFT */}
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="flex items-center gap-2 transition-all active:scale-[0.90]"
        >
          <div className="bg-blue-600 text-white p-1 rounded-md">
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
            ED-Library
          </span>
        </Link>

        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-300 dark:text-gray-600">
          <Link href="/" className="text-gray-900 dark:text-white hover:text-blue-600">
            Home
          </Link>
          {user && (
            <Link href="/account" className="hover:text-blue-600 dark:hover:text-blue-400">
              Account
            </Link>
          )}
          {showContributorMenu && (
            hasContributorAccount ? (
              <Link href={contributorDashboardHref} className="hover:text-blue-600 dark:hover:text-blue-400">
                Dashboard
              </Link>
            ) : (
              <Link href="/become-a-contributor" className="hover:text-blue-600 dark:hover:text-blue-400">
                Become A Contributor
              </Link>
            )
          )}

          {user?.isAdmin && (
            <Link href="/" className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
              Admin
            </Link>
          )}

          {
            hasLibrary && (
              <Link href="/library" className="hover:text-blue-600 dark:hover:text-blue-400">
                Library
              </Link>
            )
          }

          {
            user && (
              <Link href="/wallet" className="hover:text-blue-600 dark:hover:text-blue-400">
                Wallet
              </Link>
            )
          }

          <Link href="/advertise" className="hover:text-blue-600 dark:hover:text-blue-400">
            Advertise
          </Link>
          <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400">
            About
          </Link>
          <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400">
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
          <ThemeToggle />
          {user === null && (
            <>
              <Link href="/signin">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-all active:scale-[0.90]">
                  Sign in
                </button>
              </Link>

              <Link href="/signup">
                <button className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:bg-gray-800 rounded-lg transition-all active:scale-[0.90]">
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
                aria-label="Toggle menu"
                className="relative z-100 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-800 transition-all active:scale-[0.90]"
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
                        "fixed right-0 top-0 h-full w-full max-w-lvh bg-white dark:bg-gray-900 shadow-xl z-70 transition-transform duration-300 ease-out",
                        menuOpen
                          ? "translate-x-0 pointer-events-auto"
                          : "translate-x-full pointer-events-none"
                      )}
                      style={{ paddingTop: 50, paddingRight: 30, paddingLeft: 10 }}
                    >
                      {/* User header */}
                      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-gray-800"

                      >
                        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                          {user.avatar ? (
                            <Image
                              src={avatarSrc || "/default-avatar.png"}
                              alt="Avatar"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                              {user.username?.[0]?.toUpperCase() || "U"}
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {user.username || "User"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">View profile</p>
                        </div>
                      </div>

                      <MenuItems
                        onSelect={closeMenu}
                        showContributorMenu={showContributorMenu}
                        hasContributorAccount={hasContributorAccount}
                        contributorDashboardHref={contributorDashboardHref}
                        hasLibrary={hasLibrary}
                        user={user}
                        userIsAdmin={Boolean(user?.isAdmin)}
                      />
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
      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 dark:text-gray-600 transition-all active:scale-[0.98]"
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}