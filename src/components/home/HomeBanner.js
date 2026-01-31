"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

/* =========================
   Banner Slides Data
========================= */
const bannerSlides = [
  {
    title: "Coffee in Bandra",
    description:
      "Meet over coffee and earn StreetCoins while making real connections.",
    image: "/home-image/home-banner-coffee.webp",
    location: "Near Starbucks Reserve",
    coins: "+500 Coins",
  },
  {
    title: "Movie Night",
    description:
      "Shared movies, shared moments, and rewards that matter.",
    image: "/home-image/home-banner-buddies.webp",
    location: "PVR Juhu",
    coins: "+350 Coins",
  },
  {
    title: "Travel Buddies",
    description:
      "Find travel partners and get rewarded for every journey.",
    image: "/home-image/home-banner-travel.webp",
    location: "Gateway of India",
    coins: "+800 Coins",
  },
];

export default function HomeBanner() {
  const [current, setCurrent] = useState(0);

  /* =========================
     Auto Slide Change
  ========================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) =>
        prev === bannerSlides.length - 1 ? 0 : prev + 1
      );
    }, 4000); // change every 4 sec

    return () => clearInterval(interval);
  }, []);

  const slide = bannerSlides[current];

  return (
    <section className=" relative bg-white text-gray-900 overflow-hidden
  pt-8 pb-6
  sm:pt-12 sm:pb-10
  lg:pt-10 lg:pb-12">
      {/* Soft warm overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-orange-50/30 via-transparent to-amber-50/20 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-15">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          
          {/* ================= LEFT CONTENT ================= */}
          <div className="space-y-8 lg:space-y-10">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
              Urban Meetups.
              <br />
              <span className="text-orange-500">Rewarding</span> Connections.
            </h1>

            {/* Dynamic paragraph */}
            <p className="max-w-xl text-lg text-gray-700 sm:text-xl leading-relaxed transition-all duration-500">
              {slide.description}
            </p>

            <div className="flex flex-wrap gap-4 sm:gap-6">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full
                bg-linear-to-r from-orange-600 to-amber-600
                px-8 py-4 text-base font-semibold text-white
                shadow-lg shadow-orange-500/30
                hover:from-orange-500 hover:to-amber-500
                hover:shadow-orange-600/40
                transition-all duration-300"
              >
                Join the Street →
              </Link>

              <Link
                href="/download"
                className="inline-flex items-center justify-center rounded-full
                px-8 py-4 text-base font-semibold text-white
                bg-linear-to-b from-gray-950 via-gray-950 to-gray-900/90
                border border-gray-800
                shadow-lg shadow-black/40
                transition-all duration-300
                hover:from-gray-900 hover:via-gray-800 hover:to-gray-700
                hover:border-gray-600
                hover:shadow-xl hover:shadow-black/60"
              >
                Download App
              </Link>
            </div>
          </div>

          {/* ================= RIGHT IMAGE CARD ================= */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none order-first lg:order-last">
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl shadow-gray-300/40 border border-gray-200 aspect-4/5 lg:aspect-square">
              
              {/* Dynamic Image */}
              <Image
                key={slide.image}
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover brightness-95 transition-opacity duration-700"
                priority
                quality={85}
              />

              {/* Bottom overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent pointer-events-none" />

              {/* Overlay text */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">
                  {slide.title}
                </h3>

                <div className="flex items-center gap-2 text-orange-200 text-sm sm:text-base drop-shadow">
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{slide.location}</span>
                </div>
              </div>

              {/* Coins badge */}
              <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6
                inline-flex items-center rounded-full
                bg-linear-to-r from-orange-600 to-amber-600
                px-4 py-2 text-sm font-semibold text-white shadow-md">
                {slide.coins}
              </div>

              {/* Decorative glow */}
              <div className="absolute -top-10 -right-10 h-28 w-28 sm:h-32 sm:w-32 rounded-xl bg-orange-400/20 blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
