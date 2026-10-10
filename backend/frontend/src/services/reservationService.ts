import apiClient, { extractData } from './api';

// Types
export type ReservationStatus = 'PENDING' | 'APPROVED' | 'CANCELLED' | 'COMPLETED' | 'REJECTED';

export interface CreateReservationRequest {
  venueId: number;
  eventPackageId: number;
  eventDate: string; // Format: YYYY-MM-DD
  guestCount: number;
  contactPhone: string;
}

export interface ReservationResponse {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventPackageId: number;
  eventPackageName: string;
  eventType: string;
  venueId: number;
  venueName: string;
  hotelId: number;
  hotelName: string;
  eventDate: string;
  guestCount: number;
  totalPrice: number;
  specialRequests: string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}

// Reservation Service
class ReservationService {
  private readonly BASE_PATH = '/reservations';

  // ===== CUSTOMER ENDPOINTS =====

  /**
   * Create a new reservation (CUSTOMER only)
   */
  async createReservation(data: CreateReservationRequest): Promise<ReservationResponse> {
    const response = await apiClient.post(this.BASE_PATH, data);
    return extractData<ReservationResponse>(response);
  }

  /**
   * Get reservation by ID
   */
  async getReservationById(id: number): Promise<ReservationResponse> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}`);
    return extractData<ReservationResponse>(response);
  }

  /**
   * Get my reservations (CUSTOMER only)
   */
  async getMyReservations(): Promise<ReservationResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/customer/my-reservations`);
    return extractData<ReservationResponse[]>(response);
  }

  /**
   * Get my reservations by status (CUSTOMER only)
   */
  async getMyReservationsByStatus(status: ReservationStatus): Promise<ReservationResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/customer/my-reservations/status/${status}`);
    return extractData<ReservationResponse[]>(response);
  }

  /**
   * Get my completed reservations (CUSTOMER only)
   */
  async getMyCompletedReservations(): Promise<ReservationResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/customer/completed`);
    return extractData<ReservationResponse[]>(response);
  }

  /**
   * Cancel reservation (CUSTOMER only)
   */
  async cancelReservation(id: number): Promise<ReservationResponse> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/cancel`);
    return extractData<ReservationResponse>(response);
  }

  async updateReservation(id: number, data: {
    eventDate: string;
    guestCount: number;
    contactPhone: string;
    specialRequests?: string;
  }): Promise<ReservationResponse> {
    const response = await apiClient.put(`${this.BASE_PATH}/${id}`, data);
    return extractData<ReservationResponse>(response);
  }

  // ===== HOTEL MANAGER ENDPOINTS =====

  /**
   * Get all reservations by hotel (all statuses)
   */
  async getAllReservationsByHotel(hotelId: number): Promise<ReservationResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/hotel/${hotelId}`);
    return extractData<ReservationResponse[]>(response);
  }

  /**
   * Get pending reservations by hotel (HOTEL_MANAGER or ADMIN)
   */
  async getPendingReservationsByHotel(hotelId: number): Promise<ReservationResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/manager/pending-by-hotel/${hotelId}`);
    return extractData<ReservationResponse[]>(response);
  }

  /**
   * Get pending reservations by venue (HOTEL_MANAGER or ADMIN)
   */
  async getPendingReservationsByVenue(venueId: number): Promise<ReservationResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/manager/pending-by-venue/${venueId}`);
    return extractData<ReservationResponse[]>(response);
  }

  /**
   * Get reservations by venue and status (HOTEL_MANAGER or ADMIN)
   */
  async getReservationsByVenueAndStatus(venueId: number, status: ReservationStatus): Promise<ReservationResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/manager/venue/${venueId}/status/${status}`);
    return extractData<ReservationResponse[]>(response);
  }

  /**
   * Approve reservation (HOTEL_MANAGER or ADMIN)
   */
  async approveReservation(id: number): Promise<ReservationResponse> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/approve`);
    return extractData<ReservationResponse>(response);
  }

  /**
   * Reject reservation (HOTEL_MANAGER or ADMIN)
   */
  async rejectReservation(id: number, reason: string): Promise<ReservationResponse> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/reject`, null, {
      params: { rejectionReason: reason }
    });
    return extractData<ReservationResponse>(response);
  }

  /**
   * Mark reservation as completed (HOTEL_MANAGER or ADMIN)
   */
  async completeReservation(id: number): Promise<ReservationResponse> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/complete`);
    return extractData<ReservationResponse>(response);
  }

  // ===== ADMIN ENDPOINTS =====

  /**
   * Get all reservations (ADMIN only)
   */
  async getAllReservations(): Promise<ReservationResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/admin/all`);
    return extractData<ReservationResponse[]>(response);
  }

  /**
   * Get all reservations by status (ADMIN only)
   */
  async getAllReservationsByStatus(status: ReservationStatus): Promise<ReservationResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/admin/status/${status}`);
    return extractData<ReservationResponse[]>(response);
  }
}

export default new ReservationService();