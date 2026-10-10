import apiClient, { extractData } from './api';

// Types
export interface VenueAvailabilityResponse {
  venueId: number;
  venueName: string;
  date: string;
  isAvailable: boolean;
  reservationId?: number;
}

export interface DateRangeAvailability {
  venueId: number;
  venueName: string;
  availableDates: string[];
  unavailableDates: string[];
}

// Venue Availability Service
class VenueAvailabilityService {
  private readonly BASE_PATH = '/venue-availability';

  /**
   * Check if venue is available on a specific date
   */
  async checkAvailability(venueId: number, date: string): Promise<VenueAvailabilityResponse> {
    const response = await apiClient.get(`${this.BASE_PATH}/venue/${venueId}/date/${date}`);
    return extractData<VenueAvailabilityResponse>(response);
  }

  /**
   * Get available dates for a venue in a date range
   */
  async getAvailableDates(venueId: number, startDate: string, endDate: string): Promise<DateRangeAvailability> {
    const response = await apiClient.get(`${this.BASE_PATH}/venue/${venueId}/range`, {
      params: { startDate, endDate }
    });
    return extractData<DateRangeAvailability>(response);
  }

  /**
   * Get all availability records for a venue
   */
  async getVenueAvailability(venueId: number): Promise<VenueAvailabilityResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/venue/${venueId}`);
    return extractData<VenueAvailabilityResponse[]>(response);
  }

  /**
   * Get venues available on a specific date
   */
  async getAvailableVenuesOnDate(date: string): Promise<number[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/available-venues/date/${date}`);
    return extractData<number[]>(response);
  }
}

export default new VenueAvailabilityService();
