import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Space,
  Switch,
  Upload,
  Tooltip,
  Card,
  Tag,
  Badge,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  StopOutlined,
} from "@ant-design/icons";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

// Comprehensive palette of 60+ fashion & ethnic wear colors with accurate hex values
const COLOR_PALETTE = [
  // Reds, Maroons & Wineries
  { name: "Maroon", hex: "#881337" },
  { name: "Red", hex: "#dc2626" },
  { name: "Crimson", hex: "#991b1b" },
  { name: "Wine", hex: "#581845" },
  { name: "Burgundy", hex: "#4a0e17" },
  { name: "Ruby", hex: "#e0115f" },
  { name: "Cherry Red", hex: "#be123c" },
  { name: "Rust", hex: "#9a3412" },

  // Pinks & Corals
  { name: "Rani Pink", hex: "#db2777" },
  { name: "Hot Pink", hex: "#ff1493" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Rose Pink", hex: "#f43f5e" },
  { name: "Baby Pink", hex: "#fbcfe8" },
  { name: "Blush Pink", hex: "#f472b6" },
  { name: "Magenta", hex: "#c026d3" },
  { name: "Coral", hex: "#fb7185" },
  { name: "Peach", hex: "#fba18a" },

  // Greens
  { name: "Emerald Green", hex: "#059669" },
  { name: "Dark Green", hex: "#14532d" },
  { name: "Bottle Green", hex: "#0f381e" },
  { name: "Olive Green", hex: "#4d7c0f" },
  { name: "Mehendi Green", hex: "#556b2f" },
  { name: "Mint Green", hex: "#6ee7b7" },
  { name: "Sage Green", hex: "#84a98c" },
  { name: "Pista Green", hex: "#93c572" },
  { name: "Sea Green", hex: "#2e8b57" },
  { name: "Teal", hex: "#0d9488" },

  // Blues
  { name: "Royal Blue", hex: "#2563eb" },
  { name: "Navy Blue", hex: "#1e3a8a" },
  { name: "Sky Blue", hex: "#38bdf8" },
  { name: "Powder Blue", hex: "#93c5fd" },
  { name: "Turquoise", hex: "#06b6d4" },
  { name: "Midnight Blue", hex: "#0f172a" },
  { name: "Indigo", hex: "#4338ca" },
  { name: "Peacock Blue", hex: "#005f73" },

  // Yellows & Oranges
  { name: "Gold", hex: "#d4af37" },
  { name: "Antique Gold", hex: "#b8860b" },
  { name: "Mustard", hex: "#d97706" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Haldi Yellow", hex: "#f59e0b" },
  { name: "Lemon Yellow", hex: "#fde047" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Amber", hex: "#b45309" },

  // Purples & Violets
  { name: "Purple", hex: "#7e22ce" },
  { name: "Violet", hex: "#6d28d9" },
  { name: "Lavender", hex: "#a855f7" },
  { name: "Lilac", hex: "#c084fc" },
  { name: "Plum", hex: "#5c1a52" },
  { name: "Mauve", hex: "#9370db" },

  // Neutrals, Metallics & Monochromes
  { name: "Black", hex: "#18181b" },
  { name: "White", hex: "#ffffff" },
  { name: "Off White", hex: "#f5f3e9" },
  { name: "Ivory", hex: "#fdfbf7" },
  { name: "Cream", hex: "#fbf6ea" },
  { name: "Beige", hex: "#d6c7b2" },
  { name: "Champagne", hex: "#f7e7ce" },
  { name: "Silver", hex: "#cbd5e1" },
  { name: "Bronze", hex: "#92400e" },
  { name: "Copper", hex: "#b87333" },
  { name: "Grey", hex: "#64748b" },
  { name: "Charcoal", hex: "#374151" },
  { name: "Brown", hex: "#78350f" },
  { name: "Tan / Khaki", hex: "#bfa382" },
];

const POPULAR_COLOR_CHIPS = [
  "Maroon",
  "Red",
  "Rani Pink",
  "Gold",
  "Emerald Green",
  "Royal Blue",
  "Navy Blue",
  "Black",
  "Off White",
  "Beige",
  "Mustard",
  "Plum",
];

const getColorHex = (colorName) => {
  if (!colorName) return "#cccccc";
  const lower = String(colorName).toLowerCase().trim();
  const match = COLOR_PALETTE.find((c) => c.name.toLowerCase() === lower);
  if (match) return match.hex;
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(colorName)) return colorName;
  return "#9ca3af";
};

const SIZE_OPTIONS = [
  { label: "Free Size", value: "Free Size" },
  { label: "One Size", value: "One Size" },
  { label: "Unstitched", value: "Unstitched" },
  { label: "Semi-Stitched", value: "Semi-Stitched" },
  { label: "XS (Extra Small)", value: "XS" },
  { label: "S (Small)", value: "S" },
  { label: "M (Medium)", value: "M" },
  { label: "L (Large)", value: "L" },
  { label: "XL (Extra Large)", value: "XL" },
  { label: "XXL (2XL)", value: "XXL" },
  { label: "3XL", value: "3XL" },
  { label: "Plus Size", value: "Plus Size" },
];

const TAG_OPTIONS = [
  { label: "New Arrival", value: "new-arrival" },
  { label: "Trending", value: "trending" },
  { label: "Featured", value: "featured" },
  { label: "Best Seller", value: "best-seller" },
  { label: "Festive Collection", value: "festive" },
  { label: "Bridal Wear", value: "bridal" },
  { label: "Traditional", value: "traditional" },
  { label: "Plus Size", value: "plus-size" },
];

const Products = () => {
  const { isAdmin, isManager } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState();
  const [stockFilter, setStockFilter] = useState();
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#881337");
  const [customPalette, setCustomPalette] = useState([]);

  const handleAddCustomColor = () => {
    const trimmed = customColorName.trim();
    if (!trimmed) {
      message.warning("Please type a color name first");
      return;
    }
    if (!customPalette.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setCustomPalette((prev) => [...prev, { name: trimmed, hex: customColorHex }]);
    }
    const current = form.getFieldValue("colors") || [];
    if (!current.includes(trimmed)) {
      form.setFieldsValue({ colors: [...current, trimmed] });
    }
    setCustomColorName("");
    message.success(`Added color "${trimmed}"`);
  };

  const handleToggleColorChip = (chipName) => {
    const current = form.getFieldValue("colors") || [];
    if (current.includes(chipName)) {
      form.setFieldsValue({ colors: current.filter((c) => c !== chipName) });
    } else {
      form.setFieldsValue({ colors: [...current, chipName] });
    }
  };

  const allColorOptions = useMemo(() => {
    const map = new Map();
    COLOR_PALETTE.forEach((c) => map.set(c.name.toLowerCase(), c));
    customPalette.forEach((c) => map.set(c.name.toLowerCase(), c));
    const current = form.getFieldValue("colors") || [];
    current.forEach((name) => {
      if (name && !map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), { name, hex: getColorHex(name) });
      }
    });
    return Array.from(map.values()).map((c) => ({
      label: c.name,
      value: c.name,
      hex: c.hex,
    }));
  }, [customPalette, form, editing]);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([api.get("/products?limit=200"), api.get("/categories")])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data.products || []);
        setCategories(catRes.data.categories || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchAll, []);

  const filteredProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return products.filter((product) => {
      const categoryId = typeof product.category === "string" ? product.category : product.category?._id;
      const categoryName = typeof product.category === "string" ? "" : product.category?.name || "";
      const matchesSearch =
        !searchTerm ||
        [product.name, product.slug, product.material, categoryName].some((value) =>
          String(value || "").toLowerCase().includes(searchTerm)
        );
      const matchesCategory = !categoryFilter || categoryId === categoryFilter;
      const matchesStock =
        !stockFilter ||
        (stockFilter === "in-stock" && product.stock > 10) ||
        (stockFilter === "low-stock" && product.stock > 0 && product.stock <= 10) ||
        (stockFilter === "out-of-stock" && product.stock <= 0);
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter(undefined);
    setStockFilter(undefined);
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
      colors: [],
      sizes: ["Free Size"],
      tags: ["new-arrival"],
    });
    setFileList([]);
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      category: typeof record.category === "string" ? record.category : record.category?._id,
      colors: Array.isArray(record.colors)
        ? record.colors
        : record.colors
        ? String(record.colors).split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      sizes: Array.isArray(record.sizes)
        ? record.sizes
        : record.sizes
        ? String(record.sizes).split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      tags: Array.isArray(record.tags)
        ? record.tags
        : record.tags
        ? String(record.tags).split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    });
    setFileList(
      (record.images || [])
        .filter((url) => typeof url === "string" && url.trim() !== "")
        .map((url, i) => ({ uid: String(i), name: `image-${i}`, status: "done", url }))
    );
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/products/${id}`);
      message.success("Product deleted successfully");
      fetchAll();
    } catch (err) {
      message.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("images", file);
    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      file.url = res.data.urls[0];
      onSuccess(res.data, file);
    } catch (err) {
      onError(err);
      message.error("Image upload failed");
    }
  };

  const handleRemoveImage = async (file) => {
    if (file.url) {
      try {
        await api.delete("/upload", { data: { url: file.url } });
      } catch {
        // ignore delete errors
      }
    }
  };

  const handleSubmit = async (values) => {
    const images = fileList
      .filter((f) => f.status === "done")
      .map((f) => f.url || f.response?.urls?.[0])
      .filter(Boolean);
    const payload = {
      ...values,
      images,
      colors: Array.isArray(values.colors)
        ? values.colors
        : values.colors
        ? String(values.colors).split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      sizes: Array.isArray(values.sizes)
        ? values.sizes
        : values.sizes
        ? String(values.sizes).split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      tags: Array.isArray(values.tags)
        ? values.tags
        : values.tags
        ? String(values.tags).split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };
    try {
      if (editing) {
        await api.put(`/admin/products/${editing._id}`, payload);
        message.success("Product updated successfully");
      } else {
        await api.post("/admin/products", payload);
        message.success("Product created successfully");
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      message.error(err.response?.data?.message || "Save failed");
    }
  };

  const columns = [
    {
      title: "Thumbnail",
      dataIndex: "images",
      width: 75,
      render: (images) => {
        const firstImg = (images || []).find((img) => typeof img === "string" && img.trim() !== "");
        return firstImg ? (
          <img
            src={firstImg}
            alt="product"
            style={{ width: 44, height: 54, objectFit: "cover", borderRadius: 8, border: "1px solid #ebdcd0" }}
          />
        ) : (
          <div
            style={{
              width: 44,
              height: 54,
              background: "#faf6f2",
              border: "1px solid #ebdcd0",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoppingOutlined style={{ color: "#8c7766", fontSize: 18 }} />
          </div>
        );
      },
    },
    {
      title: "Product Title & Material",
      dataIndex: "name",
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 600, color: "#240821", fontSize: 13 }}>{name}</div>
          <div style={{ fontSize: 11, color: "#8c7766", marginTop: 2 }}>
            {record.material ? `Material: ${record.material}` : record.slug}
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      render: (cat) => {
        const catName = typeof cat === "string" ? cat : cat?.name;
        return (
          <Tag style={{ background: "#faf5f9", borderColor: "#ebdcd0", color: "#5c1a52", fontWeight: 600 }}>
            {catName || "Uncategorized"}
          </Tag>
        );
      },
    },
    {
      title: "Pricing",
      key: "price",
      render: (_, r) => {
        const hasDiscount = r.discountPrice && r.discountPrice < r.price;
        const discountPct = hasDiscount ? Math.round(((r.price - r.discountPrice) / r.price) * 100) : 0;
        return (
          <div>
            <div style={{ fontWeight: 700, color: "#240821" }}>
              AED {Number(r.discountPrice || r.price).toFixed(2)}
            </div>
            {hasDiscount && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <span style={{ fontSize: 11, color: "#8c7766", textDecoration: "line-through" }}>
                  AED {Number(r.price).toFixed(2)}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#15803d", background: "#f0fdf4", padding: "1px 5px", borderRadius: 4 }}>
                  {discountPct}% OFF
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Stock Level",
      dataIndex: "stock",
      width: 130,
      render: (stock) => {
        if (stock <= 0) {
          return (
            <Tag icon={<StopOutlined />} color="red" style={{ fontWeight: 600 }}>
              Out of stock (0)
            </Tag>
          );
        }
        if (stock <= 10) {
          return (
            <Tag icon={<WarningOutlined />} color="orange" style={{ fontWeight: 600 }}>
              Low ({stock})
            </Tag>
          );
        }
        return (
          <Tag icon={<CheckCircleOutlined />} color="green" style={{ fontWeight: 600 }}>
            {stock} in stock
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      width: 100,
      render: (v) => (
        <Tag color={v ? "green" : "default"} style={{ fontWeight: 600 }}>
          {v ? "Live" : "Draft"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      width: 130,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEdit(record)}
            style={{ borderColor: "#ebdcd0", color: "#5c1a52" }}
          >
            Edit
          </Button>
          {isAdmin && (
            <Popconfirm title="Delete this product from catalog?" onConfirm={() => handleDelete(record._id)}>
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
              Product Catalog
            </h2>
            <p style={{ margin: "4px 0 0", color: "#735e4d", fontSize: 13 }}>
              Manage couture gowns, traditional sarees, inventory quantities, and pricing.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#5c1a52", background: "#fcf3fa", padding: "6px 14px", borderRadius: 20, border: "1px solid #ebdcd0" }}>
              Total: {products.length} {products.length === 1 ? "garment" : "garments"}
            </span>
            {isManager && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
                style={{ background: "#5c1a52", borderColor: "#5c1a52", fontWeight: 700 }}
              >
                New Product
              </Button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f0e3d8" }}>
          <Space wrap size="middle">
            <Input
              allowClear
              prefix={<SearchOutlined style={{ color: "#8c7766" }} />}
              placeholder="Search product, slug, material..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ width: 260 }}
            />
            <Select
              allowClear
              placeholder="All categories"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={categories.map((category) => ({ label: category.name, value: category._id }))}
              style={{ width: 190 }}
            />
            <Select
              allowClear
              placeholder="All stock levels"
              value={stockFilter}
              onChange={setStockFilter}
              options={[
                { label: "In stock (11+)", value: "in-stock" },
                { label: "Low stock (1–10)", value: "low-stock" },
                { label: "Out of stock (0)", value: "out-of-stock" },
              ]}
              style={{ width: 180 }}
            />
            <Tooltip title="Clear filters">
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
          dataSource={filteredProducts}
          loading={loading}
          pagination={{ pageSize: 12, showSizeChanger: true }}
          locale={{ emptyText: "No products match the selected filters" }}
          style={{ borderRadius: 12, overflow: "hidden" }}
        />
      </Card>

      {/* ── Modal for New / Edit Product ── */}
      <Modal
        title={
          <span style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#240821" }}>
            {editing ? "Edit Garment Details" : "Add New Garment to Collection"}
          </span>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
        width={640}
        okText={editing ? "Update Product" : "Publish Product"}
        okButtonProps={{ style: { background: "#5c1a52", borderColor: "#5c1a52", fontWeight: 600 } }}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit} initialValues={{ isActive: true }} style={{ marginTop: 16 }}>
          <Form.Item label="Garment Name" name="name" rules={[{ required: true, message: "Product name is required" }]}>
            <Input placeholder="e.g. Royal Maroon Velvet Gown" />
          </Form.Item>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item label="URL Slug" name="slug" rules={[{ required: true, message: "URL slug is required" }]}>
              <Input placeholder="e.g. royal-maroon-velvet-gown" />
            </Form.Item>
            <Form.Item label="Category" name="category" rules={[{ required: true, message: "Please select a category" }]}>
              <Select
                options={categories.map((c) => ({ label: c.name, value: c._id }))}
                placeholder="Select category"
              />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Form.Item label="Price (AED)" name="price" rules={[{ required: true, message: "Price is required" }]}>
              <InputNumber min={0} style={{ width: "100%" }} placeholder="e.g. 450" />
            </Form.Item>
            <Form.Item label="Discount Price (AED)" name="discountPrice">
              <InputNumber min={0} style={{ width: "100%" }} placeholder="Optional sale price" />
            </Form.Item>
            <Form.Item label="Stock Quantity" name="stock" rules={[{ required: true, message: "Stock is required" }]}>
              <InputNumber min={0} style={{ width: "100%" }} placeholder="e.g. 25" />
            </Form.Item>
          </div>

          <Form.Item label="Fabric & Material" name="material">
            <Input placeholder="e.g. Pure Kanchipuram Silk with Zari Border" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Describe the silhouette, drape, and styling notes..." />
          </Form.Item>

          <Form.Item label="Product Images">
            <Upload
              customRequest={handleUpload}
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList: fl }) => setFileList(fl)}
              onRemove={handleRemoveImage}
              accept="image/*"
              multiple
            >
              {fileList.length < 10 && (
                <div style={{ textAlign: "center" }}>
                  <UploadOutlined style={{ color: "#5c1a52", fontSize: 18 }} />
                  <div style={{ marginTop: 6, fontSize: 12, color: "#6b5849" }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <Form.Item
                label="Colors Available"
                name="colors"
                tooltip="Select from 60+ curated fashion colors, pick from quick chips, or add any custom shade!"
                style={{ marginBottom: 8 }}
              >
                <Select
                  mode="tags"
                  placeholder="Search or pick colors, or type any custom color..."
                  options={allColorOptions}
                  tokenSeparators={[","]}
                  style={{ width: "100%" }}
                  maxTagCount="responsive"
                  filterOption={(input, option) =>
                    (option?.value || option?.label || "").toLowerCase().includes(input.toLowerCase())
                  }
                  tagRender={(props) => {
                    const { label, value, closable, onClose } = props;
                    const hex = getColorHex(value);
                    return (
                      <Tag
                        closable={closable}
                        onClose={onClose}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "1px 8px",
                          borderRadius: 14,
                          margin: "2px 4px 2px 0",
                          backgroundColor: "#fcfaf8",
                          borderColor: "#eedfcb",
                          fontSize: 12,
                          color: "#374151",
                        }}
                      >
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: hex,
                            border: "1px solid rgba(0,0,0,0.25)",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            display: "inline-block",
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontWeight: 500 }}>{value}</span>
                      </Tag>
                    );
                  }}
                  optionRender={(option) => {
                    const hex = getColorHex(option.data.value);
                    return (
                      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "2px 0" }}>
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            backgroundColor: hex,
                            border: "1px solid rgba(0,0,0,0.2)",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontWeight: 500, color: "#1f2937", flex: 1 }}>
                          {option.data.label}
                        </span>
                        <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace" }}>
                          {hex}
                        </span>
                      </div>
                    );
                  }}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "6px 0" }} />
                      <div style={{ padding: "8px 12px 10px", background: "#fcfaf8", borderRadius: "0 0 8px 8px" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#5c1a52", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                          <span>🎨 Add Custom Color / Exact Shade:</span>
                        </div>
                        <Space.Compact style={{ width: "100%" }}>
                          <input
                            type="color"
                            value={customColorHex}
                            onChange={(e) => setCustomColorHex(e.target.value)}
                            title="Pick exact hex color"
                            style={{
                              width: 36,
                              height: 32,
                              padding: 2,
                              border: "1px solid #d9d9d9",
                              borderRadius: "6px 0 0 6px",
                              cursor: "pointer",
                              background: "#fff",
                            }}
                          />
                          <Input
                            placeholder="Type color name (e.g. Peacock Green, Dusty Rose)"
                            value={customColorName}
                            onChange={(e) => setCustomColorName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCustomColor();
                              }
                            }}
                            style={{ flex: 1 }}
                          />
                          <Button
                            type="primary"
                            onClick={handleAddCustomColor}
                            style={{ backgroundColor: "#5c1a52", borderColor: "#5c1a52", fontWeight: 600 }}
                          >
                            + Add
                          </Button>
                        </Space.Compact>
                      </div>
                    </>
                  )}
                />
              </Form.Item>

              {/* Popular Quick-Pick Swatch Chips */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#786558", marginBottom: 5, fontWeight: 500 }}>
                  Popular 1-Click Picks:
                </div>
                <Form.Item noStyle shouldUpdate>
                  {() => {
                    const selected = form.getFieldValue("colors") || [];
                    return (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {POPULAR_COLOR_CHIPS.map((chipName) => {
                          const isChipSelected = selected.includes(chipName);
                          const hex = getColorHex(chipName);
                          return (
                            <button
                              key={chipName}
                              type="button"
                              onClick={() => handleToggleColorChip(chipName)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "2px 7px",
                                borderRadius: 12,
                                fontSize: 11,
                                fontWeight: isChipSelected ? 600 : 400,
                                border: isChipSelected ? "1.5px solid #5c1a52" : "1px solid #e5e7eb",
                                backgroundColor: isChipSelected ? "#f9eff6" : "#ffffff",
                                color: isChipSelected ? "#5c1a52" : "#4b5563",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                              }}
                            >
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: hex,
                                  border: "1px solid rgba(0,0,0,0.25)",
                                }}
                              />
                              <span>{chipName}</span>
                              {isChipSelected && <span style={{ fontSize: 10, fontWeight: "bold" }}>✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    );
                  }}
                </Form.Item>
              </div>
            </div>
            <Form.Item
              label="Sizes Available"
              name="sizes"
              tooltip="Click to select from options, or type custom size and press Enter"
            >
              <Select
                mode="tags"
                placeholder="Choose size options..."
                options={SIZE_OPTIONS}
                tokenSeparators={[","]}
                style={{ width: "100%" }}
                maxTagCount="responsive"
              />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item
              label="Product Badges & Tags"
              name="tags"
              tooltip="Select badges (e.g. New Arrival, Trending) to display on website tabs"
            >
              <Select
                mode="tags"
                placeholder="Choose badges..."
                options={TAG_OPTIONS}
                tokenSeparators={[","]}
                style={{ width: "100%" }}
                maxTagCount="responsive"
              />
            </Form.Item>
            <div style={{ display: "flex", alignItems: "center", gap: 24, paddingTop: 28 }}>
              <Form.Item label="Featured Product" name="isFeatured" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Switch />
              </Form.Item>
              <Form.Item label="Live in Storefront" name="isActive" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Switch />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;
