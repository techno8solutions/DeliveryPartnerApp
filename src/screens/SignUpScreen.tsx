// SignUpScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { COLORS } from '~/constants/colors';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigations/types';
import { ROUTES } from '~/constants/routes';
import { MaterialIcons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import clsx from 'clsx';
import { SafeAreaView } from 'react-native-safe-area-context';

type SignUpScreenProp = NativeStackNavigationProp<RootStackParamList, typeof ROUTES.SIGNUP>;

const SignUpScreen = () => {
  const navigation = useNavigation<SignUpScreenProp>();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    vehicleType: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const isValidPhone = (phone: string) => /^\d{10}$/.test(phone);
  const isStrongPassword = (pwd: string) => /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.{8,})/.test(pwd);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSignUp = async () => {
    if (!formData.fullName.trim())
      return Alert.alert('Validation Error', 'Please enter your full name');
    if (!isValidEmail(formData.email))
      return Alert.alert('Validation Error', 'Please enter a valid email address');
    if (!isValidPhone(formData.mobile))
      return Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number');
    if (!isStrongPassword(formData.password))
      return Alert.alert(
        'Weak Password',
        'Password must be 8+ chars, include uppercase, lowercase, numbers'
      );
    if (formData.password !== formData.confirmPassword)
      return Alert.alert('Validation Error', 'Passwords do not match');
    if (!formData.vehicleType)
      return Alert.alert('Validation Error', 'Please select your vehicle type');

    setIsLoading(true);

    try {
      // await dispatch(signUpDeliveryPartner(formData)).unwrap();

      navigation.navigate(ROUTES.OTP, { phone: '1234567890' });
    } catch (error) {
      const errMsg = (error as Error).message || 'Something went wrong';
      Alert.alert('Sign Up Failed', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView className="flex-1 bg-[#f8fafc]" keyboardShouldPersistTaps="handled">
      <SafeAreaView className="flex-1 px-6">
        <View className="items-center pb-4 pt-8">
          <Image source={require('../assets/delivery-boy.png')} className="mb-10 h-60 w-60" />
          <Text className="mb-2 text-center text-2xl font-bold text-[#1e293b]">
            Become a Delivery Partner
          </Text>
          <Text className="text-center text-base text-gray-500">
            Join our network of professional delivery partners
          </Text>
        </View>

        <View className="pt-4">
          {/* Input Field Template */}
          {[
            { label: 'Full Name', icon: 'person', field: 'fullName', placeholder: 'John Doe' },
            {
              label: 'Email Address',
              icon: 'email',
              field: 'email',
              placeholder: 'john@example.com',
              keyboard: 'email-address',
            },
            {
              label: 'Mobile Number',
              icon: 'phone',
              field: 'mobile',
              placeholder: '9876543210',
              keyboard: 'phone-pad',
              prefix: '+91',
            },
            {
              label: 'Vehicle Type',
              icon: 'directions-bike',
              field: 'vehicleType',
              placeholder: 'Bike/Cycle/Scooter',
            },
          ].map(({ label, icon, field, placeholder, keyboard, prefix }) => (
            <View className="mb-5" key={field}>
              <Text className="mb-2 text-sm font-medium text-gray-600">{label}</Text>
              <View className="h-14 flex-row items-center rounded-xl border border-gray-200 bg-white px-4">
                {prefix && <Text className="mr-2 text-gray-500">{prefix}</Text>}
                <MaterialIcons name={icon as any} size={20} color={COLORS.gray} className="mr-2" />
                <TextInput
                  placeholder={placeholder}
                  placeholderTextColor={COLORS.lightGray}
                  className="flex-1 text-base text-[#1e293b]"
                  keyboardType={keyboard as any}
                  value={formData[field as keyof typeof formData]}
                  onChangeText={(text) => handleChange(field, text)}
                />
              </View>
            </View>
          ))}

          {/* Password */}
          {['password', 'confirmPassword'].map((field) => {
            const isConfirm = field === 'confirmPassword';
            return (
              <View className="mb-5" key={field}>
                <Text className="mb-2 text-sm font-medium text-gray-600">
                  {isConfirm ? 'Confirm Password' : 'Password'}
                </Text>
                <View className="h-14 flex-row items-center rounded-xl border border-gray-200 bg-white px-4">
                  <MaterialIcons name="lock" size={20} color={COLORS.gray} className="mr-2" />
                  <TextInput
                    placeholder={isConfirm ? 'Confirm your password' : 'Create password'}
                    placeholderTextColor={COLORS.lightGray}
                    className="flex-1 text-base text-[#1e293b]"
                    secureTextEntry={field === 'password' ? !showPassword : !showConfirmPassword}
                    value={formData[field as keyof typeof formData]}
                    onChangeText={(text) => handleChange(field, text)}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      field === 'password'
                        ? setShowPassword(!showPassword)
                        : setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="ml-2 p-2">
                    <MaterialIcons
                      name={
                        (field === 'password' ? showPassword : showConfirmPassword)
                          ? 'visibility-off'
                          : 'visibility'
                      }
                      size={20}
                      color={COLORS.gray}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {/* Button */}
          <TouchableOpacity
            className={clsx(
              'mt-4 h-14 items-center justify-center rounded-xl bg-[#2563eb] shadow-md',
              isLoading && 'opacity-50'
            )}
            onPress={handleSignUp}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-base font-semibold text-white">
                Register as Delivery Partner
              </Text>
            )}
          </TouchableOpacity>

          <Text className="mt-6 text-center text-xs text-gray-500">
            By registering, you agree to our{' '}
            <Text className="font-medium text-[#2563eb]">Terms of Service</Text> and{' '}
            <Text className="font-medium text-[#2563eb]">Privacy Policy</Text>
          </Text>

          <View className="mb-12 mt-3 flex-row justify-center">
            <Text className="text-gray-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
              <Text className="font-semibold text-[#2563eb]">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
};

export default SignUpScreen;
