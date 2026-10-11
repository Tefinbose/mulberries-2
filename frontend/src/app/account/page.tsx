"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { updateProfile, getMyOrders, getOrder, type Order } from "@/lib/api";
import {
  LuUser as User,
  LuShoppingBag as ShoppingBag,
  LuHeart as Heart,
  LuLogOut as LogOut,
  LuPackage as Package,
  LuMapPin as MapPin,
  LuChevronRight as ChevronRight,
  LuX as X,
  LuCircleCheck as CheckCircle2,
  LuClock as Clock,
  LuTruck as Truck,
  LuRotateCcw as RotateCcw,
  LuCircleX as XCircle,
} from "react-icons/lu";

// ── Status config ────────────────────────────────────────
const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:    { label: "Pending",    color: "text-amber-700",  bg: "bg-amber-100",  icon: <Clock size={14} /> },
  processing: { label: "Processing", color: "text-blue-700",   bg: "bg-blue-100",   icon: <Package size={14} /> },
  shipped:    { label: "Shipped",    color: "text-purple-700", bg: "bg-purple-100", icon: <Truck size={14} /> },
  delivered:  { label: "Delivered",  color: "text-green-700",  bg: "bg-green-100",  icon: <CheckCircle2 size={14} /> },
  cancelled:  { label: "Cancelled",  color: "text-red-700",    bg: "bg-red-100",    icon: <XCircle size={14} /> },
};

// ── Order Tracking Modal ─────────────────────────────────
function OrderTrackingModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const cfg = statusConfig[order.status] ?? statusConfig.pending;
  const isCancelled = order.status === "cancelled";
  const currentStep = STATUS_STEPS.indexOf(order.status);

  const timeline = [
    { status: "pending",    label: "Order Placed",   desc: `Placed on ${new Date(order.createdAt).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}` },
    { status: "processing", label: "Processing",     desc: "Your order is being prepared" },
    { status: "shipped",    label: "Shipped",        desc: "Your order is on the way" },
    { status: "delivered",  label: "Delivered",      desc: order.deliveredAt ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}` : "Estimated delivery in 3–5 days" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Order #{order._id.slice(-8).toUpperCase()}</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">Track Your Order</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${cfg.bg} ${cfg.color}`}>
            {cfg.icon} {cfg.label}
          </div>

          {/* Timeline */}
          {!isCancelled ? (
            <div className="space-y-0">
              {timeline.map((step, i) => {
                const done = currentStep >= i;
                const active = currentStep === i;
                return (
                  <div key={step.status} className="flex gap-4">
                    {/* Line + dot */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                        done ? "bg-[#5c1a52] border-[#5c1a52]" : "bg-white border-gray-200"
                      }`}>
                        {done ? (
                          <CheckCircle2 size={16} className="text-white" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                        )}
                      </div>
                      {i < timeline.length - 1 && (
                        <div className={`w-0.5 h-10 mt-1 ${done && currentStep > i ? "bg-[#5c1a52]" : "bg-gray-200"}`} />
                      )}
                    </div>
                    {/* Text */}
                    <div className="pb-8">
                      <p className={`text-sm font-semibold ${done ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                      <p className={`text-xs mt-0.5 ${active ? "text-[#5c1a52] font-medium" : "text-gray-400"}`}>{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-red-50 rounded-lg p-4">
              <XCircle size={20} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">This order has been cancelled.</p>
            </div>
          )}

          {/* Order items */}
          <div>
            <p className="text-sm font-bold text-gray-900 mb-3">Items Ordered</p>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-md overflow-hidden bg-[#f5ede8] flex-shrink-0 relative">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(" · ")}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × AED {item.price}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 flex-shrink-0">AED {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Price summary */}
          <div className="bg-[#faf6f2] rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Items total</span>
              <span>AED {order.itemsPrice?.toFixed(2) ?? order.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span>{order.shippingPrice > 0 ? `AED ${order.shippingPrice.toFixed(2)}` : <span className="text-green-600 font-medium">FREE</span>}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200 pt-2 mt-2">
              <span>Total</span>
              <span>AED {order.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 pt-1">
              <span>Payment</span>
              <span className="capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Payment status</span>
              <span className={order.isPaid ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
                {order.isPaid ? "Paid" : "Pending"}
              </span>
            </div>
          </div>

          {/* Shipping address */}
          <div>
            <p className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <MapPin size={14} className="text-[#5c1a52]" /> Delivery Address
            </p>
            <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-800">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.emirate}, {order.shippingAddress.country || "UAE"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Account Page ────────────────────────────────────
export default function AccountPage() {
  const { user, token, logout, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"orders" | "profile">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [profile, setProfile] = useState({ name: "", phone: "", password: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  useEffect(() => {
    if (!token) return;
    getMyOrders(token)
      .then((res) => setOrders(res.orders))
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, [token]);

  useEffect(() => {
    if (user) setProfile((p) => ({ ...p, name: user.name, phone: user.phone || "" }));
  }, [user]);

  const openTracking = async (orderId: string) => {
    setTrackingLoading(true);
    try {
      const res = await getOrder(token!, orderId);
      setTrackingOrder(res.order);
    } catch {
      // fallback to list data
      const found = orders.find((o) => o._id === orderId);
      if (found) setTrackingOrder(found);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.password && profile.password !== profile.confirm) {
      setSaveMsg("Passwords do not match"); return;
    }
    setSaving(true); setSaveMsg("");
    try {
      const payload: any = { name: profile.name, phone: profile.phone };
      if (profile.password) payload.password = profile.password;
      await updateProfile(token!, payload);
      setSaveMsg("Profile updated successfully!");
      setProfile((p) => ({ ...p, password: "", confirm: "" }));
    } catch (err: any) {
      setSaveMsg(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <main className="bg-[#faf6f2] min-h-screen" style={{ fontFamily: "Arial, sans-serif" }}>
      {trackingOrder && <OrderTrackingModal order={trackingOrder} onClose={() => setTrackingOrder(null)} />}

      <div className="max-w-[1100px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
            <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user.name}</p>
          </div>
          <button onClick={() => { logout(); router.push("/"); }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-56 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-full bg-[#5c1a52] flex items-center justify-center text-white font-bold text-lg mb-2">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              <nav className="p-2">
                {[
                  { key: "orders", label: "My Orders", icon: <ShoppingBag size={16} /> },
                  { key: "profile", label: "Edit Profile", icon: <User size={16} /> },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setTab(item.key as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      tab === item.key ? "bg-[#f5ede8] text-[#5c1a52] font-medium" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
                <Link href="/wishlist" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <Heart size={16} /> Wishlist
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">

            {/* ── Orders Tab ── */}
            {tab === "orders" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-5">My Orders</h2>

                {ordersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16">
                    <Package size={44} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm mb-4">No orders yet</p>
                    <Link href="/" className="inline-block bg-[#5c1a52] text-white text-sm px-6 py-2.5 rounded-sm hover:bg-[#4a1543] transition-colors">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {orders.map((order) => {
                      const cfg = statusConfig[order.status] ?? statusConfig.pending;
                      return (
                        <div key={order._id} className="border border-gray-100 rounded-xl p-4 hover:border-[#e8d5e4] transition-colors">
                          {/* Top row */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <p className="text-xs font-mono text-gray-400">#{order._id.slice(-8).toUpperCase()}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                                {cfg.icon} {cfg.label}
                              </span>
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${order.isPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                {order.isPaid ? "Paid" : "Unpaid"}
                              </span>
                            </div>
                          </div>

                          {/* Items preview */}
                          <div className="flex items-center gap-2 mb-3">
                            {order.items.slice(0, 4).map((item, i) => (
                              <div key={i} className="w-12 h-12 rounded-md overflow-hidden bg-[#f5ede8] flex-shrink-0 relative">
                                {item.image ? (
                                  <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-gray-200" />
                                )}
                              </div>
                            ))}
                            {order.items.length > 4 && (
                              <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium flex-shrink-0">
                                +{order.items.length - 4}
                              </div>
                            )}
                            <div className="ml-auto text-right">
                              <p className="text-xs text-gray-400">{order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
                              <p className="text-sm font-bold text-gray-900">AED {order.totalPrice.toFixed(2)}</p>
                            </div>
                          </div>

                          {/* Track button */}
                          <button
                            onClick={() => openTracking(order._id)}
                            disabled={trackingLoading}
                            className="w-full flex items-center justify-center gap-2 border border-[#5c1a52] text-[#5c1a52] text-sm font-medium py-2 rounded-lg hover:bg-[#5c1a52] hover:text-white transition-colors disabled:opacity-50"
                          >
                            <Truck size={14} />
                            {trackingLoading ? "Loading..." : "Track Order"}
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Profile Tab ── */}
            {tab === "profile" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-5">Edit Profile</h2>
                {saveMsg && (
                  <p className={`text-sm mb-4 py-2.5 px-3 rounded-lg ${saveMsg.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                    {saveMsg}
                  </p>
                )}
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 max-w-md">
                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-700">Full Name</span>
                    <input type="text" required value={profile.name}
                      onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#5c1a52] transition-colors" />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-700">Email</span>
                    <input type="email" value={user.email} disabled
                      className="border border-gray-100 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-700">Phone</span>
                    <input type="tel" value={profile.phone}
                      onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#5c1a52] transition-colors"
                      placeholder="+971 50 000 0000" />
                  </label>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Change Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
                    </p>
                    <div className="flex flex-col gap-3">
                      <input type="password" value={profile.password}
                        onChange={(e) => setProfile((p) => ({ ...p, password: e.target.value }))}
                        className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#5c1a52] transition-colors"
                        placeholder="New password" />
                      <input type="password" value={profile.confirm}
                        onChange={(e) => setProfile((p) => ({ ...p, confirm: e.target.value }))}
                        className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#5c1a52] transition-colors"
                        placeholder="Confirm new password" />
                    </div>
                  </div>
                  <button type="submit" disabled={saving}
                    className="bg-[#5c1a52] text-white text-sm font-medium py-3 rounded-lg hover:bg-[#4a1543] transition-colors disabled:opacity-60">
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
