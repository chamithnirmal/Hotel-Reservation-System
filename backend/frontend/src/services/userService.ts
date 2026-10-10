import apiClient, { extractData } from './api';

// Types
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  role: 'CUSTOMER' | 'HOTEL_MANAGER' | 'ADMIN';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

// User Service
class UserService {
  private readonly BASE_PATH = '/users';

  /**
   * Get all users (ADMIN only)
   */
  async getAllUsers(): Promise<UserResponse[]> {
    const response = await apiClient.get(this.BASE_PATH);
    return extractData<UserResponse[]>(response);
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<UserResponse> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}`);
    return extractData<UserResponse>(response);
  }

  /**
   * Get current user profile
   */
  async getCurrentUserProfile(): Promise<UserResponse> {
    const response = await apiClient.get(`${this.BASE_PATH}/profile`);
    return extractData<UserResponse>(response);
  }

  /**
   * Get users by role (ADMIN only)
   */
  async getUsersByRole(role: 'CUSTOMER' | 'HOTEL_MANAGER' | 'ADMIN'): Promise<UserResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/role/${role}`);
    return extractData<UserResponse[]>(response);
  }

  /**
   * Update user
   */
  async updateUser(id: number, data: Partial<UserResponse>): Promise<UserResponse> {
    const response = await apiClient.put(`${this.BASE_PATH}/${id}`, data);
    return extractData<UserResponse>(response);
  }

  /**
   * Delete user (ADMIN only)
   */
  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }
}

export default new UserService();
