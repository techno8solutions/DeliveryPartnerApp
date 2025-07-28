import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dummy notification data for delivery person
const dummyNotifications = [
  {
    id: '1',
    type: 'success',
    title: 'Delivery Completed',
    message: 'Your delivery #ORD-1234 has been completed successfully',
    time: '2 mins ago',
    read: false,
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Received',
    message: '₹150 has been credited to your wallet for delivery #ORD-1234',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'assigned',
    title: 'New Delivery Assigned',
    message: "You have been assigned a new delivery #ORD-5678 from Domino's to Sector 15",
    time: '3 hours ago',
    read: true,
  },
  {
    id: '4',
    type: 'warning',
    title: 'Delay Alert',
    message: 'Delivery #ORD-9012 is taking longer than expected. Please update status',
    time: '5 hours ago',
    read: true,
  },
  {
    id: '5',
    type: 'info',
    title: 'App Update',
    message: 'New version 2.3.0 is available with better navigation features',
    time: '1 day ago',
    read: true,
  },
  {
    id: '6',
    type: 'payment',
    title: 'Weekly Earnings',
    message: 'Your weekly earnings: ₹3,450 for 23 deliveries',
    time: '2 days ago',
    read: true,
  },
];

const NotificationScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white p-4">
        <Text className="text-xl font-bold">Notifications</Text>
        <TouchableOpacity>
          <Text className="text-base text-blue-500">Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Notification List */}
      <ScrollView className="flex-1 px-2">
        {dummyNotifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            className={`my-1 flex-row items-center rounded-lg bg-white p-4 ${
              !notification.read ? 'border-l-4 border-blue-500' : ''
            }`}>
            {/* Icon */}
            <View className="mr-4">
              {notification.type === 'success' && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
              {notification.type === 'payment' && (
                <Ionicons name="wallet" size={24} color="#2196F3" />
              )}
              {notification.type === 'assigned' && (
                <Ionicons name="cube" size={24} color="#FF9800" />
              )}
              {notification.type === 'warning' && (
                <Ionicons name="warning" size={24} color="#FFC107" />
              )}
              {notification.type === 'info' && (
                <Ionicons name="information-circle" size={24} color="#9E9E9E" />
              )}
            </View>

            {/* Content */}
            <View className="flex-1">
              <Text className="text-base font-bold">{notification.title}</Text>
              <Text className="mt-1 text-sm text-gray-600">{notification.message}</Text>
              <Text className="mt-1 text-xs text-gray-400">{notification.time}</Text>
            </View>

            {/* Unread indicator */}
            {!notification.read && <View className="ml-2 h-2 w-2 rounded-full bg-blue-500" />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationScreen;
