import { FaWhatsapp } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import {
  LuArrowRight as ArrowRight,
  LuAward as Award,
} from "react-icons/lu";
import CompleteTheLookClient from "./CompleteTheLookClient";
import CompleteTheLookProducts from "./CompleteTheLookProducts";
import CouponCardClient from "./CouponCardClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007/api";

async function fetchSection(type: string) {
  try {
    const res = await fetch(`${BASE_URL}/homepage/${type}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.section;
  } catch {
    return null;
  }
}

export default async function CompleteTheLook() {
  const [lookSection, bannerSection] = await Promise.all([
    fetchSection("complete_the_look"),
    fetchSection("offer_banner"),
  ]);

  let lookProducts: any[] = lookSection?.products?.filter((p: any) => p.isActive) ?? [];

  // Fallback: if no specific products are curated in Complete the Look yet, show latest store products
  if (lookProducts.length === 0) {
    try {
      const res = await fetch(`${BASE_URL}/products?limit=8`, { next: { revalidate: 60 } });
      if (res.ok) {
        const data = await res.json();
        lookProducts = data.products?.filter((p: any) => p.isActive) ?? [];
      }
    } catch {}
  }

  const hasProducts = lookProducts.length > 0;
  const hasBanner = Boolean(bannerSection?.isActive);

  if (!hasProducts && !hasBanner) return null;

  return (
    <section className="w-full bg-white py-16 px-4 sm:px-6 lg:px-8 border-b border-[#ebdcd0] relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto">

        {/* Complete the Look Section with Side Banner */}
        {hasProducts ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 items-start">
            <div className="lg:col-span-2 flex flex-col justify-between">
              {/* Header: Luxury title with gold stylist badge and elegant gradient line */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  
                  <span className="h-[1px] bg-gradient-to-r from-amber-300/40 via-amber-200/20 to-transparent flex-1 max-w-xs hidden sm:block" />
                </div>
                <h2 className="font-playfair text-[26px] sm:text-[28px] lg:text-[34px] font-bold text-gray-950 tracking-wide mb-1 leading-[1.15]">
                  Complete <span className="italic font-playfair text-[#5c1a52]">the Look</span>
                </h2>
                <p className="text-gray-500 text-[15px] sm:text-[16px] font-normal tracking-normal leading-[1.5]">
                  Handpicked jewellery and matching accessories styled to complete each outfit.
                </p>
              </div>

              {/* Products Carousel Slider */}
              <CompleteTheLookProducts products={lookProducts} />
            </div>

            {/* Offer / Stylist Banner */}
            <div className="h-full flex flex-col">
              <div className="mb-6 invisible hidden lg:block">
                {/* Spacer to align banner tops cleanly with products */}
                <div className="h-[4.75rem]" />
              </div>

              {bannerSection?.isActive ? (
                <Link
                  href={bannerSection.linkHref || "/shop"}
                  className="relative rounded-2xl overflow-hidden min-h-[360px] lg:min-h-[440px] group flex flex-col justify-center shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100 flex-1"
                  style={{ background: bannerSection.bgColor || "#5c1a52" }}
                >
                  {/* Liquid sheen sweep */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-10" />

                  {bannerSection.image && (
                    <Image
                      src={bannerSection.image}
                      alt={bannerSection.heading || "Special Offer"}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] opacity-25"
                    />
                  )}
                  <div className="relative z-10 flex flex-col justify-center px-8 py-10">
                    {bannerSection.badgeText && (
                      <span
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold tracking-wider uppercase px-3.5 py-1.2 rounded-full mb-3 w-fit shadow-xs backdrop-blur-sm"
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          color: bannerSection.textColor || "#fff",
                          border: "1px solid rgba(255,255,255,0.25)",
                        }}
                      >
                        <Award size={13} />
                        {bannerSection.badgeText}
                      </span>
                    )}
                    {bannerSection.heading && (
                      <h3
                        className="font-serif text-[28px] sm:text-[34px] md:text-[36px] lg:text-[40px] font-bold leading-[1.12] mb-2 tracking-tight"
                        style={{ color: bannerSection.textColor || "#fff" }}
                      >
                        {bannerSection.heading}
                      </h3>
                    )}
                    {bannerSection.subheading && (
                      <p
                        className="text-[15px] sm:text-[16px] mb-6 leading-[1.5] font-normal"
                        style={{ color: bannerSection.textColor || "#fff", opacity: 0.9 }}
                      >
                        {bannerSection.subheading}
                      </p>
                    )}
                    <span
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[14px] sm:text-[15px] font-semibold tracking-wider uppercase w-fit transition-all duration-300 group-hover:scale-105 shadow-sm"
                      style={{
                        background: "rgba(255,255,255,0.25)",
                        color: bannerSection.textColor || "#fff",
                        border: "1px solid rgba(255,255,255,0.45)",
                      }}
                    >
                      <span>{bannerSection.linkText || "Shop Now"}</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ) : (
                /* High-fashion Fallback Banner */
                <Link
                  href="/shop"
                  className="relative rounded-2xl overflow-hidden min-h-[360px] lg:min-h-[440px] group shadow-md hover:shadow-xl transition-all duration-500 border border-[#ebdcd0] block flex-1"
                >
                  <Image
                    src="/tradition.jpg"
                    alt="Accessories & Heritage Weaves"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                  />
                  {/* Liquid sheen sweep */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-10" />

                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
                  <div className="relative z-10 h-full flex flex-col justify-center px-8 py-10 max-w-[85%] text-white">
                    <span className="text-[13px] font-semibold tracking-wider uppercase text-[#f5d796] mb-2">
                      Finishing Touch
                    </span>
                    <h3 className="font-serif text-[28px] sm:text-[34px] md:text-[36px] lg:text-[40px] font-bold leading-[1.12] mb-2 tracking-tight">
                      Matching Accessories & Shawls
                    </h3>
                    <p className="text-gray-200 text-[15px] sm:text-[16px] mb-6 leading-[1.5] font-normal">
                      Fine accessories crafted to complete your festive look.
                    </p>
                    <span className="inline-flex items-center gap-2 bg-[#5c1a52] text-white px-6 py-2.5 rounded-full text-[14px] sm:text-[15px] font-semibold uppercase tracking-wider w-fit hover:bg-[#4a1543] transition-all group-hover:scale-105 shadow-md">
                      <span>Shop Accessories</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          ) : hasBanner ? (
          <div className="mb-12">
            <Link
              href={bannerSection?.linkHref || "/shop"}
              className="relative rounded-2xl overflow-hidden min-h-[220px] sm:min-h-[260px] group flex flex-col justify-center shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100 block"
              style={{ background: bannerSection?.bgColor || "#5c1a52" }}
            >
              {bannerSection?.image && (
                <Image
                  src={bannerSection.image}
                  alt={bannerSection.heading || "Special Offer"}
                  fill
                  sizes="100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-25"
                />
              )}
              <div className="relative z-10 flex flex-col justify-center px-8 py-8 sm:px-12 text-white">
                {bannerSection?.badgeText && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase px-3.5 py-1 rounded-full mb-2 w-fit"
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      color: bannerSection?.textColor || "#fff",
                      border: "1px solid rgba(255,255,255,0.25)",
                    }}
                  >
                    <Award size={13} />
                    {bannerSection.badgeText}
                  </span>
                )}
                {bannerSection?.heading && (
                  <h3
                    className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 tracking-tight"
                    style={{ color: bannerSection?.textColor || "#fff" }}
                  >
                    {bannerSection.heading}
                  </h3>
                )}
                {bannerSection?.subheading && (
                  <p
                    className="text-sm sm:text-base mb-4 font-normal max-w-xl"
                    style={{ color: bannerSection?.textColor || "#fff", opacity: 0.9 }}
                  >
                    {bannerSection.subheading}
                  </p>
                )}
                <span
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase w-fit"
                  style={{
                    background: "rgba(255,255,255,0.25)",
                    color: bannerSection?.textColor || "#fff",
                    border: "1px solid rgba(255,255,255,0.45)",
                  }}
                >
                  <span>{bannerSection?.linkText || "Shop Now"}</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          </div>
        ) : null}

        {/* Bottom Utility Row: Shipping progress, interactive coupon card & WhatsApp stylist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <CompleteTheLookClient />
          <CouponHighlight />
          
          <a
            href="https://wa.me/971504715912"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#faf6f2] border border-[#ebdcd0] rounded-2xl p-6 flex items-center gap-4 hover:border-[#5c1a52]/40 hover:shadow-md transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0 text-white shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <FaWhatsapp size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-[#c49a45] uppercase tracking-[0.2em] block mb-0.5">
                Stylist Help
              </span>
              <p className="text-sm font-bold text-gray-900 leading-snug group-hover:text-[#5c1a52] transition-colors">
                Personal Stylist Help
              </p>
              <p className="text-xs text-gray-500 mt-0.5 font-light">Chat with our Dubai store on WhatsApp</p>
            </div>
            <ArrowRight size={16} className="text-gray-400 group-hover:text-[#5c1a52] group-hover:translate-x-1.5 transition-all duration-300" />
          </a>
        </div>

      </div>
    </section>
  );
}

async function CouponHighlight() {
  let coupon: any = null;
  try {
    const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007/api";
    const res = await fetch(`${BASE}/coupons/active`, { next: { revalidate: 60 } });
    const data = await res.json();
    coupon = data.coupons?.[0] ?? null;
  } catch {}

  return <CouponCardClient coupon={coupon} />;
}
