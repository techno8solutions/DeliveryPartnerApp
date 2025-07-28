import React, { useState, useEffect } from 'react';
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
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { OrderStatus, updateOrderStatus } from '~/redux/features/orders/orderSlice';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { ProgressBar } from 'react-native-paper';
import { formatDistance, formatDuration } from '~/utils/helper';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '~/constants/routes';

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
  const navigation = useNavigation();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'All'>('All');
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [deliveryTimer, setDeliveryTimer] = useState<{ [key: string]: number }>({});

  const spinValue = new Animated.Value(0);

  // Get current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  // Simulate delivery timer for orders
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const updatedTimers = { ...deliveryTimer };

      orders.forEach((order) => {
        if (order.status === 'Out for Delivery' && !deliveryTimer[order.id]) {
          updatedTimers[order.id] = now;
        } else if (order.status === 'Delivered' && deliveryTimer[order.id]) {
          delete updatedTimers[order.id];
        }
      });

      setDeliveryTimer(updatedTimers);
    }, 1000);

    return () => clearInterval(timer);
  }, [orders, deliveryTimer]);

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

    // Show notification when order is picked
    if (status === 'Picked') {
      Alert.alert('Order Picked', 'You have successfully picked up the order.');
    }
  };

  const openMaps = (latitude: number, longitude: number) => {
    const url = Platform.select({
      ios: `maps://app?daddr=${latitude},${longitude}&dirflg=d`,
      android: `google.navigation:q=${latitude},${longitude}`,
    });

    if (url) {
      Linking.openURL(url).catch((err) => {
        Alert.alert('Error', 'Could not open maps app');
      });
    }
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

  const getDeliveryTime = (orderId: string) => {
    if (!deliveryTimer[orderId]) return '--';
    const seconds = Math.floor((Date.now() - deliveryTimer[orderId]) / 1000);
    return formatDuration(seconds);
  };

  const renderProgressSteps = (status: OrderStatus) => {
    const steps = ['Pending', 'Picked', 'Out for Delivery', 'Delivered'];
    const currentStep = steps.indexOf(status);

    return (
      <View className="mt-4">
        <View className="flex-row justify-between">
          {steps.map((step, index) => (
            <View key={step} className="items-center">
              <View
                className={`h-6 w-6 items-center justify-center rounded-full ${
                  index <= currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                }`}>
                {index < currentStep ? (
                  <Ionicons name="checkmark" size={16} color="white" />
                ) : (
                  <Text
                    className={`text-xs font-bold ${
                      index <= currentStep ? 'text-white' : 'text-gray-500'
                    }`}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                className={`mt-1 text-xs ${
                  index <= currentStep ? 'font-bold text-indigo-600' : 'text-gray-500'
                }`}>
                {step}
              </Text>
            </View>
          ))}
        </View>
        <ProgressBar
          progress={(currentStep + 1) / steps.length}
          color="#4f46e5"
          className="mt-2 h-1"
        />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header with Search and Notification */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-3xl font-bold text-gray-900">My Deliveries</Text>
              <TouchableOpacity
                className="relative"
                onPress={() => navigation.navigate(ROUTES.NOTFICATION)}>
                <Ionicons name="notifications-outline" size={24} color="#4b5563" />
                <View className="absolute -right-2 -top-2 h-5 w-5 items-center justify-center rounded-full bg-red-500">
                  <Text className="text-xs font-bold text-white">3</Text>
                </View>
              </TouchableOpacity>
            </View>

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
                        {order.status === 'Out for Delivery' && (
                          <Text className="ml-2 text-xs font-medium text-gray-700">
                            {getDeliveryTime(order.id)}
                          </Text>
                        )}
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
                    {/* Progress Tracker */}
                    {renderProgressSteps(order.status)}

                    <View className="mb-4 mt-6 space-y-4">
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
                          hidden: order.status === 'Pending',
                        },
                      ].map((item, idx) => {
                        if (item.hidden) return null;
                        return (
                          <View key={idx} className="flex-row items-start">
                            <View className="rounded-full bg-gray-100 p-2">
                              <Ionicons name={item.icon as any} size={16} color="#4b5563" />
                            </View>
                            <View className="ml-3 flex-1">
                              <Text className="font-medium text-gray-900">{item.label}</Text>
                              <Text className="mt-1 text-gray-700">{item.value}</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>

                    {/* Map Preview */}
                    {currentLocation && (
                      <View className="mb-4 mt-4">
                        <Text className="mb-2 font-medium text-gray-900">Delivery Route</Text>
                        <View className="h-40 overflow-hidden rounded-xl border border-gray-200">
                          <MapView
                            style={{ flex: 1 }}
                            initialRegion={{
                              latitude: currentLocation.latitude,
                              longitude: currentLocation.longitude,
                              latitudeDelta: 0.0922,
                              longitudeDelta: 0.0421,
                            }}>
                            <Marker
                              coordinate={{
                                latitude: currentLocation.latitude,
                                longitude: currentLocation.longitude,
                              }}
                              title="Your Location"
                              pinColor="#3b82f6"
                            />
                            <Marker
                              coordinate={{
                                latitude: order.deliveryCoords.latitude,
                                longitude: order.deliveryCoords.longitude,
                              }}
                              title="Delivery Location"
                              pinColor="#ef4444"
                            />
                          </MapView>
                        </View>
                        <View className="mt-2 flex-row items-center justify-between">
                          <Text className="text-sm text-gray-600">
                            Distance: {formatDistance(order.distance)} • ETA: {order.eta}
                          </Text>
                          <TouchableOpacity
                            onPress={() =>
                              openMaps(
                                order.deliveryCoords.latitude,
                                order.deliveryCoords.longitude
                              )
                            }
                            className="flex-row items-center rounded-full bg-indigo-50 px-3 py-1">
                            <Ionicons name="navigate" size={16} color="#4f46e5" />
                            <Text className="ml-1 text-sm font-medium text-indigo-600">
                              Navigate
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* Action Buttons */}
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

        {/* Floating Support Button */}
        <TouchableOpacity
          className="absolute bottom-6 right-6 rounded-full bg-indigo-600 p-4 shadow-lg"
          onPress={() => Alert.alert('Support', 'Contacting support team...')}>
          <Ionicons name="help-circle" size={24} color="white" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DashboardScreen;
