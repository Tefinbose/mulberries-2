const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductBySlug,
  getRelatedProducts,
  getProductReviews,
  createOrUpdateReview,
} = require("../controllers/productController");
const { protect } = require("../middleware/auth");

router.get("/", getProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id/reviews", getProductReviews);
router.post("/:id/reviews", protect, createOrUpdateReview);
router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);

module.exports = router;
