import { useState, useEffect } from 'react'
import { Search, Calendar, Building2, Users, Eye, Loader, X, MapPin, Pencil, Trash2 } from 'lucide-react'
import reservationService, { ReservationResponse } from '@/services/reservationService'
import CustomerLayout from '@/components/layout/CustomerLayout'

const money = (n: number) => `LKR ${n.toLocaleString('en-LK')}`

export default function Reservations() {
  const [reservations, setReservations] = useState<ReservationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selected, setSelected] = useState<ReservationResponse | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ReservationResponse | null>(null)
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, completed: 0 })

  // edit form state
  const [form, setForm] = useState({
    eventDate: '',
    guestCount: 1,
    contactPhone: '',
    specialRequests: '',
  })

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    try {
      setLoading(true)
      const mine = await reservationService.getMyReservations()
      setReservations(mine)
      setStats({
        total: mine.length,
        pending: mine.filter((r) => r.status === 'PENDING').length,
        approved: mine.filter((r) => r.status === 'APPROVED').length,
        completed: mine.filter((r) => r.status === 'COMPLETED').length,
      })
    } catch (err: any) {
      console.error('❌ Failed to load reservations:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = reservations.filter(
    (r) =>
      r.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.venueName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.packageName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Customers can only change/cancel a booking that is still waiting for approval
  const canModify = (r: ReservationResponse) => r.status === 'PENDING'

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

  const handleViewDetails = (r: ReservationResponse) => {
    setSelected(r)
    setShowDetails(true)
  }

  const openEdit = (r: ReservationResponse) => {
    setSelected(r)
    setForm({
      eventDate: r.eventDate?.slice(0, 10) ?? '',
      guestCount: r.guestCount,
      contactPhone: r.contactPhone ?? '',
      specialRequests: r.specialRequests ?? '',
    })
    setError('')
    setShowEdit(true)
  }

  const handleUpdate = async () => {
    if (!selected) return
    if (!form.eventDate || form.guestCount < 1 || !form.contactPhone.trim()) {
      setError('Event date, guest count and contact phone are required.')
      return
    }
    try {
      setSaving(true)
      setError('')
      await reservationService.updateReservation(selected.id, {
        eventDate: form.eventDate,
        guestCount: Number(form.guestCount),
        contactPhone: form.contactPhone.trim(),
        specialRequests: form.specialRequests.trim(),
      })
      setShowEdit(false)
      await loadReservations()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update reservation')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (r: ReservationResponse) => {
    setDeleteTarget(r)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      setActionLoading((prev) => ({ ...prev, [deleteTarget.id]: true }))
      await reservationService.cancelReservation(deleteTarget.id)
      setReservations((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      setShowDeleteConfirm(false)
      setDeleteTarget(null)
      await loadReservations()
    } catch (err: any) {
      console.error('❌ Failed to cancel reservation:', err)
      alert('Failed to cancel reservation')
    } finally {
      setActionLoading((prev) => ({ ...prev, [deleteTarget.id]: false }))
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
    <CustomerLayout>
      <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">MY ACCOUNT</p>
        <h2 className="text-3xl font-serif text-[#183b30] mt-1">My Reservations</h2>
        <p className="text-sm text-muted-foreground mt-1">View, update or cancel your event bookings.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total bookings</p>
              <p className="mt-2 text-3xl font-semibold text-[#183b30]">{stats.total}</p>
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
      </div>

      {/* Reservations Table */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h3 className="font-semibold text-[#183b30]">Your bookings</h3>
            <p className="mt-1 text-xs text-muted-foreground">Pending and approved bookings can be edited or cancelled</p>
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

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  {['ID', 'Hotel / Venue', 'Event Date', 'Guests', 'Total', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-muted-foreground">#{r.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#183b30] text-sm">{r.hotelName}</p>
                      <p className="text-xs text-muted-foreground">{r.venueName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span>{new Date(r.eventDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="size-4 text-muted-foreground" />
                        <span>{r.guestCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#276247]">{money(r.totalPrice)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(r)}
                          className="px-2 py-1.5 text-sm font-medium text-[#276247] hover:bg-[#e8f0eb] rounded transition inline-flex items-center gap-1"
                        >
                          <Eye className="size-4" />
                          View
                        </button>

                        {canModify(r) && (
                          <button
                            onClick={() => openEdit(r)}
                            className="px-2 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded transition inline-flex items-center gap-1"
                          >
                            <Pencil className="size-4" />
                            Edit
                          </button>
                        )}

                        {(r.status === 'PENDING' || r.status === 'APPROVED') && (
                          <button
                            onClick={() => handleDelete(r)}
                            disabled={actionLoading[r.id]}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                            title="Cancel reservation"
                          >
                            {actionLoading[r.id] ? (
                              <Loader className="size-4 animate-spin" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                          </button>
                        )}
                      </div>
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
            <p className="text-sm text-muted-foreground mt-1">Book a venue from the Hotels page to get started</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-serif text-[#183b30]">Reservation Details</h2>
              <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reservation ID</p>
                  <p className="text-2xl font-bold text-[#183b30]">#{selected.id}</p>
                </div>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeColor(selected.status)}`}>
                  {selected.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#e8f0eb] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="size-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground uppercase font-medium">Hotel</p>
                  </div>
                  <p className="font-semibold text-[#183b30]">{selected.hotelName}</p>
                </div>
                <div className="bg-[#e8f0eb] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="size-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground uppercase font-medium">Venue</p>
                  </div>
                  <p className="font-semibold text-[#183b30]">{selected.venueName}</p>
                </div>
                <div className="bg-[#e8f0eb] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground uppercase font-medium">Event Date</p>
                  </div>
                  <p className="font-semibold text-[#183b30]">
                    {new Date(selected.eventDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="bg-[#e8f0eb] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="size-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground uppercase font-medium">Guest Count</p>
                  </div>
                  <p className="font-semibold text-[#183b30]">{selected.guestCount} guests</p>
                </div>
              </div>

              <div className="bg-[#e8f0eb] rounded-lg p-4">
                <p className="text-xs text-muted-foreground uppercase font-medium mb-3">Package Details</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Package:</span>
                    <span className="font-semibold text-[#183b30]">{selected.packageName}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#d0dfd8]">
                    <span className="font-semibold text-[#183b30]">Total Price:</span>
                    <span className="text-2xl font-bold text-[#276247]">{money(selected.totalPrice)}</span>
                  </div>
                </div>
              </div>

              {selected.specialRequests && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-2">Special Requests</p>
                  <p className="text-sm text-[#183b30]">{selected.specialRequests}</p>
                </div>
              )}

              {selected.rejectionReason && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-xs text-red-600 uppercase font-medium mb-2">Rejection Reason</p>
                  <p className="text-sm text-red-900">{selected.rejectionReason}</p>
                </div>
              )}

              <button
                onClick={() => setShowDetails(false)}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif text-[#183b30]">Edit Reservation</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  #{selected.id} · {selected.hotelName}
                </p>
              </div>
              <button onClick={() => setShowEdit(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
              )}

              <div>
                <label className="text-xs text-muted-foreground uppercase font-medium">Event date</label>
                <input
                  type="date"
                  value={form.eventDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#276247]"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-medium">Guest count</label>
                <input
                  type="number"
                  min={1}
                  value={form.guestCount}
                  onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#276247]"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-medium">Contact phone</label>
                <input
                  type="text"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#276247]"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-medium">Special requests</label>
                <textarea
                  rows={3}
                  value={form.specialRequests}
                  onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#276247]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEdit(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="flex-1 py-3 px-4 bg-[#276247] text-white font-semibold rounded-lg hover:bg-[#1a4a36] disabled:bg-gray-300 transition inline-flex items-center justify-center gap-2"
                >
                  {saving && <Loader className="size-4 animate-spin" />}
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="size-6 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-serif text-center text-[#183b30] mt-4">Cancel Reservation?</h2>
              
              <p className="text-center text-muted-foreground mt-3">
                Are you sure you want to cancel reservation <span className="font-semibold text-[#183b30]">#{deleteTarget.id}</span> for <span className="font-semibold text-[#183b30]">{deleteTarget.hotelName}</span>?
              </p>

              <p className="text-center text-sm text-muted-foreground mt-2">
                Event Date: <span className="font-medium text-[#183b30]">{new Date(deleteTarget.eventDate).toLocaleDateString()}</span>
              </p>

              <p className="text-center text-sm bg-red-50 text-red-800 rounded-lg p-3 mt-4">
                This action cannot be undone.
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteTarget(null)
                  }}
                  className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  Keep It
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={actionLoading[deleteTarget.id]}
                  className="flex-1 py-2.5 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition inline-flex items-center justify-center gap-2"
                >
                  {actionLoading[deleteTarget.id] ? (
                    <Loader className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  Cancel Reservation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    </CustomerLayout>
  )
}