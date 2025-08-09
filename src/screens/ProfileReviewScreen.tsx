// screens/ProfileReviewScreen.tsx
import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '~/constants/routes';

const ProfileReviewScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#F9FAFB',
      }}>
      {/* Online illustration */}
      <Image
        source={{
          uri: 'https://cdn-icons-png.flaticon.com/512/679/679720.png',
        }}
        style={{ width: 180, height: 180, marginBottom: 20 }}
        resizeMode="contain"
      />

      {/* Title */}
      <Text className="mb-2 text-center text-2xl font-bold text-gray-800">
        Profile Under Review
      </Text>

      {/* Subtitle */}
      <Text className="mb-6 text-center text-base text-gray-600">
        Thank you for submitting your application!
      </Text>

      {/* Card */}
      <View className="mb-6 w-full rounded-2xl bg-white p-5 shadow-lg">
        <Text className="mb-4 text-sm leading-5 text-gray-700">
          Our team is currently reviewing your profile and documents. This process typically takes{' '}
          <Text className="font-semibold">24-48 hours</Text>.
        </Text>

        <Text className="mb-4 text-sm leading-5 text-gray-700">
          You'll receive a notification once your profile is approved. In the meantime, you can:
        </Text>

        {/* Bullet Points */}
        <View className="ml-2">
          <Text className="mb-2 text-sm text-gray-700">✅ Review our partner guidelines</Text>
          <Text className="mb-2 text-sm text-gray-700">🚴 Prepare your delivery equipment</Text>
          <Text className="text-sm text-gray-700">📧 Check your email for updates</Text>
        </View>
      </View>

    </ScrollView>
  );
};

export default ProfileReviewScreen;
