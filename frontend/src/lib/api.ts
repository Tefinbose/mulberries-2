const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007/api";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `API error ${res.status}`);
  }
  return res.json();
}

// ── Auth ─────────────────────────────────────────────────
export const loginUser = (email: string, password: string) =>
  apiFetch<{ user: AuthUser; token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const registerUser = (name: string, email: string, password: string, phone?: string) =>
  apiFetch<{ user: AuthUser; token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, phone }),
  });

export const getProfile = (token: string) =>
  apiFetch<{ user: AuthUser }>("/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateProfile = (token: string, data: Partial<{ name: string; phone: string; password: string }>) =>
  apiFetch<{ user: AuthUser }>("/auth/profile", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

export type CheckoutItem = { product: string; quantity: number; size?: string; color?: string };
export type ShippingAddress = {
  fullName: string; phone: string; addressLine1: string; addressLine2?: string;
  city: string; emirate: string; country?: string;
};

export const guestCheckout = (data: {
  email: string;
  items: CheckoutItem[];
  shippingAddress: ShippingAddress;
  paymentMethod?: "razorpay" | "cod" | "online" | "stripe";
  couponCode?: string;
  discount?: number;
  isPaid?: boolean;
  paymentResult?: any;
}) =>
  apiFetch<{ order: { _id: string }; user: AuthUser; token: string; mustSetPassword: boolean }>("/orders/guest-checkout", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const createOrder = (token: string, data: {
  items: CheckoutItem[];
  shippingAddress: ShippingAddress;
  paymentMethod?: "razorpay" | "cod" | "online" | "stripe";
  couponCode?: string;
  discount?: number;
  isPaid?: boolean;
  paymentResult?: any;
}) =>
  apiFetch<{ order: { _id: string } }>("/orders", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

export type Order = {
  _id: string;
  items: Array<{ product: string; name: string; image?: string; price: number; quantity: number; color?: string; size?: string }>;
  shippingAddress: ShippingAddress;
  itemsPrice: number;
  shippingPrice: number;
  totalPrice: number;
  paymentMethod: "razorpay" | "cod" | "online" | "stripe";
  isPaid: boolean;
  paidAt?: string;
  status: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
};

export const getOrder = (token: string, orderId: string) =>
  apiFetch<{ order: Order }>(`/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getMyOrders = (token: string) =>
  apiFetch<{ orders: Order[] }>("/orders/my-orders", {
    headers: { Authorization: `Bearer ${token}` },
  });

// ── Stripe API ────────────────────────────────────────────
export const getStripeConfig = () =>
  apiFetch<{ success: boolean; publishableKey: string; isConfigured: boolean; currency: string }>(
    "/payments/stripe/config"
  );

export const createStripePaymentIntent = (data: {
  amount: number;
  currency?: string;
  orderId?: string;
  customerEmail?: string;
}) =>
  apiFetch<{
    success: boolean;
    clientSecret: string;
    paymentIntentId: string;
    isDummy: boolean;
    amount: number;
    currency: string;
    message?: string;
  }>("/payments/stripe/create-intent", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const confirmStripePayment = (data: {
  orderId: string;
  paymentIntentId?: string;
  cardDetails?: { last4?: string; brand?: string };
}) =>
  apiFetch<{ success: boolean; message: string; order: Order }>("/payments/stripe/confirm", {
    method: "POST",
    body: JSON.stringify(data),
  });


// ── Products ──────────────────────────────────────────────
export const getProducts = (params = "") =>
  apiFetch<{ products: Product[]; total: number }>(`/products${params}`);

export const getProduct = (id: string) =>
  apiFetch<{ product: Product }>(`/products/${id}`);

export const getProductBySlug = (slug: string) =>
  apiFetch<{ product: Product }>(`/products/slug/${slug}`);

export const getProductReviews = (id: string) =>
  apiFetch<{ reviews: Review[]; ratingsAverage: number; ratingsCount: number }>(`/products/${id}/reviews`);

export const submitProductReview = (id: string, token: string, rating: number, comment: string) =>
  apiFetch<{ review: Review; ratingsAverage: number; ratingsCount: number; message: string }>(`/products/${id}/reviews`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rating, comment }),
  });

// ── Categories ────────────────────────────────────────────
export const getCategories = () =>
  apiFetch<{ categories: Category[] }>("/categories");

export const submitContact = (data: ContactFormData) =>
  apiFetch<{ success: boolean; message: string }>("/contacts", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const validateCoupon = (code: string, orderTotal: number) =>
  apiFetch<{ success: boolean; discount: number; coupon: { code: string; discountType: string; discountValue: number } }>("/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code, orderTotal }),
  });

// ── Types ─────────────────────────────────────────────────
export type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  colors: string[];
  sizes: string[];
  material: string;
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  ratingsAverage: number;
  ratingsCount: number;
  tags: string[];
  category: Category | string;
};

export type Review = {
  _id: string;
  user: { _id: string; name: string };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  tagline?: string;
  image?: string;
  showInOccasion?: boolean;
  displayOrder?: number;
};

export type ContactFormData = {
  name: string;
  company?: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
};
