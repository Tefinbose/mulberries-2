"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  LuHeart as Heart,
  LuStar as Star,
  LuMinus as Minus,
  LuPlus as Plus,
  LuTruck as Truck,
  LuRotateCcw as RotateCcw,
  LuShieldCheck as ShieldCheck,
  LuChevronRight as ChevronRight,
  LuChevronLeft as ChevronLeft,
  LuShare2 as Share2,
  LuLink2 as Link2,
  LuCheck as Check,
  LuChevronDown as ChevronDown,
  LuChevronUp as ChevronUp,
  LuMaximize2 as Maximize2,
  LuX as X,
  LuAward as Award,
  LuSmile as Smile,
  LuEye as Eye,
  LuShoppingBag as ShoppingBag,
} from "react-icons/lu";
import { FaWhatsapp, FaFacebookF } from "react-icons/fa";
import {
  FaXTwitter,
  FaBagShopping,
  FaBolt,
  FaScissors,
  FaGift,
  FaTruckFast,
  FaRotateLeft,
  FaShieldHalved,
} from "react-icons/fa6";
import {
  getProduct,
  getProductBySlug,
  getProductReviews,
  getProducts,
  submitProductReview,
  type Product,
  type Review,
} from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

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
  "sea green": "#2e8b57",
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
  mauve: "#9370db",
  teal: "#0d9488",
  turquoise: "#06b6d4",
  "peacock blue": "#005f73",
  silver: "#cbd5e1",
  grey: "#64748b",
  gray: "#64748b",
  charcoal: "#374151",
};

// Fallback harmonious palettes for related products if custom colors are not set
const DEFAULT_PALETTES = [
  ["#eab308", "#78350f", "#15803d", "#18181b"],
  ["#881337", "#d4af37", "#15803d"],
  ["#7e22ce", "#eab308", "#ec4899", "#059669", "#06b6d4"],
  ["#18181b", "#78350f", "#15803d"],
  ["#2563eb", "#15803d"],
  ["#f43f5e", "#7e22ce", "#eab308"],
];

function getRelatedProductSwatches(
  product: Product,
  index: number
): { name: string; hex: string }[] {
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

function getRelatedProductDiscount(
  product: Product,
  index: number
): {
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

type BundleItem = {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  colorName?: string;
  isMain?: boolean;
};

export default function ProductDetailClient() {
  const params = useParams();
  const id = params?.id as string;

  const { addToCart } = useCart();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();
  const { user, token } = useAuth();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);
  const [isAddedPrimary, setIsAddedPrimary] = useState(false);
  const [isAddedBundle, setIsAddedBundle] = useState(false);
  const [smiled, setSmiled] = useState(false);

  // You May Also Like states & quick-view modal
  const [relatedColors, setRelatedColors] = useState<Record<string, string>>({});
  const [addedRelatedIds, setAddedRelatedIds] = useState<Record<string, boolean>>({});
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [quickViewSelectedSize, setQuickViewSelectedSize] = useState<string | null>(null);
  const [quickViewSelectedColor, setQuickViewSelectedColor] = useState<string | null>(null);
  const [quickViewAdded, setQuickViewAdded] = useState(false);

  const handleRelatedQuickAdd = (e: React.MouseEvent, rp: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const color = relatedColors[rp._id] || rp.colors?.[0] || undefined;
    addToCart(rp, 1, rp.sizes?.[0] || undefined, color);
    setAddedRelatedIds((prev) => ({ ...prev, [rp._id]: true }));
    setAddedNotice(`Added "${rp.name}" to your bag`);
    setTimeout(() => {
      setAddedRelatedIds((prev) => ({ ...prev, [rp._id]: false }));
    }, 2200);
    setTimeout(() => setAddedNotice(null), 3500);
  };

  const openQuickView = (e: React.MouseEvent, rp: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(rp);
    setQuickViewQty(1);
    setQuickViewSelectedSize(rp.sizes?.[0] || "Free Size");
    setQuickViewSelectedColor(relatedColors[rp._id] || rp.colors?.[0] || null);
    setQuickViewAdded(false);
  };

  // Optional Add-on Services
  const [selectedAddons, setSelectedAddons] = useState<{
    fallPico: boolean;
    giftWrap: boolean;
  }>({
    fallPico: false,
    giftWrap: false,
  });

  // Complete The Look Bundle selections (accessory IDs checked)
  const [bundleSelections, setBundleSelections] = useState<Record<string, boolean>>({});
  const bundleScrollRef = useRef<HTMLDivElement>(null);

  const scrollBundle = (direction: "left" | "right") => {
    if (bundleScrollRef.current) {
      const scrollAmount = 210;
      bundleScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Accordions open/close state
  const [openAccordions, setOpenAccordions] = useState<{
    details: boolean;
    shipping: boolean;
    reviews: boolean;
  }>({
    details: true,
    shipping: false,
    reviews: false,
  });

  // Size Guide & Image Lightbox Modals
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Moving stock scarcity progress animation on load/reload (starts full at 100%, then drains to low stock)
  const [stockProgress, setStockProgress] = useState(100);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!id) return;
    const isObjectId = /^[a-f\d]{24}$/i.test(id);
    const fetcher = isObjectId ? getProduct(id) : getProductBySlug(id);
    fetcher
      .then((res) => {
        setProduct(res.product);
        setSelectedSize(res.product.sizes?.[0] ?? "Free Size");
        setSelectedColor(res.product.colors?.[0] ?? null);
        const productId = res.product._id;

        getProductReviews(productId)
          .then((r) => setReviews(r.reviews))
          .catch(() => { });

        const catId =
          typeof res.product.category === "string"
            ? res.product.category
            : res.product.category?._id;

        getProducts(catId ? `?category=${catId}&limit=8` : "?limit=8")
          .then((r) => {
            const others = r.products.filter((p) => p._id !== res.product._id);
            setRelated(others.slice(0, 4));
            // Initialize bundle selections for first 2 accessories
            const initialBundle: Record<string, boolean> = {};
            others.slice(0, 2).forEach((item) => {
              initialBundle[item._id] = true;
            });
            setBundleSelections(initialBundle);
          })
          .catch(() => { });
      })
      .catch(() => { });
  }, [id]);

  // Movement animation for scarcity progress bar on product load/reload:
  // Starts in full (100%) when page loads, then smoothly depletes down to a low percentage representing scarce remaining stock
  useEffect(() => {
    if (!product) return;
    setStockProgress(100);
    const stock = product.stock > 0 ? Math.min(product.stock, 19) : 19;
    // Map remaining stock to a realistic low scarcity percentage (between 14% and 24%)
    const lowTarget = Math.max(14, Math.min(24, Math.round((stock / 85) * 100)));
    const timer = setTimeout(() => {
      setStockProgress(lowTarget);
    }, 300);
    return () => clearTimeout(timer);
  }, [product?._id, id]);

  const handleAddToCart = () => {
    if (product?.sizes?.length && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addToCart(
      product!,
      quantity,
      selectedSize ?? undefined,
      selectedColor ?? undefined
    );

    setIsAddedPrimary(true);
    setTimeout(() => setIsAddedPrimary(false), 1800);

    setAddedNotice(`${product!.name} added to your bag`);
    setTimeout(() => setAddedNotice(null), 3000);
  };

  const handleBuyNow = () => {
    if (product?.sizes?.length && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addToCart(
      product!,
      quantity,
      selectedSize ?? undefined,
      selectedColor ?? undefined
    );
    router.push("/checkout");
  };

  const toggleAccordion = (key: "details" | "shipping" | "reviews") => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleBundleItem = (itemId: string) => {
    setBundleSelections((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleShare = (platform: "twitter" | "facebook" | "whatsapp" | "copy") => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const text = `Explore ${product?.name} at Mulberries Dubai`;

    if (platform === "copy") {
      navigator.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      return;
    }
    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank");
      return;
    }
    if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
      return;
    }
    if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
      return;
    }
  };

  const handleReviewSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReviewError("");
    setReviewSuccess("");
    if (!token) {
      setReviewError("Please log in to write a review.");
      return;
    }
    if (!reviewRating) {
      setReviewError("Please select a star rating.");
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError("Please write a review.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const result = await submitProductReview(
        product!._id,
        token,
        reviewRating,
        reviewComment
      );
      setReviews((current) => [
        result.review,
        ...current.filter((review) => review.user._id !== result.review.user._id),
      ]);
      setProduct((current) =>
        current
          ? {
            ...current,
            ratingsAverage: result.ratingsAverage,
            ratingsCount: result.ratingsCount,
          }
          : current
      );
      setReviewSuccess(result.message);
    } catch (error) {
      setReviewError(
        error instanceof Error ? error.message : "Could not submit your review."
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!product) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#faf8f6]">
        <div className="w-10 h-10 border-3 border-[#5c1a52]/20 border-t-[#5c1a52] rounded-full animate-spin mb-3" />
        <p className="text-gray-500 text-xs tracking-wider uppercase">Loading product details...</p>
      </main>
    );
  }

  const catSlug =
    typeof product.category === "string"
      ? product.category
      : product.category?.slug ?? "";
  const displayPrice = product.discountPrice ?? product.price;
  const hasDiscount =
    product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 25;
  const originalPrice = hasDiscount
    ? product.price
    : Math.round(product.price / (1 - discountPercent / 100));

  // Liquid Conversion Values
  const idCharSum = product._id
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const soldCount = (idCharSum % 22) + 9;
  const soldHours = (idCharSum % 7) + 3;
  const viewersCount = (idCharSum % 28) + 18;
  const stockLeft = product.stock > 0 ? Math.min(product.stock, 19) : 19;
  const ratingScore = product.ratingsAverage > 0 ? product.ratingsAverage.toFixed(1) : "5.0";
  const reviewsTotal = product.ratingsCount > 0 ? product.ratingsCount : reviews.length || 7;

  // Curated fallback bundle accessories if related items are sparse
  const fallbackAccessories: BundleItem[] = [
    {
      id: "acc-blouse-1",
      name: "Cotton Silk Embroidered Blouse",
      price: 1199,
      originalPrice: 1699,
      image: "/traditional.jpg",
      colorName: "Bronze / Gold",
    },
    {
      id: "acc-jewelry-2",
      name: "Heritage Ilakkathali Temple Choker",
      price: 999,
      originalPrice: 1399,
      image: "/tradition.jpg",
      colorName: "Antique Gold",
    },
  ];

  const bundleItems: BundleItem[] = [
    {
      id: product._id,
      name: `This item: ${product.name}`,
      price: displayPrice,
      originalPrice: originalPrice,
      image: product.images?.[0] || "/placeholder.jpg",
      colorName: selectedColor || "Standard",
      isMain: true,
    },
    ...(related.length > 0
      ? related.slice(0, 6).map((rp, idx) => ({
        id: rp._id,
        name: rp.name,
        price: rp.discountPrice ?? rp.price,
        originalPrice: rp.price > (rp.discountPrice ?? rp.price) ? rp.price : Math.round(rp.price * 1.3),
        image: rp.images?.[0] || "/placeholder.jpg",
        colorName: rp.colors?.[0] || (idx % 2 === 0 ? "Bronze" : "Gold"),
      }))
      : fallbackAccessories),
  ];

  // Calculate Bundle Pricing
  const totalBundleOriginal = bundleItems.reduce((acc, item) => {
    if (item.isMain || bundleSelections[item.id]) {
      return acc + item.originalPrice;
    }
    return acc;
  }, 0);

  const totalBundlePrice = bundleItems.reduce((acc, item) => {
    if (item.isMain || bundleSelections[item.id]) {
      return acc + item.price;
    }
    return acc;
  }, 0);

  const handleAddBundleToCart = () => {
    // 1. Add main product
    addToCart(product, 1, selectedSize ?? undefined, selectedColor ?? undefined);

    // 2. Add selected accessories
    related.forEach((item) => {
      if (bundleSelections[item._id]) {
        addToCart(item, 1);
      }
    });

    setIsAddedBundle(true);
    setTimeout(() => setIsAddedBundle(false), 2000);
    setAddedNotice("Complete look bundle added to bag!");
    setTimeout(() => setAddedNotice(null), 3200);
  };

  return (
    <main className="bg-[#fcfbf9] min-h-screen text-gray-900 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap font-light">
          <Link href="/" className="hover:text-[#5c1a52] transition-colors">
            Home
          </Link>
          <ChevronRight size={11} className="text-gray-400" />
          <Link href="/shop" className="hover:text-[#5c1a52] transition-colors">
            Collections
          </Link>
          {catSlug && (
            <>
              <ChevronRight size={11} className="text-gray-400" />
              <Link href={`/${catSlug}`} className="hover:text-[#5c1a52] capitalize transition-colors">
                {catSlug.replace("-", " ")}
              </Link>
            </>
          )}
          <ChevronRight size={11} className="text-gray-400" />
          <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* ── Main Product Section (Sticky Left Gallery + Scrollable Right Info Column) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">

          {/* ════════════ LEFT COLUMN: STICKY MEDIA GALLERY (Col 7) ════════════ */}
          <div className="lg:col-span-7 lg:sticky lg:top-24 h-fit">
            <div className="flex flex-col-reverse sm:flex-row gap-3.5">

              {/* Vertical Thumbnails Bar */}
              <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[580px] pb-1 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {product.images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(i)}
                    className={`relative flex-shrink-0 w-16 h-20 sm:w-[72px] sm:h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:opacity-100 ${activeImage === i
                        ? "border-[#5c1a52] shadow-md ring-2 ring-[#5c1a52]/15 scale-102"
                        : "border-gray-200/80 opacity-75 hover:border-gray-400"
                      }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${i + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover object-top"
                    />
                  </button>
                ))}
              </div>

              {/* Main Preview Hero Display (Aspect 3:4 portrait fashion ratio) */}
              <div className="group/hero relative flex-1 aspect-[3/4] sm:aspect-[4/5] rounded-2xl overflow-hidden bg-[#f8f5f2] border border-gray-200/60 shadow-sm cursor-zoom-in">
                <Image
                  src={product.images[activeImage] || "/placeholder.jpg"}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover/hero:scale-135"
                  onClick={() => setShowLightbox(true)}
                />

                {/* Liquid Sheen Sweep reflection across main image on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover/hero:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />

                {/* Orange Discount Badge (Top Right Corner - Exactly like uploaded screenshot 2) */}
                <div className="absolute top-3.5 right-3.5 z-20">
                  <span className="bg-[#f95721] text-white text-[11px] font-bold px-2.5 py-0.5 rounded tracking-wide shadow-sm">
                    -{discountPercent}%
                  </span>
                </div>

                {/* Floating Wishlist Heart Button (Top Left) */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(product);
                  }}
                  className="absolute top-3.5 left-3.5 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all"
                  aria-label="Wishlist"
                >
                  <Heart
                    size={16}
                    className={
                      isWishlisted(product._id)
                        ? "fill-[#dc2626] text-[#dc2626]"
                        : "text-gray-700 hover:text-red-500"
                    }
                  />
                </button>

                {/* Floating Lightbox Enlarge Button (Bottom Right) */}
                <button
                  onClick={() => setShowLightbox(true)}
                  className="absolute bottom-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-gray-800 flex items-center justify-center shadow-sm opacity-0 group-hover/hero:opacity-100 transition-opacity duration-300"
                  aria-label="Enlarge view"
                  title="Enlarge view"
                >
                  <Maximize2 size={13} />
                </button>
              </div>

            </div>
          </div>

          {/* ════════════ RIGHT COLUMN: SCROLLABLE PRODUCT DETAILS (Col 5) ════════════ */}
          <div className="lg:col-span-5 flex flex-col space-y-3 sm:space-y-3.5">

            {/* Title & Navigation */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl font-serif font-normal text-gray-950 leading-snug tracking-wide">
                  {product.name}
                </h1>

                {related.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-shrink-0 pt-1">
                    <Link
                      href={`/product/${related[0]._id}`}
                      className="w-7 h-7 rounded-full border border-gray-200 hover:border-gray-800 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                      aria-label="Previous product"
                      title="Previous product"
                    >
                      <ChevronLeft size={14} />
                    </Link>
                    <Link
                      href={`/product/${related[related.length - 1]._id}`}
                      className="w-7 h-7 rounded-full border border-gray-200 hover:border-gray-800 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                      aria-label="Next product"
                      title="Next product"
                    >
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                )}
              </div>

              {/* Star Rating Row */}
              <div className="flex items-center gap-1.5 mt-1.5 text-amber-500">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-amber-500 text-amber-500 stroke-none"
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600 font-medium ml-1">
                  ({reviewsTotal} Reviews)
                </span>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 ml-2 font-medium">
                  Verified Heritage
                </span>
              </div>
            </div>

            {/* Pricing Section & Delivery Badge in One Compact Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <div className="flex items-baseline gap-2.5">
                <span className="text-sm sm:text-base text-gray-400 line-through font-light">
                  AED {originalPrice.toLocaleString()}
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-[#e03a3c] font-sans tracking-tight">
                  AED {displayPrice.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-[#f95721] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                  -{discountPercent}% OFF
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-emerald-800 bg-[#e8f7ee] border border-[#c6edd4]">
                <Truck size={13} className="stroke-[2.2]" />
                <span>Express 2–4 Days</span>
              </span>
            </div>

            {/* ── Feature Value Props Chips ── */}
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#faf6f2] text-gray-800 border border-[#ebdcd0] shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5c1a52]" />
                {product.material ? `${product.material} Drape` : "Feather-Light Drape"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#faf6f2] text-gray-800 border border-[#ebdcd0] shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5c1a52]" />
                Breathable All-Day Comfort
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#faf6f2] text-gray-800 border border-[#ebdcd0] shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5c1a52]" />
                Timeless Traditional Charm
              </span>
            </div>

            {/* ── Scarcity Countdown Box with Live Animated Progress Bar ── */}
            <div className="bg-[#fffdfb] rounded-xl p-3 border border-[#f0e4d8] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-700 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="text-orange-500 animate-pulse text-sm">🔥</span>
                  <span>
                    <strong className="text-gray-950 font-bold">{soldCount} sold</strong> in last {soldHours} hours
                  </span>
                </div>
                <span className="text-gray-500 text-[11px]">
                  Brand: <span className="font-semibold text-gray-900">Mulberries Dubai</span>
                </span>
              </div>

              {/* Animated Progress Bar with Live Movement */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">Inventory Status</span>
                  <span className="text-gray-700 font-medium">
                    Only <span className="text-[#e03a3c] font-bold">{stockLeft} item(s)</span> left in stock
                  </span>
                </div>
                <div className="w-full bg-neutral-200/90 h-2 rounded-full overflow-hidden relative shadow-inner">
                  <div
                    className="bg-gradient-to-r from-[#e03a3c] via-[#f43f5e] to-[#e03a3c] h-full rounded-full transition-all duration-1200 ease-out relative overflow-hidden shadow-xs"
                    style={{
                      width: `${stockProgress}%`,
                    }}
                  >
                    {/* Live continuous shimmer sweep across the progress bar */}
                    <div className="absolute inset-0 -translate-x-full animate-[progressSweep_2.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/55 to-transparent" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Color Swatches Selector ── */}
            {product.colors && product.colors.length > 0 && (
              <div className="pt-0.5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5">
                  COLOR:{" "}
                  <span className="font-semibold text-gray-950 uppercase">
                    {selectedColor || product.colors[0]}
                  </span>
                </p>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {product.colors.map((color) => {
                    const lower = color.toLowerCase().trim();
                    const hex = COLOR_MAP[lower] || lower;
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          if (product.colors && product.images && product.images.length > 0) {
                            const cIdx = product.colors.findIndex(
                              (c) => c.toLowerCase().trim() === color.toLowerCase().trim()
                            );
                            if (cIdx >= 0) {
                              setActiveImage(cIdx % product.images.length);
                            }
                          }
                        }}
                        aria-label={`Select color ${color}`}
                        title={color}
                        className={`w-8 h-8 rounded-md border-2 transition-all duration-200 relative flex items-center justify-center cursor-pointer ${isSelected
                            ? "border-gray-900 ring-2 ring-gray-900/20 scale-105 shadow-sm"
                            : "border-gray-300 hover:border-gray-500"
                          }`}
                        style={{ backgroundColor: hex }}
                      >
                        {isSelected && (
                          <Check
                            size={12}
                            className={
                              lower === "white" || lower === "off white" || lower === "cream" || lower === "yellow"
                                ? "text-gray-900 stroke-[3]"
                                : "text-white stroke-[3]"
                            }
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Size Selector with Size Guide ── */}
            <div className="pt-0.5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-800">
                  Size
                </p>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs text-gray-500 hover:text-[#5c1a52] underline transition-colors cursor-pointer"
                >
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(product.sizes && product.sizes.length > 0
                  ? product.sizes
                  : ["Free Size"]
                ).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setSelectedSize(size);
                      setSizeError(false);
                    }}
                    className={`px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wide transition-all cursor-pointer ${selectedSize === size
                        ? "bg-[#5c1a52] text-white border-[#5c1a52] shadow-sm"
                        : "border-gray-300 text-gray-700 hover:border-gray-400 bg-white"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {sizeError && (
                <p className="text-xs text-red-500 mt-1">Please select a size to continue.</p>
              )}
            </div>

            {/* ── PRIMARY ACTION ROW: Quantity + ADD TO CART + BUY NOW ── */}
            <div className="pt-1 space-y-2">
              {/* Mobile Quantity Selector Row (Compact & clean, avoids stretching across the whole screen) */}
              <div className="flex items-center justify-between sm:hidden px-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Quantity</span>
                <div className="flex items-center justify-between border-2 border-gray-200 rounded-xl bg-white w-28 h-9 px-1 shadow-2xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-[#5c1a52] rounded-lg active:scale-90 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={13} className="stroke-[2.5]" />
                  </button>
                  <span className="text-xs font-bold text-gray-900 px-1">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-[#5c1a52] rounded-lg active:scale-90 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus size={13} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Action Buttons Row: Side by Side on Mobile, 3-column on Desktop */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Desktop Quantity Selector (Hidden on mobile) */}
                <div className="hidden sm:flex items-center justify-between border-2 border-gray-200 hover:border-gray-300 rounded-xl bg-white w-28 px-1 h-12 shadow-2xs transition-colors flex-shrink-0">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-full flex items-center justify-center text-gray-500 hover:text-[#5c1a52] hover:bg-[#faf4f9] rounded-lg transition-all active:scale-90 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} className="stroke-[2.5]" />
                  </button>
                  <span className="text-sm font-bold text-gray-900 px-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-full flex items-center justify-center text-gray-500 hover:text-[#5c1a52] hover:bg-[#faf4f9] rounded-lg transition-all active:scale-90 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} className="stroke-[2.5]" />
                  </button>
                </div>

                {/* Add To Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className={`group/btn relative overflow-hidden flex-1 text-white text-[11.5px] min-[380px]:text-xs sm:text-[13px] font-bold tracking-wider uppercase h-12 px-2.5 sm:px-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.98] cursor-pointer text-center flex items-center justify-center gap-1.5 sm:gap-2 ${isAddedPrimary
                      ? "bg-emerald-600 ring-2 ring-emerald-400"
                      : "bg-gradient-to-r from-[#6b1e60] via-[#5c1a52] to-[#4e1445] hover:from-[#7b226e] hover:via-[#661c5b] hover:to-[#55164a]"
                    }`}
                >
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />

                  {isAddedPrimary ? (
                    <>
                      <Check size={15} className="stroke-[3] animate-bounce" />
                      <span className="tracking-wide">Added</span>
                    </>
                  ) : (
                    <>
                      <FaBagShopping size={14} className="flex-shrink-0 transition-transform duration-300 group-hover/btn:scale-115 text-white" />
                      <span className="whitespace-nowrap">Add to Cart</span>
                    </>
                  )}
                </button>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  className="group/buy relative overflow-hidden flex-1 bg-gradient-to-r from-[#1c121b] via-[#120a11] to-[#0a0509] hover:from-[#2e1d2c] hover:to-[#1a0e19] text-white border border-[#c49a45]/60 hover:border-[#c49a45] text-[11.5px] min-[380px]:text-xs sm:text-[13px] font-bold tracking-wider uppercase h-12 px-2.5 sm:px-5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] cursor-pointer text-center flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-200/25 to-transparent -translate-x-full group-hover/buy:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />

                  <FaBolt size={14} className="text-[#f5d796] flex-shrink-0 transition-transform duration-300 group-hover/buy:scale-125" />
                  <span className="whitespace-nowrap text-white group-hover/buy:text-[#fdfaf5]">Buy Now</span>
                </button>
              </div>
            </div>

            {/* ── Optional Saree Services Add-ons (Neatly positioned directly below the Action Buttons) ── */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                  <span>Saree Customization</span>
                  <span className="text-[10px] font-semibold text-[#8b6528] bg-[#fbf6ea] border border-[#ebdcd0] px-2 py-0.5 rounded-full lowercase tracking-normal">
                    optional add-ons
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Fall & Pico Service */}
                <label
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${selectedAddons.fallPico
                      ? "border-[#5c1a52] bg-[#faf3f8] shadow-2xs"
                      : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAddons.fallPico}
                    onChange={(e) =>
                      setSelectedAddons((prev) => ({ ...prev, fallPico: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#5c1a52] focus:ring-[#5c1a52] border-gray-300 cursor-pointer"
                  />
                  <div className="w-7 h-7 rounded-md bg-[#f5ede8] flex items-center justify-center flex-shrink-0 text-[#5c1a52]">
                    <FaScissors size={12} className="text-[#5c1a52]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 leading-tight">Fall & Pico</p>
                    <p className="text-[10.5px] text-gray-500">+AED 25.00</p>
                  </div>
                </label>

                {/* Gift Packaging Service */}
                <label
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${selectedAddons.giftWrap
                      ? "border-[#5c1a52] bg-[#faf3f8] shadow-2xs"
                      : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAddons.giftWrap}
                    onChange={(e) =>
                      setSelectedAddons((prev) => ({ ...prev, giftWrap: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#5c1a52] focus:ring-[#5c1a52] border-gray-300 cursor-pointer"
                  />
                  <div className="w-7 h-7 rounded-md bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-600">
                    <FaGift size={12} className="text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 leading-tight">Gift Packaging</p>
                    <p className="text-[10.5px] text-gray-500">+AED 35.00</p>
                  </div>
                </label>
              </div>
            </div>

            {/* ── Trust Assurances Strip (Free Delivery | Delivery & Return | Cash on Delivery) ── */}
            <div className="flex items-center justify-between py-3 border-y border-gray-200 text-xs text-gray-600 gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <FaTruckFast size={14} className="text-[#5c1a52]" />
                <span className="font-medium">Free Delivery</span>
              </div>
              <span className="text-gray-300 hidden sm:inline">&bull;</span>
              <div className="flex items-center gap-1.5">
                <FaRotateLeft size={13} className="text-[#5c1a52]" />
                <span className="font-medium">7 Days Return</span>
              </div>
              <span className="text-gray-300 hidden sm:inline">&bull;</span>
              <div className="flex items-center gap-1.5">
                <FaShieldHalved size={14} className="text-[#5c1a52]" />
                <span className="font-medium">Cash on Delivery</span>
              </div>
            </div>

            {/* ── Live Viewers Counter with Smile Button (Exact Match to Design) ── */}
            <div className="flex items-center gap-2.5 text-xs sm:text-[13.5px] text-gray-700 py-0.5">
              <button
                type="button"
                onClick={() => setSmiled((s) => !s)}
                className={`inline-flex items-center justify-center transition-all duration-200 cursor-pointer select-none ${smiled
                    ? "scale-115 text-[#5c1a52]"
                    : "text-gray-800 hover:text-[#5c1a52] hover:scale-110 active:scale-95"
                  }`}
                title="Smile! People viewing this right now"
                aria-label="Smile button"
              >
                <Smile size={19} className="stroke-[1.8]" />
              </button>
              <span className="leading-normal">
                <strong className="font-semibold text-gray-950">{viewersCount} people</strong> are viewing this right now
              </span>
            </div>

            {/* ── Social Share & WhatsApp VIP Contact ── */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs text-gray-500 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700 flex items-center gap-1">
                    <Share2 size={13} /> Share:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShare("twitter")}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
                      title="Share on X"
                      aria-label="Share on X"
                    >
                      <FaXTwitter size={11} />
                    </button>
                    <button
                      onClick={() => handleShare("facebook")}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-blue-600 transition-colors"
                      title="Share on Facebook"
                      aria-label="Share on Facebook"
                    >
                      <FaFacebookF size={11} />
                    </button>
                    <button
                      onClick={() => handleShare("whatsapp")}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-emerald-600 transition-colors"
                      title="Share on WhatsApp"
                      aria-label="Share on WhatsApp"
                    >
                      <FaWhatsapp size={12} />
                    </button>
                    <button
                      onClick={() => handleShare("copy")}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
                      title="Copy link"
                      aria-label="Copy link"
                    >
                      <Link2 size={12} />
                    </button>
                  </div>
                </div>
                {copied && (
                  <span className="text-[11px] text-emerald-600 font-bold">Link copied!</span>
                )}
              </div>

              {/* WhatsApp Store Direct Chat */}
              <a
                href={`https://wa.me/971504715912?text=${encodeURIComponent(
                  `Hello Mulberries Dubai! I'm viewing "${product.name}" (AED ${displayPrice}) and would love some help.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 bg-[#f0fbf4] hover:bg-[#e4f7eb] border border-[#c3edd1] text-[#15803d] text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors group shadow-2xs"
              >
                <FaWhatsapp size={16} className="text-[#25D366] group-hover:scale-110 transition-transform" />
                <span>Chat with us on WhatsApp for orders & styling support</span>
              </a>
            </div>

            {/* ════════════ COMPLETE THE LOOK BUNDLE MODULE (Screenshot 3) ════════════ */}
            <div className="mt-6 pt-5 border-t border-gray-200">
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm relative overflow-hidden">
                {/* Header with Scroll Navigation */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <Award size={15} className="text-[#c49a45]" />
                      <h3 className="font-serif text-lg font-bold text-gray-950">
                        Complete the Look
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 font-light">
                      Add matching accessories to style your perfect look.
                    </p>
                  </div>

                  {/* Scroll Carousel Controls */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => scrollBundle("left")}
                      className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-[#faf6f2] hover:border-[#5c1a52]/50 text-gray-700 hover:text-[#5c1a52] flex items-center justify-center transition-all shadow-xs active:scale-90 cursor-pointer"
                      aria-label="Scroll complete the look left"
                      title="Scroll left"
                    >
                      <ChevronLeft size={16} className="stroke-[2.2]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollBundle("right")}
                      className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-[#faf6f2] hover:border-[#5c1a52]/50 text-gray-700 hover:text-[#5c1a52] flex items-center justify-center transition-all shadow-xs active:scale-90 cursor-pointer"
                      aria-label="Scroll complete the look right"
                      title="Scroll right"
                    >
                      <ChevronRight size={16} className="stroke-[2.2]" />
                    </button>
                  </div>
                </div>

                {/* Horizontal Scrollable Bundle Cards Track */}
                <div className="relative group/bundle">
                  <div
                    ref={bundleScrollRef}
                    className="flex gap-3 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-thin"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "#ebdcd0 transparent",
                    }}
                  >
                    {bundleItems.map((item) => {
                      const isChecked = item.isMain || bundleSelections[item.id];
                      return (
                        <div
                          key={item.id}
                          className={`flex-shrink-0 w-[175px] sm:w-[190px] snap-start rounded-xl border p-2.5 flex flex-col justify-between transition-all duration-200 bg-white ${
                            isChecked
                              ? "border-[#5c1a52] shadow-sm ring-1 ring-[#5c1a52]/20"
                              : "border-gray-200 opacity-80 hover:opacity-100"
                          }`}
                        >
                          <div>
                            {/* Image with Checkbox */}
                            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#f8f5f2] mb-2 group/item">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="180px"
                                className="object-cover object-top transition-transform duration-300 group-hover/item:scale-105"
                              />
                              {/* Checkbox */}
                              {!item.isMain ? (
                                <button
                                  type="button"
                                  onClick={() => toggleBundleItem(item.id)}
                                  className={`absolute top-2 right-2 w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                                    isChecked
                                      ? "bg-[#5c1a52] text-white"
                                      : "bg-white/90 border border-gray-300 text-transparent hover:border-[#5c1a52]"
                                  }`}
                                  aria-label={`Select ${item.name}`}
                                >
                                  <Check size={12} className="stroke-[3]" />
                                </button>
                              ) : (
                                <span className="absolute top-2 right-2 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                  Main
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight min-h-[2rem]">
                              {item.name}
                            </p>

                            {/* Price */}
                            <div className="flex items-baseline gap-1.5 mt-1">
                              <span className="text-[11px] text-gray-400 line-through">
                                AED {item.originalPrice}
                              </span>
                              <span className="text-xs font-bold text-[#5c1a52]">
                                AED {item.price}
                              </span>
                            </div>
                          </div>

                          {/* Color Tag */}
                          {item.colorName && (
                            <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between">
                              <span className="text-[10px] text-gray-500 font-medium truncate">
                                {item.colorName}
                              </span>
                              {!item.isMain && (
                                <span
                                  className="text-[9.5px] font-semibold text-[#5c1a52] cursor-pointer hover:underline"
                                  onClick={() => toggleBundleItem(item.id)}
                                >
                                  {isChecked ? "Selected" : "+ Add"}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bundle Price & Add Selected to Cart */}
                <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-gray-500 font-light block">Price for all:</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-gray-400 line-through">
                        AED {totalBundleOriginal.toLocaleString()}
                      </span>
                      <span className="text-lg font-bold text-gray-950 font-sans">
                        AED {totalBundlePrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleAddBundleToCart}
                    className={`text-white text-xs font-bold uppercase tracking-wider py-3 px-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 ${isAddedBundle ? "bg-emerald-700" : "bg-[#18181b] hover:bg-black"
                      }`}
                  >
                    {isAddedBundle ? (
                      <>
                        <Check size={14} className="stroke-[3]" />
                        <span>Bundle Added</span>
                      </>
                    ) : (
                      <>
                        <FaBagShopping size={13} />
                        <span>Add selected to cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ════════════ PRODUCT DETAILS ACCORDIONS (Screenshot 3) ════════════ */}
            <div className="pt-4 space-y-2.5">

              {/* Accordion 1: Product Details */}
              <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion("details")}
                  className="w-full flex items-center justify-between p-4 text-left font-serif text-sm sm:text-base font-bold text-gray-900 hover:text-[#5c1a52] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Star size={14} className="text-[#c49a45]" />
                    Product Details & Specifications
                  </span>
                  {openAccordions.details ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {openAccordions.details && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-[13px] text-gray-600 border-t border-gray-100 space-y-2.5">
                    <p className="leading-relaxed">
                      {product.description ||
                        "Traditional luxury crafted with pure elegance. Carefully made by expert weavers with premium fabric, fine details, and a royal look."}
                    </p>
                    <ul className="space-y-1.5 pt-1">
                      <li className="flex items-start gap-2">
                        <strong className="text-gray-900 w-24 flex-shrink-0">Fabric:</strong>
                        <span>{product.material || "Pure Mul Cotton / Heritage Weave"}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <strong className="text-gray-900 w-24 flex-shrink-0">Design:</strong>
                        <span>Kanchi inspired woven Jacquard border &bull; Elegant rich pallu &bull; Handmade tassels</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <strong className="text-gray-900 w-24 flex-shrink-0">Length:</strong>
                        <span>5.5 meters saree with 0.8 meter unstitched blouse piece</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <strong className="text-gray-900 w-24 flex-shrink-0">Wash Care:</strong>
                        <span>Dry clean recommended for first wash; gentle cold hand wash thereafter</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 2: Shipping & Delivery */}
              <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion("shipping")}
                  className="w-full flex items-center justify-between p-4 text-left font-serif text-sm sm:text-base font-bold text-gray-900 hover:text-[#5c1a52] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Truck size={14} className="text-[#c49a45]" />
                    Delivery & Easy Returns
                  </span>
                  {openAccordions.shipping ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {openAccordions.shipping && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-[13px] text-gray-600 border-t border-gray-100 space-y-2">
                    <p>
                      <strong>UAE Delivery:</strong> Express delivery across Dubai, Abu Dhabi, Sharjah, and Northern Emirates in 2&ndash;4 business days. Free courier for orders above AED 299.
                    </p>
                    <p>
                      <strong>GCC Express:</strong> Deliveries to Saudi Arabia, Oman, Qatar, Kuwait &amp; Bahrain in 3&ndash;5 business days via DHL Express.
                    </p>
                    <p>
                      <strong>Hassle-Free Returns:</strong> 7-day seamless return or exchange policy on unworn garments with original tags intact.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Customer Reviews */}
              <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion("reviews")}
                  className="w-full flex items-center justify-between p-4 text-left font-serif text-sm sm:text-base font-bold text-gray-900 hover:text-[#5c1a52] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Star size={14} className="text-[#c49a45]" />
                    Customer Reviews ({reviewsTotal})
                  </span>
                  {openAccordions.reviews ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {openAccordions.reviews && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl font-bold text-gray-950 font-serif">
                        {ratingScore}
                      </span>
                      <div>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className="fill-amber-500 text-amber-500 stroke-none" />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Based on {reviewsTotal} verified reviews</p>
                      </div>
                    </div>

                    {/* Review Form */}
                    <form onSubmit={handleReviewSubmit} className="border border-gray-200 rounded-lg p-3.5 mb-4 bg-[#faf8f6]">
                      <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Write a review</p>
                      {user ? (
                        <>
                          <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className="p-0.5 text-amber-500"
                              >
                                <Star
                                  size={18}
                                  className={star <= reviewRating ? "fill-amber-500" : "text-gray-300"}
                                />
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            rows={3}
                            placeholder="Share your experience with the drape, fabric, and color..."
                            className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-[#5c1a52]"
                          />
                          {reviewError && <p className="text-xs text-red-600 mt-1">{reviewError}</p>}
                          {reviewSuccess && <p className="text-xs text-emerald-600 mt-1">{reviewSuccess}</p>}
                          <button
                            type="submit"
                            disabled={isSubmittingReview}
                            className="mt-2 bg-[#5c1a52] text-white text-xs font-bold px-4 py-1.5 rounded hover:bg-[#4a1543] transition-colors"
                          >
                            {isSubmittingReview ? "Submitting..." : "Submit Review"}
                          </button>
                        </>
                      ) : (
                        <p className="text-xs text-gray-600">
                          Please <Link href="/login" className="text-[#5c1a52] underline font-semibold">sign in</Link> to share a review.
                        </p>
                      )}
                    </form>

                    {/* Review List */}
                    <div className="space-y-3">
                      {reviews.length > 0 ? (
                        reviews.map((r) => (
                          <div key={r._id} className="border-b border-gray-100 pb-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-semibold text-gray-900">{r.user?.name || "Verified Customer"}</span>
                              <span className="text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-0.5 text-amber-500 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={11} className={i < r.rating ? "fill-amber-500" : "text-gray-200"} />
                              ))}
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{r.comment}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 italic">Be the first to leave a review for this look.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* ── You May Also Like Section ── */}
        {related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#ebdcd0] relative">
            {/* Ambient luxury accent glow */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[280px] bg-[radial-gradient(ellipse_at_top,_rgba(92,26,82,0.06),_transparent_70%)] pointer-events-none" />

            {/* Section Header: Centered luxury title with elegant lines */}
            <div className="text-center mb-8 sm:mb-10 relative">
              <div className="inline-flex items-center justify-center gap-4 sm:gap-6 w-full max-w-xl mx-auto">
                <span className="h-[1px] bg-gradient-to-r from-transparent via-[#c49a45]/40 to-[#c49a45]/60 flex-1" />
                <h2 className="font-playfair text-[22px] sm:text-[26px] lg:text-[30px] font-bold tracking-wide text-[#240821] uppercase">
                  YOU MAY ALSO <span className="italic font-playfair text-[#5c1a52]">LIKE</span>
                </h2>
                <span className="h-[1px] bg-gradient-to-l from-transparent via-[#c49a45]/40 to-[#c49a45]/60 flex-1" />
              </div>
              <p className="text-[14px] sm:text-[15px] text-[#735e4d] mt-2 tracking-normal font-normal">
                Curated traditional sarees and festive silhouettes from our Dubai boutique
              </p>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 relative">
              {related.map((rp, idx) => {
                const { discountPct, originalPrice, salePrice } = getRelatedProductDiscount(rp, idx);
                const swatches = getRelatedProductSwatches(rp, idx);
                const selectedColor = relatedColors[rp._id] || swatches[0]?.name;

                // Dynamically map active image to selected color swatch
                const swatchIdx = swatches.findIndex((s) => s.name === selectedColor);
                const colorIdx = rp.colors && rp.colors.length > 0
                  ? rp.colors.findIndex((c) => c.toLowerCase().trim() === (selectedColor || "").toLowerCase().trim())
                  : -1;
                const effectiveIdx = colorIdx >= 0 ? colorIdx : (swatchIdx >= 0 ? swatchIdx : 0);
                const totalImages = rp.images?.length || 0;
                const activeImgIdx = totalImages > 0 ? (effectiveIdx % totalImages) : 0;
                const primaryImage = rp.images?.[activeImgIdx] || "/placeholder.jpg";
                const hasSecondImg = totalImages > 1;
                const secondImgIdx = hasSecondImg ? (activeImgIdx + 1) % totalImages : 0;
                const secondaryImage = hasSecondImg ? rp.images![secondImgIdx] : null;
                const isAdded = addedRelatedIds[rp._id];

                return (
                  <div
                    key={rp._id}
                    className="group/card flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_42px_-10px_rgba(92,26,82,0.16)] border border-[#ebdcd0] hover:border-[#5c1a52]/40 shadow-[0_2px_12px_rgba(92,26,82,0.03)]"
                  >
                    {/* Media / Image Container (Aspect 3:4 portrait fashion ratio) */}
                    <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-[#f8f4ee] to-[#ece3d6] overflow-hidden">
                      <Link href={`/product/${rp.slug || rp._id}`} className="block w-full h-full">
                        {/* Primary Image */}
                        <Image
                          key={`primary-${rp._id}-${activeImgIdx}`}
                          src={primaryImage}
                          alt={rp.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px"
                          className={`object-cover object-top transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                            hasSecondImg
                              ? "opacity-100 group-hover/card:opacity-0 group-hover/card:scale-105"
                              : "group-hover/card:scale-105"
                          }`}
                        />

                        {/* Secondary Image cross-fade */}
                        {hasSecondImg && secondaryImage && (
                          <Image
                            key={`secondary-${rp._id}-${secondImgIdx}`}
                            src={secondaryImage}
                            alt={`${rp.name} alternate view`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px"
                            className="object-cover object-top opacity-0 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                          />
                        )}
                      </Link>

                      {/* Liquid Sheen sweep reflection across image on hover */}
                      <div className="absolute inset-0 -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-10" />

                      {/* Royal Mulberry Plum & Gold Foil Discount Badge */}
                      <div className="absolute top-2.5 right-2.5 z-20">
                        <span className="inline-flex items-center bg-[#5c1a52] text-[#fffdfa] text-[11px] sm:text-[12px] font-semibold px-2.5 py-0.5 rounded-full tracking-wider uppercase shadow-sm border border-[#f5d796]/35">
                          -{discountPct}%
                        </span>
                      </div>

                      {/* Top Left Floating Wishlist Button */}
                      <div className="absolute top-2.5 left-2.5 z-20">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(rp);
                          }}
                          className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-gray-700 flex items-center justify-center shadow-xs hover:scale-110 active:scale-125 transition-all border border-[#ebdcd0] cursor-pointer"
                          aria-label="Wishlist"
                        >
                          <Heart
                            size={14}
                            className={
                              isWishlisted(rp._id)
                                ? "fill-[#dc2626] text-[#dc2626]"
                                : "text-gray-700 hover:text-red-500"
                            }
                          />
                        </button>
                      </div>

                      {/* Mobile Frosted Pearl Action Capsule */}
                      <div className="sm:hidden absolute bottom-2.5 right-2.5 z-20 flex items-center bg-white/95 backdrop-blur-md rounded-full p-1 shadow-[0_6px_20px_rgba(92,26,82,0.18)] border border-[#eedfcb]">
                        <button
                          onClick={(e) => openQuickView(e, rp)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[#5c1a52] hover:bg-[#5c1a52]/10 active:scale-90 transition-all cursor-pointer"
                          aria-label="Quick preview"
                          title="Quick preview"
                        >
                          <Eye size={13} className="stroke-[2.2]" />
                        </button>

                        <span className="w-[1px] h-3.5 bg-[#ebdcd0]" />

                        <button
                          onClick={(e) => handleRelatedQuickAdd(e, rp)}
                          disabled={rp.stock === 0}
                          className={`h-7 px-2.5 rounded-full text-[10.5px] font-bold flex items-center gap-1 transition-all duration-300 active:scale-95 shadow-xs cursor-pointer ${
                            isAdded
                              ? "bg-emerald-700 text-white animate-pulse"
                              : rp.stock === 0
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
                          ) : rp.stock === 0 ? (
                            <span className="text-[10px]">Sold</span>
                          ) : (
                            <>
                              <ShoppingBag size={11} />
                              <span className="text-[10px]">+Bag</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Desktop Hover Action Buttons Overlay */}
                      <div className="absolute inset-x-3 bottom-3 z-20 hidden sm:flex flex-col gap-1.5 opacity-0 translate-y-3 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300 ease-out pointer-events-none group-hover/card:pointer-events-auto">
                        <button
                          onClick={(e) => openQuickView(e, rp)}
                          className="w-full bg-white hover:bg-[#faf6f2] text-[#240821] text-[10.5px] font-bold tracking-wider uppercase py-2 px-3 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-[#ebdcd0] text-center rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye size={13} className="text-[#5c1a52]" />
                          <span>Quick View</span>
                        </button>

                        <button
                          onClick={(e) => handleRelatedQuickAdd(e, rp)}
                          disabled={rp.stock === 0}
                          className={`w-full text-white text-[10.5px] font-bold tracking-wider uppercase py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.95] text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                            isAdded
                              ? "bg-emerald-700 ring-2 ring-emerald-400 scale-[1.02]"
                              : rp.stock === 0
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-[#5c1a52] hover:bg-[#43123b]"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check size={13} className="stroke-[3] animate-bounce" />
                              <span>Added to Bag!</span>
                            </>
                          ) : rp.stock === 0 ? (
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

                    {/* Card Info Area */}
                    <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
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
                          <span className="text-[12px] font-medium text-[#8f8175]">5.0</span>
                        </div>

                        {/* Product Title */}
                        <Link href={`/product/${rp.slug || rp._id}`}>
                          <h3 className="text-[14px] sm:text-[15px] font-medium text-[#240821] group-hover/card:text-[#5c1a52] transition-colors line-clamp-1 leading-snug">
                            {rp.name}
                          </h3>
                        </Link>

                        {/* Harmonious Pricing & Offer Savings Row */}
                        <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1 mt-1.5">
                          <span className="text-[13px] sm:text-[14px] text-[#9c8e82] line-through font-normal">
                            AED {originalPrice.toLocaleString()}
                          </span>
                          <span className="text-[16px] sm:text-[17px] font-bold text-[#5c1a52] tracking-tight">
                            AED {salePrice.toLocaleString()}
                          </span>
                          <span className="text-[9.5px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Save AED {(originalPrice - salePrice).toLocaleString()}
                          </span>
                        </div>

                        {/* Warm Linen Express Delivery Badge */}
                        <div className="mt-2.5">
                          <span className="inline-flex items-center gap-1.5 bg-[#faf5ef] border border-[#eedfcb] text-[#704d2e] px-2 py-0.5 rounded-full text-[9px] sm:text-[9.5px] font-semibold tracking-wider uppercase">
                            <Truck size={10} className="text-[#5c1a52] stroke-[2.2]" />
                            <span>2-4 DAYS EXPRESS DELIVERY</span>
                          </span>
                        </div>
                      </div>

                      {/* Color Swatches Row */}
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
                                  setRelatedColors((prev) => ({
                                    ...prev,
                                    [rp._id]: swatch.name,
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
          </section>
        )}

        {/* ── Quick View Modal for Related Products ── */}
        {quickViewProduct && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setQuickViewProduct(null)}
          >
            <div
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[#ebdcd0]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Product Image preview */}
                <div className="relative aspect-[3/4] md:aspect-auto md:min-h-[420px] bg-gradient-to-b from-[#f8f4ee] to-[#ece3d6] overflow-hidden">
                  <Image
                    src={quickViewProduct.images?.[0] || "/placeholder.jpg"}
                    alt={quickViewProduct.name}
                    fill
                    className="object-cover object-top"
                  />
                  <div className="absolute top-3.5 left-3.5 z-20">
                    <span className="inline-flex items-center bg-[#5c1a52] text-[#fffdfa] text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full tracking-wider uppercase shadow-sm border border-[#f5d796]/35">
                      SPECIAL RECOMMENDATION
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5 sm:p-6 flex flex-col justify-between">
                  <div>
                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="flex items-center gap-0.5 text-[#c49a45]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className="text-[#c49a45] fill-[#c49a45] stroke-[1.2]" />
                        ))}
                      </div>
                      <span className="text-xs text-[#8f8175] ml-1">5.0 (Verified Quality)</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-serif font-medium text-[#240821] leading-snug">
                      {quickViewProduct.name}
                    </h3>

                    {/* Pricing */}
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
                        In Stock & Ready to Ship
                      </span>
                    </div>

                    {/* Express Delivery Badge */}
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 bg-[#faf5ef] border border-[#eedfcb] text-[#704d2e] px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase">
                        <Truck size={11} className="text-[#5c1a52] stroke-[2.2]" />
                        <span>2-4 DAYS EXPRESS DELIVERY</span>
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
                      {quickViewProduct.description ||
                        "Handcrafted luxury ethnic drape featuring premium embellishments and refined textures for weddings and festive occasions."}
                    </p>

                    {/* Colors Swatches inside Quick View */}
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

                    {/* Sizes inside Quick View if available */}
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

                    {/* Quantity Stepper */}
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

                  {/* Quick View Action Buttons with Animated Morphing */}
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

      </div>

      {/* ── Size Guide Modal ── */}
      {showSizeGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowSizeGuide(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
              aria-label="Close size guide"
            >
              <X size={16} />
            </button>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">Saree & Blouse Sizing Guide</h3>
            <p className="text-xs text-gray-500 mb-4">Standard measurements crafted to fit diverse body shapes with ease.</p>

            <div className="space-y-4 text-xs text-gray-700">
              <div className="p-3 bg-[#faf6f2] rounded-lg border border-[#ebdcd0]">
                <h4 className="font-bold text-gray-900 mb-1">Standard Saree Dimensions</h4>
                <p>Length: <strong>5.5 Meters</strong> (approx. 6 yards)</p>
                <p>Width: <strong>44 Inches</strong> (112 cm)</p>
                <p>Blouse Piece: <strong>0.8 Meter</strong> running unstitched material</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-2">Ready Blouse Size Chart (Inches)</h4>
                <table className="w-full border-collapse border border-gray-200 text-left">
                  <thead>
                    <tr className="bg-gray-100 text-gray-900 font-semibold">
                      <th className="p-2 border border-gray-200">Size</th>
                      <th className="p-2 border border-gray-200">Bust</th>
                      <th className="p-2 border border-gray-200">Waist</th>
                      <th className="p-2 border border-gray-200">Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-gray-200 font-medium">Small (S)</td>
                      <td className="p-2 border border-gray-200">34&quot;&ndash;36&quot;</td>
                      <td className="p-2 border border-gray-200">28&quot;&ndash;30&quot;</td>
                      <td className="p-2 border border-gray-200">14&quot;</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-gray-200 font-medium">Medium (M)</td>
                      <td className="p-2 border border-gray-200">36&quot;&ndash;38&quot;</td>
                      <td className="p-2 border border-gray-200">30&quot;&ndash;32&quot;</td>
                      <td className="p-2 border border-gray-200">14.5&quot;</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-gray-200 font-medium">Large (L)</td>
                      <td className="p-2 border border-gray-200">38&quot;&ndash;40&quot;</td>
                      <td className="p-2 border border-gray-200">32&quot;&ndash;34&quot;</td>
                      <td className="p-2 border border-gray-200">15&quot;</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-gray-200 font-medium">Free Size</td>
                      <td className="p-2 border border-gray-200">34&quot;&ndash;42&quot;</td>
                      <td className="p-2 border border-gray-200">Adjustable</td>
                      <td className="p-2 border border-gray-200">Standard</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Image Lightbox Modal ── */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all"
            aria-label="Close lightbox"
          >
            <X size={20} />
          </button>
          <div className="relative w-full max-w-4xl max-h-[85vh] aspect-[3/4] sm:aspect-[4/5] rounded-xl overflow-hidden shadow-2xl">
            <Image
              src={product.images[activeImage] || "/placeholder.jpg"}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* ── Mobile Sticky Bottom Action Bar (Ensures Add to Cart & Buy Now are always accessible on scroll) ── */}
      {showBackToTop && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 py-2 px-3 sm:hidden shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-9 h-11 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 relative border border-gray-200">
              <Image
                src={product.images[0] || "/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-cover object-top"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-gray-900 truncate leading-tight">{product.name}</p>
              <p className="text-xs font-bold text-[#e03a3c] leading-tight">AED {displayPrice.toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="h-10 px-3 bg-gradient-to-r from-[#6b1e60] via-[#5c1a52] to-[#4e1445] text-white text-[11px] font-bold uppercase rounded-lg shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <FaBagShopping size={12} />
            <span>Add</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="h-10 px-3 bg-gradient-to-r from-[#1f161e] to-[#0d070c] text-white border border-[#c49a45]/50 text-[11px] font-bold uppercase rounded-lg shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <FaBolt size={12} className="text-[#f5d796]" />
            <span>Buy</span>
          </button>
        </div>
      )}

      {/* ── Floating Back to Top Button ── */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-40 w-10 h-10 rounded-full bg-white text-gray-900 shadow-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
          aria-label="Scroll back to top"
          title="Back to top"
        >
          <ChevronUp size={18} />
        </button>
      )}

      {/* ── Toast Notification Alert ── */}
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
    </main>
  );
}
