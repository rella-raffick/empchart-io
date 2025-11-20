import { apiRequest } from '../utils/api.utils';
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User
} from '../types/auth.types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response;
  },

  async getCurrentUser(token: string): Promise<User> {
    const response = await apiRequest<User>('/api/auth/me', {
      method: 'GET',
      token,
    });
    return response;
  },
};
