"use client";

import {
  LuTruck as Truck,
  LuSparkles as Sparkles,
} from "react-icons/lu";
import { useCart } from "@/context/CartContext";

const FREE_SHIPPING_THRESHOLD = 299;

export default function CompleteTheLookClient() {
  const { totalPrice } = useCart();
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - totalPrice, 0);
  const progress = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const unlocked = remaining <= 0;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#5c1a52] via-[#4d1644] to-[#3b0f34] text-white rounded-2xl p-6 flex flex-col justify-between shadow-sm border border-white/10 group hover:shadow-lg transition-all duration-300">
      {/* Liquid sheen hover sweep */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
            {unlocked ? (
              <Sparkles size={18} className="text-[#f5d796] animate-pulse" />
            ) : (
              <Truck size={18} className="text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-[#f5d796] uppercase tracking-[0.2em] block mb-0.5">
              {unlocked ? "Free Delivery Unlocked" : "Free Delivery"}
            </span>
            <p className="text-xs sm:text-sm font-medium leading-snug">
              {unlocked ? (
                <span className="font-bold text-[#f9df9e] flex items-center gap-1.5">
                  {/* <Sparkles size={14} className="text-[#f5d796] shrink-0 animate-pulse" /> */}
                  You&apos;ve unlocked FREE UAE Shipping!
                </span>
              ) : (
                <>
                  Add <span className="font-bold text-[#f5d796]">AED {remaining.toFixed(0)}</span> more for <span className="font-bold">FREE SHIPPING</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Progress Bar with smooth liquid animation */}
        <div className="w-full h-2 bg-black/25 rounded-full overflow-hidden relative border border-white/10">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out relative ${unlocked
              ? "bg-gradient-to-r from-[#c49a45] via-[#fae09e] to-[#d4af37] shadow-[0_0_12px_rgba(245,215,150,0.5)]"
              : "bg-gradient-to-r from-[#b8843f] via-[#f5d796] to-[#fff4cf]"
              }`}
            style={{ width: `${Math.max(progress, 4)}%` }}
          >
            {/* Subtle animated shimmer inside bar */}
            <div className="absolute inset-0 bg-white/35 animate-pulse" />
          </div>
        </div>

        <div className="flex justify-between text-[10.5px] text-purple-200/80 mt-1.5 font-mono">
          <span>AED 0</span>
          <span>AED {FREE_SHIPPING_THRESHOLD}</span>
        </div>
      </div>

      <p className="text-[10px] text-purple-200/70 mt-3 font-light">
        Applicable across all Emirates &bull; Express delivery in 2-4 days
      </p>
    </div>
  );
}
