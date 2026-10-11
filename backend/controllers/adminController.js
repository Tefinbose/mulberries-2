const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// @route GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalCustomers,
      totalProducts,
      totalOrders,
      allPaidOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      returnedOrders,
      refundedOrders,
      todayOrders,
      thisMonthOrders,
      lastMonthOrders,
      lowStockProducts,
      outOfStockProducts,
      newCustomersThisMonth,
      productsSoldAgg,
      returningCustomersAgg,
      monthlyOrdersRaw,
    ] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.find({ $or: [{ isPaid: true }, { paymentMethod: "cod", status: { $in: ["processing", "shipped", "delivered"] } }] }),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "processing" }),
      Order.countDocuments({ status: "shipped" }),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: "cancelled" }),
      Order.countDocuments({ status: "returned" }),
      Order.countDocuments({ status: "refunded" }),
      Order.find({ createdAt: { $gte: startOfToday } }),
      Order.find({ $or: [{ isPaid: true }, { paymentMethod: "cod", status: { $in: ["processing", "shipped", "delivered"] } }], createdAt: { $gte: startOfMonth } }),
      Order.find({ $or: [{ isPaid: true }, { paymentMethod: "cod", status: { $in: ["processing", "shipped", "delivered"] } }], createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Product.countDocuments({ isActive: true, stock: { $gt: 0, $lte: 10 } }),
      Product.countDocuments({ isActive: true, stock: 0 }),
      User.countDocuments({ role: "customer", createdAt: { $gte: startOfMonth } }),
      // total units sold from all paid orders
      Order.aggregate([
        { $match: { $or: [{ isPaid: true }, { paymentMethod: "cod", status: { $in: ["processing", "shipped", "delivered"] } }] } },
        { $unwind: "$items" },
        { $group: { _id: null, total: { $sum: "$items.quantity" } } },
      ]),
      // returning customers = customers who have more than 1 counted order
      Order.aggregate([
        { $match: { $or: [{ isPaid: true }, { paymentMethod: "cod", status: { $in: ["processing", "shipped", "delivered"] } }] } },
        { $group: { _id: "$user", count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $count: "total" },
      ]),
      // last 7 months revenue + orders
      Order.aggregate([
        { $match: { $or: [{ isPaid: true }, { paymentMethod: "cod", status: { $in: ["processing", "shipped", "delivered"] } }], createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) } } },
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    const totalRevenue = allPaidOrders.reduce((s, o) => s + o.totalPrice, 0);
    const thisMonthRevenue = thisMonthOrders.reduce((s, o) => s + o.totalPrice, 0);
    const lastMonthRevenue = lastMonthOrders.reduce((s, o) => s + o.totalPrice, 0);
    const isCounted = (o) => o.isPaid || (o.paymentMethod === "cod" && ["processing", "shipped", "delivered"].includes(o.status));
    const todayRevenue = todayOrders.filter(isCounted).reduce((s, o) => s + o.totalPrice, 0);
    const avgOrderValue = allPaidOrders.length ? totalRevenue / allPaidOrders.length : 0;
    const productsSold = productsSoldAgg[0]?.total || 0;
    const returningCustomers = returningCustomersAgg[0]?.total || 0;
    const newCustomers = Math.max(0, totalCustomers - returningCustomers);

    // Conversion rate = paid orders / total orders
    const conversionRate = totalOrders > 0 ? ((allPaidOrders.length / totalOrders) * 100).toFixed(1) : "0.0";

    const revenueChange = lastMonthRevenue
      ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
      : null;
    const ordersChange = lastMonthOrders.length
      ? (((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100).toFixed(1)
      : null;

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const salesChart = monthlyOrdersRaw.map((m) => ({
      month: monthNames[m._id.month - 1],
      revenue: Math.round(m.revenue),
      orders: m.orders,
    }));

    res.json({
      success: true,
      stats: {
        totalCustomers,
        newCustomers,
        returningCustomers,
        totalProducts,
        totalOrders,
        totalRevenue: Math.round(totalRevenue),
        todayRevenue: Math.round(todayRevenue),
        todayOrders: todayOrders.length,
        thisMonthRevenue: Math.round(thisMonthRevenue),
        thisMonthOrders: thisMonthOrders.length,
        lastMonthRevenue: Math.round(lastMonthRevenue),
        lastMonthOrders: lastMonthOrders.length,
        revenueChange,
        ordersChange,
        avgOrderValue: Math.round(avgOrderValue),
        productsSold,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        returnedOrders,
        refundedOrders,
        conversionRate,
        lowStockProducts,
        outOfStockProducts,
        newCustomersThisMonth,
        salesChart,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/admin/users
// Returns all non-customer users (admin, manager, staff) only — not customers
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: "customer" } }).sort("-createdAt");
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/admin/customers
// Returns all registered customers enriched with total orders count, total spent, and address details
const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: "customer" })
      .select("-password")
      .sort("-createdAt")
      .lean();

    const customerIds = customers.map((c) => c._id);
    const orderAgg = await Order.aggregate([
      { $match: { user: { $in: customerIds } } },
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$totalPrice" },
          lastOrderDate: { $max: "$createdAt" },
        },
      },
    ]);

    const statsMap = {};
    orderAgg.forEach((s) => {
      statsMap[s._id.toString()] = s;
    });

    const enriched = customers.map((c) => {
      const st = statsMap[c._id.toString()] || { orderCount: 0, totalSpent: 0, lastOrderDate: null };
      const defaultAddr = c.addresses?.find((a) => a.isDefault) || c.addresses?.[0];
      return {
        ...c,
        orderCount: st.orderCount,
        totalSpent: Math.round(st.totalSpent),
        lastOrderDate: st.lastOrderDate,
        phone: c.phone || defaultAddr?.phone || "",
        city: defaultAddr?.city || defaultAddr?.emirate || "",
        addressSummary: defaultAddr ? `${defaultAddr.addressLine1 || ""}, ${defaultAddr.city || defaultAddr.emirate || ""}` : "",
      };
    });

    res.json({ success: true, count: enriched.length, users: enriched, customers: enriched });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/admin/users/:id
const updateUserRole = async (req, res, next) => {
  try {
    const { role, permissions, isActive, name, email, password } = req.body;
    const user = await User.findById(req.params.id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const prevRole = user.role;
    const prevActive = user.isActive;

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (permissions) user.permissions = permissions;
    if (typeof isActive === "boolean") user.isActive = isActive;
    if (password) user.password = password; // pre-save hook will hash it
    await user.save();
    const updated = await User.findById(user._id);

    const { logActivity } = require("../services/activityLogService");
    logActivity({
      req,
      action: "UPDATE",
      module: user.role === "customer" ? "customers" : "staff",
      resourceId: user._id,
      resourceTitle: user.name,
      description: `Updated account details/permissions for "${user.name}" (${user.email})`,
      diff: {
        role: { previous: prevRole, current: user.role },
        isActive: { previous: prevActive, current: user.isActive },
      },
    });

    res.json({ success: true, user: updated });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/admin/users/:id or /api/admin/customers/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role === "admin") return res.status(400).json({ success: false, message: "Cannot delete super admin account" });
    if (req.user._id.toString() === req.params.id) return res.status(400).json({ success: false, message: "You cannot delete your own account" });

    const roleLabel = user.role === "customer" ? "Customer" : "Staff Member";
    await user.deleteOne();

    const { logActivity } = require("../services/activityLogService");
    logActivity({
      req,
      action: "DELETE",
      module: user.role === "customer" ? "customers" : "staff",
      resourceId: user._id,
      resourceTitle: user.name,
      description: `Deleted ${roleLabel} account "${user.name}" (${user.email})`,
      status: "warning",
      diff: { deletedAccount: { name: user.name, email: user.email, role: user.role } },
    });

    res.json({ success: true, message: `${user.role === "customer" ? "Customer" : "User"} deleted successfully` });
  } catch (error) {
    next(error);
  }
};
const deleteStaffUser = deleteUser;
const createStaffUser = async (req, res, next) => {
  try {
    const { name, email, password, role, permissions } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: "Email already in use" });
    if (!["manager", "staff"].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be manager or staff" });
    }
    const user = await User.create({ name, email, password, role, permissions: permissions || [] });

    const { logActivity } = require("../services/activityLogService");
    logActivity({
      req,
      action: "CREATE",
      module: "staff",
      resourceId: user._id,
      resourceTitle: user.name,
      description: `Created new staff account for "${user.name}" with role "${role}"`,
      diff: { role, permissions: permissions || [] },
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/admin/inventory
const getInventory = async (req, res, next) => {
  try {
    const { filter, search } = req.query;
    let query = { isActive: true };
    if (filter === "low") query.stock = { $gt: 0, $lte: 10 };
    else if (filter === "out") query.stock = 0;
    else if (filter === "in") query.stock = { $gt: 10 };
    if (search) query.name = { $regex: search, $options: "i" };

    const [products, totalCount, lowCount, outCount, inCount] = await Promise.all([
      Product.find(query).select("name stock images price category updatedAt").populate("category", "name").sort("stock"),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, stock: { $gt: 0, $lte: 10 } }),
      Product.countDocuments({ isActive: true, stock: 0 }),
      Product.countDocuments({ isActive: true, stock: { $gt: 10 } }),
    ]);

    // legacy fields for dashboard widget
    const lowStock = filter ? [] : await Product.find({ isActive: true, stock: { $gt: 0, $lte: 10 } }).select("name stock images price category").populate("category", "name").sort("stock");
    const outOfStock = filter ? [] : await Product.find({ isActive: true, stock: 0 }).select("name stock images price category").populate("category", "name").sort("-updatedAt");

    res.json({ success: true, products, totalCount, lowCount, outCount, inCount, lowStock, outOfStock });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/admin/inventory/:id
const updateStock = async (req, res, next) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || stock < 0) return res.status(400).json({ success: false, message: "Invalid stock value" });

    const existingProduct = await Product.findById(req.params.id).select("name stock");
    if (!existingProduct) return res.status(404).json({ success: false, message: "Product not found" });

    const oldStock = existingProduct.stock;
    existingProduct.stock = stock;
    await existingProduct.save();

    const { logActivity } = require("../services/activityLogService");
    logActivity({
      req,
      action: "UPDATE",
      module: "inventory",
      resourceId: existingProduct._id,
      resourceTitle: existingProduct.name,
      description: `Adjusted inventory stock for "${existingProduct.name}" from ${oldStock} to ${stock}`,
      status: stock === 0 ? "warning" : "success",
      diff: { previous: { stock: oldStock }, current: { stock } },
    });

    res.json({ success: true, product: existingProduct });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/admin/sales-analytics
const getSalesAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const countedMatch = { $or: [{ isPaid: true }, { paymentMethod: "cod", status: { $in: ["processing", "shipped", "delivered"] } }] };

    // ── Period boundaries ──────────────────────────────────
    const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
    const dayOfWeek = now.getDay(); // 0=Sun
    const startOfThisWeek  = new Date(y, m, d - dayOfWeek);
    const startOfLastWeek  = new Date(y, m, d - dayOfWeek - 7);
    const endOfLastWeek    = new Date(y, m, d - dayOfWeek - 1, 23, 59, 59);
    const startOfThisMonth = new Date(y, m, 1);
    const startOfLastMonth = new Date(y, m - 1, 1);
    const endOfLastMonth   = new Date(y, m, 0, 23, 59, 59);
    const startOfThisYear  = new Date(y, 0, 1);
    const startOfLastYear  = new Date(y - 1, 0, 1);
    const endOfLastYear    = new Date(y - 1, 11, 31, 23, 59, 59);

    const ordersInRange = (start, end) => Order.find({ $or: countedMatch.$or, createdAt: { $gte: start, ...(end ? { $lte: end } : {}) } });
    const customersInRange = (start, end) => User.countDocuments({ role: "customer", createdAt: { $gte: start, ...(end ? { $lte: end } : {}) } });
    const productsSoldInRange = (start, end) => Order.aggregate([
      { $match: { $or: countedMatch.$or, createdAt: { $gte: start, ...(end ? { $lte: end } : {}) } } },
      { $unwind: "$items" },
      { $group: { _id: null, total: { $sum: "$items.quantity" } } },
    ]);

    const pct = (curr, prev) => prev === 0 ? null : parseFloat(((curr - prev) / prev * 100).toFixed(1));
    const aov = (orders) => orders.length ? Math.round(orders.reduce((s, o) => s + o.totalPrice, 0) / orders.length) : 0;
    const rev = (orders) => Math.round(orders.reduce((s, o) => s + o.totalPrice, 0));

    // ── Fetch all comparison data in parallel ──────────────
    const [
      thisMonthOrders, lastMonthOrders,
      thisWeekOrders,  lastWeekOrders,
      thisYearOrders,  lastYearOrders,
      thisMonthCust,   lastMonthCust,
      thisWeekCust,    lastWeekCust,
      thisYearCust,    lastYearCust,
      thisMonthSoldAgg, lastMonthSoldAgg,
      thisWeekSoldAgg,  lastWeekSoldAgg,
      thisYearSoldAgg,  lastYearSoldAgg,
    ] = await Promise.all([
      ordersInRange(startOfThisMonth),
      ordersInRange(startOfLastMonth, endOfLastMonth),
      ordersInRange(startOfThisWeek),
      ordersInRange(startOfLastWeek, endOfLastWeek),
      ordersInRange(startOfThisYear),
      ordersInRange(startOfLastYear, endOfLastYear),
      customersInRange(startOfThisMonth),
      customersInRange(startOfLastMonth, endOfLastMonth),
      customersInRange(startOfThisWeek),
      customersInRange(startOfLastWeek, endOfLastWeek),
      customersInRange(startOfThisYear),
      customersInRange(startOfLastYear, endOfLastYear),
      productsSoldInRange(startOfThisMonth),
      productsSoldInRange(startOfLastMonth, endOfLastMonth),
      productsSoldInRange(startOfThisWeek),
      productsSoldInRange(startOfLastWeek, endOfLastWeek),
      productsSoldInRange(startOfThisYear),
      productsSoldInRange(startOfLastYear, endOfLastYear),
    ]);

    const buildComparison = (curr, prev, currCust, prevCust, currSoldAgg, prevSoldAgg, label, prevLabel) => {
      const currRev = rev(curr), prevRev = rev(prev);
      const currOrd = curr.length, prevOrd = prev.length;
      const currAov = aov(curr), prevAov = aov(prev);
      const currSold = currSoldAgg[0]?.total || 0, prevSold = prevSoldAgg[0]?.total || 0;
      return {
        label, prevLabel,
        revenue:      { current: currRev,  previous: prevRev,  change: pct(currRev, prevRev) },
        orders:       { current: currOrd,  previous: prevOrd,  change: pct(currOrd, prevOrd) },
        customers:    { current: currCust, previous: prevCust, change: pct(currCust, prevCust) },
        productsSold: { current: currSold, previous: prevSold, change: pct(currSold, prevSold) },
        aov:          { current: currAov,  previous: prevAov,  change: pct(currAov, prevAov) },
      };
    };

    const comparisons = {
      month: buildComparison(thisMonthOrders, lastMonthOrders, thisMonthCust, lastMonthCust, thisMonthSoldAgg, lastMonthSoldAgg, "This Month", "Last Month"),
      week:  buildComparison(thisWeekOrders,  lastWeekOrders,  thisWeekCust,  lastWeekCust,  thisWeekSoldAgg,  lastWeekSoldAgg,  "This Week",  "Previous Week"),
      year:  buildComparison(thisYearOrders,  lastYearOrders,  thisYearCust,  lastYearCust,  thisYearSoldAgg,  lastYearSoldAgg,  "This Year",  "Last Year"),
    };

    // Daily — last 30 days
    const dailyRaw = await Order.aggregate([
      { $match: { ...countedMatch, createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29) } } },
      { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" }, d: { $dayOfMonth: "$createdAt" } }, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
      { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
    ]);
    const daily = dailyRaw.map((r) => ({ label: `${r._id.d}/${r._id.m}`, revenue: Math.round(r.revenue), orders: r.orders }));

    // Weekly — last 12 weeks
    const weeklyRaw = await Order.aggregate([
      { $match: { ...countedMatch, createdAt: { $gte: new Date(now.getTime() - 84 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { y: { $isoWeekYear: "$createdAt" }, w: { $isoWeek: "$createdAt" } }, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
      { $sort: { "_id.y": 1, "_id.w": 1 } },
    ]);
    const weekly = weeklyRaw.map((r) => ({ label: `W${r._id.w}`, revenue: Math.round(r.revenue), orders: r.orders }));

    // Monthly — last 12 months
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthlyRaw = await Order.aggregate([
      { $match: { ...countedMatch, createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) } } },
      { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 }, aov: { $avg: "$totalPrice" } } },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]);
    const monthly = monthlyRaw.map((r) => ({ label: `${monthNames[r._id.m - 1]} ${r._id.y}`, revenue: Math.round(r.revenue), orders: r.orders, aov: Math.round(r.aov) }));

    // Yearly — all years
    const yearlyRaw = await Order.aggregate([
      { $match: countedMatch },
      { $group: { _id: { $year: "$createdAt" }, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const yearly = yearlyRaw.map((r) => ({ label: String(r._id), revenue: Math.round(r.revenue), orders: r.orders }));

    // Top 10 products by revenue
    const productSalesRaw = await Order.aggregate([
      { $match: countedMatch },
      { $unwind: "$items" },
      { $group: { _id: "$items.product", name: { $first: "$items.name" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }, units: { $sum: "$items.quantity" } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);
    const productSales = productSalesRaw.map((r) => ({ label: r.name || "Unknown", revenue: Math.round(r.revenue), units: r.units }));

    // Category sales
    const categorySalesRaw = await Order.aggregate([
      { $match: countedMatch },
      { $unwind: "$items" },
      { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "prod" } },
      { $unwind: { path: "$prod", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "categories", localField: "prod.category", foreignField: "_id", as: "cat" } },
      { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$cat._id", name: { $first: "$cat.name" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }, units: { $sum: "$items.quantity" } } },
      { $sort: { revenue: -1 } },
    ]);
    const categorySales = categorySalesRaw.map((r) => ({ label: r.name || "Uncategorized", revenue: Math.round(r.revenue), units: r.units }));

    // Customer growth — monthly new customers last 12 months
    const customerGrowthRaw = await User.aggregate([
      { $match: { role: "customer", createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) } } },
      { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, newCustomers: { $sum: 1 } } },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]);
    const customerGrowth = customerGrowthRaw.map((r) => ({ label: `${monthNames[r._id.m - 1]} ${r._id.y}`, newCustomers: r.newCustomers }));

    res.json({ success: true, daily, weekly, monthly, yearly, productSales, categorySales, customerGrowth, comparisons });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
