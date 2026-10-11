"use client";

import Image from "next/image";
import Link from "next/link";
import {
  LuArrowRight as ArrowRight,
  LuQuote as Quote,
} from "react-icons/lu";

// Small inline icons for the value cards (no extra imports needed)
const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const values = [
  {
    title: "Pure weaves",
    text: "Chosen with respect for traditional textiles",
    icon: (
      <svg {...iconProps}>
        <path d="M12 3l7 3v5c0 4.6-3 8.2-7 10-4-1.8-7-5.4-7-10V6z" />
        <path d="M8.8 12l2.3 2.3 4.3-4.6" />
      </svg>
    ),
  },
  {
    title: "Authentic craft",
    text: "Every drape, gown and saree, handpicked",
    icon: (
      <svg {...iconProps}>
        <circle cx="6" cy="6.5" r="2.6" />
        <circle cx="6" cy="17.5" r="2.6" />
        <path d="M8 8l12 10M8 16L20 6" />
      </svg>
    ),
  },
  {
    title: "Custom fit elegance",
    text: "Contemporary grace for modern women",
    icon: (
      <svg {...iconProps}>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
        <circle cx="17" cy="9" r="2.4" />
        <path d="M17 14c2.6 0 4.5 1.8 4.5 4.6" />
      </svg>
    ),
  },
];

// Faint gold diamond lattice used inside the plum arch
const lattice =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><path d='M22 2L42 22 22 42 2 22Z' fill='none' stroke='%23e6c88a' stroke-width='1.2'/><circle cx='22' cy='22' r='3' fill='%23e6c88a'/></svg>\")";

export default function OurStory() {
  return (
    <section className="w-full bg-[#faf6f2] py-14 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-10 border-b border-[#ebdcd0] overflow-hidden">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Photo: arch on the left (first on mobile, 5 cols on desktop) */}
        <div className="lg:col-span-5 flex justify-center px-3 sm:px-0">
          <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[440px]">
            {/* Gold outline ring */}
            <div className="absolute -inset-3 sm:-inset-4 rounded-t-[999px] rounded-b-[2rem] border border-[#c49a45]/50 pointer-events-none" />

            {/* Plum arch */}
            <div className="group relative aspect-[3/4] rounded-t-[999px] rounded-b-3xl overflow-hidden bg-gradient-to-br from-[#6b2160] via-[#5c1a52] to-[#2e0d33] shadow-2xl shadow-[#5c1a52]/30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(138,58,142,0.75),transparent_65%)]" />
              <div
                className="absolute inset-0 opacity-[0.10]"
                style={{ backgroundImage: lattice }}
              />
              <Image
                src="/mulberries-our-story.png"
                alt="Geethy Sobin, founder of Mulberries, in a traditional saree"
                fill
                sizes="(max-width: 1024px) 90vw, 440px"
                className="object-cover object-bottom drop-shadow-2xl transition-transform duration-700 group-hover:scale-[1.03]"
                priority
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl px-4 py-3 text-center shadow-xl">
                <p className="text-[15px] sm:text-[16px] font-semibold text-gray-950 leading-tight">
                  Geethy Sobin
                </p>
                <p className="mt-1 text-[11px] sm:text-[12px] font-medium text-gray-500 uppercase tracking-[0.12em]">
                  Founder & Creative Director
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copy: right side (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col justify-center min-w-0">
          <div className="inline-flex items-center text-[12px] sm:text-[13px] font-semibold tracking-[0.1em] uppercase text-[#c49a45] mb-3">
            <span>Our Heritage & Story</span>
          </div>

          <h2 className="font-playfair text-[28px] sm:text-[36px] lg:text-[44px] text-gray-950 font-bold leading-[1.15] tracking-[-0.02em] mb-6 max-w-[650px] text-balance">
            Bringing timeless <span className="italic font-playfair text-[#5c1a52]">traditional wear</span> for every chapter of you.
          </h2>

          <div className="flex gap-3 sm:gap-4 mb-6">
            <Quote
              size={28}
              className="shrink-0 text-[#e6c88a] fill-[#e6c88a] -mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="italic text-[15px] sm:text-[16px] lg:text-[17px] font-normal text-gray-800 leading-[1.6]">
                &ldquo;Started in 2013 with a vision to bring pure fabrics, authentic craftsmanship, and custom elegance to women across the UAE.&rdquo;
              </p>
              <span className="text-[12px] sm:text-[13px] font-semibold text-[#5c1a52] tracking-wider uppercase block mt-2">
                — Geethy Sobin, Founder
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-[15px] sm:text-[16px] lg:text-[17px] font-normal leading-[1.65] mb-8 max-w-[600px]">
            What began as an intimate boutique soon blossomed into a beloved fashion destination across the UAE. At Mulberries, every drape, gown, and saree is chosen with profound respect for <span className="font-semibold text-gray-800">traditional textiles</span> while embracing the contemporary grace of modern women.
          </p>

          {/* Value cards: stacked on mobile, 3 across from sm */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-2xl border border-[#ebdcd0] p-4 sm:p-5 shadow-sm shadow-[#5c1a52]/5 flex sm:block items-start gap-4"
              >
                <span className="grid place-items-center w-11 h-11 shrink-0 rounded-xl bg-[#f3e8f3] text-[#5c1a52] sm:mb-3">
                  {v.icon}
                </span>
                <div>
                  <h3 className="text-[15px] sm:text-[16px] font-semibold text-gray-950 leading-snug">
                    {v.title}
                  </h3>
                  <p className="mt-1 text-[13px] sm:text-[14px] font-normal text-gray-500 leading-[1.5]">
                    {v.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <Link
              href="/our-story"
              className="inline-flex items-center justify-center gap-2.5 bg-[#5c1a52] text-white px-7 py-3.5 rounded-full text-[14px] sm:text-[15px] font-semibold leading-[1.2] tracking-wider uppercase hover:bg-[#4a1543] transition-all shadow-md shadow-[#5c1a52]/20 hover:scale-[1.02] w-full sm:w-auto"
            >
              <span>Explore Our Full Story</span>
              <ArrowRight size={15} />
            </Link>
            <p className="text-[13px] sm:text-[14px] font-medium text-gray-600 leading-[1.4] text-center sm:text-left flex items-center justify-center sm:justify-start gap-2.5">
              <span className="text-[28px] sm:text-[32px] font-bold text-[#5c1a52] leading-none">2013</span>
              <span className="inline-block text-left">
                Serving women across the UAE
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}