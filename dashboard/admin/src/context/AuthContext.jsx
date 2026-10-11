import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("mulberries_admin_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const allowedRoles = ["admin", "manager", "staff"];
      if (!allowedRoles.includes(data.user.role)) {
        throw new Error("This account does not have dashboard access");
      }
      localStorage.setItem("mulberries_admin_token", data.token);
      localStorage.setItem("mulberries_admin_user", JSON.stringify(data.user));
      setUser(data.user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("mulberries_admin_token");
    localStorage.removeItem("mulberries_admin_user");
    setUser(null);
  };

  // Check if user is super admin
  const isAdmin = user?.role === "admin";

  // Check if user is admin or manager
  const isManager = ["admin", "manager"].includes(user?.role);

  // Check specific permission (admin always has all)
  const can = (permission) => {
    if (user?.role === "admin") return true;
    return user?.permissions?.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isManager, can }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
