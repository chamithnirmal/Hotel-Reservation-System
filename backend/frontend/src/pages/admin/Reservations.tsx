import { useState, useEffect } from 'react'
import { Search, Calendar, Building2, Users, DollarSign, Eye, Loader, X, MapPin } from 'lucide-react'
import reservationService, { ReservationResponse } from '@/services/reservationService'

const money = (n: number) => `LKR ${n.toLocaleString('en-LK')}`

export default function AdminReservations() {
  const [reservations, setReservations] = useState<ReservationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReservation, setSelectedReservation] = useState<ReservationResponse | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
  })

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    try {
      setLoading(true)
      const allReservations = await reservationService.getAllReservations()
      setReservations(allReservations)

      const pendingCount = allReservations.filter(r => r.status === 'PENDING').length
      const approvedCount = allReservations.filter(r => r.status === 'APPROVED').length
      const completedCount = allReservations.filter(r => r.status === 'COMPLETED').length
      const rejectedCount = allReservations.filter(r => r.status === 'REJECTED').length

      setStats({
        total: allReservations.length,
        pending: pendingCount,
        approved: approvedCount,
        completed: completedCount,
        rejected: rejectedCount,
      })

      console.log('✅ All reservations loaded:', allReservations.length)
    } catch (err: any) {
      console.error('❌ Failed to load reservations:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredReservations = reservations.filter(
    (reservation) =>
      reservation.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.venueName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.packageName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewDetails = (reservation: ReservationResponse) => {
    setSelectedReservation(reservation)
    setShowDetailsModal(true)
  }

  const getStatusBadgeColor = (status: string) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="size-8 animate-spin text-[#276247]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">ADMINISTRATION</p>
        <h2 className="text-3xl font-serif text-[#183b30] mt-1">Reservations</h2>
        <p className="text-sm text-muted-foreground mt-1">View and manage all event reservations across the platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="mt-2 text-3xl font-semibold text-[#183b30]">{stats.total.toLocaleString()}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-[#e8f0eb] text-[#276247]">
              <Calendar className="size-5" />
            </span>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="mt-2 text-3xl font-semibold text-amber-600">{stats.pending}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-amber-100">
              <Loader className="size-5 text-amber-600" />
            </span>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="mt-2 text-3xl font-semibold text-blue-600">{stats.approved}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-blue-100">
              <span className="text-blue-600 text-lg">✓</span>
            </span>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="mt-2 text-3xl font-semibold text-green-600">{stats.completed}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-green-100">
              <span className="text-green-600 text-lg">✓✓</span>
            </span>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="mt-2 text-3xl font-semibold text-red-600">{stats.rejected}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-red-100">
              <span className="text-red-600 text-lg">✕</span>
            </span>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h3 className="font-semibold text-[#183b30]">All reservations</h3>
            <p className="mt-1 text-xs text-muted-foreground">Complete list of event bookings</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reservations"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#276247] w-64"
            />
          </div>
        </div>

        {filteredReservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Hotel / Venue</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Event Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Guests</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                      #{reservation.id}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-[#183b30] text-sm">{reservation.customerName}</p>
                        <p className="text-xs text-muted-foreground">{reservation.contactPhone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-[#183b30] text-sm">{reservation.hotelName}</p>
                        <p className="text-xs text-muted-foreground">{reservation.venueName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span>{new Date(reservation.eventDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="size-4 text-muted-foreground" />
                        <span>{reservation.guestCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#276247]">
                      {money(reservation.totalPrice)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(reservation)}
                        className="px-3 py-1.5 text-sm font-medium text-[#276247] hover:bg-[#e8f0eb] rounded transition inline-flex items-center gap-1"
                      >
                        <Eye className="size-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="size-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="font-semibold text-[#183b30]">No reservations found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-serif text-[#183b30]">Reservation Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Reservation ID & Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reservation ID</p>
                  <p className="text-2xl font-bold text-[#183b30]">#{selectedReservation.id}</p>
                </div>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeColor(selectedReservation.status)}`}>
                  {selectedReservation.status}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-[#e8f0eb] rounded-lg p-4">
                <p className="text-xs text-muted-foreground uppercase font-medium mb-3">Customer Information</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <span className="font-semibold text-[#183b30]">{selectedReservation.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Contact:</span>
                    <span className="font-semibold text-[#183b30]">{selectedReservation.contactPhone}</span>
                  </div>
                </div>
              </div>

              {/* Venue Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#e8f0eb] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="size-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground uppercase font-medium">Hotel</p>
                  </div>
                  <p className="font-semibold text-[#183b30]">{selectedReservation.hotelName}</p>
                </div>

                <div className="bg-[#e8f0eb] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="size-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground uppercase font-medium">Venue</p>
                  </div>
                  <p className="font-semibold text-[#183b30]">{selectedReservation.venueName}</p>
                </div>
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#e8f0eb] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground uppercase font-medium">Event Date</p>
                  </div>
                  <p className="font-semibold text-[#183b30]">
                    {new Date(selectedReservation.eventDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                <div className="bg-[#e8f0eb] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="size-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground uppercase font-medium">Guest Count</p>
                  </div>
                  <p className="font-semibold text-[#183b30]">{selectedReservation.guestCount} guests</p>
                </div>
              </div>

              {/* Package & Pricing */}
              <div className="bg-[#e8f0eb] rounded-lg p-4">
                <p className="text-xs text-muted-foreground uppercase font-medium mb-3">Package Details</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Package:</span>
                    <span className="font-semibold text-[#183b30]">{selectedReservation.packageName}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#d0dfd8]">
                    <span className="font-semibold text-[#183b30]">Total Price:</span>
                    <span className="text-2xl font-bold text-[#276247]">{money(selectedReservation.totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedReservation.specialRequests && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-2">Special Requests</p>
                  <p className="text-sm text-[#183b30]">{selectedReservation.specialRequests}</p>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedReservation.rejectionReason && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-xs text-red-600 uppercase font-medium mb-2">Rejection Reason</p>
                  <p className="text-sm text-red-900">{selectedReservation.rejectionReason}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="text-[#183b30] font-medium">
                    {new Date(selectedReservation.createdAt).toLocaleString()}
                  </span>
                </div>
                {selectedReservation.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="text-[#183b30] font-medium">
                      {new Date(selectedReservation.updatedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
