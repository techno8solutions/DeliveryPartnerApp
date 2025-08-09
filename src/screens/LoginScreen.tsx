import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setPhone, setSignUpToken, setUserData } from '../redux/features/auth/authSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ROUTES } from '~/constants/routes';
import { COLORS } from '~/constants/colors';
import { Dispatch } from '@reduxjs/toolkit';
import axios from 'axios';
import Constants from 'expo-constants';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const backendUrl = Constants.expoConfig?.extra?.backendUrl;

  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch: Dispatch<any> = useDispatch();

  const isValidEmail = (val: string) => /\S+@\S+\.\S+/.test(val);
  const isValidPhone = (val: string) => /^\d{10}$/.test(val);
  const isStrongPassword = (val: string) => /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.{8,})/.test(val);

  const isPhoneLogin = isValidPhone(input);
  const isEmailLogin = isValidEmail(input);

  const handleLogin = async () => {
    if (!input || input.trim() === '') {
      Alert.alert('Input Required', 'Please enter your email or phone number.');
      return;
    }

    if (isPhoneLogin) {
      // Assuming phone-based login goes through a different flow
      setIsLoading(true);
      dispatch(setPhone(input));
      setIsLoading(false);
      // Navigate to OTP screen or similar
      return;
    }

    if (isEmailLogin) {
      if (!password || !isStrongPassword(password)) {
        Alert.alert(
          'Weak Password',
          'Password must be at least 8 characters long and include uppercase, lowercase, and numbers.'
        );
        return;
      }

      setIsLoading(true);

      try {
        const response = await axios.post(`${backendUrl}/delivery-partner/auth/login`, {
          email: input,
          password,
        });

        const { token, partner, user } = response.data;
        console.log(response.data);
        // Save token and partner data to store
        dispatch(setSignUpToken(token));
        dispatch(setUserData({ partner: partner, user: user }));

        setIsLoading(false);
        Alert.alert('Success', 'Login successful');
          if (!user.is_verified) {
            navigation.replace(ROUTES.PROFILE_REVIEW);
          } else if (!user.is_email_verified) {
            navigation.replace(ROUTES.OTP, { email: user.email, phone: user.phone });
          } else if (!user.is_registered) {
            navigation.replace(ROUTES.REGISTRATION);
          } else {
            navigation.replace(ROUTES.DASHBOARD);
          }
      } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        setIsLoading(false);

        if (error.response?.data?.message) {
          Alert.alert('Login Failed', error.response.data.message);
        } else {
          Alert.alert('Login Failed', 'Something went wrong');
        }
      }

      return;
    }

    Alert.alert('Invalid Input', 'Please select a login method.');
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // dispatch(authenticate());
      // navigation.navigate(ROUTES.HOME); // Optional
    }, 1000);
  };

  return (
    <SafeAreaView className="bg-background flex-1 justify-center px-6">
      <View className="mb-8 items-center">
        <Image source={require('../assets/delivery-boy.png')} className="mb-10 h-60 w-60" />
        <Text className="mb-2 text-3xl font-bold" style={{ color: COLORS.textDark }}>
          DeliveryMate
        </Text>
        <Text className="text-gray-500">Deliver happiness to your doorstep</Text>
      </View>

      {/* Input Field */}
      <View className="mb-4">
        <Text className="mb-2 font-medium" style={{ color: COLORS.textDark }}>
          Email or Phone Number
        </Text>
        <View
          className="flex-row items-center rounded-lg border p-3 shadow-sm"
          style={{
            borderColor: COLORS.lightGray,
            backgroundColor: COLORS.inputBg,
          }}>
          <TextInput
            placeholder="example@email.com or 9876543210"
            keyboardType="default"
            value={input}
            onChangeText={setInput}
            className="flex-1"
            style={{ color: COLORS.textDark }}
            autoCapitalize="none"
          />
        </View>
        {/* Show password field only for email */}
        {(isPhoneLogin || isEmailLogin) && (
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="mt-3 h-16 rounded-lg border p-3 shadow-sm"
            style={{
              borderColor: COLORS.lightGray,
              backgroundColor: COLORS.inputBg,
              color: COLORS.textDark,
            }}
          />
        )}

        {/* Error messages */}
        {!isPhoneLogin && !isEmailLogin && input.length > 0 && (
          <Text className="mt-1 text-xs" style={{ color: COLORS.danger }}>
            Please enter a valid phone number or email
          </Text>
        )}
        {isEmailLogin && password.length > 0 && !isStrongPassword(password) && (
          <Text className="mt-1 text-xs" style={{ color: COLORS.danger }}>
            Weak password. Must be 8+ characters with uppercase, lowercase and numbers.
          </Text>
        )}
      </View>

      {/* Login Button */}
      <TouchableOpacity
        onPress={handleLogin}
        disabled={
          isLoading ||
          (!isPhoneLogin && !isEmailLogin) ||
          (isEmailLogin && !isStrongPassword(password))
        }
        className="rounded-lg p-4 shadow-md"
        style={{
          backgroundColor:
            isPhoneLogin || (isEmailLogin && isStrongPassword(password))
              ? COLORS.primary
              : COLORS.gray300,
        }}
        activeOpacity={0.85}>
        <Text className="text-center text-lg font-semibold" style={{ color: COLORS.textLight }}>
          {isLoading
            ? isPhoneLogin
              ? 'Sending OTP...'
              : 'Signing in...'
            : isPhoneLogin
              ? 'Send OTP'
              : 'Sign In'}
        </Text>
      </TouchableOpacity>

      {/* Google Login Button */}
      <TouchableOpacity
        onPress={handleGoogleLogin}
        disabled={isLoading}
        className="mt-6 flex-row items-center justify-center rounded-lg border p-3 shadow-sm"
        style={{
          borderColor: COLORS.lightGray,
          backgroundColor: COLORS.inputBg,
        }}
        activeOpacity={0.85}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
          className="mr-2 h-6 w-6"
        />
        <Text className="font-medium" style={{ color: COLORS.textDark }}>
          Continue with Google
        </Text>
      </TouchableOpacity>

      {/* Sign Up Link */}
      <View className="mt-6 flex-row justify-center">
        <Text className="text-gray-500">Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.SIGNUP)}>
          <Text className="font-medium" style={{ color: COLORS.primary }}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>

      {/* Terms & Privacy */}
      <View className="mt-8">
        <Text className="text-center text-xs" style={{ color: COLORS.textGray }}>
          By continuing, you agree to our{' '}
          <Text style={{ color: COLORS.primary }}>Terms of Service</Text> and{' '}
          <Text style={{ color: COLORS.primary }}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
