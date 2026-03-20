export interface User {
  id: string;
  name: string;
  role: string;
  active: boolean;
  created_at?: string;
}

export interface AuthLoginDto {
  email: string;
  password?: string;
}

export interface AuthRegisterDto {
  email: string;
  password?: string;
  name?: string;
}
