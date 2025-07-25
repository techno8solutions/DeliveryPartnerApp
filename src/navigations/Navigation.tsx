import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '~/screens/LoginScreen';
import OTPScreen from '~/screens/OTPScreen';
import DashboardScreen from '~/screens/DashboardScreen';
import { ROUTES } from '../constants/routes'; // import ROUTES
import { RootStackParamList } from './types';
import SignUpScreen from '~/screens/SignUpScreen';
import RegistrationScreen from '~/screens/RegistrationScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={ROUTES.REGISTRATION} component={RegistrationScreen}  />
        <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        <Stack.Screen
          name={ROUTES.SIGNUP}
          component={SignUpScreen}
          options={{ title: 'Create Account' }}
        />
        <Stack.Screen name={ROUTES.OTP} component={OTPScreen} options={{ title: 'Enter OTP' }} />
        <Stack.Screen
          name={ROUTES.DASHBOARD}
          component={DashboardScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
