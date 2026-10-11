import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Result, Button } from "antd";

// Protects any route — just needs to be logged in as dashboard user
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Protects routes that need a specific permission
export const PermissionRoute = ({ permission, children }) => {
  const { user, can } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!can(permission)) {
    return (
      <Result
        status="403"
        title="Access Denied"
        subTitle="You don't have permission to view this page."
      />
    );
  }
  return <>{children}</>;
};

// Protects routes that need admin role
export const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) {
    return (
      <Result
        status="403"
        title="Access Denied"
        subTitle="Only Super Admin can access this page."
      />
    );
  }
  return <>{children}</>;
};

export default ProtectedRoute;
