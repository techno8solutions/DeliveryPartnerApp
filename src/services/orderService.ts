// services/orderService.ts
import axios from 'axios';
import Constants from 'expo-constants';
  const backendUrl = Constants.expoConfig?.extra?.backendUrl;


// Create axios instance with default config
const api = axios.create({
  baseURL: backendUrl,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  // Get token from your storage (AsyncStorage, Redux, etc.)
  const token = ''; // You'll need to implement this
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const orderService = {
  // Get assigned orders for delivery partner
  getAssignedOrders: async () => {
    try {
      const response = await api.get('/delivery-partner/assign/assign-orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned orders:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (
    assignmentId: string,
    status: string,
    notes?: string,
    coordinates?: { latitude: number; longitude: number }
  ) => {
    try {
      const response = await api.put(`/delivery-partner/assign/update-order-status`, {
        status,
        notes,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        assignmentId,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },
};
