import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Switch, message, Popconfirm, Space, Upload, Tag, Card } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Categories = () => {
  const { isAdmin, isManager } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  const fetchCategories = () => {
    setLoading(true);
    api
      .get("/categories")
      .then(({ data }) => setCategories(data.categories || []))
      .finally(() => setLoading(false));
  };

  useEffect(fetchCategories, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setFileList([]);
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      slug: record.slug,
      description: record.description,
      tagline: record.tagline,
      showInOccasion: record.showInOccasion || false,
      displayOrder: record.displayOrder,
    });
    setFileList(
      record.image
        ? [{ uid: "-1", name: "image", status: "done", url: record.image }]
        : []
    );
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      message.success("Category deleted");
      fetchCategories();
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
      const url = res.data.urls[0];
      file.url = url;
      onSuccess(res.data, file);
    } catch (err) {
      onError(err);
      message.error("Image upload failed");
    }
  };

  const handleSubmit = async (values) => {
    const imageUrl = fileList[0]?.url || fileList[0]?.response?.urls?.[0] || null;
    const payload = {
      ...values,
      image: imageUrl,
      showInOccasion: values.showInOccasion || false,
    };
    try {
      if (editing) {
        await api.put(`/admin/categories/${editing._id}`, payload);
        message.success("Category updated");
      } else {
        await api.post("/admin/categories", payload);
        message.success("Category created");
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      message.error(err.response?.data?.message || "Save failed");
    }
  };

  const columns = [
    {
      title: "Hero Banner",
      dataIndex: "image",
      width: 90,
      render: (url) =>
        url ? (
          <img src={url} alt="category" style={{ width: 50, height: 44, objectFit: "cover", borderRadius: 8, border: "1px solid #ebdcd0" }} />
        ) : (
          <div style={{ width: 50, height: 44, background: "#faf6f2", border: "1px solid #ebdcd0", borderRadius: 8 }} />
        ),
    },
    {
      title: "Category Name",
      dataIndex: "name",
      render: (name) => <span style={{ fontWeight: 600, color: "#240821" }}>{name}</span>,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      render: (slug) => <Tag style={{ background: "#faf5f9", borderColor: "#ebdcd0", color: "#5c1a52" }}>/{slug}</Tag>,
    },
    {
      title: "Tagline",
      dataIndex: "tagline",
      render: (t) => t || <span style={{ color: "#aaa" }}>—</span>,
    },
    {
      title: "Occasion Menu",
      dataIndex: "showInOccasion",
      width: 140,
      render: (v) =>
        v ? (
          <Tag color="purple" style={{ fontWeight: 600 }}>Featured</Tag>
        ) : (
          <Tag style={{ color: "#8c7766" }}>Standard</Tag>
        ),
    },
    { title: "Sort Order", dataIndex: "displayOrder", width: 100 },
    {
      title: "Actions",
      width: 130,
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} style={{ borderColor: "#ebdcd0", color: "#5c1a52" }}>
            Edit
          </Button>
          {isAdmin && (
            <Popconfirm title="Delete this category?" onConfirm={() => handleDelete(record._id)}>
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
              Collection Categories
            </h2>
            <p style={{ margin: "4px 0 0", color: "#735e4d", fontSize: 13 }}>
              Organize boutique collections, bridal occasions, navigation categories, and banner imagery.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#5c1a52", background: "#fcf3fa", padding: "6px 14px", borderRadius: 20, border: "1px solid #ebdcd0" }}>
              Total: {categories.length} {categories.length === 1 ? "category" : "categories"}
            </span>
            {isManager && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
                style={{ background: "#5c1a52", borderColor: "#5c1a52", fontWeight: 700 }}
              >
                New Category
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* ── Table Card ── */}
      <Card style={{ border: "1px solid #ebdcd0", borderRadius: 16, background: "#ffffff", padding: 0 }}>
        <Table rowKey="_id" columns={columns} dataSource={categories} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={<span style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#240821" }}>{editing ? "Edit Category" : "New Category"}</span>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
        okText={editing ? "Update Category" : "Create Category"}
        okButtonProps={{ style: { background: "#5c1a52", borderColor: "#5c1a52" } }}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Slug" name="slug" rules={[{ required: true }]}>
            <Input placeholder="e.g. gowns" />
          </Form.Item>
          <Form.Item label="Description (shown as banner tagline on category page)" name="description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="Tagline" name="tagline">
            <Input placeholder="e.g. Celebrate in style" />
          </Form.Item>
          <Form.Item label="Show in Shop by Occasion" name="showInOccasion" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="Display Order" name="displayOrder">
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Category Image">
            <Upload
              customRequest={handleUpload}
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList: fl }) => setFileList(fl)}
              onRemove={() => setFileList([])}
              maxCount={1}
            >
              {fileList.length === 0 && (
                <div>
                  <UploadOutlined style={{ color: "#5c1a52" }} />
                  <div style={{ marginTop: 6, fontSize: 12 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
