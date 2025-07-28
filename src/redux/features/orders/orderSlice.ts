// redux/features/orders/orderSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { calculateDistance, calculateETA, generateNearbyCoordinates } from '~/utils/helper'

// Mumbai coordinates for demo purposes
const MUMBAI_COORDS = { latitude: 19.0760, longitude: 72.8777 };

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
}

const generateOrder = (id: string, status: OrderStatus, data: Partial<Order>): Order => {
  const deliveryCoords = generateNearbyCoordinates(MUMBAI_COORDS.latitude, MUMBAI_COORDS.longitude);
  const pickupCoords = generateNearbyCoordinates(deliveryCoords.latitude, deliveryCoords.longitude, 5000);
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
  orders: [
    generateOrder('ORD123', 'Pending', {
      items: ['Pizza', 'Burger'],
      pickupLocation: 'Domino’s, Vashi',
      deliveryAddress: 'Sector 17, Vashi',
      contactName: 'Ravi',
      contactPhone: '9876543210',
    }),
    generateOrder('ORD124', 'Picked', {
      items: ['Parcel Box'],
      pickupLocation: 'BlueDart, CBD',
      deliveryAddress: 'Palm Beach Rd, Nerul',
      contactName: 'Akash',
      contactPhone: '9823456780',
    }),
    generateOrder('ORD125', 'Out for Delivery', {
      items: ['Laptop', 'Charger'],
      pickupLocation: 'Croma, Seawoods',
      deliveryAddress: 'Sec 28, Vashi',
      contactName: 'Pooja',
      contactPhone: '9812345678',
    }),
    generateOrder('ORD126', 'Delivered', {
      items: ['Books', 'Notebook'],
      pickupLocation: 'BookStore, Sanpada',
      deliveryAddress: 'Sec 30, Kharghar',
      contactName: 'Rahul',
      contactPhone: '9871234567',
      paymentStatus: 'Paid',
    }),
    generateOrder('ORD127', 'Pending', {
      items: ['Grocery Items'],
      pickupLocation: 'Reliance Smart, Juinagar',
      deliveryAddress: 'Sec 10, Belapur',
      contactName: 'Sneha',
      contactPhone: '9823984738',
    }),
    generateOrder('ORD128', 'Picked', {
      items: ['Furniture - Chair'],
      pickupLocation: 'Urban Ladder, Panvel',
      deliveryAddress: 'Plot 12, Ulwe',
      contactName: 'Varun',
      contactPhone: '9898989898',
    }),
    generateOrder('ORD129', 'Out for Delivery', {
      items: ['Courier Envelope'],
      pickupLocation: 'DTDC, Chembur',
      deliveryAddress: 'Govandi East',
      contactName: 'Manisha',
      contactPhone: '9811112222',
    }),
    generateOrder('ORD130', 'Delivered', {
      items: ['Medicine Kit'],
      pickupLocation: 'Apollo Pharmacy, Nerul',
      deliveryAddress: 'Seawoods Grand Central',
      contactName: 'Alok',
      contactPhone: '9933445566',
      paymentStatus: 'Paid',
    }),
  ],
  currentLocation: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    updateOrderStatus: (
      state,
      action: PayloadAction<{ orderId: string; status: OrderStatus }>
    ) => {
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
    addNewOrder: (state, action: PayloadAction<Partial<Order>>) => {
      const newId = `ORD${Math.floor(100 + Math.random() * 900)}`; // Generate random ID
      const newOrder = generateOrder(newId, 'Pending', action.payload);
      state.orders.unshift(newOrder);
    },
  },
});

export const { 
  updateOrderStatus, 
  setCurrentLocation, 
  markNotificationSent,
  addNewOrder 
} = orderSlice.actions;

export default orderSlice.reducer;