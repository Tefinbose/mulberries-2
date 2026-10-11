"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { type Product } from "@/lib/api";

export type CartItem = {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
};

type CartContextType = {
  items: CartItem[];
  hydrated: boolean;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = "mulberries_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const key = (id: string, size?: string, color?: string) => `${id}-${size || ""}-${color || ""}`;

  const addToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    setItems((prev) => {
      const k = key(product._id, size, color);
      const exists = prev.find((i) => key(i.product._id, i.size, i.color) === k);
      if (exists) return prev.map((i) => key(i.product._id, i.size, i.color) === k ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { product, quantity, size, color }];
    });
  };

  const removeFromCart = (productId: string, size?: string, color?: string) => {
    setItems((prev) => prev.filter((i) => key(i.product._id, i.size, i.color) !== key(productId, size, color)));
  };

  const updateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) { removeFromCart(productId, size, color); return; }
    setItems((prev) => prev.map((i) => key(i.product._id, i.size, i.color) === key(productId, size, color) ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + (i.product.discountPrice ?? i.product.price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, hydrated, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
