const Category = require("../models/Category");

// @route GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort("displayOrder");
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/categories/:slug
const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/admin/categories
const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);

    const { logActivity } = require("../services/activityLogService");
    logActivity({
      req,
      action: "CREATE",
      module: "categories",
      resourceId: category._id,
      resourceTitle: category.name,
      description: `Created new category "${category.name}"`,
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/admin/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    const { logActivity } = require("../services/activityLogService");
    logActivity({
      req,
      action: "UPDATE",
      module: "categories",
      resourceId: category._id,
      resourceTitle: category.name,
      description: `Updated category "${category.name}"`,
    });

    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/admin/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    const { logActivity } = require("../services/activityLogService");
    logActivity({
      req,
      action: "DELETE",
      module: "categories",
      resourceId: category._id,
      resourceTitle: category.name,
      description: `Deleted category "${category.name}"`,
      status: "warning",
    });

    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};