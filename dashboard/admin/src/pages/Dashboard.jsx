import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Col,
  Row,
  Spin,
  Table,
  InputNumber,
  Button,
  Tag,
  Tabs,
  message,
  Result,
  Alert,
  Radio,
  Progress,
  Space,
} from "antd";
import {
  RiseOutlined,
  FallOutlined,
  WarningOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RollbackOutlined,
  RetweetOutlined,
  InboxOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
  EditOutlined,
  SaveOutlined,
  ShoppingOutlined,
  FundOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../api/axios";

const PRIMARY = "#5c1a52";
const GOLD = "#c49a45";
const BORDER = "#ebdcd0";

// ── Compact Quick-Restock Table ─────────────────────────────
const QuickRestockTable = ({ data, onSave, onNavigate }) => {
  const [editing, setEditing] = useState({});
  const [values, setValues] = useState({});

  const handleSave = async (id) => {
    await onSave(id, values[id]);
    setEditing((e) => ({ ...e, [id]: false }));
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      render: (name, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {r.images?.[0] ? (
            <img
              src={r.images[0]}
              alt={name}
              style={{
                width: 40,
                height: 40,
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid #ebdcd0",
              }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "#faf5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: PRIMARY,
              }}
            >
              <ShoppingOutlined />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#240821" }}>{name}</div>
            <div style={{ fontSize: 11, color: "#8c7766" }}>{r.category?.name || "Uncategorized"}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (v) => <span style={{ fontWeight: 600, color: "#240821" }}>AED {v?.toLocaleString()}</span>,
    },
    {
      title: "Current Stock",
      dataIndex: "stock",
      key: "stock",
      render: (stock) => (
        <Tag
          color={stock === 0 ? "error" : "warning"}
          style={{ fontWeight: 700, borderRadius: 6, padding: "2px 8px" }}
        >
          {stock === 0 ? "Out of Stock (0)" : `${stock} Left`}
        </Tag>
      ),
    },
    {
      title: "Quick Action",
      key: "action",
      render: (_, r) => (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {editing[r._id] ? (
            <>
              <InputNumber
                min={0}
                defaultValue={r.stock}
                size="small"
                style={{ width: 75, borderRadius: 6 }}
                onChange={(v) => setValues((prev) => ({ ...prev, [r._id]: v }))}
              />
              <Button
                type="primary"
                size="small"
                icon={<SaveOutlined />}
                onClick={() => handleSave(r._id)}
                style={{ background: PRIMARY, borderRadius: 6 }}
              >
                Save
              </Button>
            </>
          ) : (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditing((e) => ({ ...e, [r._id]: true }));
                setValues((v) => ({ ...v, [r._id]: r.stock }));
              }}
              style={{ borderRadius: 6, borderColor: "#ebdcd0" }}
            >
              Adjust Stock
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="_id"
        size="middle"
        pagination={{ pageSize: 5, size: "small" }}
      />
      {data.length > 5 && (
        <div style={{ textAlign: "right", marginTop: 8 }}>
          <Button type="link" onClick={() => onNavigate("/inventory")} style={{ color: PRIMARY, fontWeight: 600 }}>
            Manage Full Warehouse Inventory <ArrowRightOutlined />
          </Button>
        </div>
      )}
    </div>
  );
};

// ── Main Simplified Dashboard ───────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartMetric, setChartMetric] = useState("revenue"); // "revenue" | "orders"

  const fetchDashboardData = async () => {
    try {
      const [dashRes, invRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/inventory").catch(() => ({ data: { lowStock: [], outOfStock: [] } })),
      ]);
      if (dashRes.data?.stats) {
        setStats(dashRes.data.stats);
      }
      setInventory(invRes.data);
    } catch {
      message.error("Could not refresh dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleStockUpdate = async (id, stock) => {
    try {
      await api.put(`/admin/inventory/${id}`, { stock });
      message.success("Stock quantity updated successfully");
      const { data } = await api.get("/admin/inventory");
      setInventory(data);
      // Refresh general counts as well
      const dash = await api.get("/admin/dashboard");
      if (dash.data?.stats) setStats(dash.data.stats);
    } catch {
      message.error("Failed to update stock quantity");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, color: "#8c7766", fontSize: 14 }}>Loading store performance...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <Result
        status="warning"
        title="Dashboard data temporarily unavailable"
        subTitle="Please ensure the backend API server is running on port 5007."
        extra={
          <Button type="primary" onClick={handleManualRefresh} style={{ background: PRIMARY }}>
            Try Again
          </Button>
        }
      />
    );
  }

  // Urgent attention counters
  const pendingCount = stats.pendingOrders || 0;
  const processingCount = stats.processingOrders || 0;
  const activeOrdersCount = pendingCount + processingCount;
  const lowStockCount = stats.lowStockProducts || 0;
  const outOfStockCount = stats.outOfStockProducts || 0;
  const urgentStockCount = lowStockCount + outOfStockCount;

  // Monthly revenue trend calculation
  const revChangeNum = parseFloat(stats.revenueChange || 0);
  const isRevPositive = revChangeNum >= 0;

  // Combined stock items that need restock
  const needsRestockList = [
    ...(inventory?.outOfStock || []),
    ...(inventory?.lowStock || []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── 1. Header: Greeting & Quick Refresh ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: "#240821",
              fontFamily: "Georgia, serif",
            }}
          >
            Store Performance Overview
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#735e4d" }}>
            Here is a clear, simple summary of your sales, orders, and inventory today.
          </p>
        </div>

        <Button
          icon={<ReloadOutlined spin={refreshing} />}
          onClick={handleManualRefresh}
          style={{
            borderRadius: 8,
            borderColor: BORDER,
            color: "#240821",
            fontWeight: 500,
          }}
        >
          Refresh Data
        </Button>
      </div>

      {/* ── 2. Smart "Needs Attention" Action Strip ── */}
      {activeOrdersCount > 0 || urgentStockCount > 0 ? (
        <div
          style={{
            background: "#fffaf0",
            border: "1px solid #fbd38d",
            borderRadius: 14,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            boxShadow: "0 2px 8px rgba(196, 154, 69, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#b45309",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              <ClockCircleOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#78350f", fontSize: 14 }}>
                Action Items Requiring Your Attention
              </div>
              <div style={{ fontSize: 12.5, color: "#92400e" }}>
                {pendingCount > 0 && (
                  <span style={{ marginRight: 12 }}>
                    • <strong>{pendingCount} order{pendingCount > 1 ? "s" : ""}</strong> waiting to be processed
                  </span>
                )}
                {urgentStockCount > 0 && (
                  <span>
                    • <strong>{urgentStockCount} product{urgentStockCount > 1 ? "s" : ""}</strong> low or out of stock
                  </span>
                )}
              </div>
            </div>
          </div>

          <Space wrap>
            {activeOrdersCount > 0 && (
              <Button
                type="primary"
                size="middle"
                onClick={() => navigate("/orders")}
                style={{ background: PRIMARY, borderRadius: 8, fontWeight: 600 }}
              >
                Review Orders ({activeOrdersCount})
              </Button>
            )}
            {urgentStockCount > 0 && (
              <Button
                onClick={() => navigate("/inventory")}
                style={{ borderRadius: 8, borderColor: "#d97706", color: "#b45309", fontWeight: 600 }}
              >
                View Inventory ({urgentStockCount})
              </Button>
            )}
          </Space>
        </div>
      ) : (
        <Alert
          message="Everything is running smoothly! All orders are dispatched and catalog inventory is healthy."
          type="success"
          showIcon
          style={{ borderRadius: 12, border: "1px solid #bbf7d0", background: "#f0fdf4" }}
        />
      )}

      {/* ── 3. Four Core Essential Cards (No Overwhelming Clutter) ── */}
      <Row gutter={[14, 14]}>
        {/* Card 1: Monthly Sales & Revenue */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 14,
              border: `1px solid ${BORDER}`,
              boxShadow: "0 2px 10px rgba(92, 26, 82, 0.03)",
              height: "100%",
              background: "#ffffff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#735e4d", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Sales (This Month)
                </span>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#240821", marginTop: 4, lineHeight: 1.1 }}>
                  AED {stats.thisMonthRevenue?.toLocaleString() || 0}
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "#fef3c7",
                  border: "1px solid #fde68a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: "#d97706",
                }}
              >
                <DollarOutlined />
              </div>
            </div>

            <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid #f5ede8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#8c7766" }}>
                Today: <strong style={{ color: "#240821" }}>AED {stats.todayRevenue?.toLocaleString() || 0}</strong>
              </span>
              {stats.revenueChange !== null && stats.revenueChange !== undefined && (
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: isRevPositive ? "#15803d" : "#dc2626",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  {isRevPositive ? <RiseOutlined /> : <FallOutlined />}
                  {isRevPositive ? "+" : ""}{stats.revenueChange}% vs last mo
                </span>
              )}
            </div>
          </Card>
        </Col>

        {/* Card 2: Orders to Fulfill */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 14,
              border: `1px solid ${BORDER}`,
              boxShadow: "0 2px 10px rgba(92, 26, 82, 0.03)",
              height: "100%",
              background: "#ffffff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#735e4d", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Active Orders
                </span>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#240821", marginTop: 4, lineHeight: 1.1 }}>
                  {activeOrdersCount} <span style={{ fontSize: 13, fontWeight: 500, color: "#8c7766" }}>to fulfill</span>
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "#faf5f9",
                  border: "1px solid #f0e1ee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: PRIMARY,
                }}
              >
                <ShoppingCartOutlined />
              </div>
            </div>

            <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid #f5ede8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#8c7766" }}>
                <strong style={{ color: "#d97706" }}>{pendingCount}</strong> pending • <strong style={{ color: PRIMARY }}>{processingCount}</strong> processing
              </span>
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/orders")}
                style={{ padding: 0, color: PRIMARY, fontWeight: 600, fontSize: 12 }}
              >
                View &rarr;
              </Button>
            </div>
          </Card>
        </Col>

        {/* Card 3: Catalog & Stock Status */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 14,
              border: urgentStockCount > 0 ? "1px solid #fecaca" : `1px solid ${BORDER}`,
              boxShadow: "0 2px 10px rgba(92, 26, 82, 0.03)",
              height: "100%",
              background: urgentStockCount > 0 ? "#fffbfb" : "#ffffff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#735e4d", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Product Catalog
                </span>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#240821", marginTop: 4, lineHeight: 1.1 }}>
                  {stats.totalProducts?.toLocaleString() || 0} <span style={{ fontSize: 13, fontWeight: 500, color: "#8c7766" }}>active</span>
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: urgentStockCount > 0 ? "#fee2e2" : "#f0fdf4",
                  border: urgentStockCount > 0 ? "1px solid #fecaca" : "1px solid #bbf7d0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: urgentStockCount > 0 ? "#dc2626" : "#15803d",
                }}
              >
                {urgentStockCount > 0 ? <WarningOutlined /> : <InboxOutlined />}
              </div>
            </div>

            <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid #f5ede8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {urgentStockCount > 0 ? (
                <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}>
                  {outOfStockCount > 0 ? `${outOfStockCount} out of stock` : `${lowStockCount} low stock`}
                </span>
              ) : (
                <span style={{ fontSize: 12, color: "#15803d", fontWeight: 600 }}>
                  ✓ All stock healthy
                </span>
              )}
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/inventory")}
                style={{ padding: 0, color: PRIMARY, fontWeight: 600, fontSize: 12 }}
              >
                Restock &rarr;
              </Button>
            </div>
          </Card>
        </Col>

        {/* Card 4: Customer Base */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 14,
              border: `1px solid ${BORDER}`,
              boxShadow: "0 2px 10px rgba(92, 26, 82, 0.03)",
              height: "100%",
              background: "#ffffff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#735e4d", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Customers
                </span>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#240821", marginTop: 4, lineHeight: 1.1 }}>
                  {stats.totalCustomers?.toLocaleString() || 0}
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: "#2563eb",
                }}
              >
                <UserOutlined />
              </div>
            </div>

            <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid #f5ede8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#8c7766" }}>
                New this mo: <strong style={{ color: "#240821" }}>+{stats.newCustomersThisMonth || 0}</strong>
              </span>
              <span style={{ fontSize: 12, color: "#15803d", fontWeight: 600 }}>
                {stats.returningCustomers || 0} repeat
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── 4. Main Clean Dashboard Workspace Tabs ── */}
      <Card
        style={{
          borderRadius: 16,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 4px 18px rgba(92, 26, 82, 0.03)",
        }}
      >
        <Tabs
          defaultActiveKey="daily"
          items={[
            {
              key: "daily",
              label: (
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  📊 Store Operations & Trends
                </span>
              ),
              children: (
                <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 6 }}>
                  {/* Performance Chart & Order Pipeline Side-by-Side */}
                  <Row gutter={[20, 20]}>
                    {/* Left: Clean Sales Trend */}
                    <Col xs={24} lg={15}>
                      <div
                        style={{
                          border: "1px solid #f0e6dc",
                          borderRadius: 14,
                          padding: 18,
                          background: "#ffffff",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 16,
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          <div>
                            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#240821" }}>
                              Sales Activity (Past 7 Months)
                            </h4>
                            <span style={{ fontSize: 12, color: "#8c7766" }}>
                              Track monthly performance and seasonal demand
                            </span>
                          </div>

                          <Radio.Group
                            value={chartMetric}
                            onChange={(e) => setChartMetric(e.target.value)}
                            size="small"
                            buttonStyle="solid"
                          >
                            <Radio.Button value="revenue">Revenue (AED)</Radio.Button>
                            <Radio.Button value="orders">Orders Count</Radio.Button>
                          </Radio.Group>
                        </div>

                        {stats.salesChart?.length > 0 ? (
                          <ResponsiveContainer width="100%" height={260}>
                            {chartMetric === "revenue" ? (
                              <AreaChart
                                data={stats.salesChart}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                              >
                                <defs>
                                  <linearGradient id="luxuryPlumGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.25} />
                                    <stop offset="95%" stopColor={PRIMARY} stopOpacity={0.0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f5ede8" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8c7766" }} />
                                <YAxis tick={{ fontSize: 12, fill: "#8c7766" }} />
                                <Tooltip
                                  formatter={(val) => [`AED ${Number(val).toLocaleString()}`, "Revenue"]}
                                  contentStyle={{
                                    borderRadius: 10,
                                    border: "1px solid #ebdcd0",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                  }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="revenue"
                                  stroke={PRIMARY}
                                  strokeWidth={2.5}
                                  fill="url(#luxuryPlumGrad)"
                                  name="Revenue"
                                />
                              </AreaChart>
                            ) : (
                              <BarChart
                                data={stats.salesChart}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f5ede8" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8c7766" }} />
                                <YAxis tick={{ fontSize: 12, fill: "#8c7766" }} />
                                <Tooltip
                                  formatter={(val) => [`${val} orders`, "Total Orders"]}
                                  contentStyle={{
                                    borderRadius: 10,
                                    border: "1px solid #ebdcd0",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                  }}
                                />
                                <Bar dataKey="orders" fill="#2563eb" radius={[6, 6, 0, 0]} name="Orders" />
                              </BarChart>
                            )}
                          </ResponsiveContainer>
                        ) : (
                          <div
                            style={{
                              height: 260,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#8c7766",
                            }}
                          >
                            No sales history available yet
                          </div>
                        )}
                      </div>
                    </Col>

                    {/* Right: Order Status Pipeline */}
                    <Col xs={24} lg={9}>
                      <div
                        style={{
                          border: "1px solid #f0e6dc",
                          borderRadius: 14,
                          padding: 18,
                          background: "#ffffff",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div style={{ marginBottom: 14 }}>
                          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#240821" }}>
                            Order Fulfillment Pipeline
                          </h4>
                          <span style={{ fontSize: 12, color: "#8c7766" }}>
                            Current status of all client orders
                          </span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, justifyContent: "center" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "10px 14px",
                              borderRadius: 10,
                              background: "#fef3c7",
                              border: "1px solid #fde68a",
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#92400e" }}>
                              <ClockCircleOutlined /> Pending Confirmation
                            </span>
                            <span style={{ fontSize: 16, fontWeight: 700, color: "#78350f" }}>
                              {stats.pendingOrders || 0}
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "10px 14px",
                              borderRadius: 10,
                              background: "#faf5f9",
                              border: "1px solid #ebdcd0",
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: PRIMARY }}>
                              <ShoppingOutlined /> Processing in Atelier
                            </span>
                            <span style={{ fontSize: 16, fontWeight: 700, color: PRIMARY }}>
                              {stats.processingOrders || 0}
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "10px 14px",
                              borderRadius: 10,
                              background: "#eff6ff",
                              border: "1px solid #dbeafe",
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#1d4ed8" }}>
                              <RiseOutlined /> Shipped & Out for Delivery
                            </span>
                            <span style={{ fontSize: 16, fontWeight: 700, color: "#1e40af" }}>
                              {stats.shippedOrders || 0}
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "10px 14px",
                              borderRadius: 10,
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#15803d" }}>
                              <CheckCircleOutlined /> Completed & Delivered
                            </span>
                            <span style={{ fontSize: 16, fontWeight: 700, color: "#14532d" }}>
                              {stats.deliveredOrders || 0}
                            </span>
                          </div>
                        </div>

                        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #f5ede8", textAlign: "center" }}>
                          <Button
                            type="primary"
                            block
                            onClick={() => navigate("/orders")}
                            style={{ background: PRIMARY, borderRadius: 8, fontWeight: 600 }}
                          >
                            Open Orders Manager &rarr;
                          </Button>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {/* Immediate Restock Needed Table */}
                  <div
                    style={{
                      border: "1px solid #f0e6dc",
                      borderRadius: 14,
                      padding: 18,
                      background: "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 14,
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <div>
                        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#240821" }}>
                          Quick Restock & Low Inventory
                        </h4>
                        <span style={{ fontSize: 12, color: "#8c7766" }}>
                          Products with low quantity or out of stock. You can directly update quantities below.
                        </span>
                      </div>

                      <Button
                        size="small"
                        onClick={() => navigate("/inventory")}
                        style={{ borderRadius: 6, borderColor: BORDER, color: PRIMARY, fontWeight: 600 }}
                      >
                        All Inventory ({stats.totalProducts || 0}) &rarr;
                      </Button>
                    </div>

                    {needsRestockList.length > 0 ? (
                      <QuickRestockTable
                        data={needsRestockList}
                        onSave={handleStockUpdate}
                        onNavigate={navigate}
                      />
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "36px 16px",
                          background: "#faf6f2",
                          borderRadius: 10,
                        }}
                      >
                        <CheckCircleOutlined style={{ fontSize: 32, color: "#15803d", marginBottom: 8 }} />
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#240821" }}>
                          Warehouse Stock is in Excellent Shape
                        </div>
                        <div style={{ fontSize: 12.5, color: "#735e4d", marginTop: 2 }}>
                          No products are currently out of stock or below the safety threshold.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: "analytics",
              label: (
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  📈 Deep Business Analytics
                </span>
              ),
              children: (
                <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 10 }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#735e4d" }}>
                    Advanced store metrics for financial analysis, customer retention, and returns monitoring.
                  </p>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                      <Card size="small" style={{ borderRadius: 12, border: `1px solid ${BORDER}` }}>
                        <div style={{ fontSize: 12, color: "#735e4d", fontWeight: 600 }}>AVERAGE ORDER VALUE</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: PRIMARY, marginTop: 4 }}>
                          AED {stats.avgOrderValue?.toLocaleString() || 0}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#8c7766", marginTop: 4 }}>
                          Average spend per successful purchase
                        </div>
                      </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                      <Card size="small" style={{ borderRadius: 12, border: `1px solid ${BORDER}` }}>
                        <div style={{ fontSize: 12, color: "#735e4d", fontWeight: 600 }}>CHECKOUT CONVERSION</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "#15803d", marginTop: 4 }}>
                          {stats.conversionRate || 0}%
                        </div>
                        <div style={{ fontSize: 11.5, color: "#8c7766", marginTop: 4 }}>
                          Paid orders relative to total checkout starts
                        </div>
                      </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                      <Card size="small" style={{ borderRadius: 12, border: `1px solid ${BORDER}` }}>
                        <div style={{ fontSize: 12, color: "#735e4d", fontWeight: 600 }}>TOTAL PRODUCTS SOLD</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "#2563eb", marginTop: 4 }}>
                          {stats.productsSold?.toLocaleString() || 0}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#8c7766", marginTop: 4 }}>
                          Total item units delivered to clients
                        </div>
                      </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                      <Card size="small" style={{ borderRadius: 12, border: `1px solid ${BORDER}` }}>
                        <div style={{ fontSize: 12, color: "#735e4d", fontWeight: 600 }}>RETURNS & REFUNDS</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: stats.returnedOrders > 0 ? "#ea580c" : "#735e4d", marginTop: 4 }}>
                          {stats.returnedOrders || 0} <span style={{ fontSize: 13, fontWeight: 500 }}>returned</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: "#8c7766", marginTop: 4 }}>
                          {stats.refundedOrders || 0} orders refunded to date
                        </div>
                      </Card>
                    </Col>
                  </Row>

                  {/* Customer Retention Card */}
                  <Card
                    title="Customer Retention & Loyalty Breakdown"
                    size="small"
                    style={{ borderRadius: 12, border: `1px solid ${BORDER}` }}
                  >
                    <div style={{ padding: "10px 0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                        <span>
                          <strong>{stats.returningCustomers || 0}</strong> Repeat Shoppers
                        </span>
                        <span>
                          <strong>{stats.newCustomers || 0}</strong> First-Time Shoppers
                        </span>
                      </div>
                      <Progress
                        percent={
                          stats.totalCustomers > 0
                            ? Math.round(((stats.returningCustomers || 0) / stats.totalCustomers) * 100)
                            : 0
                        }
                        strokeColor={PRIMARY}
                        trailColor="#e5e7eb"
                        format={(pct) => `${pct}% Repeat Rate`}
                      />
                    </div>
                  </Card>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
