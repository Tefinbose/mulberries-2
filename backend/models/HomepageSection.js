const mongoose = require("mongoose");

// Stores homepage configurable sections:
// type: "complete_the_look" — list of product IDs to show
// type: "offer_banner"      — banner text, image, link, bg colour
const homepageSectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["complete_the_look", "offer_banner"],
      required: true,
      unique: true,
    },
    // complete_the_look
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    // offer_banner
    heading: { type: String, default: "" },
    subheading: { type: String, default: "" },
    badgeText: { type: String, default: "" },   // e.g. "LIMITED TIME"
    bgColor: { type: String, default: "#5c1a52" },
    textColor: { type: String, default: "#ffffff" },
    image: { type: String, default: "" },
    linkText: { type: String, default: "Shop Now" },
    linkHref: { type: String, default: "/" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomepageSection", homepageSectionSchema);
