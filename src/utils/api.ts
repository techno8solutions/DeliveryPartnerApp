// utils/api.js
import axios from 'axios';
import Constants from 'expo-constants';

const backendUrl = Constants.expoConfig?.extra?.backendUrl;

// Export all functions as named exports
export const getSupportTickets = async (partnerId) => {
  try {
    const response = await axios.get(
      `${backendUrl}/v1/delivery-partners/get-ticekt?partner_id=${partnerId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Get tickets error:', error);
    throw error;
  }
};

export const createSupportTicket = async (ticketData) => {
  try {
    const response = await axios.post(
      `${backendUrl}/v1/delivery-partners/create-support-ticket`,
      ticketData,
    );
    return response.data;
  } catch (error) {
    console.error('Create ticket error:', error);
    throw error;
  }
};

export const getNotifications = async (partnerId, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      partner_id: partnerId,
      ...params
    }).toString();

    const response = await axios.get(
      `${backendUrl}/delivery-partner/notifications?${queryParams}`,
    );
    return response.data;
  } catch (error) {
    console.error('Get notifications error:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.put(
      `${backendUrl}/delivery-partner/notifications/read?id=${notificationId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Mark as read error:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (partnerId) => {
  try {
    const response = await axios.put(
      `${backendUrl}/delivery-partner/notifications/read-all?partner_id=${partnerId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Mark all as read error:', error);
    throw error;
  }
};

export const getUnreadNotificationCount = async (partnerId) => {
  try {
    const response = await axios.get(
      `${backendUrl}/delivery-partner/notifications/unread-count?partner_id=${partnerId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Get unread count error:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(
      `${backendUrl}/delivery-partner/notifications/delete-notification?notification_id=${notificationId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Delete notification error:', error);
    throw error;
  }
};

// Add default export if needed
const api = {
  getSupportTickets,
  createSupportTicket,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  deleteNotification,
};

export default api;