import { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, AlertCircle, Download, Calendar, Users, Phone, DollarSign, MapPin, Filter, Search } from 'lucide-react'
import { reservationService, ReservationResponse, hotelService, authService } from '@/services'
import ManagerLayout from '@/components/layout/ManagerLayout'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default function Reservations() {
  const [reservations, setReservations] = useState<ReservationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hotelId, setHotelId] = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadHotelAndReservations()
  }, [])

  const loadHotelAndReservations = async () => {
    try {
      setLoading(true)
      setError('')

      const user = authService.getCurrentUser()
      if (!user) {
        setError('User not authenticated. Please log in again.')
        setLoading(false)
        return
      }

      // Fetch manager's hotels (same approach as Venues.tsx)
      const hotelsData = await hotelService.getHotelsByManager(user.id)
      if (hotelsData.length === 0) {
        setError('No hotel found. Please create a hotel first.')
        setLoading(false)
        return
      }

      const hId = hotelsData[0].id
      setHotelId(hId)
      await loadReservations(hId)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load hotel information')
      setLoading(false)
    }
  }

  const loadReservations = async (hId: number) => {
    try {
      setLoading(true)
      console.log('Loading reservations for hotel ID:', hId)
      // Use getAllReservationsByHotel to get ALL statuses, not just PENDING
      const data = await reservationService.getAllReservationsByHotel(hId)
      console.log('Loaded', data.length, 'reservations')
      setReservations(data)
      setError('')
    } catch (err: any) {
      console.error('Failed to load reservations:', err)
      setError(err.response?.data?.message || 'Failed to load reservations')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      console.log('Approving reservation:', id, 'HotelId:', hotelId)
      const result = await reservationService.approveReservation(id)
      console.log('Approval result:', result)
      setError('')
      
      if (hotelId) {
        console.log('Reloading reservations for hotel:', hotelId)
        await loadReservations(hotelId)
      } else {
        console.warn('hotelId is null, attempting to reload full data...')
        await loadHotelAndReservations()
      }
    } catch (err: any) {
      console.error('Approve error:', err)
      setError(err.response?.data?.message || 'Failed to approve reservation')
    }
  }

  const handleReject = async (id: number) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return

    try {
      console.log('Rejecting reservation:', id, 'Reason:', reason, 'HotelId:', hotelId)
      const result = await reservationService.rejectReservation(id, reason)
      console.log('Rejection result:', result)
      setError('')
      
      // Reload immediately after successful rejection
      if (hotelId) {
        console.log('Reloading reservations for hotel:', hotelId)
        await loadReservations(hotelId)
      } else {
        console.warn('hotelId is null, attempting to reload full data...')
        // Fallback: reload hotel and reservations
        await loadHotelAndReservations()
      }
    } catch (err: any) {
      console.error('Reject error:', err)
      setError(err.response?.data?.message || 'Failed to reject reservation')
    }
  }

  const handleComplete = async (id: number) => {
    try {
      console.log('Completing reservation:', id, 'HotelId:', hotelId)
      const result = await reservationService.completeReservation(id)
      console.log('Completion result:', result)
      setError('')
      
      if (hotelId) {
        console.log('Reloading reservations for hotel:', hotelId)
        await loadReservations(hotelId)
      } else {
        console.warn('hotelId is null, attempting to reload full data...')
        await loadHotelAndReservations()
      }
    } catch (err: any) {
      console.error('Complete error:', err)
      setError(err.response?.data?.message || 'Failed to mark event as completed')
    }
  }

  const getStatusCounts = () => {
    return {
      pending: reservations.filter(r => r.status === 'PENDING').length,
      approved: reservations.filter(r => r.status === 'APPROVED').length,
      completed: reservations.filter(r => r.status === 'COMPLETED').length,
      rejected: reservations.filter(r => r.status === 'REJECTED').length
    }
  }

  const statusCounts = getStatusCounts()

  const filteredReservations = reservations
    .filter(r => filterStatus === 'ALL' || r.status === filterStatus)
    .filter(r => 
      searchQuery === '' || 
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.venueName.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-700 uppercase tracking-wider">Operations</p>
                  <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
                </div>
              </div>
              <p className="text-gray-600 ml-[52px]">Manage booking requests and track event lifecycle</p>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-lg mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`bg-white rounded-xl border-2 p-6 text-left transition-all hover:shadow-lg ${
              filterStatus === 'PENDING' ? 'border-amber-500 shadow-md' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              {filterStatus === 'PENDING' && (
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{statusCounts.pending}</p>
            <p className="text-sm font-medium text-gray-900 mb-1">Pending Review</p>
            <p className="text-xs text-gray-500">Awaiting approval</p>
          </button>

          <button
            onClick={() => setFilterStatus('APPROVED')}
            className={`bg-white rounded-xl border-2 p-6 text-left transition-all hover:shadow-lg ${
              filterStatus === 'APPROVED' ? 'border-emerald-500 shadow-md' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              {filterStatus === 'APPROVED' && (
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{statusCounts.approved}</p>
            <p className="text-sm font-medium text-gray-900 mb-1">Approved</p>
            <p className="text-xs text-gray-500">Date reserved</p>
          </button>

          <button
            onClick={() => setFilterStatus('COMPLETED')}
            className={`bg-white rounded-xl border-2 p-6 text-left transition-all hover:shadow-lg ${
              filterStatus === 'COMPLETED' ? 'border-blue-500 shadow-md' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              {filterStatus === 'COMPLETED' && (
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{statusCounts.completed}</p>
            <p className="text-sm font-medium text-gray-900 mb-1">Completed</p>
            <p className="text-xs text-gray-500">Event finished</p>
          </button>

          <button
            onClick={() => setFilterStatus('REJECTED')}
            className={`bg-white rounded-xl border-2 p-6 text-left transition-all hover:shadow-lg ${
              filterStatus === 'REJECTED' ? 'border-red-500 shadow-md' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              {filterStatus === 'REJECTED' && (
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{statusCounts.rejected}</p>
            <p className="text-sm font-medium text-gray-900 mb-1">Rejected</p>
            <p className="text-xs text-gray-500">Needs follow-up</p>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer, event, or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
              </select>
              {filterStatus !== 'ALL' && (
                <button
                  onClick={() => setFilterStatus('ALL')}
                  className="px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reservations List */}
        <div className="space-y-3">
          {filteredReservations.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reservations found</h3>
              <p className="text-gray-600">
                {filterStatus !== 'ALL' 
                  ? `No ${filterStatus.toLowerCase()} reservations at the moment.`
                  : 'Customer reservations will appear here when submitted.'
                }
              </p>
            </div>
          ) : (
            filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-gray-900">{reservation.eventName}</h3>
                        <Badge 
                          variant={
                            reservation.status === 'APPROVED' ? 'success' :
                            reservation.status === 'PENDING' ? 'warning' :
                            reservation.status === 'REJECTED' ? 'error' : 'info'
                          }
                        >
                          {reservation.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">Customer: {reservation.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">
                        LKR {reservation.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-500">Venue</p>
                        <p className="text-xs font-medium text-gray-900 truncate">{reservation.venueName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-500">Event Date</p>
                        <p className="text-xs font-medium text-gray-900">{reservation.eventDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-500">Guests</p>
                        <p className="text-xs font-medium text-gray-900">{reservation.guestCount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-500">Contact</p>
                        <p className="text-xs font-medium text-gray-900">{reservation.customerPhone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status-specific Messages */}
                  {reservation.status === 'PENDING' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">
                          Verify venue availability before approving. Approval will block this time slot.
                        </p>
                      </div>
                    </div>
                  )}

                  {reservation.status === 'APPROVED' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-emerald-800">
                          Event scheduled. Venue reserved. Mark as completed after the event.
                        </p>
                      </div>
                    </div>
                  )}

                  {reservation.status === 'COMPLETED' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800">
                          Event completed. Customer can now leave a review.
                        </p>
                      </div>
                    </div>
                  )}

                  {reservation.status === 'REJECTED' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-800">
                          Reservation rejected. Customer notified via email.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2">
                    {reservation.status === 'APPROVED' && (
                      <Button 
                        variant="primary" 
                        onClick={() => handleComplete(reservation.id)}
                        className="flex items-center gap-2 text-sm py-2 px-3"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Completed
                      </Button>
                    )}
                    {reservation.status === 'PENDING' && (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => handleReject(reservation.id)}
                          className="flex items-center gap-2 text-sm py-2 px-3"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                        <Button 
                          variant="primary" 
                          onClick={() => handleApprove(reservation.id)}
                          className="flex items-center gap-2 text-sm py-2 px-3"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve & Reserve
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ManagerLayout>
  )
}
