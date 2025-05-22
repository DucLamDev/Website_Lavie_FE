import client from './client';

// Types
export interface User {
  _id: string;
  username: string;
  name: string;
  role: 'admin' | 'sales' | 'customer';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'sales' | 'customer';
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  name?: string;
  role?: 'admin' | 'sales' | 'customer';
}

// Get all users
export const getUsers = async (): Promise<User[]> => {
  const response = await client.get('/users');
  return response.data;
};

// Get user by ID
export const getUserById = async (id: string): Promise<User> => {
  const response = await client.get(`/users/${id}`);
  return response.data;
};

// Create new user
export const createUser = async (userData: CreateUserRequest): Promise<User> => {
  const response = await client.post('/users', userData);
  return response.data;
};

// Update user
export const updateUser = async (id: string, userData: UpdateUserRequest): Promise<User> => {
  const response = await client.put(`/users/${id}`, userData);
  return response.data;
};

// Delete user
export const deleteUser = async (id: string): Promise<{ message: string }> => {
  const response = await client.delete(`/users/${id}`);
  return response.data;
};
