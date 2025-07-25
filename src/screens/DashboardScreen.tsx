import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { OrderStatus, updateOrderStatus } from '~/redux/features/orders/orderSlice';

const statusColors: Record<OrderStatus, { bg: string; text: string; iconColor: string }> = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', iconColor: '#b45309' },
  Picked: { bg: 'bg-blue-50', text: 'text-blue-700', iconColor: '#1d4ed8' },
  'Out for Delivery': { bg: 'bg-orange-50', text: 'text-orange-700', iconColor: '#c2410c' },
  Delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', iconColor: '#047857' },
};

const statusIcons: Record<OrderStatus, keyof typeof Ionicons.glyphMap> = {
  Pending: 'time-outline',
  Picked: 'cube-outline',
  'Out for Delivery': 'bicycle-outline',
  Delivered: 'checkmark-done-outline',
};

const DashboardScreen = () => {
  const dispatch = useDispatch();
  const { orders } = useSelector((state: RootState) => state.order);

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'All'>('All');

  const spinValue = new Animated.Value(0);

  const rotateChevron = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const toggleExpand = (id: string) => {
    Animated.timing(spinValue, {
      toValue: expandedOrderId === id ? 0 : 1,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    dispatch(updateOrderStatus({ orderId, status }));
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.contactName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = activeFilter === 'All' || order.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const statusFilters: (OrderStatus | 'All')[] = [
    'All',
    'Pending',
    'Picked',
    'Out for Delivery',
    'Delivered',
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header with Search */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-900">My Deliveries</Text>
            <Text className="mt-1 text-gray-500">{filteredOrders.length} orders assigned</Text>

            <View className="mt-4 flex-row items-center rounded-xl bg-white px-4 py-3 shadow-sm">
              <Ionicons name="search" size={20} color="#9ca3af" />
              <TextInput
                className="ml-2 flex-1 text-base text-gray-700"
                placeholder="Search orders..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9ca3af"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Status Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
            contentContainerStyle={{ paddingRight: 16 }}>
            {statusFilters.map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={`mr-2 rounded-full px-4 py-2 ${
                  activeFilter === filter ? 'bg-indigo-600' : 'bg-white'
                }`}>
                <Text
                  className={`text-sm font-medium ${
                    activeFilter === filter ? 'text-white' : 'text-gray-700'
                  }`}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <View className="mt-10 items-center justify-center rounded-2xl bg-white p-8 shadow-sm">
              <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
              <Text className="mt-4 text-lg font-medium text-gray-500">No orders found</Text>
              <Text className="mt-1 text-sm text-gray-400">
                Try adjusting your search or filter
              </Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <View
                key={order.id}
                className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm shadow-gray-200">
                <TouchableOpacity
                  onPress={() => toggleExpand(order.id)}
                  className="flex-row items-center justify-between p-5"
                  activeOpacity={0.8}>
                  <View className="flex-row items-center space-x-4">
                    <View
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${statusColors[order.status].bg}`}>
                      <Ionicons
                        name={statusIcons[order.status]}
                        size={20}
                        color={statusColors[order.status].iconColor}
                      />
                    </View>
                    <View>
                      <Text className="text-lg font-semibold text-gray-800">Order #{order.id}</Text>
                      <View className="mt-1 flex-row items-center">
                        <Text
                          className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status].bg} ${statusColors[order.status].text}`}>
                          {order.status}
                        </Text>
                        <Text className="ml-2 text-xs text-gray-500">
                          {new Date().toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Animated.View
                    style={{
                      transform: [
                        {
                          rotate: expandedOrderId === order.id ? rotateChevron : '0deg',
                        },
                      ],
                    }}>
                    <Ionicons name="chevron-down" size={20} color="#6b7280" />
                  </Animated.View>
                </TouchableOpacity>

                {expandedOrderId === order.id && (
                  <View className="border-t border-gray-100 px-5 py-4">
                    <View className="mb-4 space-y-4">
                      {[
                        {
                          icon: 'fast-food-outline',
                          label: 'Items',
                          value: order.items.join(', '),
                        },
                        {
                          icon: 'location-outline',
                          label: 'Pickup Location',
                          value: order.pickupLocation,
                        },
                        {
                          icon: 'home-outline',
                          label: 'Delivery Address',
                          value: order.deliveryAddress,
                        },
                        {
                          icon: 'person-outline',
                          label: 'Contact',
                          value: `${order.contactName} (${order.contactPhone})`,
                        },
                      ].map((item, idx) => (
                        <View key={idx} className="flex-row items-start">
                          <View className="rounded-full bg-gray-100 p-2">
                            <Ionicons name={item.icon as any} size={16} color="#4b5563" />
                          </View>
                          <View className="ml-3 flex-1">
                            <Text className="font-medium text-gray-900">{item.label}</Text>
                            <Text className="mt-1 text-gray-700">{item.value}</Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    <View className="mt-3 flex-row flex-wrap gap-3">
                      {order.status === 'Pending' && (
                        <TouchableOpacity
                          className="flex-1 flex-row items-center justify-center space-x-2 rounded-xl bg-blue-600 px-4 py-3"
                          onPress={() => handleStatusChange(order.id, 'Picked')}>
                          <Ionicons name="checkmark" size={18} color="white" />
                          <Text className="font-medium text-white">Mark as Picked</Text>
                        </TouchableOpacity>
                      )}
                      {order.status === 'Picked' && (
                        <TouchableOpacity
                          className="flex-1 flex-row items-center justify-center space-x-2 rounded-xl bg-orange-600 px-4 py-3"
                          onPress={() => handleStatusChange(order.id, 'Out for Delivery')}>
                          <Ionicons name="bicycle" size={18} color="white" />
                          <Text className="font-medium text-white">Start Delivery</Text>
                        </TouchableOpacity>
                      )}
                      {order.status === 'Out for Delivery' && (
                        <TouchableOpacity
                          className="flex-1 flex-row items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-4 py-3"
                          onPress={() => handleStatusChange(order.id, 'Delivered')}>
                          <Ionicons name="checkmark-done" size={18} color="white" />
                          <Text className="font-medium text-white">Mark as Delivered</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DashboardScreen;
