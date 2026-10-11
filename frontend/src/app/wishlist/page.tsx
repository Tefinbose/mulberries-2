"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LuHeart as Heart,
  LuShoppingBag as ShoppingBag,
  LuTrash2 as Trash2,
  LuX as X,
  LuArrowRight as ArrowRight,
  LuCheck as Check,
  LuSparkles as Sparkles,
  LuChevronRight as ChevronRight,
  LuArrowUpDown as ArrowUpDown,
} from "react-icons/lu";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { getProduct, type Product } from "@/lib/api";

export default function WishlistPage() {
  const { items, toggle } = useWishlist();
  const { addToCart } = useCart();
  const [liveProducts, setLiveProducts] = useState<Record<string, Product>>({});
  const [loadingLive, setLoadingLive] = useState(true);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "stock">("featured");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Retrieve current product records for live pricing, availability, and images
  useEffect(() => {
    let cancelled = false;
    if (items.length === 0) {
      setLoadingLive(false);
      return;
    }

    setLoadingLive(true);
    Promise.all(
      items.map(async (item) => {
        try {
          const { product } = await getProduct(item._id);
          return product;
        } catch {
          return item;
        }
      })
    )
      .then((products) => {
        if (cancelled) return;
        const map: Record<string, Product> = {};
        products.forEach((p) => {
          if (p && p._id) map[p._id] = p;
        });
        setLiveProducts(map);
      })
      .finally(() => {
        if (!cancelled) setLoadingLive(false);
      });

    return () => {
      cancelled = true;
    };
  }, [items]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;

    addToCart(
      product,
      1,
      product.sizes?.[0] ?? "Free Size",
      product.colors?.[0] ?? undefined
    );

    setAddedIds((prev) => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product._id]: false }));
    }, 1800);

    showToast(`Added "${product.name}" to your bag`);
  };

  const handleRemove = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product);
    showToast(`Removed from your wishlist`);
  };

  const handleMoveAllToBag = () => {
    let count = 0;
    items.forEach((saved) => {
      const p = liveProducts[saved._id] || saved;
      if (p.stock > 0) {
        addToCart(
          p,
          1,
          p.sizes?.[0] ?? "Free Size",
          p.colors?.[0] ?? undefined
        );
        count++;
      }
    });
    if (count > 0) {
      showToast(`Moved ${count} item${count > 1 ? "s" : ""} to your shopping bag!`);
    } else {
      showToast("No items currently available in stock");
    }
  };

  const handleClearAll = () => {
    items.forEach((item) => toggle(item));
    setShowClearConfirm(false);
    showToast("Cleared all wishlist items");
  };

  // Sorted items list
  const sortedItems = useMemo(() => {
    const list = [...items].map((item) => liveProducts[item._id] || item);
    if (sortBy === "price-asc") {
      list.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
    } else if (sortBy === "stock") {
      list.sort((a, b) => (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0));
    }
    return list;
  }, [items, liveProducts, sortBy]);

  // Total value calculation
  const totalValue = useMemo(() => {
    return items.reduce((sum, item) => {
      const p = liveProducts[item._id] || item;
      return sum + (p.discountPrice ?? p.price);
    }, 0);
  }, [items, liveProducts]);

  // ════════════ EMPTY STATE ════════════
  if (items.length === 0) {
    return (
      <main className="min-h-[75vh] bg-[#fdfbf9] flex flex-col justify-center items-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          {/* Subtle glowing heart icon */}
          <div className="relative mx-auto w-20 h-20 rounded-full bg-white border border-[#f0e4d8] shadow-sm flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-full bg-[#5c1a52]/5 animate-ping opacity-60" />
            <Heart size={36} className="text-[#5c1a52] stroke-[1.6]" />
          </div>

          <span className="text-[11px] font-montserrat uppercase tracking-[0.2em] font-bold text-[#c49a45] block mb-2">
            My Wishlist
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif italic text-stone-950 font-normal mb-3">
            Your Wishlist is Empty
          </h1>
          <p className="text-sm text-stone-500 font-light leading-relaxed mb-8 max-w-sm mx-auto">
            Discover our handcrafted sarees, festive wear, and party gowns to save your favorite styles.
          </p>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Link
              href="/traditional"
              className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-[#5c1a52] hover:text-[#5c1a52] transition-colors"
            >
              Traditional Sarees
            </Link>
            <Link
              href="/gowns"
              className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-[#5c1a52] hover:text-[#5c1a52] transition-colors"
            >
              Designer Gowns
            </Link>
            <Link
              href="/festive"
              className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-[#5c1a52] hover:text-[#5c1a52] transition-colors"
            >
              Festive Collection
            </Link>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#5c1a52] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#46133e] shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <span>Explore The Collection</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f6]">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900/95 backdrop-blur-md text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-white/10">
          <Sparkles size={14} className="text-[#c49a45]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Modal for Clearing Wishlist */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-stone-200 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={20} />
            </div>
            <h3 className="font-serif italic text-xl text-stone-950 font-normal mb-1.5">
              Clear Entire Wishlist?
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              This will remove all {items.length} items from your saved list. This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* ── Breadcrumb Navigation ── */}
        <nav className="flex items-center gap-1.5 text-xs text-stone-400 mb-6 font-montserrat">
          <Link href="/" className="hover:text-stone-700 transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <span className="text-stone-900 font-medium">My Wishlist</span>
        </nav>

        {/* ── Luxury Header Section ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200/80">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-[11px] font-montserrat uppercase tracking-[0.2em] font-bold text-[#c49a45]">
                Saved Favorites
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#5c1a52]/10 text-[#5c1a52]">
                {items.length} {items.length === 1 ? "Item" : "Items"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif italic text-stone-950 font-normal tracking-tight">
              My Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-light mt-1.5">
              Your saved collection of handcrafted silk sarees and festive dresses.
            </p>
          </div>

          {/* Action Toolbar on Header */}
          <div className="flex items-center flex-wrap gap-2.5 pt-2 md:pt-0">
            {/* Sort Selector */}
            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-700 py-2 pl-3 pr-8 shadow-2xs hover:border-stone-300 transition-colors cursor-pointer outline-none focus:ring-1 focus:ring-[#5c1a52]"
              >
                <option value="featured">Sort: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="stock">In Stock First</option>
              </select>
              <ArrowUpDown size={12} className="absolute right-2.5 pointer-events-none text-stone-400" />
            </div>

            {/* Clear All Button */}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-stone-600 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
              title="Clear all saved items"
            >
              <Trash2 size={13} />
              <span className="hidden sm:inline">Clear</span>
            </button>

            {/* Move All to Bag CTA */}
            <button
              onClick={handleMoveAllToBag}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5c1a52] hover:bg-[#46133e] text-white text-xs font-semibold shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingBag size={13} />
              <span>Move All to Bag</span>
            </button>
          </div>
        </div>

        {/* ── Refined Modern Product Grid (4 to 5 Columns for Elegant Image Proportions) ── */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6">
          {sortedItems.map((product) => {
            const hasDiscount =
              product.discountPrice && product.discountPrice < product.price;
            const discountPercent = hasDiscount
              ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
              : 0;
            const displayPrice = product.discountPrice ?? product.price;
            const isAdded = addedIds[product._id];
            const inStock = product.stock > 0;

            return (
              <div
                key={product._id}
                className="group relative flex flex-col rounded-2xl bg-white border border-stone-200/80 hover:border-stone-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(92,26,82,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* ── Image Area (Compact Portrait Aspect Ratio) ── */}
                <div className="relative w-full aspect-[3/4] bg-[#fbf8f5] overflow-hidden">
                  <Link href={`/product/${product._id}`} className="block w-full h-full">
                    <Image
                      src={product.images?.[0] || "/placeholder.jpg"}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                    />
                  </Link>

                  {/* Top-Left Badges */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
                    {hasDiscount && (
                      <span className="bg-[#e03a3c] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs tracking-wider">
                        -{discountPercent}%
                      </span>
                    )}
                    {!inStock && (
                      <span className="bg-stone-900/85 backdrop-blur-xs text-white text-[9.5px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Top-Right Remove Floating Button */}
                  <button
                    onClick={(e) => handleRemove(e, product)}
                    className="absolute top-2.5 right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-md text-stone-400 hover:text-rose-600 hover:bg-white shadow-xs flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
                    aria-label={`Remove ${product.name} from wishlist`}
                    title="Remove from wishlist"
                  >
                    <X size={14} className="stroke-[2.2]" />
                  </button>

                  {/* Desktop Quick Add Glass Slide-up Pill on Hover */}
                  {inStock && (
                    <div className="hidden sm:block absolute inset-x-2.5 bottom-2.5 z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-semibold backdrop-blur-md shadow-md flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                          isAdded
                            ? "bg-emerald-600 text-white"
                            : "bg-white/95 text-stone-900 hover:bg-[#5c1a52] hover:text-white"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check size={13} className="stroke-[2.5]" />
                            <span>Added to Bag</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={12} />
                            <span>Quick Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Product Info & Actions Area ── */}
                <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5">
                  <div>
                    {/* Material / Category tag */}
                    <span className="text-[10px] sm:text-[10.5px] uppercase font-semibold tracking-wider text-stone-400 block line-clamp-1 mb-0.5">
                      {product.material || "Heritage Collection"}
                    </span>

                    {/* Product Title */}
                    <Link
                      href={`/product/${product._id}`}
                      className="block text-xs sm:text-[13px] font-medium text-stone-900 group-hover:text-[#5c1a52] transition-colors line-clamp-1 leading-snug"
                    >
                      {product.name}
                    </Link>
                  </div>

                  {/* Price & Stock Row */}
                  <div>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-sm sm:text-[15px] font-bold text-stone-950 font-sans tracking-tight">
                        AED {displayPrice.toLocaleString()}
                      </span>
                      {hasDiscount && (
                        <span className="text-[11px] sm:text-xs text-stone-400 line-through font-light">
                          AED {product.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[10.5px]">
                      {inStock ? (
                        <span className="text-emerald-700 font-medium">In Stock</span>
                      ) : (
                        <span className="text-stone-400 font-medium">Sold Out</span>
                      )}
                      {product.stock > 0 && product.stock <= 5 && (
                        <span className="text-amber-600 font-semibold">
                          Only {product.stock} left
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mobile Action Button (Always accessible on touch devices) */}
                  <div className="sm:hidden pt-0.5">
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={!inStock}
                      className={`w-full h-8 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 ${
                        !inStock
                          ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                          : isAdded
                          ? "bg-emerald-600 text-white"
                          : "bg-[#5c1a52] hover:bg-[#46133e] text-white shadow-2xs"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={12} className="stroke-[2.5]" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={11} />
                          <span>Add to Bag</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom Summary & Continue Shopping Bar ── */}
        <div className="mt-12 pt-6 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            Showing <strong className="text-stone-900 font-semibold">{items.length}</strong> items in your wishlist &bull; Total estimated value:{" "}
            <strong className="text-stone-900 font-semibold">AED {totalValue.toLocaleString()}</strong>
          </p>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 font-semibold text-[#5c1a52] hover:underline"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </main>
  );
}
