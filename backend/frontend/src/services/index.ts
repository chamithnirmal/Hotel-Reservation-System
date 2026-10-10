// Export all services
export { default as authService } from './authService';
export { default as userService } from './userService';
export { default as hotelService } from './hotelService';
export { default as venueService } from './venueService';
export { default as facilityService } from './facilityService';
export { default as eventPackageService } from './eventPackageService';
export { default as reservationService } from './reservationService';
export { default as reviewService } from './reviewService';
export { default as venueAvailabilityService } from './venueAvailabilityService';

// Export types
export type { RegisterRequest, LoginRequest, AuthResponse, UserResponse as AuthUserResponse } from './authService';
export type { UserResponse, UpdateProfileRequest, ChangePasswordRequest } from './userService';
export type { CreateHotelRequest, HotelResponse } from './hotelService';
export type { CreateVenueRequest, VenueResponse } from './venueService';
export type { CreateFacilityRequest, FacilityResponse } from './facilityService';
export type { CreateEventPackageRequest, EventPackageResponse, EventType, PackagePriceResponse, AddPackagePriceRequest } from './eventPackageService';
export type { CreateReservationRequest, ReservationResponse, ReservationStatus } from './reservationService';
export type { CreateReviewRequest, ReviewResponse, VenueRatingStats } from './reviewService';
export type { VenueAvailabilityResponse, DateRangeAvailability } from './venueAvailabilityService';
