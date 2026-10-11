const express = require("express");
const router = express.Router();
const { protect, adminOnly, dashboardOnly, hasPermission } = require("../middleware/auth");

const { createCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");
const { createProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const { getAllOrders, updateOrderStatus } = require("../controllers/orderController");
const {
  getDashboardStats,
  getAllUsers,
  getAllCustomers,
  updateUserRole,
  createStaffUser,
  deleteUser,
  deleteStaffUser,
  getInventory,
  updateStock,
  getSalesAnalytics,
} = require("../controllers/adminController");
const {
  getAllSubscribers,
  createSubscriber,
  updateSubscriber,
  deleteSubscriber,
  getAllContactEmails,
} = require("../controllers/newsletterController");
const {
  getAllContacts,
  getNotifications,
  markContactAsRead,
  markAllContactsAsRead,
  deleteContact,
} = require("../controllers/contactController");
const { upsertSection } = require("../controllers/homepageController");
const { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } = require("../controllers/couponController");
const {
  getActivityLogs,
  getActivitySummary,
  flagOperationIssue,
} = require("../controllers/activityLogController");

// All dashboard routes require login
router.use(protect, dashboardOnly);

// Dashboard stats — admin + manager
router.get("/dashboard", hasPermission("reports"), getDashboardStats);

// Notifications — all dashboard users
router.get("/notifications", getNotifications);

// Operation History & Staff Performance Tracking — admin & staff supervisor
router.get("/activity-logs", hasPermission("staff"), getActivityLogs);
router.get("/activity-logs/summary", hasPermission("staff"), getActivitySummary);
router.post("/activity-logs/flag-issue", hasPermission("staff"), flagOperationIssue);

// Categories — admin + manager with permission
router.post("/categories", hasPermission("categories"), createCategory);
router.put("/categories/:id", hasPermission("categories"), updateCategory);
router.delete("/categories/:id", adminOnly, deleteCategory);

// Products — admin + manager/staff with permission
router.post("/products", hasPermission("products"), createProduct);
router.put("/products/:id", hasPermission("products"), updateProduct);
router.delete("/products/:id", adminOnly, deleteProduct);

// Orders — admin + manager/staff with permission
router.get("/orders", hasPermission("orders"), getAllOrders);
router.put("/orders/:id/status", hasPermission("orders"), updateOrderStatus);

// Staff Directory — admin only
router.get("/users", adminOnly, getAllUsers);
router.post("/users/staff", adminOnly, createStaffUser);
router.put("/users/:id", adminOnly, updateUserRole);
router.delete("/users/:id", adminOnly, deleteStaffUser);

// Customers Directory — admin only
router.get("/customers", adminOnly, getAllCustomers);
router.delete("/customers/:id", adminOnly, deleteUser);

// Newsletter & Email Subscribers — admin + manager
router.get("/newsletter", hasPermission("orders"), getAllSubscribers);
router.get("/newsletter/all-contacts", hasPermission("orders"), getAllContactEmails);
router.post("/newsletter", hasPermission("orders"), createSubscriber);
router.put("/newsletter/:id", hasPermission("orders"), updateSubscriber);
router.delete("/newsletter/:id", adminOnly, deleteSubscriber);

// Contact messages & Inquiries — all dashboard users can view & mark read
router.get("/contacts", getAllContacts);
router.put("/contacts/mark-all-read", markAllContactsAsRead);
router.put("/contacts/:id/read", markContactAsRead);
router.delete("/contacts/:id", adminOnly, deleteContact);

// Homepage sections — admin only ("homepage" is not a granular permission, avoid borrowing "products")
router.put("/homepage/:type", adminOnly, upsertSection);

router.get("/sales-analytics", hasPermission("reports"), getSalesAnalytics);

// Inventory
router.get("/inventory", hasPermission("products"), getInventory);
router.put("/inventory/:id", hasPermission("products"), updateStock);

// Coupons — admin + manager
router.get("/coupons", hasPermission("orders"), getAllCoupons);
router.post("/coupons", hasPermission("orders"), createCoupon);
router.put("/coupons/:id", hasPermission("orders"), updateCoupon);
router.delete("/coupons/:id", adminOnly, deleteCoupon);

module.exports = router;

