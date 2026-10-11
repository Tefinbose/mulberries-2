const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    color: String,
    size: String,
    stock: { type: Number, default: 0 },
    sku: String,
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true }, // AED
    discountPrice: { type: Number },
    material: { type: String, default: "" },
    images: [{ type: String }], // local image paths, e.g. /saree1.jpeg
    colors: [{ type: String }],
    sizes: [{ type: String }],
    variants: [variantSchema],
    stock: { type: Number, default: 0 },
    tags: [{ type: String }], // e.g. "new-arrival", "festive", "trending"
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    ratingsAverage: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Product", productSchema);
