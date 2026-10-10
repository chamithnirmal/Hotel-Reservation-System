import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Standard Response Interface
interface StandardResponseDTO<T = any> {
  code: number;
  message: string;
  data: T;
}

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<StandardResponseDTO>) => {
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    })

    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to extract data from StandardResponseDTO
export const extractData = <T>(response: { data: StandardResponseDTO<T> }): T => {
  return response.data.data;
};

export default apiClient;
export { API_BASE_URL };
export type { StandardResponseDTO };
