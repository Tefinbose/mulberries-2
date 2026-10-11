import Image from "next/image";
import Link from "next/link";
import {
  LuArrowRight as ArrowRight,
} from "react-icons/lu";
import { getCategories } from "../lib/api";
import CategorySliderClient from "./CategorySliderClient";

const curatedStyles = [
  {
    id: "top-left",
    image: "/saree6.jpeg",
    tag: "New",
    title: "Just Landed",
    watermark: "NEW ARRIVALS",
    href: "/shop",
  },
  {
    id: "top-right",
    image: "/tradition.jpg",
    tag: "Kanchi",
    title: "Heritage Edit",
    watermark: "HERITAGE",
    href: "/traditional",
  },
  {
    id: "bottom-left",
    image: "/jewllery.jpg",
    tag: "Jewellery",
    title: "You May Also Like",
    watermark: "JEWELLERY",
    href: "/jewellery",
  },
  {
    id: "bottom-right",
    image: "/growns.jpg",
    tag: "Dresses",
    title: "Everyday Styles",
    watermark: "DRESSES",
    href: "/gowns",
  },
];

// ── Timeless Styles for Every Woman (Bento Lookbook Section) ─
export function TimelessStyles() {
  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 border-b border-[#ebdcd0] bg-white">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="w-10 h-0.5 bg-[#5c1a52] mx-auto mb-3" />
          <h2 className="font-playfair text-[26px] sm:text-[28px] lg:text-[34px] font-bold text-gray-950 tracking-tight leading-[1.15] mb-2">
            Timeless Styles for Every <span className="italic font-playfair text-[#5c1a52]">Woman.</span>
          </h2>
          <p className="text-gray-500 text-[15px] sm:text-[16px] font-normal leading-[1.5] tracking-normal">
            Sarees, blouses, and modern styles for every occasion
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Left Large Feature Card (6 cols on lg) */}
          <div className="lg:col-span-6">
            <Link
              href="/cotton-fabrics"
              className="group relative block w-full h-[420px] sm:h-[500px] lg:h-full min-h-[460px] lg:min-h-[580px] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 bg-[#e8e0d7]"
            >
              <Image
                src="/saree1.jpeg"
                alt="Mul Cotton Sarees Best Sellers"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Background Watermark Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 px-4">
                <span className="font-black uppercase tracking-[0.2em] text-4xl sm:text-6xl lg:text-7xl text-white/20 text-center leading-tight">
                  SAREE<br />COLLECTIONS
                </span>
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent z-10" />

              {/* Bottom Text Content */}
              <div className="absolute bottom-6 left-6 right-6 z-20 text-white transition-transform duration-300 group-hover:-translate-y-1">
                <p className="text-[13px] sm:text-[14px] font-normal text-gray-200 mb-0.5">
                  Mul Cotton
                </p>
                <h3 className="font-serif text-[17px] sm:text-[18px] font-bold tracking-tight text-white drop-shadow-sm">
                  Best Sellers
                </h3>
              </div>
            </Link>
          </div>

          {/* Right 2x2 Grid (6 cols on lg) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {curatedStyles.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group relative block w-full h-[240px] sm:h-[260px] lg:h-[280px] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-[#e8e0d7]"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Watermark text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 px-2">
                  <span className="font-black uppercase tracking-[0.2em] text-2xl sm:text-3xl lg:text-4xl text-white/20 text-center leading-none">
                    {item.watermark}
                  </span>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent z-10" />

                {/* Text Overlay */}
                <div className="absolute bottom-5 left-5 right-5 z-20 text-white transition-transform duration-300 group-hover:-translate-y-1">
                  <p className="text-[13px] sm:text-[14px] font-normal text-gray-200 mb-0.5">
                    {item.tag}
                  </p>
                  <h3 className="font-serif text-[16px] sm:text-[17px] font-semibold tracking-tight text-white drop-shadow-sm">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

// ── Shop by Category (Flipkart-style rounded horizontal scroll) ────────
export default async function ShopByCategory() {
  let categories: Awaited<ReturnType<typeof getCategories>>["categories"] = [];

  try {
    const res = await getCategories();
    categories = res.categories; // already sorted by displayOrder, isActive:true
  } catch {
    categories = [];
  }

  if (categories.length === 0) return null;

  return (
    <section className="w-full py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-[#ebdcd0]">
      <div className="max-w-[1400px] mx-auto">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="font-playfair text-[26px] sm:text-[28px] lg:text-[34px] font-bold text-gray-950 tracking-tight leading-[1.15]">
              Shop by <span className="italic font-playfair text-[#5c1a52]">Category</span>
            </h2>
            <p className="text-gray-500 text-[15px] sm:text-[16px] font-normal leading-[1.5] mt-1">
              Explore handpicked ethnic sarees, gowns, kaftans, and festive dresses.
            </p>
          </div>

          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#5c1a52] hover:text-[#4a1543] transition-colors whitespace-nowrap"
          >
            <span>View All Categories</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Rounded Flipkart-style Categories Horizontal Scroll */}
        <CategorySliderClient categories={categories} />
      </div>
    </section>
  );
}
