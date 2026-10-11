const HomepageSection = require("../models/HomepageSection");

// GET /api/homepage/:type  — public
const getSection = async (req, res, next) => {
  try {
    const section = await HomepageSection.findOne({ type: req.params.type, isActive: true })
      .populate("products", "name slug price discountPrice images stock isActive");
    res.json({ success: true, section: section || null });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/homepage/:type  — upsert (admin/manager)
const upsertSection = async (req, res, next) => {
  try {
    const section = await HomepageSection.findOneAndUpdate(
      { type: req.params.type },
      { ...req.body, type: req.params.type },
      { new: true, upsert: true, runValidators: true }
    ).populate("products", "name slug price discountPrice images stock isActive");
    res.json({ success: true, section });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSection, upsertSection };
