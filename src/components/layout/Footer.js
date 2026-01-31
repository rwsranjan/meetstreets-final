// components/Footer.jsx
import Link from "next/link";
import { MapPin, Twitter, Instagram, Facebook, Linkedin, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-linear-to-b from-gray-950 to-black border-t border-orange-900/20 text-gray-400">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
          {/* Brand & short description */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 via-amber-500 to-yellow-500 text-white font-bold text-lg shadow-md">
                MS
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Meet<span className="text-orange-400">Street</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Discover real people, real moments, right where you are. 
              Spontaneous hangouts, local events, and street-level connections.
            </p>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              Made with <Heart size={14} className="text-orange-500 mx-1" /> in the streets
            </div>
          </div>

          {/* Navigation columns */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/nearby" className="hover:text-orange-400 transition-colors">Nearby People</Link></li>
              <li><Link href="/events" className="hover:text-orange-400 transition-colors">Events</Link></li>
              <li><Link href="/search" className="hover:text-orange-400 transition-colors">Search & Discover</Link></li>
              <li><Link href="/create" className="hover:text-orange-400 transition-colors">Create Event</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-orange-400 transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-orange-400 transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-orange-400 transition-colors">Careers</Link></li>
              <li><Link href="/press" className="hover:text-orange-400 transition-colors">Press</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/help" className="hover:text-orange-400 transition-colors">Help Center</Link></li>
              <li><Link href="/safety" className="hover:text-orange-400 transition-colors">Safety</Link></li>
              <li><Link href="/community" className="hover:text-orange-400 transition-colors">Community Guidelines</Link></li>
              <li><Link href="/contact" className="hover:text-orange-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-200 mb-4">Follow Us</h3>
            <div className="flex gap-4 mb-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800/50 py-6 text-center text-sm md:flex md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            © {new Date().getFullYear()} MeetStreet. All rights reserved.
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/privacy" className="hover:text-orange-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-orange-400 transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-orange-400 transition-colors">Cookie Policy</Link>
            <span className="text-gray-600">Made in Jaipur 🏜️</span>
          </div>
        </div>
      </div>
    </footer>
  );
}