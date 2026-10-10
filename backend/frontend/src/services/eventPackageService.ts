import apiClient, { extractData } from './api';

// Types
export type EventType = 'WEDDING' | 'BIRTHDAY' | 'CONFERENCE' | 'CORPORATE' | 'ANNIVERSARY' | 'ENGAGEMENT' | 'RECEPTION' | 'SEMINAR';

export interface CreateEventPackageRequest {
  packageName: string;
  eventType: EventType;
  description: string;
  basePrice: number;
  facilityIds: number[];
}

export interface EventPackageResponse {
  id: number;
  packageName: string;
  eventType: EventType;
  description: string;
  basePrice: number;
  venueId: number;
  venueName: string;
  includedFacilities: FacilityResponse[];
  pricing: PackagePriceResponse[];
  isActive: boolean;
}

export interface FacilityResponse {
  id: number;
  facilityName: string;
  description: string;
}

export interface PackagePriceResponse {
  id: number;
  guestCount: number;
  totalPrice: number;
}

export interface AddPackagePriceRequest {
  minGuests: number;
  maxGuests: number;
  pricePerPerson: number;
}

// Event Package Service
class EventPackageService {
  private readonly BASE_PATH = '/event-packages';

  /**
   * Create a new event package (HOTEL_MANAGER or ADMIN)
   */
  async createPackage(venueId: number, data: CreateEventPackageRequest): Promise<EventPackageResponse> {
    const response = await apiClient.post(`${this.BASE_PATH}/venue/${venueId}`, data);
    return extractData<EventPackageResponse>(response);
  }

  /**
   * Get event package by ID
   */
  async getPackageById(id: number): Promise<EventPackageResponse> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}`);
    return extractData<EventPackageResponse>(response);
  }

  /**
   * Get all event packages
   */
  async getAllPackages(): Promise<EventPackageResponse[]> {
    const response = await apiClient.get(this.BASE_PATH);
    return extractData<EventPackageResponse[]>(response);
  }

  /**
   * Get all packages by venue
   */
  async getPackagesByVenue(venueId: number): Promise<EventPackageResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/venue/${venueId}`);
    return extractData<EventPackageResponse[]>(response);
  }

  /**
   * Get packages by event type
   */
  async getPackagesByEventType(eventType: EventType): Promise<EventPackageResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/event-type/${eventType}`);
    return extractData<EventPackageResponse[]>(response);
  }

  /**
   * Update event package (HOTEL_MANAGER or ADMIN)
   */
  async updatePackage(id: number, data: CreateEventPackageRequest): Promise<EventPackageResponse> {
    const response = await apiClient.put(`${this.BASE_PATH}/${id}`, data);
    return extractData<EventPackageResponse>(response);
  }

  /**
   * Toggle package status (HOTEL_MANAGER or ADMIN)
   */
  async togglePackageStatus(id: number): Promise<EventPackageResponse> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/toggle-status`);
    return extractData<EventPackageResponse>(response);
  }

  /**
   * Add facilities to package (HOTEL_MANAGER or ADMIN)
   */
  async addFacilitiesToPackage(packageId: number, facilityIds: number[]): Promise<EventPackageResponse> {
    const response = await apiClient.post(`${this.BASE_PATH}/${packageId}/add-facilities`, facilityIds);
    return extractData<EventPackageResponse>(response);
  }

  /**
   * Remove facilities from package (HOTEL_MANAGER or ADMIN)
   */
  async removeFacilitiesFromPackage(packageId: number, facilityIds: number[]): Promise<EventPackageResponse> {
    const response = await apiClient.post(`${this.BASE_PATH}/${packageId}/remove-facilities`, facilityIds);
    return extractData<EventPackageResponse>(response);
  }

  /**
   * Add package pricing tier (HOTEL_MANAGER or ADMIN)
   */
  async addPackagePrice(packageId: number, data: AddPackagePriceRequest): Promise<PackagePriceResponse> {
    const response = await apiClient.post(
      `${this.BASE_PATH}/${packageId}/pricing?guestCount=${data.minGuests}&totalPrice=${data.pricePerPerson}`
    );
    return extractData<PackagePriceResponse>(response);
  }

  /**
   * Update package pricing tier (HOTEL_MANAGER or ADMIN)
   */
  async updatePackagePrice(packageId: number, priceId: number, guestCount: number, totalPrice: number): Promise<PackagePriceResponse> {
    const response = await apiClient.put(
      `${this.BASE_PATH}/${packageId}/pricing/${priceId}?guestCount=${guestCount}&totalPrice=${totalPrice}`
    );
    return extractData<PackagePriceResponse>(response);
  }

  /**
   * Get package pricing tiers
   */
  async getPackagePricing(packageId: number): Promise<PackagePriceResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/${packageId}/pricing`);
    return extractData<PackagePriceResponse[]>(response);
  }

  /**
   * Delete event package (HOTEL_MANAGER or ADMIN)
   */
  async deletePackage(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }
}

export default new EventPackageService();
