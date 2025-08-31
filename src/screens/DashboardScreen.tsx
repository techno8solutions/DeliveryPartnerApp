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
  RefreshControl,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import {
  clearError,
  fetchAssignedOrders,
  OrderStatus,
  updateOrderStatus,
  updateOrderStatusAPI,
} from '~/redux/features/orders/orderSlice';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { ProgressBar } from 'react-native-paper';
import { formatDistance, formatDuration } from '~/utils/helper';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '~/constants/routes';
import axios from 'axios';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.backendUrl;
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

// OTP Verification Modal Component
const OTPVerificationModal = ({
  visible,
  onClose,
  onVerify,
  phoneNumber,
  purpose,
  loading = false,
  onResendOTP,
  resendLoading = false,
  timer,
  canResend,
}) => {
  const [otp, setOtp] = useState('');

  const getPurposeText = () => {
    switch (purpose) {
      case 'partner_verification':
        return 'store manager';
      case 'customer_verification':
        return 'customer';
      default:
        return 'recipient';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="w-5/6 max-w-md rounded-2xl bg-white p-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-800">OTP Verification</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text className="mb-2 text-gray-600">
            Enter the OTP sent to {getPurposeText()} at {phoneNumber}
          </Text>

          <TextInput
            className="mb-4 rounded-xl border border-gray-300 px-4 py-3 text-center text-lg"
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />

          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-gray-500">
              {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </Text>
            {canResend ? (
              <TouchableOpacity onPress={onResendOTP} disabled={resendLoading}>
                {resendLoading ? (
                  <ActivityIndicator size="small" color="#4f46e5" />
                ) : (
                  <Text className="font-medium text-indigo-600">Resend OTP</Text>
                )}
              </TouchableOpacity>
            ) : (
              <Text className="text-gray-400">Resend OTP</Text>
            )}
          </View>

          <TouchableOpacity
            className={`rounded-xl py-3 ${otp.length === 6 ? 'bg-indigo-600' : 'bg-gray-300'}`}
            onPress={() => onVerify(otp)}
            disabled={otp.length !== 6 || loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center font-semibold text-white">Verify OTP</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const DashboardScreen = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state: RootState) => state.order);

  const navigation = useNavigation();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'All'>('All');
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [deliveryTimer, setDeliveryTimer] = useState<{ [key: string]: number }>({});

  // OTP Verification State
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [otpPurpose, setOtpPurpose] = useState<'partner_verification' | 'customer_verification'>(
    'partner_verification'
  );
  const [verifying, setVerifying] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(120);
  const [canResendOTP, setCanResendOTP] = useState(false);

  const spinValue = new Animated.Value(0);

  useEffect(() => {
    dispatch(fetchAssignedOrders() as any);
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

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

  // OTP Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (otpModalVisible && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResendOTP(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [otpModalVisible, otpTimer]);

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

  // Generate OTP and send to appropriate recipient
  const generateAndSendOTP = async (
    order: any,
    purpose: 'partner_verification' | 'customer_verification'
  ) => {
    try {
      const phoneNumber =
        purpose === 'partner_verification'
          ? 'admin' // This would be the store manager's phone in a real app
          : order.contactPhone;

      const response = await axios.post(`${API_BASE_URL}/otp/generate`, {
        order_id: order.id,
        purpose,
        phone_number: phoneNumber,
      });
      console.log(response.data);
      if (response.data.success) {
        Alert.alert('OTP Sent', `A 6-digit OTP has been sent for verification.`);
        return true;
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send OTP');
        return false;
      }
    } catch (error) {
      console.error('Generate OTP error:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
      return false;
    }
  };

  // Verify OTP entered by delivery partner
  const verifyOTP = async (otp: string) => {
    setVerifying(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/otp/verify`, {
        order_id: currentOrder.id,
        otp_code: otp,
        purpose: otpPurpose,
      });

      if (response.data.success) {
        setOtpModalVisible(false);
        setVerifying(false);

        // Refresh orders to get updated status from backend
        dispatch(fetchAssignedOrders() as any);

        // Show success message based on purpose
        if (otpPurpose === 'partner_verification') {
          Alert.alert(
            'Success',
            'OTP verified. Order has been picked up and is now out for delivery.'
          );
        } else {
          Alert.alert('Success', 'OTP verified. Order has been delivered successfully.');
        }
      } else {
        Alert.alert('Error', response.data.message || 'Invalid OTP');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to verify OTP. Please try again.'
      );
    } finally {
      setVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setResendLoading(true);

    try {
      const phoneNumber =
        otpPurpose === 'partner_verification'
          ? 'admin' // Store manager's phone
          : currentOrder.contactPhone;

      const response = await axios.post(`${API_BASE_URL}/otp/resend`, {
        order_id: currentOrder.id,
        purpose: otpPurpose,
        phone_number: phoneNumber,
      });

      if (response.data.success) {
        setOtpTimer(120);
        setCanResendOTP(false);
        Alert.alert('Success', 'OTP has been resent successfully.');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to resend OTP. Please try again.'
      );
    } finally {
      setResendLoading(false);
    }
  };

  // Handle OTP verification flow for status changes
  const initiateStatusChangeWithOTP = async (order: any, newStatus: OrderStatus) => {
    setCurrentOrder(order);

    if (newStatus === 'Picked') {
      // For pickup, OTP is sent to store manager
      setOtpPurpose('partner_verification');
      const otpSent = await generateAndSendOTP(order, 'partner_verification');
      if (otpSent) {
        setOtpTimer(120);
        setCanResendOTP(false);
        setOtpModalVisible(true);
      }
    } else if (newStatus === 'Delivered') {
      // For delivery, OTP is sent to customer
      setOtpPurpose('customer_verification');
      const otpSent = await generateAndSendOTP(order, 'customer_verification');
      if (otpSent) {
        setOtpTimer(120);
        setCanResendOTP(false);
        setOtpModalVisible(true);
      }
    } else {
      // For other status changes, no OTP required
      await handleStatusUpdate(order.id, newStatus);
    }
  };

  // Update order status via API
  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      // Find the order to get assignmentId
      const order = orders.find((o) => o.id === orderId);
      if (!order || !order.assignmentId) {
        Alert.alert('Error', 'Order assignment ID not found');
        return;
      }

      // Get current coordinates for tracking
      let coordinates = null;
      if (currentLocation) {
        coordinates = {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        };
      }

      // Update status via API
      await dispatch(
        updateOrderStatusAPI({
          assignmentId: order.assignmentId,
          status: status.toLowerCase().replace(' ', '_'),
          coordinates,
        }) as any
      ).unwrap();

      // Show notification when order status is updated
      if (status === 'Picked') {
        Alert.alert('Order Picked', 'You have successfully picked up the order.');
      } else if (status === 'Out for Delivery') {
        Alert.alert('Delivery Started', 'You are now out for delivery.');
      } else if (status === 'Delivered') {
        Alert.alert('Order Delivered', 'Delivery completed successfully.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const onRefresh = () => {
    dispatch(fetchAssignedOrders() as any);
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

  // helper
  const normalizeStatus = (status: string): OrderStatus => {
    switch (status.toLowerCase().replace(/_/g, ' ')) {
      case 'pending':
        return 'Pending';
      case 'picked':
        return 'Picked';
      case 'out for delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      default:
        return 'Pending'; // fallback
    }
  };

  // normalize + filter
  const filteredOrders = orders
    .map((order) => ({
      ...order,
      status: normalizeStatus(order.status), // 👈 normalization happens here
    }))
    .filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = activeFilter === 'All' || order.status === activeFilter;
      return matchesSearch && matchesFilter;
    });

  // safe color usage
  const getStatusColor = (status: OrderStatus) =>
    statusColors[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      iconColor: '#6b7280',
    };

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
        <ScrollView
          className="p-4"
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}>
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
            filteredOrders.map((order) => {
              const color = getStatusColor(order.status);
              return (
                <View
                  key={order.id}
                  className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm shadow-gray-200">
                  <TouchableOpacity
                    onPress={() => toggleExpand(order.id)}
                    className="flex-row items-center justify-between p-5"
                    activeOpacity={0.8}>
                    <View className="flex-row items-center space-x-4">
                      <View
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${color.bg}`}>
                        <Ionicons
                          name={statusIcons[order.status] || 'help-circle'}
                          size={20}
                          color={color.iconColor}
                        />
                      </View>
                      <View>
                        <Text className="text-lg font-semibold text-gray-800">
                          Order #{order.id}
                        </Text>
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
                            onPress={() => initiateStatusChangeWithOTP(order, 'Picked')}>
                            <Ionicons name="checkmark" size={18} color="white" />
                            <Text className="font-medium text-white">Mark as Picked</Text>
                          </TouchableOpacity>
                        )}
                        {order.status === 'Picked' && (
                          <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center space-x-2 rounded-xl bg-orange-600 px-4 py-3"
                            onPress={() => handleStatusUpdate(order.id, 'Out for Delivery')}>
                            <Ionicons name="bicycle" size={18} color="white" />
                            <Text className="font-medium text-white">Start Delivery</Text>
                          </TouchableOpacity>
                        )}
                        {order.status === 'Out for Delivery' && (
                          <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-4 py-3"
                            onPress={() => initiateStatusChangeWithOTP(order, 'Delivered')}>
                            <Ionicons name="checkmark-done" size={18} color="white" />
                            <Text className="font-medium text-white">Mark as Delivered</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
        {/* OTP Verification Modal */}
        <OTPVerificationModal
          visible={otpModalVisible}
          onClose={() => setOtpModalVisible(false)}
          onVerify={verifyOTP}
          onResendOTP={handleResendOTP}
          phoneNumber={
            otpPurpose === 'partner_verification'
              ? 'admin'
              : currentOrder?.contactPhone || 'customer'
          }
          purpose={otpPurpose}
          loading={verifying}
          resendLoading={resendLoading}
          timer={otpTimer}
          canResend={canResendOTP}
        />
        {/* Floating Support Button */}
        <TouchableOpacity
          className="absolute bottom-6 right-6 rounded-full bg-indigo-600 p-4 shadow-lg"
          onPress={() => navigation.navigate('SupportTickets')}>
          <Ionicons name="help-circle" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          className="absolute bottom-6 left-6 rounded-full bg-green-600 p-4 shadow-lg"
          onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DashboardScreen;
