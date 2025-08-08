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
  userID?: string;
  registrationToken?: string;
  SignUpToken?: string;
  userData: any | null;
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
  userID: undefined,
  registrationToken: undefined,
  SignUpToken: undefined,
  userData: null,
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
    setTempToken: (state, action: PayloadAction<{ token: string; userID: string }>) => {
      state.tempToken = action.payload.token;
      state.userID = action.payload.userID;
    },
    setRegistrationToken: (state, action: PayloadAction<{ token: string; userID: string }>) => {
      state.registrationToken = action.payload.token;
      state.userID = action.payload.userID;
    },
    setSignUpToken: (state, action: PayloadAction<{ token: string }>) => {
      state.SignUpToken = action.payload.token;
    },
    setUserData: (state, action: PayloadAction<any>) => {
      state.userData = action.payload;
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
  setTempToken,
  setSignUpToken,
  setRegistrationToken,
  setUserData,
} = authSlice.actions;

export default authSlice.reducer;

export type RootState = ReturnType<typeof authSlice.reducer>;
