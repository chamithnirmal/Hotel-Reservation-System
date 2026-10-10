import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Star, Loader, MessageSquare, Wallet } from 'lucide-react'
import reservationService, { ReservationResponse } from '@/services/reservationService'
import reviewService, { ReviewResponse } from '@/services/reviewService'
import CustomerLayout from '@/components/layout/CustomerLayout'

const money = (n: number) => `LKR ${n.toLocaleString('en-LK')}`

const statusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-800'
    case 'APPROVED':
      return 'bg-blue-100 text-blue-800'
    case 'COMPLETED':
      return 'bg-green-100 text-green-800'
    case 'REJECTED':
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function Overview() {
  const [reservations, setReservations] = useState<ReservationResponse[]>([])
  const [reviews, setReviews] = useState<ReviewResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [res, rev] = await Promise.all([
          reservationService.getMyReservations(),
          reviewService.getMyReviews(),
        ])
        setReservations(res)
        setReviews(rev)
      } catch (err) {
        console.error('❌ Failed to load overview:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="size-8 animate-spin text-[#276247]" />
      </div>
    )
  }

  const upcoming = reservations
    .filter((r) => (r.status === 'PENDING' || r.status === 'APPROVED') && new Date(r.eventDate) >= new Date())
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())

  const totalSpent = reservations
    .filter((r) => r.status === 'COMPLETED')
    .reduce((sum, r) => sum + r.totalPrice, 0)

  const cards = [
    { label: 'Total bookings', value: reservations.length, icon: <Calendar className="size-5" />, box: 'bg-[#e8f0eb] text-[#276247]', text: 'text-[#183b30]' },
    { label: 'Upcoming events', value: upcoming.length, icon: <Loader className="size-5 text-amber-600" />, box: 'bg-amber-100', text: 'text-amber-600' },
    { label: 'My reviews', value: reviews.length, icon: <MessageSquare className="size-5 text-blue-600" />, box: 'bg-blue-100', text: 'text-blue-600' },
    { label: 'Total spent', value: money(totalSpent), icon: <Wallet className="size-5 text-green-600" />, box: 'bg-green-100', text: 'text-green-600' },
  ]

  return (
    <CustomerLayout>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">MY ACCOUNT</p>
          <h2 className="text-3xl font-serif text-[#183b30] mt-1">Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">A quick look at your bookings and reviews.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className={`mt-2 text-3xl font-semibold ${c.text}`}>{c.value}</p>
                </div>
                <span className={`grid size-10 place-items-center rounded-xl ${c.box}`}>{c.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Upcoming */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b p-5">
              <h3 className="font-semibold text-[#183b30]">Upcoming events</h3>
              <Link to="/customer/reservations" className="text-sm font-medium text-[#276247] hover:underline">
                View all
              </Link>
            </div>
            {upcoming.length > 0 ? (
              <div className="divide-y">
                {upcoming.slice(0, 4).map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold text-[#183b30] text-sm">{r.hotelName}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.venueName} · {new Date(r.eventDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Calendar className="size-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              </div>
            )}
          </div>

          {/* Recent reviews */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b p-5">
              <h3 className="font-semibold text-[#183b30]">Recent reviews</h3>
              <Link to="/customer/reviews" className="text-sm font-medium text-[#276247] hover:underline">
                View all
              </Link>
            </div>
            {reviews.length > 0 ? (
              <div className="divide-y">
                {reviews.slice(0, 4).map((rv) => (
                  <div key={rv.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-[#183b30] text-sm">{rv.hotelName}</p>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`size-3.5 ${n <= rv.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{rv.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <MessageSquare className="size-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">No reviews yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}