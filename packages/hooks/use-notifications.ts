import { useState, useCallback } from "react";

export interface Notification {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message: string;
  duration?: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newNotification = { ...notification, id };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto remove after duration (default 5 seconds)
      const duration = notification.duration || 5000;
      setTimeout(() => {
        removeNotification(id);
      }, duration);

      return id;
    },
    [],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  const showSuccess = useCallback(
    (title: string, message: string, duration?: number) => {
      return addNotification({ type: "success", title, message, duration });
    },
    [addNotification],
  );

  const showError = useCallback(
    (title: string, message: string, duration?: number) => {
      return addNotification({ type: "error", title, message, duration });
    },
    [addNotification],
  );

  const showInfo = useCallback(
    (title: string, message: string, duration?: number) => {
      return addNotification({ type: "info", title, message, duration });
    },
    [addNotification],
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
  };
}
