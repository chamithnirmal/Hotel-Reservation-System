import apiClient, { extractData } from './api';

// Types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  address: string;
  role: 'CUSTOMER' | 'HOTEL_MANAGER' | 'ADMIN';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  hotelId?: number;  // For HOTEL_MANAGER role
  message: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  hotelId?: number;
  createdAt: string;
}

// Auth Service
class AuthService {
  private readonly BASE_PATH = '/auth';

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post(`${this.BASE_PATH}/register`, data);
    const authData = extractData<AuthResponse>(response);
    
    // Store token and user info
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify({
      id: authData.userId,
      name: authData.name,
      email: authData.email,
      role: authData.role,
      isActive: authData.isActive,
      hotelId: authData.hotelId  // Store hotelId for HOTEL_MANAGER
    }));
    
    // Store hotelId separately for easy access
    if (authData.hotelId) {
      localStorage.setItem('hotelId', authData.hotelId.toString());
    }
    
    return authData;
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post(`${this.BASE_PATH}/login`, data);
    const authData = extractData<AuthResponse>(response);
    
    // Store token and user info
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify({
      id: authData.userId,
      name: authData.name,
      email: authData.email,
      role: authData.role,
      isActive: authData.isActive,
      hotelId: authData.hotelId  // Store hotelId for HOTEL_MANAGER
    }));
    
    // Store hotelId separately for easy access
    if (authData.hotelId) {
      localStorage.setItem('hotelId', authData.hotelId.toString());
    }
    
    return authData;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const token = localStorage.getItem('token');
    if (token) {
      await apiClient.post(`${this.BASE_PATH}/logout`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('hotelId');  // Remove hotelId on logout
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post(`${this.BASE_PATH}/forgot-password`, null, {
      params: { email }
    });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post(`${this.BASE_PATH}/reset-password`, null, {
      params: { token, newPassword }
    });
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): { id: number; name: string; email: string; role: string; isActive: boolean } | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Get user role
   */
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }
}

export default new AuthService();
