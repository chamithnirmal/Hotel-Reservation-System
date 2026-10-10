// Mock data types for EventStay
export type UserRole = 'customer' | 'manager' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  role: UserRole
  createdAt: string
}

export interface Hotel {
  id: string
  name: string
  description: string
  location: string
  address: string
  phone: string
  email: string
  rating: number
  reviews: number
  image: string
  facilities: string[]
  managerId: string
  verified: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface EventType = 'wedding' | 'birthday' | 'conference' | 'corporate' | 'anniversary' | 'other'

export interface Venue {
  id: string
  hotelId: string
  name: string
  description: string
  capacity: number
  area: number // sqm
  image: string
  facilities: string[]
  eventTypes: EventType[]
}

export interface Package {
  id: string
  venueId: string
  name: string
  description: string
  eventType: EventType
  guestRange: { min: number; max: number }
  price: number
  includes: string[]
  image: string
}

export interface Reservation {
  id: string
  customerId: string
  hotelId: string
  venueId: string
  packageId: string
  eventType: EventType
  eventDate: string
  guestCount: number
  eventDetails: {
    eventName: string
    organizerName: string
    organizerPhone: string
    organizerEmail: string
    dietaryRequirements?: string
    specialRequests?: string
  }
  totalPrice: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  refusalReason?: string
  createdAt: string
  approvedAt?: string
}

export interface Review {
  id: string
  reservationId: string
  hotelId: string
  customerId: string
  rating: number
  title: string
  comment: string
  verified: boolean
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: 'booking' | 'status' | 'review' | 'promotion'
  title: string
  message: string
  read: boolean
  actionUrl?: string
  createdAt: string
}

export interface Report {
  id: string
  title: string
  type: 'revenue' | 'bookings' | 'occupancy' | 'reviews'
  data: Record<string, unknown>
  generatedAt: string
}
