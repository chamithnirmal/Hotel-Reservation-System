import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, Building2, MapPin, Star, Users, Calendar, DollarSign, Check, X, Loader, 
  AlertCircle, Award, Edit, Trash2, Phone, Mail, CheckCircle2, Sparkles, Tag, Image as ImageIcon,
  MessageSquare, ShieldCheck, ChevronRight
} from 'lucide-react'
import { hotelService, HotelResponse, eventPackageService, EventPackageResponse, venueService, VenueResponse, reservationService } from '@/services'
import { CreateReservationRequest } from '@/services/reservationService'
import authService from '@/services/authService'
import reviewService, { type ReviewResponse, type CreateReviewRequest } from '@/services/reviewService'
import Button from '@/components/ui/Button'

const money = (n: number) => `LKR ${n.toLocaleString('en-LK')}`

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold text-[#183b30]">
      <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
        <Building2 className="size-5 text-white" />
      </span>
      <span className="text-xl font-bold">
        Event<span className="text-[#f59e0b]">Stay</span>
      </span>
    </Link>
  )
}

function StarRating({ rating, onRatingChange, readonly = false }: { rating: number; onRatingChange?: (rating: number) => void; readonly?: boolean }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= rating
        return (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRatingChange?.(star)}
            disabled={readonly}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          >
            <Star
              className={`h-5 w-5 ${isActive ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-gray-300'}`}
            />
          </button>
        )
      })}
    </div>
  )
}

export default function HotelDetails() {
  const { hotelId } = useParams<{ hotelId: string }>()
  const navigate = useNavigate()

  // State
  const [hotel, setHotel] = useState<HotelResponse | null>(null)
  const [venues, setVenues] = useState<VenueResponse[]>([])
  const [packages, setPackages] = useState<EventPackageResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVenue, setSelectedVenue] = useState<VenueResponse | null>(null)
  const [showPackagesModal, setShowPackagesModal] = useState(false)
  const [searchEventType, setSearchEventType] = useState('All')

  // Review state
  const [canReview, setCanReview] = useState(false)
  const [myReview, setMyReview] = useState<ReviewResponse | null>(null)
  const [allReviews, setAllReviews] = useState<ReviewResponse[]>([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Booking form state
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<EventPackageResponse | null>(null)
  const [bookingSubmitting, setBookingSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [showUnavailableModal, setShowUnavailableModal] = useState(false)
  const [bookingFormData, setBookingFormData] = useState({
    eventDate: '',
    guestCount: '',
    contactPhone: '',
    specialRequests: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadHotelDetails()
    checkIfCanReview()
  }, [hotelId])

  const checkIfCanReview = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsLoggedIn(false)
        return
      }
      setIsLoggedIn(true)

      if (!hotelId) return

      const allReservations = await reservationService.getMyReservations()
      const completedForHotel = allReservations.filter(
        r => r.hotelId === Number(hotelId) && r.status === 'COMPLETED'
      )

      if (completedForHotel.length > 0) {
        setCanReview(true)
        
        const myReviews = await reviewService.getMyReviews()
        const hotelReview = myReviews.find(review => 
          completedForHotel.some(res => res.id === review.reservationId)
        )
        
        if (hotelReview) {
          setMyReview(hotelReview)
          setReviewForm({ 
            rating: Number(hotelReview.rating), 
            comment: hotelReview.comment 
          })
        }
      }
    } catch (error) {
      console.error('Failed to check review eligibility:', error)
    }
  }

  const loadHotelDetails = async () => {
    try {
      setLoading(true)
      if (!hotelId) {
        navigate('/hotels')
        return
      }

      const hotelData = await hotelService.getHotelById(Number(hotelId))
      setHotel(hotelData)

      const venuesData = await venueService.getVenuesByHotel(Number(hotelId))
      setVenues(venuesData)

      const packagesData = await eventPackageService.getAllPackages()
      setPackages(packagesData)

      const reviewsData = await reviewService.getReviewsByHotel(Number(hotelId))
      setAllReviews(reviewsData)
    } catch (err: any) {
      console.error('Failed to load hotel details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewVenuePackages = (venue: VenueResponse) => {
    setSelectedVenue(venue)
    setShowPackagesModal(true)
    setSearchEventType('All')
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (reviewForm.comment.trim().length < 10) {
      alert('Please provide a detailed review (at least 10 characters)')
      return
    }

    try {
      setReviewSubmitting(true)
      
      const allReservations = await reservationService.getMyReservations()
      const completedForHotel = allReservations.filter(
        r => r.hotelId === Number(hotelId) && r.status === 'COMPLETED'
      )
      
      if (completedForHotel.length === 0) {
        alert('No completed reservations found for this hotel')
        return
      }

      const reviewData: CreateReviewRequest = {
        reservationId: completedForHotel[0].id,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim()
      }

      if (myReview) {
        await reviewService.updateReview(myReview.id, reviewData)
        alert('Review updated successfully!')
      } else {
        const newReview = await reviewService.createReview(reviewData)
        setMyReview(newReview)
        alert('Thank you for your review!')
      }

      setShowReviewForm(false)
      await checkIfCanReview()
    } catch (error: any) {
      console.error('Failed to submit review:', error)
      alert(error.response?.data?.message || 'Failed to submit review. Please try again.')
    } finally {
      setReviewSubmitting(false)
    }
  }

  const handleDeleteReview = async () => {
    if (!myReview || !confirm('Are you sure you want to delete this review?')) return

    try {
      await reviewService.deleteReview(myReview.id)
      setMyReview(null)
      setReviewForm({ rating: 5, comment: '' })
      alert('Review deleted successfully')
      await checkIfCanReview()
    } catch (error) {
      console.error('Failed to delete review:', error)
      alert('Failed to delete review. Please try again.')
    }
  }

  const validateBookingForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!bookingFormData.eventDate) {
      errors.eventDate = 'Event date is required'
    } else {
      const selectedDate = new Date(bookingFormData.eventDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        errors.eventDate = 'Event date must be in the future'
      }
    }

    if (!bookingFormData.guestCount) {
      errors.guestCount = 'Guest count is required'
    } else {
      const count = Number(bookingFormData.guestCount)
      if (isNaN(count) || count < 1) {
        errors.guestCount = 'Guest count must be at least 1'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateBookingForm() || !selectedPackage || !selectedVenue) return

    try {
      setBookingSubmitting(true)
      setBookingError(null)

      const reservationData: CreateReservationRequest = {
        venueId: selectedVenue.id,
        eventPackageId: selectedPackage.id,
        eventDate: bookingFormData.eventDate,
        guestCount: Number(bookingFormData.guestCount),
        contactPhone: bookingFormData.contactPhone,
      }

      await reservationService.createReservation(reservationData)
      setBookingSuccess(true)

      setTimeout(() => {
        setShowBookingModal(false)
        setBookingSuccess(false)
        setBookingFormData({ eventDate: '', guestCount: '', contactPhone: '', specialRequests: '' })
        setSelectedPackage(null)
      }, 2000)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create reservation. Please try again.'
      const isUnavailableError = errorMessage.toLowerCase().includes('not available') || errorMessage.toLowerCase().includes('venue')
      
      if (isUnavailableError) {
        setShowBookingModal(false)
        setShowUnavailableModal(true)
        setBookingSubmitting(false)
      } else {
        setBookingError(errorMessage)
        setBookingSubmitting(false)
      }
    }
  }

  const venuePackages = selectedVenue
    ? packages.filter(pkg => pkg.venueId === selectedVenue.id)
    : []

  const filteredPackages = venuePackages.filter(pkg =>
    searchEventType === 'All' || pkg.eventType === searchEventType.toUpperCase()
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-[#f8f9fb]">
        <div className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
            <Logo />
          </div>
        </div>
        <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">Hotel not found</p>
            <Link to="/" className="mt-4 inline-block text-emerald-600 font-medium hover:underline">← Back to home</Link>
          </div>
        </main>
      </div>
    )
  }

  const imgUrl = hotel.image
    ? `data:image/jpeg;base64,${hotel.image}`
    : `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80`

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-40 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Logo />
          <button
            onClick={() => {
              authService.logout()
              navigate('/')
            }}
            className="rounded-xl border-2 border-emerald-600 px-5 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-semibold mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Hotels
        </button>

        {/* Hero Section */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="relative h-[380px] overflow-hidden bg-gray-900">
            {hotel.image ? (
              <img src={imgUrl} alt={hotel.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700">
                <div className="text-center text-white">
                  <ImageIcon className="mx-auto mb-3 h-14 w-14 text-gray-500" />
                  <p className="text-sm text-gray-400">No image available</p>
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div className="text-white">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    {hotel.registrationStatus === 'APPROVED' && (
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verified Property
                      </span>
                    )}
                  </div>

                  <h1 className="text-4xl font-bold lg:text-5xl">{hotel.name}</h1>

                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-200">
                    <MapPin className="h-4 w-4 text-amber-300" />
                    {hotel.address}, {hotel.city}
                  </div>
                </div>

                {allReviews.length > 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-md">
                    <p className="text-xs text-gray-300 mb-1">Guest Rating</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">
                        {(allReviews.reduce((sum, r) => sum + Number(r.rating), 0) / allReviews.length).toFixed(1)}
                      </span>
                      <div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const avgRating = allReviews.reduce((sum, r) => sum + Number(r.rating), 0) / allReviews.length
                            return (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= Math.round(avgRating)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-400'
                                }`}
                              />
                            )
                          })}
                        </div>
                        <p className="mt-0.5 text-[10px] text-gray-300">({allReviews.length} reviews)</p>
                      </div>
                    </div>
                  </div>
                ) : hotel.starRating ? (
                  <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-md">
                    <p className="text-xs text-gray-300 mb-1">Hotel Rating</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">{hotel.starRating}</span>
                      <div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= hotel.starRating!
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="mt-0.5 text-[10px] text-gray-300">out of 5 stars</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid divide-y border-t border-gray-100 md:grid-cols-3 md:divide-x md:divide-y-0">
            <StatItem
              icon={<Building2 className="h-5 w-5" />}
              label="Available Venues"
              value={venues.length}
            />
            <StatItem
              icon={<Tag className="h-5 w-5" />}
              label="Event Packages"
              value={packages.filter(p => venues.some(v => v.id === p.venueId)).length}
            />
            <StatItem
              icon={<ShieldCheck className="h-5 w-5" />}
              label="Verification"
              value={hotel.registrationStatus === 'APPROVED' ? 'Verified' : 'Pending'}
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">About Property</p>
                <h2 className="text-2xl font-bold text-gray-900">Hotel Overview</h2>
              </div>

              <p className="text-[15px] leading-7 text-gray-600 mb-8">{hotel.description}</p>

              {/* Contact Grid */}
              <div className="grid gap-4 border-t border-gray-100 pt-7 sm:grid-cols-2">
                <ContactCard
                  icon={<Mail className="h-5 w-5" />}
                  label="Email Address"
                  value={hotel.email}
                />
                <ContactCard
                  icon={<Phone className="h-5 w-5" />}
                  label="Phone Number"
                  value={hotel.phoneNumber}
                />
              </div>
            </div>

            {/* Venues */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Event Spaces</p>
                <h2 className="text-2xl font-bold text-gray-900">Available Venues</h2>
              </div>

              {venues.length > 0 ? (
                <div className="space-y-4">
                  {venues.map((venue) => (
                    <div key={venue.id} className="group rounded-2xl border-2 border-gray-200 p-5 hover:border-emerald-400 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{venue.venueName}</h3>
                          <p className="text-sm text-gray-600">{venue.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 mb-4">
                        <div className="text-center">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                            <Users className="w-5 h-5 text-emerald-600" />
                          </div>
                          <p className="text-xs text-gray-500">Capacity</p>
                          <p className="font-bold text-gray-900">{venue.capacity}</p>
                        </div>
                        <div className="text-center">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <p className="text-xs text-gray-500">Area</p>
                          <p className="font-bold text-gray-900">{venue.area} m²</p>
                        </div>
                        <div className="text-center">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-2">
                            <Tag className="w-5 h-5 text-amber-600" />
                          </div>
                          <p className="text-xs text-gray-500">Facilities</p>
                          <p className="font-bold text-gray-900">{venue.facilityCount || 0}</p>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleViewVenuePackages(venue)}
                        variant="primary"
                        className="w-full flex items-center justify-center gap-2 group-hover:shadow-lg"
                      >
                        View Event Packages
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">No venues available</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Property Details */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:p-7">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Property Details</p>
              <h3 className="text-xl font-bold text-gray-900 mb-6">At a Glance</h3>

              <div className="space-y-4">
                <DetailRow
                  label="Star Rating"
                  value={
                    <div className="flex items-center gap-2">
                      {hotel.starRating && (
                        <>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                  star <= hotel.starRating!
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-bold text-gray-900">{hotel.starRating}/5</span>
                        </>
                      )}
                    </div>
                  }
                />

                <DetailRow
                  label="Available Venues"
                  value={<span className="font-bold text-gray-900">{venues.length}</span>}
                />

                <DetailRow
                  label="Manager"
                  value={<span className="font-medium text-gray-900">{hotel.managerName}</span>}
                />

                <DetailRow
                  label="Verification"
                  value={
                    hotel.registrationStatus === 'APPROVED' ? (
                      <span className="font-semibold text-emerald-600">Verified</span>
                    ) : (
                      <span className="font-semibold text-amber-600">Pending</span>
                    )
                  }
                />
              </div>

              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3">Amenities</p>
                  <div className="space-y-2">
                    {hotel.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Review Section */}
            {isLoggedIn && canReview && (
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-lg text-gray-900">Your Review</h3>
                </div>

                {myReview && !showReviewForm ? (
                  <div>
                    <div className="mb-3">
                      <StarRating rating={Number(myReview.rating)} readonly />
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">{myReview.comment}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-900 font-medium transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={handleDeleteReview}
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ) : showReviewForm ? (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                      <StarRating 
                        rating={reviewForm.rating} 
                        onRatingChange={(rating) => setReviewForm(prev => ({ ...prev, rating }))} 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Share your experience..."
                        className="w-full h-32 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 resize-none"
                        maxLength={1000}
                        required
                      />
                      <p className="mt-1.5 text-xs text-gray-500">{reviewForm.comment.length}/1000 characters</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={reviewSubmitting}
                        className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                      >
                        {reviewSubmitting ? 'Submitting...' : myReview ? 'Update' : 'Submit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowReviewForm(false)
                          if (myReview) {
                            setReviewForm({ rating: Number(myReview.rating), comment: myReview.comment })
                          }
                        }}
                        disabled={reviewSubmitting}
                        className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      You stayed at this hotel! Share your experience with others.
                    </p>
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white hover:bg-amber-600 transition-colors"
                    >
                      Write a Review
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
    </main>

    {/* Guest Reviews Section */}
    {allReviews.length > 0 && (
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Guest Feedback</p>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Guest Reviews</h2>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-600">{allReviews.length} reviews</p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const avgRating = allReviews.length > 0
                        ? allReviews.reduce((sum, r) => sum + Number(r.rating), 0) / allReviews.length
                        : 0
                      return (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(avgRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {allReviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 hover:border-gray-200 transition-all">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{review.customerName}</p>
                    <p className="text-xs text-gray-500 mt-1">Reviewed {new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= review.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    {/* Packages Modal */}
    {showPackagesModal && selectedVenue && (
      <PackagesModal
        venue={selectedVenue}
        hotel={hotel}
        packages={filteredPackages}
        searchEventType={searchEventType}
        setSearchEventType={setSearchEventType}
        onClose={() => setShowPackagesModal(false)}
        onSelectPackage={(pkg) => {
          setSelectedPackage(pkg)
          setShowBookingModal(true)
          setBookingError(null)
          setBookingSuccess(false)
          setBookingFormData({ eventDate: '', guestCount: '', contactPhone: '', specialRequests: '' })
        }}
      />
    )}

    {/* Booking Modal */}
    {showBookingModal && selectedPackage && (
      <BookingModal
        package={selectedPackage}
        bookingFormData={bookingFormData}
        setBookingFormData={setBookingFormData}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        bookingSubmitting={bookingSubmitting}
        bookingError={bookingError}
        bookingSuccess={bookingSuccess}
        onSubmit={handleBooking}
        onClose={() => setShowBookingModal(false)}
      />
    )}

    {/* Unavailable Modal */}
    {showUnavailableModal && selectedVenue && (
      <UnavailableModal
        venueName={selectedVenue.venueName}
        onClose={() => setShowUnavailableModal(false)}
        onChangeVenue={() => {
          setShowUnavailableModal(false)
          setSelectedVenue(null)
        }}
      />
    )}
  </div>
  )
}

/* ========================================================= 
   REUSABLE COMPONENTS 
========================================================= */

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 px-6 py-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
        <p className="mt-0.5 text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function ContactCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4 transition hover:bg-emerald-50/50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
        <p className="mt-1 truncate text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="text-right">{value}</div>
    </div>
  )
}

function PackagesModal({ 
  venue, hotel, packages, searchEventType, setSearchEventType, onClose, onSelectPackage 
}: {
  venue: VenueResponse
  hotel: HotelResponse
  packages: EventPackageResponse[]
  searchEventType: string
  setSearchEventType: (type: string) => void
  onClose: () => void
  onSelectPackage: (pkg: EventPackageResponse) => void
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{venue.venueName}</h2>
            <p className="text-sm text-gray-600 mt-1">{hotel.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Event Type Filter */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {['All', 'Wedding', 'Birthday', 'Conference', 'Corporate', 'Anniversary'].map((type) => (
              <button
                key={type}
                onClick={() => setSearchEventType(type)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  searchEventType === type
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Packages List */}
          {packages.length > 0 ? (
            <div className="space-y-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className="border-2 border-gray-200 rounded-2xl p-5 hover:border-emerald-400 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-gray-900 text-lg">{pkg.packageName}</h4>
                        <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                          {pkg.eventType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{pkg.description}</p>
                    </div>
                  </div>

                  {/* Facilities */}
                  {pkg.includedFacilities && pkg.includedFacilities.length > 0 && (
                    <div className="mb-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Included Facilities:</p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.includedFacilities.map((facility) => (
                          <span key={facility.id} className="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg">
                            {facility.facilityName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-baseline mb-3">
                      <span className="text-sm text-gray-500">Base Price:</span>
                      <span className="text-xl font-bold text-emerald-600">{money(Number(pkg.basePrice))}</span>
                    </div>

                    {pkg.pricing && pkg.pricing.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Pricing Tiers:</p>
                        <div className="space-y-1.5">
                          {pkg.pricing.map((tier, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-700">{tier.guestCount} guests</span>
                              <span className="font-bold text-gray-900">{money(tier.totalPrice)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => onSelectPackage(pkg)}
                    variant="primary"
                    className="w-full mt-4 font-bold"
                  >
                    Book This Package
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">No packages available for this event type</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BookingModal({
  package: pkg,
  bookingFormData,
  setBookingFormData,
  formErrors,
  setFormErrors,
  bookingSubmitting,
  bookingError,
  bookingSuccess,
  onSubmit,
  onClose
}: {
  package: EventPackageResponse
  bookingFormData: any
  setBookingFormData: any
  formErrors: Record<string, string>
  setFormErrors: any
  bookingSubmitting: boolean
  bookingError: string | null
  bookingSuccess: boolean
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Reserve Package</h2>
          </div>
          {!bookingSuccess && (
            <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="p-6">
          {bookingSuccess ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-10 h-10 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Reservation Submitted!</h3>
              <p className="text-gray-600">Your booking request has been sent. The venue will review and confirm within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              {bookingError && (
                <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{bookingError}</p>
                </div>
              )}

              {/* Package Summary */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border-2 border-emerald-200">
                <p className="text-xs text-emerald-700 uppercase font-bold mb-2">Selected Package</p>
                <h4 className="font-bold text-gray-900 text-lg">{pkg.packageName}</h4>
                <p className="text-sm text-gray-700 mt-1">{pkg.description}</p>
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Base Price:</span>
                    <span className="text-xl font-bold text-emerald-600">{money(Number(pkg.basePrice))}</span>
                  </div>
                </div>
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-2" />
                  Event Date *
                </label>
                <input
                  type="date"
                  required
                  value={bookingFormData.eventDate}
                  onChange={(e) => {
                    setBookingFormData({ ...bookingFormData, eventDate: e.target.value })
                    if (formErrors.eventDate) setFormErrors({ ...formErrors, eventDate: '' })
                  }}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    formErrors.eventDate ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  } focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10`}
                />
                {formErrors.eventDate && <p className="mt-1.5 text-sm text-red-600 font-medium">{formErrors.eventDate}</p>}
              </div>

              {/* Guest Count */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Users className="inline w-4 h-4 mr-2" />
                  Number of Guests *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={bookingFormData.guestCount}
                  onChange={(e) => {
                    setBookingFormData({ ...bookingFormData, guestCount: e.target.value })
                    if (formErrors.guestCount) setFormErrors({ ...formErrors, guestCount: '' })
                  }}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    formErrors.guestCount ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  } focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10`}
                  placeholder="Enter number of guests"
                />
                {formErrors.guestCount && <p className="mt-1.5 text-sm text-red-600 font-medium">{formErrors.guestCount}</p>}
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={bookingFormData.contactPhone}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, contactPhone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                  placeholder="+94712345678"
                />
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Special Requests (Optional)</label>
                <textarea
                  value={bookingFormData.specialRequests}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, specialRequests: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 resize-none"
                  placeholder="Any special requirements or dietary needs?"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="flex-1 py-3 px-6 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {bookingSubmitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Reservation'
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-6 border-2 border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function UnavailableModal({ 
  venueName, onClose, onChangeVenue 
}: {
  venueName: string
  onClose: () => void
  onChangeVenue: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">Not Available</h3>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Unfortunately, <span className="font-semibold">{venueName}</span> is not available on the selected date.
            <br /><br />
            Please try a different date or select another venue.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border-2 border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
            >
              Try Another Date
            </button>
            <button
              onClick={onChangeVenue}
              className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            >
              Change Venue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

<style>{`
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-in;
  }
`}</style>
