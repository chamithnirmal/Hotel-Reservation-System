import apiClient, { extractData } from './api';

// Types
export interface CreateVenueRequest {
  venueName: string;
  description: string;
  capacity: number;
  facilityIds: number[];
}

export interface VenueResponse {
  id: number;
  venueName: string;
  description: string;
  capacity: number;
  hotelId: number;
  hotelName: string;
  facilities: FacilityResponse[];
  isActive: boolean;
}

export interface FacilityResponse {
  id: number;
  facilityName: string;
  description: string;
}

// Venue Service
class VenueService {
  private readonly BASE_PATH = '/venues';

  /**
   * Create a new venue (HOTEL_MANAGER or ADMIN)
   */
  async createVenue(hotelId: number, data: CreateVenueRequest): Promise<VenueResponse> {
    const response = await apiClient.post(`${this.BASE_PATH}/hotel/${hotelId}`, data);
    return extractData<VenueResponse>(response);
  }

  /**
   * Create a new venue with image
   */
  async createVenueWithImage(hotelId: number, data: CreateVenueRequest, imageFile: File | null): Promise<VenueResponse> {
    const formData = new FormData();
    formData.append('venueName', data.venueName);
    formData.append('description', data.description || '');
    formData.append('capacity', data.capacity.toString());
    
    // Add facility IDs
    data.facilityIds.forEach(id => {
      formData.append('facilityIds', id.toString());
    });
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await apiClient.post(`${this.BASE_PATH}/hotel/${hotelId}/with-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return extractData<VenueResponse>(response);
  }

  /**
   * Get venue by ID
   */
  async getVenueById(id: number): Promise<VenueResponse> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}`);
    return extractData<VenueResponse>(response);
  }

  /**
   * Get all venues
   */
  async getAllVenues(): Promise<VenueResponse[]> {
    const response = await apiClient.get(this.BASE_PATH);
    return extractData<VenueResponse[]>(response);
  }

  /**
   * Get venues by hotel
   */
  async getVenuesByHotel(hotelId: number): Promise<VenueResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/hotel/${hotelId}`);
    return extractData<VenueResponse[]>(response);
  }

  /**
   * Get venues by capacity range
   */
  async getVenuesByCapacity(minCapacity: number, maxCapacity: number): Promise<VenueResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/capacity`, {
      params: { minCapacity, maxCapacity }
    });
    return extractData<VenueResponse[]>(response);
  }

  /**
   * Get venues by facility
   */
  async getVenuesByFacility(facilityId: number): Promise<VenueResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/facility/${facilityId}`);
    return extractData<VenueResponse[]>(response);
  }

  /**
   * Update venue
   */
  async updateVenue(id: number, data: CreateVenueRequest): Promise<VenueResponse> {
    const response = await apiClient.put(`${this.BASE_PATH}/${id}`, data);
    return extractData<VenueResponse>(response);
  }

  /**
   * Delete venue
   */
  async deleteVenue(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }
}

export default new VenueService();
