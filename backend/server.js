const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

dotenv.config();

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

// Route imports
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const contactRoutes = require("./routes/contactRoutes");
const homepageRoutes = require("./routes/homepageRoutes");
const couponRoutes = require("./routes/couponRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");

connectDB();

const app = express();
app.set("trust proxy", 1);

// Security & core middleware
app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.DASHBOARD_URL,
  process.env.DEV_CLIENT_URL,
  process.env.DEV_CLIENT_URL_ALT, // e.g. localhost:3001 when Next.js auto-bumps port
  process.env.DEV_DASHBOARD_URL,
  process.env.DEV_DASHBOARD_URL_ALT, // e.g. localhost:5174 when Vite auto-bumps port
  // Production storefront and dashboard. Keep these explicit so browser
  // requests work even if an environment variable was missed during setup.
  "https://demo.mulberries.shop",
  "https://dashboard.mulberries.shop",
  "https://mulberries-2.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow non-browser requests (curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Automatically permit any Vercel deployment URL
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      // In development, automatically permit any localhost or 127.0.0.1 port
      if (process.env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Basic rate limiting on API routes
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api", limiter);

// Root welcome route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Mulberries API is live and running",
    version: "1.0.0",
    docs: "/api/health",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Mulberries API running" });
});


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/homepage", homepageRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/newsletter", newsletterRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5007;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

module.exports = app;
