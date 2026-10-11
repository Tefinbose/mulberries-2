import { useEffect, useState, useMemo } from "react";
import {
  Button,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  message,
  Card,
  Input,
  Segmented,
  Avatar,
  Empty,
  Tooltip,
  Pagination,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  WhatsAppOutlined,
  CheckOutlined,
  SearchOutlined,
  MailOutlined,
  PhoneOutlined,
  MessageOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";

const PRIMARY = "#5c1a52";
const BORDER = "#ebdcd0";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'unread' | 'read'
  const [viewMode, setViewMode] = useState("auto"); // 'auto' | 'table' | 'cards'
  const [mobilePage, setMobilePage] = useState(1);
  const mobilePageSize = 8;

  const { unreadCount, markAsRead, markAllAsRead } = useNotification();

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/contacts");
      setContacts(data.contacts || []);
    } catch (err) {
      message.error(err.response?.data?.message || "Could not load contact messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleViewContact = (record) => {
    setSelectedContact(record);
    if (!record.isRead) {
      markAsRead(record._id);
      setContacts((prev) =>
        prev.map((item) => (item._id === record._id ? { ...item, isRead: true } : item))
      );
    }
  };

  const handleMarkAsRead = (id) => {
    markAsRead(id);
    setContacts((prev) =>
      prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
    );
    message.success("Marked inquiry as read");
  };

  const deleteContact = async (id) => {
    try {
      await api.delete(`/admin/contacts/${id}`);
      setContacts((items) => items.filter((item) => item._id !== id));
      if (selectedContact?._id === id) setSelectedContact(null);
      message.success("Contact message deleted");
    } catch (err) {
      message.error(err.response?.data?.message || "Delete failed");
    }
  };

  // Filter & Search logic
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Status filter
      if (filterStatus === "unread" && c.isRead) return false;
      if (filterStatus === "read" && !c.isRead) return false;

      // Search term match
      if (search.trim()) {
        const q = search.toLowerCase();
        const nameMatch = c.name?.toLowerCase().includes(q);
        const emailMatch = c.email?.toLowerCase().includes(q);
        const phoneMatch = c.phone?.toLowerCase().includes(q);
        const subjectMatch = c.subject?.toLowerCase().includes(q);
        const messageMatch = c.message?.toLowerCase().includes(q);
        return nameMatch || emailMatch || phoneMatch || subjectMatch || messageMatch;
      }
      return true;
    });
  }, [contacts, search, filterStatus]);

  // Mobile paginated slice
  const mobilePaginatedList = useMemo(() => {
    const start = (mobilePage - 1) * mobilePageSize;
    return filteredContacts.slice(start, start + mobilePageSize);
  }, [filteredContacts, mobilePage]);

  // Reset mobile page when filter/search changes
  useEffect(() => {
    setMobilePage(1);
  }, [search, filterStatus]);

  const readCount = contacts.length - unreadCount;

  // Format Date Helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-AE", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString("en-AE", { month: "short", day: "numeric" });
  };

  // Desktop Table Columns
  const columns = [
    {
      title: "Status",
      dataIndex: "isRead",
      width: 90,
      render: (isRead) =>
        !isRead ? (
          <Tag style={{ background: PRIMARY, color: "#f5d796", borderColor: PRIMARY, fontWeight: 700, borderRadius: 10, fontSize: 10.5 }}>
            NEW
          </Tag>
        ) : (
          <Tag style={{ background: "#f5f0eb", color: "#8c7766", borderColor: BORDER, borderRadius: 10, fontSize: 10.5 }}>
            Read
          </Tag>
        ),
    },
    {
      title: "Sender Name",
      dataIndex: "name",
      width: 140,
      render: (name, record) => (
        <span style={{ fontWeight: !record.isRead ? 700 : 600, color: "#240821" }}>
          {name}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 180,
      render: (email) => (
        <a href={`mailto:${email}`} style={{ color: PRIMARY, wordBreak: "break-all" }}>
          {email}
        </a>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      width: 150,
      render: (phone) => (
        <span>
          {phone || "—"}
          {phone && (
            <a
              href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              style={{ marginLeft: 8, color: "#25D366" }}
              title="Chat on WhatsApp"
            >
              <WhatsAppOutlined />
            </a>
          )}
        </span>
      ),
    },
    {
      title: "Subject",
      dataIndex: "subject",
      width: 150,
      render: (subject) => (
        <Tag style={{ background: "#faf5f9", borderColor: BORDER, color: PRIMARY, fontWeight: 600 }}>
          {subject || "General Inquiry"}
        </Tag>
      ),
    },
    {
      title: "Received",
      dataIndex: "createdAt",
      width: 140,
      render: (date) => (
        <span style={{ fontSize: 12, color: "#8c7766" }}>
          {formatDate(date)}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewContact(record)}
            style={{ borderColor: BORDER, color: PRIMARY }}
          >
            View
          </Button>
          {!record.isRead && (
            <Tooltip title="Mark as read">
              <Button
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleMarkAsRead(record._id)}
                style={{ borderColor: BORDER, color: "#15803d" }}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Delete this message?"
            description="This action cannot be undone."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => deleteContact(record._id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── 1. Page Header Card (Responsive) ── */}
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
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          {/* Title & Description */}
          <div style={{ minWidth: 260, flex: "1 1 auto" }}>
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
              Contact Enquiries
            </h2>
            <p style={{ margin: "4px 0 0", color: "#735e4d", fontSize: 13, lineHeight: 1.45 }}>
              Review customer communications, styling consultation requests, and support messages.
            </p>
          </div>

          {/* Quick Metrics & Global Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: PRIMARY,
                background: "#fcf3fa",
                padding: "6px 12px",
                borderRadius: 20,
                border: `1px solid ${BORDER}`,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              Total: <strong>{contacts.length}</strong>
            </span>

            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#92400e",
                  background: "#fef3c7",
                  padding: "6px 12px",
                  borderRadius: 20,
                  border: "1px solid #fde68a",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                {unreadCount} Unread
              </span>
            )}

            {unreadCount > 0 && (
              <Button
                icon={<CheckOutlined />}
                onClick={async () => {
                  await markAllAsRead();
                  setContacts((prev) => prev.map((item) => ({ ...item, isRead: true })));
                  message.success("All enquiries marked as read");
                }}
                style={{
                  borderColor: BORDER,
                  color: PRIMARY,
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 12.5,
                }}
              >
                Mark All Read
              </Button>
            )}

            <Button
              icon={<ReloadOutlined spin={loading} />}
              onClick={fetchContacts}
              loading={loading}
              style={{
                borderColor: BORDER,
                borderRadius: 10,
                fontWeight: 500,
                fontSize: 12.5,
              }}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* ── Filter & Search Toolbar (Full Width Responsive) ── */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid #f2e7de",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {/* Search Input */}
          <div style={{ flex: "1 1 260px", maxWidth: 420 }}>
            <Input
              allowClear
              prefix={<SearchOutlined style={{ color: "#8c7766" }} />}
              placeholder="Search by name, email, phone, message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                borderRadius: 10,
                borderColor: BORDER,
                height: 38,
                background: "#faf8f5",
              }}
            />
          </div>

          {/* Status Filter Segmented & View Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Segmented
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { label: `All (${contacts.length})`, value: "all" },
                { label: `Unread (${unreadCount})`, value: "unread" },
                { label: `Read (${readCount > 0 ? readCount : 0})`, value: "read" },
              ]}
              style={{ background: "#f5eee7", fontWeight: 600, borderRadius: 10, padding: 2 }}
            />

            {/* View Mode Toggle for Tablet/Desktop */}
            <div className="hide-on-mobile">
              <Segmented
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { value: "auto", icon: <UnorderedListOutlined title="Table View" /> },
                  { value: "cards", icon: <AppstoreOutlined title="Cards View" /> },
                ]}
                style={{ background: "#f5eee7", borderRadius: 10, padding: 2 }}
              />
            </div>

            <span style={{ fontSize: 12, color: "#8c7766", whiteSpace: "nowrap" }}>
              Showing {filteredContacts.length}
            </span>
          </div>
        </div>
      </Card>

      {/* ── 2. Mobile Cards View (Visible on Mobile or when Cards mode selected) ── */}
      <div
        className={viewMode === "cards" ? "show-always" : "contacts-mobile-view"}
        style={viewMode === "cards" ? { display: "block" } : undefined}
      >
        {filteredContacts.length === 0 ? (
          <Card
            style={{
              borderRadius: 16,
              border: `1px solid ${BORDER}`,
              background: "#ffffff",
              textAlign: "center",
              padding: "40px 16px",
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: "#735e4d", fontSize: 13 }}>
                  No customer enquiries match your filters
                </span>
              }
            />
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {mobilePaginatedList.map((item) => (
              <Card
                key={item._id}
                style={{
                  borderRadius: 14,
                  border: !item.isRead ? "1.5px solid #c49a45" : `1px solid ${BORDER}`,
                  background: !item.isRead ? "#fffdf8" : "#ffffff",
                  boxShadow: !item.isRead
                    ? "0 4px 16px rgba(196, 154, 69, 0.12)"
                    : "0 2px 8px rgba(92, 26, 82, 0.03)",
                  transition: "all 0.2s ease",
                }}
                bodyStyle={{ padding: "14px 16px" }}
              >
                {/* Card Top: Sender & Status */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <Avatar
                      style={{
                        background: !item.isRead ? PRIMARY : "#ecdcec",
                        color: !item.isRead ? "#f5d796" : PRIMARY,
                        fontWeight: 700,
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                      size={36}
                    >
                      {item.name ? item.name[0].toUpperCase() : "U"}
                    </Avatar>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: !item.isRead ? 700 : 600,
                          fontSize: 14.5,
                          color: "#240821",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.name}
                      </div>
                      <span style={{ fontSize: 11, color: "#8c7766" }}>
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div style={{ flexShrink: 0 }}>
                    {!item.isRead ? (
                      <Tag
                        style={{
                          background: PRIMARY,
                          color: "#f5d796",
                          borderColor: PRIMARY,
                          fontWeight: 700,
                          borderRadius: 12,
                          fontSize: 10.5,
                          margin: 0,
                          padding: "1px 8px",
                        }}
                      >
                        NEW
                      </Tag>
                    ) : (
                      <Tag
                        style={{
                          background: "#f5f0eb",
                          color: "#8c7766",
                          borderColor: BORDER,
                          borderRadius: 12,
                          fontSize: 10.5,
                          margin: 0,
                        }}
                      >
                        Read
                      </Tag>
                    )}
                  </div>
                </div>

                {/* Subject Badge */}
                <div style={{ marginTop: 10 }}>
                  <Tag
                    style={{
                      background: "#faf5f9",
                      borderColor: BORDER,
                      color: PRIMARY,
                      fontWeight: 600,
                      borderRadius: 6,
                      fontSize: 11.5,
                    }}
                  >
                    {item.subject || "General Inquiry"}
                  </Tag>
                </div>

                {/* Contact Channels Row (Email & Phone) */}
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    fontSize: 12.5,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <MailOutlined style={{ color: "#8c7766", fontSize: 13, flexShrink: 0 }} />
                    <a
                      href={`mailto:${item.email}`}
                      style={{
                        color: PRIMARY,
                        wordBreak: "break-all",
                        fontWeight: 500,
                      }}
                    >
                      {item.email}
                    </a>
                  </div>

                  {item.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <PhoneOutlined style={{ color: "#8c7766", fontSize: 13, flexShrink: 0 }} />
                      <span style={{ color: "#240821", fontWeight: 500 }}>{item.phone}</span>
                      <a
                        href={`https://wa.me/${item.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "#25D366",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: 11.5,
                          fontWeight: 600,
                          marginLeft: 6,
                          background: "#f0fdf4",
                          padding: "2px 7px",
                          borderRadius: 12,
                          border: "1px solid #bbf7d0",
                        }}
                      >
                        <WhatsAppOutlined /> WhatsApp
                      </a>
                    </div>
                  )}
                </div>

                {/* Message Preview Snippet */}
                {item.message && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: "#faf6f2",
                      border: "1px solid #ebdcd0",
                      fontSize: 12.5,
                      lineHeight: 1.45,
                      color: "#433227",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.message}
                  </div>
                )}

                {/* Card Action Buttons Bar */}
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: "1px solid #f2e7de",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <Button
                    type="primary"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewContact(item)}
                    style={{
                      background: PRIMARY,
                      borderColor: PRIMARY,
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 12,
                      height: 32,
                      flex: 1,
                    }}
                  >
                    View Details
                  </Button>

                  {!item.isRead && (
                    <Button
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={() => handleMarkAsRead(item._id)}
                      style={{
                        borderColor: BORDER,
                        color: "#15803d",
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: 12,
                        height: 32,
                      }}
                    >
                      Read
                    </Button>
                  )}

                  <Popconfirm
                    title="Delete message?"
                    description="Permanently remove this inquiry."
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => deleteContact(item._id)}
                  >
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      style={{ borderRadius: 8, height: 32 }}
                    />
                  </Popconfirm>
                </div>
              </Card>
            ))}

            {/* Mobile Pagination */}
            {filteredContacts.length > mobilePageSize && (
              <div style={{ textAlign: "center", marginTop: 8, marginBottom: 12 }}>
                <Pagination
                  current={mobilePage}
                  pageSize={mobilePageSize}
                  total={filteredContacts.length}
                  onChange={setMobilePage}
                  size="small"
                  showSizeChanger={false}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 3. Desktop Table Card (Visible on Desktop/Tablet or when Table forced) ── */}
      <div
        className={viewMode === "cards" ? "hide-always" : "contacts-desktop-view"}
        style={viewMode === "cards" ? { display: "none" } : undefined}
      >
        <Card
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            background: "#ffffff",
            boxShadow: "0 2px 10px rgba(92, 26, 82, 0.03)",
            overflow: "hidden",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={filteredContacts}
            loading={loading}
            scroll={{ x: 860 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              showTotal: (total) => `Total ${total} enquiries`,
            }}
            rowClassName={(record) => (!record.isRead ? "unread-contact-row" : "")}
          />
        </Card>
      </div>

      {/* ── 4. Responsive Inquiry Details Modal ── */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 20 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#faf5f9",
                border: `1px solid ${BORDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: PRIMARY,
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              <MailOutlined />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3
                style={{
                  margin: 0,
                  fontFamily: "Georgia, serif",
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#240821",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Inquiry from {selectedContact?.name}
              </h3>
              <span style={{ fontSize: 11, color: "#8c7766", fontWeight: 400 }}>
                {selectedContact && formatDate(selectedContact.createdAt)}
              </span>
            </div>
          </div>
        }
        open={Boolean(selectedContact)}
        onCancel={() => setSelectedContact(null)}
        centered
        width={580}
        style={{ maxWidth: "calc(100vw - 24px)" }}
        bodyStyle={{ padding: "16px 20px" }}
        footer={
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 6 }}>
            {/* Quick action buttons row (stacks cleanly on mobile) */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {selectedContact?.phone && (
                <Button
                  type="primary"
                  icon={<WhatsAppOutlined />}
                  href={`https://wa.me/${selectedContact.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  style={{
                    background: "#25D366",
                    borderColor: "#25D366",
                    fontWeight: 600,
                    borderRadius: 10,
                    height: 38,
                    flex: "1 1 140px",
                  }}
                >
                  Reply on WhatsApp
                </Button>
              )}
              <Button
                type="primary"
                icon={<MailOutlined />}
                href={`mailto:${selectedContact?.email}?subject=Re: ${encodeURIComponent(selectedContact?.subject || "Mulberries Dubai Inquiry")}`}
                style={{
                  background: PRIMARY,
                  borderColor: PRIMARY,
                  fontWeight: 600,
                  borderRadius: 10,
                  height: 38,
                  flex: "1 1 140px",
                }}
              >
                Reply via Email
              </Button>
            </div>

            <Button
              onClick={() => setSelectedContact(null)}
              style={{
                borderRadius: 10,
                borderColor: BORDER,
                height: 36,
                fontWeight: 500,
              }}
              block
            >
              Close
            </Button>
          </div>
        }
      >
        {selectedContact && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Subject & Status Banner */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 10,
                background: "#faf6f2",
                border: `1px solid ${BORDER}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "#735e4d", fontWeight: 600 }}>Subject:</span>
                <Tag
                  style={{
                    background: "#ffffff",
                    borderColor: BORDER,
                    color: PRIMARY,
                    fontWeight: 700,
                    borderRadius: 6,
                    margin: 0,
                    fontSize: 12,
                  }}
                >
                  {selectedContact.subject || "General Inquiry"}
                </Tag>
              </div>

              <div>
                {!selectedContact.isRead ? (
                  <Tag
                    style={{
                      background: PRIMARY,
                      color: "#f5d796",
                      borderColor: PRIMARY,
                      fontWeight: 700,
                      borderRadius: 10,
                      margin: 0,
                    }}
                  >
                    NEW
                  </Tag>
                ) : (
                  <Tag
                    style={{
                      background: "#f0fdf4",
                      color: "#15803d",
                      borderColor: "#bbf7d0",
                      fontWeight: 600,
                      borderRadius: 10,
                      margin: 0,
                    }}
                  >
                    Read
                  </Tag>
                )}
              </div>
            </div>

            {/* Sender Info Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 10,
              }}
            >
              {/* Email */}
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "#ffffff",
                  border: `1px solid ${BORDER}`,
                }}
              >
                <div
                  style={{
                    fontSize: 10.5,
                    color: "#8c7766",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}
                >
                  Email Address
                </div>
                <a
                  href={`mailto:${selectedContact.email}`}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: PRIMARY,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 3,
                    wordBreak: "break-all",
                  }}
                >
                  <MailOutlined /> {selectedContact.email}
                </a>
              </div>

              {/* Phone */}
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "#ffffff",
                  border: `1px solid ${BORDER}`,
                }}
              >
                <div
                  style={{
                    fontSize: 10.5,
                    color: "#8c7766",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}
                >
                  Phone Number
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#240821",
                    marginTop: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <PhoneOutlined style={{ color: "#8c7766" }} />
                  <span>{selectedContact.phone || "Not provided"}</span>
                  {selectedContact.phone && (
                    <a
                      href={`https://wa.me/${selectedContact.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#25D366", marginLeft: 4 }}
                      title="Open WhatsApp chat"
                    >
                      <WhatsAppOutlined style={{ fontSize: 15 }} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Client Message Content */}
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                background: "#faf8f5",
                border: `1px solid ${BORDER}`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#8c7766",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <MessageOutlined style={{ color: PRIMARY }} /> Client Message Content
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.65,
                  color: "#240821",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: 240,
                  overflowY: "auto",
                  paddingRight: 4,
                }}
              >
                {selectedContact.message}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Contacts;
