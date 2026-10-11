const nodemailer = require("nodemailer");

/**
 * Creates and returns a Nodemailer transporter using environment variables.
 * Supports Gmail directly via App Passwords, or any custom SMTP server.
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER;
  // Automatically strip spaces if the user pastes Google's 16-character code as 'abcd efgh ijkl mnop'
  const pass = process.env.SMTP_PASS ? String(process.env.SMTP_PASS).replace(/\s+/g, "") : "";

  if (!user || !pass) {
    return null;
  }

  // When connecting to Gmail, nodemailer's built-in service configuration provides seamless delivery
  if (host.includes("gmail") || process.env.SMTP_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

/**
 * Core sendEmail helper.
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Subject line
 * @param {string} [options.html] - HTML body
 * @param {string} [options.text] - Plain text fallback
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn("⚠️ [emailService] SMTP not fully configured (missing SMTP_USER or SMTP_PASS). Email skipped.");
      return { success: false, skipped: true, message: "SMTP credentials not configured" };
    }

    const fromName = process.env.SMTP_FROM_NAME || "Mulberries Dubai";
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text: text || html?.replace(/<[^>]+>/g, " ") || "",
      html,
    });

    console.log(`✉️ [emailService] Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [emailService] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Helper to get active admin email address.
 */
const getAdminRecipient = () => {
  return process.env.ADMIN_EMAIL || process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
};

/**
 * Clean, pink and white email layout matching the frontend.
 * Uses soft blush pink wrapper (#fcf6fa), crisp white cards (#ffffff),
 * rich Mulberry berry-pink accents (#6b2160 / #7b1f6a), and soft rose borders (#f3d5ea).
 */
const renderEmailLayout = ({ title, preheader, bodyContent }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      <style>
        body { margin: 0; padding: 0; background-color: #fcf6fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2b1627; -webkit-font-smoothing: antialiased; }
        .wrapper { max-width: 580px; margin: 26px auto; background: #ffffff; border-radius: 16px; border: 1px solid #f3d5ea; overflow: hidden; box-shadow: 0 6px 24px rgba(107, 33, 96, 0.05); }
        .header { background: #ffffff; padding: 26px 20px 22px 20px; text-align: center; border-top: 5px solid #7b1f6a; border-bottom: 1px solid #f6e3f1; }
        .brand-title { color: #6b2160; font-size: 26px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin: 0; font-family: 'Playfair Display', Georgia, serif; }
        .brand-sub { color: #a0488d; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; margin-top: 5px; font-weight: 600; }
        .content { padding: 32px 26px; line-height: 1.6; }
        .footer { background: #fdf6fb; padding: 22px 20px; text-align: center; font-size: 12px; color: #7d5a75; border-top: 1px solid #f3d5ea; line-height: 1.6; }
        .cta-btn { display: inline-block; background: #7b1f6a; color: #ffffff !important; padding: 13px 32px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 13px; letter-spacing: 0.5px; margin: 18px 0; }
      </style>
    </head>
    <body>
      <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
        ${preheader || title}
      </div>
      <div class="wrapper">
        <div class="header">
          <div class="brand-title">MULBERRIES</div>
          <div class="brand-sub">Dubai &bull; Boutique &bull; Since 2013</div>
        </div>
        <div class="content">
          ${bodyContent}
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Mulberries Dubai, United Arab Emirates.<br/>
          Need help? Message our team on WhatsApp: <strong style="color: #7b1f6a;">+971 50 471 5912</strong>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send welcome email to a new newsletter subscriber.
 * Uses simple everyday English and pink-and-white theme.
 */
const sendNewsletterWelcome = async (email) => {
  const subject = "Welcome to Mulberries Dubai!";
  const bodyContent = `
    <h2 style="font-size: 21px; font-weight: 700; color: #6b2160; margin-top: 0;">Welcome to Mulberries!</h2>
    <p style="font-size: 14.5px; color: #3b2236; line-height: 1.6;">
      Thank you for joining our email list. You will now be the first to know about new dress arrivals, festival sales, and special offers.
    </p>
    
    <div style="background: #fdf6fb; border: 1px solid #f3d5ea; border-left: 4px solid #7b1f6a; padding: 16px; border-radius: 8px; margin: 22px 0; font-size: 13.5px; color: #2b1627;">
      <strong style="color: #6b2160;">Welcome Gift:</strong> Enjoy free fast delivery across the UAE on all orders above AED 299.
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${process.env.CLIENT_URL || "https://demo.mulberries.shop"}/shop" class="cta-btn">Start Shopping</a>
    </div>

    <p style="font-size: 13px; color: #7d5a75; margin-top: 20px;">
      Have questions or want styling advice? Message our Dubai boutique anytime on WhatsApp at <strong style="color: #7b1f6a;">+971 50 471 5912</strong>.
    </p>
  `;

  return sendEmail({
    to: email,
    subject,
    html: renderEmailLayout({ title: subject, preheader: "Thank you for joining Mulberries Dubai", bodyContent }),
  });
};

/**
 * Send welcome email to a newly registered user account.
 * Uses simple everyday English and pink-and-white theme.
 */
const sendUserWelcome = async (user) => {
  if (!user?.email) return;
  const subject = "Welcome to Mulberries Dubai — Your account is ready";
  const bodyContent = `
    <h2 style="font-size: 21px; font-weight: 700; color: #6b2160; margin-top: 0;">Welcome, ${user.name}!</h2>
    <p style="font-size: 14.5px; color: #3b2236; line-height: 1.6;">
      Thank you for creating an account with <strong>Mulberries Dubai</strong>.
    </p>
    
    <div style="background: #fdf6fb; border: 1px solid #f3d5ea; border-radius: 12px; padding: 18px 20px; margin: 22px 0;">
      <div style="color: #6b2160; font-weight: 700; font-size: 14px; margin-bottom: 8px;">What you can do with your account:</div>
      <table style="width: 100%; font-size: 13.5px; line-height: 1.8; color: #3b2236;">
        <tr><td style="width: 20px; color: #7b1f6a;">&bull;</td><td>Track all your orders easily</td></tr>
        <tr><td style="width: 20px; color: #7b1f6a;">&bull;</td><td>Save your favourite styles to your Wishlist</td></tr>
        <tr><td style="width: 20px; color: #7b1f6a;">&bull;</td><td>Faster checkout with your saved delivery address</td></tr>
        <tr><td style="width: 20px; color: #7b1f6a;">&bull;</td><td>Chat directly with our Dubai styling team</td></tr>
      </table>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${process.env.CLIENT_URL || "https://demo.mulberries.shop"}/shop" class="cta-btn">Explore Collections</a>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html: renderEmailLayout({ title: subject, preheader: `Welcome to Mulberries, ${user.name}`, bodyContent }),
  });
};

/**
 * Send order confirmation to customer and alert to admin.
 * Pink & white visual theme matching the website, simple English, and bulletproof HTML tables.
 */
const sendOrderConfirmation = async (order, user) => {
  const customerEmail = user?.email || order?.shippingAddress?.email;
  const orderNumber = order._id.toString().slice(-8).toUpperCase();
  const clientUrl = process.env.CLIENT_URL || "https://demo.mulberries.shop";
  const dashboardUrl = process.env.DASHBOARD_URL || "https://dashboard.mulberries.shop";

  // Build items rows
  const itemsHtml = (order.items || []).map((item) => `
    <tr>
      <td style="padding: 11px 8px; border-bottom: 1px solid #f6e3f1; vertical-align: top;">
        <div style="font-weight: 600; color: #2b1627; font-size: 14px;">${item.name}</div>
        ${item.color || item.size ? `<div style="font-size: 12px; color: #8e6586; margin-top: 3px;">${[item.color, item.size].filter(Boolean).join(" &bull; ")}</div>` : ""}
      </td>
      <td style="padding: 11px 8px; text-align: center; border-bottom: 1px solid #f6e3f1; color: #3b2236; font-size: 13.5px; vertical-align: top;">
        &times; ${item.quantity}
      </td>
      <td style="padding: 11px 8px; text-align: right; border-bottom: 1px solid #f6e3f1; font-weight: 600; color: #2b1627; font-size: 14px; vertical-align: top;">
        AED ${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join("");

  // Customer email
  if (customerEmail) {
    const customerSubject = `Order Confirmed #${orderNumber} — Mulberries Dubai`;
    const customerBody = `
      <div style="display: inline-block; background: #fdf2f8; border: 1px solid #fbcfe8; color: #831843; padding: 4px 12px; border-radius: 20px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
        &check; Order Confirmed
      </div>
      <h2 style="font-size: 21px; font-weight: 700; color: #6b2160; margin: 0 0 10px 0;">Thank you for your order!</h2>
      <p style="font-size: 14px; color: #3b2236; margin-top: 0; line-height: 1.6;">
        Hello <strong>${order.shippingAddress?.fullName || user?.name || "Customer"}</strong>, we have received your order <strong>#${orderNumber}</strong>. Our Dubai team is now getting your package ready for delivery.
      </p>
      
      <!-- Order Items Summary Box (Pink and White Theme) -->
      <div style="background: #fdf6fb; border: 1px solid #f3d5ea; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <div style="color: #6b2160; font-size: 14px; font-weight: 700; border-bottom: 1px solid #f3d5ea; padding-bottom: 8px; margin-bottom: 8px;">
          Items Ordered
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
          <thead>
            <tr style="color: #8e6586; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.5px;">
              <th style="text-align: left; padding: 6px 8px;">Item</th>
              <th style="text-align: center; padding: 6px 8px;">Qty</th>
              <th style="text-align: right; padding: 6px 8px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Totals Table (Pink & White aligned) -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 14px; border-top: 1px solid #f3d5ea; font-size: 13.5px; line-height: 1.6;">
          <tr>
            <td style="padding: 6px 8px 4px 8px; color: #7d5a75;">Subtotal:</td>
            <td style="padding: 6px 8px 4px 8px; text-align: right; font-weight: 600; color: #2b1627;">AED ${order.itemsPrice.toFixed(2)}</td>
          </tr>
          ${order.discount ? `
          <tr>
            <td style="padding: 4px 8px; color: #831843;">Discount ${order.couponCode ? `(${order.couponCode})` : ""}:</td>
            <td style="padding: 4px 8px; text-align: right; font-weight: 600; color: #831843;">- AED ${order.discount.toFixed(2)}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 4px 8px; color: #7d5a75;">Delivery Fee:</td>
            <td style="padding: 4px 8px; text-align: right; font-weight: 600; color: #2b1627;">${order.shippingPrice > 0 ? `AED ${order.shippingPrice.toFixed(2)}` : "Free"}</td>
          </tr>
          <tr>
            <td style="padding: 10px 8px 4px 8px; font-size: 16px; font-weight: 700; color: #6b2160; border-top: 1px dashed #e8bddf;">Total:</td>
            <td style="padding: 10px 8px 4px 8px; text-align: right; font-size: 17px; font-weight: 700; color: #6b2160; border-top: 1px dashed #e8bddf;">AED ${order.totalPrice.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <!-- Delivery Details Card (White with soft pink border) -->
      <div style="background: #ffffff; border: 1px solid #f3d5ea; border-radius: 12px; padding: 16px 18px; margin: 18px 0; font-size: 13.5px; line-height: 1.6;">
        <div style="color: #6b2160; font-weight: 700; margin-bottom: 6px;">Delivery Details:</div>
        <div><strong>Name:</strong> ${order.shippingAddress?.fullName}</div>
        <div><strong>Address:</strong> ${order.shippingAddress?.addressLine1}${order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}</div>
        <div><strong>City / Emirate:</strong> ${order.shippingAddress?.city}, ${order.shippingAddress?.emirate}, ${order.shippingAddress?.country || "UAE"}</div>
        <div><strong>Phone:</strong> ${order.shippingAddress?.phone}</div>
        <div style="margin-top: 6px;">
          <strong>Payment:</strong> ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Card"} (${order.isPaid ? "Paid" : "Pay at doorstep"})
        </div>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${clientUrl}/account" class="cta-btn">View My Orders</a>
      </div>
    `;

    try {
      const customerRes = await sendEmail({
        to: customerEmail,
        subject: customerSubject,
        html: renderEmailLayout({ title: customerSubject, preheader: `Order #${orderNumber} Confirmed`, bodyContent: customerBody }),
      });
      console.log(`[sendOrderConfirmation] Customer email result (${customerEmail}):`, customerRes);
    } catch (err) {
      console.error(`[sendOrderConfirmation] Customer email failed (${customerEmail}):`, err.message);
    }
  }

  // Admin alert email (Pink & white clean card)
  const adminEmail = getAdminRecipient();
  if (adminEmail) {
    const adminSubject = `New Order #${orderNumber} from ${order.shippingAddress?.fullName || user?.name} (AED ${order.totalPrice.toFixed(2)})`;
    const adminBody = `
      <div style="font-family: sans-serif; max-width: 580px; margin: auto; padding: 22px; border: 1px solid #f3d5ea; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #6b2160; margin-top: 0; font-size: 19px;">New Order Received!</h2>
        <table style="width: 100%; font-size: 13.5px; line-height: 1.8;">
          <tr><td style="width: 120px; font-weight: bold; color: #6b2160;">Order ID:</td><td>#${orderNumber}</td></tr>
          <tr><td style="font-weight: bold; color: #6b2160;">Customer:</td><td>${order.shippingAddress?.fullName || user?.name} (${customerEmail || "No email"})</td></tr>
          <tr><td style="font-weight: bold; color: #6b2160;">Phone:</td><td>${order.shippingAddress?.phone || "—"}</td></tr>
          <tr><td style="font-weight: bold; color: #6b2160;">Total:</td><td><strong>AED ${order.totalPrice.toFixed(2)}</strong></td></tr>
          <tr><td style="font-weight: bold; color: #6b2160;">Payment:</td><td>${order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Card"} (${order.isPaid ? "Paid" : "Pending"})</td></tr>
          <tr><td style="font-weight: bold; color: #6b2160;">Emirate:</td><td>${order.shippingAddress?.emirate || order.shippingAddress?.city}</td></tr>
        </table>
        <div style="margin-top: 22px; text-align: center;">
          <a href="${dashboardUrl}/orders" style="background: #7b1f6a; color: #ffffff; padding: 11px 24px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: 600;">Open in Admin Dashboard</a>
        </div>
      </div>
    `;

    try {
      const adminRes = await sendEmail({
        to: adminEmail,
        subject: adminSubject,
        html: adminBody,
      });
      console.log(`[sendOrderConfirmation] Admin email result (${adminEmail}):`, adminRes);
    } catch (err) {
      console.error(`[sendOrderConfirmation] Admin email failed (${adminEmail}):`, err.message);
    }
  }
};

/**
 * Send notification to customer and admin when order status is updated.
 * Uses simple words and pink-and-white styling.
 */
const sendOrderStatusUpdate = async (order, user, newStatus) => {
  let customerEmail = user?.email;
  let customerName = user?.name || order.shippingAddress?.fullName || "Customer";

  // Fallback database lookup if user is not populated
  if (!customerEmail && order?.user) {
    try {
      const User = require("../models/User");
      const fetchedUser = await User.findById(order.user).select("name email");
      if (fetchedUser) {
        customerEmail = fetchedUser.email;
        if (!customerName || customerName === "Customer") customerName = fetchedUser.name;
      }
    } catch (e) {
      console.warn("[sendOrderStatusUpdate] User lookup fallback failed:", e.message);
    }
  }

  if (!customerEmail && order?.shippingAddress?.email) {
    customerEmail = order.shippingAddress.email;
  }

  const orderNumber = order._id.toString().slice(-8).toUpperCase();
  const clientUrl = process.env.CLIENT_URL || "https://demo.mulberries.shop";
  const dashboardUrl = process.env.DASHBOARD_URL || "https://dashboard.mulberries.shop";

  // Simple, everyday English explanations for every status
  const statusConfigs = {
    processing: {
      label: "Preparing Your Order",
      color: "#7b1f6a",
      bgColor: "#fdf2f8",
      borderColor: "#fbcfe8",
      headline: "We are preparing your items",
      message: "Our team in Dubai is now carefully packing your order for delivery.",
    },
    shipped: {
      label: "Order Shipped",
      color: "#1e40af",
      bgColor: "#eff6ff",
      borderColor: "#bfdbfe",
      headline: "Your order is on the way!",
      message: "Good news! Your package has been handed to our delivery courier. The driver will contact you before arriving at your address.",
    },
    delivered: {
      label: "Delivered",
      color: "#166534",
      bgColor: "#f0fdf4",
      borderColor: "#bbf7d0",
      headline: "Your order has arrived!",
      message: "Your package has been successfully delivered. We hope you love your new items!",
    },
    cancelled: {
      label: "Order Cancelled",
      color: "#be185d",
      bgColor: "#fff1f2",
      borderColor: "#fecdd3",
      headline: "Your order has been cancelled",
      message: "This order has been cancelled. If you paid online by card, your refund will go back to your card within 3 to 5 business days. If you have questions, please message us on WhatsApp.",
    },
  };

  const currentConfig = statusConfigs[newStatus] || {
    label: newStatus.toUpperCase(),
    color: "#7b1f6a",
    bgColor: "#fdf6fb",
    borderColor: "#f3d5ea",
    headline: `Your order status: ${newStatus}`,
    message: `Your order status has been updated to ${newStatus}.`,
  };

  const results = {};

  // 1. Send status update to Customer
  if (customerEmail) {
    const isCancelled = newStatus === "cancelled";
    const subject = `Order #${orderNumber} ${isCancelled ? "Cancelled" : "Update: " + currentConfig.label} — Mulberries Dubai`;
    const bodyContent = `
      <div style="display: inline-block; background: ${currentConfig.bgColor}; border: 1px solid ${currentConfig.borderColor}; color: ${currentConfig.color}; padding: 4px 12px; border-radius: 20px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
        ${currentConfig.label}
      </div>
      <h2 style="font-size: 21px; font-weight: 700; color: #2b1627; margin: 0 0 10px 0;">
        ${currentConfig.headline}
      </h2>
      <p style="font-size: 14.5px; color: #3b2236; line-height: 1.6; margin-top: 0;">
        Hello <strong>${customerName}</strong>,
      </p>
      
      <div style="background: ${currentConfig.bgColor}; border: 1px solid ${currentConfig.borderColor}; border-radius: 12px; padding: 18px 20px; margin: 18px 0;">
        <p style="margin: 0; font-size: 14px; color: #2b1627; line-height: 1.6;">
          ${currentConfig.message}
        </p>
      </div>

      <!-- Quick Summary Table (Pink and White Theme) -->
      <div style="background: #fdf6fb; border: 1px solid #f3d5ea; border-radius: 12px; padding: 16px 18px; margin: 18px 0; font-size: 13.5px;">
        <table style="width: 100%; border-collapse: collapse; line-height: 1.7;">
          <tr>
            <td style="color: #7d5a75;">Order Number:</td>
            <td style="text-align: right; font-weight: 700; color: #6b2160;">#${orderNumber}</td>
          </tr>
          <tr>
            <td style="color: #7d5a75;">Total Amount:</td>
            <td style="text-align: right; font-weight: 700; color: #2b1627;">AED ${Number(order.totalPrice || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="color: #7d5a75;">Delivery To:</td>
            <td style="text-align: right; color: #2b1627;">${order.shippingAddress?.city || ""}, ${order.shippingAddress?.emirate || ""}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${clientUrl}/account" class="cta-btn">View Order Details</a>
      </div>
    `;

    try {
      results.customer = await sendEmail({
        to: customerEmail,
        subject,
        html: renderEmailLayout({ title: subject, preheader: `Order #${orderNumber}: ${currentConfig.label}`, bodyContent }),
      });
      console.log(`[sendOrderStatusUpdate] Customer status email sent to ${customerEmail}:`, results.customer);
    } catch (err) {
      console.error(`[sendOrderStatusUpdate] Failed customer status email to ${customerEmail}:`, err.message);
    }
  }

  // 2. Send status change alert to Admin
  const adminEmail = getAdminRecipient();
  if (adminEmail) {
    const adminSubject = `Order #${orderNumber} marked as ${currentConfig.label.toUpperCase()} (${customerName})`;
    const adminBody = `
      <div style="font-family: sans-serif; max-width: 580px; margin: auto; padding: 22px; border: 1px solid #f3d5ea; border-radius: 12px; background: #ffffff;">
        <h2 style="color: ${currentConfig.color}; margin-top: 0; font-size: 19px;">Order Status Changed: ${currentConfig.label}</h2>
        <table style="width: 100%; font-size: 13.5px; line-height: 1.8; margin: 14px 0;">
          <tr><td style="width: 120px; font-weight: bold; color: #6b2160;">Order ID:</td><td>#${orderNumber}</td></tr>
          <tr><td style="font-weight: bold; color: #6b2160;">Customer:</td><td>${customerName} (${customerEmail || "No email"})</td></tr>
          <tr><td style="font-weight: bold; color: #6b2160;">Total:</td><td><strong>AED ${Number(order.totalPrice || 0).toFixed(2)}</strong></td></tr>
          <tr><td style="font-weight: bold; color: #6b2160;">Status:</td><td><strong style="color: ${currentConfig.color};">${currentConfig.label}</strong></td></tr>
        </table>
        <div style="margin-top: 22px; text-align: center;">
          <a href="${dashboardUrl}/orders" style="background: #7b1f6a; color: #ffffff; padding: 11px 24px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: 600;">Open Orders Dashboard</a>
        </div>
      </div>
    `;

    try {
      results.admin = await sendEmail({
        to: adminEmail,
        subject: adminSubject,
        html: adminBody,
      });
      console.log(`[sendOrderStatusUpdate] Admin status alert sent to ${adminEmail}:`, results.admin);
    } catch (err) {
      console.error(`[sendOrderStatusUpdate] Failed admin status alert to ${adminEmail}:`, err.message);
    }
  }

  return results;
};

/**
 * Send notification to admin when a customer submits a contact inquiry.
 * Uses simple everyday English and pink-and-white theme.
 */
const sendContactInquiryNotification = async (contact) => {
  const adminEmail = getAdminRecipient();
  if (!adminEmail) return;

  const subject = `New Customer Message: ${contact.subject || "From " + contact.name}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 580px; margin: auto; padding: 22px; border: 1px solid #f3d5ea; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #6b2160; margin-top: 0; font-size: 19px;">New Customer Message Received</h2>
      <p style="font-size: 13.5px; color: #3b2236; margin-top: 0;">A customer sent a message via the website contact form:</p>
      
      <table style="width: 100%; font-size: 13.5px; line-height: 1.8; margin: 14px 0;">
        <tr><td style="width: 100px; font-weight: bold; color: #6b2160;">Name:</td><td>${contact.name}</td></tr>
        <tr><td style="font-weight: bold; color: #6b2160;">Email:</td><td><a href="mailto:${contact.email}" style="color: #7b1f6a;">${contact.email}</a></td></tr>
        <tr><td style="font-weight: bold; color: #6b2160;">Phone:</td><td>${contact.phone || "—"}</td></tr>
        <tr><td style="font-weight: bold; color: #6b2160;">Subject:</td><td>${contact.subject}</td></tr>
      </table>

      <div style="background: #fdf6fb; border: 1px solid #f3d5ea; padding: 14px 16px; border-radius: 8px; font-size: 13.5px; color: #2b1627; white-space: pre-wrap; line-height: 1.5;">
        ${contact.message}
      </div>

      <div style="margin-top: 22px; text-align: center;">
        <a href="${process.env.DASHBOARD_URL || "https://dashboard.mulberries.shop"}/contacts" style="background: #7b1f6a; color: #ffffff; padding: 11px 22px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: 600;">View in Admin Dashboard</a>
      </div>
    </div>
  `;

  return sendEmail({ to: adminEmail, subject, html });
};

module.exports = {
  sendEmail,
  sendNewsletterWelcome,
  sendUserWelcome,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendContactInquiryNotification,
};

