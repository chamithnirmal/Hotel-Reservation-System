import apiClient, { extractData } from './api';

// Types
export interface CreateReviewRequest {
  reservationId: number;
  rating: number; // 1-5 stars
  comment: string;
}

export interface ReviewResponse {
  id: number;
  customerId: number;
  customerName: string;
  venueId: number;
  venueName: string;
  reservationId: number;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

// Review Service
class ReviewService {
  private readonly BASE_PATH = '/reviews';

  // ===== CUSTOMER ENDPOINTS =====

  /**
   * Create a new review (CUSTOMER only)
   */
  async createReview(data: CreateReviewRequest): Promise<ReviewResponse> {
    const response = await apiClient.post(this.BASE_PATH, data);
    return extractData<ReviewResponse>(response);
  }

  /**
   * Get my reviews (CUSTOMER only)
   */
  async getMyReviews(): Promise<ReviewResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/customer/my-reviews`);
    return extractData<ReviewResponse[]>(response);
  }

  /**
   * Update review (CUSTOMER only)
   */
  async updateReview(id: number, data: Partial<CreateReviewRequest>): Promise<ReviewResponse> {
    const response = await apiClient.put(`${this.BASE_PATH}/${id}`, data);
    return extractData<ReviewResponse>(response);
  }

  /**
   * Delete review (CUSTOMER only)
   */
  async deleteReview(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }

  // ===== PUBLIC ENDPOINTS =====

  /**
   * Get review by ID
   */
  async getReviewById(id: number): Promise<ReviewResponse> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}`);
    return extractData<ReviewResponse>(response);
  }

  /**
   * Get all reviews for a venue
   */
  async getReviewsByVenue(venueId: number): Promise<ReviewResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/venue/${venueId}`);
    return extractData<ReviewResponse[]>(response);
  }

  /**
   * Get all reviews for a hotel (for managers)
   */
  async getReviewsByHotel(hotelId: number): Promise<ReviewResponse[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/hotel/${hotelId}`);
    return extractData<ReviewResponse[]>(response);
  }
}

export default new ReviewService();
