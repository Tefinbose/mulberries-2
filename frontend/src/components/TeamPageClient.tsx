"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LuLayers,
  LuX,
  LuChevronLeft,
  LuChevronRight,
  LuArrowRight,
  LuMaximize2,
  LuSparkles,
} from "react-icons/lu";
import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";

const leadershipTeam = [
  {
    name: "ASHRAF THALASSERY",
    role: "MANAGER",
    tag: "UAE Operations",
    image: "/manager.png",
  },
  {
    name: "BASHEER KOVVAL",
    role: "FLOOR MANAGER DUBAI, UAE",
    tag: "Dubai Boutique",
    image: "/Floor%20Manager%20DubaiUAE.png",
  },
  {
    name: "RENEESH KOYYERI",
    role: "FLOOR MANAGER ABU DHABI, UAE",
    tag: "Abu Dhabi Boutique",
    image: "/Floor%20Manager%20Abu%20Dhabi,UAE.png",
  },
  {
    name: "SHABAB VN",
    role: "SHARJAH FLOOR MANAGER",
    tag: "Sharjah Boutique",
    image: "/Sharjah%20floor%20manager.png",
  },
];

const inaugurationPhoto = {
  src: "/team/innaguration.png",
  title: "Grand Boutique Ribbon Cutting",
  caption: "Official opening celebration with founders, family, and team",
};

const galleryMoments = [
  {
    id: 0,
    title: "Boutique Team Celebration",
    caption: "Our showroom team at the signature floral wings backdrop",
    src: "/team/team.png",
  },
  {
    id: 1,
    title: "Signature Wings & Silk Showcase",
    caption: "Iconic floral wings display wall with pure silks and accessories",
    src: "/team/wings-display.png",
  },
  {
    id: 2,
    title: "Flagship Boutique Storefront",
    caption: "Storefront grand entrance with festive celebration arch",
    src: "/shop.jpg",
  },
  {
    id: 3,
    title: "Founder Geethy Sobin with Guest",
    caption: "Creative Director Geethy Sobin celebrating boutique milestones",
    src: "/team/foundandfrnd.png",
  },
  {
    id: 4,
    title: "Boutique Interior & Collections",
    caption: "Showroom floor featuring handcrafted festive wear and gowns",
    src: "/shope1.png",
  },
  {
    id: 5,
    title: "Illuminated Grand Entrance",
    caption: "Boutique glass facade and curated mannequins showcase",
    src: "/team/image.png",
  },
];

export default function TeamPageClient() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const allLightboxPhotos = [inaugurationPhoto, ...galleryMoments];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev === 0 ? allLightboxPhotos.length - 1 : prev - 1) : null
        );
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev === allLightboxPhotos.length - 1 ? 0 : prev + 1) : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, allLightboxPhotos.length]);

  return (
    <main className="bg-[#fbf9f6] text-[#240821] min-h-screen">
      
      {/* ── 1. Modern Editorial Hero: Clean Typography + Unobstructed Full Team Photo ── */}
      <section className="pt-12 sm:pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Editorial Top Title & Intro (Crisp, modern, zero clutter) */}
        <div className="max-w-3xl mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-8 h-[1px] bg-[#5c1a52]" />
            <span className="text-[11px] font-semibold tracking-[0.25em] text-[#5c1a52] uppercase">
              The Mulberries Family
            </span>
          </div>

          <h1
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl sm:text-5xl lg:text-6xl font-playfair font-normal text-[#1e081c] tracking-tight leading-[1.15] mb-4"
          >
            Meet Our <span className="italic font-playfair font-semibold text-[#5c1a52]">Team</span>
          </h1>

          <p className="text-base sm:text-lg text-[#614e5f] font-light leading-relaxed max-w-2xl">
            Meet the experts at Mulberries, working together to ensure every piece reflects your unique style.
          </p>
        </div>

        {/* Unobstructed, Crisp Panoramic Photo Card */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#e8ded4] bg-white shadow-sm">
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[2.4/1]">
            <Image
              src="/team/TeamHomePage.png"
              alt="Mulberries Team in the Showroom"
              fill
              priority
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="object-cover object-center"
            />
          </div>

          {/* Clean Bottom Metadata Bar */}
          <div className="px-5 py-3.5 sm:px-8 sm:py-4 bg-white/95 border-t border-[#f0e6dd] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#4a3948]">
              <span className="w-2 h-2 rounded-full bg-[#5c1a52]" />
              <span className="font-medium">Flagship Showroom Team &bull; Dubai, Abu Dhabi & Sharjah</span>
            </div>

            {/* Social Channels */}
            <div className="flex items-center gap-3 text-xs text-[#735e4d]">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Follow us:</span>
              <a
                href="https://www.instagram.com/mulberriesboutique"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#faf5f9] hover:bg-[#5c1a52] text-[#5c1a52] hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={14} />
              </a>
              <a
                href="https://www.facebook.com/Mulberries"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#faf5f9] hover:bg-[#5c1a52] text-[#5c1a52] hover:text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <FaFacebookF size={13} />
              </a>
              <a
                href="https://www.tiktok.com/@mulberriesboutique"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#faf5f9] hover:bg-[#5c1a52] text-[#5c1a52] hover:text-white flex items-center justify-center transition-colors"
                aria-label="TikTok"
              >
                <FaTiktok size={13} />
              </a>
            </div>
          </div>
        </div>

      </section>

      {/* ── 2. "Our Value" Section (Clean Split Layout with Real Photos) ── */}
      <section id="our-values" className="py-16 sm:py-20 border-t border-[#ebdcd0] bg-white scroll-mt-12 relative">
        <span id="gallery" className="absolute -top-20 left-0 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left Column: Inauguration Grand Ribbon Cutting Photo */}
            <div className="lg:col-span-5">
              <div
                onClick={() => setLightboxIndex(0)}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-[#ebdcd0] bg-white shadow-xs hover:border-[#5c1a52] transition-colors"
              >
                <div className="relative aspect-[4/5] sm:aspect-[4/5.2] w-full bg-gray-100">
                  <Image
                    src={inaugurationPhoto.src}
                    alt={inaugurationPhoto.title}
                    fill
                    sizes="(min-width: 1024px) 480px, 100vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-black/60 px-3 py-1.5 rounded-full">
                      <LuMaximize2 size={13} />
                      <span>View Photo</span>
                    </span>
                  </div>
                </div>
                
                <div className="p-3.5 bg-white border-t border-[#f0e6dd]">
                  <p className="text-xs sm:text-sm font-playfair font-bold text-[#240821]">Grand Boutique Ribbon Cutting</p>
                  <p className="text-[11px] text-[#735e4d]">Mulberries celebration with founders, family & team</p>
                </div>
              </div>
            </div>

            {/* Right Column: Values Statement & 2x3 Moments Gallery */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              
              <div>
                <span
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  className="text-xs font-playfair font-bold tracking-[0.2em] text-[#8a4b82] uppercase block mb-2"
                >
                  Our Value
                </span>

                <h2
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  className="font-playfair text-2xl sm:text-4xl lg:text-5xl font-semibold text-[#1e081c] leading-tight tracking-[-0.01em] mb-3"
                >
                  Clothes brighten you to the extent you deserve.
                </h2>

                <p className="text-sm sm:text-base text-[#614e5f] font-light leading-relaxed mb-6">
                  Mulberries&apos; outfits illuminate your personality, giving you the vibrant style and confidence you truly deserve
                </p>

                {/* Sub-feature point */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#faf6f2] border border-[#ebdcd0] mb-8">
                  <div className="w-9 h-9 rounded-lg bg-[#5c1a52] text-white flex items-center justify-center shrink-0">
                    <LuLayers size={18} />
                  </div>
                  <span
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    className="text-sm sm:text-base font-playfair font-bold text-[#240821]"
                  >
                    Empowering You Through Fashion That Reflects Your Worth
                  </span>
                </div>
              </div>

              {/* 2x3 Moments Gallery Grid */}
              <div>
                <p
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  className="text-xs font-playfair font-bold uppercase tracking-wider text-[#735e4d] mb-3"
                >
                  Showroom Moments & Celebrations
                </p>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
                  {galleryMoments.map((moment, idx) => (
                    <div
                      key={moment.id}
                      onClick={() => setLightboxIndex(idx + 1)}
                      className="group cursor-pointer relative aspect-[4/3] rounded-xl overflow-hidden border border-[#ebdcd0] bg-gray-100 hover:border-[#5c1a52] transition-colors"
                    >
                      <Image
                        src={moment.src}
                        alt={moment.title}
                        fill
                        sizes="(min-width: 1024px) 240px, 33vw"
                        className="object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <LuMaximize2 size={16} className="text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── 3. Store Leadership Section (Distinct heading, zero redundancy) ── */}
      <section id="meet-team" className="py-16 sm:py-24 border-t border-[#ebdcd0] bg-[#fbf9f6] scroll-mt-12 relative">
        <span id="members" className="absolute -top-20 left-0 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-6 h-[1px] bg-[#5c1a52]" />
              <span
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                className="text-[11px] font-playfair font-semibold tracking-[0.2em] text-[#5c1a52] uppercase"
              >
                Boutique Leadership
              </span>
              <span className="w-6 h-[1px] bg-[#5c1a52]" />
            </div>
            <h2
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#8a4b82] tracking-[-0.01em] mb-2"
            >
              Store Leadership
            </h2>
            <p
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-base sm:text-xl font-playfair font-medium text-[#240821]"
            >
              Teamwork makes the dream work.
            </p>
          </div>

          {/* 4 Modern Luxury Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadershipTeam.map((member) => (
              <div
                key={member.name}
                className="group bg-white rounded-2xl overflow-hidden border border-[#ebdcd0] shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Full-bleed Portrait Photo */}
                <div className="relative aspect-[4/5] w-full bg-[#faf6f2] overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(min-width: 1024px) 270px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[#5c1a52] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#ebdcd0]/60 shadow-xs">
                    {member.tag}
                  </span>
                </div>

                {/* Typography info */}
                <div className="p-4 text-center flex-1 flex flex-col justify-center bg-white border-t border-[#f2e7de]">
                  <h3
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    className="text-sm sm:text-base font-playfair font-bold tracking-wide text-[#240821] uppercase mb-1"
                  >
                    {member.name}
                  </h3>
                  <p
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    className="text-[11px] font-playfair font-semibold tracking-wider text-[#8a4b82] uppercase leading-snug"
                  >
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 4. Join Us Section ── */}
      <section className="py-20 sm:py-24 border-t border-[#ebdcd0] bg-gradient-to-b from-white to-[#faf6f2] text-center px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-6 h-[1px] bg-[#5c1a52]" />
            <span
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-[11px] font-playfair font-bold tracking-[0.25em] text-[#5c1a52] uppercase"
            >
              Join Us
            </span>
            <span className="w-6 h-[1px] bg-[#5c1a52]" />
          </div>

          <h2
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1e081c] tracking-[-0.01em] mb-4"
          >
            Interested in joining our team?
          </h2>

          <p className="text-sm sm:text-base text-[#614e5f] font-light leading-relaxed mb-8 max-w-xl mx-auto">
            Join the Mulberries family and be part of a dynamic team passionate about fashion and creativity
          </p>

          <Link
            href="https://mulberries.shop/contact-us/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#5c1a52] hover:bg-[#43123b] text-white px-8 py-3.5 rounded-full text-xs sm:text-sm font-playfair font-bold uppercase tracking-wider shadow-sm transition-all duration-300 hover:scale-105"
          >
            <span>Contact Us</span>
            <LuArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── 4. Lightweight Lightbox Modal (Clean, Instant, Fast) ── */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            aria-label="Close Preview"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors z-20"
          >
            <LuX size={20} />
          </button>

          {/* Left Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) =>
                prev !== null ? (prev === 0 ? allLightboxPhotos.length - 1 : prev - 1) : null
              );
            }}
            aria-label="Previous Photo"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors z-20"
          >
            <LuChevronLeft size={22} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) =>
                prev !== null ? (prev === allLightboxPhotos.length - 1 ? 0 : prev + 1) : null
              );
            }}
            aria-label="Next Photo"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors z-20"
          >
            <LuChevronRight size={22} />
          </button>

          {/* Active Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center"
          >
            <div className="relative w-full h-[60vh] sm:h-[75vh]">
              <Image
                src={allLightboxPhotos[lightboxIndex].src}
                alt={allLightboxPhotos[lightboxIndex].title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            
            <div className="mt-3 text-center text-white">
              <p className="text-base sm:text-lg font-playfair font-bold">
                {allLightboxPhotos[lightboxIndex].title}
              </p>
              <p className="text-xs text-white/70 mt-0.5">
                {allLightboxPhotos[lightboxIndex].caption}
              </p>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
