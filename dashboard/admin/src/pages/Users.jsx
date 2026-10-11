import { useEffect, useState, useMemo } from "react";
import {
  Table,
  Switch,
  Select,
  message,
  Card,
  Tag,
  Button,
  Input,
  Space,
  Row,
  Col,
  Tooltip,
  Avatar,
  Modal,
  Descriptions,
  Popconfirm,
} from "antd";
import {
  LuCrown,
  LuTrophy,
  LuAward,
  LuSparkles,
  LuShoppingBag,
  LuSearch,
  LuFilter,
  LuArrowUpDown,
  LuDownload,
  LuRotateCw,
  LuMail,
  LuPhone,
  LuMapPin,
  LuUsers,
  LuEye,
  LuTrash2,
  LuUserCheck,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa6";
import api from "../api/axios";

const PRIMARY = "#5c1a52";
const BORDER = "#ebdcd0";
const GOLD = "#c49a45";

const formatDateSafe = (dateVal, includeTime = false) => {
  if (!dateVal) return "—";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "—";
    if (includeTime) {
      return d.toLocaleString("en-AE", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString("en-AE", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("all"); // 'all' | 'vip' | 'repeat' | 'single' | 'none'
  const [sortBy, setSortBy] = useState("most-orders"); // 'most-orders' | 'highest-spend' | 'newest' | 'oldest'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    // Fetch customer directory with enriched order metrics
    api
      .get("/admin/customers")
      .then(({ data }) => setUsers(data.customers || data.users || []))
      .catch(() => {
        // Fallback to /admin/users if customers endpoint is inaccessible
        return api.get("/admin/users").then(({ data }) => setUsers(data.users || []));
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchUsers, []);

  const updateUser = async (id, payload) => {
    try {
      await api.put(`/admin/users/${id}`, payload);
      message.success("Customer status updated successfully");
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to update customer status");
    }
  };

  const handleDeleteCustomer = async (id, name) => {
    try {
      await api.delete(`/admin/customers/${id}`);
      message.success(`Customer "${name || "record"}" deleted successfully`);
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to delete customer");
    }
  };

  // ── Top Customers Ranked by Orders ────────────────────────
  const topCustomers = useMemo(() => {
    return [...users]
      .filter((u) => (u.orderCount || 0) > 0)
      .sort((a, b) => {
        const countDiff = (b.orderCount || 0) - (a.orderCount || 0);
        if (countDiff !== 0) return countDiff;
        return (b.totalSpent || 0) - (a.totalSpent || 0);
      })
      .slice(0, 3);
  }, [users]);

  // ── Filter & Sort Logic ────────────────────────────────────
  const filteredUsers = useMemo(() => {
    const list = users.filter((u) => {
      // Search text filter
      const q = searchText.trim().toLowerCase();
      const matchSearch =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        (u.city && u.city.toLowerCase().includes(q));

      // Status filter
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? u.isActive !== false
          : u.isActive === false;

      // Order count filter
      const orders = u.orderCount || 0;
      let matchOrders = true;
      if (orderFilter === "vip") {
        matchOrders = orders >= 5;
      } else if (orderFilter === "repeat") {
        matchOrders = orders >= 2 && orders <= 4;
      } else if (orderFilter === "single") {
        matchOrders = orders === 1;
      } else if (orderFilter === "none") {
        matchOrders = orders === 0;
      }

      return matchSearch && matchStatus && matchOrders;
    });

    // Sort order
    return list.sort((a, b) => {
      if (sortBy === "most-orders") {
        const orderDiff = (b.orderCount || 0) - (a.orderCount || 0);
        if (orderDiff !== 0) return orderDiff;
        return (b.totalSpent || 0) - (a.totalSpent || 0);
      }
      if (sortBy === "highest-spend") {
        return (b.totalSpent || 0) - (a.totalSpent || 0);
      }
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return 0;
    });
  }, [users, searchText, statusFilter, orderFilter, sortBy]);

  // ── Aggregate Metrics ──────────────────────────────────────
  const activeCount = users.filter((u) => u.isActive !== false).length;
  const vipCount = users.filter((u) => (u.orderCount || 0) >= 5).length;
  const repeatCount = users.filter((u) => (u.orderCount || 0) >= 2).length;
  const totalOrdersPlaced = users.reduce((sum, u) => sum + (u.orderCount || 0), 0);
  const totalCustomerRevenue = users.reduce((sum, u) => sum + (u.totalSpent || 0), 0);

  // ── CSV Export Function ────────────────────────────────────
  const exportCustomersCSV = () => {
    const listToExport = filteredUsers.length > 0 ? filteredUsers : users;

    if (!listToExport.length) {
      message.warning("No customer records available to export");
      return;
    }

    const headers = [
      "Customer ID",
      "Full Name",
      "Email Address",
      "Phone Number",
      "City / Location",
      "Full Address",
      "Total Orders Placed",
      "Customer Loyalty Tier",
      "Total Spent (AED)",
      "Account Status",
      "Registration Date",
      "Last Order Date",
    ];

    const getTierLabel = (count) => {
      if (count >= 5) return "VIP Platinum (5+ orders)";
      if (count >= 3) return "Gold Patron (3-4 orders)";
      if (count >= 2) return "Repeat Buyer (2 orders)";
      if (count === 1) return "First-Time Buyer (1 order)";
      return "New Member (0 orders)";
    };

    const rows = listToExport.map((u) => [
      `"${u._id || ""}"`,
      `"${(u.name || "").replace(/"/g, '""')}"`,
      `"${(u.email || "").replace(/"/g, '""')}"`,
      `"${(u.phone || "").replace(/"/g, '""')}"`,
      `"${(u.city || "").replace(/"/g, '""')}"`,
      `"${(u.addressSummary || "").replace(/"/g, '""')}"`,
      u.orderCount || 0,
      `"${getTierLabel(u.orderCount || 0)}"`,
      u.totalSpent || 0,
      u.isActive !== false ? "Active" : "Inactive",
      u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : "",
      u.lastOrderDate ? new Date(u.lastOrderDate).toISOString().split("T")[0] : "No orders yet",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const today = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `mulberries-customers-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success(`Successfully exported ${listToExport.length} customer records to CSV`);
  };

  // Helper for Loyalty Tier Badge
  const renderTierBadge = (count) => {
    if (count >= 5) {
      return (
        <Tag
          style={{
            background: PRIMARY,
            color: "#f5d796",
            border: "1px solid #7b1f6a",
            fontWeight: 700,
            fontSize: 10.5,
            borderRadius: 12,
            padding: "2px 8px",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <LuCrown size={12} style={{ color: "#f5d796" }} /> VIP Platinum
        </Tag>
      );
    }
    if (count >= 3) {
      return (
        <Tag
          style={{
            background: "#fffbeb",
            color: "#b45309",
            border: "1px solid #fde68a",
            fontWeight: 700,
            fontSize: 10.5,
            borderRadius: 12,
            padding: "2px 8px",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <LuAward size={12} style={{ color: "#d97706" }} /> Gold Patron
        </Tag>
      );
    }
    if (count >= 2) {
      return (
        <Tag
          style={{
            background: "#f0f9ff",
            color: "#0369a1",
            border: "1px solid #bae6fd",
            fontWeight: 700,
            fontSize: 10.5,
            borderRadius: 12,
            padding: "2px 8px",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <LuSparkles size={12} style={{ color: "#0284c7" }} /> Repeat Buyer
        </Tag>
      );
    }
    if (count === 1) {
      return (
        <Tag
          style={{
            background: "#f0fdf4",
            color: "#15803d",
            border: "1px solid #bbf7d0",
            fontWeight: 600,
            fontSize: 10.5,
            borderRadius: 12,
            padding: "2px 8px",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <LuShoppingBag size={11} style={{ color: "#16a34a" }} /> First Order
        </Tag>
      );
    }
    return (
      <Tag
        style={{
          background: "#faf6f2",
          color: "#8c7766",
          border: `1px solid ${BORDER}`,
          fontSize: 10.5,
          borderRadius: 12,
          padding: "1px 7px",
        }}
      >
        New Member
      </Tag>
    );
  };

  // ── Table Columns ──────────────────────────────────────────
  const columns = [
    {
      title: "Customer & Loyalty Tier",
      dataIndex: "name",
      key: "name",
      minWidth: 220,
      render: (name, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar
            style={{
              background: (r.orderCount || 0) >= 5 ? PRIMARY : (r.orderCount || 0) >= 2 ? "#7b1f6a" : "#ebdcd0",
              color: (r.orderCount || 0) >= 2 ? "#f5d796" : "#5c1a52",
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: (r.orderCount || 0) >= 5 ? "0 0 0 2px #f5d796" : "none",
            }}
          >
            {name ? name.charAt(0).toUpperCase() : "C"}
          </Avatar>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, color: "#240821", fontSize: 13.5 }}>
                {name}
              </span>
              {renderTierBadge(r.orderCount || 0)}
            </div>
            <div style={{ fontSize: 11.5, color: "#8c7766", marginTop: 2 }}>
              Joined {formatDateSafe(r.createdAt)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact Details",
      key: "contact",
      minWidth: 180,
      render: (_, r) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <a
            href={`mailto:${r.email}`}
            style={{ color: PRIMARY, fontSize: 12.5, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 5, wordBreak: "break-all" }}
          >
            <LuMail size={13} style={{ color: "#8c7766", flexShrink: 0 }} /> {r.email}
          </a>
          {r.phone ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <a
                href={`tel:${r.phone}`}
                style={{ color: "#735e4d", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 5 }}
              >
                <LuPhone size={12} style={{ color: "#8c7766", flexShrink: 0 }} /> {r.phone}
              </a>
              <a
                href={`https://wa.me/${r.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#25D366",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 11,
                  fontWeight: 600,
                  background: "#f0fdf4",
                  padding: "1px 6px",
                  borderRadius: 10,
                  border: "1px solid #bbf7d0",
                }}
                title="Open WhatsApp Contact"
              >
                <FaWhatsapp size={12} /> Chat
              </a>
            </div>
          ) : (
            <span style={{ color: "#a8998c", fontSize: 11.5 }}>No phone saved</span>
          )}
        </div>
      ),
    },
    {
      title: "Location",
      dataIndex: "city",
      key: "city",
      minWidth: 120,
      render: (city) =>
        city ? (
          <span style={{ fontSize: 12.5, color: "#240821", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <LuMapPin size={13} style={{ color: GOLD, flexShrink: 0 }} /> {city}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: "#a8998c" }}>UAE</span>
        ),
    },
    {
      title: "Orders Placed",
      dataIndex: "orderCount",
      key: "orderCount",
      sorter: (a, b) => (a.orderCount || 0) - (b.orderCount || 0),
      render: (count) => {
        const isVip = (count || 0) >= 5;
        const isRepeat = (count || 0) >= 2;
        return (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Tag
              style={{
                background: isVip ? "#fdf2f8" : isRepeat ? "#faf5f9" : count > 0 ? "#f0fdf4" : "#f5f0eb",
                borderColor: isVip ? "#fbcfe8" : isRepeat ? BORDER : count > 0 ? "#bbf7d0" : "#ebdcd0",
                color: isVip ? PRIMARY : isRepeat ? PRIMARY : count > 0 ? "#15803d" : "#8c7766",
                fontWeight: 700,
                borderRadius: 8,
                padding: "3px 9px",
                fontSize: 12,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <LuShoppingBag size={12} />
              {count || 0} {count === 1 ? "order" : "orders"}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Total Spent",
      dataIndex: "totalSpent",
      key: "totalSpent",
      sorter: (a, b) => (a.totalSpent || 0) - (b.totalSpent || 0),
      render: (spent) => (
        <div>
          <div style={{ fontWeight: 700, color: spent > 0 ? "#15803d" : "#735e4d", fontSize: 13.5 }}>
            AED {(spent || 0).toLocaleString()}
          </div>
          {spent > 0 && (
            <span style={{ fontSize: 10.5, color: "#8c7766" }}>Lifetime value</span>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 110,
      render: (v, record) => (
        <Switch
          checked={v !== false}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          onChange={(checked) => updateUser(record._id, { isActive: checked })}
        />
      ),
    },
    {
      title: "Actions",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, r) => (
        <Space size="small">
          <Tooltip title="View customer profile & order history">
            <Button
              size="small"
              icon={<LuEye size={13} />}
              onClick={() => {
                setSelectedCustomer(r);
                setDetailsModalOpen(true);
              }}
              style={{ borderRadius: 6, borderColor: BORDER, color: PRIMARY }}
            >
              View
            </Button>
          </Tooltip>
          <Tooltip title="Delete customer record">
            <Popconfirm
              title="Delete Customer Account"
              description={`Are you sure you want to delete "${r.name}"? This action cannot be undone.`}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDeleteCustomer(r._id, r.name)}
            >
              <Button
                size="small"
                danger
                icon={<LuTrash2 size={13} />}
                style={{ borderRadius: 6 }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* ── 1. Page Header Card ── */}
      <Card
        style={{
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          background: "#ffffff",
          boxShadow: "0 2px 10px rgba(92, 26, 82, 0.03)",
        }}
        bodyStyle={{ padding: "18px 20px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontFamily: "Georgia, serif",
                fontWeight: 700,
                color: "#240821",
                letterSpacing: "-0.01em",
              }}
            >
              Customer Directory
            </h2>
            <p style={{ margin: "4px 0 0", color: "#735e4d", fontSize: 13 }}>
              View client accounts, identify VIP patrons with the most orders, and manage contact relationships.
            </p>
          </div>

          <Space wrap>
            <Button
              type="primary"
              icon={<LuDownload size={14} />}
              onClick={exportCustomersCSV}
              style={{
                background: PRIMARY,
                borderRadius: 10,
                fontWeight: 600,
                height: 38,
                boxShadow: "0 2px 8px rgba(92, 26, 82, 0.2)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Export Customers (CSV)
            </Button>
            <Button
              icon={<LuRotateCw size={14} className={loading ? "spin" : ""} />}
              onClick={fetchUsers}
              loading={loading}
              style={{ borderRadius: 10, height: 38, borderColor: BORDER, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              Refresh
            </Button>
          </Space>
        </div>

        {/* Quick Stat Summary Row */}
        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid #f5ede8",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <div style={{ fontSize: 11.5, color: "#8c7766", textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                <LuUsers size={14} style={{ color: PRIMARY }} /> Total Customers
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#240821", marginTop: 2 }}>
                {users.length}
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ fontSize: 11.5, color: "#8c7766", textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                <LuCrown size={14} style={{ color: GOLD }} /> VIP & Repeat Patrons
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: PRIMARY, marginTop: 2 }}>
                {repeatCount} <span style={{ fontSize: 12, fontWeight: 500, color: "#8c7766" }}>({vipCount} VIP)</span>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ fontSize: 11.5, color: "#8c7766", textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                <LuShoppingBag size={14} style={{ color: "#15803d" }} /> Total Orders Placed
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#15803d", marginTop: 2 }}>
                {totalOrdersPlaced}
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ fontSize: 11.5, color: "#8c7766", textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                <LuAward size={14} style={{ color: GOLD }} /> Customer Revenue
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: GOLD, marginTop: 2 }}>
                AED {totalCustomerRevenue.toLocaleString()}
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      {/* ── 2. Top Loyal Patrons / Most Orders Leaderboard ── */}
      {topCustomers.length > 0 && (
        <Card
          style={{
            borderRadius: 16,
            border: "1px solid #ebdcd0",
            background: "linear-gradient(135deg, #ffffff 0%, #fffcf8 100%)",
            boxShadow: "0 4px 18px rgba(92, 26, 82, 0.04)",
          }}
          bodyStyle={{ padding: "18px 20px" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#fef3c7",
                  border: "1px solid #fde68a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#b45309",
                  fontSize: 16,
                }}
              >
                <LuTrophy />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "Georgia, serif",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#240821",
                  }}
                >
                  Most Frequent Buyers & VIP Patrons
                </h3>
                <span style={{ fontSize: 12, color: "#735e4d" }}>
                  Customers who have completed the most orders across your boutique
                </span>
              </div>
            </div>

            <Button
              type="link"
              size="small"
              onClick={() => {
                setOrderFilter("vip");
                setSortBy("most-orders");
              }}
              style={{ color: PRIMARY, fontWeight: 700, padding: 0 }}
            >
              Filter VIP buyers only &rarr;
            </Button>
          </div>

          <Row gutter={[14, 14]}>
            {topCustomers.map((cust, idx) => {
              const rankColors = [
                { badge: "#c49a45", bg: "#fef9ee", border: "#fde68a", label: "#1 TOP PATRON" },
                { badge: "#7b1f6a", bg: "#faf5f9", border: "#ebdcd0", label: "#2 REPEAT PATRON" },
                { badge: "#0284c7", bg: "#f0f9ff", border: "#bae6fd", label: "#3 REPEAT PATRON" },
              ][idx] || { badge: PRIMARY, bg: "#faf5f9", border: BORDER, label: `#${idx + 1} PATRON` };

              return (
                <Col xs={24} sm={12} md={8} key={cust._id}>
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: rankColors.bg,
                      border: `1px solid ${rankColors.border}`,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100%",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div>
                      {/* Rank tag */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: rankColors.badge,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <LuCrown size={12} /> {rankColors.label}
                        </span>
                        <Tag color="purple" style={{ margin: 0, fontWeight: 700, borderRadius: 10, fontSize: 11 }}>
                          {cust.orderCount} Orders
                        </Tag>
                      </div>

                      {/* Customer Name */}
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: "#240821" }}>
                        {cust.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#8c7766", marginTop: 2, wordBreak: "break-all" }}>
                        {cust.email}
                      </div>

                      {/* Spending and City */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 8, borderTop: "1px dashed rgba(235, 220, 208, 0.8)" }}>
                        <span style={{ fontSize: 11.5, color: "#735e4d" }}>Total Spent:</span>
                        <strong style={{ fontSize: 13.5, color: "#15803d" }}>
                          AED {(cust.totalSpent || 0).toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <Button
                        size="small"
                        icon={<LuEye size={12} />}
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setDetailsModalOpen(true);
                        }}
                        style={{ flex: 1, borderRadius: 8, fontSize: 11.5, borderColor: BORDER }}
                      >
                        Profile
                      </Button>

                      {cust.phone && (
                        <Button
                          size="small"
                          icon={<FaWhatsapp size={12} style={{ color: "#25D366" }} />}
                          href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          style={{ borderRadius: 8, fontSize: 11.5, borderColor: "#bbf7d0" }}
                        >
                          WhatsApp
                        </Button>
                      )}
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </Card>
      )}

      {/* ── 3. Table Card with Advanced Order Filters ── */}
      <Card
        style={{
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          background: "#ffffff",
          boxShadow: "0 2px 10px rgba(92, 26, 82, 0.03)",
        }}
        bodyStyle={{ padding: "18px 20px" }}
      >
        {/* Search, Order Filter & Sort Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {/* Keyword Search */}
          <Input
            placeholder="Search by name, email, phone, city..."
            prefix={<LuSearch size={14} style={{ color: "#8c7766" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ minWidth: 240, maxWidth: 360, borderRadius: 10, height: 38 }}
          />

          <Space wrap size="middle">
            {/* 1. Orders-Based Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "#735e4d", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <LuFilter size={13} /> Orders:
              </span>
              <Select
                value={orderFilter}
                onChange={setOrderFilter}
                style={{ width: 175 }}
                options={[
                  { label: "All Order Volumes", value: "all" },
                  { label: `VIP Patrons (5+ orders)`, value: "vip" },
                  { label: `Repeat Buyers (2–4)`, value: "repeat" },
                  { label: `First-Time Buyer (1)`, value: "single" },
                  { label: `No Orders Yet (0)`, value: "none" },
                ]}
              />
            </div>

            {/* 2. Sort by Orders or Spend */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "#735e4d", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <LuArrowUpDown size={13} /> Sort By:
              </span>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 175 }}
                options={[
                  { label: "Most Orders Placed", value: "most-orders" },
                  { label: "Highest Spending", value: "highest-spend" },
                  { label: "Newest Joined", value: "newest" },
                  { label: "Oldest Registered", value: "oldest" },
                ]}
              />
            </div>

            {/* 3. Account Status Filter */}
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 130 }}
              options={[
                { label: "All Accounts", value: "all" },
                { label: "Active Only", value: "active" },
                { label: "Inactive Only", value: "inactive" },
              ]}
            />

            {(orderFilter !== "all" || statusFilter !== "all" || searchText || sortBy !== "most-orders") && (
              <Button
                type="text"
                size="small"
                onClick={() => {
                  setOrderFilter("all");
                  setStatusFilter("all");
                  setSearchText("");
                  setSortBy("most-orders");
                }}
                style={{ color: PRIMARY, fontSize: 12, fontWeight: 600 }}
              >
                Reset filters
              </Button>
            )}

            <span style={{ fontSize: 12, color: "#8c7766", marginLeft: 4 }}>
              Showing {filteredUsers.length} of {users.length}
            </span>
          </Space>
        </div>

        {/* Customers Table */}
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "25", "50", "100"],
            showTotal: (total) => `Total ${total} customers`,
          }}
          scroll={{ x: 860 }}
        />
      </Card>

      {/* ── 4. Customer Details Modal ── */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar
              style={{
                background: (selectedCustomer?.orderCount || 0) >= 5 ? PRIMARY : "#ecdcec",
                color: (selectedCustomer?.orderCount || 0) >= 5 ? "#f5d796" : PRIMARY,
                fontWeight: 700,
              }}
              size={36}
            >
              {selectedCustomer?.name ? selectedCustomer.name.charAt(0).toUpperCase() : "C"}
            </Avatar>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontFamily: "Georgia, serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#240821",
                }}
              >
                {selectedCustomer?.name || "Customer Profile"}
              </h3>
              <span style={{ fontSize: 11.5, color: "#8c7766" }}>
                Member since {formatDateSafe(selectedCustomer?.createdAt)}
              </span>
            </div>
          </div>
        }
        open={detailsModalOpen}
        onCancel={() => setDetailsModalOpen(false)}
        centered
        width={580}
        footer={[
          selectedCustomer?.phone && (
            <Button
              key="whatsapp"
              type="primary"
              icon={<FaWhatsapp size={14} />}
              href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              style={{ background: "#25D366", borderColor: "#25D366", fontWeight: 600, borderRadius: 10 }}
            >
              WhatsApp Contact
            </Button>
          ),
          <Button
            key="email"
            type="primary"
            icon={<LuMail size={14} />}
            href={`mailto:${selectedCustomer?.email}`}
            style={{ background: PRIMARY, borderColor: PRIMARY, fontWeight: 600, borderRadius: 10 }}
          >
            Send Email
          </Button>,
          <Button key="close" onClick={() => setDetailsModalOpen(false)} style={{ borderRadius: 10 }}>
            Close
          </Button>,
        ]}
      >
        {selectedCustomer && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
            {/* VIP Loyalty Banner */}
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: (selectedCustomer.orderCount || 0) >= 5 ? "#faf5f9" : "#faf8f5",
                border: `1px solid ${BORDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#735e4d", fontWeight: 600 }}>Loyalty Tier:</span>
                {renderTierBadge(selectedCustomer.orderCount || 0)}
              </div>
              <Tag color={selectedCustomer.isActive !== false ? "success" : "default"} style={{ margin: 0, fontWeight: 600 }}>
                {selectedCustomer.isActive !== false ? "Active Account" : "Inactive Account"}
              </Tag>
            </div>

            {/* Metrics Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <div style={{ padding: "12px 14px", borderRadius: 10, background: "#ffffff", border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 11, color: "#8c7766", textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <LuShoppingBag size={12} style={{ color: PRIMARY }} /> Orders Placed
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: PRIMARY, marginTop: 4 }}>
                  {selectedCustomer.orderCount || 0} orders
                </div>
              </div>

              <div style={{ padding: "12px 14px", borderRadius: 10, background: "#ffffff", border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 11, color: "#8c7766", textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <LuAward size={12} style={{ color: GOLD }} /> Lifetime Spend
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#15803d", marginTop: 4 }}>
                  AED {(selectedCustomer.totalSpent || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Customer Details Descriptions */}
            <Descriptions bordered column={1} size="small" style={{ borderColor: BORDER }}>
              <Descriptions.Item label="Email Address">
                <a href={`mailto:${selectedCustomer.email}`} style={{ color: PRIMARY, fontWeight: 600 }}>
                  {selectedCustomer.email}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                {selectedCustomer.phone || "Not provided"}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {selectedCustomer.city || selectedCustomer.addressSummary || "United Arab Emirates"}
              </Descriptions.Item>
              {selectedCustomer.lastOrderDate && (
                <Descriptions.Item label="Last Order Date">
                  {formatDateSafe(selectedCustomer.lastOrderDate, true)}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;