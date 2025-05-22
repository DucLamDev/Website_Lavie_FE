import apiClient from './client';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  username: string;
  role: string;
  token: string;
}

export interface UserData {
  _id: string;
  name: string;
  username: string;
  role: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async register(userData: {
    username: string;
    password: string;
    name: string;
    role: string;
  }): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  async getUserProfile(): Promise<UserData> {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};

export default authService;
