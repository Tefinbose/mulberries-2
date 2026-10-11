import { useEffect, useState } from "react";
import {
  Table, Button, Modal, Form, Input, Select, Checkbox, message,
  Popconfirm, Space, Tag, Switch, Card,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ALL_PERMISSIONS = [
  { label: "Dashboard & Reports", value: "reports" },
  { label: "Orders", value: "orders" },
  { label: "Products", value: "products" },
  { label: "Categories", value: "categories" },
  { label: "Inventory", value: "inventory" },
  { label: "Customers", value: "customers" },
  { label: "Shipping", value: "shipping" },
  { label: "Staff", value: "staff" },
];

const roleColor = { admin: "red", manager: "blue", staff: "green" };

const Staff = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchUsers = () => {
    setLoading(true);
    api.get("/admin/users")
      .then(({ data }) => setUsers(data.users))
      .finally(() => setLoading(false));
  };

  useEffect(fetchUsers, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      role: record.role,
      permissions: record.permissions || [],
      isActive: record.isActive,
      password: "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      message.success("Staff deleted");
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleSubmit = async (values) => {
    try {
      // remove empty password field if not changed
      const payload = { ...values };
      if (!payload.password) delete payload.password;

      if (editing) {
        await api.put(`/admin/users/${editing._id}`, payload);
        message.success("Updated successfully");
      } else {
        await api.post("/admin/users/staff", payload);
        message.success("Staff created");
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.message || "Save failed");
    }
  };

  const isSelf = (record) => record._id === currentUser?._id;

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) => <Tag color={roleColor[role] || "default"}>{role}</Tag>,
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      render: (perms, record) =>
        record.role === "admin" ? (
          <Tag color="red">Full Access</Tag>
        ) : perms?.length ? (
          perms.map((p) => <Tag key={p}>{p}</Tag>)
        ) : (
          <span style={{ color: "#aaa" }}>—</span>
        ),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      width: 80,
      render: (val, record) => (
        <Switch
          checked={val}
          size="small"
          onChange={async () => {
            await api.put(`/admin/users/${record._id}`, { isActive: !val });
            fetchUsers();
          }}
          disabled={isSelf(record)}
        />
      ),
    },
    {
      title: "Actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEdit(record)}
          />
          {/* Cannot delete yourself */}
          {!isSelf(record) && (
            <Popconfirm
              title={`Delete ${record.name}?`}
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record._id)}
              okText="Delete"
              okButtonProps={{ danger: true }}
            >
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
              Staff & Permission Management
            </h2>
            <p style={{ margin: "4px 0 0", color: "#735e4d", fontSize: 13 }}>
              Manage administrative team members, role assignments, and granular portal permissions.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#5c1a52", background: "#fcf3fa", padding: "6px 14px", borderRadius: 20, border: "1px solid #ebdcd0" }}>
              Total: {users.length} {users.length === 1 ? "member" : "members"}
            </span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreate}
              style={{ background: "#5c1a52", borderColor: "#5c1a52", fontWeight: 700 }}
            >
              Add Staff
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Table Card ── */}
      <Card style={{ border: "1px solid #ebdcd0", borderRadius: 16, background: "#ffffff", padding: 0 }}>
        <Table rowKey="_id" columns={columns} dataSource={users} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={<span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "#240821" }}>{editing ? `Edit — ${editing.name}` : "Add Staff"}</span>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
        width={520}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label={editing ? "New Password (leave blank to keep current)" : "Password"}
            name="password"
            rules={editing ? [] : [{ required: true, min: 6 }]}
          >
            <Input.Password placeholder={editing ? "Leave blank to keep current" : ""} />
          </Form.Item>

          {/* Role — admin can change role of non-self users */}
          {editing?.role !== "admin" && (
            <Form.Item label="Role" name="role" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: "Manager", value: "manager" },
                  { label: "Staff", value: "staff" },
                ]}
              />
            </Form.Item>
          )}

          {/* Permissions — only for non-admin */}
          {editing?.role !== "admin" && (
            <Form.Item label="Permissions" name="permissions">
              <Checkbox.Group>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {ALL_PERMISSIONS.map((p) => (
                    <Checkbox key={p.value} value={p.value}>{p.label}</Checkbox>
                  ))}
                </div>
              </Checkbox.Group>
            </Form.Item>
          )}

          {/* Active toggle — cannot deactivate yourself */}
          {editing && !isSelf(editing) && (
            <Form.Item label="Active" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Staff;
