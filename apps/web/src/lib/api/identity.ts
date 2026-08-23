import { config } from '../config';
import { apiClient } from './client';
import { User, LoginResponse, RegisterResponse } from '../../types/user';

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export const identityApi = {
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    return apiClient<RegisterResponse>(`${config.identityServiceUrl}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(payload: LoginPayload): Promise<LoginResponse> {
    return apiClient<LoginResponse>(`${config.identityServiceUrl}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMe(): Promise<User> {
    return apiClient<User>(`${config.identityServiceUrl}/api/users/me`, {
      method: 'GET',
    });
  },

  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    return apiClient<{ access: string }>(`${config.identityServiceUrl}/api/auth/refresh`, {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  },
};
