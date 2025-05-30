export interface ChangePasswordDto {
  id: string;
  password: string;
}

export interface ChangePasswordResponse {
  code: number;
  message?: string;
  data?: any;
}

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivationCodeDto {
  email: string;
}

export interface VerifyActivationCodeDto {
  email: string;
  code: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message?: string;
  data?: T;
}
