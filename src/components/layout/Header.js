// components/Header.jsx
"use client";

import Link from "next/link";
import { Menu, X, MapPin, Users, Calendar, Search, User, LogOut, Settings, Wallet, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

useEffect(() => {
  const syncUser = () => {
    const userData = localStorage.getItem("user");
    setUser(userData ? JSON.parse(userData) : null);
  };

  syncUser(); // run on mount + route change

  window.addEventListener("auth-change", syncUser);

  return () => {
    window.removeEventListener("auth-change", syncUser);
  };
}, [pathname]);  // 👈 important


const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setUser(null);

  window.dispatchEvent(new Event("auth-change"));

  router.push("/");
};

  return (
    <header className="fixed top-0 z-50 w-full border-b border-orange-900/30 bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* Logo + Name */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 text-white font-bold text-xl shadow-lg shadow-orange-600/30 transition-transform group-hover:scale-105">
            MS
          </div>
          <span className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Meet<span className="text-orange-400">Street</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-2 lg:gap-3 md:flex">
          {user ? <AuthNavLinks /> : <NavLinks />}

          <div className="ml-6 flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/explore"
                  className="flex items-center gap-1.5 rounded-full border border-gray-700/70 bg-gray-800/40 px-4 py-2 text-sm font-medium text-gray-300 hover:border-orange-500/50 hover:bg-gray-800/70 hover:text-orange-300 transition-all"
                >
                  <Search size={16} />
                  Find people
                </Link>

                <Link
                  href="/events"
                  className="rounded-full bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-600/25 hover:from-orange-500 hover:to-amber-500 hover:shadow-orange-600/40 transition-all"
                >
                  Create Event
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 rounded-full bg-gray-800/60 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                      {user.profileName?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden lg:inline">{user.profileName}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-2 z-50">
                      <Link
                        href="/my-profile"
                        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User size={16} />
                        My Profile
                      </Link>
                      <Link
                        href="/wallet"
                        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Wallet size={16} />
                        Wallet ({user.coins || 0} coins)
                      </Link>
                      <Link
                        href="/messages"
                        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <MessageCircle size={16} />
                        Messages
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings size={16} />
                        Settings
                      </Link>
                      <hr className="my-2 border-gray-800" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-gray-800 transition-colors w-full text-left"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/explore"
                  className="flex items-center gap-1.5 rounded-full border border-gray-700/70 bg-gray-800/40 px-4 py-2 text-sm font-medium text-gray-300 hover:border-orange-500/50 hover:bg-gray-800/70 hover:text-orange-300 transition-all"
                >
                  <Search size={16} />
                  Find people
                </Link>

                <Link
                  href="/register"
                  className="rounded-full bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-600/25 hover:from-orange-500 hover:to-amber-500 hover:shadow-orange-600/40 transition-all"
                >
                  Join Now
                </Link>

                <Link
                  href="/login"
                  className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="rounded-full p-2.5 text-gray-400 hover:bg-gray-800/60 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-400 ease-in-out ${
          mobileMenuOpen
            ? "max-h-screen border-b border-orange-900/20 bg-gray-950/95 backdrop-blur-lg"
            : "max-h-0"
        }`}
      >
        <div className="space-y-2 px-5 pb-6 pt-4">
          {user ? (
            <MobileAuthNavLinks closeMenu={() => setMobileMenuOpen(false)} user={user} onLogout={handleLogout} />
          ) : (
            <MobileNavLinks closeMenu={() => setMobileMenuOpen(false)} />
          )}
        </div>
      </div>
    </header>
  );
}

function NavLinks() {
  const links = [
    { href: "/nearby", label: "Nearby", icon: MapPin },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/about", label: "About", icon: Users },
  ];

  return (
    <div className="flex items-center gap-1.5 lg:gap-2">
      {links.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-gray-300 hover:bg-orange-950/30 hover:text-orange-300 transition-colors"
          >
            <Icon size={16} className="opacity-80 group-hover:opacity-100" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

function AuthNavLinks() {
  const links = [
    { href: "/dashboard", label: "Dashboard", icon: MapPin },
    { href: "/matches", label: "Matches", icon: Users },
    { href: "/meetings", label: "Meetings", icon: Calendar },
  ];

  return (
    <div className="flex items-center gap-1.5 lg:gap-2">
      {links.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-gray-300 hover:bg-orange-950/30 hover:text-orange-300 transition-colors"
          >
            <Icon size={16} className="opacity-80 group-hover:opacity-100" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

function MobileNavLinks({ closeMenu }) {
  const links = [
    { href: "/nearby", label: "Nearby People" },
    { href: "/events", label: "Events" },
    { href: "/about", label: "About" },
  ];

  return (
    <>
      <div className="flex flex-col gap-1.5">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-5 py-3.5 text-base font-medium text-gray-200 hover:bg-orange-950/30 hover:text-orange-300 active:bg-orange-950/50 transition-colors"
            onClick={closeMenu}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-gray-800/70 pt-6">
        <Link
          href="/explore"
          className="flex items-center justify-center gap-2 rounded-lg border border-orange-600/40 bg-orange-950/30 py-3.5 text-orange-300 hover:bg-orange-950/50"
          onClick={closeMenu}
        >
          <Search size={18} /> Find nearby people
        </Link>

        <Link
          href="/register"
          className="flex justify-center rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 py-3.5 font-semibold text-white hover:from-orange-500 hover:to-amber-500"
          onClick={closeMenu}
        >
          Join Now
        </Link>

        <Link
          href="/login"
          className="flex justify-center rounded-lg border border-gray-700 py-3.5 text-gray-300 hover:bg-gray-800/50"
          onClick={closeMenu}
        >
          Sign in
        </Link>
      </div>
    </>
  );
}

function MobileAuthNavLinks({ closeMenu, user, onLogout }) {
  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/explore", label: "Explore" },
    { href: "/matches", label: "Matches" },
    { href: "/meetings", label: "Meetings" },
    { href: "/messages", label: "Messages" },
    { href: "/events", label: "Events" },
    { href: "/my-profile", label: "My Profile" },
    { href: "/wallet", label: "Wallet" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <>
      <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
          {user.profileName?.charAt(0) || 'U'}
        </div>
        <div>
          <div className="font-semibold text-white">{user.profileName}</div>
          <div className="text-sm text-gray-400">{user.coins || 0} coins</div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-5 py-3.5 text-base font-medium text-gray-200 hover:bg-orange-950/30 hover:text-orange-300 active:bg-orange-950/50 transition-colors"
            onClick={closeMenu}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800/70">
        <button
          onClick={() => {
            onLogout();
            closeMenu();
          }}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-900/20 border border-red-500/30 py-3.5 text-red-400 hover:bg-red-900/30"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );
}