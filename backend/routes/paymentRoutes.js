const express = require("express");
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  getStripeConfig,
  createStripePaymentIntent,
  confirmStripePayment,
  stripeWebhook,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

// ── Stripe Routes ──────────────────────────────
router.get("/stripe/config", getStripeConfig);
router.post("/stripe/create-intent", createStripePaymentIntent);
router.post("/stripe/confirm", confirmStripePayment);
router.post("/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// ── Razorpay Routes (Protected) ────────────────
router.post("/create-order", protect, createRazorpayOrder);
router.post("/verify", protect, verifyPayment);

module.exports = router;