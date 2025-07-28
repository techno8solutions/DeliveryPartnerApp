import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  autoDismiss?: boolean;
  duration?: number;
}

interface NotificationState {
  list: NotificationItem[];
}

const initialState: NotificationState = {
  list: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationItem>) => {
      state.list.push({
        ...action.payload,
        autoDismiss: action.payload.autoDismiss ?? true,
        duration: action.payload.duration ?? 3000,
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(n => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.list = [];
    },
  },
});

// Auto-removal middleware
export const autoRemoveNotifications = ({ dispatch }: { dispatch: any }) => (next: any) => (action: any) => {
  const result = next(action);
  
  if (action.type === addNotification.type) {
    const notification = action.payload;
    if (notification.autoDismiss) {
      setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, notification.duration);
    }
  }
  
  return result;
};

export const { addNotification, removeNotification, clearAllNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;