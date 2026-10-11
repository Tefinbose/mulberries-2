const Contact = require("../models/Contact");
const { sendContactInquiryNotification } = require("../services/emailService");

// @route POST /api/contacts
const createContact = async (req, res, next) => {
  try {
    const { name, company, phone, email, subject, message } = req.body;
    if (![name, phone, email, subject, message].every((value) => String(value || "").trim())) {
      return res.status(400).json({ success: false, message: "Please complete all required fields" });
    }

    const contact = await Contact.create({
      name: name.trim(),
      company: company ? company.trim() : "",
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      isRead: false,
    });

    // Send email notification to admin asynchronously
    sendContactInquiryNotification(contact).catch((err) => {
      console.error("Failed to send contact inquiry notification email:", err.message);
    });

    res.status(201).json({ success: true, message: "Your message has been sent", contact });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/admin/contacts
const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort("-createdAt");
    const unreadCount = await Contact.countDocuments({ isRead: { $ne: true } });
    res.json({ success: true, count: contacts.length, unreadCount, contacts });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/admin/notifications
const getNotifications = async (req, res, next) => {
  try {
    const unreadCount = await Contact.countDocuments({ isRead: { $ne: true } });
    const recentContacts = await Contact.find()
      .sort("-createdAt")
      .limit(30)
      .lean();

    const notifications = recentContacts.map((c) => ({
      _id: c._id,
      title: `${c.name} sent an inquiry`,
      subject: c.subject || "Customer Inquiry",
      sender: c.name,
      email: c.email,
      phone: c.phone,
      message: c.message,
      createdAt: c.createdAt,
      isRead: Boolean(c.isRead),
      type: "contact_inquiry",
    }));

    res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/admin/contacts/:id/read
const markContactAsRead = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!contact) return res.status(404).json({ success: false, message: "Contact message not found" });
    const unreadCount = await Contact.countDocuments({ isRead: { $ne: true } });
    res.json({ success: true, message: "Marked as read", contact, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/admin/contacts/mark-all-read
const markAllContactsAsRead = async (req, res, next) => {
  try {
    const updated = await Contact.updateMany({ isRead: { $ne: true } }, { isRead: true, readAt: new Date() });

    const { logActivity } = require("../services/activityLogService");
    logActivity({
      req,
      action: "BULK_ACTION",
      module: "contacts",
      description: `Marked all customer inquiries as read (${updated.modifiedCount} messages updated)`,
    });

    res.json({ success: true, message: "All inquiries marked as read", unreadCount: 0 });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/admin/contacts/:id
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: "Contact message not found" });
    const unreadCount = await Contact.countDocuments({ isRead: { $ne: true } });

    const { logActivity } = require("../services/activityLogService");
    logActivity({
      req,
      action: "DELETE",
      module: "contacts",
      resourceId: contact._id,
      resourceTitle: contact.name,
      description: `Deleted customer inquiry from "${contact.name}" (${contact.email})`,
      status: "warning",
    });

    res.json({ success: true, message: "Contact message deleted", unreadCount });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getNotifications,
  markContactAsRead,
  markAllContactsAsRead,
  deleteContact,
};
