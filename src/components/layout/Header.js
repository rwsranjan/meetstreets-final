// components/Header.jsx
"use client";

import Link from "next/link";
import { Menu, X, MapPin, Users, Calendar, Search } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-orange-900/30 bg-linear-to-b from-gray-950 via-gray-950 to-gray-900/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* Logo + Name */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 via-amber-500 to-yellow-500 text-white font-bold text-xl shadow-lg shadow-orange-600/30 transition-transform group-hover:scale-105">
            MS
          </div>
          <span className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Meet<span className="text-orange-400">Street</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-2 lg:gap-3 md:flex">
          <NavLinks />

          <div className="ml-6 flex items-center gap-4">
            <Link
              href="/search"
              className="flex items-center gap-1.5 rounded-full border border-gray-700/70 bg-gray-800/40 px-4 py-2 text-sm font-medium text-gray-300 hover:border-orange-500/50 hover:bg-gray-800/70 hover:text-orange-300 transition-all"
            >
              <Search size={16} />
              Find people
            </Link>

            <Link
              href="/events"
              className="rounded-full bg-linear-to-r from-orange-600 to-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-600/25 hover:from-orange-500 hover:to-amber-500 hover:shadow-orange-600/40 transition-all"
            >
              Create Event
            </Link>

            <Link
              href="/login"
              className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Sign in
            </Link>
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
          <MobileNavLinks closeMenu={() => setMobileMenuOpen(false)} />

          <div className="mt-6 flex flex-col gap-4 border-t border-gray-800/70 pt-6">
            <Link
              href="/search"
              className="flex items-center justify-center gap-2 rounded-lg border border-orange-600/40 bg-orange-950/30 py-3.5 text-orange-300 hover:bg-orange-950/50"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search size={18} /> Find nearby people
            </Link>

            <Link
              href="/events"
              className="flex justify-center rounded-lg bg-linear-to-r from-orange-600 to-amber-600 py-3.5 font-semibold text-white hover:from-orange-500 hover:to-amber-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Create New Event
            </Link>

            <Link
              href="/login"
              className="flex justify-center rounded-lg border border-gray-700 py-3.5 text-gray-300 hover:bg-gray-800/50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign in / Join
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLinks() {
  const links = [
    { href: "/nearby", label: "Nearby", icon: MapPin },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/people", label: "People", icon: Users },
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
    { href: "/events", label: "Upcoming Events" },
    { href: "/people", label: "Discover People" },
    { href: "/create", label: "Create Event" },
    { href: "/about", label: "About Meet Street" },
  ];

  return (
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
  );
}