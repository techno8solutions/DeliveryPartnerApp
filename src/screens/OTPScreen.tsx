import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  Keyboard,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Platform,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES } from '~/constants/routes';
import { RootStackParamList } from '~/navigations/types';

const OTPScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(60);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handleChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Possibly pasted full OTP
      const values = value.split('').slice(0, 6);
      setOtp(values);
      inputsRef.current[values.length - 1]?.focus();
      return;
    }

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (index === otp.length - 1 && value) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const startShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
    ]).start();
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSubmit = () => {
    animateButton();
    const code = otp.join('');

    if (code.length < 6) {
      startShake();
      Alert.alert('Incomplete Code', 'Please enter the full 6-digit OTP');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', `OTP Verified: ${code}`);
      navigation.navigate(ROUTES.DASHBOARD);
    }, 1500);
  };

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleResend = () => {
    if (timer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setTimer(60);
    inputsRef.current[0]?.focus();
    Alert.alert('OTP Resent', 'A new code has been sent to your number');
  };

  return (
    <View className="flex-1 items-center justify-center bg-white px-8">
      {/* Header */}
      <View className="mb-8 items-center">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Ionicons name="lock-closed-outline" size={32} color="#3b82f6" />
        </View>
        <Text className="mb-2 text-2xl font-bold text-gray-900">Verify Your Number</Text>
        <Text className="text-center text-gray-600">
          We&apos;ve sent a 6-digit code to your mobile number
        </Text>
      </View>

      {/* OTP Inputs */}
      <Animated.View style={{ transform: [{ translateX: shakeAnim }] }} className="mb-8 w-full">
        <View className="flex-row justify-evenly">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputsRef.current[index] = ref;
              }}
              keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
              maxLength={1}
              value={digit}
              onChangeText={(value) => handleChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              className={`h-16 w-12 rounded-xl border-2 text-center text-2xl font-bold ${
                digit ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              selectTextOnFocus
              returnKeyType="next"
              importantForAutofill="no"
              autoComplete="off"
              textContentType="oneTimeCode"
            />
          ))}
        </View>
      </Animated.View>

      {/* Submit Button */}
      <Animated.View style={{ transform: [{ scale: buttonScale }] }} className="w-full">
        <TouchableOpacity
          className={`flex-row items-center justify-center rounded-xl py-4 ${
            isLoading ? 'bg-blue-400' : 'bg-blue-600'
          }`}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={isLoading}>
          {isLoading ? (
            <Ionicons name="hourglass-outline" size={24} color="white" />
          ) : (
            <>
              <Text className="text-lg font-semibold text-white">Verify OTP</Text>
              <Ionicons name="arrow-forward" size={20} color="white" className="ml-2" />
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Resend Timer */}
      <View className="mt-6 flex-row items-center">
        <Text className="text-gray-600">{"Didn't receive code?"}</Text>
        <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
          <Text className={`ml-2 font-bold ${timer === 0 ? 'text-blue-600' : 'text-gray-400'}`}>
            {timer > 0 ? `Resend in ${timer}s` : 'Resend Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Back Button */}
      <View className="absolute bottom-8">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center">
          <Ionicons name="arrow-back" size={18} color="#3b82f6" />
          <Text className="ml-1 text-blue-600">Change phone number</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OTPScreen;
