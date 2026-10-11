const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const crypto = require("crypto");
const { generateToken } = require("./authController");
const { sendOrderConfirmation, sendOrderStatusUpdate } = require("../services/emailService");

const customerUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
});

const validateCheckout = ({ items, shippingAddress }) => {
  if (!Array.isArray(items) || items.length === 0) return "No order items";
  if (!shippingAddress?.fullName?.trim() || !shippingAddress?.phone?.trim() || !shippingAddress?.addressLine1?.trim() || !shippingAddress?.city?.trim() || !shippingAddress?.emirate?.trim()) {
    return "Please provide your name, phone number, and complete delivery address";
  }
  return null;
};

// Calculates order totals from the database so checkout requests cannot alter prices.
const createOrderForUser = async ({ user, items, shippingAddress, paymentMethod, shippingPrice = 0, couponCode, discount = 0, isPaid, paymentResult }) => {
  const products = await Product.find({ _id: { $in: items.map((item) => item.product) } });
  const productsById = new Map(products.map((product) => [product._id.toString(), product]));
  const orderItems = items.map((item) => {
    const product = productsById.get(String(item.product));
    const quantity = Number(item.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || product.stock < quantity) {
      throw new Error(`One or more items are unavailable`);
    }
    return {
      product: product._id,
      name: product.name,
      image: product.images?.[0],
      price: product.discountPrice ?? product.price,
      quantity,
      color: item.color,
      size: item.size,
    };
  });
  const itemsPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalShippingPrice = Number(shippingPrice) || 0;

  // Validate coupon server-side if provided
  let appliedDiscount = 0;
  let validCouponCode = null;
  if (couponCode) {
    const cleanCode = String(couponCode).toUpperCase().trim();
    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
    if (coupon) {
      const now = new Date();
      const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > now;
      const notExhausted = coupon.usageLimit === null || coupon.usageLimit === undefined || coupon.usedCount < coupon.usageLimit;
      const meetsMinOrder = itemsPrice >= (coupon.minOrderValue || 0);
      if (notExpired && notExhausted && meetsMinOrder) {
        let calc = coupon.discountType === "percentage"
          ? (itemsPrice * coupon.discountValue) / 100
          : coupon.discountValue;
        if (coupon.maxDiscount) calc = Math.min(calc, coupon.maxDiscount);
        appliedDiscount = Math.round(Math.min(calc, itemsPrice) * 100) / 100;
        validCouponCode = coupon.code;
        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
      }
    }
  }

  const finalTotalPrice = Math.max(0, itemsPrice - appliedDiscount + totalShippingPrice);
  const isOnline = paymentMethod === "online" || paymentMethod === "razorpay" || paymentMethod === "stripe";
  const orderIsPaid = isPaid !== undefined ? Boolean(isPaid) : isOnline;

  const order = await Order.create({
    user: user._id,
    items: orderItems,
    shippingAddress,
    itemsPrice,
    discount: appliedDiscount,
    couponCode: validCouponCode,
    shippingPrice: totalShippingPrice,
    totalPrice: finalTotalPrice,
    paymentMethod: paymentMethod || "stripe",
    isPaid: orderIsPaid,
    paidAt: orderIsPaid ? Date.now() : undefined,
    status: orderIsPaid ? "processing" : "pending",
    paymentResult: paymentResult || undefined,
  });
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }
  await Cart.findOneAndUpdate({ user: user._id }, { items: [] });
  return order;
};

// @route POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, shippingPrice = 0, couponCode, discount, isPaid, paymentResult } = req.body;
    const validationError = validateCheckout({ items, shippingAddress });
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    const order = await createOrderForUser({ user: req.user, items, shippingAddress, paymentMethod, shippingPrice, couponCode, discount, isPaid, paymentResult });

    sendOrderConfirmation(order, req.user).catch((err) => {
      console.error("Failed to send order confirmation email:", err.message);
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/orders/guest-checkout
// Creates a customer account from guest checkout details and signs that customer in.
const guestCheckout = async (req, res, next) => {
  try {
    const { email, items, shippingAddress, paymentMethod, shippingPrice = 0, couponCode, discount, isPaid, paymentResult } = req.body;
    const validationError = validateCheckout({ items, shippingAddress });
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    if (!email?.trim()) return res.status(400).json({ success: false, message: "Please provide your email address" });

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: "An account already exists with this email. Please sign in to complete your order." });
    }

    const address = {
      fullName: shippingAddress.fullName.trim(),
      phone: shippingAddress.phone.trim(),
      addressLine1: shippingAddress.addressLine1.trim(),
      addressLine2: shippingAddress.addressLine2?.trim() || "",
      city: shippingAddress.city.trim(),
      emirate: shippingAddress.emirate.trim(),
      country: shippingAddress.country?.trim() || "UAE",
    };
    // A random secret is used because checkout does not ask the guest for a password.
    // The customer is signed in immediately and can set a personal password in Profile.
    const user = await User.create({
      name: address.fullName,
      email: normalizedEmail,
      phone: address.phone,
      password: crypto.randomBytes(32).toString("base64url"),
      addresses: [{ ...address, isDefault: true }],
    });
    const order = await createOrderForUser({ user, items, shippingAddress: address, paymentMethod, shippingPrice, couponCode, discount, isPaid, paymentResult });

    sendOrderConfirmation(order, user).catch((err) => {
      console.error("Failed to send guest order confirmation email:", err.message);
    });

    res.status(201).json({
      success: true,
      order,
      user: customerUser(user),
      token: generateToken(user._id),
      mustSetPassword: true,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/orders/my-orders
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to view this order" });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/admin/orders
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort("-createdAt");
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const oldStatus = order.status;
    const userSnapshot = order.user ? { _id: order.user._id, name: order.user.name, email: order.user.email } : null;

    order.status = status;
    if (status === "delivered") order.deliveredAt = Date.now();

    await order.save();

    if (oldStatus !== status) {
      sendOrderStatusUpdate(order, userSnapshot, status).catch((err) => {
        console.error("Failed to send order status update email:", err.message);
      });

      // Track staff / admin operation in history
      const { logActivity } = require("../services/activityLogService");
      const orderNumber = order._id.toString().slice(-8).toUpperCase();
      logActivity({
        req,
        action: "STATUS_CHANGE",
        module: "orders",
        resourceId: order._id,
        resourceTitle: `Order #${orderNumber}`,
        description: `Updated status of Order #${orderNumber} from "${oldStatus}" to "${status}"`,
        status: status === "cancelled" ? "warning" : "success",
        diff: {
          previous: { status: oldStatus },
          current: { status },
          customer: userSnapshot?.name || order.shippingAddress?.fullName || "Guest",
          totalPrice: order.totalPrice,
        },
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, guestCheckout, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
