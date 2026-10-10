import apiClient, { extractData } from './api';

// Types
export interface CreateFacilityRequest {
  facilityName: string;
  description: string;
}

export interface FacilityResponse {
  id: number;
  facilityName: string;
  description: string;
}

// Facility Service
class FacilityService {
  private readonly BASE_PATH = '/facilities';

  /**
   * Create a new facility (ADMIN or HOTEL_MANAGER)
   */
  async createFacility(data: CreateFacilityRequest): Promise<FacilityResponse> {
    const response = await apiClient.post(this.BASE_PATH, data);
    return extractData<FacilityResponse>(response);
  }

  /**
   * Get facility by ID
   */
  async getFacilityById(id: number): Promise<FacilityResponse> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}`);
    return extractData<FacilityResponse>(response);
  }

  /**
   * Get all facilities
   */
  async getAllFacilities(): Promise<FacilityResponse[]> {
    const response = await apiClient.get(this.BASE_PATH);
    return extractData<FacilityResponse[]>(response);
  }

  /**
   * Update facility (ADMIN only)
   */
  async updateFacility(id: number, data: CreateFacilityRequest): Promise<FacilityResponse> {
    const response = await apiClient.put(`${this.BASE_PATH}/${id}`, data);
    return extractData<FacilityResponse>(response);
  }

  /**
   * Delete facility (ADMIN only)
   */
  async deleteFacility(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }
}

export default new FacilityService();
