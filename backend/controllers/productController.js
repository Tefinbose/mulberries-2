const Product = require("../models/Product");
const Category = require("../models/Category");

// @route GET /api/products
// query params: category, search, tag, minPrice, maxPrice, sort, page, limit
const getProducts = async (req, res, next) => {
  try {
    const { category, search, tag, minPrice, maxPrice, color, size, material, minRating, inStock, sort, page = 1, limit = 20 } = req.query;

    const filter = { isActive: true };

    if (category) {
      // support both category _id and slug
      const mongoose = require("mongoose");
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) filter.category = cat._id;
      }
    }
    if (tag) filter.tags = tag;
    if (search) filter.$text = { $search: search };
    if (color) filter.colors = color;
    if (size) filter.sizes = size;
    if (material) {
      const escapedMaterial = String(material).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.material = { $regex: `^${escapedMaterial}$`, $options: "i" };
    }
    if (minRating) filter.ratingsAverage = { $gte: Number(minRating) };
    if (inStock === "true") filter.stock = { $gt: 0 };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortOption = "-createdAt";
    if (sort === "price_asc") sortOption = "price";
    if (sort === "price_desc") sortOption = "-price";
    if (sort === "popular") sortOption = "-ratingsAverage";
    if (sort === "newest") sortOption = "-createdAt";

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter).populate("category", "name slug").sort(sortOption).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name slug");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/products/slug/:slug
const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate("category", "name slug");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/products/:id/related
const getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    }).limit(8);

    res.json({ success: true, products: related });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/products/:id/reviews
const getProductReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("reviews.user", "name");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const reviews = [...product.reviews].sort((a, b) => b.createdAt - a.createdAt);
    res.json({ success: true, reviews, ratingsAverage: product.ratingsAverage, ratingsCount: product.ratingsCount });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/products/:id/reviews
const createOrUpdateReview = async (req, res, next) => {
  try {
    const rating = Number(req.body.rating);
    const comment = typeof req.body.comment === "string" ? req.body.comment.trim() : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Please select a rating from 1 to 5" });
    }
    if (!comment) return res.status(400).json({ success: false, message: "Please write a review" });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const existingReview = product.reviews.find((review) => review.user.toString() === req.user._id.toString());
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
    } else {
      product.reviews.push({ user: req.user._id, rating, comment });
    }

    product.ratingsCount = product.reviews.length;
    product.ratingsAverage = product.ratingsCount
      ? Number((product.reviews.reduce((total, review) => total + review.rating, 0) / product.ratingsCount).toFixed(1))
      : 0;
    await product.save();

    const review = product.reviews.find((item) => item.user.toString() === req.user._id.toString());
    res.status(existingReview ? 200 : 201).json({
      success: true,
      message: existingReview ? "Review updated" : "Review submitted",
      review: { ...review.toObject(), user: { _id: req.user._id, name: req.user.name } },
      ratingsAverage: product.ratingsAverage,
      ratingsCount: product.ratingsCount,
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/admin/products
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    const { logActivity } = require("../services/activityLogService");
    logActivity({
      req,
      action: "CREATE",
      module: "products",
      resourceId: product._id,
      resourceTitle: product.name,
      description: `Created new product "${product.name}" (AED ${product.price})`,
      diff: { name: product.name, price: product.price, stock: product.stock },
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/admin/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Product not found" });

    const prevPrice = existing.price;
    const prevStock = existing.stock;

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    const { logActivity } = require("../services/activityLogService");
    logActivity({
      req,
      action: "UPDATE",
      module: "products",
      resourceId: product._id,
      resourceTitle: product.name,
      description: `Updated product details for "${product.name}"`,
      diff: {
        price: { previous: prevPrice, current: product.price },
        stock: { previous: prevStock, current: product.stock },
      },
    });

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/admin/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const { logActivity } = require("../services/activityLogService");
    logActivity({
      req,
      action: "DELETE",
      module: "products",
      resourceId: product._id,
      resourceTitle: product.name,
      description: `Deleted product "${product.name}"`,
      status: "warning",
      diff: { deletedProduct: { name: product.name, price: product.price } },
    });

    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductBySlug,
  getRelatedProducts,
  getProductReviews,
  createOrUpdateReview,
  createProduct,
  updateProduct,
  deleteProduct,
};
