import { useEffect, useState, useMemo } from "react";
import {
  Table,
  Card,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Row,
  Col,
  Tooltip,
  Avatar,
  Modal,
  Descriptions,
  Badge,
  Form,
  DatePicker,
  Divider,
  Progress,
  message,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
  EyeOutlined,
  HistoryOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import {
  LuCircleCheck,
  LuTriangleAlert,
  LuCircleX,
  LuListFilter,
  LuLayers,
  LuShoppingBag,
  LuBoxes,
  LuFolderTree,
  LuTag,
  LuUsers,
  LuUserCheck,
  LuMail,
  LuMessageSquare,
  LuKeyRound,
  LuGlobe,
  LuActivity,
  LuArrowRightLeft,
  LuSquarePen,
  LuCirclePlus,
  LuTrash2,
  LuLogIn,
  LuShieldCheck,
  LuPackage,
} from "react-icons/lu";
import api from "../api/axios";

const PRIMARY = "#5c1a52";
const BORDER = "#ebdcd0";

// Module visual styling with React Icons
const moduleMeta = {
  orders: { label: "Orders", color: "#7b1f6a", bg: "#fdf2f8", border: "#fbcfe8", icon: <LuShoppingBag /> },
  products: { label: "Products", color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd", icon: <LuPackage /> },
  inventory: { label: "Inventory", color: "#b45309", bg: "#fffbeb", border: "#fde68a", icon: <LuBoxes /> },
  categories: { label: "Categories", color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe", icon: <LuFolderTree /> },
  coupons: { label: "Coupons", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", icon: <LuTag /> },
  staff: { label: "Staff", color: "#9333ea", bg: "#faf5ff", border: "#e9d5ff", icon: <LuUsers /> },
  customers: { label: "Customers", color: "#0d9488", bg: "#f0fdfa", border: "#99f6e4", icon: <LuUserCheck /> },
  newsletter: { label: "Newsletter", color: "#c026d3", bg: "#fdf4ff", border: "#f5d0fe", icon: <LuMail /> },
  contacts: { label: "Contacts", color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: <LuMessageSquare /> },
  auth: { label: "Authentication", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", icon: <LuKeyRound /> },
  system: { label: "System", color: "#475569", bg: "#f8fafc", border: "#e2e8f0", icon: <LuGlobe /> },
};

// Select dropdown options styled with React Icons
const statusOptions = [
  {
    value: "all",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuListFilter style={{ color: "#786657", fontSize: 14 }} />
        <span>All Statuses</span>
      </span>
    ),
  },
  {
    value: "success",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuCircleCheck style={{ color: "#16a34a", fontSize: 14 }} />
        <span>Success Only</span>
      </span>
    ),
  },
  {
    value: "warning",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuTriangleAlert style={{ color: "#d97706", fontSize: 14 }} />
        <span>Warnings & Alerts</span>
      </span>
    ),
  },
  {
    value: "error",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuCircleX style={{ color: "#dc2626", fontSize: 14 }} />
        <span>Issues & Errors</span>
      </span>
    ),
  },
];

const moduleOptions = [
  {
    value: "all",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuLayers style={{ color: "#786657", fontSize: 14 }} />
        <span>All Modules</span>
      </span>
    ),
  },
  {
    value: "orders",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuShoppingBag style={{ color: "#7b1f6a", fontSize: 14 }} />
        <span>Orders</span>
      </span>
    ),
  },
  {
    value: "inventory",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuBoxes style={{ color: "#b45309", fontSize: 14 }} />
        <span>Inventory</span>
      </span>
    ),
  },
  {
    value: "products",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuPackage style={{ color: "#0369a1", fontSize: 14 }} />
        <span>Products</span>
      </span>
    ),
  },
  {
    value: "categories",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuFolderTree style={{ color: "#4f46e5", fontSize: 14 }} />
        <span>Categories</span>
      </span>
    ),
  },
  {
    value: "coupons",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuTag style={{ color: "#059669", fontSize: 14 }} />
        <span>Coupons</span>
      </span>
    ),
  },
  {
    value: "staff",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuUsers style={{ color: "#9333ea", fontSize: 14 }} />
        <span>Staff</span>
      </span>
    ),
  },
  {
    value: "customers",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuUserCheck style={{ color: "#0d9488", fontSize: 14 }} />
        <span>Customers</span>
      </span>
    ),
  },
  {
    value: "newsletter",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuMail style={{ color: "#c026d3", fontSize: 14 }} />
        <span>Newsletter</span>
      </span>
    ),
  },
  {
    value: "contacts",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuMessageSquare style={{ color: "#d97706", fontSize: 14 }} />
        <span>Contacts</span>
      </span>
    ),
  },
  {
    value: "auth",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuKeyRound style={{ color: "#2563eb", fontSize: 14 }} />
        <span>Auth / Logins</span>
      </span>
    ),
  },
];

const actionOptions = [
  {
    value: "all",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuActivity style={{ color: "#786657", fontSize: 14 }} />
        <span>All Actions</span>
      </span>
    ),
  },
  {
    value: "STATUS_CHANGE",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuArrowRightLeft style={{ color: "#7b1f6a", fontSize: 14 }} />
        <span>Status Change</span>
      </span>
    ),
  },
  {
    value: "UPDATE",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuSquarePen style={{ color: "#2563eb", fontSize: 14 }} />
        <span>Update</span>
      </span>
    ),
  },
  {
    value: "CREATE",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuCirclePlus style={{ color: "#16a34a", fontSize: 14 }} />
        <span>Create</span>
      </span>
    ),
  },
  {
    value: "DELETE",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuTrash2 style={{ color: "#dc2626", fontSize: 14 }} />
        <span>Delete</span>
      </span>
    ),
  },
  {
    value: "LOGIN",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuLogIn style={{ color: "#0891b2", fontSize: 14 }} />
        <span>Login</span>
      </span>
    ),
  },
  {
    value: "BULK_ACTION",
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <LuLayers style={{ color: "#ea580c", fontSize: 14 }} />
        <span>Bulk Action</span>
      </span>
    ),
  },
];


// Action visual styling
const actionMeta = {
  CREATE: { color: "green", label: "Created" },
  UPDATE: { color: "blue", label: "Updated" },
  DELETE: { color: "red", label: "Deleted" },
  STATUS_CHANGE: { color: "purple", label: "Status Changed" },
  LOGIN: { color: "cyan", label: "Logged In" },
  BULK_ACTION: { color: "orange", label: "Bulk Action" },
  OTHER: { color: "default", label: "Other" },
};

// Role styling
const roleBadge = {
  admin: { label: "Super Admin", color: "#5c1a52", bg: "#fcf3fa" },
  manager: { label: "Manager", color: "#15803d", bg: "#f0fdf4" },
  staff: { label: "Staff", color: "#1d4ed8", bg: "#eff6ff" },
  system: { label: "System", color: "#475569", bg: "#f8fafc" },
};

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStaffList, setSelectedStaffList] = useState([]);

  // Modals
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [flagging, setFlagging] = useState(false);
  const [form] = Form.useForm();

  // Fetch summary metrics
  const fetchSummary = async () => {
    try {
      const res = await api.get("/admin/activity-logs/summary");
      if (res.data?.success) {
        setSummary(res.data.summary);
        if (res.data.summary?.staffPerformance) {
          setSelectedStaffList(res.data.summary.staffPerformance);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch activity summary:", err.message);
    }
  };

  // Fetch logs with active filters
  const fetchLogs = async (currentPage = page, currentSize = pageSize) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: currentSize,
      };
      if (search.trim()) params.search = search.trim();
      if (moduleFilter !== "all") params.module = moduleFilter;
      if (actionFilter !== "all") params.action = actionFilter;
      if (userFilter !== "all") params.userId = userFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await api.get("/admin/activity-logs", { params });
      if (res.data?.success) {
        setLogs(res.data.logs || []);
        setTotal(res.data.total || 0);
        setPage(res.data.page || 1);
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchLogs(1, pageSize);
  }, [moduleFilter, actionFilter, userFilter, statusFilter]);

  const handleSearch = () => {
    fetchLogs(1, pageSize);
  };

  const resetFilters = () => {
    setSearch("");
    setModuleFilter("all");
    setActionFilter("all");
    setUserFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  // Submit manual issue report
  const handleFlagIssue = async (values) => {
    setFlagging(true);
    try {
      const res = await api.post("/admin/activity-logs/flag-issue", values);
      if (res.data?.success) {
        message.success("Operational issue recorded in history");
        setIssueModalOpen(false);
        form.resetFields();
        fetchSummary();
        fetchLogs(1, pageSize);
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to record issue");
    } finally {
      setFlagging(false);
    }
  };

  // Columns for the Activity Log table
  const columns = [
    {
      title: "Performer / Staff",
      dataIndex: "userName",
      key: "performer",
      width: 220,
      render: (_, record) => {
        const role = roleBadge[record.userRole] || roleBadge.staff;
        return (
          <Space align="center" style={{ minWidth: 160 }}>
            <Avatar
              style={{
                backgroundColor: role.color,
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {record.userName ? record.userName[0].toUpperCase() : "U"}
            </Avatar>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontWeight: 600, color: "#240821", fontSize: 13 }}>
                {record.userName}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
                <Tag
                  style={{
                    margin: 0,
                    fontSize: 10,
                    padding: "0 6px",
                    borderRadius: 8,
                    background: role.bg,
                    color: role.color,
                    border: "none",
                    fontWeight: 600,
                  }}
                >
                  {role.label}
                </Tag>
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Action & Module",
      key: "action_module",
      width: 200,
      render: (_, record) => {
        const act = actionMeta[record.action] || actionMeta.OTHER;
        const mod = moduleMeta[record.module] || moduleMeta.system;
        return (
          <Space direction="vertical" size={2}>
            <Tag color={act.color} style={{ fontWeight: 600, borderRadius: 6, margin: 0 }}>
              {act.label}
            </Tag>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11.5,
                color: mod.color,
                fontWeight: 600,
              }}
            >
              {mod.icon} {mod.label}
            </span>
          </Space>
        );
      },
    },
    {
      title: "Operation Summary & Target",
      key: "description",
      render: (_, record) => {
        return (
          <div style={{ maxWidth: 440 }}>
            <div style={{ fontSize: 13, color: "#240821", lineHeight: 1.45, fontWeight: 500 }}>
              {record.description}
            </div>
            {record.resourceTitle && (
              <div style={{ fontSize: 11.5, color: "#8c7766", marginTop: 3 }}>
                <strong>Target:</strong> {record.resourceTitle}
              </div>
            )}
            {record.errorMessage && (
              <div style={{ fontSize: 11.5, color: "#b91c1c", marginTop: 3, background: "#fef2f2", padding: "2px 6px", borderRadius: 4 }}>
                ⚠️ <strong>Issue Detail:</strong> {record.errorMessage}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => {
        if (status === "error") {
          return (
            <Tag color="error" style={{ borderRadius: 6, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
              <LuCircleX size={13} /> Issue / Error
            </Tag>
          );
        }
        if (status === "warning") {
          return (
            <Tag color="warning" style={{ borderRadius: 6, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
              <LuTriangleAlert size={13} /> Alert
            </Tag>
          );
        }
        return (
          <Tag color="success" style={{ borderRadius: 6, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <LuCircleCheck size={13} /> Success
          </Tag>
        );
      },
    },
    {
      title: "Date & Time",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      render: (dateStr) => {
        if (!dateStr) return "—";
        const date = new Date(dateStr);
        return (
          <div style={{ fontSize: 12, lineHeight: 1.35 }}>
            <div style={{ color: "#240821", fontWeight: 600 }}>
              {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
            <div style={{ color: "#8c7766", fontSize: 11 }}>
              {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "ops",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Inspect Details & Payload">
          <Button
            type="text"
            icon={<EyeOutlined />}
            style={{ color: PRIMARY }}
            onClick={() => {
              setSelectedLog(record);
              setDetailModalOpen(true);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: "0 4px" }}>
      {/* ── Page Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#240821",
              margin: 0,
              fontFamily: "Georgia, serif",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <HistoryOutlined style={{ color: PRIMARY }} /> Operation History & Staff Audit Trail
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#786657", fontSize: 13 }}>
            Monitor operations performed by administrators and staff members to evaluate performance and track operational issues.
          </p>
        </div>

        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              fetchSummary();
              fetchLogs(page, pageSize);
            }}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<AlertOutlined />}
            style={{ background: PRIMARY, borderColor: PRIMARY }}
            onClick={() => setIssueModalOpen(true)}
          >
            Flag Operational Issue
          </Button>
        </Space>
      </div>

      {/* ── KPI Cards ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card
            variant="borderless"
            style={{
              borderRadius: 14,
              boxShadow: "0 2px 12px rgba(92, 26, 82, 0.04)",
              border: `1px solid ${BORDER}`,
              background: "#ffffff",
            }}
          >
            <div style={{ fontSize: 11.5, color: "#8c7766", fontWeight: 600, textTransform: "uppercase" }}>
              Total Operations
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: PRIMARY, marginTop: 4 }}>
              {summary?.totalLogs ?? total}
            </div>
            <div style={{ fontSize: 11, color: "#15803d", marginTop: 2 }}>
              Audit log is active
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card
            variant="borderless"
            style={{
              borderRadius: 14,
              boxShadow: "0 2px 12px rgba(92, 26, 82, 0.04)",
              border: `1px solid ${BORDER}`,
              background: "#ffffff",
            }}
          >
            <div style={{ fontSize: 11.5, color: "#8c7766", fontWeight: 600, textTransform: "uppercase" }}>
              Actions Today
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#240821", marginTop: 4 }}>
              {summary?.todayCount ?? 0}
            </div>
            <div style={{ fontSize: 11, color: "#8c7766", marginTop: 2 }}>
              Operations performed today
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card
            variant="borderless"
            style={{
              borderRadius: 14,
              boxShadow: "0 2px 12px rgba(92, 26, 82, 0.04)",
              border: `1px solid ${BORDER}`,
              background: "#ffffff",
            }}
          >
            <div style={{ fontSize: 11.5, color: "#8c7766", fontWeight: 600, textTransform: "uppercase" }}>
              Active Staff (30d)
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#1d4ed8", marginTop: 4 }}>
              {summary?.staffPerformance?.length ?? 0}
            </div>
            <div style={{ fontSize: 11, color: "#8c7766", marginTop: 2 }}>
              Staff members on record
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card
            variant="borderless"
            style={{
              borderRadius: 14,
              boxShadow: "0 2px 12px rgba(92, 26, 82, 0.04)",
              border: `1px solid ${BORDER}`,
              background: "#ffffff",
            }}
          >
            <div style={{ fontSize: 11.5, color: "#8c7766", fontWeight: 600, textTransform: "uppercase" }}>
              Issues & Alerts
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: (summary?.issueCount || 0) > 0 ? "#b91c1c" : "#15803d",
                marginTop: 4,
              }}
            >
              {summary?.issueCount ?? 0}
            </div>
            <div style={{ fontSize: 11, color: "#8c7766", marginTop: 2 }}>
              {(summary?.issueCount || 0) > 0 ? "Requires review" : "No open issues"}
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── Staff Performance Overview Bar ── */}
      {summary?.staffPerformance?.length > 0 && (
        <Card
          variant="borderless"
          style={{
            borderRadius: 14,
            marginBottom: 20,
            border: `1px solid ${BORDER}`,
            background: "#ffffff",
            boxShadow: "0 2px 12px rgba(92, 26, 82, 0.03)",
          }}
          title={
            <span style={{ fontSize: 14, fontWeight: 700, color: "#240821" }}>
              <LuUsers style={{ color: PRIMARY, marginRight: 6, verticalAlign: "middle" }} /> Staff Performance & Issue Tracking (Past 30 Days)
            </span>
          }
        >
          <Row gutter={[16, 16]}>
            {summary.staffPerformance.map((staff) => {
              const role = roleBadge[staff.role] || roleBadge.staff;
              const isSelected = userFilter === String(staff.userId);
              return (
                <Col xs={24} sm={12} md={8} lg={6} key={String(staff.userId || staff.email)}>
                  <div
                    onClick={() => {
                      if (staff.userId) {
                        setUserFilter(isSelected ? "all" : String(staff.userId));
                      }
                    }}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: `1.5px solid ${isSelected ? PRIMARY : "#ebdcd0"}`,
                      background: isSelected ? "#faf2f8" : "#fdfbf9",
                      cursor: staff.userId ? "pointer" : "default",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar style={{ backgroundColor: role.color, color: "#ffffff", fontWeight: 700, fontSize: 11 }}>
                          {staff.name ? staff.name[0].toUpperCase() : "U"}
                        </Avatar>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#240821" }}>
                            {staff.name}
                          </div>
                          <Tag
                            style={{
                              margin: 0,
                              fontSize: 9.5,
                              padding: "0 5px",
                              borderRadius: 6,
                              background: role.bg,
                              color: role.color,
                              border: "none",
                              fontWeight: 600,
                            }}
                          >
                            {role.label}
                          </Tag>
                        </div>
                      </div>

                      {staff.issuesCount > 0 ? (
                        <Tooltip title={`${staff.issuesCount} issue(s) / warning(s) associated with this account`}>
                          <Tag
                            color="error"
                            style={{
                              borderRadius: 8,
                              margin: 0,
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <LuTriangleAlert size={12} /> {staff.issuesCount}
                          </Tag>
                        </Tooltip>
                      ) : (
                        <Tag
                          color="success"
                          style={{
                            borderRadius: 8,
                            margin: 0,
                            fontSize: 10.5,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <LuShieldCheck size={12} /> Clean
                        </Tag>
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginTop: 10, color: "#786657" }}>
                      <span>Total Operations: <strong>{staff.totalActions}</strong></span>
                      <span>Today: <strong>{staff.todayActions}</strong></span>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </Card>
      )}

      {/* ── Filters & Search Toolbar ── */}
      <Card
        variant="borderless"
        style={{
          borderRadius: 14,
          marginBottom: 16,
          border: `1px solid ${BORDER}`,
          background: "#ffffff",
          boxShadow: "0 2px 12px rgba(92, 26, 82, 0.03)",
        }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={6}>
            <Input
              placeholder="Search keyword, order #, staff name..."
              prefix={<SearchOutlined style={{ color: "#8c7766" }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>

          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: "100%" }}
              value={moduleFilter}
              onChange={setModuleFilter}
              options={moduleOptions}
            />
          </Col>

          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: "100%" }}
              value={actionFilter}
              onChange={setActionFilter}
              options={actionOptions}
            />
          </Col>

          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
            />
          </Col>

          <Col xs={12} sm={6} md={6}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button type="primary" style={{ background: PRIMARY, borderColor: PRIMARY }} onClick={handleSearch}>
                Filter
              </Button>
              <Button onClick={resetFilters}>Reset</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ── Main Activity Logs Table ── */}
      <Card
        variant="borderless"
        style={{
          borderRadius: 14,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 4px 20px rgba(92, 26, 82, 0.04)",
        }}
      >
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
              fetchLogs(p, ps);
            },
            showTotal: (totalCount) => `Total ${totalCount} recorded operations`,
          }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* ── View Log Details Modal ── */}
      <Modal
        title={
          <span style={{ fontSize: 16, fontWeight: 700, color: PRIMARY, display: "flex", alignItems: "center", gap: 6 }}>
            <HistoryOutlined /> Operation Audit Details
          </span>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" style={{ background: PRIMARY, borderColor: PRIMARY }} onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={680}
      >
        {selectedLog && (
          <div>
            <Descriptions bordered size="small" column={1} style={{ marginTop: 12 }}>
              <Descriptions.Item label="Performer">
                <strong>{selectedLog.userName}</strong> ({selectedLog.userEmail || "No email"}) &bull; Role:{" "}
                <Tag color="purple">{selectedLog.userRole?.toUpperCase()}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Action & Module">
                <Tag color={actionMeta[selectedLog.action]?.color || "default"}>
                  {selectedLog.action}
                </Tag>
                <Tag style={{ textTransform: "uppercase" }}>{selectedLog.module}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Description">
                {selectedLog.description}
              </Descriptions.Item>

              {selectedLog.resourceTitle && (
                <Descriptions.Item label="Target Resource">
                  {selectedLog.resourceTitle} (ID: {selectedLog.resourceId || "—"})
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Status">
                {selectedLog.status === "error" ? (
                  <Tag color="error">Error / Issue</Tag>
                ) : selectedLog.status === "warning" ? (
                  <Tag color="warning">Warning</Tag>
                ) : (
                  <Tag color="success">Success</Tag>
                )}
              </Descriptions.Item>

              {selectedLog.errorMessage && (
                <Descriptions.Item label="Error Information">
                  <span style={{ color: "#b91c1c", fontWeight: 600 }}>{selectedLog.errorMessage}</span>
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Timestamp">
                {new Date(selectedLog.createdAt).toLocaleString("en-US", {
                  dateStyle: "full",
                  timeStyle: "medium",
                })}
              </Descriptions.Item>

              {selectedLog.ipAddress && (
                <Descriptions.Item label="IP & Device">
                  <code>{selectedLog.ipAddress}</code>
                  {selectedLog.userAgent && (
                    <div style={{ fontSize: 11, color: "#8c7766", marginTop: 4 }}>
                      {selectedLog.userAgent}
                    </div>
                  )}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedLog.diff && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#240821", marginBottom: 6 }}>
                  Payload / Value Changes (Diff):
                </div>
                <pre
                  style={{
                    background: "#fcf8fa",
                    border: `1px solid ${BORDER}`,
                    padding: 12,
                    borderRadius: 8,
                    fontSize: 12,
                    maxHeight: 220,
                    overflowY: "auto",
                    color: "#240821",
                  }}
                >
                  {JSON.stringify(selectedLog.diff, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Flag Issue Modal ── */}
      <Modal
        title={
          <span style={{ fontSize: 16, fontWeight: 700, color: "#b91c1c", display: "flex", alignItems: "center", gap: 6 }}>
            <AlertOutlined /> Flag Operational Issue / Incident
          </span>
        }
        open={issueModalOpen}
        onCancel={() => setIssueModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleFlagIssue} style={{ marginTop: 14 }}>
          <Form.Item
            name="module"
            label="Module / Department"
            rules={[{ required: true, message: "Please select module" }]}
            initialValue="orders"
          >
            <Select
              options={moduleOptions.filter((m) => m.value !== "all")}
            />
          </Form.Item>

          <Form.Item name="resourceTitle" label="Resource Reference (e.g. Order #1234 or Product Name)">
            <Input placeholder="e.g. Order #BD9EE6BC or Organza Tissue Saree" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description of Issue"
            rules={[{ required: true, message: "Please enter issue description" }]}
          >
            <Input.TextArea rows={3} placeholder="Describe what went wrong or what discrepancy was detected..." />
          </Form.Item>

          <Form.Item name="errorMessage" label="Notes / Error Cause (Optional)">
            <Input placeholder="e.g. Wrong tracking code assigned by courier" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIssueModalOpen(false)}>Cancel</Button>
              <Button type="primary" danger htmlType="submit" loading={flagging}>
                Record Issue in Audit Trail
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ActivityLogs;
