import { useEffect, useState } from "react";
import { Card, Row, Col, Spin, Segmented, Empty, Tag } from "antd";
import { RiseOutlined, FallOutlined, MinusOutlined } from "@ant-design/icons";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, PieChart, Pie, Cell,
} from "recharts";
import api from "../api/axios";

const PRIMARY = "#5c1a52";
const COLORS = ["#5c1a52", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#f97316", "#06b6d4", "#ec4899", "#84cc16"];

const SectionLabel = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0 6px" }}>
    <span style={{ width: 4, height: 18, background: PRIMARY, borderRadius: 4 }} />
    <h3 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 16, color: "#240821", fontWeight: 700 }}>
      {children}
    </h3>
  </div>
);

const NoData = ({ height = 220 }) => (
  <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Empty description="No data yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  </div>
);

const ChangeTag = ({ change }) => {
  if (change === null || change === undefined)
    return <span style={{ fontSize: 12, color: "#8c7766" }}>No previous data</span>;
  const up = change >= 0;
  const zero = change === 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, color: zero ? "#8c7766" : up ? "#15803d" : "#dc2626" }}>
      {zero ? <MinusOutlined /> : up ? <RiseOutlined /> : <FallOutlined />}
      {up && change > 0 ? "+" : ""}{change}%
    </span>
  );
};

const CompareCard = ({ title, current, previous, change, prefix = "", prevLabel }) => (
  <Card size="small" style={{ borderRadius: 14, height: "100%", border: "1px solid #ebdcd0", background: "#ffffff", boxShadow: "0 2px 12px rgba(92, 26, 82, 0.03)" }}>
    <p style={{ color: "#735e4d", fontSize: 12, fontWeight: 500, marginBottom: 4 }}>{title}</p>
    <p style={{ fontSize: 22, fontWeight: 700, color: "#240821", margin: "0 0 6px" }}>
      {prefix}{typeof current === "number" ? current.toLocaleString() : current}
    </p>
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <ChangeTag change={change} />
      {change !== null && change !== undefined && (
        <span style={{ fontSize: 11, color: "#8c7766" }}>vs {prevLabel} ({prefix}{typeof previous === "number" ? previous.toLocaleString() : previous})</span>
      )}
    </div>
  </Card>
);

const chartProps = {
  margin: { top: 10, right: 16, left: 0, bottom: 0 },
};

const SalesAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const [comparePeriod, setComparePeriod] = useState("month");

  useEffect(() => {
    api.get("/admin/sales-analytics")
      .then(({ data: res }) => setData(res))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: "block", marginTop: 80 }} />;

  const periodData = {
    daily: data.daily,
    weekly: data.weekly,
    monthly: data.monthly,
    yearly: data.yearly,
  }[period];

  const periodLabel = { daily: "Day", weekly: "Week", monthly: "Month", yearly: "Year" }[period];
  const cmp = data.comparisons[comparePeriod];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Page Header Card ── */}
      <Card style={{ border: "1px solid #ebdcd0", borderRadius: 16, background: "#ffffff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontFamily: "Georgia, serif", fontWeight: 700, color: "#240821" }}>
              Sales & Revenue Analytics
            </h2>
            <p style={{ margin: "4px 0 0", color: "#735e4d", fontSize: 13 }}>
              Monitor boutique revenues, conversion rates, periodic comparisons, and order trajectories.
            </p>
          </div>
          <Segmented
            value={period}
            onChange={setPeriod}
            options={[
              { label: "Daily", value: "daily" },
              { label: "Weekly", value: "weekly" },
              { label: "Monthly", value: "monthly" },
              { label: "Yearly", value: "yearly" },
            ]}
          />
        </div>
      </Card>

      {/* ── Comparison Section ── */}
      <SectionLabel>Performance Comparison</SectionLabel>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
        {["month", "week", "year"].map((p) => (
          <Tag
            key={p}
            onClick={() => setComparePeriod(p)}
            color={comparePeriod === p ? PRIMARY : "default"}
            style={{ cursor: "pointer", fontWeight: 600, fontSize: 13, padding: "4px 14px", borderRadius: 20 }}
          >
            {p === "month" ? "This Month vs Last Month" : p === "week" ? "This Week vs Previous Week" : "This Year vs Last Year"}
          </Tag>
        ))}
      </div>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} lg={8}>
          <CompareCard title="Revenue" current={cmp.revenue.current} previous={cmp.revenue.previous} change={cmp.revenue.change} prefix="AED " prevLabel={cmp.prevLabel} />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <CompareCard title="Orders" current={cmp.orders.current} previous={cmp.orders.previous} change={cmp.orders.change} prevLabel={cmp.prevLabel} />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <CompareCard title="New Customers" current={cmp.customers.current} previous={cmp.customers.previous} change={cmp.customers.change} prevLabel={cmp.prevLabel} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <CompareCard title="Products Sold (units)" current={cmp.productsSold.current} previous={cmp.productsSold.previous} change={cmp.productsSold.change} prevLabel={cmp.prevLabel} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <CompareCard title="Avg Order Value (AOV)" current={cmp.aov.current} previous={cmp.aov.previous} change={cmp.aov.change} prefix="AED " prevLabel={cmp.prevLabel} />
        </Col>
      </Row>

      {/* ── Revenue Trend ── */}
      <SectionLabel>Revenue Trend</SectionLabel>
      <Card style={{ borderRadius: 12 }} title={`Revenue by ${periodLabel}`}>
        {periodData?.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={periodData} {...chartProps}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`AED ${v.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke={PRIMARY} fill="url(#revGrad)" strokeWidth={2} name="Revenue (AED)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : <NoData height={260} />}
      </Card>

      {/* ── Order Trend ── */}
      <SectionLabel>Order Trends</SectionLabel>
      <Card style={{ borderRadius: 12 }} title={`Orders by ${periodLabel}`}>
        {periodData?.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={periodData} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, "Orders"]} />
              <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        ) : <NoData height={240} />}
      </Card>

      {/* ── Revenue + Orders combined ── */}
      <SectionLabel>Revenue & Orders Combined</SectionLabel>
      <Card style={{ borderRadius: 12 }} title={`Revenue & Orders — ${periodLabel} View`}>
        {periodData?.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={periodData} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis yAxisId="rev" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v, name) => [name === "Revenue (AED)" ? `AED ${v.toLocaleString()}` : v, name]} />
              <Legend />
              <Line yAxisId="rev" type="monotone" dataKey="revenue" stroke={PRIMARY} strokeWidth={2} dot={false} name="Revenue (AED)" />
              <Line yAxisId="ord" type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        ) : <NoData height={260} />}
      </Card>

      {/* ── AOV Trend (monthly only) ── */}
      <SectionLabel>Average Order Value (AOV) Trend</SectionLabel>
      <Card style={{ borderRadius: 12 }} title="AOV — Monthly">
        {data.monthly?.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.monthly} {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`AED ${v}`, "Avg Order Value"]} />
              <Line type="monotone" dataKey="aov" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="AOV (AED)" />
            </LineChart>
          </ResponsiveContainer>
        ) : <NoData height={220} />}
      </Card>

      {/* ── Product & Category Sales ── */}
      <SectionLabel>Product & Category Sales</SectionLabel>
      <Row gutter={[12, 12]}>
        <Col xs={24} lg={14}>
          <Card style={{ borderRadius: 12 }} title="Top 10 Products by Revenue">
            {data.productSales?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.productSales} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={130} />
                  <Tooltip formatter={(v, name) => [name === "revenue" ? `AED ${v.toLocaleString()}` : v, name === "revenue" ? "Revenue" : "Units"]} />
                  <Legend />
                  <Bar dataKey="revenue" fill={PRIMARY} radius={[0, 4, 4, 0]} name="revenue" />
                  <Bar dataKey="units" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="units" />
                </BarChart>
              </ResponsiveContainer>
            ) : <NoData height={300} />}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card style={{ borderRadius: 12 }} title="Category Sales Breakdown">
            {data.categorySales?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.categorySales}
                    dataKey="revenue"
                    nameKey="label"
                    cx="50%"
                    cy="45%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={3}
                    label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data.categorySales.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`AED ${v.toLocaleString()}`, "Revenue"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : <NoData height={300} />}
          </Card>
        </Col>
      </Row>

      {/* ── Customer Growth ── */}
      <SectionLabel>Customer Growth</SectionLabel>
      <Card style={{ borderRadius: 12 }} title="New Customers — Monthly">
        {data.customerGrowth?.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.customerGrowth} {...chartProps}>
              <defs>
                <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, "New Customers"]} />
              <Area type="monotone" dataKey="newCustomers" stroke="#10b981" fill="url(#custGrad)" strokeWidth={2} name="New Customers" />
            </AreaChart>
          </ResponsiveContainer>
        ) : <NoData height={220} />}
      </Card>

    </div>
  );
};

export default SalesAnalytics;
