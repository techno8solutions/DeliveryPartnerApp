// utils/helpers.ts

import { OrderStatus } from '~/redux/features/orders/orderSlice';

// Format duration in seconds to readable string (hh:mm:ss)
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};

// Calculate ETA based on distance and average speed (5 m/s ~ 18 km/h)
export const calculateETA = (distance: number): string => {
  const averageSpeed = 5; // meters per second
  const seconds = distance / averageSpeed;
  return formatDuration(seconds);
};

// Generate random coordinates near a given point (for demo purposes)
export const generateNearbyCoordinates = (
  lat: number,
  lng: number,
  radiusMeters: number = 2000
): { latitude: number; longitude: number } => {
  const radius = radiusMeters / 111300; // approx meters to degrees
  const y0 = lat;
  const x0 = lng;
  const u = Math.random();
  const v = Math.random();
  const w = radius * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  return {
    latitude: y + y0,
    longitude: x + x0,
  };
};
// utils/helper.ts
export const formatDistance = (distance: number | string): string => {
  if (typeof distance === 'string') {
    return distance; // Already formatted
  }

  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  } else {
    return `${(distance / 1000).toFixed(1)} km`;
  }
};

// Add this function to convert API status to frontend status
export const mapApiStatusToFrontend = (apiStatus: string): OrderStatus => {
  const statusMap: Record<string, OrderStatus> = {
    assigned: 'Pending',
    accepted: 'Pending',
    picked_up: 'Picked',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    // 'cancelled': 'Cancelled',
    // 'rejected': 'Rejected'
  };

  return statusMap[apiStatus] || 'Pending';
};