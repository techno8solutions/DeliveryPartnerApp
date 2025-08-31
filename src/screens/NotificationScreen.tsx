// screens/NotificationScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '../hooks/useNotifications';
import { useSelector } from 'react-redux';

const NotificationScreen = ({ navigation }) => {
  const {
    notifications,
    loading,
    refreshing,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  } = useNotifications();

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'delivery_completed':
        return { name: 'checkmark-circle', color: '#4CAF50' };
      case 'payment_received':
        return { name: 'wallet', color: '#2196F3' };
      case 'new_delivery':
        return { name: 'cube', color: '#FF9800' };
      case 'delay_alert':
        return { name: 'warning', color: '#FFC107' };
      case 'app_update':
        return { name: 'information-circle', color: '#9E9E9E' };
      case 'weekly_earnings':
        return { name: 'cash', color: '#4CAF50' };
      case 'system_alert':
        return { name: 'notifications', color: '#2196F3' };
      case 'rating_received':
        return { name: 'star', color: '#FFC107' };
      case 'promotion':
        return { name: 'megaphone', color: '#E91E63' };
      default:
        return { name: 'notifications', color: '#9E9E9E' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async () => {
    if (!selectedNotification) return;

    try {
      await deleteNotification(selectedNotification.id);
      setShowDeleteModal(false);
      setSelectedNotification(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const handleNotificationPress = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Handle navigation based on notification type/data
    if (notification.data?.order_id) {
      navigation.navigate('OrderDetails', { orderId: notification.data.order_id });
    } else if (notification.data?.payment_id) {
      navigation.navigate('Earnings');
    }
  };

  const renderNotification = (notification) => {
    const icon = getNotificationIcon(notification.type);

    return (
      <TouchableOpacity
        key={notification.id}
        className={`my-1 flex-row items-center rounded-lg bg-white p-4 ${
          !notification.is_read ? 'border-l-4 border-blue-500' : ''
        }`}
        onPress={() => handleNotificationPress(notification)}
        onLongPress={() => {
          setSelectedNotification(notification);
          setShowDeleteModal(true);
        }}>
        {/* Icon */}
        <View className="mr-4">
          <Ionicons name={icon.name} size={24} color={icon.color} />
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900">{notification.title}</Text>
          <Text className="mt-1 text-sm text-gray-600">{notification.message}</Text>
          <Text className="mt-1 text-xs text-gray-400">{formatDate(notification.created_at)}</Text>
        </View>

        {/* Unread indicator */}
        {!notification.is_read && <View className="ml-2 h-2 w-2 rounded-full bg-blue-500" />}

        {/* Priority indicator */}
        {notification.priority === 'high' && (
          <Ionicons name="alert-circle" size={16} color="#FF3B30" className="ml-2" />
        )}
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="mt-3 text-gray-600">Loading notifications...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white p-4">
        <View className="flex-row items-center">
          <Text className="text-xl font-bold text-gray-900">Notifications</Text>
          {unreadCount > 0 && (
            <View className="ml-2 min-w-[20px] rounded-full bg-red-500 px-2 py-1">
              <Text className="text-center text-xs font-bold text-white">{unreadCount}</Text>
            </View>
          )}
        </View>

        <View className="flex-row space-x-3">
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead}>
              <Ionicons name="checkmark-done" size={24} color="#6366f1" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={refresh}>
            <Ionicons name="refresh" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification List */}
      <ScrollView
        className="flex-1 px-2"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        {notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="notifications-off" size={64} color="#d1d5db" />
            <Text className="mt-4 text-center text-lg text-gray-500">No notifications yet</Text>
            <Text className="mt-2 px-8 text-center text-gray-400">
              You'll see important updates and alerts here
            </Text>
          </View>
        ) : (
          notifications.map(renderNotification)
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}>
        <View className="flex-1 items-center justify-center bg-black bg-opacity-50">
          <View className="w-11/12 max-w-md rounded-2xl bg-white p-6">
            <Text className="mb-2 text-lg font-bold text-gray-900">Delete Notification</Text>
            <Text className="mb-6 text-gray-600">
              Are you sure you want to delete this notification?
            </Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 rounded-lg bg-gray-100 py-3"
                onPress={() => setShowDeleteModal(false)}>
                <Text className="text-center text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-lg bg-red-600 py-3"
                onPress={handleDeleteNotification}>
                <Text className="text-center text-white">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default NotificationScreen;
