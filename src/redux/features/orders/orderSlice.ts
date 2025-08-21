// redux/features/orders/orderSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { orderService } from '~/services/orderService';
import { calculateDistance, calculateETA, generateNearbyCoordinates } from '~/utils/helper';

// Mumbai coordinates for demo purposes
const MUMBAI_COORDS = { latitude: 19.076, longitude: 72.8777 };

export type OrderStatus = 'Pending' | 'Picked' | 'Out for Delivery' | 'Delivered';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  items: string[];
  pickupLocation: string;
  pickupCoords: Coordinates;
  deliveryAddress: string;
  deliveryCoords: Coordinates;
  contactName: string;
  contactPhone: string;
  distance: number; // in meters
  eta: string;
  notificationSent?: boolean;
  createdAt: string;
  paymentStatus: 'Paid' | 'Pending';
  earnings: number;
}

interface OrderState {
  orders: Order[];
  currentLocation: Coordinates | null;
  loading: boolean;
  error: string | null;
}
export const fetchAssignedOrders = createAsyncThunk(
  'orders/fetchAssignedOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.getAssignedOrders();
      return response.orders || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);
export const updateOrderStatusAPI = createAsyncThunk(
  'orders/updateOrderStatusAPI',
  async (
    {
      assignmentId,
      status,
      notes,
      coordinates,
    }: {
      assignmentId: string;
      status: string;
      notes?: string;
      coordinates?: { latitude: number; longitude: number };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await orderService.updateOrderStatus(
        assignmentId,
        status,
        notes,
        coordinates
      );
      return { assignmentId, status, response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

const generateOrder = (id: string, status: OrderStatus, data: Partial<Order>): Order => {
  const deliveryCoords = generateNearbyCoordinates(MUMBAI_COORDS.latitude, MUMBAI_COORDS.longitude);
  const pickupCoords = generateNearbyCoordinates(
    deliveryCoords.latitude,
    deliveryCoords.longitude,
    5000
  );
  const distance = calculateDistance(
    pickupCoords.latitude,
    pickupCoords.longitude,
    deliveryCoords.latitude,
    deliveryCoords.longitude
  );

  return {
    id,
    status,
    items: data.items || ['Unknown Item'],
    pickupLocation: data.pickupLocation || 'Unknown Location',
    pickupCoords: data.pickupCoords || pickupCoords,
    deliveryAddress: data.deliveryAddress || 'Unknown Address',
    deliveryCoords: data.deliveryCoords || deliveryCoords,
    contactName: data.contactName || 'Unknown',
    contactPhone: data.contactPhone || '0000000000',
    distance,
    eta: calculateETA(distance),
    createdAt: new Date().toISOString(),
    paymentStatus: status === 'Delivered' ? 'Paid' : 'Pending',
    earnings: Math.floor(Math.random() * 100) + 50, // Random earnings between 50-150
    ...data,
  };
};

const initialState: OrderState = {
  orders: [],
  currentLocation: null,
  loading: false,
  error: null,
};
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: OrderStatus }>) => {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
        // Update payment status if delivered
        if (action.payload.status === 'Delivered') {
          order.paymentStatus = 'Paid';
        }
      }
    },
    setCurrentLocation: (state, action: PayloadAction<Coordinates>) => {
      state.currentLocation = action.payload;
    },
    markNotificationSent: (state, action: PayloadAction<string>) => {
      const order = state.orders.find((o) => o.id === action.payload);
      if (order) {
        order.notificationSent = true;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch assigned orders
      .addCase(fetchAssignedOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignedOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.map((apiOrder: any) => ({
          id: apiOrder.id.toString(),
          status: apiOrder.status,
          items: apiOrder.items || ['Unknown Item'],
          pickupLocation: apiOrder.pickupLocation || 'Unknown Location',
          pickupCoords: generateNearbyCoordinates(19.076, 72.8777), // Default Mumbai coords
          deliveryAddress: apiOrder.deliveryAddress || 'Unknown Address',
          deliveryCoords: apiOrder.deliveryCoords || generateNearbyCoordinates(19.076, 72.8777),
          contactName: apiOrder.contactName || 'Unknown',
          contactPhone: apiOrder.contactPhone || '0000000000',
          distance:
            typeof apiOrder.distance === 'string'
              ? parseFloat(apiOrder.distance) * 1000
              : apiOrder.distance || 0,
          eta: apiOrder.eta || '15 min',
          createdAt: apiOrder.orderDate || new Date().toISOString(),
          paymentStatus: 'Pending',
          earnings: Math.floor(Math.random() * 100) + 50,
          assignmentId: apiOrder.assignmentId,
        }));
      })
      .addCase(fetchAssignedOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update order status
      .addCase(updateOrderStatusAPI.fulfilled, (state, action) => {
        const { assignmentId, status } = action.payload;
        const order = state.orders.find((o) => o.assignmentId === assignmentId);
        if (order) {
          order.status = status as OrderStatus;
          if (status === 'Delivered') {
            order.paymentStatus = 'Paid';
          }
        }
      });
  },
});
export const { updateOrderStatus, setCurrentLocation, markNotificationSent, clearError } =
  orderSlice.actions;

export default orderSlice.reducer;