import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  phone: string;
  email: string;
  password: string;
  isSignedUp: boolean;
  isLoggedIn: boolean;
  otpVerified: boolean;
  method: 'phone' | 'email' | 'google' | null;
   tempToken?: string;
  partnerId?: string;
}

const initialState: AuthState = {
  phone: '',
  email: '',
  password: '',
  isSignedUp: false,
  isLoggedIn: false,
  otpVerified: false,
  method: null,
    tempToken: undefined,
  partnerId: undefined,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Phone SignUp or Login
    setPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
      state.method = 'phone';
    },

    // Email SignUp or Login
    setEmailCredentials: (state, action: PayloadAction<{ email: string; password: string }>) => {
      state.email = action.payload.email;
      state.password = action.payload.password;
      state.method = 'email';
    },

    // Google auth
    setGoogleAuth: (state) => {
      state.method = 'google';
      state.isLoggedIn = true;
    },

    // OTP verified
    verifyOTP: (state) => {
      state.otpVerified = true;
    },

    // Mark user as signed up
    setSignedUp: (state) => {
      state.isSignedUp = true;
    },

    // Explicit login (used for email login)
    login: (state) => {
      state.isLoggedIn = true;
    },

    // Logout
    logout: (state) => {
      state.phone = '';
      state.email = '';
      state.password = '';
      state.isSignedUp = false;
      state.isLoggedIn = false;
      state.otpVerified = false;
      state.method = null;
    },
        setTempToken: (
      state,
      action: PayloadAction<{ token: string; partnerId: string }>
    ) => {
      state.tempToken = action.payload.token;
      state.partnerId = action.payload.partnerId;
    },
  },
});

export const {
  setPhone,
  setEmailCredentials,
  setGoogleAuth,
  verifyOTP,
  setSignedUp,
  login,
  logout,
  setTempToken
} = authSlice.actions;

export default authSlice.reducer;

export type RootState = ReturnType<typeof authSlice.reducer>;
