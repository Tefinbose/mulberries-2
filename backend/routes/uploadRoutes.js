const express = require("express");
const router = express.Router();
const { upload, cloudinary } = require("../config/cloudinary");
const { protect, adminOnly } = require("../middleware/auth");

// POST /api/upload  — upload up to 10 images at once
router.post("/", protect, adminOnly, upload.array("images", 10), (req, res) => {
  const urls = (req.files || []).map((f) => f.path || f.secure_url || f.url);
  res.json({ success: true, urls });
});

// DELETE /api/upload  — delete image from cloudinary
router.delete("/", protect, adminOnly, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: "url required" });

  // extract public_id from url  e.g. mulberries/products/abc123
  const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^/.]+$/);
  const parts = url.split("/");
  const publicId = matches ? matches[1] : parts.slice(-2).join("/").replace(/\.[^/.]+$/, "");

  await cloudinary.uploader.destroy(publicId);
  res.json({ success: true });
});

module.exports = router;
