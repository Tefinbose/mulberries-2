const Stripe = require("stripe");

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const isConfigured = Boolean(
  stripeSecretKey &&
    (stripeSecretKey.startsWith("sk_test_") || stripeSecretKey.startsWith("sk_live_"))
);

let stripeInstance = null;
if (isConfigured) {
  stripeInstance = new Stripe(stripeSecretKey, {
    apiVersion: "2024-12-18.acacia",
  });
}

const STRIPE_CURRENCY = (process.env.STRIPE_CURRENCY || "aed").toLowerCase();

module.exports = {
  stripe: stripeInstance,
  isStripeConfigured: isConfigured,
  STRIPE_CURRENCY,
};
