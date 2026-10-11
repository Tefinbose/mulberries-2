import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider, App as AntApp } from "antd";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute, { PermissionRoute, AdminRoute } from "./components/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Staff from "./pages/Staff";
import Contacts from "./pages/Contacts";
import Coupons from "./pages/Coupons";
import HomepageSections from "./pages/HomepageSections";
import Inventory from "./pages/Inventory";
import SalesAnalytics from "./pages/SalesAnalytics";
import Newsletter from "./pages/Newsletter";
import ActivityLogs from "./pages/ActivityLogs";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#5c1a52",
          colorPrimaryHover: "#43123b",
          colorPrimaryActive: "#3a1034",
          colorLink: "#5c1a52",
          colorLinkHover: "#b8843f",
          colorSuccess: "#15803d",
          colorWarning: "#c49a45",
          colorError: "#b91c1c",
          colorInfo: "#5c1a52",
          colorBgBase: "#faf6f2",
          colorBgContainer: "#ffffff",
          colorBgLayout: "#faf6f2",
          colorBorder: "#ebdcd0",
          colorBorderSecondary: "#f0e3d8",
          colorText: "#240821",
          colorTextSecondary: "#6b5849",
          colorTextHeading: "#240821",
          borderRadius: 12,
          fontFamily: "Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        components: {
          Layout: {
            headerBg: "rgba(255, 255, 255, 0.95)",
            bodyBg: "#faf6f2",
            siderBg: "#2a0c27",
          },
          Menu: {
            darkItemBg: "transparent",
            darkItemSelectedBg: "#5c1a52",
            darkItemHoverBg: "rgba(92, 26, 82, 0.45)",
            darkItemSelectedColor: "#f5d796",
            darkItemColor: "rgba(255, 255, 255, 0.85)",
          },
          Card: {
            borderRadiusLG: 14,
            colorBorderSecondary: "#ebdcd0",
            boxShadowTertiary: "0 4px 20px rgba(92, 26, 82, 0.04)",
          },
          Table: {
            headerBg: "#f7f1eb",
            headerColor: "#240821",
            borderColor: "#ebdcd0",
            rowHoverBg: "#fdfaf7",
          },
          Button: {
            borderRadius: 10,
            controlHeight: 38,
            fontWeight: 600,
          },
          Modal: {
            borderRadiusLG: 18,
            headerBg: "#ffffff",
          },
        },
      }}
    >
      {/* AntApp wrapper is required for message/notification/modal to consume ConfigProvider theme */}
      <AntApp>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<PermissionRoute permission="reports"><Dashboard /></PermissionRoute>} />
                  <Route path="categories" element={<PermissionRoute permission="categories"><Categories /></PermissionRoute>} />
                  <Route path="products" element={<PermissionRoute permission="products"><Products /></PermissionRoute>} />
                  <Route path="orders" element={<PermissionRoute permission="orders"><Orders /></PermissionRoute>} />
                  <Route path="activity-logs" element={<PermissionRoute permission="staff"><ActivityLogs /></PermissionRoute>} />
                  <Route path="staff" element={<AdminRoute><Staff /></AdminRoute>} />
                  <Route path="users" element={<AdminRoute><Users /></AdminRoute>} />
                  <Route path="newsletter" element={<AdminRoute><Newsletter /></AdminRoute>} />
                  <Route path="contacts" element={<Contacts />} />
                  <Route path="coupons" element={<PermissionRoute permission="orders"><Coupons /></PermissionRoute>} />
                  {/* Homepage is admin-only on both backend and frontend */}
                  <Route path="homepage" element={<AdminRoute><HomepageSections /></AdminRoute>} />
                  <Route path="inventory" element={<PermissionRoute permission="products"><Inventory /></PermissionRoute>} />
                  <Route path="sales" element={<PermissionRoute permission="reports"><SalesAnalytics /></PermissionRoute>} />
                </Route>
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
