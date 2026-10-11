import { useEffect, useState, useCallback } from "react";
import {
  Table, Card, Row, Col, Statistic, Tag, Button, InputNumber,
  Input, Select, message, Spin, Space, Tooltip,
} from "antd";
import {
  SearchOutlined, EditOutlined, SaveOutlined, CloseOutlined,
  ReloadOutlined, WarningOutlined, StopOutlined, CheckCircleOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import api from "../api/axios";

const PRIMARY = "#5c1a52";

const Inventory = () => {
  const [data, setData] = useState([]);
  const [counts, setCounts] = useState({ totalCount: 0, lowCount: 0, outCount: 0, inCount: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback((f = filter, s = search) => {
    setLoading(true);
    const params = {};
    if (f) params.filter = f;
    if (s) params.search = s;
    api.get("/admin/inventory", { params })
      .then(({ data: res }) => {
        setData(res.products);
        setCounts({ totalCount: res.totalCount, lowCount: res.lowCount, outCount: res.outCount, inCount: res.inCount });
      })
      .finally(() => setLoading(false));
  }, [filter, search]);

  useEffect(() => { fetchData(); }, []);

  const handleFilterChange = (val) => {
    setFilter(val || "");
    fetchData(val || "", search);
  };

  const handleSearch = (val) => {
    setSearch(val);
    fetchData(filter, val);
  };

  const startEdit = (record) => {
    setEditingId(record._id);
    setEditValue(record.stock);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue(0);
  };

  const saveStock = async (id) => {
    setSaving(true);
    try {
      await api.put(`/admin/inventory/${id}`, { stock: editValue });
      message.success("Stock updated");
      setEditingId(null);
      fetchData();
    } catch {
      message.error("Failed to update stock");
    } finally {
      setSaving(false);
    }
  };

  const stockTag = (stock) => {
    if (stock === 0) return <Tag color="red" icon={<StopOutlined />}>Out of Stock</Tag>;
    if (stock <= 10) return <Tag color="orange" icon={<WarningOutlined />}>Low: {stock}</Tag>;
    return <Tag color="green" icon={<CheckCircleOutlined />}>{stock}</Tag>;
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      render: (name, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {r.images?.[0]
            ? <img src={r.images[0]} alt={name} style={{ width: 42, height: 42, objectFit: "cover", borderRadius: 8, border: "1px solid #f0f0f0" }} />
            : <div style={{ width: 42, height: 42, background: "#f5f5f5", borderRadius: 8 }} />}
          <span style={{ fontWeight: 500 }}>{name}</span>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: ["category", "name"],
      render: (v) => <span style={{ color: "#888", fontSize: 13 }}>{v || "—"}</span>,
    },
    {
      title: "Price (AED)",
      dataIndex: "price",
      width: 120,
      render: (v) => <span style={{ fontWeight: 600 }}>AED {v}</span>,
    },
    {
      title: "Stock Status",
      dataIndex: "stock",
      width: 160,
      sorter: (a, b) => a.stock - b.stock,
      render: (stock) => stockTag(stock),
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      width: 140,
      render: (v) => new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    },
    {
      title: "Update Stock",
      width: 200,
      render: (_, r) =>
        editingId === r._id ? (
          <Space>
            <InputNumber
              min={0}
              value={editValue}
              onChange={setEditValue}
              size="small"
              style={{ width: 80 }}
              autoFocus
            />
            <Tooltip title="Save">
              <Button
                type="primary"
                size="small"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={() => saveStock(r._id)}
                style={{ background: PRIMARY }}
              />
            </Tooltip>
            <Tooltip title="Cancel">
              <Button size="small" icon={<CloseOutlined />} onClick={cancelEdit} />
            </Tooltip>
          </Space>
        ) : (
          <Button size="small" icon={<EditOutlined />} onClick={() => startEdit(r)}>
            Edit Stock
          </Button>
        ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Page Header Card ── */}
      <Card style={{ border: "1px solid #ebdcd0", borderRadius: 16, background: "#ffffff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontFamily: "Georgia, serif", fontWeight: 700, color: "#240821" }}>
              Warehouse Inventory
            </h2>
            <p style={{ margin: "4px 0 0", color: "#735e4d", fontSize: 13 }}>
              Real-time stock control, warehouse replenishments, and low inventory tracking.
            </p>
          </div>
          <div>
            <Button icon={<ReloadOutlined />} onClick={() => fetchData()} loading={loading}>
              Refresh Inventory
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 14, background: "#ffffff", border: "1px solid #ebdcd0" }}>
            <Statistic
              title="Total Products"
              value={counts.totalCount}
              prefix={<InboxOutlined style={{ color: PRIMARY }} />}
              valueStyle={{ color: PRIMARY, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 14, background: "#ffffff", border: "1px solid #bbf7d0" }}>
            <Statistic
              title="Healthy Stock (>10)"
              value={counts.inCount}
              prefix={<CheckCircleOutlined style={{ color: "#15803d" }} />}
              valueStyle={{ color: "#15803d", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 14, background: "#ffffff", border: counts.lowCount > 0 ? "1px solid #fde68a" : "1px solid #ebdcd0" }}>
            <Statistic
              title="Low Stock (≤10)"
              value={counts.lowCount}
              prefix={<WarningOutlined style={{ color: "#d97706" }} />}
              valueStyle={{ color: "#d97706", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 14, background: "#ffffff", border: counts.outCount > 0 ? "1px solid #fecaca" : "1px solid #ebdcd0" }}>
            <Statistic
              title="Out of Stock"
              value={counts.outCount}
              prefix={<StopOutlined style={{ color: "#dc2626" }} />}
              valueStyle={{ color: "#dc2626", fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ borderRadius: 12 }}>
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search product name..."
            style={{ width: 260 }}
            onPressEnter={(e) => handleSearch(e.target.value)}
            onChange={(e) => { if (!e.target.value) handleSearch(""); }}
          />
          <Select
            allowClear
            placeholder="All stock levels"
            style={{ width: 200 }}
            onChange={handleFilterChange}
            options={[
              { label: "In Stock (> 10)", value: "in" },
              { label: "Low Stock (1–10)", value: "low" },
              { label: "Out of Stock", value: "out" },
            ]}
          />
          <Tooltip title="Refresh">
            <Button icon={<ReloadOutlined />} onClick={() => fetchData(filter, search)} />
          </Tooltip>
        </Space>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}><Spin size="large" /></div>
        ) : (
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={data}
            pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `${t} products` }}
            rowClassName={(r) => r.stock === 0 ? "row-out-of-stock" : r.stock <= 10 ? "row-low-stock" : ""}
            locale={{ emptyText: "No products found" }}
          />
        )}
      </Card>

      <style>{`
        .row-out-of-stock td { background: #fff5f5 !important; }
        .row-low-stock td { background: #fffbeb !important; }
      `}</style>
    </div>
  );
};

export default Inventory;
