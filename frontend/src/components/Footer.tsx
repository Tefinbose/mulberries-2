"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LuArrowRight as ArrowRight,
  LuMail as Mail,
  LuPhone as Phone,
  LuMapPin as MapPin,
  LuTruck as Truck,
  LuAward as Award,
  LuShieldCheck as ShieldCheck,
  LuMessageCircle as MessageCircle,
  LuChevronUp as ChevronUp,
} from "react-icons/lu";
import { FaInstagram, FaYoutube, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover } from "react-icons/fa6";

const shopCategories = [
  { label: "All Collections", href: "/shop" },
  { label: "Traditional Sarees", href: "/traditional" },
  { label: "Designer Gowns", href: "/gowns" },
  { label: "Indowestern Fusion", href: "/indowestern" },
  { label: "Festive Wear", href: "/festive" },
  { label: "Kaftans & Loungewear", href: "/kaftans" },
  { label: "Plus Size Collection", href: "/plus-size" },
  { label: "Tops & Tunics", href: "/tops" },
  { label: "Cotton Fabrics", href: "/cotton-fabrics" },
  { label: "Jewellery & Accents", href: "/jewellery" },
  { label: "Trendy Edits", href: "/trendy" },
];

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Our Story & Heritage", href: "/our-story" },
  { label: "Customer Support", href: "/contact" },
  { label: "Search Catalog", href: "/search" },
];

const accountLinks = [
  { label: "My Profile & Account", href: "/account" },
  { label: "Track Orders", href: "/account" },
  { label: "My Wishlist", href: "/wishlist" },
  { label: "Shopping Bag", href: "/cart" },
  { label: "Shipping & Delivery", href: "/contact" },
  { label: "Exchange & Returns", href: "/contact" },
];

const paymentIcons = [
  { label: "Visa", Icon: FaCcVisa, color: "#1A1F71" },
  { label: "Mastercard", Icon: FaCcMastercard, color: "#EB001B" },
  { label: "American Express", Icon: FaCcAmex, color: "#2E77BC" },
  { label: "Discover", Icon: FaCcDiscover, color: "#FF6000" },
];

const EMAIL = "Contact@mulberries.shop";
const PHONE = "+971 4 273 7543";
const WHATSAPP = "+971 4 273 7543";
const ADDRESS = "Dubai, United Arab Emirates";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeMsg, setSubscribeMsg] = useState("✓ Welcome to the Mulberries Club! Check your inbox soon.");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007/api";
      const res = await fetch(`${apiUrl}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "footer_subscription" }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.message) {
        setSubscribeMsg(data.message);
      } else {
        setSubscribeMsg("✓ Welcome to the Mulberries Club! Check your inbox soon.");
      }
      setSubscribed(true);
      setEmail("");
    } catch {
      // In case server is offline, provide graceful friendly confirmation
      setSubscribeMsg("✓ Welcome to the Mulberries Club! Check your inbox soon.");
      setSubscribed(true);
      setEmail("");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative w-full bg-[#faf6f2]/80 border-t border-[#f0e6dc] overflow-hidden">
      
      {/* ── Pre-Footer: Luxury Trust & Value Propositions ──── */}
      <div className="border-b border-[#ebdcd0] bg-white/70">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100/90 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-xl bg-[#faf6f2] flex items-center justify-center flex-shrink-0 text-[#5c1a52]">
                <Truck size={22} />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-0.5">Free UAE Delivery</h4>
                <p className="text-[13px] font-normal text-gray-500 leading-[1.5]">Free express courier on all orders above AED 299.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100/90 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-xl bg-[#faf6f2] flex items-center justify-center flex-shrink-0 text-[#c49a45]">
                <Award size={22} />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-0.5">Authentic Craftsmanship</h4>
                <p className="text-[13px] font-normal text-gray-500 leading-[1.5]">Handpicked sarees, pure silks & custom fits.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100/90 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-xl bg-[#faf6f2] flex items-center justify-center flex-shrink-0 text-[#5c1a52]">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-0.5">100% Secure Checkout</h4>
                <p className="text-[13px] font-normal text-gray-500 leading-[1.5]">Encrypted card payments & Cash on Delivery.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100/90 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-xl bg-[#faf6f2] flex items-center justify-center flex-shrink-0 text-[#25D366]">
                <MessageCircle size={22} />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-0.5">WhatsApp Support</h4>
                <p className="text-[13px] font-normal text-gray-500 leading-[1.5]">Direct stylist advice & order tracking help.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Main Footer Grid ──────────────────────────────── */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1.1fr_0.9fr_1fr_1.4fr] gap-10 lg:gap-12">
          
          {/* Column 1: Brand & Contact */}
          <div>
            <Link href="/" className="inline-block relative w-44 h-12 mb-4 text-[22px] font-bold text-[#240821]">
              <Image
                src="/MULBERRIES.png"
                alt="Mulberries Dubai"
                fill
                sizes="176px"
                className="object-contain object-left"
              />
              <span className="sr-only">Mulberries</span>
            </Link>
            <p className="text-[13px] sm:text-[14px] font-normal text-gray-600 mb-6 leading-[1.6] max-w-sm">
              Fashion for every chapter of you. Curating timeless ethnic weaves, luxury sarees, and modern fusion attire designed for elegance.
            </p>

            <div className="space-y-3 mb-6 text-[13px] sm:text-[14px] font-normal text-gray-600">
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-3 hover:text-[#5c1a52] transition-colors font-normal"
              >
                <Mail size={15} className="text-[#5c1a52] flex-shrink-0" />
                <span className="font-normal">{EMAIL}</span>
              </a>
              <a
                href={`tel:${PHONE.replace(/\s/g, "")}`}
                className="flex items-center gap-3 hover:text-[#5c1a52] transition-colors font-normal"
              >
                <Phone size={15} className="text-[#5c1a52] flex-shrink-0" />
                <span className="font-normal">{PHONE}</span>
              </a>
              <div className="flex items-center gap-3 font-normal">
                <MapPin size={15} className="text-[#5c1a52] flex-shrink-0" />
                <span className="font-normal">{ADDRESS}</span>
              </div>
            </div>

            {/* Social Pills */}
            <div className="flex items-center gap-2.5">
              <a
                href={`https://wa.me/${WHATSAPP.replace(/\s/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#25D366] hover:border-[#25D366] hover:text-white transition-all shadow-sm hover:scale-105"
              >
                <FaWhatsapp size={15} />
              </a>
              <a
                href="https://www.instagram.com/mulberries_official/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#5c1a52] hover:border-[#5c1a52] hover:text-white transition-all shadow-sm hover:scale-105"
              >
                <FaInstagram size={15} />
              </a>
              <a
                href="https://www.facebook.com/Mulberriess/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#5c1a52] hover:border-[#5c1a52] hover:text-white transition-all shadow-sm hover:scale-105"
              >
                <FaFacebookF size={14} />
              </a>
              <a
                href="https://www.youtube.com/@mulberriesboutique8326"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#5c1a52] hover:border-[#5c1a52] hover:text-white transition-all shadow-sm hover:scale-105"
              >
                <FaYoutube size={15} />
              </a>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div>
            <h4 className="text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-gray-900 mb-4 pb-1 border-b border-gray-200/80 inline-block">
              Featured Collections
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
              {shopCategories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className={`text-[13px] sm:text-[14px] leading-[1.6] transition-colors ${
                      cat.label === "All Collections"
                        ? "text-[#5c1a52] font-semibold hover:underline"
                        : "text-gray-600 font-normal hover:text-[#5c1a52]"
                    }`}
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h4 className="text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-gray-900 mb-4 pb-1 border-b border-gray-200/80 inline-block">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] sm:text-[14px] font-normal leading-[1.6] text-gray-600 hover:text-[#5c1a52] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Customer Care & Account */}
          <div>
            <h4 className="text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-gray-900 mb-4 pb-1 border-b border-gray-200/80 inline-block">
              Customer Care
            </h4>
            <ul className="space-y-2.5">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] sm:text-[14px] font-normal leading-[1.6] text-gray-600 hover:text-[#5c1a52] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: VIP Newsletter & Payments */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#c49a45] bg-[#faf6f2] px-2.5 py-1 rounded-full inline-block mb-3">
              The Mulberry Club
            </span>
            <h4 className="text-[24px] sm:text-[26px] lg:text-[28px] font-bold text-gray-900 mb-2 leading-tight">
              Exclusive Access & Drops
            </h4>
            <p className="text-[14px] sm:text-[15px] font-normal text-gray-600 mb-4 leading-[1.5]">
              Be the first to preview festive releases, private seasonal sales, and member-only privileges.
            </p>

            {subscribed ? (
              <div className="bg-[#faf6f2] border border-[#c49a45]/40 rounded-lg p-3 text-[13px] sm:text-[14px] text-[#5c1a52] font-medium mb-5">
                {subscribeMsg}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2 mb-5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 min-w-0 px-3.5 py-2.5 rounded-lg border border-gray-300 text-[14px] placeholder:text-[14px] placeholder:font-normal font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5c1a52]/20 focus:border-[#5c1a52] bg-gray-50"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="px-3.5 sm:px-4 h-10 flex-shrink-0 rounded-lg bg-[#5c1a52] flex items-center justify-center gap-1.5 hover:bg-[#4a1543] transition-colors text-white text-[14px] sm:text-[15px] font-semibold shadow-sm"
                >
                  <span>Subscribe</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            )}

            <div className="pt-2 border-t border-gray-100">
              <p className="text-[12px] sm:text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                Accepted Payment Methods
              </p>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {paymentIcons.map(({ label, Icon, color }) => (
                  <div
                    key={label}
                    className="w-11 h-7 rounded border border-gray-200 bg-white flex items-center justify-center shadow-xs"
                    title={label}
                  >
                    <Icon size={24} style={{ color }} />
                  </div>
                ))}
                <div className="h-7 px-2 rounded border border-gray-200 bg-white flex items-center justify-center text-[10px] font-bold text-gray-700 shadow-xs">
                  COD
                </div>
              </div>
              <p className="text-[12px] sm:text-[13px] font-normal text-gray-400">
                256-Bit SSL Encrypted & Verified Checkout
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom Bar: Copyright, Policies & Back to Top ── */}
      <div className="relative z-10 border-t border-[#ebdcd0] bg-[#faf6f2]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] sm:text-[13px] font-normal text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} Mulberries Boutique LLC. All rights reserved.
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center text-[12px] sm:text-[13px] font-normal text-gray-500">
            <Link href="/contact" className="hover:text-[#5c1a52] transition-colors font-normal">
              Privacy & Cookies
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/contact" className="hover:text-[#5c1a52] transition-colors font-normal">
              Terms & Conditions
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/contact" className="hover:text-[#5c1a52] transition-colors font-normal">
              Shipping & Deliveries
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/contact" className="hover:text-[#5c1a52] transition-colors font-normal">
              Returns & Exchanges
            </Link>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-[12px] sm:text-[13px] font-semibold text-gray-600 hover:text-[#5c1a52] transition-colors py-1 px-2.5 rounded-full hover:bg-white"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ChevronUp size={14} />
          </button>
        </div>
      </div>

    </footer>
  );
}
