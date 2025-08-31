import React, { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Constants from 'expo-constants';
import { RootState } from '~/redux/store';

const useOnlineStatus = () => {
  const { userData } = useSelector((state: RootState) => state.auth);
  const appState = useRef(AppState.currentState);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const backendUrl = Constants.expoConfig?.extra?.backendUrl;
  console.log(userData);
  const api = async (endpoint: string) => {
    try {
      await axios.post(
        `${backendUrl}/v1/delivery-partners/${endpoint}?id=${userData?.user?.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${userData}` },
        }
      );
    } catch (err) {
      console.log('API error:', endpoint, err.message);
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        api('online');
        // start heartbeat
        if (!heartbeatRef.current) {
          heartbeatRef.current = setInterval(() => api('heartbeat'), 30000); // every 30s
        }
      } else if (nextAppState.match(/inactive|background/)) {
        api('offline');
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
          heartbeatRef.current = null;
        }
      }
      appState.current = nextAppState;
    });

    // cleanup
    return () => {
      subscription.remove();
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [userData]);
};

export default useOnlineStatus;
