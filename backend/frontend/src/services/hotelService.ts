import apiClient, { extractData } from './api';

// Types
export interface CreateHotelRequest {
  name: string;
  description: string;
  address: string;
  city: string;
  phoneNumber: string;
  email: string;
  starRating: number;
  amenities: string[];
}

export interface HotelResponse {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  phoneNumber: string;
  email: string;
  starRating: number;
  amenities: string[];
  registrationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  managerId: number;
  managerName: string;
  image?: string; // Base64 encoded image
  createdAt: string;
  updatedAt: string;
}

// Hotel Service
class HotelService {
  private readonly BASE_PATH = '/hotels';

  /**
   * Create a new hotel (HOTEL_MANAGER only)
   */
  async createHotel(data: CreateHotelRequest): Promise<HotelResponse> {
    const response = await apiClient.post(this.BASE_PATH, data);
    return extractData<HotelResponse>(response);
  }

  /**
   * Create a new hotel with image (HOTEL_MANAGER only)
   */
  async createHotelWithImage(data: CreateHotelRequest, imageFile?: File): Promise<HotelResponse> {
    const formData = new FormData();
    
    // Map frontend field names to backend field names
    formData.append('hotelName', data.name);
    formData.append('address', data.address);
    formData.append('city', data.city);
    formData.append('description', data.description);
    formData.append('contactPhone', data.phoneNumber);
    
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    const response = await apiClient.post(`${this.BASE_PATH}/with-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return extractData<HotelResponse>(response);
  }

  /**
   * Get hotel by ID
   */
  async getHotelById(id: number): Promise<HotelResponse> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}`);
    return extractData<HotelResponse>(response);
  }

  /**
   * Get all hotels
   */
  async getAllHotels(): Promise<HotelResponse[]> {
    const response = await apiClient.get(this.BASE_PATH);
    return extractData<HotelResponse[]>(response);
  }

  /**
   * Get hotels by city
   */
  async getHotelsByCity(city: string): Promise<HotelResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/city/${city}`);
    return extractData<HotelResponse[]>(response);
  }

  /**
   * Get hotels by manager ID
   */
  async getHotelsByManager(managerId: number): Promise<HotelResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/manager/${managerId}`);
    return extractData<HotelResponse[]>(response);
  }

  /**
   * Get current manager's hotel (HOTEL_MANAGER only)
   */
  async getManagerHotel(): Promise<HotelResponse> {
    const response = await apiClient.get(`${this.BASE_PATH}/manager/my-hotel`);
    return extractData<HotelResponse>(response);
  }

  /**
   * Get hotels by status (ADMIN only)
   */
  async getHotelsByStatus(status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<HotelResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/status/${status}`);
    return extractData<HotelResponse[]>(response);
  }

  /**
   * Update hotel
   */
  async updateHotel(id: number, data: CreateHotelRequest): Promise<HotelResponse> {
    const response = await apiClient.put(`${this.BASE_PATH}/${id}`, data);
    return extractData<HotelResponse>(response);
  }

  /**
   * Approve hotel (ADMIN only)
   */
  async approveHotel(id: number): Promise<HotelResponse> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/approve`);
    return extractData<HotelResponse>(response);
  }

  /**
   * Reject hotel (ADMIN only)
   */
  async rejectHotel(id: number): Promise<HotelResponse> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/reject`);
    return extractData<HotelResponse>(response);
  }

  /**
   * Delete hotel
   */
  async deleteHotel(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }
}

export default new HotelService();
