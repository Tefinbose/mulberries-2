const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return res.status(401).json({ success: false, message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ success: false, message: "User not found" });
    if (!req.user.isActive) return res.status(403).json({ success: false, message: "This account has been disabled" });
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};

// Super admin only
const adminOnly = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ success: false, message: "Admin access required" });
};

// Admin + Manager + Staff (any dashboard user)
const dashboardOnly = (req, res, next) => {
  if (["admin", "manager", "staff"].includes(req.user?.role)) return next();
  return res.status(403).json({ success: false, message: "Dashboard access required" });
};

// Check specific permission — admin always passes
const hasPermission = (permission) => (req, res, next) => {
  if (req.user?.role === "admin") return next();
  if (req.user?.permissions?.includes(permission)) return next();
  return res.status(403).json({ success: false, message: `Permission required: ${permission}` });
};

module.exports = { protect, adminOnly, dashboardOnly, hasPermission };
