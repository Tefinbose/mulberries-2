import { useEffect, useState, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Tabs,
  Tooltip,
} from "antd";
import {
  MailOutlined,
  DownloadOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  CopyOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  UsergroupAddOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
} from "@ant-design/icons";
import api from "../api/axios";

const PRIMARY = "#5c1a52";
const BORDER = "#ebdcd0";

const Newsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [unifiedContacts, setUnifiedContacts] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, thisMonth: 0, registeredCustomers: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingUnified, setLoadingUnified] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Fetch subscribers list
  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/newsletter");
      setSubscribers(data.subscribers || []);
      if (data.stats) setStats(data.stats);
    } catch {
      message.error("Could not load newsletter subscribers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch unified contacts list
  const fetchUnifiedContacts = async () => {
    setLoadingUnified(true);
    try {
      const { data } = await api.get("/admin/newsletter/all-contacts");
      setUnifiedContacts(data.contacts || []);
    } catch {
      // Graceful fallback
    } finally {
      setLoadingUnified(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
    fetchUnifiedContacts();
  }, []);

  // ── CSV Exporter Helper ────────────────────────────────────
  const downloadCSV = (filename, headers, rows) => {
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Newsletter Subscribers to CSV
  const exportSubscribersCSV = () => {
    const list = filteredSubscribers.length > 0 ? filteredSubscribers : subscribers;
    if (!list.length) {
      message.warning("No subscriber data to export");
      return;
    }
    const headers = ["Subscriber ID", "Email Address", "Name", "Phone Number", "Source", "Status", "Subscribed Date"];
    const rows = list.map((s) => [
      `"${s._id || ""}"`,
      `"${(s.email || "").replace(/"/g, '""')}"`,
      `"${(s.name || "").replace(/"/g, '""')}"`,
      `"${(s.phone || "").replace(/"/g, '""')}"`,
      `"${s.source || "footer_subscription"}"`,
      s.isActive !== false ? "Active" : "Inactive",
      s.createdAt ? new Date(s.createdAt).toISOString().split("T")[0] : "",
    ]);
    const today = new Date().toISOString().split("T")[0];
    downloadCSV(`mulberries-newsletter-subscribers-${today}.csv`, headers, rows);
    message.success(`Exported ${list.length} newsletter subscribers to CSV`);
  };

  // Export All Combined Contacts to CSV
  const exportAllContactsCSV = () => {
    if (!unifiedContacts.length) {
      message.warning("No contact records available");
      return;
    }
    const headers = ["Email Address", "Name", "Phone Number", "City / Location", "Contact Type", "Source", "Date Added"];
    const rows = unifiedContacts.map((c) => [
      `"${(c.email || "").replace(/"/g, '""')}"`,
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${(c.phone || "").replace(/"/g, '""')}"`,
      `"${(c.city || "").replace(/"/g, '""')}"`,
      `"${c.type || "Subscriber"}"`,
      `"${c.source || ""}"`,
      c.createdAt ? new Date(c.createdAt).toISOString().split("T")[0] : "",
    ]);
    const today = new Date().toISOString().split("T")[0];
    downloadCSV(`mulberries-all-contacts-${today}.csv`, headers, rows);
    message.success(`Exported ${unifiedContacts.length} total customer & subscriber contacts to CSV`);
  };

  // Copy all email addresses to clipboard
  const copyAllEmails = () => {
    const emailList = subscribers.map((s) => s.email).filter(Boolean);
    if (!emailList.length) {
      message.warning("No emails to copy");
      return;
    }
    const text = emailList.join(", ");
    navigator.clipboard.writeText(text).then(() => {
      message.success(`Copied ${emailList.length} email addresses to clipboard!`);
    });
  };

  // Add new subscriber
  const handleCreate = async (values) => {
    try {
      await api.post("/admin/newsletter", values);
      message.success("Subscriber added successfully");
      setModalOpen(false);
      form.resetFields();
      fetchSubscribers();
      fetchUnifiedContacts();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to add subscriber");
    }
  };

  // Toggle active status
  const handleToggleActive = async (id, isActive) => {
    try {
      await api.put(`/admin/newsletter/${id}`, { isActive });
      message.success(`Subscriber ${isActive ? "activated" : "deactivated"}`);
      fetchSubscribers();
    } catch {
      message.error("Failed to update subscriber status");
    }
  };

  // Delete subscriber
  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/newsletter/${id}`);
      message.success("Subscriber removed");
      fetchSubscribers();
      fetchUnifiedContacts();
    } catch {
      message.error("Failed to delete subscriber");
    }
  };

  // Filtered subscribers list
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((s) => {
      const matchSearch =
        !searchText ||
        (s.email && s.email.toLowerCase().includes(searchText.toLowerCase())) ||
        (s.name && s.name.toLowerCase().includes(searchText.toLowerCase())) ||
        (s.phone && s.phone.includes(searchText));

      const matchSource = sourceFilter === "all" ? true : s.source === sourceFilter;
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? s.isActive !== false
          : s.isActive === false;

      return matchSearch && matchSource && matchStatus;
    });
  }, [subscribers, searchText, sourceFilter, statusFilter]);

  const subscriberColumns = [
    {
      title: "Subscriber Email",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 600, color: PRIMARY, fontSize: 13.5 }}>{email}</span>
          <Tooltip title="Copy Email">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined style={{ fontSize: 12, color: "#8c7766" }} />}
              onClick={() => {
                navigator.clipboard.writeText(email);
                message.success("Email copied!");
              }}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name) => name || <span style={{ color: "#a8998c" }}>Not provided</span>,
    },
    {
      title: "Contact Number",
      dataIndex: "phone",
      key: "phone",
      render: (phone) =>
        phone ? (
          <a
            href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#15803d", fontSize: 12.5, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}
          >
            <PhoneOutlined /> {phone}
          </a>
        ) : (
          <span style={{ color: "#a8998c", fontSize: 12 }}>—</span>
        ),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (src) => {
        const labels = {
          footer_subscription: { text: "Website Footer", color: "purple" },
          customer_account: { text: "Account Creation", color: "blue" },
          checkout: { text: "Checkout", color: "green" },
          manual_admin: { text: "Admin Added", color: "gold" },
          website: { text: "Website Form", color: "purple" },
        };
        const conf = labels[src] || { text: src || "Website", color: "default" };
        return <Tag color={conf.color}>{conf.text}</Tag>;
      },
    },
    {
      title: "Date Subscribed",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d) => (
        <span style={{ fontSize: 12, color: "#8c7766" }}>
          {new Date(d).toLocaleDateString("en-AE", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (active, r) => (
        <Switch
          checked={active !== false}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          onChange={(checked) => handleToggleActive(r._id, checked)}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_, r) => (
        <Popconfirm
          title="Remove this subscriber?"
          description="Are you sure you want to remove this email address?"
          onConfirm={() => handleDelete(r._id)}
          okText="Yes, Remove"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  const unifiedColumns = [
    {
      title: "Email Address",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <strong style={{ color: "#240821" }}>{email}</strong>
          <Tooltip title="Copy Email">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined style={{ fontSize: 11 }} />}
              onClick={() => {
                navigator.clipboard.writeText(email);
                message.success("Email copied!");
              }}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Full Name",
      dataIndex: "name",
      key: "name",
      render: (name) => name || <span style={{ color: "#a8998c" }}>—</span>,
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => phone || <span style={{ color: "#a8998c" }}>—</span>,
    },
    {
      title: "Location",
      dataIndex: "city",
      key: "city",
      render: (city) => city || <span style={{ color: "#a8998c" }}>UAE</span>,
    },
    {
      title: "Audience Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        let color = "blue";
        if (type === "Customer & Subscriber") color = "magenta";
        else if (type === "Newsletter Subscriber") color = "purple";
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: "Date Added",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d) => (
        <span style={{ fontSize: 12, color: "#8c7766" }}>
          {new Date(d).toLocaleDateString("en-AE", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* ── Page Header Card ── */}
      <Card
        style={{
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          background: "#ffffff",
          boxShadow: "0 2px 10px rgba(92, 26, 82, 0.03)",
        }}
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
                color: "#240821",
                fontWeight: 700,
              }}
            >
              Newsletter & Audience Directory
            </h2>
            <p style={{ margin: "3px 0 0", color: "#735e4d", fontSize: 13 }}>
              Collect, monitor, and export all client email addresses and contact information for marketing campaigns.
            </p>
          </div>

          <Space wrap>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={exportSubscribersCSV}
              style={{
                background: PRIMARY,
                borderRadius: 8,
                fontWeight: 600,
                height: 38,
                boxShadow: "0 2px 8px rgba(92, 26, 82, 0.2)",
              }}
            >
              Export Subscribers (CSV)
            </Button>

            <Button
              icon={<DownloadOutlined />}
              onClick={exportAllContactsCSV}
              style={{ borderRadius: 8, height: 38, borderColor: "#c49a45", color: "#92400e", fontWeight: 600 }}
            >
              Export All Contacts ({unifiedContacts.length})
            </Button>

            <Button
              icon={<CopyOutlined />}
              onClick={copyAllEmails}
              style={{ borderRadius: 8, height: 38, borderColor: BORDER }}
            >
              Copy All Emails
            </Button>

            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setModalOpen(true);
              }}
              style={{ borderRadius: 8, height: 38, borderColor: BORDER, color: PRIMARY, fontWeight: 600 }}
            >
              Add Subscriber
            </Button>

            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchSubscribers();
                fetchUnifiedContacts();
              }}
              loading={loading}
              style={{ borderRadius: 8, height: 38, borderColor: BORDER }}
            >
              Refresh
            </Button>
          </Space>
        </div>

        {/* Audience Metric Strip */}
        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid #f5ede8",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <div style={{ fontSize: 11.5, color: "#8c7766", textTransform: "uppercase", fontWeight: 600 }}>
                Total Subscribers
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: PRIMARY, marginTop: 2 }}>
                {stats.total || subscribers.length}
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ fontSize: 11.5, color: "#8c7766", textTransform: "uppercase", fontWeight: 600 }}>
                Active Subscribers
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#15803d", marginTop: 2 }}>
                {stats.active || subscribers.filter((s) => s.isActive !== false).length}
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ fontSize: 11.5, color: "#8c7766", textTransform: "uppercase", fontWeight: 600 }}>
                New This Month
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#c49a45", marginTop: 2 }}>
                +{stats.thisMonth || 0}
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ fontSize: 11.5, color: "#8c7766", textTransform: "uppercase", fontWeight: 600 }}>
                Total Platform Contacts
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#240821", marginTop: 2 }}>
                {unifiedContacts.length || stats.registeredCustomers + (stats.total || 0)}
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      {/* ── Tabs: Subscribers vs Unified Marketing List ── */}
      <Card
        style={{
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          background: "#ffffff",
          boxShadow: "0 2px 10px rgba(92, 26, 82, 0.03)",
        }}
      >
        <Tabs
          defaultActiveKey="subscribers"
          items={[
            {
              key: "subscribers",
              label: (
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  ✉️ Newsletter Subscribers ({filteredSubscribers.length})
                </span>
              ),
              children: (
                <div>
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
                    <Input
                      placeholder="Search subscribers by email, name, or phone..."
                      prefix={<SearchOutlined style={{ color: "#8c7766" }} />}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      allowClear
                      style={{ maxWidth: 360, borderRadius: 8 }}
                    />

                    <Space wrap>
                      <span style={{ fontSize: 13, color: "#735e4d" }}>Source:</span>
                      <Select
                        value={sourceFilter}
                        onChange={setSourceFilter}
                        style={{ width: 160 }}
                        options={[
                          { label: "All Sources", value: "all" },
                          { label: "Website Footer", value: "footer_subscription" },
                          { label: "Account Signup", value: "customer_account" },
                          { label: "Admin Added", value: "manual_admin" },
                        ]}
                      />

                      <span style={{ fontSize: 13, color: "#735e4d", marginLeft: 6 }}>Status:</span>
                      <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ width: 130 }}
                        options={[
                          { label: "All Status", value: "all" },
                          { label: "Active Only", value: "active" },
                          { label: "Inactive Only", value: "inactive" },
                        ]}
                      />
                    </Space>
                  </div>

                  <Table
                    rowKey="_id"
                    columns={subscriberColumns}
                    dataSource={filteredSubscribers}
                    loading={loading}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      pageSizeOptions: ["10", "25", "50", "100"],
                    }}
                    scroll={{ x: 800 }}
                  />
                </div>
              ),
            },
            {
              key: "all_contacts",
              label: (
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  👥 All Platform Contacts ({unifiedContacts.length})
                </span>
              ),
              children: (
                <div>
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
                    <span style={{ fontSize: 13, color: "#735e4d" }}>
                      Combined directory of all user emails and contact details across registered accounts and newsletter subscribers.
                    </span>

                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={exportAllContactsCSV}
                      size="small"
                      style={{ background: PRIMARY, borderRadius: 6 }}
                    >
                      Export All ({unifiedContacts.length}) to CSV
                    </Button>
                  </div>

                  <Table
                    rowKey="email"
                    columns={unifiedColumns}
                    dataSource={unifiedContacts}
                    loading={loadingUnified}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    scroll={{ x: 800 }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* ── Add Subscriber Modal ── */}
      <Modal
        title={
          <span style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#240821" }}>
            Add Newsletter Subscriber
          </span>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Please enter an email address" },
              { type: "email", message: "Please enter a valid email address" },
            ]}
          >
            <Input placeholder="e.g. client@example.com" />
          </Form.Item>

          <Form.Item name="name" label="Full Name (Optional)">
            <Input placeholder="e.g. Fatima Al Mansoori" />
          </Form.Item>

          <Form.Item name="phone" label="Phone / WhatsApp (Optional)">
            <Input placeholder="e.g. +971 50 123 4567" />
          </Form.Item>

          <Form.Item name="source" label="Subscription Source" initialValue="manual_admin">
            <Select
              options={[
                { label: "Admin Added / Customer Support", value: "manual_admin" },
                { label: "Website Footer", value: "footer_subscription" },
                { label: "Customer Account", value: "customer_account" },
              ]}
            />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: PRIMARY }}>
              Add to Newsletter List
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Newsletter;
