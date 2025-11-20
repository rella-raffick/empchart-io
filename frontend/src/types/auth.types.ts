export type UserRole = 'admin' | 'ceo' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  department: string;
  isActive: boolean;
  employeeId: number | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  department: string;
  designation: string;
  phone: string;
  profileImage?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
