"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LuArrowLeft as ArrowLeft,
  LuLock as Lock,
  LuShoppingBag as ShoppingBag,
  LuTag as Tag,
  LuX as X,
  LuCircleCheck as CheckCircle2,
  LuChevronDown as ChevronDown,
  LuChevronUp as ChevronUp,
  LuTruck as Truck,
  LuShieldCheck as ShieldCheck,
  LuCreditCard as CreditCard,
  LuMapPin as MapPin,
  LuClock as Clock,
  LuCheck as Check,
} from "react-icons/lu";
import { SiStripe } from "react-icons/si";
import {
  createOrder,
  guestCheckout,
  validateCoupon,
  createStripePaymentIntent,
  confirmStripePayment,
  getStripeConfig,
  type ShippingAddress,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const UAE_EMIRATES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
];

const emptyAddress: ShippingAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "Dubai",
  emirate: "Dubai",
  country: "UAE",
};

const FREE_SHIPPING_THRESHOLD = 299;
const STANDARD_SHIPPING_FEE = 20;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart, hydrated } = useCart();
  const { user, token, setSession, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Mobile order summary accordion toggle
  const [mobileSummaryExpanded, setMobileSummaryExpanded] = useState(false);

  // Payment Method state: "online" | "cod"
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [cardDetails, setCardDetails] = useState({
    nameOnCard: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  // Stripe status state
  const [stripeConfig, setStripeConfig] = useState<{ isConfigured: boolean; currency: string } | null>(null);

  useEffect(() => {
    getStripeConfig()
      .then((cfg) => setStripeConfig(cfg))
      .catch(() => setStripeConfig({ isConfigured: false, currency: "aed" }));
  }, []);

  // Synchronize initial user details once loaded without locking inputs
  useEffect(() => {
    if (user) {
      setEmail((prev) => prev || user.email || "");
      setAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  const updateAddress = (field: keyof ShippingAddress, value: string) => {
    setAddress((cur) => ({ ...cur, [field]: value }));
  };

  const discountedTotal = appliedCoupon
    ? Math.max(totalPrice - appliedCoupon.discount, 0)
    : totalPrice;

  const isFreeShipping = discountedTotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = items.length === 0 ? 0 : isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  const grandTotal = discountedTotal + shippingCost;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - discountedTotal);

  // ── Apply coupon ──────────────────────────────────────
  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await validateCoupon(code, totalPrice);
      setAppliedCoupon({ code: res.coupon.code, discount: res.discount });
      setCouponCode("");
    } catch (err: any) {
      setCouponError(err.message || "Invalid coupon code");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  // ── Place order ───────────────────────────────────────
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!items.length) return;
    setSubmitting(true);
    setError("");

    const orderItems = items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));

    const checkoutAddress: ShippingAddress = {
      ...address,
      fullName: address.fullName.trim() || user?.name || "Customer",
      phone: address.phone.trim() || user?.phone || "",
      country: "UAE",
    };

    // Validate online card details if online payment is chosen
    if (paymentMethod === "online") {
      const cleanCard = cardDetails.cardNumber.replace(/\s/g, "");
      if (!cleanCard || cleanCard.length < 15) {
        setError("Please enter a valid 15 or 16-digit card number.");
        setSubmitting(false);
        return;
      }
      if (!cardDetails.nameOnCard.trim() && !checkoutAddress.fullName.trim()) {
        setError("Please enter the name on the card.");
        setSubmitting(false);
        return;
      }
      if (!cardDetails.expiry || cardDetails.expiry.length < 5) {
        setError("Please enter a valid card expiration date (MM/YY).");
        setSubmitting(false);
        return;
      }
      if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
        setError("Please enter a valid 3 or 4-digit CVV / security code.");
        setSubmitting(false);
        return;
      }
    }

    try {
      let placedOrder: { _id: string };
      const isOnline = paymentMethod === "online";
      const cleanNum = cardDetails.cardNumber.replace(/\s/g, "");
      const guestEmail = email.trim() || user?.email || "";

      if (isOnline) {
        if (!user && !guestEmail) {
          throw new Error("Please provide your email address to receive order tracking updates.");
        }

        // 1. Initialize Stripe Payment Intent (works in real and simulation modes)
        const intentRes = await createStripePaymentIntent({
          amount: grandTotal,
          customerEmail: guestEmail,
        });

        const orderPayload = {
          items: orderItems,
          shippingAddress: checkoutAddress,
          paymentMethod: "stripe" as const,
          couponCode: appliedCoupon?.code,
          discount: appliedCoupon?.discount ?? 0,
          isPaid: false,
          paymentResult: {
            stripe_payment_intent_id: intentRes.paymentIntentId,
            card_last4: cleanNum.slice(-4),
            card_holder: cardDetails.nameOnCard || checkoutAddress.fullName,
            is_simulated: intentRes.isDummy,
          },
        };

        if (user && token) {
          const data = await createOrder(token, orderPayload);
          placedOrder = data.order;
        } else {
          const data = await guestCheckout({ email: guestEmail, ...orderPayload });
          setSession(data.user, data.token);
          placedOrder = data.order;
        }

        // 2. Confirm the Stripe payment with backend
        await confirmStripePayment({
          orderId: placedOrder._id,
          paymentIntentId: intentRes.paymentIntentId,
          cardDetails: {
            last4: cleanNum.slice(-4),
            brand: "Visa",
          },
        });
      } else {
        // Cash on Delivery
        const orderPayload = {
          items: orderItems,
          shippingAddress: checkoutAddress,
          paymentMethod: "cod" as const,
          couponCode: appliedCoupon?.code,
          discount: appliedCoupon?.discount ?? 0,
          isPaid: false,
        };

        if (user && token) {
          const data = await createOrder(token, orderPayload);
          placedOrder = data.order;
        } else {
          if (!guestEmail) {
            throw new Error("Please provide your email address to receive order tracking updates.");
          }
          const data = await guestCheckout({ email: guestEmail, ...orderPayload });
          setSession(data.user, data.token);
          placedOrder = data.order;
        }
      }

      clearCart();
      router.replace(`/order-placed?orderId=${encodeURIComponent(placedOrder._id)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to place your order. Please check your information and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Hydration & Loading skeleton ──────────────────────────────
  if (!hydrated || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf6f2] via-[#f7f1eb] to-[#f3ece3] relative py-8 md:py-12 border-b border-[#ebdcd0]">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-12 bg-white/70 border border-[#ebdcd0] rounded-2xl mb-6" />
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="h-44 bg-white/80 border border-[#ebdcd0] rounded-2xl" />
              <div className="h-80 bg-white/80 border border-[#ebdcd0] rounded-2xl" />
              <div className="h-32 bg-white/80 border border-[#ebdcd0] rounded-2xl" />
            </div>
            <div className="lg:col-span-5 bg-white/80 border border-[#ebdcd0] rounded-2xl p-6 h-96" />
          </div>
        </main>
      </div>
    );
  }

  // ── Empty cart state ──────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf6f2] via-[#f7f1eb] to-[#f3ece3] relative py-20 px-4 border-b border-[#ebdcd0] flex items-center justify-center">
        <main className="max-w-md w-full bg-white/95 backdrop-blur-md border border-[#ebdcd0] rounded-3xl p-8 sm:p-10 text-center shadow-[0_8px_30px_rgba(92,26,82,0.06)]">
          <div className="w-16 h-16 rounded-full bg-[#5c1a52]/10 text-[#5c1a52] flex items-center justify-center mx-auto mb-5 border border-[#5c1a52]/15">
            <ShoppingBag size={28} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#240821] mb-2">Your Shopping Bag is Empty</h1>
          <p className="text-[#6b5849] text-xs sm:text-sm mb-6 leading-relaxed">
            Looks like you haven't added any items to your bag yet. Discover our latest traditional sarees and festive collections.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-[#5c1a52] text-white text-xs sm:text-sm font-semibold hover:bg-[#43123b] transition-all shadow-md shadow-[#5c1a52]/20"
          >
            Explore Collections
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf6f2] via-[#f7f1eb] to-[#f3ece3] relative py-6 sm:py-10 border-b border-[#ebdcd0]">
      {/* ── Ambient Radial Lighting Glows (Matching Home & Product Pages) ── */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-[radial-gradient(ellipse_at_top,_rgba(92,26,82,0.06),_transparent_70%)]" />
      <div className="pointer-events-none absolute top-20 -left-20 w-80 h-80 bg-[#c49a45]/5 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-40 -right-20 w-80 h-80 bg-[#5c1a52]/5 rounded-full blur-3xl" />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Breadcrumb & Navigation Header ── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md border border-[#ebdcd0] rounded-2xl px-4 sm:px-6 py-3.5 shadow-[0_2px_12px_rgba(92,26,82,0.03)]">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#735e4d] hover:text-[#5c1a52] transition-colors"
          >
            <ArrowLeft size={16} /> Return to Cart
          </Link>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#9b8573]">
            <span className="text-[#3a1034]">1. Bag</span>
            <span>•</span>
            <span className="text-[#5c1a52] font-bold">2. Delivery & Checkout</span>
            <span>•</span>
            <span>3. Confirmation</span>
          </div>
        </div>

        {/* ── Mobile Order Summary Accordion (Visible on Mobile & Tablet < lg) ── */}
        <section className="lg:hidden mb-6 border border-[#ebdcd0] rounded-2xl bg-white/95 backdrop-blur-md overflow-hidden shadow-[0_4px_20px_rgba(92,26,82,0.03)]">
          <button
            type="button"
            onClick={() => setMobileSummaryExpanded(!mobileSummaryExpanded)}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-[#240821]">
              <ShoppingBag size={18} className="text-[#5c1a52]" />
              <span>{mobileSummaryExpanded ? "Hide order summary" : "Show order summary"}</span>
              <span className="text-xs bg-[#5c1a52]/10 text-[#5c1a52] px-2 py-0.5 rounded-full font-medium">
                {items.reduce((s, i) => s + i.quantity, 0)} {items.length === 1 && items[0].quantity === 1 ? "item" : "items"}
              </span>
              {mobileSummaryExpanded ? <ChevronUp size={16} className="text-[#735e4d]" /> : <ChevronDown size={16} className="text-[#735e4d]" />}
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-[#5c1a52]">AED {grandTotal.toFixed(2)}</span>
            </div>
          </button>

          {mobileSummaryExpanded && (
            <div className="px-4 pb-4 pt-2 border-t border-[#ebdcd0] space-y-4 animate-in slide-in-from-top duration-200 bg-[#fdfbf9]/70">
              {/* Items list */}
              <div className="divide-y divide-[#ebdcd0]/70 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={`${item.product._id}-${item.size}-${item.color}`}
                    className="py-3 flex gap-3 text-sm"
                  >
                    <div className="relative w-14 h-16 shrink-0 rounded-lg overflow-hidden border border-[#ebdcd0] bg-white">
                      {item.product.images?.[0] && (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 flex justify-between gap-2">
                      <div>
                        <p className="font-medium text-[#240821] text-xs leading-snug line-clamp-2">
                          {item.product.name}
                        </p>
                        {(item.size || item.color) && (
                          <p className="text-[11px] text-[#735e4d] mt-0.5">
                            {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                        <p className="text-[11px] text-[#735e4d] mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-xs text-[#240821] whitespace-nowrap">
                        AED {((item.product.discountPrice ?? item.product.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Coupon Box */}
              <div className="pt-2 border-t border-[#ebdcd0]/80">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 rounded-xl px-3 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-700 shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-800">{appliedCoupon.code}</span>
                        <span className="text-emerald-700 ml-1.5 font-medium">−AED {appliedCoupon.discount.toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-gray-400 hover:text-red-500 p-1"
                      aria-label="Remove coupon"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError("");
                      }}
                      placeholder="Coupon code (e.g. WELCOME)"
                      className="flex-1 bg-white border border-[#ebdcd0] rounded-xl px-3 py-2 text-xs uppercase tracking-wide focus:outline-none focus:border-[#5c1a52]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="bg-[#5c1a52] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#43123b] disabled:opacity-50"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[11px] text-red-500 mt-1">{couponError}</p>}
              </div>

              {/* Mobile Breakdown */}
              <div className="pt-2 border-t border-[#ebdcd0]/80 space-y-1.5 text-xs text-[#6b5849]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#240821]">AED {totalPrice.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Discount</span>
                    <span>−AED {appliedCoupon.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>UAE Express Shipping</span>
                  <span className={isFreeShipping ? "text-emerald-700 font-semibold" : "font-medium text-[#240821]"}>
                    {isFreeShipping ? "FREE" : `AED ${STANDARD_SHIPPING_FEE.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#240821] pt-2 border-t border-[#ebdcd0]">
                  <span>Total Amount</span>
                  <span className="text-[#5c1a52]">AED {grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── Main Two-Column Layout ── */}
        <div className="grid lg:grid-cols-12 gap-8 xl:gap-12 items-start">

          {/* ── LEFT COLUMN: Delivery Form (7 cols on Desktop) ── */}
          <div className="lg:col-span-7 space-y-6">

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Card 1: Contact Information */}
              <div className="bg-white/95 backdrop-blur-md border border-[#ebdcd0] rounded-2xl p-5 sm:p-7 shadow-[0_4px_25px_rgba(92,26,82,0.04)]">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#ebdcd0]/50">
                  <h2 className="text-base sm:text-lg font-serif font-bold text-[#240821] flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#5c1a52] text-white text-xs flex items-center justify-center font-sans font-semibold shadow-xs">
                      1
                    </span>
                    Contact Information
                  </h2>
                  {!user && (
                    <span className="text-xs text-[#735e4d] font-medium bg-[#faf6f2] border border-[#ebdcd0] px-2.5 py-1 rounded-full">
                      Guest Checkout
                    </span>
                  )}
                </div>

                {!user && (
                  <p className="text-xs text-[#735e4d] mb-4">
                    We'll use this email to send your order confirmation and UAE delivery tracking updates.
                  </p>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#6b5849] mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      value={user?.email || email}
                      disabled={!!user}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@domain.com"
                      className="w-full bg-[#faf8f5] hover:bg-white focus:bg-white border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-[#240821] focus:outline-none focus:ring-2 focus:ring-[#5c1a52]/15 focus:border-[#5c1a52] disabled:bg-[#f3ece3]/50 disabled:text-gray-400 transition-all placeholder:text-[#a89687]"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Delivery Details */}
              <div className="bg-white/95 backdrop-blur-md border border-[#ebdcd0] rounded-2xl p-5 sm:p-7 shadow-[0_4px_25px_rgba(92,26,82,0.04)]">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#ebdcd0]/50">
                  <h2 className="text-base sm:text-lg font-serif font-bold text-[#240821] flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#5c1a52] text-white text-xs flex items-center justify-center font-sans font-semibold shadow-xs">
                      2
                    </span>
                    Shipping Address (UAE)
                  </h2>
                  <span className="text-xs text-[#5c1a52] font-semibold flex items-center gap-1 bg-[#5c1a52]/8 px-2.5 py-1 rounded-full border border-[#5c1a52]/15">
                    <MapPin size={13} /> UAE Domestic Delivery
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#6b5849] mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      autoComplete="name"
                      value={address.fullName}
                      onChange={(e) => updateAddress("fullName", e.target.value)}
                      placeholder="Recipient's full name"
                      className="w-full bg-[#faf8f5] hover:bg-white focus:bg-white border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-[#240821] focus:outline-none focus:ring-2 focus:ring-[#5c1a52]/15 focus:border-[#5c1a52] transition-all placeholder:text-[#a89687]"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#6b5849] mb-1.5">
                      Phone / WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-sm font-semibold text-[#5c1a52] select-none">
                        +971
                      </span>
                      <input
                        required
                        type="tel"
                        autoComplete="tel"
                        value={address.phone.startsWith("+971") ? address.phone.replace("+971", "").trim() : address.phone}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9]/g, "");
                          updateAddress("phone", raw ? `+971 ${raw}` : "");
                        }}
                        placeholder="50 123 4567"
                        className="w-full bg-[#faf8f5] hover:bg-white focus:bg-white border border-[#ebdcd0] rounded-xl pl-16 pr-3.5 py-2.5 text-base sm:text-sm text-[#240821] focus:outline-none focus:ring-2 focus:ring-[#5c1a52]/15 focus:border-[#5c1a52] transition-all placeholder:text-[#a89687]"
                      />
                    </div>
                    <p className="text-[11px] text-[#8c7766] mt-1">Our courier will call or WhatsApp prior to doorstep delivery.</p>
                  </div>

                  {/* Street Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#6b5849] mb-1.5">
                      Street Address / Villa / Building <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      autoComplete="street-address"
                      value={address.addressLine1}
                      onChange={(e) => updateAddress("addressLine1", e.target.value)}
                      placeholder="e.g. Al Wasl Road, Villa 12B"
                      className="w-full bg-[#faf8f5] hover:bg-white focus:bg-white border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-[#240821] focus:outline-none focus:ring-2 focus:ring-[#5c1a52]/15 focus:border-[#5c1a52] transition-all placeholder:text-[#a89687]"
                    />
                  </div>

                  {/* Apartment / Suite */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#6b5849] mb-1.5">
                      Apartment, Suite, Unit, Landmark <span className="text-gray-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={address.addressLine2 || ""}
                      onChange={(e) => updateAddress("addressLine2", e.target.value)}
                      placeholder="e.g. Apt 402, Near City Walk"
                      className="w-full bg-[#faf8f5] hover:bg-white focus:bg-white border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-[#240821] focus:outline-none focus:ring-2 focus:ring-[#5c1a52]/15 focus:border-[#5c1a52] transition-all placeholder:text-[#a89687]"
                    />
                  </div>

                  {/* City / Area */}
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#6b5849] mb-1.5">
                      Area / District <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      autoComplete="address-level2"
                      value={address.city}
                      onChange={(e) => updateAddress("city", e.target.value)}
                      placeholder="e.g. Jumeirah 1 / Downtown"
                      className="w-full bg-[#faf8f5] hover:bg-white focus:bg-white border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-[#240821] focus:outline-none focus:ring-2 focus:ring-[#5c1a52]/15 focus:border-[#5c1a52] transition-all placeholder:text-[#a89687]"
                    />
                  </div>

                  {/* Emirate Select */}
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#6b5849] mb-1.5">
                      Emirate <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={address.emirate}
                        onChange={(e) => updateAddress("emirate", e.target.value)}
                        className="w-full bg-[#faf8f5] hover:bg-white focus:bg-white border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-[#240821] focus:outline-none focus:ring-2 focus:ring-[#5c1a52]/15 focus:border-[#5c1a52] appearance-none cursor-pointer transition-all"
                      >
                        {UAE_EMIRATES.map((em) => (
                          <option key={em} value={em}>
                            {em}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3.5 top-3.5 text-[#735e4d] pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Payment Method */}
              <div className="bg-white/95 backdrop-blur-md border border-[#ebdcd0] rounded-2xl p-5 sm:p-7 shadow-[0_4px_25px_rgba(92,26,82,0.04)]">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#ebdcd0]/50">
                  <h2 className="text-base sm:text-lg font-serif font-bold text-[#240821] flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#5c1a52] text-white text-xs flex items-center justify-center font-sans font-semibold shadow-xs">
                      3
                    </span>
                    Payment Method
                  </h2>
                  <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck size={13} /> 256-Bit SSL Encrypted
                  </span>
                </div>

                <div className="space-y-3.5">
                  {/* ── Option 1: Online Payment (Credit / Debit Card, Apple Pay, Net Banking) ── */}
                  <div
                    onClick={() => setPaymentMethod("online")}
                    className={`rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 ${paymentMethod === "online"
                        ? "border-[#5c1a52] bg-[#faf2f8]/70 shadow-sm"
                        : "border-[#ebdcd0] bg-white hover:border-[#5c1a52]/40"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-5 h-5 rounded-full border-2 border-[#5c1a52] flex items-center justify-center shrink-0">
                          {paymentMethod === "online" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#5c1a52]" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-[#240821]">
                              Online Card Payment (Stripe)
                            </p>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Instant & Secure
                            </span>
                            {stripeConfig && !stripeConfig.isConfigured && (
                              <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                Test Sandbox Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#6b5849] mt-1 leading-relaxed">
                            Pay securely with Visa, Mastercard, American Express, or Apple Pay via Stripe.
                          </p>
                        </div>
                      </div>

                      {/* Card Brand Badges & Stripe */}
                      <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                        <span className="px-2 py-0.5 rounded bg-[#635bff] text-white text-[10px] font-bold tracking-wider flex items-center gap-1 shadow-xs">
                          <SiStripe size={14} /> Stripe
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-bold text-blue-700 tracking-wider">
                          VISA
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-bold text-red-600 tracking-wider">
                          MC
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-bold text-blue-500 tracking-wider">
                          AMEX
                        </span>
                      </div>
                    </div>

                    {/* Expandable Luxury Card Details Form */}
                    {paymentMethod === "online" && (
                      <div className="mt-4 pt-4 border-t border-[#ebdcd0]/70 space-y-3 animate-in fade-in duration-200">
                        {/* Simulation helper banner */}
                        {stripeConfig && !stripeConfig.isConfigured && (
                          <div className="rounded-xl bg-amber-50/90 border border-amber-200/90 p-3 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
                            <span className="leading-relaxed">
                              💡 <strong>Stripe Simulation Mode:</strong> Credentials pending from company. You can test with standard Stripe test cards.
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCardDetails({
                                  nameOnCard: address.fullName || user?.name || "Test Cardholder",
                                  cardNumber: "4242 4242 4242 4242",
                                  expiry: "12/28",
                                  cvv: "123",
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-[11px] font-bold text-amber-900 border border-amber-300 transition-colors shrink-0 cursor-pointer"
                            >
                              Auto-Fill Test Card
                            </button>
                          </div>
                        )}
                        {/* Name on Card */}
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6b5849] mb-1">
                            Cardholder Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            autoComplete="cc-name"
                            value={cardDetails.nameOnCard}
                            onChange={(e) =>
                              setCardDetails((prev) => ({ ...prev, nameOnCard: e.target.value }))
                            }
                            placeholder={address.fullName || "Name as printed on card"}
                            className="w-full bg-white border border-[#ebdcd0] rounded-xl px-3.5 py-2 text-sm text-[#240821] focus:outline-none focus:ring-2 focus:ring-[#5c1a52]/15 focus:border-[#5c1a52] transition-all placeholder:text-stone-400"
                          />
                        </div>

                        {/* Card Number */}
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6b5849] mb-1">
                            Card Number <span className="text-red-500">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              autoComplete="cc-number"
                              maxLength={19}
                              value={cardDetails.cardNumber}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/[^0-9]/g, "");
                                const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
                                setCardDetails((prev) => ({ ...prev, cardNumber: formatted }));
                              }}
                              placeholder="4123 4567 8901 2345"
                              className="w-full bg-white border border-[#ebdcd0] rounded-xl pl-3.5 pr-11 py-2 text-sm text-[#240821] focus:outline-none focus:ring-2 focus:ring-[#5c1a52]/15 focus:border-[#5c1a52] font-mono tracking-wider transition-all placeholder:text-stone-400"
                            />
                            <div className="absolute right-3 text-stone-400">
                              <CreditCard size={18} />
                            </div>
                          </div>
                        </div>

                        {/* Expiry & CVV */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6b5849] mb-1">
                              Expiry Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              autoComplete="cc-exp"
                              maxLength={5}
                              value={cardDetails.expiry}
                              onChange={(e) => {
                                let v = e.target.value.replace(/[^0-9]/g, "");
                                if (v.length > 2) {
                                  v = v.slice(0, 2) + "/" + v.slice(2, 4);
                                }
                                setCardDetails((prev) => ({ ...prev, expiry: v }));
                              }}
                              placeholder="MM/YY"
                              className="w-full bg-white border border-[#ebdcd0] rounded-xl px-3.5 py-2 text-sm text-[#240821] focus:outline-none focus:ring-2 focus:ring-[#5c1a52]/15 focus:border-[#5c1a52] font-mono tracking-wider transition-all text-center placeholder:text-stone-400"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6b5849] mb-1">
                              CVV / CVC <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="password"
                              autoComplete="cc-csc"
                              maxLength={4}
                              value={cardDetails.cvv}
                              onChange={(e) => {
                                const v = e.target.value.replace(/[^0-9]/g, "");
                                setCardDetails((prev) => ({ ...prev, cvv: v }));
                              }}
                              placeholder="123"
                              className="w-full bg-white border border-[#ebdcd0] rounded-xl px-3.5 py-2 text-sm text-[#240821] focus:outline-none focus:ring-2 focus:ring-[#5c1a52]/15 focus:border-[#5c1a52] font-mono tracking-widest transition-all text-center placeholder:text-stone-400"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 text-[11px] text-[#6b5849]">
                          <Lock size={12} className="text-emerald-600 shrink-0" />
                          <span>Bank-grade 256-bit encryption. Card details are tokenized & never stored in plain text.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Option 2: Cash on Delivery / Card at Doorstep ── */}
                  <div
                    onClick={() => setPaymentMethod("cod")}
                    className={`rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 ${paymentMethod === "cod"
                        ? "border-[#5c1a52] bg-[#faf2f8]/70 shadow-sm"
                        : "border-[#ebdcd0] bg-white hover:border-[#5c1a52]/40"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-5 h-5 rounded-full border-2 border-[#5c1a52] flex items-center justify-center shrink-0">
                          {paymentMethod === "cod" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#5c1a52]" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-[#240821]">
                              Cash on Delivery / Card at Doorstep (COD)
                            </p>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              UAE Only
                            </span>
                          </div>
                          <p className="text-xs text-[#6b5849] mt-1 leading-relaxed">
                            Pay conveniently with cash or card directly to our courier when your parcel arrives safely at your doorstep.
                          </p>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-1.5 text-[#5c1a52] shrink-0">
                        <Truck size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error banner if submission failed */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
                  <X size={16} className="shrink-0 mt-0.5 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !items.length}
                  className="w-full bg-[#5c1a52] text-white text-base font-bold py-3.5 sm:py-4 px-6 rounded-xl hover:bg-[#43123b] active:scale-[0.99] transition-all duration-200 shadow-lg shadow-[#5c1a52]/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{paymentMethod === "online" ? "Processing Online Payment..." : "Processing Order..."}</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>
                        {paymentMethod === "online"
                          ? `Pay Securely Now — AED ${grandTotal.toFixed(2)}`
                          : `Confirm Order (COD) — AED ${grandTotal.toFixed(2)}`}
                      </span>
                    </>
                  )}
                </button>

                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#735e4d] pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-[#5c1a52]" /> 100% Genuine Designer Sarees
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck size={14} className="text-[#5c1a52]" /> UAE 2-4 Day Express Delivery
                  </span>
                  <span className="flex items-center gap-1">
                    <Lock size={14} className="text-[#5c1a52]" /> Secure & Confidential
                  </span>
                </div>
              </div>

            </form>

          </div>

          {/* ── RIGHT COLUMN: Desktop Sticky Order Summary (5 cols on Desktop) ── */}
          <aside className="hidden lg:block lg:col-span-5 sticky top-24">
            <div className="bg-white/95 backdrop-blur-md border border-[#ebdcd0] rounded-2xl p-6 shadow-[0_4px_25px_rgba(92,26,82,0.04)] space-y-6">

              <div className="flex items-center justify-between border-b border-[#ebdcd0]/70 pb-4">
                <h2 className="text-lg font-serif font-bold text-[#240821] flex items-center gap-2">
                  Order Summary
                  <span className="text-xs bg-[#5c1a52]/10 text-[#5c1a52] px-2.5 py-0.5 rounded-full font-sans font-semibold">
                    {items.reduce((s, i) => s + i.quantity, 0)} {items.length === 1 && items[0].quantity === 1 ? "item" : "items"}
                  </span>
                </h2>
                <Link href="/cart" className="text-xs text-[#5c1a52] hover:underline font-semibold">
                  Edit Bag
                </Link>
              </div>

              {/* Free shipping threshold progress */}
              <div className="bg-[#faf5f9] border border-[#f0e3ed] rounded-xl p-3.5 text-xs">
                {isFreeShipping ? (
                  <div className="flex items-center gap-2 text-[#5c1a52] font-semibold">
                    <Check size={15} />
                    <span>You've unlocked FREE UAE Express Delivery!</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[#6b5849]">
                      <span>Add <b>AED {amountToFreeShipping.toFixed(2)}</b> more for <b>FREE Delivery</b></span>
                      <span className="font-semibold text-[#5c1a52]">{Math.round((discountedTotal / FREE_SHIPPING_THRESHOLD) * 100)}%</span>
                    </div>
                    <div className="w-full bg-[#ebdcd0]/60 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#5c1a52] h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (discountedTotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items list with internal scroll to avoid overflowing laptop viewport */}
              <div className="divide-y divide-[#ebdcd0]/60 max-h-[340px] xl:max-h-[380px] overflow-y-auto pr-2 space-y-1">
                {items.map((item) => (
                  <div
                    key={`${item.product._id}-${item.size}-${item.color}`}
                    className="py-3 flex gap-3 text-sm first:pt-0"
                  >
                    <div className="relative w-16 h-20 shrink-0 rounded-xl overflow-hidden border border-[#ebdcd0] bg-white">
                      {item.product.images?.[0] && (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="font-medium text-[#240821] text-xs sm:text-sm line-clamp-2 leading-snug">
                          {item.product.name}
                        </p>
                        {(item.size || item.color) && (
                          <p className="text-xs text-[#735e4d] mt-1">
                            {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs mt-2">
                        <span className="text-[#735e4d] font-medium">Qty: {item.quantity}</span>
                        <span className="font-bold text-[#240821]">
                          AED {((item.product.discountPrice ?? item.product.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="border-t border-[#ebdcd0]/70 pt-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#6b5849] mb-2 flex items-center gap-1.5">
                  <Tag size={13} className="text-[#5c1a52]" /> Promotional Coupon
                </label>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-emerald-800 tracking-wider">{appliedCoupon.code}</p>
                        <p className="text-[11px] text-emerald-700 font-medium">−AED {appliedCoupon.discount.toFixed(2)} coupon discount</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                      aria-label="Remove coupon"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                      placeholder="Enter coupon code"
                      className="flex-1 bg-white border border-[#ebdcd0] rounded-xl px-3 py-2 text-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#5c1a52]/15 focus:border-[#5c1a52] placeholder:normal-case placeholder:tracking-normal transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="bg-[#5c1a52] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#43123b] transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
                    >
                      {couponLoading ? "Applying..." : "Apply"}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-xs text-red-500 mt-1.5 font-medium">{couponError}</p>}
              </div>

              {/* Price Calculations Breakdown */}
              <div className="border-t border-[#ebdcd0]/70 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-[#6b5849] text-xs sm:text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#240821]">AED {totalPrice.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-medium text-xs sm:text-sm">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>−AED {appliedCoupon.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#6b5849] text-xs sm:text-sm">
                  <span>UAE Express Delivery</span>
                  <span className={isFreeShipping ? "text-emerald-700 font-bold" : "font-semibold text-[#240821]"}>
                    {isFreeShipping ? "FREE" : `AED ${STANDARD_SHIPPING_FEE.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-[#240821] text-base sm:text-lg border-t border-[#ebdcd0] pt-3 mt-2">
                  <span>Total Due</span>
                  <span className="text-[#5c1a52]">AED {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Guarantee Pill */}
              <div className="bg-[#faf7f4] rounded-xl p-3 border border-[#ebdcd0] flex items-center gap-2.5 text-xs text-[#735e4d]">
                <Clock size={16} className="text-[#5c1a52] shrink-0" />
                <span>Standard delivery within UAE: <b>2–4 business days</b>.</span>
              </div>

            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
