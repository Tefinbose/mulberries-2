"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LuSearch as Search,
  LuSlidersHorizontal as SlidersHorizontal,
  LuStar as Star,
  LuX as X,
  LuHeart as Heart,
  LuEye as Eye,
  LuShoppingBag as ShoppingBag,
  LuCheck as Check,
  LuTruck as Truck,
} from "react-icons/lu";
import { getCategories, getProducts, type Category, type Product } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

type Filters = {
  q: string;
  category: string;
  color: string;
  size: string;
  material: string;
  minRating: string;
  inStock: boolean;
  minPrice: string;
  maxPrice: string;
  sort: string;
};

const COLOR_MAP: Record<string, string> = {
  blue: "#2563eb",
  "royal blue": "#2563eb",
  navy: "#1e3a8a",
  "navy blue": "#1e3a8a",
  "sky blue": "#38bdf8",
  "powder blue": "#93c5fd",
  white: "#f8fafc",
  "off white": "#f5f3e9",
  offwhite: "#f5f3e9",
  ivory: "#fdfbf7",
  cream: "#fbf6ea",
  beige: "#d6c7b2",
  champagne: "#f7e7ce",
  red: "#dc2626",
  "cherry red": "#be123c",
  maroon: "#881337",
  crimson: "#991b1b",
  wine: "#581845",
  burgundy: "#4a0e17",
  ruby: "#e0115f",
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
  yellow: "#eab308",
  mustard: "#d97706",
  "haldi yellow": "#f59e0b",
  "lemon yellow": "#fde047",
  orange: "#ea580c",
  amber: "#b45309",
  gold: "#d4af37",
  "antique gold": "#b8860b",
  bronze: "#92400e",
  copper: "#b87333",
  brown: "#78350f",
  rust: "#9a3412",
  black: "#18181b",
  purple: "#7e22ce",
  violet: "#6d28d9",
  lavender: "#a855f7",
  lilac: "#c084fc",
  plum: "#5c1a52",
  teal: "#0d9488",
  turquoise: "#06b6d4",
  silver: "#cbd5e1",
  grey: "#64748b",
  gray: "#64748b",
  charcoal: "#374151",
};

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

  const presets = [26, 23, 19, 22, 25, 20];
  const discountPct = presets[index % presets.length];
  const salePrice = product.price;
  const originalPrice = Math.round(product.price / (1 - discountPct / 100));

  return { discountPct, originalPrice, salePrice };
}

const emptyFilters: Filters = { q: "", category: "", color: "", size: "", material: "", minRating: "", inStock: false, minPrice: "", maxPrice: "", sort: "newest" };

const filtersFromParams = (params: URLSearchParams): Filters => ({
  q: params.get("q") || "",
  category: params.get("category") || "",
  color: params.get("color") || "",
  size: params.get("size") || "",
  material: params.get("material") || "",
  minRating: params.get("minRating") || "",
  inStock: params.get("inStock") === "true",
  minPrice: params.get("minPrice") || "",
  maxPrice: params.get("maxPrice") || "",
  sort: params.get("sort") || "newest",
});

export default function SearchClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);
  const [searchText, setSearchText] = useState(filters.q);

  const [addedProductIds, setAddedProductIds] = useState<Record<string, boolean>>({});
  const [selectedCardColors, setSelectedCardColors] = useState<Record<string, string>>({});
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [quickViewSelectedSize, setQuickViewSelectedSize] = useState<string | null>(null);
  const [quickViewSelectedColor, setQuickViewSelectedColor] = useState<string | null>(null);
  const [quickViewAdded, setQuickViewAdded] = useState(false);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const color = selectedCardColors[product._id] || product.colors?.[0] || undefined;
    addToCart(product, 1, product.sizes?.[0] || undefined, color);
    setAddedProductIds((prev) => ({ ...prev, [product._id]: true }));
    setAddedNotice(`Added "${product.name}" to your bag`);
    setTimeout(() => {
      setAddedProductIds((prev) => ({ ...prev, [product._id]: false }));
    }, 2000);
    setTimeout(() => setAddedNotice(null), 3000);
  };

  const openQuickView = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
    setQuickViewQty(1);
    setQuickViewSelectedSize(product.sizes?.[0] || "Free Size");
    setQuickViewSelectedColor(selectedCardColors[product._id] || product.colors?.[0] || null);
    setQuickViewAdded(false);
  };

  useEffect(() => setSearchText(filters.q), [filters.q]);

  useEffect(() => {
    getCategories().then((result) => setCategories(result.categories)).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    query.set("limit", "100");
    if (filters.q) query.set("search", filters.q);
    if (filters.category) query.set("category", filters.category);
    if (filters.color) query.set("color", filters.color);
    if (filters.size) query.set("size", filters.size);
    if (filters.material) query.set("material", filters.material);
    if (filters.minRating) query.set("minRating", filters.minRating);
    if (filters.inStock) query.set("inStock", "true");
    if (filters.minPrice) query.set("minPrice", filters.minPrice);
    if (filters.maxPrice) query.set("maxPrice", filters.maxPrice);
    if (filters.sort) query.set("sort", filters.sort);
    getProducts(`?${query.toString()}`)
      .then((result) => { setProducts(result.products); setTotal(result.total); })
      .catch(() => { setProducts([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [filters]);

  const updateFilters = (changes: Partial<Filters>) => {
    const next = { ...filters, ...changes };
    const query = new URLSearchParams();
    if (next.q.trim()) query.set("q", next.q.trim());
    if (next.category) query.set("category", next.category);
    if (next.color) query.set("color", next.color);
    if (next.size) query.set("size", next.size);
    if (next.material) query.set("material", next.material);
    if (next.minRating) query.set("minRating", next.minRating);
    if (next.inStock) query.set("inStock", "true");
    if (next.minPrice) query.set("minPrice", next.minPrice);
    if (next.maxPrice) query.set("maxPrice", next.maxPrice);
    if (next.sort !== "newest") query.set("sort", next.sort);
    router.replace(`${pathname}${query.toString() ? `?${query.toString()}` : ""}`);
  };

  const colors = useMemo(() => [...new Set(products.flatMap((product) => product.colors || []))].sort(), [products]);
  const sizes = useMemo(() => [...new Set(products.flatMap((product) => product.sizes || []))].sort(), [products]);
  const materials = useMemo(() => [...new Set(products.map((product) => product.material).filter(Boolean))].sort(), [products]);
  const hasActiveFilters = Boolean(filters.category || filters.color || filters.size || filters.material || filters.minRating || filters.inStock || filters.minPrice || filters.maxPrice);

  const panel = (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-gray-800 mb-2">Price range (AED)</label>
        <div className="flex gap-2"><input value={filters.minPrice} onChange={(e) => updateFilters({ minPrice: e.target.value })} type="number" min="0" placeholder="Min" className="w-full border border-gray-300 rounded px-2 py-2 text-sm" /><input value={filters.maxPrice} onChange={(e) => updateFilters({ maxPrice: e.target.value })} type="number" min="0" placeholder="Max" className="w-full border border-gray-300 rounded px-2 py-2 text-sm" /></div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-800 mb-2">Category</label>
        <select value={filters.category} onChange={(e) => updateFilters({ category: e.target.value })} className="w-full border border-gray-300 rounded px-2.5 py-2 text-sm bg-white"><option value="">All categories</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-800 mb-2">Color</label>
        <select value={filters.color} onChange={(e) => updateFilters({ color: e.target.value })} className="w-full border border-gray-300 rounded px-2.5 py-2 text-sm bg-white"><option value="">All colors</option>{colors.map((color) => <option key={color} value={color}>{color}</option>)}</select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-800 mb-2">Size</label>
        <select value={filters.size} onChange={(e) => updateFilters({ size: e.target.value })} className="w-full border border-gray-300 rounded px-2.5 py-2 text-sm bg-white"><option value="">All sizes</option>{sizes.map((size) => <option key={size} value={size}>{size}</option>)}</select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-800 mb-2">Material</label>
        <select value={filters.material} onChange={(e) => updateFilters({ material: e.target.value })} className="w-full border border-gray-300 rounded px-2.5 py-2 text-sm bg-white"><option value="">All materials</option>{materials.map((material) => <option key={material} value={material}>{material}</option>)}</select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-800 mb-2">Customer rating</label>
        <select value={filters.minRating} onChange={(e) => updateFilters({ minRating: e.target.value })} className="w-full border border-gray-300 rounded px-2.5 py-2 text-sm bg-white"><option value="">Any rating</option><option value="4">4 stars & up</option><option value="3">3 stars & up</option><option value="2">2 stars & up</option></select>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" checked={filters.inStock} onChange={(e) => updateFilters({ inStock: e.target.checked })} className="accent-[#5c1a52]" /> In stock only</label>
      {hasActiveFilters && <button onClick={() => updateFilters({ ...emptyFilters, q: filters.q })} className="text-sm text-[#5c1a52] underline">Clear filters</button>}
    </div>
  );

  return (
    <main className="min-h-screen bg-white" style={{ fontFamily: "Arial, sans-serif" }}>
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <form onSubmit={(e) => { e.preventDefault(); updateFilters({ q: searchText }); }} className="max-w-2xl flex gap-2 mb-7">
          <div className="relative flex-1"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search products..." className="w-full border border-gray-300 rounded-sm pl-10 pr-3 py-3 text-sm outline-none focus:border-[#5c1a52]" /></div>
          <button className="bg-[#5c1a52] text-white px-5 text-sm font-medium rounded-sm hover:bg-[#4a1543]">Search</button>
        </form>
        <div className="flex gap-8 items-start">
          <aside className="hidden lg:block w-60 xl:w-64 flex-shrink-0 border-r border-gray-100 pr-6 sticky top-28 self-start max-h-[calc(100vh-7.5rem)] overflow-y-auto scrollbar-thin">
            <p className="text-sm font-bold text-gray-900 mb-5">Filters</p>
            {panel}
          </aside>
          <section className="flex-1 min-w-0">
            {loading ? (
              <p className="text-sm text-gray-400 py-12">Loading products...</p>
            ) : products.length === 0 ? (
              <p className="text-sm text-gray-500 py-12">No products match these filters.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((product, idx) => {
                  const { discountPct, originalPrice, salePrice } = getProductDiscount(product, idx);
                  const swatches = getProductSwatches(product, idx);
                  const selectedColor = selectedCardColors[product._id] || swatches[0]?.name;

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
                      className="group/card flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_42px_-10px_rgba(92,26,82,0.16)] border border-[#ebdcd0] hover:border-[#5c1a52]/40 shadow-[0_2px_12px_rgba(92,26,82,0.03)]"
                    >
                      {/* Media Container (3:4 ratio) */}
                      <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-[#f8f4ee] to-[#ece3d6] overflow-hidden">
                        <Link href={`/product/${product.slug || product._id}`} className="block w-full h-full">
                          <Image
                            key={`primary-${product._id}-${activeImgIdx}`}
                            src={primaryImage}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className={`object-cover object-top transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                              hasSecondImg
                                ? "opacity-100 group-hover/card:opacity-0 group-hover/card:scale-105"
                                : "group-hover/card:scale-105"
                            }`}
                          />
                          {hasSecondImg && secondaryImage && (
                            <Image
                              key={`secondary-${product._id}-${secondImgIdx}`}
                              src={secondaryImage}
                              alt={`${product.name} alternate view`}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover object-top opacity-0 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                            />
                          )}
                        </Link>

                        {/* Sheen reflection */}
                        <div className="absolute inset-0 -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-10" />

                        {/* Discount Badge */}
                        {discountPct > 0 && (
                          <div className="absolute top-2.5 right-2.5 z-20">
                            <span className="inline-flex items-center bg-[#5c1a52] text-[#fffdfa] text-[11px] sm:text-[12px] font-semibold px-2.5 py-0.5 rounded-full tracking-wider uppercase shadow-sm border border-[#f5d796]/35">
                              -{discountPct}%
                            </span>
                          </div>
                        )}

                        {/* Wishlist Button */}
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

                        {/* Mobile Action Capsule */}
                        <div className="sm:hidden absolute bottom-2.5 right-2.5 z-20 flex items-center bg-white/95 backdrop-blur-md rounded-full p-1 shadow-[0_6px_20px_rgba(92,26,82,0.18)] border border-[#eedfcb]">
                          <button
                            onClick={(e) => openQuickView(e, product)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[#5c1a52] hover:bg-[#5c1a52]/10 active:scale-90 transition-all cursor-pointer"
                            aria-label="Quick preview"
                          >
                            <Eye size={13} className="stroke-[2.2]" />
                          </button>
                          <span className="w-[1px] h-3.5 bg-[#ebdcd0]" />
                          <button
                            onClick={(e) => handleQuickAdd(e, product)}
                            disabled={product.stock === 0}
                            className={`h-7 px-2.5 rounded-full text-[10.5px] font-bold flex items-center gap-1 transition-all duration-300 active:scale-95 shadow-xs cursor-pointer ${
                              isAdded
                                ? "bg-emerald-700 text-white animate-pulse"
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

                        {/* Desktop Hover Action Buttons */}
                        <div className="absolute inset-x-3 bottom-3 z-20 hidden sm:flex flex-col gap-1.5 opacity-0 translate-y-3 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300 ease-out pointer-events-none group-hover/card:pointer-events-auto">
                          <button
                            onClick={(e) => openQuickView(e, product)}
                            className="w-full bg-white hover:bg-[#faf6f2] text-[#240821] text-[10.5px] font-bold tracking-wider uppercase py-2 px-3 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-[#ebdcd0] text-center rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Eye size={13} className="text-[#5c1a52]" />
                            <span>Quick View</span>
                          </button>
                          <button
                            onClick={(e) => handleQuickAdd(e, product)}
                            disabled={product.stock === 0}
                            className={`w-full text-white text-[10.5px] font-bold tracking-wider uppercase py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.95] text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                              isAdded
                                ? "bg-emerald-700 ring-2 ring-emerald-400 scale-[1.02]"
                                : product.stock === 0
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#5c1a52] hover:bg-[#43123b]"
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check size={13} className="stroke-[3] animate-bounce" />
                                <span>Added to Bag!</span>
                              </>
                            ) : product.stock === 0 ? (
                              "Sold Out"
                            ) : (
                              <>
                                <ShoppingBag size={12} />
                                <span>Quick Add to Bag</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Card Info */}
                      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="flex items-center gap-0.5 text-[#c49a45]">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} className="text-[#c49a45] fill-[#c49a45] stroke-[1.2]" />
                              ))}
                            </div>
                            <span className="text-[12px] font-medium text-[#8f8175]">5.0</span>
                          </div>

                          <Link href={`/product/${product.slug || product._id}`}>
                            <h3 className="text-[14px] sm:text-[15px] font-medium text-[#240821] group-hover/card:text-[#5c1a52] transition-colors line-clamp-1 leading-snug">
                              {product.name}
                            </h3>
                          </Link>

                          {product.material && (
                            <p className="text-[11px] text-[#8c786a] mt-0.5 line-clamp-1">
                              {product.material}
                            </p>
                          )}

                          <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1 mt-1.5">
                            <span className="text-[13px] sm:text-[14px] text-[#9c8e82] line-through font-normal">
                              AED {originalPrice.toLocaleString()}
                            </span>
                            <span className="text-[16px] sm:text-[17px] font-bold text-[#5c1a52] tracking-tight">
                              AED {salePrice.toLocaleString()}
                            </span>
                            {originalPrice > salePrice && (
                              <span className="text-[9.5px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Save AED {(originalPrice - salePrice).toLocaleString()}
                              </span>
                            )}
                          </div>

                          <div className="mt-2.5">
                            <span className="inline-flex items-center gap-1.5 bg-[#faf5ef] border border-[#eedfcb] text-[#704d2e] px-2 py-0.5 rounded-full text-[9px] sm:text-[9.5px] font-semibold tracking-wider uppercase">
                              <Truck size={10} className="text-[#5c1a52] stroke-[2.2]" />
                              <span>2-4 DAYS EXPRESS DELIVERY</span>
                            </span>
                          </div>
                        </div>

                        {/* Swatches Row */}
                        <div className="mt-3 pt-2.5 border-t border-[#ebdcd0]/70 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {swatches.map((swatch, sIdx) => {
                              const isSelected = selectedColor === swatch.name;
                              return (
                                <button
                                  key={sIdx}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedCardColors((prev) => ({
                                      ...prev,
                                      [product._id]: swatch.name,
                                    }));
                                  }}
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
            )}
          </section>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[#ebdcd0]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative aspect-[3/4] md:aspect-auto md:min-h-[420px] bg-gradient-to-b from-[#f8f4ee] to-[#ece3d6] overflow-hidden">
                <Image
                  src={quickViewProduct.images?.[0] || "/placeholder.jpg"}
                  alt={quickViewProduct.name}
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute top-3.5 left-3.5 z-20">
                  <span className="inline-flex items-center bg-[#5c1a52] text-[#fffdfa] text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full tracking-wider uppercase shadow-sm border border-[#f5d796]/35">
                    FEATURED LOOK
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex items-center gap-0.5 text-[#c49a45]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className="text-[#c49a45] fill-[#c49a45] stroke-[1.2]" />
                      ))}
                    </div>
                    <span className="text-xs text-[#8f8175] ml-1">5.0 (Verified Quality)</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-serif font-medium text-[#240821] leading-snug">
                    {quickViewProduct.name}
                  </h3>

                  <div className="flex items-baseline gap-2.5 mt-2.5">
                    <span className="text-xl sm:text-2xl font-bold text-[#5c1a52] tracking-tight">
                      AED {(quickViewProduct.discountPrice ?? quickViewProduct.price).toLocaleString()}
                    </span>
                    {quickViewProduct.discountPrice && (
                      <span className="text-xs text-[#9c8e82] line-through font-light">
                        AED {quickViewProduct.price.toLocaleString()}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      In Stock & Ready
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1.5 bg-[#faf5ef] border border-[#eedfcb] text-[#704d2e] px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase">
                      <Truck size={11} className="text-[#5c1a52] stroke-[2.2]" />
                      <span>2-4 DAYS EXPRESS DELIVERY</span>
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
                    {quickViewProduct.description ||
                      "Premium handcrafted ethnic wear crafted with luxurious fabrics, refined finishes, and authentic heritage styling."}
                  </p>

                  {quickViewProduct.colors && quickViewProduct.colors.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-gray-800">Color:</span>
                        <span className="text-[#5c1a52] font-medium capitalize">
                          {quickViewSelectedColor || quickViewProduct.colors[0]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {quickViewProduct.colors.map((c, cIdx) => {
                          const lower = c.toLowerCase().trim();
                          const hex = COLOR_MAP[lower] || lower;
                          const isSelected = (quickViewSelectedColor || quickViewProduct.colors[0]) === c;
                          return (
                            <button
                              key={cIdx}
                              onClick={() => setQuickViewSelectedColor(c)}
                              title={c}
                              className={`w-5 h-5 rounded-full border border-black/15 transition-all duration-200 relative cursor-pointer ${
                                isSelected
                                  ? "ring-2 ring-offset-1 ring-[#5c1a52] scale-110"
                                  : "opacity-80 hover:opacity-100 hover:scale-105"
                              }`}
                              style={{ backgroundColor: hex }}
                              aria-label={`Select ${c}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {quickViewProduct.sizes && quickViewProduct.sizes.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs font-semibold text-gray-800 block mb-1.5">Select Size:</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {quickViewProduct.sizes.map((sz) => (
                          <button
                            key={sz}
                            onClick={() => setQuickViewSelectedSize(sz)}
                            className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${
                              quickViewSelectedSize === sz
                                ? "border-[#5c1a52] bg-[#5c1a52] text-white font-semibold"
                                : "border-gray-300 hover:border-[#5c1a52] text-gray-700 bg-white"
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-700">Quantity:</span>
                    <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                      <button
                        onClick={() => setQuickViewQty((q) => Math.max(1, q - 1))}
                        className="px-3 py-1 text-sm hover:bg-gray-200 text-gray-700 cursor-pointer transition-colors"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold bg-white min-w-[28px] text-center">
                        {quickViewQty}
                      </span>
                      <button
                        onClick={() => setQuickViewQty((q) => q + 1)}
                        className="px-3 py-1 text-sm hover:bg-gray-200 text-gray-700 cursor-pointer transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      const finalColor = quickViewSelectedColor || quickViewProduct.colors?.[0] || undefined;
                      addToCart(quickViewProduct, quickViewQty, quickViewSelectedSize || undefined, finalColor);
                      setQuickViewAdded(true);
                      setAddedNotice(`Added ${quickViewQty} × "${quickViewProduct.name}" to your bag`);
                      setTimeout(() => {
                        setQuickViewAdded(false);
                        setQuickViewProduct(null);
                      }, 1200);
                      setTimeout(() => setAddedNotice(null), 3500);
                    }}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                      quickViewAdded
                        ? "bg-emerald-700 text-white ring-2 ring-emerald-400"
                        : "bg-[#5C1A52] hover:bg-[#4a1543] text-white"
                    }`}
                  >
                    {quickViewAdded ? (
                      <>
                        <Check size={15} className="stroke-[3] animate-bounce" />
                        <span>Added to Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={14} />
                        <span>Add to Bag &bull; AED {((quickViewProduct.discountPrice ?? quickViewProduct.price) * quickViewQty).toLocaleString()}</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/product/${quickViewProduct.slug || quickViewProduct._id}`}
                    onClick={() => setQuickViewProduct(null)}
                    className="text-center text-xs font-semibold text-[#5c1a52] hover:text-[#240821] underline underline-offset-4 py-1 transition-colors"
                  >
                    View Full Product Details &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {addedNotice && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-gray-950 text-white px-4 py-3 rounded-xl shadow-2xl border border-white/10 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Check size={14} className="stroke-[3] text-white" />
          </div>
          <p className="text-xs font-medium">{addedNotice}</p>
          <Link href="/cart" className="text-xs font-bold text-[#f5d796] hover:underline ml-2">
            View Bag
          </Link>
        </div>
      )}

      {mobileFiltersOpen && <div className="fixed inset-0 z-[60] lg:hidden"><button onClick={() => setMobileFiltersOpen(false)} className="absolute inset-0 bg-black/40" aria-label="Close filters" /><aside className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-white p-5 overflow-y-auto"><div className="flex justify-between items-center mb-6"><p className="font-bold">Filters</p><button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters"><X /></button></div>{panel}<button onClick={() => setMobileFiltersOpen(false)} className="w-full mt-6 bg-[#5c1a52] text-white py-3 text-sm rounded-sm">Show results</button></aside></div>}
    </main>
  );
}
