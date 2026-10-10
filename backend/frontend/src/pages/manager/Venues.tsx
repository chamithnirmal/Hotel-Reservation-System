import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Upload,
  X,
  Image as ImageIcon,
  Users,
  Building2,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

import {
  venueService,
  facilityService,
  hotelService,
  authService,
  VenueResponse,
  FacilityResponse,
  CreateVenueRequest,
} from '@/services'

import ManagerLayout from '@/components/layout/ManagerLayout'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default function Venues() {
  const [venues, setVenues] = useState<VenueResponse[]>([])
  const [facilities, setFacilities] = useState<FacilityResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingVenue, setEditingVenue] = useState<VenueResponse | null>(null)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddFacility, setShowAddFacility] = useState(false)
  const [newFacilityName, setNewFacilityName] = useState('')
  const [facilityLoading, setFacilityLoading] = useState(false)
  const [facilitySuccess, setFacilitySuccess] = useState(false)
  const [hotelId, setHotelId] = useState<number | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [venueToDelete, setVenueToDelete] = useState<VenueResponse | null>(null)

  const [formData, setFormData] = useState<CreateVenueRequest>({
    venueName: '',
    description: '',
    capacity: 0,
    facilityIds: [],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const user = authService.getCurrentUser()

      if (!user) {
        setError('User not authenticated')
        return
      }

      let venuesData: VenueResponse[] = []
      let facilitiesData: FacilityResponse[] = []
      let hotelsData: any[] = []

      try {
        hotelsData = await hotelService.getHotelsByManager(user.id)
        
        if (hotelsData.length > 0) {
          setHotelId(hotelsData[0].id)
          
          try {
            venuesData = await venueService.getVenuesByHotel(hotelsData[0].id)
          } catch (err) {
            console.error('Failed to load venues for hotel:', err)
            venuesData = []
          }
        } else {
          setError(
            'No hotel found. Please create a hotel from the "My hotel" page first.'
          )
        }
      } catch (err) {
        console.error('Failed to load hotels:', err)
        setError('Failed to load hotel information')
      }

      try {
        facilitiesData = await facilityService.getAllFacilities()
      } catch (err) {
        console.error('Failed to load facilities:', err)
      }

      setVenues(venuesData)
      setFacilities(facilitiesData)
    } catch (err: any) {
      console.error('Unexpected error in loadData:', err)
      setError(err?.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!hotelId && !editingVenue) {
      setError('No hotel found. Please create a hotel first.')
      return
    }

    try {
      if (editingVenue) {
        await venueService.updateVenue(editingVenue.id, formData)
      } else {
        if (imageFile) {
          await venueService.createVenueWithImage(
            hotelId!,
            formData,
            imageFile
          )
        } else {
          await venueService.createVenue(hotelId!, formData)
        }
      }

      setShowModal(false)
      setEditingVenue(null)

      loadData()

      setFormData({
        venueName: '',
        description: '',
        capacity: 0,
        facilityIds: [],
      })

      setImagePreview(null)
      setImageFile(null)
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          `Failed to ${editingVenue ? 'update' : 'create'} venue`
      )
    }
  }

  const handleEdit = (venue: VenueResponse) => {
    setEditingVenue(venue)

    setFormData({
      venueName: venue.venueName,
      description: venue.description || '',
      capacity: venue.capacity,
      facilityIds: venue.facilities
        ? Array.from(venue.facilities).map((f) => f.id)
        : [],
    })

    if (venue.image) {
      setImagePreview(`data:image/jpeg;base64,${venue.image}`)
    } else {
      setImagePreview(null)
    }

    setImageFile(null)
    setShowModal(true)
  }

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (file) {
      setImageFile(file)

      const reader = new FileReader()

      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }

      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleDelete = async (venue: VenueResponse) => {
    setVenueToDelete(venue)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!venueToDelete) return

    try {
      await venueService.deleteVenue(venueToDelete.id)
      loadData()
      setShowDeleteModal(false)
      setVenueToDelete(null)
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to delete venue'
      )
    }
  }

  const handleAddFacility = async (
    e?: React.FormEvent | React.MouseEvent
  ) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!newFacilityName.trim()) return

    const facilityExists = facilities.some(
      (f) =>
        f.facilityName.toLowerCase() ===
        newFacilityName.trim().toLowerCase()
    )

    if (facilityExists) {
      setError(
        `Facility "${newFacilityName.trim()}" already exists. Please use a different name.`
      )
      return
    }

    setFacilityLoading(true)
    setFacilitySuccess(false)

    try {
      const newFacility = await facilityService.createFacility({
        facilityName: newFacilityName.trim(),
        description: '',
      })

      const updatedFacilities =
        await facilityService.getAllFacilities()

      setFacilities(updatedFacilities)

      setFormData({
        ...formData,
        facilityIds: [
          ...formData.facilityIds,
          newFacility.id,
        ],
      })

      setFacilitySuccess(true)
      setNewFacilityName('')
      setError('')

      setTimeout(() => {
        setFacilitySuccess(false)
      }, 2000)
    } catch (err: any) {
      console.error('Failed to create facility:', err)

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to create facility'

      setError(errorMessage)
    } finally {
      setFacilityLoading(false)
    }
  }

  const filteredVenues = venues.filter((venue) =>
    venue.venueName
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <ManagerLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-slate-200" />
              <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-emerald-600 animate-spin" />
            </div>

            <p className="text-sm font-medium text-slate-500">
              Loading venues...
            </p>
          </div>
        </div>
      </ManagerLayout>
    )
  }

  return (
    <ManagerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5" />
                  Inventory
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                Venues
              </h1>

              <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-2xl">
                Create and manage the event spaces available for
                reservations.
              </p>
            </div>

            <Button
              onClick={() => {
                setEditingVenue(null)

                setFormData({
                  venueName: '',
                  description: '',
                  capacity: 0,
                  facilityIds: [],
                })

                setImagePreview(null)
                setImageFile(null)
                setShowModal(true)
              }}
              variant="primary"
              className="!bg-yellow-600 hover:!bg-blue-700 !text-white !font-bold !text-base font-sans rounded-xl"

            >
              <Plus className="w-4 h-4" />
              Add venue
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Something went wrong
                </p>

                <p className="text-sm text-red-700 mt-0.5">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          {/* Card Header */}
          <div className="px-6 py-5 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Venue inventory
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Manage spaces, capacity and available facilities.
                </p>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {venues.length} total venues
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />

              <input
                type="text"
                placeholder="Search venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          {/* Empty State */}
          {filteredVenues.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                No venues found
              </h3>

              <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
                {searchTerm
                  ? 'Try changing your search term.'
                  : 'Create your first venue to start accepting bookings.'}
              </p>

              {!searchTerm && (
                <div className="mt-6">
                  <Button
                    onClick={() => {
                      setEditingVenue(null)

                      setFormData({
                        venueName: '',
                        description: '',
                        capacity: 0,
                        facilityIds: [],
                      })

                      setImagePreview(null)
                      setImageFile(null)
                      setShowModal(true)
                    }}
                    variant="primary"
                  >
                    <Plus className="w-4 h-4" />
                    Create first venue
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Table */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Venue
                    </th>

                    <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Capacity
                    </th>

                    <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Facilities
                    </th>

                    <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>

                    <th className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredVenues.map((venue) => {
                    const venueFacilities = venue.facilities
                      ? Array.from(venue.facilities)
                      : []

                    return (
                      <tr
                        key={venue.id}
                        className="group hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Venue */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                              <Building2 className="w-5 h-5 text-emerald-600" />
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">
                                {venue.venueName}
                              </p>

                              <p className="text-xs text-slate-500 mt-1">
                                Venue #{venue.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Capacity */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />

                            <span className="text-sm font-medium text-slate-700">
                              {venue.capacity}
                            </span>

                            <span className="text-xs text-slate-400">
                              guests
                            </span>
                          </div>
                        </td>

                        {/* Facilities */}
                        <td className="px-6 py-5">
                          {venueFacilities.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 max-w-sm">
                              {venueFacilities
                                .slice(0, 3)
                                .map((facility) => (
                                  <span
                                    key={facility.id}
                                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-600"
                                  >
                                    {facility.facilityName}
                                  </span>
                                ))}

                              {venueFacilities.length > 3 && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-xs font-semibold text-emerald-700">
                                  +{venueFacilities.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              No facilities
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <Badge
                            variant={
                              venue.isActive ? 'success' : 'default'
                            }
                          >
                            {venue.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">

                            <button
                              onClick={() => handleEdit(venue)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(venue)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete venue"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Venue Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                  Venue Management
                </p>

                <h3 className="text-xl font-bold text-slate-900">
                  {editingVenue
                    ? 'Edit venue'
                    : 'Create new venue'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  setEditingVenue(null)
                }}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto max-h-[calc(92vh-82px)]"
            >
              <div className="p-6 space-y-6">

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2.5">
                    Venue image
                  </label>

                  {!imagePreview ? (
                    <label className="group flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50/70 hover:bg-emerald-50/40 hover:border-emerald-400 transition-all">

                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-3 group-hover:border-emerald-200">
                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                      </div>

                      <p className="text-sm font-semibold text-slate-700">
                        Upload venue image
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        PNG or JPG • Maximum 10MB
                      </p>

                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  ) : (
                    <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={imagePreview}
                        alt="Venue preview"
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                        <span className="text-xs text-white font-medium">
                          Venue image preview
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-3 right-3 w-9 h-9 bg-white/95 text-red-600 rounded-lg flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Basic Information */}
                <div className="space-y-5">

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Venue name <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={formData.venueName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          venueName: e.target.value,
                        })
                      }
                      required
                      placeholder="e.g. Grand Ballroom"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                      rows={4}
                      placeholder="Describe the venue and what makes it suitable for events..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none resize-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Guest capacity <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                      <input
                        type="number"
                        value={formData.capacity || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            capacity:
                              parseInt(e.target.value) || 0,
                          })
                        }
                        required
                        min="1"
                        placeholder="e.g. 250"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </div>
                  </div>

                </div>

                {/* Facilities */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800">
                        Facilities
                      </label>

                      <p className="text-xs text-slate-400 mt-0.5">
                        Select everything available at this venue.
                      </p>
                    </div>

                    <span className="text-xs font-medium text-slate-500">
                      {formData.facilityIds.length} selected
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden">

                    <div className="p-4 bg-slate-50/70">
                      {facilities.length === 0 ? (
                        <div className="py-6 text-center">
                          <Sparkles className="w-6 h-6 text-slate-300 mx-auto mb-2" />

                          <p className="text-sm text-slate-500">
                            No facilities available.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">

                          {facilities.map((facility) => (
                            <label
                              key={facility.id}
                              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                formData.facilityIds.includes(
                                  facility.id
                                )
                                  ? 'border-emerald-200 bg-emerald-50'
                                  : 'border-transparent bg-white hover:border-slate-200'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.facilityIds.includes(
                                  facility.id
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      facilityIds: [
                                        ...formData.facilityIds,
                                        facility.id,
                                      ],
                                    })
                                  } else {
                                    setFormData({
                                      ...formData,
                                      facilityIds:
                                        formData.facilityIds.filter(
                                          (id) =>
                                            id !== facility.id
                                        ),
                                    })
                                  }
                                }}
                                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              />

                              <span className="text-sm font-medium text-slate-700">
                                {facility.facilityName}
                              </span>
                            </label>
                          ))}

                        </div>
                      )}
                    </div>

                    {/* Add Facility */}
                    <div className="border-t border-slate-200 p-4">

                      {!showAddFacility ? (
                        <button
                          type="button"
                          onClick={() =>
                            setShowAddFacility(true)
                          }
                          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          <Plus className="w-4 h-4" />
                          Add new facility
                        </button>
                      ) : (
                        <div className="space-y-3">

                          <div className="flex flex-col sm:flex-row gap-2">

                            <input
                              type="text"
                              value={newFacilityName}
                              onChange={(e) =>
                                setNewFacilityName(
                                  e.target.value
                                )
                              }
                              placeholder="e.g. WiFi, Projector, Parking"
                              disabled={facilityLoading}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  handleAddFacility(e)
                                }
                              }}
                              className="flex-1 px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-slate-100"
                            />

                            <div className="flex gap-2">

                              <button
                                type="button"
                                onClick={handleAddFacility}
                                disabled={
                                  facilityLoading ||
                                  !newFacilityName.trim()
                                }
                                className="px-4 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                              >
                                {facilityLoading
                                  ? 'Adding...'
                                  : 'Add'}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setShowAddFacility(false)
                                  setNewFacilityName('')
                                  setFacilitySuccess(false)
                                }}
                                disabled={facilityLoading}
                                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl disabled:text-slate-400 transition-colors"
                              >
                                Cancel
                              </button>

                            </div>
                          </div>

                          {facilitySuccess ? (
                            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                              <CheckCircle2 className="w-4 h-4" />
                              Facility added successfully.
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400">
                              New facilities will be available
                              for your venues.
                            </p>
                          )}

                        </div>
                      )}

                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false)
                    setEditingVenue(null)
                  }}
                >
                  Cancel
                </Button>

                <Button type="submit" variant="primary">
                  {editingVenue
                    ? 'Update venue'
                    : 'Create venue'}
                </Button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && venueToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Delete venue
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setVenueToDelete(null)
                }}
                className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4">
              <p className="text-sm text-slate-600">
                Are you sure you want to delete <span className="font-semibold text-slate-900">{venueToDelete.venueName}</span>? 
                This will also deactivate all event packages linked to this venue. 
                This action cannot be undone.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setVenueToDelete(null)
                }}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete venue
              </button>
            </div>
          </div>
        </div>
      )}
    </ManagerLayout>
  )
}