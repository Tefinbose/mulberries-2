const express = require("express");
const router = express.Router();
const { validateCoupon } = require("../controllers/couponController");
const Coupon = require("../models/Coupon");

router.post("/validate", validateCoupon);

// Public: get active coupons for display (code + description only, no sensitive data)
router.get("/active", async (req, res, next) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      $and: [
        {
          $or: [
            { expiresAt: null },
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: now } },
          ],
        },
        {
          $or: [
            { usageLimit: null },
            { usageLimit: { $exists: false } },
            { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
          ],
        },
      ],
    })
      .select("code description discountType discountValue minOrderValue")
      .limit(10);
    res.json({ success: true, coupons });
  } catch (err) { next(err); }
});

module.exports = router;
