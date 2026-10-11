const Coupon = require("../models/Coupon");

// POST /api/coupons/validate  — public, called from checkout
const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body;
    const cleanCode = code ? String(code).toUpperCase().trim() : "";
    if (!cleanCode) return res.status(400).json({ success: false, message: "Coupon code is required" });

    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });

    if (!coupon) return res.status(404).json({ success: false, message: "Invalid coupon code" });
    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt))
      return res.status(400).json({ success: false, message: "Coupon has expired" });
    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit)
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });

    const total = Number(orderTotal) || 0;
    if (total < (coupon.minOrderValue || 0))
      return res.status(400).json({
        success: false,
        message: `Minimum order value AED ${coupon.minOrderValue} required`,
      });

    let discount =
      coupon.discountType === "percentage"
        ? (total * coupon.discountValue) / 100
        : coupon.discountValue;

    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    discount = Math.min(discount, total); // Discount cannot exceed total
    discount = Math.round(discount * 100) / 100;

    res.json({
      success: true,
      discount,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/coupons
const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort("-createdAt");
    res.json({ success: true, coupons });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/coupons
const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);

    const { logActivity } = require("../services/activityLogService");
    logActivity({
      req,
      action: "CREATE",
      module: "coupons",
      resourceId: coupon._id,
      resourceTitle: coupon.code,
      description: `Created new promo coupon "${coupon.code}" (${coupon.discountValue}${coupon.discountType === "percentage" ? "%" : " AED"} off)`,
      diff: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
    });

    res.status(201).json({ success: true, coupon });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/coupons/:id
const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

    const { logActivity } = require("../services/activityLogService");
    logActivity({
      req,
      action: "UPDATE",
      module: "coupons",
      resourceId: coupon._id,
      resourceTitle: coupon.code,
      description: `Updated coupon "${coupon.code}"`,
    });

    res.json({ success: true, coupon });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/coupons/:id
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

    const { logActivity } = require("../services/activityLogService");
    logActivity({
      req,
      action: "DELETE",
      module: "coupons",
      resourceId: coupon._id,
      resourceTitle: coupon.code,
      description: `Deleted coupon "${coupon.code}"`,
      status: "warning",
      diff: { deletedCoupon: { code: coupon.code } },
    });

    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { validateCoupon, getAllCoupons, createCoupon, updateCoupon, deleteCoupon };
