"use client";
import Image from "next/image";
import Link from "next/link";
import {
  LuMinus as Minus,
  LuPlus as Plus,
  LuTrash2 as Trash2,
  LuShoppingBag as ShoppingBag,
  LuArrowRight as ArrowRight,
} from "react-icons/lu";
import { useCart } from "@/context/CartContext";

const FREE_SHIPPING_THRESHOLD = 299;

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

  const shippingFee = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 20;
  const grandTotal = totalPrice + shippingFee;
  const remaining = FREE_SHIPPING_THRESHOLD - totalPrice;

  if (items.length === 0) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4" style={{ fontFamily: "Arial, sans-serif" }}>
        <ShoppingBag size={56} className="text-gray-200" />
        <p className="text-gray-500 text-lg">Your cart is empty</p>
        <Link href="/" className="bg-[#5c1a52] text-white px-6 py-3 rounded-sm text-sm font-medium hover:bg-[#4a1543] transition-colors">
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen" style={{ fontFamily: "Arial, sans-serif" }}>
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-sm text-gray-500 mb-6">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>

        {/* Free shipping progress */}
        {remaining > 0 && (
          <div className="bg-[#faf6f2] rounded-md p-4 mb-6">
            <p className="text-sm text-gray-700 mb-2">
              Add <span className="font-semibold text-[#5c1a52]">AED {remaining.toFixed(0)}</span> more to unlock <span className="font-semibold">FREE delivery</span>
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-[#5c1a52] h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        {remaining <= 0 && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-6 text-sm text-green-700 font-medium">
           You've unlocked FREE delivery!
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Items */}
          <div className="flex-1 flex flex-col gap-4">
            {items.map((item) => {
              const price = item.product.discountPrice ?? item.product.price;
              return (
                <div key={`${item.product._id}-${item.size}-${item.color}`} className="flex gap-4 border border-gray-100 rounded-md p-4">
                  <div className="relative w-20 h-24 flex-shrink-0 rounded-md overflow-hidden bg-[#f5ede8]">
                    <Image src={item.product.images?.[0] || "/placeholder.jpg"} alt={item.product.name} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <Link href={`/product/${item.product._id}`} className="text-sm font-medium text-gray-900 hover:text-[#5c1a52] line-clamp-2">
                      {item.product.name}
                    </Link>
                    <div className="flex gap-3 text-xs text-gray-500">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                    <p className="text-sm font-bold text-gray-900">AED {price}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center border border-gray-200 rounded-sm">
                        <button onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.size, item.color)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50">
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.size, item.color)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50">
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-bold text-gray-900">AED {(price * item.quantity).toFixed(0)}</p>
                        <button onClick={() => removeFromCart(item.product._id, item.size, item.color)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <button onClick={clearCart} className="text-xs text-gray-400 hover:text-red-500 self-start transition-colors">
              Clear cart
            </button>
          </div>

          {/* Summary */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="border border-gray-100 rounded-md p-6 sticky top-24">
              <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="flex flex-col gap-3 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>AED {totalPrice.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shippingFee === 0 ? "text-green-600 font-medium" : ""}>{shippingFee === 0 ? "FREE" : `AED ${shippingFee}`}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>AED {grandTotal.toFixed(0)}</span>
                </div>
              </div>
              <Link href="/checkout" className="w-full bg-[#5c1a52] text-white text-sm font-medium py-3 rounded-sm hover:bg-[#4a1543] transition-colors flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight size={16} />
              </Link>
              <Link href="/" className="w-full mt-3 border border-gray-300 text-gray-700 text-sm font-medium py-3 rounded-sm hover:bg-gray-50 transition-colors flex items-center justify-center">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
