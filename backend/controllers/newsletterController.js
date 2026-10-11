const Newsletter = require("../models/Newsletter");
const User = require("../models/User");
const { sendNewsletterWelcome } = require("../services/emailService");

// @desc    Public Newsletter Subscription
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email, name, phone, source } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await Newsletter.findOne({ email: cleanEmail });

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        if (name && !existing.name) existing.name = name.trim();
        if (phone && !existing.phone) existing.phone = phone.trim();
        await existing.save();
        sendNewsletterWelcome(cleanEmail).catch((err) => {
          console.error("Failed to send newsletter welcome email:", err.message);
        });
        return res.json({
          success: true,
          message: "Welcome back! Your newsletter subscription has been reactivated.",
          subscriber: existing,
        });
      }
      return res.json({
        success: true,
        message: "You are already a member of the Mulberry Club! Check your inbox for updates.",
        subscriber: existing,
      });
    }

    const subscriber = await Newsletter.create({
      email: cleanEmail,
      name: name?.trim() || "",
      phone: phone?.trim() || "",
      source: source || "footer_subscription",
      isActive: true,
    });

    sendNewsletterWelcome(cleanEmail).catch((err) => {
      console.error("Failed to send newsletter welcome email:", err.message);
    });

    res.status(201).json({
      success: true,
      message: "Welcome to the Mulberry Club! You have successfully subscribed.",
      subscriber,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Newsletter Subscribers (Admin)
// @route   GET /api/admin/newsletter
// @access  Private/Admin/Manager
const getAllSubscribers = async (req, res, next) => {
  try {
    const { search, source, status } = req.query;
    const query = {};

    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;
    if (source) query.source = source;
    if (search) {
      const regex = { $regex: search.trim(), $options: "i" };
      query.$or = [{ email: regex }, { name: regex }, { phone: regex }];
    }

    const [subscribers, totalCount, activeCount, registeredCustomersCount] = await Promise.all([
      Newsletter.find(query).sort("-createdAt"),
      Newsletter.countDocuments(),
      Newsletter.countDocuments({ isActive: true }),
      User.countDocuments({ role: "customer" }),
    ]);

    // Calculate this month's count
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const thisMonthCount = await Newsletter.countDocuments({ createdAt: { $gte: startOfMonth } });

    res.json({
      success: true,
      count: subscribers.length,
      subscribers,
      stats: {
        total: totalCount,
        active: activeCount,
        thisMonth: thisMonthCount,
        registeredCustomers: registeredCustomersCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Unified Contact Emails (Newsletter + Customers)
// @route   GET /api/admin/newsletter/all-contacts
// @access  Private/Admin/Manager
const getAllContactEmails = async (req, res, next) => {
  try {
    const [subscribers, customers] = await Promise.all([
      Newsletter.find().sort("-createdAt").lean(),
      User.find({ role: "customer" }).select("name email phone addresses createdAt isActive").sort("-createdAt").lean(),
    ]);

    // Merge into unique by email
    const emailMap = new Map();

    // 1. Process subscribers
    subscribers.forEach((sub) => {
      emailMap.set(sub.email.toLowerCase(), {
        email: sub.email,
        name: sub.name || "",
        phone: sub.phone || "",
        type: "Newsletter Subscriber",
        source: sub.source || "footer_subscription",
        isActive: sub.isActive,
        createdAt: sub.createdAt,
        isCustomer: false,
      });
    });

    // 2. Process registered customers
    customers.forEach((cust) => {
      const lower = cust.email.toLowerCase();
      const defaultAddr = cust.addresses?.find((a) => a.isDefault) || cust.addresses?.[0];
      const phone = cust.phone || defaultAddr?.phone || "";
      const city = defaultAddr?.city || defaultAddr?.emirate || "";

      if (emailMap.has(lower)) {
        const item = emailMap.get(lower);
        item.name = item.name || cust.name;
        item.phone = item.phone || phone;
        item.city = city;
        item.type = "Customer & Subscriber";
        item.isCustomer = true;
      } else {
        emailMap.set(lower, {
          email: cust.email,
          name: cust.name || "",
          phone,
          city,
          type: "Registered Customer",
          source: "customer_account",
          isActive: cust.isActive !== false,
          createdAt: cust.createdAt,
          isCustomer: true,
        });
      }
    });

    const unifiedList = Array.from(emailMap.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      totalContacts: unifiedList.length,
      newsletterCount: subscribers.length,
      customerCount: customers.length,
      contacts: unifiedList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin manually create subscriber
// @route   POST /api/admin/newsletter
// @access  Private/Admin/Manager
const createSubscriber = async (req, res, next) => {
  try {
    const { email, name, phone, source } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await Newsletter.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: "This email is already in the subscriber list" });
    }

    const subscriber = await Newsletter.create({
      email: cleanEmail,
      name: name?.trim() || "",
      phone: phone?.trim() || "",
      source: source || "manual_admin",
      isActive: true,
    });

    const { logActivity } = require("../services/activityLogService");
    logActivity({
      req,
      action: "CREATE",
      module: "newsletter",
      resourceId: subscriber._id,
      resourceTitle: subscriber.email,
      description: `Added subscriber "${subscriber.email}"`,
    });

    res.status(201).json({ success: true, subscriber });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin update subscriber
// @route   PUT /api/admin/newsletter/:id
// @access  Private/Admin/Manager
const updateSubscriber = async (req, res, next) => {
  try {
    const { name, phone, isActive, source } = req.body;
    const subscriber = await Newsletter.findById(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ success: false, message: "Subscriber not found" });
    }

    if (name !== undefined) subscriber.name = name.trim();
    if (phone !== undefined) subscriber.phone = phone.trim();
    if (source !== undefined) subscriber.source = source;
    if (typeof isActive === "boolean") subscriber.isActive = isActive;

    await subscriber.save();
    res.json({ success: true, subscriber });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin delete subscriber
// @route   DELETE /api/admin/newsletter/:id
// @access  Private/Admin
const deleteSubscriber = async (req, res, next) => {
  try {
    const subscriber = await Newsletter.findById(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ success: false, message: "Subscriber not found" });
    }

    await subscriber.deleteOne();

    const { logActivity } = require("../services/activityLogService");
    logActivity({
      req,
      action: "DELETE",
      module: "newsletter",
      resourceId: subscriber._id,
      resourceTitle: subscriber.email,
      description: `Deleted subscriber "${subscriber.email}"`,
      status: "warning",
    });

    res.json({ success: true, message: "Subscriber removed successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  subscribeNewsletter,
  getAllSubscribers,
  getAllContactEmails,
  createSubscriber,
  updateSubscriber,
  deleteSubscriber,
};
