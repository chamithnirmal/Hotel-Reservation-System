import { useState, useEffect } from 'react'
import { Search, Check, X, Loader, AlertCircle, Star, Download, Building2, Clock, Inbox } from 'lucide-react'
import hotelService, { HotelResponse } from '@/services/hotelService'
import { useModal } from '@/hooks/useModal'
import { useToast } from '@/hooks/useToast'
import Modal from '@/components/ui/Modal'
import ToastContainer from '@/components/ui/ToastContainer'

interface HotelWithStats extends HotelResponse {
  daysAgo: number
}

export default function HotelVerification() {
  const modal = useModal()
  const toast = useToast()
  
  const [hotels, setHotels] = useState<HotelWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({})
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)

  useEffect(() => {
    loadHotels()
  }, [])

  const loadHotels = async () => {
    try {
      setLoading(true)

      // Get PENDING hotels for verification
      const pendingHotels = await hotelService.getHotelsByStatus('PENDING')

      const hotelsWithDays: HotelWithStats[] = pendingHotels.map((hotel) => {
        const createdDate = new Date(hotel.createdAt)
        const today = new Date()
        const daysAgo = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
        return {
          ...hotel,
          daysAgo: daysAgo > 0 ? daysAgo : 0,
        }
      })

      setHotels(hotelsWithDays)

      // Get stats from all hotels
      const allHotels = await hotelService.getAllHotels()
      const approvedCount = allHotels.filter(h => h.registrationStatus === 'APPROVED').length
      const rejectedCount = allHotels.filter(h => h.registrationStatus === 'REJECTED').length

      setStats({
        total: allHotels.length,
        pending: pendingHotels.length,
        approved: approvedCount,
        rejected: rejectedCount,
      })

      console.log('✅ Pending hotels loaded:', hotelsWithDays.length)
    } catch (err: any) {
      console.error('❌ Failed to load hotels:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredHotels = hotels.filter(
    (hotel) =>
      (hotel.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       hotel.city?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      hotel.registrationStatus === 'PENDING'
  )

  const handleApprove = (hotelId: number) => {
    setSelectedHotelId(hotelId)
    setActionType('approve')
    modal.confirm(
      'Approve Hotel?',
      'Are you sure you want to approve this hotel? This will make it available for booking.',
      'Approve'
    )
  }

  const handleReject = (hotelId: number) => {
    setSelectedHotelId(hotelId)
    setActionType('reject')
    modal.warning(
      'Reject Hotel?',
      'Are you sure you want to reject this hotel? The manager will be notified.',
      'Reject'
    )
  }

  const handleModalConfirm = async () => {
    if (!selectedHotelId || !actionType) return

    try {
      modal.setLoading(true)
      setActionLoading((prev) => ({ ...prev, [selectedHotelId]: true }))

      if (actionType === 'approve') {
        await hotelService.approveHotel(selectedHotelId)
        toast.success('Hotel Approved', 'The hotel has been successfully approved')
      } else {
        await hotelService.rejectHotel(selectedHotelId)
        toast.success('Hotel Rejected', 'The hotel has been rejected')
      }

      // Update status in table
      setHotels((prev) =>
        prev.map((h) =>
          h.id === selectedHotelId
            ? {
                ...h,
                registrationStatus: actionType === 'approve' ? 'APPROVED' : 'REJECTED',
              }
            : h
        )
      )

      // Reload stats
      await loadHotels()
      modal.closeModal()
    } catch (err: any) {
      console.error('❌ Failed to perform action:', err)
      toast.error(
        'Action Failed',
        err.response?.data?.message || 'Failed to perform action'
      )
    } finally {
      modal.setLoading(false)
      setActionLoading((prev) => ({ ...prev, [selectedHotelId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#e8f0eb] border-t-[#276247]"></div>
        <p className="text-sm text-gray-500">Loading hotel applications…</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col gap-1 border-b border-gray-200 pb-6">
          <p className="text-sm font-medium text-[#276247]">Administration</p>
          <h2 className="text-3xl font-serif font-semibold tracking-tight text-[#183b30]">Hotel verification</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-gray-500">
            Review applications and protect the quality of the EventStay collection.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Total hotels</p>
              <span className="grid size-9 place-items-center rounded-lg bg-[#e8f0eb] text-[#276247]">
                <Building2 className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-[#183b30]">{stats.total}</p>
            <p className="mt-1 text-xs text-gray-400">All registered properties</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <span className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                <Check className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-emerald-700">{stats.approved}</p>
            <p className="mt-1 text-xs text-gray-400">Live and bookable</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-amber-800">Pending review</p>
              <span className="grid size-9 place-items-center rounded-lg bg-amber-100 text-amber-700">
                <Clock className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-amber-700">{stats.pending}</p>
            <p className="mt-1 text-xs text-amber-700/70">Waiting for your decision</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <span className="grid size-9 place-items-center rounded-lg bg-red-50 text-red-600">
                <X className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-red-700">{stats.rejected}</p>
            <p className="mt-1 text-xs text-gray-400">Not approved</p>
          </div>
        </div>

        {/* Applications Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#183b30]">Applications awaiting review</h3>
              <p className="mt-1 text-sm text-gray-500">Manage your EventStay inventory and operations</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by hotel or city"
                  aria-label="Search hotels"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-24 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-[#276247] focus:outline-none focus:ring-2 focus:ring-[#276247]/20 sm:w-72"
                />
                {filteredHotels.length > 0 && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    {filteredHotels.length} results
                  </span>
                )}
              </div>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#276247]/40">
                <Download className="size-4" />
                Export CSV
              </button>
            </div>
          </div>

          {filteredHotels.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="border-b border-gray-200 bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Verification</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredHotels.map((hotel) => (
                    <tr key={hotel.id} className="transition-colors hover:bg-[#e8f0eb]/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#e8f0eb] text-sm font-semibold text-[#276247]">
                            {hotel.hotelName?.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#183b30]">{hotel.hotelName}</p>
                            <p className="mt-0.5 truncate text-xs text-gray-500">Manager: {hotel.managerName}</p>
                            <p className="mt-0.5 text-xs text-gray-400">
                              Submitted {hotel.daysAgo === 0 ? 'today' : `${hotel.daysAgo} day${hotel.daysAgo === 1 ? '' : 's'} ago`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="font-medium text-[#183b30]">{hotel.city}</p>
                        <p className="mt-0.5 max-w-xs truncate text-xs text-gray-500">{hotel.address}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Star className="size-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-gray-800">4.8</span>
                          <span className="text-xs text-gray-400">(342)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                          hotel.registrationStatus === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                            : hotel.registrationStatus === 'REJECTED'
                            ? 'bg-red-50 text-red-700 ring-red-600/20'
                            : 'bg-amber-50 text-amber-800 ring-amber-600/20'
                        }`}>
                          <span className={`size-1.5 rounded-full ${
                            hotel.registrationStatus === 'APPROVED'
                              ? 'bg-emerald-500'
                              : hotel.registrationStatus === 'REJECTED'
                              ? 'bg-red-500'
                              : 'bg-amber-500'
                          }`} />
                          {hotel.registrationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(hotel.id)}
                            disabled={actionLoading[hotel.id] || hotel.registrationStatus !== 'PENDING'}
                            className="inline-flex min-w-[84px] items-center justify-center gap-1.5 rounded-lg bg-[#276247] px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#1f4f3a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#276247]/40 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
                          >
                            {actionLoading[hotel.id] ? (
                              <Loader className="size-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="size-4" />
                                Approve
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(hotel.id)}
                            disabled={actionLoading[hotel.id] || hotel.registrationStatus !== 'PENDING'}
                            className="inline-flex min-w-[84px] items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                          >
                            {actionLoading[hotel.id] ? (
                              <Loader className="size-4 animate-spin" />
                            ) : (
                              <>
                                <X className="size-4" />
                                Reject
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-[#e8f0eb] text-[#276247]">
                <Inbox className="size-6" />
              </span>
              <p className="mt-4 font-semibold text-[#183b30]">No hotels found</p>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                There are no pending applications that match your search. Try a different hotel name or city.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Professional Modal */}
      <Modal
        isOpen={modal.modal.isOpen}
        title={modal.modal.title}
        message={modal.modal.message}
        type={modal.modal.type}
        confirmText={modal.modal.confirmText}
        cancelText={modal.modal.cancelText}
        isLoading={modal.modal.isLoading}
        onConfirm={handleModalConfirm}
        onCancel={modal.closeModal}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </>
  )
}