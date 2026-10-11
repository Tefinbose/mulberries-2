import { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Dropdown, Button, Drawer, Badge, Popover, Empty, Spin, Tag } from "antd";
import {
  BarChartOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  MailOutlined,
  TagOutlined,
  LayoutOutlined,
  LineChartOutlined,
  DatabaseOutlined,
  DownOutlined,
  MenuOutlined,
  CloseOutlined,
  CalendarOutlined,
  SendOutlined,
  BellOutlined,
  CheckOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

const { Header, Sider, Content } = Layout;

const roleBadge = {
  admin: { label: "Super Admin", color: "#5c1a52", bg: "#fcf3fa", border: "#ebdcd0" },
  manager: { label: "Manager", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  staff: { label: "Staff", color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
};

const routeTitles = {
  "/": "Executive Dashboard",
  "/categories": "Collection Categories",
  "/products": "Product Catalog",
  "/orders": "Customer Orders",
  "/activity-logs": "Operation History & Staff Performance",
  "/coupons": "Promotional Coupons",
  "/homepage": "Homepage Sections",
  "/inventory": "Warehouse Inventory",
  "/sales": "Sales & Revenue Analytics",
  "/staff": "Staff & Permissions",
  "/users": "Client Accounts",
  "/newsletter": "Newsletter Subscribers",
  "/contacts": "Contact Enquiries",
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, can } = useAuth();
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotification();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [fullDateStr, setFullDateStr] = useState("");
  const [shortDateStr, setShortDateStr] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setFullDateStr(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      );
      setShortDateStr(
        now.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString("en-AE", { month: "short", day: "numeric" });
  };

  const notificationPopoverContent = (
    <div style={{ width: 340, maxWidth: "calc(100vw - 24px)", margin: "-12px -16px" }}>
      {/* Popover Header */}
      <div
        style={{
          padding: "13px 16px 11px",
          borderBottom: "1px solid #ebdcd0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#faf6f2",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 14.5, color: "#240821" }}>
            Contact Enquiries
          </span>
          {unreadCount > 0 ? (
            <Tag
              style={{
                background: "#5c1a52",
                color: "#f5d796",
                borderColor: "transparent",
                fontWeight: 700,
                fontSize: 10.5,
                borderRadius: 12,
                padding: "0 7px",
                lineHeight: "18px",
              }}
            >
              {unreadCount} New
            </Tag>
          ) : (
            <span style={{ fontSize: 11, color: "#8c7766", fontWeight: 500 }}>All read</span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined style={{ fontSize: 11 }} />}
            onClick={() => markAllAsRead()}
            style={{ color: "#5c1a52", fontSize: 11, padding: 0, fontWeight: 600, height: "auto" }}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Popover Body */}
      <div style={{ maxHeight: 330, overflowY: "auto", padding: "4px 0" }}>
        {notificationsLoading ? (
          <div style={{ padding: "30px 0", textAlign: "center" }}>
            <Spin size="small" />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span style={{ color: "#8c7766", fontSize: 12 }}>No customer inquiries yet</span>}
            style={{ padding: "20px 0", margin: 0 }}
          />
        ) : (
          notifications.map((item) => (
            <div
              key={item._id}
              className="notification-item-hover"
              onClick={() => {
                if (!item.isRead) markAsRead(item._id);
                setNotificationOpen(false);
                navigate("/contacts");
              }}
              style={{
                padding: "10px 16px",
                display: "flex",
                gap: 11,
                alignItems: "flex-start",
                cursor: "pointer",
                borderBottom: "1px solid #f6eee8",
                background: !item.isRead ? "#fdfbf8" : "#ffffff",
                transition: "background 0.2s ease",
              }}
            >
              <Avatar
                size={32}
                style={{
                  backgroundColor: !item.isRead ? "#5c1a52" : "#ebdcd0",
                  color: !item.isRead ? "#f5d796" : "#735e4d",
                  fontWeight: 700,
                  fontSize: 12,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {item.sender ? item.sender[0].toUpperCase() : "U"}
              </Avatar>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: !item.isRead ? 700 : 600,
                      color: "#240821",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.sender}
                  </span>
                  <span style={{ fontSize: 10, color: "#8c7766", flexShrink: 0 }}>
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 11,
                    fontWeight: !item.isRead ? 600 : 500,
                    color: "#5c1a52",
                    marginTop: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.subject || "Customer Inquiry"}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: "#735e4d",
                    marginTop: 2,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.35,
                  }}
                >
                  {item.message}
                </div>
              </div>

              {!item.isRead && (
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#c49a45",
                    boxShadow: "0 0 0 2px rgba(196, 154, 69, 0.3)",
                    flexShrink: 0,
                    marginTop: 6,
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Popover Footer */}
      <div
        style={{
          padding: "9px 16px",
          borderTop: "1px solid #ebdcd0",
          textAlign: "center",
          background: "#faf6f2",
        }}
      >
        <Button
          type="link"
          size="small"
          onClick={() => {
            setNotificationOpen(false);
            navigate("/contacts");
          }}
          style={{
            color: "#5c1a52",
            fontWeight: 700,
            fontSize: 11.5,
            padding: 0,
            height: "auto",
          }}
        >
          View all contact enquiries &rarr;
        </Button>
      </div>
    </div>
  );

  // Menu items with classic icons (no AI or gauge symbols)
  const allMenuItems = [
    { key: "/", icon: <BarChartOutlined style={{ fontSize: 17 }} />, label: "Dashboard", permission: "reports" },
    { key: "/categories", icon: <AppstoreOutlined style={{ fontSize: 17 }} />, label: "Categories", permission: "categories" },
    { key: "/products", icon: <ShoppingOutlined style={{ fontSize: 17 }} />, label: "Products", permission: "products" },
    { key: "/orders", icon: <ShoppingCartOutlined style={{ fontSize: 17 }} />, label: "Orders", permission: "orders" },
    { key: "/coupons", icon: <TagOutlined style={{ fontSize: 17 }} />, label: "Coupons", permission: "orders" },
    { key: "/inventory", icon: <DatabaseOutlined style={{ fontSize: 17 }} />, label: "Inventory", permission: "products" },
    { key: "/sales", icon: <LineChartOutlined style={{ fontSize: 17 }} />, label: "Sales Analytics", permission: "reports" },
    { key: "/activity-logs", icon: <HistoryOutlined style={{ fontSize: 17 }} />, label: "Operation History", permission: "staff" },
    { key: "/homepage", icon: <LayoutOutlined style={{ fontSize: 17 }} />, label: "Homepage Sections", adminOnly: true },
    { key: "/staff", icon: <TeamOutlined style={{ fontSize: 17 }} />, label: "Staff Members", adminOnly: true },
    { key: "/users", icon: <UserOutlined style={{ fontSize: 17 }} />, label: "Customers", adminOnly: true },
    { key: "/newsletter", icon: <SendOutlined style={{ fontSize: 17 }} />, label: "Newsletter", adminOnly: true },
    {
      key: "/contacts",
      icon: (
        <Badge dot={unreadCount > 0} offset={[-1, 1]} styles={{ indicator: { backgroundColor: "#c49a45" } }}>
          <MailOutlined style={{ fontSize: 17 }} />
        </Badge>
      ),
      label: (
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", paddingRight: 4 }}>
          <span>Contact Enquiries</span>
          {unreadCount > 0 && (
            <span
              style={{
                background: "#c49a45",
                color: "#240821",
                fontSize: 10,
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: 10,
                lineHeight: 1.4,
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </span>
      ),
    },
  ];

  const menuItems = allMenuItems
    .filter((item) => (item.adminOnly ? isAdmin : item.permission ? can(item.permission) : true))
    .map(({ adminOnly, permission, ...item }) => item);

  const currentRole = roleBadge[user?.role] || {
    label: user?.role || "Staff",
    color: "#5c1a52",
    bg: "#fcf3fa",
    border: "#ebdcd0",
  };

  const userMenu = {
    items: [
      {
        key: "info",
        disabled: true,
        label: (
          <div style={{ padding: "4px 0" }}>
            <div style={{ fontWeight: 700, color: "#240821" }}>{user?.name || "Administrator"}</div>
            <div style={{ fontSize: 11, color: "#8c7766" }}>{user?.email}</div>
          </div>
        ),
      },
      { type: "divider" },
      {
        key: "logout",
        icon: <LogoutOutlined style={{ color: "#b91c1c" }} />,
        danger: true,
        label: "Sign Out",
        onClick: () => {
          logout();
          navigate("/login");
        },
      },
    ],
  };

  const pageTitle = routeTitles[location.pathname] || "Admin Portal";

  return (
    <Layout hasSider style={{ minHeight: "100vh", background: "#faf6f2" }}>
      {/* ── Sticky Luxury Desktop Sidebar ── */}
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        width={250}
        trigger={null}
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          height: "100vh",
          overflowY: "auto",
          zIndex: 100,
          background: "#2a0c27",
          borderRight: "1px solid rgba(235, 220, 208, 0.15)",
          boxShadow: "4px 0 20px rgba(0, 0, 0, 0.12)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Sleek Integrated Brand Header */}
          <Link
            to="/"
            style={{
              padding: "20px 18px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderBottom: "1px solid rgba(235, 220, 208, 0.12)",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 4,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                border: "1px solid rgba(235, 220, 208, 0.5)",
                flexShrink: 0,
              }}
            >
              <img
                src="/MULBERRIES.png"
                alt="Mulberries"
                style={{ height: 26, width: "auto", objectFit: "contain" }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "0.02em",
                  lineHeight: 1.2,
                }}
              >
                Mulberries
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#f5d796",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginTop: 2,
                }}
              >
                Executive Portal
              </div>
            </div>
          </Link>

          {/* Navigation Menu */}
          <div style={{ padding: "12px 0", flex: 1 }}>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
              style={{
                fontSize: 13,
                fontWeight: 500,
                background: "transparent",
                border: "none",
              }}
            />
          </div>
        </div>
      </Sider>

      {/* ── Mobile Navigation Drawer ── */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 3,
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                flexShrink: 0,
              }}
            >
              <img
                src="/MULBERRIES.png"
                alt="Mulberries"
                style={{ height: 20, width: "auto", objectFit: "contain" }}
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1.2,
                }}
              >
                Mulberries
              </div>
              <div
                style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  color: "#f5d796",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Executive Menu
              </div>
            </div>
          </div>
        }
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{
          header: {
            background: "#2a0c27",
            borderBottom: "1px solid rgba(235, 220, 208, 0.15)",
            padding: "16px 18px",
          },
          body: {
            background: "#2a0c27",
            padding: "10px 0",
          },
        }}
        closeIcon={<CloseOutlined style={{ color: "#f5d796", fontSize: 16 }} />}
        size={270}
      >
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => {
            navigate(key);
            setMobileMenuOpen(false);
          }}
          style={{
            fontSize: 13.5,
            fontWeight: 500,
            background: "transparent",
            border: "none",
          }}
        />
      </Drawer>

      {/* ── Main Scrollable Canvas ── */}
      <Layout style={{ minHeight: "100vh", background: "#faf6f2", minWidth: 0 }}>
        
        {/* ── Sticky Executive Navbar (Mobile Enhanced) ── */}
        <Header
          className="admin-header"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 90,
            height: 64,
            lineHeight: "normal",
            background: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #ebdcd0",
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 10px rgba(92, 26, 82, 0.03)",
          }}
        >
          {/* Navbar Left: Mobile Hamburger & Page Title (Storefront and Atelier removed) */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
            {/* Mobile Drawer Trigger Button */}
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 18, color: "#5c1a52" }} />}
              onClick={() => setMobileMenuOpen(true)}
              className="admin-mobile-toggle"
              aria-label="Toggle menu"
              style={{
                width: 36,
                height: 36,
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                background: "#faf6f2",
                border: "1px solid #ebdcd0",
                padding: 0,
                flexShrink: 0,
              }}
            />

            <h1
              className="admin-header-title"
              style={{
                margin: 0,
                fontSize: 18,
                fontFamily: "Georgia, serif",
                color: "#240821",
                fontWeight: 700,
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: "normal",
              }}
            >
              {pageTitle}
            </h1>
          </div>

          {/* Navbar Right: Polished Date Badge & User Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {/* Polished, Admin-Friendly Date Badge */}
            {fullDateStr && (
              <div
                className="admin-date-badge"
                style={{
                  fontSize: 12,
                  color: "#5c1a52",
                  background: "#ffffff",
                  height: 32,
                  lineHeight: "30px",
                  padding: "0 12px",
                  borderRadius: 20,
                  border: "1px solid #ebdcd0",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                  boxSizing: "border-box",
                  boxShadow: "0 1px 4px rgba(92, 26, 82, 0.04)",
                  verticalAlign: "middle",
                }}
              >
                <CalendarOutlined style={{ color: "#c49a45", fontSize: 13 }} />
                <span className="full-date" style={{ lineHeight: "normal" }}>{fullDateStr}</span>
                <span className="short-date" style={{ lineHeight: "normal" }}>{shortDateStr}</span>
              </div>
            )}

            {/* Dynamic Notification Bell with Luxury Popover */}
            <Popover
              content={notificationPopoverContent}
              trigger="click"
              placement="bottomRight"
              open={notificationOpen}
              onOpenChange={(open) => {
                setNotificationOpen(open);
                if (open) fetchNotifications(true);
              }}
              arrow={{ pointAtCenter: true }}
            >
              <button
                type="button"
                aria-label={`Inquiries notifications (${unreadCount} unread)`}
                style={{
                  position: "relative",
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: unreadCount > 0 ? "#fdfbf8" : "#ffffff",
                  border: unreadCount > 0 ? "1px solid #c49a45" : "1px solid #ebdcd0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.2s ease",
                  boxShadow: unreadCount > 0 ? "0 2px 8px rgba(92, 26, 82, 0.12)" : "0 1px 4px rgba(92, 26, 82, 0.04)",
                  animation: unreadCount > 0 ? "notificationGlow 2.5s infinite" : "none",
                }}
              >
                <Badge
                  count={unreadCount}
                  overflowCount={99}
                  offset={[3, -3]}
                  styles={{
                    root: { display: "flex", alignItems: "center", justifyContent: "center" },
                    indicator: {
                      backgroundColor: "#5c1a52",
                      color: "#f5d796",
                      fontSize: 9.5,
                      fontWeight: 700,
                      boxShadow: "0 0 0 2px #ffffff",
                    },
                  }}
                >
                  <BellOutlined
                    style={{
                      fontSize: 16,
                      color: unreadCount > 0 ? "#5c1a52" : "#735e4d",
                      transition: "color 0.2s",
                    }}
                  />
                </Badge>
              </button>
            </Popover>

            {/* User Profile Capsule */}
            <Dropdown menu={userMenu} placement="bottomRight" trigger={["click"]}>
              <div
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 10px 4px 6px",
                  borderRadius: 24,
                  border: "1px solid #ebdcd0",
                  background: "#ffffff",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
              >
                <Avatar
                  style={{
                    backgroundColor: "#5c1a52",
                    color: "#f5d796",
                    fontWeight: 700,
                    fontSize: 13,
                    width: 30,
                    height: 30,
                    lineHeight: "30px",
                    flexShrink: 0,
                  }}
                >
                  {user?.name ? user.name[0].toUpperCase() : "A"}
                </Avatar>
                <div className="admin-profile-meta" style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#240821" }}>
                    {user?.name?.split(" ")[0] || "Admin"}
                  </span>
                  <span style={{ fontSize: 10, color: currentRole.color, fontWeight: 600 }}>
                    {currentRole.label}
                  </span>
                </div>
                <DownOutlined style={{ fontSize: 10, color: "#8c7766", marginLeft: 2 }} />
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* ── Scrollable Page Content Container ── */}
        <Content
          className="admin-content"
          style={{
            padding: "24px 28px 48px",
            minHeight: "calc(100vh - 64px)",
            maxWidth: 1500,
            width: "100%",
            margin: "0 auto",
            position: "relative",
          }}
        >
          {/* Subtle Ambient Radial Lighting */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: 1200,
              height: 300,
              background: "radial-gradient(ellipse at top, rgba(92, 26, 82, 0.04), transparent 70%)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <Outlet />
          </div>
        </Content>

      </Layout>
    </Layout>
  );
};

export default AdminLayout;
