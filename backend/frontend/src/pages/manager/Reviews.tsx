import { useState, useEffect } from 'react'
import { Star, MessageSquare, CheckCircle } from 'lucide-react'
import reviewService, { ReviewResponse } from '@/services/reviewService'
import hotelService from '@/services/hotelService'
import ManagerLayout from '@/components/layout/ManagerLayout'
import Button from '@/components/ui/Button'

export default function Reviews() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hotelId, setHotelId] = useState<number | null>(null)

  useEffect(() => {
    loadManagerHotel()
  }, [])

  const loadManagerHotel = async () => {
    try {
      const hotel = await hotelService.getManagerHotel()
      setHotelId(hotel.id)
      await loadReviews(hotel.id)
    } catch (err: any) {
      console.error('Failed to load manager hotel:', err)
      setError(err.response?.data?.message || 'Failed to load hotel')
      setLoading(false)
    }
  }

  const loadReviews = async (hotelId: number) => {
    try {
      setLoading(true)
      const data = await reviewService.getReviewsByHotel(hotelId)
      console.log('Loaded reviews:', data)
      setReviews(data)
    } catch (err: any) {
      console.error('Failed to load reviews:', err)
      setError(err.response?.data?.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length).toFixed(1)
    : '0.0'
  
  const publishedReviews = reviews.filter(r => r.isApproved).length

  const ratingCounts = [0, 0, 0, 0, 0]
  reviews.forEach(review => {
    const rating = Number(review.rating)
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating - 1]++
    }
  })

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: ratingCounts[stars - 1],
    percentage: reviews.length > 0 ? Math.round((ratingCounts[stars - 1] / reviews.length) * 100) : 0
  }))

  if (loading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
      </ManagerLayout>
    )
  }

  return (
    <ManagerLayout>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-amber-700 uppercase tracking-wide font-medium mb-2">GUEST EXPERIENCE</p>
          <h2 className="text-3xl font-serif text-gray-900 mb-2">Reviews</h2>
          <p className="text-gray-600">Understand what guests love and where your team can improve.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-green-700" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Average rating</p>
            <p className="text-3xl font-bold text-gray-900">{avgRating} <span className="text-lg text-gray-500">/ 5</span></p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-blue-700" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Published reviews</p>
            <p className="text-3xl font-bold text-gray-900">{publishedReviews}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-700" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Total reviews</p>
            <p className="text-3xl font-bold text-gray-900">{reviews.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Rating Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Rating distribution</h3>
            <div className="space-y-3">
              {ratingDistribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-12">{item.stars} stars</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Recent guest reviews</h3>
              <p className="text-sm text-gray-600">Manage your EventStay inventory and operations</p>
            </div>

            <div className="divide-y divide-gray-200">
              {reviews.length > 0 ? (
                reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{review.customerName}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: Number(review.rating) }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="text-sm font-semibold text-gray-900 ml-1">{review.rating}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">{review.comment}</p>
                    <p className="text-xs text-gray-500">{review.venueName}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No reviews yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  )
}
