"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LuHeart as Heart,
  LuStar as Star,
  LuChevronLeft as ChevronLeft,
  LuChevronRight as ChevronRight,
  LuTruck as Truck,
  LuEye as Eye,
  LuX as X,
  LuCheck as Check,
  LuShoppingBag as ShoppingBag,
  LuMaximize2 as Maximize2,
} from "react-icons/lu";
import { getProducts, type Product } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const filters = ["All", "New Arrival", "Trending", "Featured"];

// Map color names to hex codes
const COLOR_MAP: Record<string, string> = {
  yellow: "#eab308",
  mustard: "#d97706",
  "haldi yellow": "#f59e0b",
  "lemon yellow": "#fde047",
  gold: "#d4af37",
  "antique gold": "#b8860b",
  brown: "#78350f",
  rust: "#9a3412",
  orange: "#ea580c",
  green: "#15803d",
  "dark green": "#14532d",
  "bottle green": "#0f381e",
  emerald: "#059669",
  "emerald green": "#059669",
  olive: "#4d7c0f",
  "olive green": "#4d7c0f",
  "mehendi green": "#556b2f",
  "mint green": "#6ee7b7",
  "sage green": "#84a98c",
  "pista green": "#93c572",
  black: "#18181b",
  red: "#dc2626",
  maroon: "#881337",
  crimson: "#991b1b",
  wine: "#581845",
  burgundy: "#4a0e17",
  pink: "#ec4899",
  "rani pink": "#db2777",
  "hot pink": "#ff1493",
  "rose pink": "#f43f5e",
  rose: "#f43f5e",
  "baby pink": "#fbcfe8",
  "blush pink": "#f472b6",
  magenta: "#c026d3",
  peach: "#fba18a",
  coral: "#fb7185",
  blue: "#2563eb",
  "royal blue": "#2563eb",
  navy: "#1e3a8a",
  "navy blue": "#1e3a8a",
  "sky blue": "#38bdf8",
  "powder blue": "#93c5fd",
  purple: "#7e22ce",
  violet: "#6d28d9",
  lavender: "#a855f7",
  lilac: "#c084fc",
  plum: "#5c1a52",
  cyan: "#06b6d4",
  turquoise: "#06b6d4",
  teal: "#0d9488",
  white: "#f8fafc",
  "off white": "#f5f3e9",
  offwhite: "#f5f3e9",
  ivory: "#fdfbf7",
  cream: "#fbf6ea",
  silver: "#cbd5e1",
  bronze: "#92400e",
  copper: "#b87333",
  grey: "#64748b",
  gray: "#64748b",
  charcoal: "#374151",
  beige: "#d6c7b2",
  champagne: "#f7e7ce",
};

// Fallback harmonious palettes if product doesn't have custom colors
const DEFAULT_PALETTES = [
  ["#eab308", "#78350f", "#15803d", "#18181b"],
  ["#881337", "#d4af37", "#15803d"],
  ["#7e22ce", "#eab308", "#ec4899", "#059669", "#06b6d4"],
  ["#18181b", "#78350f", "#15803d"],
  ["#2563eb", "#15803d"],
  ["#f43f5e", "#7e22ce", "#eab308"],
];

function getProductSwatches(product: Product, index: number): { name: string; hex: string }[] {
  if (product.colors && product.colors.length > 0) {
    return product.colors.map((c) => {
      const lower = c.toLowerCase().trim();
      return {
        name: c,
        hex: COLOR_MAP[lower] || lower,
      };
    });
  }
  const fallback = DEFAULT_PALETTES[index % DEFAULT_PALETTES.length];
  return fallback.map((hex, i) => ({
    name: `Option ${i + 1}`,
    hex,
  }));
}

function getProductDiscount(product: Product, index: number): {
  discountPct: number;
  originalPrice: number;
  salePrice: number;
} {
  if (product.discountPrice && product.discountPrice < product.price) {
    const discountPct = Math.round(
      ((product.price - product.discountPrice) / product.price) * 100
    );
    return {
      discountPct,
      originalPrice: product.price,
      salePrice: product.discountPrice,
    };
  }

  // Consistent simulated discount percentages (matching screenshot: 26%, 23%, 9%, 22%, 20%)
  const presets = [26, 23, 9, 22, 23, 20];
  const discountPct = presets[index % presets.length];
  const salePrice = product.price;
  const originalPrice = Math.round(product.price / (1 - discountPct / 100));

  return { discountPct, originalPrice, salePrice };
}

export default function NewArrivals() {
  const { addToCart } = useCart();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();

  const [activeFilter, setActiveFilter] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);
  const [addedProductIds, setAddedProductIds] = useState<Record<string, boolean>>({});

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProducts("?limit=12&sort=-createdAt")
      .then((res) => setProducts(res.products))
      .catch(() => {});
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedColor = selectedColors[product._id];
    addToCart(product, 1, undefined, selectedColor);

    // Quick visual button flash
    setAddedProductIds((prev) => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedProductIds((prev) => ({ ...prev, [product._id]: false }));
    }, 1500);

    // Toast notice
    setAddedNotice(product.name);
    setTimeout(() => {
      setAddedNotice((cur) => (cur === product.name ? null : cur));
    }, 2800);
  };

  const handleColorSelect = (e: React.MouseEvent, productId: string, colorName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColors((prev) => ({ ...prev, [productId]: colorName }));
  };

  const openQuickView = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
    setQuickViewQty(1);
  };

  const filteredProducts =
    activeFilter === "All"
      ? products
      : products.filter((p) =>
          p.tags?.includes(activeFilter.toLowerCase().replace(" ", "-"))
        );

  return (
    <section className="w-full bg-gradient-to-b from-[#faf6f2] via-[#f7f1eb] to-[#f3ece3] py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden border-b border-[#ebdcd0]">
      {/* Luxury Ambient Lighting Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-[radial-gradient(ellipse_at_top,_rgba(92,26,82,0.07),_transparent_70%)] pointer-events-none" />
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-[#c49a45]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-32 -right-20 w-96 h-96 bg-[#5c1a52]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto relative">
        {/* Section Header: Centered luxury title with elegant lines */}
        <div className="text-center mb-8 sm:mb-12">

          <div className="inline-flex items-center justify-center gap-4 sm:gap-6 w-full max-w-xl mx-auto">
            <span className="h-[1px] bg-gradient-to-r from-transparent via-[#c49a45]/40 to-[#c49a45]/60 flex-1" />
            <h2 className="font-playfair text-[26px] sm:text-[28px] lg:text-[34px] font-bold tracking-wide text-[#240821] uppercase">
              NEW <span className="italic font-playfair text-[#5c1a52]">ARRIVALS</span>
            </h2>
            <span className="h-[1px] bg-gradient-to-l from-transparent via-[#c49a45]/40 to-[#c49a45]/60 flex-1" />
          </div>
          <p className="text-[15px] sm:text-[16px] text-[#735e4d] mt-2 tracking-normal font-normal">
            Handpicked traditional sarees and festive dresses from our Dubai store
          </p>

          {/* Minimalist Filter Tabs */}
          <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm tracking-wide transition-all duration-300 cursor-pointer ${
                  activeFilter === filter
                    ? "bg-[#5c1a52] text-white shadow-md shadow-[#5c1a52]/20 scale-105 border border-[#5c1a52]"
                    : "bg-white/90 hover:bg-white text-[#6b5849] border border-[#ebdcd0] hover:border-[#5c1a52]/40 shadow-2xs"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Carousel Slider with Liquid Controls */}
        <div className="relative group/slider">
          {/* Navigation Arrows: Circular brand plum buttons */}
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#5c1a52] hover:bg-[#43123b] text-white flex items-center justify-center shadow-xl shadow-[#5c1a52]/25 hover:scale-110 active:scale-95 transition-all duration-300 z-30 absolute -left-2 sm:-left-4 top-[35%] -translate-y-1/2 cursor-pointer border border-white/20"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} className="stroke-[2.5]" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#5c1a52] hover:bg-[#43123b] text-white flex items-center justify-center shadow-xl shadow-[#5c1a52]/25 hover:scale-110 active:scale-95 transition-all duration-300 z-30 absolute -right-2 sm:-right-4 top-[35%] -translate-y-1/2 cursor-pointer border border-white/20"
            aria-label="Next slide"
          >
            <ChevronRight size={20} className="stroke-[2.5]" />
          </button>

          {/* Cards Track */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth pb-6 pt-2 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory"
          >
            {filteredProducts.map((product, idx) => {
              const { discountPct, originalPrice, salePrice } = getProductDiscount(product, idx);
              const swatches = getProductSwatches(product, idx);
              const selectedColor = selectedColors[product._id] || swatches[0]?.name;

              // Dynamically map active image to selected color swatch
              const swatchIdx = swatches.findIndex((s) => s.name === selectedColor);
              const colorIdx = product.colors && product.colors.length > 0
                ? product.colors.findIndex((c) => c.toLowerCase().trim() === (selectedColor || "").toLowerCase().trim())
                : -1;
              const effectiveIdx = colorIdx >= 0 ? colorIdx : (swatchIdx >= 0 ? swatchIdx : 0);
              const totalImages = product.images?.length || 0;
              const activeImgIdx = totalImages > 0 ? (effectiveIdx % totalImages) : 0;
              const primaryImage = product.images?.[activeImgIdx] || "/placeholder.jpg";
              const hasSecondImg = totalImages > 1;
              const secondImgIdx = hasSecondImg ? (activeImgIdx + 1) % totalImages : 0;
              const secondaryImage = hasSecondImg ? product.images![secondImgIdx] : null;
              const isAdded = addedProductIds[product._id];

              return (
                <div
                  key={product._id}
                  className="group/card flex-shrink-0 w-[230px] sm:w-[260px] md:w-[275px] flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_42px_-10px_rgba(92,26,82,0.14)] border border-[#ebdcd0] hover:border-[#5c1a52]/40 snap-start shadow-[0_2px_12px_rgba(92,26,82,0.03)]"
                >
                  {/* Media / Image Container (Aspect 3:4 portrait fashion ratio) */}
                  <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-[#f8f4ee] to-[#ece3d6] overflow-hidden">
                    <Link href={`/product/${product._id}`} className="block w-full h-full">
                      {/* Primary Image */}
                      <Image
                        key={`primary-${product._id}-${activeImgIdx}`}
                        src={primaryImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 230px, (max-width: 1024px) 260px, 285px"
                        className={`object-cover object-top transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                          hasSecondImg
                            ? "opacity-100 group-hover/card:opacity-0 group-hover/card:scale-105"
                            : "group-hover/card:scale-105"
                        }`}
                      />

                      {/* Secondary Image cross-fade */}
                      {hasSecondImg && secondaryImage && (
                        <Image
                          key={`secondary-${product._id}-${secondImgIdx}`}
                          src={secondaryImage}
                          alt={`${product.name} alternate view`}
                          fill
                          sizes="(max-width: 640px) 230px, (max-width: 1024px) 260px, 285px"
                          className="object-cover object-top opacity-0 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                        />
                      )}
                    </Link>

                    {/* Liquid Sheen sweep reflection across image on hover */}
                    <div className="absolute inset-0 -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-10" />

                    {/* Royal Mulberry Plum & Gold Foil Discount Badge (Top Right Corner) */}
                    <div className="absolute top-2.5 right-2.5 z-20">
                      <span className="inline-flex items-center bg-[#5c1a52] text-[#fffdfa] text-[12px] font-semibold px-2.5 py-0.5 rounded-full tracking-wider uppercase shadow-sm border border-[#f5d796]/35">
                        -{discountPct}%
                      </span>
                    </div>

                    {/* Top Left Floating Wishlist Button */}
                    <div className="absolute top-2.5 left-2.5 z-20">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-gray-700 flex items-center justify-center shadow-xs hover:scale-110 active:scale-125 transition-all border border-[#ebdcd0] cursor-pointer"
                        aria-label="Wishlist"
                      >
                        <Heart
                          size={14}
                          className={
                            isWishlisted(product._id)
                              ? "fill-[#dc2626] text-[#dc2626]"
                              : "text-gray-700 hover:text-red-500"
                          }
                        />
                      </button>
                    </div>

                    {/* ── Modern Frosted Pearl Action Capsule (Mobile Quick-Actions) ── */}
                    <div className="sm:hidden absolute bottom-2.5 right-2.5 z-20 flex items-center bg-white/95 backdrop-blur-md rounded-full p-1 shadow-[0_6px_20px_rgba(92,26,82,0.18)] border border-[#eedfcb]">
                      {/* Quick Preview Icon Button */}
                      <button
                        onClick={(e) => openQuickView(e, product)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#5c1a52] hover:bg-[#5c1a52]/10 active:scale-90 transition-all cursor-pointer"
                        aria-label="Quick preview"
                        title="Quick preview"
                      >
                        <Eye size={14} className="stroke-[2.2]" />
                      </button>

                      {/* Delicate Gold Hairline Divider */}
                      <span className="w-[1px] h-3.5 bg-[#ebdcd0]" />

                      {/* Morphing Quick Add to Bag Button */}
                      <button
                        onClick={(e) => handleQuickAdd(e, product)}
                        disabled={product.stock === 0}
                        className={`h-7 px-2.5 rounded-full text-[10.5px] font-bold flex items-center gap-1 transition-all duration-300 active:scale-95 shadow-xs cursor-pointer ${
                          isAdded
                            ? "bg-emerald-700 text-white"
                            : product.stock === 0
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-[#5c1a52] hover:bg-[#43123b] text-white"
                        }`}
                        aria-label="Quick add"
                      >
                        {isAdded ? (
                          <>
                            <Check size={11} className="stroke-[3]" />
                            <span className="text-[10px]">Added</span>
                          </>
                        ) : product.stock === 0 ? (
                          <span className="text-[10px]">Sold</span>
                        ) : (
                          <>
                            <ShoppingBag size={11} />
                            <span className="text-[10px]">+Bag</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Desktop Stacked Hover Action Buttons: Quick view & Quick add */}
                    <div className="absolute inset-x-4 bottom-5 z-20 hidden sm:flex flex-col gap-2 opacity-0 translate-y-4 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300 ease-out pointer-events-none group-hover/card:pointer-events-auto">
                      {/* Quick view button (White with subtle plum hover) */}
                      <button
                        onClick={(e) => openQuickView(e, product)}
                        className="w-full bg-white hover:bg-[#faf6f2] text-[#240821] text-[11px] font-bold tracking-wider uppercase py-2.5 px-3 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-[#ebdcd0] text-center cursor-pointer"
                      >
                        Quick view
                      </button>

                      {/* Quick add button (#5c1a52 with white text) */}
                      <button
                        onClick={(e) => handleQuickAdd(e, product)}
                        disabled={product.stock === 0}
                        className={`w-full text-white text-[11px] font-bold tracking-wider uppercase py-2.5 px-3 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                          isAdded
                            ? "bg-emerald-700"
                            : "bg-[#5c1a52] hover:bg-[#43123b]"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check size={13} className="stroke-[3]" />
                            <span>Added to Bag</span>
                          </>
                        ) : product.stock === 0 ? (
                          "Sold Out"
                        ) : (
                          "Quick add"
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Card Info Area */}
                  <div className="p-3.5 pt-3 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Rating Stars: 5 Champagne Gold Stars with score */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="flex items-center gap-0.5 text-[#c49a45]">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className="text-[#c49a45] fill-[#c49a45] stroke-[1.2]"
                            />
                          ))}
                        </div>
                        <span className="text-[12px] sm:text-[13px] font-medium text-[#8f8175]">5.0</span>
                      </div>

                      {/* Product Title (2-line clamp) */}
                      <Link href={`/product/${product._id}`}>
                        <h3 className="text-[15px] sm:text-[16px] font-medium text-[#240821] group-hover/card:text-[#5c1a52] transition-colors line-clamp-2 min-h-[2.7rem] leading-[1.35]">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Harmonious Pricing Row: Soft taupe original price + Deep Mulberry Plum sale price */}
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-[13px] sm:text-[14px] text-[#9c8e82] line-through font-normal">
                          AED {originalPrice.toLocaleString()}
                        </span>
                        <span className="text-[17px] sm:text-[18px] font-bold text-[#5c1a52] tracking-tight">
                          AED {salePrice.toLocaleString()}
                        </span>
                      </div>

                      {/* Harmonious Warm Linen & Mulberry Express Badge */}
                      <div className="mt-2.5">
                        <span className="inline-flex items-center gap-1.5 bg-[#faf5ef] border border-[#eedfcb] text-[#704d2e] px-2.5 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-semibold tracking-wider uppercase">
                          <Truck size={11} className="text-[#5c1a52] stroke-[2.2]" />
                          <span>2-4 DAYS EXPRESS DELIVERY</span>
                        </span>
                      </div>
                    </div>

                    {/* Color Swatches Row (Harmonious circular dots & shade count) */}
                    <div className="mt-3 pt-2.5 border-t border-[#ebdcd0]/70 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {swatches.map((swatch, sIdx) => {
                          const isSelected = selectedColor === swatch.name;
                          return (
                            <button
                              key={sIdx}
                              onClick={(e) => handleColorSelect(e, product._id, swatch.name)}
                              title={swatch.name}
                              className={`w-3.5 h-3.5 rounded-full border border-black/10 transition-all duration-200 hover:scale-125 relative cursor-pointer ${
                                isSelected
                                  ? "ring-2 ring-offset-1 ring-[#5c1a52] scale-110"
                                  : "opacity-85 hover:opacity-100"
                              }`}
                              style={{ backgroundColor: swatch.hex }}
                              aria-label={`Select ${swatch.name}`}
                            />
                          );
                        })}
                      </div>

                      <span className="text-[10px] font-medium text-[#9c8e82]">
                        {swatches.length} {swatches.length === 1 ? "shade" : "shades"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Quick View Liquid Modal ────────────────────────────────────────── */}
      {quickViewProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center shadow-md transition-transform hover:scale-110"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Image preview */}
              <div className="relative aspect-[3/4] bg-[#f8f5f2] overflow-hidden">
                <Image
                  src={quickViewProduct.images?.[0] || "/placeholder.jpg"}
                  alt={quickViewProduct.name}
                  fill
                  className="object-cover object-top"
                />
                <span className="absolute top-3 left-3 bg-[#5c1a52] text-[#fffdfa] text-[10.5px] font-bold px-2.5 py-0.5 rounded-full shadow-sm border border-[#f5d796]/35 tracking-wider">
                  NEW
                </span>
              </div>

              {/* Product Info */}
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="flex items-center gap-0.5 text-[#c49a45]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} className="text-[#c49a45] fill-[#c49a45] stroke-[1.2]" />
                      ))}
                    </div>
                    <span className="text-xs text-[#8f8175] ml-1">5.0 (Review Verified)</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-serif font-medium text-[#240821] leading-snug">
                    {quickViewProduct.name}
                  </h3>

                  <div className="flex items-baseline gap-2.5 mt-2">
                    <span className="text-xs text-[#9c8e82] line-through font-light">
                      AED {((quickViewProduct.discountPrice ? quickViewProduct.price : quickViewProduct.price * 1.25)).toFixed(0)}
                    </span>
                    <span className="text-xl font-bold text-[#5c1a52] tracking-tight">
                      AED {quickViewProduct.discountPrice ?? quickViewProduct.price}
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1.5 bg-[#faf5ef] border border-[#eedfcb] text-[#704d2e] px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase">
                      <Truck size={12} className="text-[#5c1a52] stroke-[2.2]" />
                      <span>2-4 DAYS EXPRESS DELIVERY</span>
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-3 line-clamp-3 leading-relaxed">
                    {quickViewProduct.description ||
                      "Premium handcrafted quality with soft pure fabrics, designed for your special celebrations."}
                  </p>

                  {/* Quantity Stepper */}
                  <div className="mt-5 flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-700">Quantity:</span>
                    <div className="inline-flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() => setQuickViewQty((q) => Math.max(1, q - 1))}
                        className="px-2.5 py-1 text-sm hover:bg-gray-100 text-gray-600"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold">{quickViewQty}</span>
                      <button
                        onClick={() => setQuickViewQty((q) => q + 1)}
                        className="px-2.5 py-1 text-sm hover:bg-gray-100 text-gray-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2.5">
                  <button
                    onClick={() => {
                      addToCart(quickViewProduct, quickViewQty);
                      setAddedNotice(quickViewProduct.name);
                      setQuickViewProduct(null);
                    }}
                    className="w-full bg-[#5C1A52] hover:bg-[#4a1543] text-white py-3 px-4 rounded text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={14} />
                    <span>Add to Bag</span>
                  </button>

                  <Link
                    href={`/product/${quickViewProduct._id}`}
                    onClick={() => setQuickViewProduct(null)}
                    className="text-center text-xs font-semibold text-gray-600 hover:text-gray-900 underline underline-offset-4 py-1"
                  >
                    View Full Product Details →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ────────────────────────────────────────────── */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181b] text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 border border-white/10">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check size={16} className="stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-bold leading-tight">Added to Shopping Bag</p>
            <p className="text-[11px] text-gray-400 line-clamp-1 max-w-[200px]">
              {addedNotice}
            </p>
          </div>
          <Link
            href="/cart"
            className="text-xs font-bold text-[#f5d796] hover:underline ml-2"
          >
            View Bag
          </Link>
        </div>
      )}
    </section>
  );
}
