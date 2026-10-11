import { Form, Input, Button, Card, Typography, App } from "antd";
import { MailOutlined, LockOutlined, SafetyCertificateOutlined, CrownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const onFinish = async (values) => {
    try {
      await login(values.email, values.password);
      message.success("Welcome to Mulberries Executive Portal");
      navigate("/");
    } catch (err) {
      message.error(err.response?.data?.message || err.message || "Invalid credentials");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #faf6f2 0%, #f7f1eb 50%, #f3ece3 100%)",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient Lighting Flourishes */}
      <div
        style={{
          position: "absolute",
          top: -100,
          left: -100,
          width: 450,
          height: 450,
          background: "radial-gradient(circle, rgba(92,26,82,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          right: -100,
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(196,154,69,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <Card
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 20,
          border: "1px solid #ebdcd0",
          boxShadow: "0 12px 40px rgba(92, 26, 82, 0.08)",
          background: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(12px)",
          padding: "10px 8px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: 24, marginTop: 8 }}>
          <img
            src="/MULBERRIES.png"
            alt="Mulberries Dubai"
            style={{ height: 48, width: "auto", margin: "0 auto 10px", display: "block" }}
          />
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#faf5f9",
              border: "1px solid #ebdcd0",
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              color: "#5c1a52",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            <CrownOutlined /> Executive Management
          </div>
          <h2
            style={{
              margin: "12px 0 4px",
              fontSize: 22,
              fontFamily: "Georgia, 'Playfair Display', serif",
              color: "#240821",
              fontWeight: 700,
            }}
          >
            Executive Portal Login
          </h2>
          <p style={{ color: "#735e4d", fontSize: 13, marginTop: 4, marginBottom: 0 }}>
            Sign in to access boutique analytics, inventory & orders
          </p>
        </div>

        {/* Login Form */}
        <Form layout="vertical" onFinish={onFinish} size="large" requiredMark={false}>
          <Form.Item
            label={<span style={{ fontSize: 12, fontWeight: 600, color: "#6b5849", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address</span>}
            name="email"
            rules={[
              { required: true, message: "Please enter your administrative email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: "#5c1a52" }} />}
              placeholder="admin@mulberries.com"
              style={{
                background: "#faf8f5",
                borderColor: "#ebdcd0",
              }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontSize: 12, fontWeight: 600, color: "#6b5849", textTransform: "uppercase", letterSpacing: "0.05em" }}>Password</span>}
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#5c1a52" }} />}
              placeholder="••••••••"
              style={{
                background: "#faf8f5",
                borderColor: "#ebdcd0",
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                height: 44,
                fontSize: 14,
                fontWeight: 700,
                background: "#5c1a52",
                borderColor: "#5c1a52",
                borderRadius: 12,
                boxShadow: "0 4px 15px rgba(92, 26, 82, 0.25)",
              }}
            >
              Sign In to Atelier Portal
            </Button>
          </Form.Item>
        </Form>

        {/* Security Reassurance Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: 12,
            paddingTop: 14,
            borderTop: "1px solid #ebdcd0",
            fontSize: 11,
            color: "#8c7766",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <SafetyCertificateOutlined style={{ color: "#5c1a52", fontSize: 13 }} />
          <span>Encrypted Session &bull; Role-Based Access Control</span>
        </div>
      </Card>
    </div>
  );
};

export default Login;