import React from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const DashboardScreen = () => {
  const phone = useSelector((state: RootState) => state.auth.phone);

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl font-bold">Welcome!</Text>
      <Text className="mt-2 text-lg text-gray-700">Phone: {phone}</Text>
    </View>
  );
};

export default DashboardScreen;
