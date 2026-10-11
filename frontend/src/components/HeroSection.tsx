"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LuArrowRight as ArrowRight,
  LuChevronLeft as ChevronLeft,
  LuChevronRight as ChevronRight,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import {
  FaShieldHalved,
  FaClock,
  FaScissors,
  FaUsers,
} from "react-icons/fa6";

const HERO_SLIDES = [
  {
    image: "/saree8.png",
    alt: "Mulberries Dubai Traditional Sarees",
  },
  {
    image: "/tradition.jpg",
    alt: "Mulberries Royal Kanjeevaram & Banarasi Sarees",
  },
  {
    image: "/shope1.png",
    alt: "Mulberries Modern Fusion & Festive Wear",
  },
];

const TRUST_METRICS = [
  {
    icon: FaShieldHalved,
    title: "100% PURE",
    subtitle: "Authentic Fabric",
  },
  {
    icon: FaClock,
    title: "SINCE 2013",
    subtitle: "11+ Yrs in Dubai",
  },
  {
    icon: FaScissors,
    title: "CUSTOM FIT",
    subtitle: "Custom Stitching",
  },
  {
    icon: FaUsers,
    title: "50,000+",
    subtitle: "Happy Customers",
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Automatic slide interval (every 4.8 seconds)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4800);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Touch gesture support for mobile swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    setTouchStartX(null);
  };

  return (
    <section className="relative w-full bg-gradient-to-b from-[#faf6f2] via-[#f7f2eb] to-[#f3ece3] overflow-hidden select-none border-b border-[#ebdcd0]">
      {/* ── Ambient Radial Lighting (Desktop) ──────────────────────────── */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[550px] h-[550px] bg-[radial-gradient(ellipse_at_center,_rgba(92,26,82,0.06),_transparent_70%)] hidden lg:block" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(196,154,69,0.08),_transparent_70%)] hidden lg:block" />

      {/* ── Subtle Background Paisley Flourishes (Desktop) ────────────── */}
      <svg
        className="pointer-events-none absolute top-4 left-6 w-72 h-72 text-[#c49a45]/15 hidden lg:block"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M40,100 C40,50 80,20 120,30 C160,40 180,80 160,120 C140,160 90,170 60,150 C30,130 50,90 80,90 C100,90 120,110 110,130 C100,150 70,140 70,120" />
        <circle cx="110" cy="50" r="3" fill="currentColor" />
        <circle cx="150" cy="70" r="2.5" fill="currentColor" />
        <circle cx="130" cy="110" r="2" fill="currentColor" />
        <path d="M20,60 C30,30 60,20 90,30" strokeDasharray="3 3" />
        <circle cx="30" cy="40" r="2" fill="currentColor" />
        <circle cx="50" cy="25" r="1.5" fill="currentColor" />
      </svg>

      <svg
        className="pointer-events-none absolute bottom-8 left-[38%] w-80 h-80 text-[#c49a45]/12 hidden sm:block"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M100,180 C60,180 30,150 40,110 C50,70 90,50 130,60 C170,70 180,110 160,140 C140,170 100,150 100,130 C100,110 120,90 140,100" />
        <circle cx="60" cy="130" r="3" fill="currentColor" />
        <circle cx="80" cy="160" r="2" fill="currentColor" />
        <circle cx="140" cy="80" r="2.5" fill="currentColor" />
      </svg>

      {/* ─────────────────────────────────────────────────────────────
          1. MOBILE DESIGN (Matches the uploaded reference image)
          Full-bleed auto-sliding hero with dark gradient & bottom trust bar
      ───────────────────────────────────────────────────────────── */}
      <div className="block lg:hidden">
        {/* Main Sliding Hero Card */}
        <div
          className="relative w-full min-h-[580px] sm:min-h-[640px] flex flex-col justify-end overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Background Sliding Images with Smooth Cross-fade */}
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.image}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={idx === 0}
                sizes="100vw"
                className="object-cover object-top"
              />
            </div>
          ))}

          {/* Atmospheric Dark Gradient Overlay (Ensures crystal clear text contrast like reference) */}
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#1b0618]/95 via-[#1b0618]/50 to-transparent pointer-events-none" />
          <div className="absolute inset-0 z-20 bg-black/15 pointer-events-none" />

          {/* Overlaid Editorial Content */}
          <div className="relative z-30 px-5 sm:px-6 pt-20 sm:pt-24 pb-4 flex flex-col items-start text-left">
            {/* Top Collection Line & Badge */}
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="w-7 h-[1.5px] bg-[#c49a45]" />
              <span className="text-[11.5px] sm:text-[13px] font-semibold tracking-[0.16em] uppercase text-[#f5d796] drop-shadow-xs">
                NEW SEASON ETHNIC WEAR
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-playfair text-[30px] sm:text-[42px] font-semibold text-white leading-[1.12] tracking-[-0.02em] mb-3 drop-shadow-sm max-w-lg">
              Making people <span className="italic font-playfair text-[#f5d796] font-semibold">fall</span>
              <br />
              <span className="italic font-playfair text-[#f5d796] font-semibold">in love</span> with our
              <br />
              clothes.
            </h1>

            {/* Subtitle */}
            <p className="text-white/85 text-[13.5px] sm:text-[15px] leading-[1.55] max-w-[520px] mb-6 font-normal">
              At Mulberries Boutique, we craft each piece with passion, blending style, comfort and elegance, making you fall in love with fashion that speaks to you.
            </p>

            {/* Action CTA Buttons */}
            <div className="flex items-center gap-2.5 sm:gap-3 w-full max-w-md mb-6">
              <Link
                href="/traditional"
                className="flex-1 min-w-0 h-12 inline-flex items-center justify-center gap-2 bg-white text-[#240821] hover:bg-stone-50 px-4 sm:px-5 rounded-full text-[12px] min-[380px]:text-[13px] sm:text-[14px] font-semibold tracking-wide uppercase transition-all duration-300 shadow-xl shadow-black/35 active:scale-[0.98] group cursor-pointer whitespace-nowrap"
              >
                <span>EXPLORE TRADITIONAL SAREES</span>
                <ArrowRight size={15} className="stroke-[2.5] flex-shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="https://wa.me/971504715912"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all shadow-lg active:scale-95 flex-shrink-0 cursor-pointer"
                aria-label="Chat with Stylist on WhatsApp"
              >
                <FaWhatsapp size={22} className="text-[#25D366] drop-shadow-xs" />
              </a>
            </div>

            {/* Slider Dots / Pill Indicators (Matching Screenshot with touch-friendly targets) */}
            <div className="w-full flex items-center justify-center gap-1.5 pt-1 pb-1">
              {HERO_SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className="p-1.5 cursor-pointer flex items-center justify-center"
                >
                  <span
                    className={`h-1.5 transition-all duration-300 rounded-full block ${
                      index === currentSlide
                        ? "w-8 bg-white shadow-xs"
                        : "w-2 bg-white/45 hover:bg-white/70"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Mobile Bottom Value Propositions Strip (Matching Reference Image) ── */}
        <div className="w-full bg-white border-b border-[#ebdcd0] py-4 px-2 sm:px-4">
          <div className="grid grid-cols-4 divide-x divide-gray-200 max-w-xl mx-auto">
            {TRUST_METRICS.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.title}
                  className="flex flex-col items-center justify-center px-1 text-center"
                >
                  <Icon size={19} className="text-[#96286b] mb-1.5" />
                  <span className="text-[10px] sm:text-xs font-bold text-[#240821] uppercase tracking-wider block leading-tight">
                    {metric.title}
                  </span>
                  <span className="text-[8.5px] sm:text-[10.5px] text-[#786657] block leading-tight mt-0.5 truncate max-w-full font-light">
                    {metric.subtitle}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DESKTOP DESIGN (Editorial Left + Sliding Model Frame Right)
      ───────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex relative w-full max-w-[1536px] mx-auto min-h-[620px] xl:min-h-[660px]">
        {/* ── Left Editorial Column ─────────────────────────── */}
        <div className="w-[58%] xl:w-[60%] flex flex-col justify-between pt-12 pb-10 pl-12 xl:pl-16 pr-8 z-10">
          <div>
            {/* Top Badge: NEW SEASON ETHNIC WEAR */}
            <div className="mb-4">
              <span className="text-[12px] sm:text-[13px] font-semibold tracking-[0.18em] uppercase text-[#c49a45]">
                NEW SEASON ETHNIC WEAR
              </span>
            </div>

            {/* Headline: Making people fall in love with our clothes. */}
            <h1 className="font-playfair text-[50px] xl:text-[58px] font-semibold text-[#240821] leading-[1.08] tracking-[-0.02em] mb-5 max-w-xl">
              Making people <span className="italic font-playfair text-[#5c1a52] font-semibold">fall</span>
              <br />
              <span className="italic font-playfair text-[#5c1a52] font-semibold">in love</span> with our
              <br />
              clothes.
            </h1>

            {/* Subtitle */}
            <p className="text-[#6b5849] text-[15px] sm:text-[16px] leading-[1.6] max-w-[520px] mb-9 font-normal">
              At Mulberries Boutique, we craft each piece with passion, blending style, comfort and elegance, making you fall in love with fashion that speaks to you.
            </p>

            {/* Action CTA Buttons */}
            <div className="flex items-center gap-4 mb-12">
              <Link
                href="/traditional"
                className="inline-flex items-center justify-center gap-2.5 bg-[#5c1a52] hover:bg-[#43123b] text-white px-7 py-3.5 rounded-full text-[14px] sm:text-[15px] font-semibold tracking-wider uppercase transition-all duration-300 shadow-lg shadow-[#5c1a52]/20 hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
              >
                <span>EXPLORE TRADITIONAL SAREES</span>
                <ArrowRight size={14} className="stroke-[2.5] transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="https://wa.me/971504715912"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-[#240821] border border-[#ebdcd0] hover:border-[#5c1a52]/40 px-6 py-3.5 rounded-full text-[14px] sm:text-[15px] font-semibold tracking-wide transition-all duration-300 shadow-xs cursor-pointer"
              >
                <FaWhatsapp size={22} className="text-[#25D366] shrink-0" />
                <span>WhatsApp Stylist</span>
              </a>
            </div>
          </div>

          {/* ── Bottom Trust Strip on Desktop ───────── */}
          <div className="pt-6 border-t border-[#ebdcd0]">
            <div className="grid grid-cols-4 gap-4">
              {TRUST_METRICS.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.title} className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#ebdcd0] flex items-center justify-center text-[#5c1a52] shadow-xs flex-shrink-0">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-[#240821] leading-tight">
                        {metric.title}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-[#786657] truncate font-light">
                        {metric.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right Model Visual Frame with Automatic Image Slide ── */}
        <div
          className="w-[42%] xl:w-[40%] relative min-h-[620px] xl:min-h-[660px] group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Angled Golden Divider Seam on Desktop */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            <div
              className="absolute -top-1 -bottom-1 left-0 w-[2px] bg-gradient-to-b from-[#f5d796] via-[#dca858] to-[#c49a45] shadow-[0_0_12px_rgba(220,168,88,0.5)] origin-top-left"
              style={{
                transform: "skewX(-5deg)",
              }}
            />
          </div>

          {/* Sliding Model Images with Diagonal Clip on Desktop */}
          <div className="relative w-full h-full min-h-[620px] xl:min-h-[660px] overflow-hidden bg-[#efe7dc] [clip-path:polygon(5%_0%,100%_0%,100%_100%,0%_100%)]">
            {HERO_SLIDES.map((slide, idx) => (
              <div
                key={slide.image}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={idx === 0}
                  sizes="45vw"
                  className="object-cover object-top"
                />
              </div>
            ))}

            {/* Subtle Vignettes for Atmospheric Contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#faf6f2]/30 via-transparent to-transparent pointer-events-none z-15" />

            {/* Desktop Slide Navigation Chevrons */}
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#240821] flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#240821] flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>

            {/* Desktop Slide Indicators */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/35 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
              {HERO_SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                    index === currentSlide
                      ? "w-7 bg-white shadow-xs"
                      : "w-1.5 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>

            {/* ── Floating Glass Card: NEW IN • BRIDAL EDIT ─────── */}
            <Link
              href="/festive"
              className="absolute bottom-20 left-6 z-20 bg-white/95 hover:bg-white backdrop-blur-md border border-[#ebdcd0] rounded-2xl p-4 max-w-[240px] text-[#240821] shadow-[0_12px_32px_rgba(43,12,39,0.12)] transition-all duration-300 hover:scale-[1.02] group"
            >
              <span className="text-[9.5px] font-bold tracking-[0.2em] uppercase text-[#5c1a52] block mb-1.5">
                NEW IN &bull; BRIDAL EDIT
              </span>
              <p className="font-serif text-xs leading-snug font-medium text-[#240821] group-hover:text-[#5c1a52] transition-colors">
                Zari-woven sarees, made to be remembered
              </p>
            </Link>

            {/* ── Floating Badge: 11+ years in Dubai ───────────── */}
            <div className="absolute top-1/2 -translate-y-1/2 right-6 z-20 bg-white/95 backdrop-blur-md border border-[#ebdcd0] rounded-xl px-3.5 py-2 flex items-center gap-2 text-[#240821] shadow-[0_8px_24px_rgba(43,12,39,0.1)]">
              <span className="font-serif text-2xl font-bold text-[#5c1a52] leading-none">
                11+
              </span>
              <span className="text-[9.5px] font-light uppercase tracking-wider leading-tight text-[#786657]">
                years
                <br />
                in Dubai
              </span>
            </div>

            {/* ── Floating Pill: Chat with a stylist ───────────── */}
            <a
              href="https://wa.me/971504715912"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-6 right-6 z-20 bg-[#240821] hover:bg-[#3d0f37] text-white text-xs font-semibold px-4 py-2.5 rounded-full flex items-center gap-2 shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaWhatsapp className="text-[#25D366] shrink-0" size={18} />
              <span>Chat with a stylist</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}