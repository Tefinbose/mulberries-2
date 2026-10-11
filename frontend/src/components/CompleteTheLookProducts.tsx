"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LuHeart as Heart,
  LuStar as Star,
  LuChevronLeft as ChevronLeft,
  LuChevronRight as ChevronRight,
  LuTruck as Truck,
  LuX as X,
  LuCheck as Check,
  LuShoppingBag as ShoppingBag,
  LuMaximize2 as Maximize2,
  LuZap as Zap,
  LuEye as Eye,
} from "react-icons/lu";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { type Product } from "@/lib/api";

export type LookProduct = {
  _id: string;
  name: string;
  slug?: string;
  price: number;
  discountPrice?: number;
  images: string[];
  stock: number;
  isActive?: boolean;
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  description?: string;
};

// Map color names to hex codes for swatch display
const COLOR_MAP: Record<string, string> = {
  yellow: "#eab308",
  mustard: "#d97706",
  gold: "#d4af37",
  brown: "#78350f",
  rust: "#9a3412",
  green: "#15803d",
  emerald: "#059669",
  olive: "#4d7c0f",
  black: "#18181b",
  red: "#dc2626",
  maroon: "#881337",
  crimson: "#991b1b",
  pink: "#ec4899",
  rose: "#f43f5e",
  blue: "#2563eb",
  navy: "#1e3a8a",
  purple: "#7e22ce",
  violet: "#6d28d9",
  cyan: "#06b6d4",
  teal: "#0d9488",
  white: "#f8fafc",
  silver: "#cbd5e1",
  grey: "#64748b",
  gray: "#64748b",
  beige: "#d6c7b2",
};

const DEFAULT_PALETTES = [
  ["#eab308", "#78350f", "#15803d", "#18181b"],
  ["#881337", "#d4af37", "#15803d"],
  ["#7e22ce", "#eab308", "#ec4899", "#059669", "#06b6d4"],
  ["#18181b", "#78350f", "#15803d"],
  ["#2563eb", "#15803d"],
  ["#f43f5e", "#7e22ce", "#eab308"],
];

function getProductSwatches(product: LookProduct, index: number): { name: string; hex: string }[] {
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

function getProductDiscount(product: LookProduct, index: number): {
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

  const presets = [25, 20, 15, 30, 22, 18];
  const discountPct = presets[index % presets.length];
  const salePrice = product.price;
  const originalPrice = Math.round(product.price / (1 - discountPct / 100));

  return { discountPct, originalPrice, salePrice };
}

export default function CompleteTheLookProducts({ products }: { products: LookProduct[] }) {
  const { addToCart } = useCart();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();
  const router = useRouter();

  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [quickViewProduct, setQuickViewProduct] = useState<LookProduct | null>(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);
  const [addedProductIds, setAddedProductIds] = useState<Record<string, boolean>>({});

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 260;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleQuickAdd = (e: React.MouseEvent, product: LookProduct) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedColor = selectedColors[product._id];
    addToCart(product as unknown as Product, 1, undefined, selectedColor);

    // Button state feedback
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

  const handleBuyNow = (e: React.MouseEvent, product: LookProduct) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedColor = selectedColors[product._id];
    addToCart(product as unknown as Product, 1, undefined, selectedColor);
    router.push("/checkout");
  };

  const handleColorSelect = (e: React.MouseEvent, productId: string, colorName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColors((prev) => ({ ...prev, [productId]: colorName }));
  };

  const openQuickView = (e: React.MouseEvent, product: LookProduct) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
    setQuickViewQty(1);
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="relative group/slider w-full">
      {/* Carousel Navigation Buttons */}
      <button
        onClick={() => scroll("left")}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#18181b] hover:bg-black text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 z-30 absolute -left-2 sm:-left-3 top-[36%] -translate-y-1/2 cursor-pointer border border-white/10"
        aria-label="Previous items"
      >
        <ChevronLeft size={18} className="stroke-[2.5]" />
      </button>

      <button
        onClick={() => scroll("right")}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#18181b] hover:bg-black text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 z-30 absolute -right-2 sm:-right-3 top-[36%] -translate-y-1/2 cursor-pointer border border-white/10"
        aria-label="Next items"
      >
        <ChevronRight size={18} className="stroke-[2.5]" />
      </button>

      {/* Cards Track with smooth scrolling */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth pb-5 pt-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory"
      >
        {products.map((product, idx) => {
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
          const outOfStock = product.stock <= 0;

          return (
            <div
              key={product._id}
              className="group/card flex-shrink-0 w-[205px] sm:w-[225px] md:w-[235px] flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_16px_36px_-8px_rgba(92,26,82,0.12)] border border-[#ebdcd0] hover:border-[#5c1a52]/40 snap-start shadow-[0_2px_10px_rgba(92,26,82,0.03)]"
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
                    sizes="(max-width: 640px) 205px, (max-width: 1024px) 225px, 240px"
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
                      sizes="(max-width: 640px) 205px, (max-width: 1024px) 225px, 240px"
                      className="object-cover object-top opacity-0 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                    />
                  )}
                </Link>

                {/* Liquid Sheen sweep reflection across image on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />

                {/* Royal Mulberry Plum & Gold Foil Discount Badge */}
                <div className="absolute top-2.5 right-2.5 z-20">
                  <span className="inline-flex items-center bg-[#5c1a52] text-[#fffdfa] text-[12px] font-semibold px-2 py-0.5 rounded-full tracking-wider uppercase shadow-sm border border-[#f5d796]/35">
                    -{discountPct}%
                  </span>
                </div>

                {/* Top Left Floating Wishlist Button */}
                <div className="absolute top-2.5 left-2.5 z-20">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product as unknown as Product);
                    }}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-gray-700 flex items-center justify-center shadow-xs hover:scale-110 active:scale-125 transition-all border border-[#ebdcd0]"
                    aria-label="Wishlist"
                  >
                    <Heart
                      size={13}
                      className={
                        isWishlisted(product._id)
                          ? "fill-[#dc2626] text-[#dc2626]"
                          : "text-gray-700 hover:text-red-500"
                      }
                    />
                  </button>
                </div>

                {/* ── Modern Frosted Pearl Action Capsule (Mobile Quick-Actions) ── */}
                {!outOfStock && (
                  <div className="sm:hidden absolute bottom-2.5 right-2.5 z-20 flex items-center bg-white/95 backdrop-blur-md rounded-full p-1 shadow-[0_6px_20px_rgba(92,26,82,0.18)] border border-[#eedfcb]">
                    {/* Quick Peek Button */}
                    <button
                      onClick={(e) => openQuickView(e, product)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[#5c1a52] hover:bg-[#5c1a52]/10 active:scale-90 transition-all cursor-pointer"
                      aria-label="Quick preview"
                      title="Quick preview"
                    >
                      <Eye size={13} className="stroke-[2.2]" />
                    </button>

                    {/* Subtle Gold Divider */}
                    <span className="w-[1px] h-3.5 bg-[#ebdcd0]" />

                    {/* Morphing Quick Bag Button */}
                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      className={`h-7 px-2.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all duration-300 active:scale-95 shadow-xs cursor-pointer ${
                        isAdded
                          ? "bg-emerald-700 text-white"
                          : "bg-[#5c1a52] hover:bg-[#43123b] text-white"
                      }`}
                      aria-label="Quick add to bag"
                    >
                      {isAdded ? (
                        <>
                          <Check size={11} className="stroke-[3]" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={11} />
                          <span>+Bag</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Out of Stock Overlay */}
                {outOfStock && (
                  <div className="absolute inset-0 bg-[#240821]/60 z-25 flex items-center justify-center backdrop-blur-[1px]">
                    <span className="bg-white/95 text-[#240821] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow">
                      Out of Stock
                    </span>
                  </div>
                )}

                {/* Desktop Stacked Hover Action Buttons: Quick view & Quick add */}
                {!outOfStock && (
                  <div className="absolute inset-x-3 bottom-3 z-20 hidden sm:flex flex-col gap-1.5 opacity-0 translate-y-3 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300 ease-out pointer-events-none group-hover/card:pointer-events-auto">
                    {/* Quick view button (White with plum border hover) */}
                    <button
                      onClick={(e) => openQuickView(e, product)}
                      className="w-full bg-white hover:bg-[#faf6f2] text-[#240821] text-[10px] font-bold tracking-wider uppercase py-2 px-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-[#ebdcd0] text-center cursor-pointer"
                    >
                      Quick view
                    </button>

                    {/* Quick add button (#5c1a52 with white text) */}
                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      className={`w-full text-white text-[10px] font-bold tracking-wider uppercase py-2 px-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                        isAdded
                          ? "bg-emerald-700"
                          : "bg-[#5c1a52] hover:bg-[#43123b]"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={11} className="stroke-[3]" />
                          <span>Added to Bag</span>
                        </>
                      ) : (
                        "Quick add"
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Card Info Area */}
              <div className="p-3 pt-2.5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Rating Stars: 5 Champagne Gold Stars with score */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="flex items-center gap-0.5 text-[#c49a45]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          className="text-[#c49a45] fill-[#c49a45] stroke-[1.2]"
                        />
                      ))}
                    </div>
                    <span className="text-[12px] sm:text-[13px] font-medium text-[#8f8175]">5.0</span>
                  </div>

                  {/* Product Title */}
                  <Link href={`/product/${product._id}`}>
                    <h3 className="text-[15px] sm:text-[16px] font-medium text-[#240821] group-hover/card:text-[#5c1a52] transition-colors line-clamp-2 min-h-[2.7rem] leading-[1.35]">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Harmonious Pricing Row: Soft taupe original price + Deep Mulberry Plum sale price */}
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-[13px] sm:text-[14px] text-[#9c8e82] line-through font-normal">
                      AED {originalPrice.toLocaleString()}
                    </span>
                    <span className="text-[17px] sm:text-[18px] font-bold text-[#5c1a52] tracking-tight">
                      AED {salePrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Harmonious Warm Linen & Mulberry Express Badge */}
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 bg-[#faf5ef] border border-[#eedfcb] text-[#704d2e] px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider uppercase">
                      <Truck size={10} className="text-[#5c1a52] stroke-[2.2]" />
                      <span>2-4 DAYS DELIVERY</span>
                    </span>
                  </div>
                </div>

                {/* Color Swatches Row */}
                <div className="mt-2.5 pt-2 border-t border-[#ebdcd0]/70 flex items-center justify-between">
                  <div className="flex items-center gap-1 flex-wrap">
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

      {/* ── Quick View Modal ────────────────────────────────────────── */}
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
              </div>

              {/* Product Info & Actions */}
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex items-center gap-0.5 text-[#c49a45]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className="stroke-[1.2] fill-[#c49a45] text-[#c49a45]" />
                      ))}
                    </div>
                    <span className="text-xs text-[#8f8175] ml-1 font-medium">(Stylist Pick)</span>
                  </div>

                  <h3 className="text-lg font-serif font-medium text-[#240821] leading-snug mb-2">
                    {quickViewProduct.name}
                  </h3>

                  <div className="flex items-baseline gap-2 mb-4">
                    {quickViewProduct.discountPrice && (
                      <span className="text-sm text-[#9c8e82] line-through font-light">
                        AED {quickViewProduct.price.toLocaleString()}
                      </span>
                    )}
                    <span className="text-xl font-bold text-[#5c1a52] tracking-tight">
                      AED {(quickViewProduct.discountPrice ?? quickViewProduct.price).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                    {quickViewProduct.description ||
                      "Complete your festive outfit with beautiful matching accessories made with care."}
                  </p>

                  {/* Quantity selector */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Quantity:
                    </span>
                    <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                      <button
                        onClick={() => setQuickViewQty((q) => Math.max(1, q - 1))}
                        className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 transition-colors text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-semibold text-gray-900">
                        {quickViewQty}
                      </span>
                      <button
                        onClick={() =>
                          setQuickViewQty((q) =>
                            quickViewProduct.stock ? Math.min(quickViewProduct.stock, q + 1) : q + 1
                          )
                        }
                        className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 transition-colors text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        handleQuickAdd(e, quickViewProduct);
                        setQuickViewProduct(null);
                      }}
                      disabled={quickViewProduct.stock <= 0}
                      className="flex-1 bg-[#5C1A52] hover:bg-[#4a1543] text-white text-xs font-bold uppercase tracking-wider py-3 px-4 rounded shadow-sm hover:shadow transition-all duration-200 text-center"
                    >
                      {quickViewProduct.stock <= 0 ? "Out of Stock" : "Add to Bag"}
                    </button>

                    <button
                      onClick={(e) => {
                        handleBuyNow(e, quickViewProduct);
                        setQuickViewProduct(null);
                      }}
                      disabled={quickViewProduct.stock <= 0}
                      className="flex-1 bg-black hover:bg-gray-800 text-white text-xs font-bold uppercase tracking-wider py-3 px-4 rounded shadow-sm hover:shadow transition-all duration-200 text-center flex items-center justify-center gap-1.5"
                    >
                      <Zap size={13} />
                      <span>Buy Now</span>
                    </button>
                  </div>

                  <Link
                    href={`/product/${quickViewProduct._id}`}
                    onClick={() => setQuickViewProduct(null)}
                    className="text-center text-xs text-gray-500 hover:text-[#5C1A52] underline transition-colors pt-1"
                  >
                    View full product specifications
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ────────────────────────────────────────── */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-950 text-white px-4 py-3 rounded-lg shadow-2xl border border-white/10 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Check size={14} className="stroke-[3] text-white" />
          </div>
          <div className="text-xs">
            <span className="font-semibold block line-clamp-1">{addedNotice}</span>
            <span className="text-gray-400">added to your shopping bag</span>
          </div>
          <Link
            href="/cart"
            className="text-xs font-bold text-[#f5d796] hover:underline ml-2 flex-shrink-0"
          >
            View Bag
          </Link>
        </div>
      )}
    </div>
  );
}
