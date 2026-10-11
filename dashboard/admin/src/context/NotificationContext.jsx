import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { App as AntApp, notification as staticNotification } from "antd";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(undefined);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Safe accessor for Ant Design App notification hook with fallback to static notification
  let notifyApi = staticNotification;
  try {
    const antApp = AntApp.useApp();
    if (antApp?.notification) {
      notifyApi = antApp.notification;
    }
  } catch {
    notifyApi = staticNotification;
  }

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const previousUnreadRef = useRef(null);

  const fetchNotifications = useCallback(async (isSilent = false) => {
    // Only fetch for authenticated dashboard users
    if (!user) return;

    if (!isSilent) setLoading(true);
    try {
      const { data } = await api.get("/admin/notifications");
      if (data && data.success) {
        const newUnread = typeof data.unreadCount === "number" ? data.unreadCount : 0;
        const items = Array.isArray(data.notifications) ? data.notifications : [];

        // 1. Update state first so badge & list update immediately
        setUnreadCount(newUnread);
        setNotifications(items);

        // 2. If new unread messages arrived during background polling, trigger desktop alert toast
        if (
          previousUnreadRef.current !== null &&
          newUnread > previousUnreadRef.current &&
          items.length > 0
        ) {
          const latest = items[0];
          try {
            notifyApi?.info?.({
              message: "New Customer Inquiry Received",
              description: `${latest.sender || "A customer"} sent: "${latest.subject || "Customer Inquiry"}"`,
              placement: "topRight",
              duration: 6,
            });
          } catch (toastErr) {
            console.warn("Could not display notification toast:", toastErr);
          }
        }

        previousUnreadRef.current = newUnread;
      }
    } catch (err) {
      console.warn("Failed to fetch notifications:", err?.response?.data?.message || err?.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [user, notifyApi]);

  // Initial fetch and auto-polling every 12 seconds + instant refetch on browser tab focus
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      previousUnreadRef.current = null;
      return;
    }

    fetchNotifications(false);

    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 12000);

    const handleWindowFocus = () => {
      fetchNotifications(true);
    };
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (previousUnreadRef.current !== null) {
        previousUnreadRef.current = Math.max(0, previousUnreadRef.current - 1);
      }

      const { data } = await api.put(`/admin/contacts/${id}/read`);
      if (data?.success && typeof data.unreadCount === "number") {
        setUnreadCount(data.unreadCount);
        previousUnreadRef.current = data.unreadCount;
      }
    } catch (err) {
      console.warn("Failed to mark notification read:", err);
      fetchNotifications(true);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
      previousUnreadRef.current = 0;

      const { data } = await api.put("/admin/contacts/mark-all-read");
      if (data?.success) {
        setUnreadCount(0);
        previousUnreadRef.current = 0;
      }
    } catch (err) {
      console.warn("Failed to mark all notifications read:", err);
      fetchNotifications(true);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
};
