export const isValidEmail = (email: string): boolean => /\S+@\S+\.\S+/.test(email);

export const isValidPhone = (phone: string): boolean => /^\d{10}$/.test(phone);

export const isStrongPassword = (password: string): boolean =>
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.{8,})/.test(password);
