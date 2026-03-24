export interface User {
  id: string;
  name: string;
  role: string;
  active: boolean;
  created_at?: string;
}

export interface UpdateUserDto {
  role?: string;
  active?: boolean;
}

export interface AuthLoginDto {
  email: string;
  password: string;
}

export interface AuthRegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResetPasswordDto {
  email: string;
}

export interface AuthUpdatePasswordDto {
  password: string;
}

export interface AuthRefreshTokenDto {
  refresh_token: string;
}
