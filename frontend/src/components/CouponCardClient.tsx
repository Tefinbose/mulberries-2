"use client";

import { useState } from "react";
import {
  LuTag as Tag,
  LuCheck as Check,
  LuCopy as Copy,
} from "react-icons/lu";

type CouponData = {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  description?: string;
} | null;

export default function CouponCardClient({ coupon }: { coupon: CouponData }) {
  const [copied, setCopied] = useState(false);

  if (!coupon) {
    return (
      <div className="bg-[#faf6f2] border border-[#ebdcd0] rounded-2xl p-6 flex flex-col justify-center items-center text-center transition-all duration-300 hover:shadow-md hover:border-[#c49a45]/40 group">
        <span className="text-[10px] font-bold text-[#c49a45] uppercase tracking-[0.2em] mb-1">
          Special Offer
        </span>
        <p className="text-sm font-bold text-gray-900 mb-1 group-hover:text-[#5c1a52] transition-colors">
          UAE Express Delivery
        </p>
        <p className="text-xs text-gray-500">Free priority courier on orders above AED 299</p>
      </div>
    );
  }

  const discountLabel =
    coupon.discountType === "percentage"
      ? `${coupon.discountValue}% OFF`
      : `AED ${coupon.discountValue} OFF`;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    if (coupon?.code) {
      navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#5c1a52] via-[#521648] to-[#3d1136] text-white rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-sm border border-white/10 group hover:shadow-lg transition-all duration-300">
      {/* Background liquid sheen */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      <span className="text-[10px] font-bold text-[#f5d796] uppercase tracking-[0.22em] mb-1">
        Exclusive Privilege
      </span>
      <p className="font-serif text-2xl font-normal tracking-wide mb-1 text-white">
        {discountLabel}
      </p>
      {coupon.description && (
        <p className="text-xs text-purple-200/90 mb-3 leading-snug font-light max-w-[260px]">
          {coupon.description}
        </p>
      )}

      {/* Copyable Code Button */}
      <button
        onClick={handleCopy}
        title="Click to copy coupon code"
        className="flex items-center gap-2 bg-white/15 hover:bg-white/25 active:scale-95 border border-white/30 rounded-full px-4 py-1.5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
      >
        {copied ? (
          <>
            <Check size={12} className="text-emerald-400 stroke-[3]" />
            <span className="text-emerald-300 font-bold tracking-[0.18em] text-xs">COPIED!</span>
          </>
        ) : (
          <>
            <Tag size={12} className="text-[#f5d796]" />
            <span className="text-white font-bold tracking-[0.2em] text-xs font-mono">
              {coupon.code}
            </span>
            <Copy size={11} className="text-purple-300 group-hover:text-white transition-colors" />
          </>
        )}
      </button>
      <p className="text-[10.5px] text-purple-300/80 mt-2 font-light">
        {copied ? "Coupon copied to clipboard!" : "Click to copy & apply at checkout"}
      </p>
    </div>
  );
}
