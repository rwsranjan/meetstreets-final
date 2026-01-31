"use client";

import { Coffee, Plane, ShieldCheck } from "lucide-react";

export default function HomePageCard() {
  const features = [
    {
      icon: Coffee,
      title: "Coffee & Chats",
      description:
        "Find interesting professionals to share a table and ideas. Every meetup adds to your Street Cred.",
    },
    {
      icon: Plane,
      title: "Transit Company",
      description:
        "Traveling across the city? Match with verified travelers for a safer, shared journey.",
    },
    {
      icon: ShieldCheck,
      title: "Urban Safety",
      description:
        "Verified ID, optional Police check, and community reporting ensures a gold-standard safety net.",
    },
  ];

  return (
    <section
      className="
        relative overflow-hidden
        bg-linear-to-b from-orange-50/40 via-white to-amber-50/30
        py-4 md:py-5 lg:py-8
      "
    >
      {/* subtle texture overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.02)_1px,transparent_0)] bg-size[18px_18px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* ================= Headline ================= */}
        <div className="text-center mb-4 md:mb-5 lg:mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Your City,
            <br className="sm:hidden" />{" "}
            <span className="text-orange-500">Reimagined.</span>
          </h2>

          <p className="mt-3 md:mt-4 text-base md:text-lg text-gray-600 font-medium tracking-wide uppercase">
            Built for the modern urbanite
          </p>
        </div>

        {/* ================= Cards Grid ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="
                group relative
                bg-white/95 backdrop-blur-[1px]
                border border-gray-200
                rounded-2xl md:rounded-3xl
                p-6 md:p-8 lg:p-10
                shadow-lg shadow-gray-100/80
                transition-all duration-300
                hover:shadow-xl hover:shadow-orange-100/50
                hover:border-orange-400/60 hover:-translate-y-1
                border-l-4 border-r-4
                border-l-orange-500 border-r-orange-500
              "
            >
              {/* Decorative glow */}
              <div className="absolute -top-8 -right-8 h-28 w-28 md:h-32 md:w-32 rounded-full bg-linear-to-br from-orange-100/40 to-amber-100/20 blur-2xl opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

              {/* Icon */}
              <div className="mb-6 md:mb-8 inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-linear-to-br from-orange-100 to-amber-100 text-orange-600 border border-orange-200 shadow-inner">
                <feature.icon size={28} strokeWidth={1.8} />
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
                {feature.title.split(" & ").map((part, i) => (
                  <span key={i}>
                    {i > 0 && " & "}
                    <span className={i === 0 ? "text-orange-600" : "text-gray-900"}>
                      {part}
                    </span>
                  </span>
                ))}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
