import { useEffect, useState } from "react";
import {
  Table, Button, Modal, Form, Input, InputNumber, Select,
  Switch, DatePicker, message, Popconfirm, Space, Tag, Tooltip, Card,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Coupons = () => {
  const { isAdmin } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchCoupons = () => {
    setLoading(true);
    api.get("/admin/coupons")
      .then(({ data }) => setCoupons(data.coupons || []))
      .catch((err) => {
        message.error("Failed to load coupons");
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchCoupons, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      expiresAt: record.expiresAt ? dayjs(record.expiresAt) : null,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/coupons/${id}`);
      message.success("Coupon deleted");
      fetchCoupons();
    } catch (err) {
      message.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      code: values.code?.toUpperCase().trim(),
      discountValue: Number(values.discountValue) || 0,
      minOrderValue: Number(values.minOrderValue) || 0,
      maxDiscount: values.maxDiscount ? Number(values.maxDiscount) : null,
      usageLimit: values.usageLimit ? Number(values.usageLimit) : null,
      expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
    };
    try {
      if (editing) {
        await api.put(`/admin/coupons/${editing._id}`, payload);
        message.success("Coupon updated");
      } else {
        await api.post("/admin/coupons", payload);
        message.success("Coupon created");
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      message.error(err.response?.data?.message || "Save failed");
    }
  };

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      render: (code) => <Tag color="purple" style={{ fontFamily: "monospace", fontSize: 13 }}>{code}</Tag>,
    },
    { title: "Description", dataIndex: "description", render: (d) => d || "—" },
    {
      title: "Discount",
      render: (_, r) =>
        r.discountType === "percentage"
          ? `${r.discountValue}%${r.maxDiscount ? ` (max AED ${r.maxDiscount})` : ""}`
          : `AED ${r.discountValue}`,
    },
    {
      title: "Min Order",
      dataIndex: "minOrderValue",
      render: (v) => v ? `AED ${v}` : "—",
    },
    {
      title: "Usage",
      render: (_, r) =>
        r.usageLimit ? `${r.usedCount} / ${r.usageLimit}` : `${r.usedCount} / ∞`,
    },
    {
      title: "Expires",
      dataIndex: "expiresAt",
      render: (d) => d ? new Date(d).toLocaleDateString() : "Never",
    },
    {
      title: "Active",
      dataIndex: "isActive",
      render: (v) => <Tag color={v ? "green" : "red"}>{v ? "Active" : "Inactive"}</Tag>,
    },
    {
      title: "Actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          {isAdmin && (
            <Popconfirm title="Delete this coupon?" onConfirm={() => handleDelete(record._id)}>
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          )}
        </Space>
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
              Promotional Coupons
            </h2>
            <p style={{ margin: "4px 0 0", color: "#735e4d", fontSize: 13 }}>
              Create discount promo codes, cart incentives, and seasonal holiday offers.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#5c1a52", background: "#fcf3fa", padding: "6px 14px", borderRadius: 20, border: "1px solid #ebdcd0" }}>
              Active: {coupons.filter(c => c.isActive).length} / {coupons.length} coupons
            </span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreate}
              style={{ background: "#5c1a52", borderColor: "#5c1a52", fontWeight: 700 }}
            >
              New Coupon
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Table Card ── */}
      <Card style={{ border: "1px solid #ebdcd0", borderRadius: 16, background: "#ffffff", padding: 0 }}>
        <Table rowKey="_id" columns={columns} dataSource={coupons} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={<span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "#240821" }}>{editing ? "Edit Coupon" : "New Coupon"}</span>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
        width={520}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit} initialValues={{ isActive: true, discountType: "percentage", minOrderValue: 0 }}>
          <Form.Item label="Coupon Code" name="code" rules={[{ required: true }]}>
            <Input placeholder="e.g. WELCOME10" style={{ textTransform: "uppercase" }} />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input placeholder="e.g. 10% off on first order" />
          </Form.Item>
          <Space style={{ width: "100%" }} size="large">
            <Form.Item label="Discount Type" name="discountType" rules={[{ required: true }]}>
              <Select style={{ width: 150 }} options={[{ label: "Percentage (%)", value: "percentage" }, { label: "Fixed (AED)", value: "fixed" }]} />
            </Form.Item>
            <Form.Item label="Discount Value" name="discountValue" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: 130 }} />
            </Form.Item>
          </Space>
          <Space style={{ width: "100%" }} size="large">
            <Form.Item label="Min Order (AED)" name="minOrderValue">
              <InputNumber min={0} style={{ width: 150 }} />
            </Form.Item>
            <Form.Item label="Max Discount (AED)" name="maxDiscount">
              <Tooltip title="Cap for percentage discounts. Leave blank for no cap.">
                <InputNumber min={0} style={{ width: 150 }} placeholder="No cap" />
              </Tooltip>
            </Form.Item>
          </Space>
          <Space style={{ width: "100%" }} size="large">
            <Form.Item label="Usage Limit" name="usageLimit">
              <InputNumber min={1} style={{ width: 150 }} placeholder="Unlimited" />
            </Form.Item>
            <Form.Item label="Expires At" name="expiresAt">
              <DatePicker style={{ width: 170 }} />
            </Form.Item>
          </Space>
          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Coupons;
