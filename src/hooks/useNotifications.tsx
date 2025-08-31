// hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import * as api from '../utils/api'; // Use relative path

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);

  const { userData } = useSelector((state) => state.auth);

  const fetchNotifications = useCallback(
    async (params = {}) => {
      if (!userData?.user?.id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await api.getNotifications(userData.user.id, params);
        if (response.success) {
          setNotifications(response.data || []);
        }
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    },
    [userData?.user?.id]
  );

  const fetchUnreadCount = useCallback(async () => {
    if (!userData?.user?.id) return;

    try {
      const response = await api.getUnreadNotificationCount(userData.user.id);
      if (response.success) {
        setUnreadCount(response.count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [userData?.user?.id]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await api.markNotificationAsRead(notificationId);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === notificationId ? { ...notif, is_read: true } : notif))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      return response;
    } catch (err) {
      console.error('Failed to mark as read:', err);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await api.markAllNotificationsAsRead(userData.user.id);
      if (response.success) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })));
        setUnreadCount(0);
      }
      return response;
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      throw err;
    }
  }, [userData?.user?.id]);

  const deleteNotif = useCallback(
    async (notificationId) => {
      try {
        const response = await api.deleteNotification(notificationId);
        if (response.success) {
          setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
          const deletedNotif = notifications.find((n) => n.id === notificationId);
          if (deletedNotif && !deletedNotif.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
        return response;
      } catch (err) {
        console.error('Failed to delete notification:', err);
        throw err;
      }
    },
    [notifications]
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
    setRefreshing(false);
  }, [fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    loading,
    refreshing,
    unreadCount,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotif,
    refresh,
    fetchUnreadCount,
  };
};
