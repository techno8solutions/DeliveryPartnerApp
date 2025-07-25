import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type OrderStatus = 'Pending' | 'Picked' | 'Out for Delivery' | 'Delivered';

export interface Order {
  id: string;
  status: OrderStatus;
  items: string[];
  pickupLocation: string;
  deliveryAddress: string;
  contactName: string;
  contactPhone: string;
}

interface OrderState {
  orders: Order[];
}

const initialState: OrderState = {
    orders: [
      {
        id: 'ORD123',
        status: 'Pending',
        items: ['Pizza', 'Burger'],
        pickupLocation: 'Domino’s, Vashi',
        deliveryAddress: 'Sector 17, Vashi',
        contactName: 'Ravi',
        contactPhone: '9876543210',
      },
      {
        id: 'ORD124',
        status: 'Picked',
        items: ['Parcel Box'],
        pickupLocation: 'BlueDart, CBD',
        deliveryAddress: 'Palm Beach Rd, Nerul',
        contactName: 'Akash',
        contactPhone: '9823456780',
      },
      {
        id: 'ORD125',
        status: 'Out for Delivery',
        items: ['Laptop', 'Charger'],
        pickupLocation: 'Croma, Seawoods',
        deliveryAddress: 'Sec 28, Vashi',
        contactName: 'Pooja',
        contactPhone: '9812345678',
      },
      {
        id: 'ORD126',
        status: 'Delivered',
        items: ['Books', 'Notebook'],
        pickupLocation: 'BookStore, Sanpada',
        deliveryAddress: 'Sec 30, Kharghar',
        contactName: 'Rahul',
        contactPhone: '9871234567',
      },
      {
        id: 'ORD127',
        status: 'Pending',
        items: ['Grocery Items'],
        pickupLocation: 'Reliance Smart, Juinagar',
        deliveryAddress: 'Sec 10, Belapur',
        contactName: 'Sneha',
        contactPhone: '9823984738',
      },
      {
        id: 'ORD128',
        status: 'Picked',
        items: ['Furniture - Chair'],
        pickupLocation: 'Urban Ladder, Panvel',
        deliveryAddress: 'Plot 12, Ulwe',
        contactName: 'Varun',
        contactPhone: '9898989898',
      },
      {
        id: 'ORD129',
        status: 'Out for Delivery',
        items: ['Courier Envelope'],
        pickupLocation: 'DTDC, Chembur',
        deliveryAddress: 'Govandi East',
        contactName: 'Manisha',
        contactPhone: '9811112222',
      },
      {
        id: 'ORD130',
        status: 'Delivered',
        items: ['Medicine Kit'],
        pickupLocation: 'Apollo Pharmacy, Nerul',
        deliveryAddress: 'Seawoods Grand Central',
        contactName: 'Alok',
        contactPhone: '9933445566',
      },
    ],
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
      }
    },
  },
});

export const { updateOrderStatus } = orderSlice.actions;
export default orderSlice.reducer;
