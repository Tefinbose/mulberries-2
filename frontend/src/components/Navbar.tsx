"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LuSearch as Search,
  LuUser as User,
  LuMenu as Menu,
  LuX as X,
  LuChevronDown as ChevronDown,
  LuChevronLeft as ChevronLeft,
  LuChevronRight as ChevronRight,
  LuTag as Tag,
  LuArrowRight as ArrowRight,
  LuPackage as Package,
  LuLogOut as LogOut,
  LuUsers as Users,
  LuCamera as Camera,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { FaRegHeart, FaBagShopping } from "react-icons/fa6";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007/api";

type TopbarSlide = { text: string; highlight?: string };

// ── Topbar Carousel ──────────────────────────────────────
function TopbarCarousel() {
  const [slides, setSlides] = useState<TopbarSlide[]>([
    { text: "Free fast delivery across UAE on orders above AED 299" },
    { text: "Custom Traditional Clothes &bull; Handcrafted Sarees & Dresses" },
  ]);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`${BASE_URL}/coupons/active`)
      .then((r) => r.json())
      .then(({ coupons }) => {
        if (!coupons?.length) return;
        const couponSlides: TopbarSlide[] = coupons.map((c: any) => ({
          text: c.description
            ? `${c.description} — Use code`
            : `${c.discountType === "percentage" ? `${c.discountValue}% OFF` : `AED ${c.discountValue} OFF`}${c.minOrderValue ? ` on orders above AED ${c.minOrderValue}` : ""} — Use code`,
          highlight: c.code,
        }));
        setSlides([
          { text: "Free fast delivery across UAE on orders above AED 299" },
          ...couponSlides,
          { text: "Dubai Store &bull; Worldwide Delivery &bull; 100% Pure Silk" },
        ]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 4200);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length]);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  const slide = slides[current];

  return (
    <div className="bg-[#240821] text-white text-[11px] py-1.5 px-3 sm:px-4 border-b border-[#3d0f37] select-none">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">
        {/* Left: Store Support */}
        <div className="hidden md:flex items-center gap-4 text-gray-300">
          <a
            href="https://wa.me/971504715912"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#f5d796] transition-colors"
          >
            <FaWhatsapp size={12} className="text-[#25D366]" />
            <span className="font-light tracking-wide">Dubai Store: +971 50 471 5912</span>
          </a>
        </div>

        {/* Center: Slide text */}
        <div className="flex-1 flex items-center justify-center gap-2 text-center min-h-[20px]">
          <button
            onClick={prev}
            className="text-gray-400 hover:text-white transition-colors p-0.5 cursor-pointer"
            aria-label="Previous announcement"
          >
            <ChevronLeft size={13} />
          </button>

          <div className="flex items-center justify-center gap-1.5 flex-wrap tracking-wide text-[10.5px] sm:text-[11px]">
            <span className="text-gray-200 font-light">{slide.text}</span>
            {slide.highlight && (
              <span className="inline-flex items-center gap-1 bg-white/10 border border-[#c49a45]/50 text-[#f5d796] font-bold px-2 py-0.5 rounded tracking-widest text-[9.5px]">
                <Tag size={9} />
                {slide.highlight}
              </span>
            )}
          </div>

          <button
            onClick={next}
            className="text-gray-400 hover:text-white transition-colors p-0.5 cursor-pointer"
            aria-label="Next announcement"
          >
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Right: Currency indicator */}
        <div className="hidden md:flex items-center gap-3 text-gray-300 text-[11px]">
          <span className="inline-flex items-center font-medium text-gray-300">
            UAE (AED)
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Categories Data (Classic Silhouettes & Signature Edits) ──
const categoriesSilhouettes = [
  { label: "Gowns", href: "/gowns" },
  { label: "Traditional Sarees", href: "/traditional" },
  { label: "Indowestern", href: "/indowestern" },
  { label: "Tops & Tunics", href: "/tops" },
  { label: "Cotton Fabrics", href: "/cotton-fabrics" },
];

const categoriesEdits = [
  { label: "Plus Size Edit", href: "/plus-size" },
  { label: "Kaftans & Loungewear", href: "/kaftans" },
  { label: "Jewellery & Accessories", href: "/jewellery" },
  { label: "Trendy Picks", href: "/trendy" },
  { label: "Festive Collection", href: "/festive" },
];

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileAccordionOpen, setMobileAccordionOpen] = useState(true);

  const { totalItems: cartCount } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  // Close dropdowns when navigating
  useEffect(() => {
    setMobileDrawerOpen(false);
    setSearchOpen(false);
    setShopDropdownOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    router.push("/");
  };

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileDrawerOpen]);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setShopDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => {
      setShopDropdownOpen(false);
    }, 180);
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchText.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
    setSearchOpen(false);
    setMobileDrawerOpen(false);
  };

  return (
    <header className="w-full sticky top-0 z-50">
      <TopbarCarousel />

      {/* Main Luxury Classic Navbar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.04)] transition-all">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* ── Left: Mobile Hamburger Button & Desktop Brand Logo ── */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              className="lg:hidden p-1.5 -ml-1 text-gray-800 hover:text-[#5c1a52] transition-colors rounded-lg hover:bg-gray-100 cursor-pointer"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={22} className="stroke-[2.2]" />
            </button>

            {/* Desktop Brand Logo (Left-aligned) */}
            <Link
              href="/"
              className="hidden lg:flex items-center select-none group transition-transform duration-200 hover:scale-[1.01]"
              aria-label="Mulberries Home"
            >
              <Image
                src="/MULBERRIES.png"
                alt="Mulberries Dubai"
                width={160}
                height={62}
                priority
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>

          {/* ── Center: Mobile Centered Brand Wordmark OR Desktop Classic Nav Links ── */}
          {/* Mobile Centered Brand Text */}
          <div className="lg:hidden flex-1 flex justify-center items-center">
            <Link
              href="/"
              className="flex items-center select-none py-0.5"
              aria-label="Mulberries Home"
            >
              <span className="text-[22px] sm:text-[25px] font-black tracking-tight text-[#6b2160] leading-none select-none">
                Mulberries
              </span>
            </Link>
          </div>

          {/* Desktop Classic Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-[12.5px] font-montserrat font-semibold tracking-[0.14em] text-gray-800 uppercase">
            <Link
              href="/"
              className={`py-1.5 transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#5c1a52] after:transition-all after:duration-200 ${
                pathname === "/"
                  ? "text-[#5c1a52] after:w-full"
                  : "text-gray-700 hover:text-[#5c1a52] after:w-0 hover:after:w-full"
              }`}
            >
              Home
            </Link>

            <Link
              href="/our-story"
              className={`py-1.5 transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#5c1a52] after:transition-all after:duration-200 ${
                pathname === "/our-story"
                  ? "text-[#5c1a52] after:w-full"
                  : "text-gray-700 hover:text-[#5c1a52] after:w-0 hover:after:w-full"
              }`}
            >
              Our Story
            </Link>

            {/* Collections Dropdown Trigger */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href="/shop"
                className={`flex items-center gap-1.5 py-1.5 transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#5c1a52] after:transition-all after:duration-200 ${
                  shopDropdownOpen || pathname.startsWith("/shop")
                    ? "text-[#5c1a52] after:w-full"
                    : "text-gray-700 hover:text-[#5c1a52] after:w-0 hover:after:w-full"
                }`}
              >
                <span>Shop</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${shopDropdownOpen ? "rotate-180 text-[#5c1a52]" : "text-gray-400"}`}
                />
              </Link>

              {/* ── Normal Clean Luxury Dropdown Menu ── */}
              {shopDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1.5 w-[380px] z-50">
                  <div className="bg-white rounded-lg shadow-xl border border-gray-200 px-4 py-3.5 normal-case text-left">
                    <div className="grid grid-cols-2 gap-4">
                      
                      {/* Column 1: Clothing Styles */}
                      <div>
                        <h4 className="text-[11px] font-montserrat font-bold uppercase tracking-wider text-gray-900 pb-1.5 mb-1.5 border-b border-gray-100">
                          Clothing Styles
                        </h4>
                        <ul className="space-y-0.5">
                          {categoriesSilhouettes.map((cat) => (
                            <li key={cat.href}>
                              <Link
                                href={cat.href}
                                className="block py-0.5 text-[13px] font-montserrat font-medium text-gray-700 hover:text-[#5c1a52] transition-colors"
                              >
                                {cat.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Column 2: Special Collections */}
                      <div>
                        <h4 className="text-[11px] font-montserrat font-bold uppercase tracking-wider text-gray-900 pb-1.5 mb-1.5 border-b border-gray-100">
                          Special Collections
                        </h4>
                        <ul className="space-y-0.5">
                          {categoriesEdits.map((cat) => (
                            <li key={cat.href}>
                              <Link
                                href={cat.href}
                                className="block py-0.5 text-[13px] font-montserrat font-medium text-gray-700 hover:text-[#5c1a52] transition-colors"
                              >
                                {cat.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    {/* Bottom Link: View all collections */}
                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <Link
                        href="/shop"
                        className="text-xs font-montserrat font-semibold text-[#5c1a52] hover:underline inline-flex items-center gap-1.5"
                      >
                        <span>View all collections</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Team Direct Link */}
            <Link
              href="/team"
              className={`py-1.5 transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#5c1a52] after:transition-all after:duration-200 ${
                pathname === "/team"
                  ? "text-[#5c1a52] after:w-full"
                  : "text-gray-700 hover:text-[#5c1a52] after:w-0 hover:after:w-full"
              }`}
            >
              Team
            </Link>

            <Link
              href="/contact"
              className={`py-1.5 transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#5c1a52] after:transition-all after:duration-200 ${
                pathname === "/contact"
                  ? "text-[#5c1a52] after:w-full"
                  : "text-gray-700 hover:text-[#5c1a52] after:w-0 hover:after:w-full"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* ── Right: Classic Utility Icons (Search, Sign In / User, Wishlist, Bag) ── */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
            
            {/* Desktop Rounded Search Bar */}
            <form
              onSubmit={submitSearch}
              className="hidden md:flex items-center bg-[#f8f6f4] hover:bg-[#f3f0ec] focus-within:bg-white border border-[#ebdcd0] rounded-full px-3.5 py-1.5 gap-2 w-48 lg:w-56 focus-within:w-64 focus-within:ring-2 focus-within:ring-[#5c1a52]/20 focus-within:border-[#5c1a52] transition-all duration-300"
            >
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                type="search"
                placeholder="Search sarees, gowns..."
                className="text-xs outline-none w-full bg-transparent text-gray-800 placeholder-gray-400 font-normal"
              />
            </form>

            {/* Mobile Search Toggle Button */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-[#5c1a52] hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <Search size={19} />
            </button>

            {/* Account / Profile Dropdown (Showing options instead of direct redirection) */}
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className={`p-2 text-gray-700 hover:text-[#5c1a52] hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer ${
                  userDropdownOpen ? "bg-gray-100 text-[#5c1a52]" : ""
                }`}
                aria-label="User Account Menu"
                aria-expanded={userDropdownOpen}
              >
                <User size={19} />
                <span className="text-xs font-semibold hidden xl:inline text-gray-800 max-w-[110px] truncate">
                  {user ? user.name.split(" ")[0] : "Sign In"}
                </span>
                <ChevronDown
                  size={12}
                  className={`hidden xl:inline text-gray-400 transition-transform duration-200 ${
                    userDropdownOpen ? "rotate-180 text-[#5c1a52]" : ""
                  }`}
                />
              </button>

              {/* User Dropdown Menu Card */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-[0_12px_36px_rgba(36,8,33,0.14)] border border-[#ebdcd0] p-2.5 z-50 text-left animate-in fade-in duration-150">
                  {user ? (
                    <>
                      {/* Logged in User Header */}
                      <div className="px-3 py-2.5 bg-[#faf6f2] rounded-xl border border-[#ebdcd0]/60 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#5c1a52] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {user.name ? user.name[0] : "U"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#240821] truncate">
                              {user.name}
                            </p>
                            <p className="text-[11px] text-[#735e4d] truncate font-light">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Options */}
                      <div className="space-y-0.5 text-xs text-gray-700 font-medium">
                        <Link
                          href="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-[#5c1a52] transition-colors"
                        >
                          <User size={15} className="text-[#5c1a52]" />
                          <span>My Profile & Details</span>
                        </Link>

                        <Link
                          href="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-[#5c1a52] transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Package size={15} className="text-[#5c1a52]" />
                            <span>My Orders</span>
                          </div>
                          <span className="text-[10px] text-gray-400">Track</span>
                        </Link>

                        <Link
                          href="/wishlist"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-[#5c1a52] transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <FaRegHeart size={14} className="text-[#5c1a52]" />
                            <span>Saved Wishlist</span>
                          </div>
                          {mounted && wishlistCount > 0 && (
                            <span className="bg-[#5c1a52]/10 text-[#5c1a52] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {wishlistCount}
                            </span>
                          )}
                        </Link>

                        <Link
                          href="/cart"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-[#5c1a52] transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <FaBagShopping size={14} className="text-[#5c1a52]" />
                            <span>Shopping Bag</span>
                          </div>
                          {mounted && cartCount > 0 && (
                            <span className="bg-[#5c1a52]/10 text-[#5c1a52] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {cartCount}
                            </span>
                          )}
                        </Link>
                      </div>

                      {/* Divider */}
                      <div className="my-1.5 border-t border-gray-100" />

                      {/* Log Out Button */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Log Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Guest User Header */}
                      <div className="text-center pb-3 pt-1">
                        <p className="font-playfair text-sm font-bold text-[#240821]">
                          Welcome to Mulberries
                        </p>
                        <p className="text-[11px] text-[#735e4d] mt-0.5">
                          Sign in to manage orders & saved items
                        </p>
                      </div>

                      <Link
                        href="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center justify-center py-2 px-3 bg-[#5c1a52] hover:bg-[#43123b] text-white rounded-full text-xs font-semibold tracking-wide transition-colors mb-2 cursor-pointer"
                      >
                        Sign In
                      </Link>

                      <Link
                        href="/register"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center justify-center py-2 px-3 bg-white hover:bg-gray-50 border border-[#ebdcd0] text-[#240821] rounded-full text-xs font-semibold tracking-wide transition-colors mb-3 cursor-pointer"
                      >
                        Create Account
                      </Link>

                      <div className="border-t border-gray-100 pt-2 space-y-0.5 text-xs text-gray-700">
                        <Link
                          href="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Package size={14} className="text-[#5c1a52]" />
                          <span>Track Order</span>
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <FaRegHeart size={14} className="text-[#5c1a52]" />
                          <span>My Wishlist</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Link with Classic Brand Plum Badge */}
            <Link
              href="/wishlist"
              className="relative p-2 text-gray-700 hover:text-[#5c1a52] hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
              aria-label="Wishlist"
            >
              <FaRegHeart size={19} />
              {mounted && wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#5c1a52] text-white text-[9.5px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-0.5 ring-2 ring-white shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Bag with Classic Brand Plum Badge */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-[#5c1a52] hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
              aria-label="Shopping Cart"
            >
              <FaBagShopping size={18} />
              {mounted && cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#5c1a52] text-white text-[9.5px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-0.5 ring-2 ring-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

          </div>
        </div>

        {/* Mobile Search Expandable Bar */}
        {searchOpen && (
          <form onSubmit={submitSearch} className="md:hidden px-4 pb-3 pt-1 border-t border-gray-100 bg-white">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3.5 py-2 gap-2 focus-within:ring-2 focus-within:ring-[#5c1a52]/20 focus-within:border-[#5c1a52]">
              <Search size={15} className="text-gray-400" />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                type="search"
                placeholder="Search collections, sarees, festive..."
                className="text-xs outline-none w-full bg-transparent placeholder-gray-400"
                autoFocus
              />
              {searchText && (
                <button
                  type="button"
                  onClick={() => setSearchText("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* ════════════ MOBILE SLIDE-IN OFF-CANVAS DRAWER ════════════ */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative w-full max-w-[320px] bg-white h-full flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            
            {/* Drawer Header with Text Wordmark */}
            <div>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <Link
                  href="/"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center tracking-tight"
                >
                  <span className="text-2xl font-extrabold text-gray-950 font-serif tracking-[-0.03em] leading-none">
                    Mulberries
                  </span>
                </Link>

                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Drawer Search Input */}
              <div className="p-3 border-b border-gray-100">
                <form onSubmit={submitSearch}>
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 gap-2 text-xs">
                    <Search size={14} className="text-gray-400" />
                    <input
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Search catalog..."
                      className="bg-transparent outline-none w-full text-xs text-gray-800"
                    />
                  </div>
                </form>
              </div>

              {/* Drawer Navigation Links */}
              <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)] font-montserrat">
                <Link
                  href="/"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`block py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === "/" ? "bg-[#faf6f2] text-[#5c1a52]" : "text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Home
                </Link>

                {/* Shop Accordion */}
                <div>
                  <button
                    onClick={() => setMobileAccordionOpen(!mobileAccordionOpen)}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50 cursor-pointer"
                  >
                    <span>Shop</span>
                    <ChevronDown
                      size={15}
                      className={`text-gray-400 transition-transform duration-200 ${
                        mobileAccordionOpen ? "rotate-180 text-[#5c1a52]" : ""
                      }`}
                    />
                  </button>

                  {mobileAccordionOpen && (
                    <div className="pl-3 pr-1 py-1 space-y-1">
                      <Link
                        href="/shop"
                        onClick={() => setMobileDrawerOpen(false)}
                        className="flex items-center justify-between py-1.5 px-2 rounded-md text-xs font-semibold text-[#5c1a52] bg-[#faf6f2]"
                      >
                        <span>View All Products</span>
                        <ArrowRight size={12} />
                      </Link>

                      {/* Primary Categories */}
                      <div className="pt-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-2 block mb-1">
                          Clothing Styles
                        </span>
                        {categoriesSilhouettes.map((cat) => (
                          <Link
                            key={cat.href}
                            href={cat.href}
                            onClick={() => setMobileDrawerOpen(false)}
                            className="block py-1.5 px-2 rounded-md text-xs font-semibold text-gray-700 hover:text-[#5c1a52] hover:bg-gray-50 transition-colors"
                          >
                            {cat.label}
                          </Link>
                        ))}
                      </div>

                      {/* Secondary Categories */}
                      <div className="pt-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-2 block mb-1">
                          Special Collections
                        </span>
                        {categoriesEdits.map((cat) => (
                          <Link
                            key={cat.href}
                            href={cat.href}
                            onClick={() => setMobileDrawerOpen(false)}
                            className="block py-1.5 px-2 rounded-md text-xs font-semibold text-gray-700 hover:text-[#5c1a52] hover:bg-gray-50 transition-colors"
                          >
                            {cat.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="/team"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`block py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === "/team"
                      ? "bg-[#faf6f2] text-[#5c1a52]"
                      : "text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Team
                </Link>

                <Link
                  href="/our-story"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`block py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === "/our-story" ? "bg-[#faf6f2] text-[#5c1a52]" : "text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Our Story
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`block py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === "/contact" ? "bg-[#faf6f2] text-[#5c1a52]" : "text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Contact Us
                </Link>

                {/* Visual Card inside Mobile Drawer */}
                <div className="pt-3">
                  <Link
                    href="/festive"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="relative rounded-xl overflow-hidden aspect-[16/9] block shadow-xs group"
                  >
                    <Image
                      src="/fastive.jpg"
                      alt="Festive Edit"
                      fill
                      sizes="300px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="relative z-10 h-full flex flex-col justify-end p-3 text-white">
                      <span className="text-[9px] font-bold text-[#f5d796] uppercase tracking-wider">
                        Festive 2026
                      </span>
                      <p className="text-xs font-serif font-bold">The Royal Festive Edit &rarr;</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-gray-100 bg-[#faf8f6] space-y-2 text-xs">
              <Link
                href={user ? "/account" : "/login"}
                onClick={() => setMobileDrawerOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-gray-200 text-gray-800 font-medium hover:border-[#5c1a52]"
              >
                <User size={15} className="text-[#5c1a52]" />
                <span>{user ? `Account (${user.name})` : "Sign In / Register"}</span>
              </Link>

              <a
                href="https://wa.me/971504715912"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-lg bg-[#e8f7ee] border border-[#c6edd4] text-[#15803d] font-semibold"
              >
                <FaWhatsapp size={15} className="text-[#25D366]" />
                <span>Dubai Store (+971 50 471 5912)</span>
              </a>

              <div className="pt-1 flex items-center justify-between text-[11px] text-gray-500">
                <span>UAE (AED)</span>
                <span>Express Courier 2-4 Days</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
