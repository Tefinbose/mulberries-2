const {
  queryActivityLogs,
  getStaffPerformanceSummary,
  logActivity,
} = require("../services/activityLogService");

// @route GET /api/admin/activity-logs
// Query params: page, limit, module, action, userId, status, search, startDate, endDate
const getActivityLogs = async (req, res, next) => {
  try {
    const { page, limit, module, action, userId, status, search, startDate, endDate } = req.query;

    const result = await queryActivityLogs({
      page,
      limit,
      module,
      action,
      userId,
      status,
      search,
      startDate,
      endDate,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/admin/activity-logs/summary
// Returns staff performance summary & issue breakdown
const getActivitySummary = async (req, res, next) => {
  try {
    const summary = await getStaffPerformanceSummary();
    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/admin/activity-logs/flag-issue
// Allows admin or staff to record an operational issue/incident
const flagOperationIssue = async (req, res, next) => {
  try {
    const { module, resourceId, resourceTitle, description, errorMessage, diff } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Description of the issue is required" });
    }

    const log = await logActivity({
      req,
      action: "OTHER",
      module: module || "system",
      resourceId,
      resourceTitle,
      description: description.trim(),
      status: "error",
      errorMessage,
      diff,
    });

    res.status(201).json({
      success: true,
      message: "Issue recorded in operation history",
      log,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivityLogs,
  getActivitySummary,
  flagOperationIssue,
};
