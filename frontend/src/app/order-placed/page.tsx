"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LuCircleCheck, LuPackage, LuShoppingBag, LuArrowRight } from "react-icons/lu";

function OrderPlacedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#FAFAF8]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-stone-200/80 p-8 text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
          <LuCircleCheck className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif text-stone-900 font-semibold mb-2">
          Thank you for your order!
        </h1>
        <p className="text-stone-600 text-sm mb-6 leading-relaxed">
          Your order has been placed successfully and is being processed by our team.
        </p>

        {orderId && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 mb-6">
            <span className="text-xs uppercase tracking-wider text-stone-500 font-medium block">
              Order Reference ID
            </span>
            <span className="text-sm font-mono font-semibold text-stone-800 break-all select-all">
              {orderId}
            </span>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/account"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors shadow-sm"
          >
            <LuPackage className="w-4 h-4" />
            View Order in Account
          </Link>
          <Link
            href="/shop"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-100 text-stone-700 text-sm font-medium hover:bg-stone-200 transition-colors"
          >
            <LuShoppingBag className="w-4 h-4" />
            Continue Shopping
            <LuArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderPlacedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-[#FAFAF8]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
        </div>
      }
    >
      <OrderPlacedContent />
    </Suspense>
  );
}
