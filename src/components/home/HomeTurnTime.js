// components/HomeTurnTime.jsx
"use client";

export default function HomeTurnTime() {
  return (
    <section className="relative bg-linear-to-b from-gray-950 to-black py-16 md:py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - Main text */}
          <div className="space-y-6 md:space-y-8 text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              Turn <span className="text-white">Time</span>
              <br />
              into <span className="text-orange-400">Currency</span>.
            </h2>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Depositing is free. Earned points can be withdrawn to your linked Paytm or bank account
              with a minimal platform fee. Your social life is now an asset.
            </p>

            {/* Stats - small rounded boxes */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl px-6 py-4 text-center min-w-35">
                <div className="text-2xl md:text-3xl font-bold text-white">50k+</div>
                <div className="text-sm md:text-base text-gray-400 mt-1">TRANSACTIONS</div>
              </div>

              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl px-6 py-4 text-center min-w-35">
                <div className="text-2xl md:text-3xl font-bold text-white">₹1.2M</div>
                <div className="text-sm md:text-base text-gray-400 mt-1">REWARDS PAID</div>
              </div>
            </div>
          </div>

          {/* Right side - Wallet card */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
            <div className="relative bg-linear-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/50 border border-gray-700/50 overflow-hidden">
              {/* Subtle glow accent */}
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

              <div className="text-center space-y-6 relative z-10">
                <div className="text-orange-400 uppercase text-sm md:text-base font-semibold tracking-wider">
                  STREET WALLET
                </div>

                <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-white">
                  1,250
                </div>

                <div className="text-xl md:text-2xl font-medium text-gray-300">
                  COINS
                </div>

                <div className="text-sm md:text-base text-gray-400">
                  READY TO WITHDRAW
                </div>

                {/* Withdraw button */}
                <button className="mt-4 w-full bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-lg py-4 px-8 rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-95">
                  Withdraw to Paytm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}