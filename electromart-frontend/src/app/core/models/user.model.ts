export type UserRole = 'ROLE_CUSTOMER' | 'ROLE_ADMIN' | 'ROLE_STAFF';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OtpVerifyRequest {
  email: string;
  otpCode: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otpCode: string;
  newPassword: string;
}
