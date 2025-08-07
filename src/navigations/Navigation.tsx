import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store'; // adjust if needed

import LoginScreen from '~/screens/LoginScreen';
import OTPScreen from '~/screens/OTPScreen';
import DashboardScreen from '~/screens/DashboardScreen';
import SignUpScreen from '~/screens/SignUpScreen';
import RegistrationScreen from '~/screens/RegistrationScreen';
import { ROUTES } from '../constants/routes';
import { RootStackParamList } from './types';
import NotificationScreen from '~/screens/NotificationScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation = () => {
  const { isSignedUp, isLoggedIn, otpVerified } = useSelector((state: RootState) => state.auth);

  let initialRoute: keyof RootStackParamList = ROUTES.SIGNUP;

  if (isSignedUp && !isLoggedIn) {
    initialRoute = ROUTES.REGISTRATION;
  }

  if (isSignedUp && isLoggedIn && !otpVerified) {
    initialRoute = ROUTES.OTP;
  }

  if (isSignedUp && isLoggedIn && otpVerified) {
    initialRoute = ROUTES.DASHBOARD;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name={ROUTES.SIGNUP} component={SignUpScreen} />
        <Stack.Screen name={ROUTES.REGISTRATION} component={RegistrationScreen} />
        <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        <Stack.Screen name={ROUTES.OTP} component={OTPScreen} />
        <Stack.Screen name={ROUTES.DASHBOARD} component={DashboardScreen} />
        <Stack.Screen name={ROUTES.NOTFICATION} component={NotificationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
