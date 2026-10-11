import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Tag,
  Select,
  message,
  Input,
  Space,
  Button,
  DatePicker,
  Tooltip,
  Drawer,
  Descriptions,
  Divider,
  Card,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WhatsAppOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const statusConfig = {
  pending: { label: "Pending", color: "#d97706", bg: "#fef3c7", border: "#fde68a", icon: <ClockCircleOutlined /> },
  processing: { label: "Processing", color: "#5c1a52", bg: "#fcf3fa", border: "#ebdcd0", icon: <SyncOutlined spin /> },
  shipped: { label: "Shipped", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", icon: <CarOutlined /> },
  delivered: { label: "Delivered", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", icon: <CheckCircleOutlined /> },
  cancelled: { label: "Cancelled", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: <CloseCircleOutlined /> },
};

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];

const Orders = () => {
  const { isManager } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState();
  const [paymentFilter, setPaymentFilter] = useState();
  const [dateRange, setDateRange] = useState(null);

  // Order Details Drawer
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    api
      .get("/admin/orders")
      .then(({ data }) => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  };

  useEffect(fetchOrders, []);

  const filteredOrders = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !searchTerm ||
        [order._id, order.user?.name, order.user?.email, order.shippingAddress?.fullName, order.shippingAddress?.phone, order.shippingAddress?.emirate]
          .some((value) => String(value || "").toLowerCase().includes(searchTerm));
      const matchesStatus = !statusFilter || order.status === statusFilter;
      const matchesPayment =
        paymentFilter === undefined ||
        paymentFilter === null ||
        (paymentFilter === "paid" ? order.isPaid : !order.isPaid);
      const orderDate = new Date(order.createdAt);
      const matchesDate =
        !dateRange?.[0] ||
        !dateRange?.[1] ||
        (orderDate >= dateRange[0].startOf("day").toDate() &&
          orderDate <= dateRange[1].endOf("day").toDate());
      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [orders, search, statusFilter, paymentFilter, dateRange]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter(undefined);
    setPaymentFilter(undefined);
    setDateRange(null);
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      message.success(`Order status updated to ${status}`);
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder((prev) => ({ ...prev, status }));
      }
      fetchOrders();
    } catch (err) {
      message.error(err.response?.data?.message || "Status update failed");
    }
  };

  const openOrderDrawer = (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      render: (id, record) => (
        <Button
          type="link"
          onClick={() => openOrderDrawer(record)}
          style={{ padding: 0, fontWeight: 700, color: "#5c1a52" }}
        >
          #{id.slice(-8).toUpperCase()}
        </Button>
      ),
    },
    {
      title: "Customer & Destination",
      dataIndex: "shippingAddress",
      render: (addr, record) => {
        const name = addr?.fullName || record.user?.name || "Customer";
        const emirate = addr?.emirate || addr?.city || "UAE";
        return (
          <div>
            <div style={{ fontWeight: 600, color: "#240821" }}>{name}</div>
            <div style={{ fontSize: 11, color: "#8c7766" }}>
              {emirate} &bull; {addr?.phone || record.user?.email || "—"}
            </div>
          </div>
        );
      },
    },
    {
      title: "Items",
      dataIndex: "items",
      render: (items) => {
        const count = items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
        return (
          <span style={{ fontSize: 12, fontWeight: 600, color: "#6b5849" }}>
            {count} {count === 1 ? "piece" : "pieces"}
          </span>
        );
      },
    },
    {
      title: "Total (AED)",
      dataIndex: "totalPrice",
      render: (v) => (
        <span style={{ fontWeight: 700, color: "#240821" }}>
          AED {Number(v || 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: "Payment",
      dataIndex: "isPaid",
      render: (v, r) => (
        <Tag
          style={{
            margin: 0,
            background: v ? "#f0fdf4" : "#fef3c7",
            color: v ? "#15803d" : "#b45309",
            borderColor: v ? "#bbf7d0" : "#fde68a",
            fontWeight: 600,
          }}
        >
          {v ? "Paid" : r.paymentMethod === "cod" ? "COD (Doorstep)" : "Unpaid"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status, record) => {
        const cfg = statusConfig[status] || {
          label: status,
          color: "#5c1a52",
          bg: "#faf5f9",
          border: "#ebdcd0",
        };
        return isManager ? (
          <Select
            value={status}
            size="small"
            style={{ width: 140 }}
            onChange={(value) => updateStatus(record._id, value)}
            options={statusOptions.map((s) => ({
              label: (
                <span style={{ textTransform: "capitalize", fontWeight: 500 }}>
                  {statusConfig[s]?.label || s}
                </span>
              ),
              value: s,
            }))}
          />
        ) : (
          <Tag
            icon={cfg.icon}
            style={{
              margin: 0,
              background: cfg.bg,
              color: cfg.color,
              borderColor: cfg.border,
            }}
          >
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (d) => (
        <span style={{ fontSize: 12, color: "#8c7766" }}>
          {new Date(d).toLocaleDateString("en-AE", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => openOrderDrawer(record)}
          style={{ borderColor: "#ebdcd0", color: "#5c1a52" }}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Page Header Card ── */}
      <Card
        style={{
          border: "1px solid #ebdcd0",
          borderRadius: 16,
          background: "#ffffff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontFamily: "Georgia, serif", fontWeight: 700, color: "#240821" }}>
              Customer Orders
            </h2>
            <p style={{ margin: "4px 0 0", color: "#735e4d", fontSize: 13 }}>
              Manage domestic UAE deliveries, order statuses, and customer consignments.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#5c1a52", background: "#fcf3fa", padding: "6px 14px", borderRadius: 20, border: "1px solid #ebdcd0" }}>
              Total: {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
            <Button icon={<ReloadOutlined />} onClick={fetchOrders} loading={loading}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f0e3d8" }}>
          <Space wrap size="middle">
            <Input
              allowClear
              prefix={<SearchOutlined style={{ color: "#8c7766" }} />}
              placeholder="Search ID, customer, phone, emirate..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ width: 280 }}
            />
            <Select
              allowClear
              placeholder="Filter by Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions.map((status) => ({
                label: statusConfig[status]?.label || status,
                value: status,
              }))}
              style={{ width: 160 }}
            />
            <Select
              allowClear
              placeholder="Payment Status"
              value={paymentFilter}
              onChange={setPaymentFilter}
              options={[
                { label: "Paid", value: "paid" },
                { label: "Unpaid / COD", value: "unpaid" },
              ]}
              style={{ width: 160 }}
            />
            <DatePicker.RangePicker value={dateRange} onChange={setDateRange} style={{ borderColor: "#ebdcd0" }} />
            <Tooltip title="Reset all filters">
              <Button icon={<ReloadOutlined />} onClick={clearFilters} />
            </Tooltip>
          </Space>
        </div>
      </Card>

      {/* ── Table Card ── */}
      <Card
        style={{
          border: "1px solid #ebdcd0",
          borderRadius: 16,
          background: "#ffffff",
          padding: 0,
        }}
      >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filteredOrders}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          locale={{ emptyText: "No customer orders found matching your criteria" }}
          style={{ borderRadius: 12, overflow: "hidden" }}
        />
      </Card>

      {/* ── Order Details Drawer ── */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#240821" }}>
              Order #{selectedOrder?._id?.slice(-8).toUpperCase()}
            </span>
            {selectedOrder && (
              <Tag
                style={{
                  margin: 0,
                  background: statusConfig[selectedOrder.status]?.bg,
                  color: statusConfig[selectedOrder.status]?.color,
                  borderColor: statusConfig[selectedOrder.status]?.border,
                  fontWeight: 600,
                }}
              >
                {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
              </Tag>
            )}
          </div>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={560}
      >
        {selectedOrder && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Status Update Control */}
            {isManager && (
              <div
                style={{
                  background: "#faf6f2",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid #ebdcd0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: "#240821" }}>
                  Update Order Status:
                </span>
                <Select
                  value={selectedOrder.status}
                  style={{ width: 160 }}
                  onChange={(val) => updateStatus(selectedOrder._id, val)}
                  options={statusOptions.map((s) => ({
                    label: statusConfig[s]?.label || s,
                    value: s,
                  }))}
                />
              </div>
            )}

            {/* Customer Details Card */}
            <div>
              <h4 style={{ fontFamily: "Georgia, serif", fontSize: 15, color: "#5c1a52", marginBottom: 10 }}>
                Recipient & Delivery Information
              </h4>
              <Descriptions
                bordered
                size="small"
                column={1}
                style={{ background: "#ffffff", borderRadius: 10, overflow: "hidden", borderColor: "#ebdcd0" }}
              >
                <Descriptions.Item label="Full Name">
                  <b>{selectedOrder.shippingAddress?.fullName || selectedOrder.user?.name || "Customer"}</b>
                </Descriptions.Item>
                <Descriptions.Item label="Phone / WhatsApp">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone || "—"}</span>
                    {selectedOrder.shippingAddress?.phone && (
                      <Button
                        size="small"
                        type="link"
                        icon={<WhatsAppOutlined />}
                        href={`https://wa.me/${selectedOrder.shippingAddress.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        style={{ color: "#25D366", padding: 0 }}
                      >
                        WhatsApp
                      </Button>
                    )}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedOrder.user?.email || "Guest Order"}
                </Descriptions.Item>
                <Descriptions.Item label="Destination">
                  {selectedOrder.shippingAddress?.addressLine1 || "—"}
                  {selectedOrder.shippingAddress?.addressLine2 && `, ${selectedOrder.shippingAddress.addressLine2}`}
                  <br />
                  <b>{selectedOrder.shippingAddress?.city}</b>, {selectedOrder.shippingAddress?.emirate}, UAE
                </Descriptions.Item>
                <Descriptions.Item label="Payment Method">
                  {selectedOrder.paymentMethod === "cod"
                    ? "Cash on Delivery / Card at Doorstep (COD)"
                    : selectedOrder.paymentMethod === "stripe"
                    ? "Stripe (Card / Apple Pay)"
                    : "Online Card"}
                  {" • "}
                  <Tag color={selectedOrder.isPaid ? "green" : "orange"} style={{ marginLeft: 6 }}>
                    {selectedOrder.isPaid ? "Paid" : "Pending Payment"}
                  </Tag>
                  {selectedOrder.paymentResult?.stripe_payment_intent_id && (
                    <div style={{ marginTop: 4, fontSize: 11, color: "#8c7766" }}>
                      Transaction: <code>{selectedOrder.paymentResult.stripe_payment_intent_id}</code>
                      {selectedOrder.paymentResult?.is_simulated ? " (Simulation Mode)" : ""}
                    </div>
                  )}
                </Descriptions.Item>
                {selectedOrder.couponCode && (
                  <Descriptions.Item label="Applied Coupon">
                    <Tag color="purple">{selectedOrder.couponCode}</Tag>
                    {selectedOrder.discount ? `(−AED ${selectedOrder.discount})` : ""}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>

            <Divider style={{ margin: "4px 0", borderColor: "#ebdcd0" }} />

            {/* Ordered Items */}
            <div>
              <h4 style={{ fontFamily: "Georgia, serif", fontSize: 15, color: "#5c1a52", marginBottom: 12 }}>
                Items in Consignment ({selectedOrder.items?.length || 0})
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {selectedOrder.items?.map((item, idx) => {
                  const product = item.product || {};
                  const img = product.images?.[0] || product.image;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        padding: "10px",
                        borderRadius: 10,
                        border: "1px solid #ebdcd0",
                        background: "#faf8f5",
                      }}
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={product.name || "Product"}
                          style={{ width: 50, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid #ebdcd0" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 50,
                            height: 60,
                            background: "#ebdcd0",
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ShoppingOutlined style={{ color: "#735e4d", fontSize: 20 }} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#240821" }}>
                          {product.name || "Boutique Garment"}
                        </div>
                        <div style={{ fontSize: 11, color: "#8c7766", marginTop: 2 }}>
                          {item.size && <span>Size: <b>{item.size}</b> &bull; </span>}
                          {item.color && <span>Color: <b>{item.color}</b> &bull; </span>}
                          <span>Qty: <b>{item.quantity}</b></span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", fontWeight: 700, fontSize: 13, color: "#5c1a52" }}>
                        AED {Number((item.price || product.discountPrice || product.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Due Breakdown */}
            <div
              style={{
                marginTop: 10,
                padding: "14px 16px",
                borderRadius: 12,
                background: "#fcf3fa",
                border: "1px solid #ebdcd0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: "#240821" }}>
                Total Order Amount
              </span>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#5c1a52" }}>
                AED {Number(selectedOrder.totalPrice || 0).toFixed(2)}
              </span>
            </div>

          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Orders;
