const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    userName: {
      type: String,
      default: "System",
      trim: true,
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    userRole: {
      type: String,
      enum: ["admin", "manager", "staff", "customer", "system"],
      default: "staff",
    },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "STATUS_CHANGE", "LOGIN", "BULK_ACTION", "OTHER"],
      required: true,
    },
    module: {
      type: String,
      enum: [
        "orders",
        "products",
        "inventory",
        "categories",
        "coupons",
        "staff",
        "customers",
        "newsletter",
        "contacts",
        "homepage",
        "auth",
        "system",
      ],
      required: true,
    },
    resourceId: {
      type: String,
      trim: true,
    },
    resourceTitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["success", "warning", "error"],
      default: "success",
    },
    diff: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance querying, filtering, and sorting
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ module: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ status: 1, createdAt: -1 });
activityLogSchema.index({ resourceId: 1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
