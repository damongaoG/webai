export interface LoginAdminDto {
  username: string;
  password: string;
  rememberMe: boolean;
  verifyCode?: string;
}
