const ActivityLog = require("../models/ActivityLog");

/**
 * Extract client IP address safely from Express request.
 */
const extractIp = (req) => {
  if (!req) return "";
  const forwarded = req.headers?.["x-forwarded-for"];
  if (forwarded) {
    return String(forwarded).split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || "";
};

/**
 * Log an administrative/staff activity or operation.
 * Non-blocking and fail-safe: this function NEVER throws an error, ensuring
 * that the core business logic is completely protected and uninterrupted.
 */
const logActivity = async ({
  req = null,
  user = null,
  action,
  module,
  resourceId = "",
  resourceTitle = "",
  description,
  status = "success",
  diff = null,
  errorMessage = "",
}) => {
  try {
    const actor = user || req?.user;
    const ipAddress = extractIp(req);
    const userAgent = req?.headers?.["user-agent"] ? String(req.headers["user-agent"]).slice(0, 300) : "";

    const logEntry = {
      user: actor?._id || null,
      userName: actor?.name || "System",
      userEmail: actor?.email || "",
      userRole: actor?.role || (actor ? "staff" : "system"),
      action: action || "OTHER",
      module: module || "system",
      resourceId: resourceId ? String(resourceId) : "",
      resourceTitle: resourceTitle ? String(resourceTitle) : "",
      description: description || `${action} on ${module}`,
      status: ["success", "warning", "error"].includes(status) ? status : "success",
      diff: diff || null,
      errorMessage: errorMessage ? String(errorMessage) : "",
      ipAddress,
      userAgent,
    };

    const saved = await ActivityLog.create(logEntry);
    return saved;
  } catch (err) {
    // Fail silently in production, log a non-fatal warning so the primary API request completes normally
    console.warn("⚠️ [activityLogService] Failed to record activity log:", err.message);
    return null;
  }
};

/**
 * Query activity logs with flexible filters, search, and pagination.
 */
const queryActivityLogs = async ({
  page = 1,
  limit = 25,
  module = "",
  action = "",
  userId = "",
  status = "",
  search = "",
  startDate = "",
  endDate = "",
}) => {
  const filter = {};

  if (module && module !== "all") {
    filter.module = module;
  }

  if (action && action !== "all") {
    filter.action = action;
  }

  if (userId && userId !== "all") {
    filter.user = userId;
  }

  if (status && status !== "all") {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  if (search && search.trim()) {
    const term = search.trim();
    filter.$or = [
      { description: { $regex: term, $options: "i" } },
      { resourceTitle: { $regex: term, $options: "i" } },
      { userName: { $regex: term, $options: "i" } },
      { userEmail: { $regex: term, $options: "i" } },
      { resourceId: { $regex: term, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 25));
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    ActivityLog.countDocuments(filter),
  ]);

  return {
    logs,
    total,
    page: pageNum,
    limit: limitNum,
    pages: Math.ceil(total / limitNum) || 1,
  };
};

/**
 * Get comprehensive analytics and staff performance summary.
 * Tracks operations completed, issues/errors made, and module distribution.
 */
const getStaffPerformanceSummary = async () => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalLogs,
    todayCount,
    issueCount,
    staffAgg,
    moduleAgg,
    actionAgg,
    recentIssues,
  ] = await Promise.all([
    ActivityLog.countDocuments(),
    ActivityLog.countDocuments({ createdAt: { $gte: startOfToday } }),
    ActivityLog.countDocuments({ status: { $in: ["warning", "error"] } }),

    // Performance by Staff/User (last 30 days)
    ActivityLog.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      {
        $group: {
          _id: "$user",
          userName: { $first: "$userName" },
          userEmail: { $first: "$userEmail" },
          userRole: { $first: "$userRole" },
          totalActions: { $sum: 1 },
          todayActions: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", startOfToday] }, 1, 0],
            },
          },
          issuesCount: {
            $sum: {
              $cond: [{ $in: ["$status", ["warning", "error"]] }, 1, 0],
            },
          },
          modules: { $addToSet: "$module" },
          lastActive: { $max: "$createdAt" },
        },
      },
      { $sort: { totalActions: -1 } },
    ]),

    // Distribution across modules
    ActivityLog.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      { $group: { _id: "$module", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Distribution across actions
    ActivityLog.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Recent 5 issues/warnings
    ActivityLog.find({ status: { $in: ["warning", "error"] } })
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    totalLogs,
    todayCount,
    issueCount,
    staffPerformance: staffAgg.map((s) => ({
      userId: s._id,
      name: s.userName || "Unknown",
      email: s.userEmail || "",
      role: s.userRole || "staff",
      totalActions: s.totalActions,
      todayActions: s.todayActions,
      issuesCount: s.issuesCount,
      moduleCount: s.modules?.length || 0,
      modules: s.modules || [],
      lastActive: s.lastActive,
    })),
    moduleDistribution: moduleAgg.map((m) => ({ module: m._id, count: m.count })),
    actionDistribution: actionAgg.map((a) => ({ action: a._id, count: a.count })),
    recentIssues,
  };
};

module.exports = {
  logActivity,
  queryActivityLogs,
  getStaffPerformanceSummary,
};
