const crypto = require("crypto");
const razorpayInstance = require("../config/razorpay");
const { stripe, isStripeConfigured, STRIPE_CURRENCY } = require("../config/stripe");
const Order = require("../models/Order");

// ==========================================
// RAZORPAY CONTROLLERS (Preserved for backwards-compatibility)
// ==========================================

// @route POST /api/payments/create-order
// Creates a Razorpay order for the given amount (in AED, converted to smallest unit)
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, receipt } = req.body; // amount in AED

    const options = {
      amount: Math.round(Number(amount) * 100), // smallest currency unit (fils)
      currency: "AED",
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);
    res.status(201).json({ success: true, order: razorpayOrder });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/payments/verify
// Verifies Razorpay payment signature and marks order as paid
const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = "processing";
    order.paymentMethod = "razorpay";
    order.paymentResult = { razorpay_order_id, razorpay_payment_id, razorpay_signature };

    await order.save();

    res.json({ success: true, message: "Payment verified", order });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// STRIPE CONTROLLERS (Supports real keys & Dummy/Simulation Mode)
// ==========================================

// @route GET /api/payments/stripe/config
// Returns public publishable key and configuration mode
const getStripeConfig = async (req, res) => {
  res.json({
    success: true,
    publishableKey:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      process.env.STRIPE_PUBLISHABLE_KEY ||
      "",
    isConfigured: isStripeConfigured,
    currency: STRIPE_CURRENCY,
  });
};

// @route POST /api/payments/stripe/create-intent
// Creates a Stripe PaymentIntent or generates a realistic dummy intent in simulation mode
const createStripePaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency, orderId, customerEmail } = req.body;
    const numericAmount = Math.max(0, Number(amount) || 0);
    const amountInSmallestUnit = Math.round(numericAmount * 100);
    const intentCurrency = (currency || STRIPE_CURRENCY).toLowerCase();

    // ── Real Stripe Mode ─────────────────────────────────
    if (isStripeConfigured && stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInSmallestUnit,
        currency: intentCurrency,
        metadata: {
          orderId: orderId ? String(orderId) : "",
          customerEmail: customerEmail ? String(customerEmail) : "",
        },
        automatic_payment_methods: { enabled: true },
      });

      return res.status(201).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        isDummy: false,
        amount: numericAmount,
        currency: intentCurrency,
      });
    }

    // ── Simulation / Dummy Mode ──────────────────────────
    // Used when company credentials have not yet been placed in .env
    const dummyId = `pi_dummy_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
    const dummyClientSecret = `${dummyId}_secret_${crypto.randomBytes(10).toString("hex")}`;

    return res.status(201).json({
      success: true,
      clientSecret: dummyClientSecret,
      paymentIntentId: dummyId,
      isDummy: true,
      amount: numericAmount,
      currency: intentCurrency,
      message: "Stripe running in Simulation Mode (Credentials pending from company)",
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/payments/stripe/confirm
// Confirms payment and marks order as paid
const confirmStripePayment = async (req, res, next) => {
  try {
    const { orderId, paymentIntentId, cardDetails } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // ── Real Stripe Verification ──────────────────────────
    if (isStripeConfigured && stripe && paymentIntentId && !paymentIntentId.startsWith("pi_dummy_")) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({
          success: false,
          message: `Stripe payment status is '${paymentIntent.status}', not completed`,
        });
      }

      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = "processing";
      order.paymentMethod = "stripe";
      order.paymentResult = {
        stripe_payment_intent_id: paymentIntent.id,
        stripe_status: paymentIntent.status,
        currency: paymentIntent.currency,
        amount: paymentIntent.amount_received / 100,
        card_last4: cardDetails?.last4 || "Card",
        card_brand: cardDetails?.brand || "Stripe",
        is_simulated: false,
      };

      await order.save();
      return res.json({ success: true, message: "Stripe payment verified successfully", order });
    }

    // ── Simulation / Dummy Verification ───────────────────
    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = "processing";
    order.paymentMethod = "stripe";
    order.paymentResult = {
      stripe_payment_intent_id: paymentIntentId || `pi_dummy_${Date.now()}`,
      stripe_status: "succeeded",
      card_last4: cardDetails?.last4 || "4242",
      card_brand: cardDetails?.brand || "Visa",
      is_simulated: true,
    };

    await order.save();
    return res.json({
      success: true,
      message: "Payment verified successfully (Simulation Mode)",
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/payments/stripe/webhook
// Stripe webhook handler for background event processing
const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  if (isStripeConfigured && stripe && endpointSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      const orderId = intent.metadata?.orderId;
      if (orderId) {
        try {
          const order = await Order.findById(orderId);
          if (order && !order.isPaid) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.status = "processing";
            order.paymentMethod = "stripe";
            order.paymentResult = {
              stripe_payment_intent_id: intent.id,
              stripe_status: intent.status,
              is_simulated: false,
            };
            await order.save();
          }
        } catch (dbErr) {
          console.error("Webhook order update error:", dbErr);
        }
      }
    }
  }

  res.json({ received: true });
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  getStripeConfig,
  createStripePaymentIntent,
  confirmStripePayment,
  stripeWebhook,
};