import { useEffect, useState } from "react";
import {
  Card, Button, Form, Input, Select, Switch, ColorPicker,
  Upload, message, Tabs, Spin, Tag,
} from "antd";
import { UploadOutlined, SaveOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../api/axios";

const HomepageSections = () => {
  const [lookForm] = Form.useForm();
  const [bannerForm] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [loadingLook, setLoadingLook] = useState(true);
  const [loadingBanner, setLoadingBanner] = useState(true);
  const [savingLook, setSavingLook] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  const [bannerFileList, setBannerFileList] = useState([]);

  // fetch all products for selector
  useEffect(() => {
    api.get("/products?limit=200").then(({ data }) => setProducts(data.products || []));
  }, []);

  // fetch existing complete_the_look section
  useEffect(() => {
    setLoadingLook(true);
    api.get("/homepage/complete_the_look")
      .then(({ data }) => {
        if (data.section) {
          lookForm.setFieldsValue({
            products: data.section.products?.map((p) => p._id || p),
          });
        }
      })
      .finally(() => setLoadingLook(false));
  }, []);

  // fetch existing offer_banner section
  useEffect(() => {
    setLoadingBanner(true);
    api.get("/homepage/offer_banner")
      .then(({ data }) => {
        if (data.section) {
          const s = data.section;
          bannerForm.setFieldsValue({
            heading: s.heading,
            subheading: s.subheading,
            badgeText: s.badgeText,
            bgColor: s.bgColor,
            textColor: s.textColor,
            linkText: s.linkText,
            linkHref: s.linkHref,
            isActive: s.isActive,
          });
          if (s.image) {
            setBannerFileList([{ uid: "-1", name: "banner", status: "done", url: s.image }]);
          }
        }
      })
      .finally(() => setLoadingBanner(false));
  }, []);

  const handleUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("images", file);
    try {
      const res = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      file.url = res.data.urls[0];
      onSuccess(res.data, file);
    } catch (err) {
      onError(err);
      message.error("Image upload failed");
    }
  };

  const saveLook = async (values) => {
    setSavingLook(true);
    try {
      await api.put("/admin/homepage/complete_the_look", { products: values.products || [] });
      message.success("Complete the Look updated");
    } catch (err) {
      message.error(err.response?.data?.message || "Save failed");
    } finally {
      setSavingLook(false);
    }
  };

  const saveBanner = async (values) => {
    setSavingBanner(true);
    const image = bannerFileList.find((f) => f.status === "done")?.url || "";
    try {
      await api.put("/admin/homepage/offer_banner", { ...values, image });
      message.success("Offer Banner updated");
    } catch (err) {
      message.error(err.response?.data?.message || "Save failed");
    } finally {
      setSavingBanner(false);
    }
  };

  const productOptions = products.map((p) => ({
    label: (
      <span>
        {p.images?.[0] && (
          <img src={p.images[0]} alt="" style={{ width: 24, height: 24, objectFit: "cover", borderRadius: 3, marginRight: 8, verticalAlign: "middle" }} />
        )}
        {p.name} — AED {p.price}
        {p.stock <= 0 && <Tag color="red" style={{ marginLeft: 6, fontSize: 10 }}>Out of stock</Tag>}
      </span>
    ),
    value: p._id,
  }));

  const items = [
    {
      key: "look",
      label: "Complete the Look",
      children: loadingLook ? (
        <Spin />
      ) : (
        <Form layout="vertical" form={lookForm} onFinish={saveLook}>
          <p style={{ color: "#888", marginBottom: 12 }}>
            Select up to 8 products to display in the "Complete the Look" section on the homepage.
          </p>
          <Form.Item label="Products" name="products">
            <Select
              mode="multiple"
              placeholder="Search and select products..."
              options={productOptions}
              showSearch
              filterOption={(input, option) =>
                products.find((p) => p._id === option.value)?.name?.toLowerCase().includes(input.toLowerCase())
              }
              maxCount={8}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={savingLook}>
            Save
          </Button>
        </Form>
      ),
    },
    {
      key: "banner",
      label: "Offer Banner",
      children: loadingBanner ? (
        <Spin />
      ) : (
        <Form layout="vertical" form={bannerForm} onFinish={saveBanner} initialValues={{ isActive: true, bgColor: "#5c1a52", textColor: "#ffffff", linkText: "Shop Now", linkHref: "/" }}>
          <p style={{ color: "#888", marginBottom: 12 }}>
            Configure the promotional offer banner shown on the homepage.
          </p>
          <Form.Item label="Badge Text (e.g. LIMITED TIME)" name="badgeText">
            <Input placeholder="LIMITED TIME OFFER" />
          </Form.Item>
          <Form.Item label="Heading" name="heading">
            <Input placeholder="e.g. Get 10% Off Your First Order" />
          </Form.Item>
          <Form.Item label="Subheading" name="subheading">
            <Input.TextArea rows={2} placeholder="e.g. Use code WELCOME10 at checkout" />
          </Form.Item>
          <Form.Item label="Background Color" name="bgColor">
            <Input placeholder="#5c1a52" />
          </Form.Item>
          <Form.Item label="Text Color" name="textColor">
            <Input placeholder="#ffffff" />
          </Form.Item>
          <Form.Item label="Button Text" name="linkText">
            <Input placeholder="Shop Now" />
          </Form.Item>
          <Form.Item label="Button Link" name="linkHref">
            <Input placeholder="/" />
          </Form.Item>
          <Form.Item label="Banner Image (optional)">
            <Upload
              customRequest={handleUpload}
              listType="picture-card"
              fileList={bannerFileList}
              onChange={({ fileList: fl }) => setBannerFileList(fl)}
              onRemove={(file) => {
                if (file.url) api.delete("/upload", { data: { url: file.url } }).catch(() => {});
              }}
              accept="image/*"
              maxCount={1}
            >
              {bannerFileList.length < 1 && (
                <div><UploadOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={savingBanner}>
            Save
          </Button>
        </Form>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Page Header Card ── */}
      <Card style={{ border: "1px solid #ebdcd0", borderRadius: 16, background: "#ffffff" }}>
        <h2 style={{ margin: 0, fontSize: 22, fontFamily: "Georgia, serif", fontWeight: 700, color: "#240821" }}>
          Homepage & Merchandising Sections
        </h2>
        <p style={{ margin: "4px 0 0", color: "#735e4d", fontSize: 13 }}>
          Configure curated Complete The Look ensembles, promotional offer banners, and storefront spotlights.
        </p>
      </Card>
      <Card style={{ borderRadius: 16, border: "1px solid #ebdcd0", background: "#ffffff" }}>
        <Tabs items={items} />
      </Card>
    </div>
  );
};

export default HomepageSections;
