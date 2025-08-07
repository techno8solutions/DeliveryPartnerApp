export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  OTP: { phone: string ,email:string};
  Registration: undefined;
  Notifications:undefined;
  Verification: { email: string; mobile: string };
  Dashboard: undefined;
  OrderDetails: { orderId: string };
  Profile: undefined;
  Map: undefined;
  Earnings: undefined;
  History: undefined;
  Support: undefined;
  Availability: undefined;
};
