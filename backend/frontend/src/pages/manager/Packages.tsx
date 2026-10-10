import { useState, useEffect } from 'react'

import {
  Plus,
  MoreVertical,
  Package,
  CalendarDays,
  MapPin,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Tag,
} from 'lucide-react'

import {
  eventPackageService,
  venueService,
  hotelService,
  EventPackageResponse,
  VenueResponse,
  CreateEventPackageRequest,
} from '@/services'

import ManagerLayout from '@/components/layout/ManagerLayout'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default function Packages() {
  const [packages, setPackages] = useState<EventPackageResponse[]>([])
  const [venues, setVenues] = useState<VenueResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [error, setError] = useState('')
  const [createdPackageName, setCreatedPackageName] = useState('')
  const [editingPackage, setEditingPackage] =
    useState<EventPackageResponse | null>(null)

  const [formData, setFormData] =
    useState<CreateEventPackageRequest>({
      packageName: '',
      eventType: 'WEDDING',
      description: '',
      basePrice: 0,
      facilityIds: [],
    })

  const [selectedVenueId, setSelectedVenueId] = useState<number>(0)

  useEffect(() => {
    loadData()
  }, [])

  // Auto-close success modal after 3 seconds
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [showSuccessModal])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('Loading packages and venues for manager...')

      let managerHotel
      try {
        managerHotel = await hotelService.getManagerHotel()
        console.log('Manager hotel:', managerHotel)
      } catch (err: any) {
        console.error('Failed to get manager hotel:', err)
        setError('Failed to load your hotel information')
        setLoading(false)
        return
      }

      let venuesData: VenueResponse[] = []
      try {
        venuesData = await venueService.getVenuesByHotel(managerHotel.id)
        console.log('Venues for hotel:', venuesData.length, 'items')
      } catch (err: any) {
        console.error('Failed to load venues:', err)
        setError('Failed to load venues')
      }

      let packagesData: EventPackageResponse[] = []
      try {
        const allPackages: EventPackageResponse[] = []
        for (const venue of venuesData) {
          const venuePackages = await eventPackageService.getPackagesByVenue(venue.id)
          allPackages.push(...venuePackages)
        }
        packagesData = allPackages
        console.log('Packages loaded:', packagesData.length, 'items')
      } catch (err: any) {
        console.error('Failed to load packages:', err)
        setError('Failed to load packages')
      }

      console.log('Setting state with filtered data...')
      setPackages(packagesData)
      setVenues(venuesData)
      console.log('State updated successfully')
    } catch (err: any) {
      console.error('Unexpected error in loadData:', err)
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load data'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedVenueId) {
      setError('Please select a venue')
      return
    }

    setError('')

    try {
      if (editingPackage) {
        console.log('Updating package:', editingPackage.id)

        await eventPackageService.updatePackage(
          editingPackage.id,
          formData
        )

        setCreatedPackageName(
          `${formData.packageName} (updated)`
        )
      } else {
        console.log('Creating package with:', {
          venueId: selectedVenueId,
          formData,
        })

        await eventPackageService.createPackage(
          selectedVenueId,
          formData
        )

        setCreatedPackageName(formData.packageName)
      }

      setShowModal(false)
      setEditingPackage(null)
      setShowSuccessModal(true)

      console.log('Reloading packages...')

      await loadData()

      setFormData({
        packageName: '',
        eventType: 'WEDDING',
        description: '',
        basePrice: 0,
        facilityIds: [],
      })

      setSelectedVenueId(0)
    } catch (err: any) {
      console.error('Failed to save package:', err)
      console.error('Response:', err.response?.data)

      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to save package'
      )
    }
  }

  const handleEdit = (pkg: EventPackageResponse) => {
    console.log('Edit button clicked for package:', pkg.id, pkg.packageName)

    setEditingPackage(pkg)

    setFormData({
      packageName: pkg.packageName,
      eventType: pkg.eventType,
      description: pkg.description,
      basePrice:
        typeof pkg.basePrice === 'number'
          ? pkg.basePrice
          : parseFloat(pkg.basePrice as any),
      facilityIds: [],
    })

    setSelectedVenueId(pkg.venueId)

    console.log('Form data set to:', {
      packageName: pkg.packageName,
      eventType: pkg.eventType,
      venueId: pkg.venueId,
    })

    setShowModal(true)

    console.log('Modal opened for editing')
  }

  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        'Are you sure you want to delete this package?'
      )
    ) {
      try {
        await eventPackageService.deletePackage(id)
        loadData()
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            'Failed to delete package'
        )
      }
    }
  }

  const getEventTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'WEDDING':
        return 'wedding'
      case 'CONFERENCE':
        return 'conference'
      case 'BIRTHDAY':
        return 'birthday'
      case 'CORPORATE':
        return 'corporate'
      default:
        return 'default'
    }
  }

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
              Loading packages...
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
                  <Package className="w-3.5 h-3.5" />
                  Offerings
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                Packages
              </h1>

              <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-2xl">
                Bundle menus, styling, venues, and services into
                bookable event experiences.
              </p>
            </div>

            <Button
              onClick={() => {
                setEditingPackage(null)

                setFormData({
                  packageName: '',
                  eventType: 'WEDDING',
                  description: '',
                  basePrice: 0,
                  facilityIds: [],
                })

                setSelectedVenueId(0)
                setError('')
                setShowModal(true)
              }}
              variant="primary"
            >
              <Plus className="w-4 h-4" />
              Create package
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

        {/* Package Summary */}
        {packages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total packages
                  </p>

                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {packages.length}
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Package className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Available venues
                  </p>

                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {venues.length}
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Event types
                  </p>

                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {
                      new Set(
                        packages.map((pkg) => pkg.eventType)
                      ).size
                    }
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Package Content */}
        {packages.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">

            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Package className="w-8 h-8 text-slate-400" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              No packages yet
            </h3>

            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Create your first event package to start offering
              complete event solutions to customers.
            </p>

            <div className="mt-6">
              <Button
                onClick={() => {
                  setEditingPackage(null)

                  setFormData({
                    packageName: '',
                    eventType: 'WEDDING',
                    description: '',
                    basePrice: 0,
                    facilityIds: [],
                  })

                  setSelectedVenueId(0)
                  setError('')
                  setShowModal(true)
                }}
                variant="primary"
              >
                <Plus className="w-4 h-4" />
                Create first package
              </Button>
            </div>
          </div>
        ) : (
          <div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Your packages
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {packages.length} package
                  {packages.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >

                  {/* Card Top */}
                  <div className="h-2 bg-emerald-600" />

                  <div className="p-6">

                    <div className="flex items-start justify-between gap-4 mb-5">

                      <div className="flex items-center gap-3">

                        <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-emerald-600" />
                        </div>

                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide rounded-full bg-slate-100 text-slate-600">
                            <Tag className="w-3 h-3" />
                            {pkg.eventType.toLowerCase()}
                          </span>
                        </div>

                      </div>

                      <button
                        type="button"
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                    </div>

                    {/* Package Name */}
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {pkg.packageName}
                    </h3>

                    {/* Description */}
                    <p className="text-sm leading-6 text-slate-500 min-h-[48px] line-clamp-2">
                      {pkg.description}
                    </p>

                    {/* Package Info */}
                    <div className="grid grid-cols-2 gap-3 mt-6">

                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />

                          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            Guests
                          </p>
                        </div>

                        <p className="text-sm font-semibold text-slate-800">
                          100–200 guests
                        </p>
                      </div>

                      <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-3.5">
                        <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide mb-1.5">
                          Starting from
                        </p>

                        <p className="text-base font-bold text-slate-900 truncate">
                          LKR{' '}
                          {Number(
                            pkg.basePrice
                          ).toLocaleString()}
                        </p>
                      </div>

                    </div>

                    {/* Venue */}
                    <div className="flex items-center gap-2 mt-4 px-1">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />

                      <p className="text-xs text-slate-500">
                        Venue ID: {pkg.venueId}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-6 pt-5 border-t border-slate-100">

                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(pkg)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50"
                        onClick={() => handleDelete(pkg.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </Button>

                    </div>

                  </div>
                </div>
              ))}

            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Package Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                  Package Management
                </p>

                <h3 className="text-xl font-bold text-slate-900">
                  {editingPackage
                    ? 'Edit package'
                    : 'Create new package'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  setEditingPackage(null)
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

                {/* Package Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Package name{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    value={formData.packageName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        packageName: e.target.value,
                      })
                    }
                    required
                    placeholder="e.g. Premium Wedding Package"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                {/* Event Type + Venue */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Event type{' '}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                      <select
                        value={formData.eventType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            eventType:
                              e.target.value as any,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-sm text-slate-900 outline-none appearance-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      >
                        <option value="WEDDING">
                          Wedding
                        </option>

                        <option value="CONFERENCE">
                          Conference
                        </option>

                        <option value="BIRTHDAY">
                          Birthday
                        </option>

                        <option value="CORPORATE">
                          Corporate
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Venue{' '}
                      <span className="text-red-500">*</span>

                      <span className="text-xs font-normal text-slate-400 ml-2">
                        ({venues.length} available)
                      </span>
                    </label>

                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                      <select
                        value={selectedVenueId}
                        onChange={(e) =>
                          setSelectedVenueId(
                            parseInt(e.target.value)
                          )
                        }
                        required
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-sm text-slate-900 outline-none appearance-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      >
                        <option value="">
                          Select venue
                        </option>

                        {venues.map((venue) => (
                          <option
                            key={venue.id}
                            value={venue.id}
                          >
                            {venue.venueName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {venues.length === 0 && (
                      <p className="flex items-center gap-1.5 text-xs text-red-600 mt-2">
                        <AlertCircle className="w-3.5 h-3.5" />
                        No venues available. Please create a
                        venue first.
                      </p>
                    )}
                  </div>

                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Description{' '}
                    <span className="text-red-500">*</span>
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
                    placeholder="Describe what's included in this package..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none resize-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Base price (LKR){' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      LKR
                    </span>

                    <input
                      type="number"
                      value={formData.basePrice || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          basePrice:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                      min="0"
                      step="0.01"
                      placeholder="350000"
                      className="w-full pl-14 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    Set the starting price customers will see
                    for this package.
                  </p>
                </div>

                {/* Preview */}
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <div className="flex items-start gap-3">

                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Package preview
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {formData.packageName ||
                          'Your package name'}{' '}
                        •{' '}
                        {formData.eventType.toLowerCase()}
                      </p>
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
                    setEditingPackage(null)

                    setFormData({
                      packageName: '',
                      eventType: 'WEDDING',
                      description: '',
                      basePrice: 0,
                      facilityIds: [],
                    })

                    setSelectedVenueId(0)
                    setError('')
                  }}
                >
                  Cancel
                </Button>

                <Button type="submit" variant="primary">
                  {editingPackage
                    ? 'Update package'
                    : 'Create package'}
                </Button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">

            <div className="text-center">

              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>

              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
                Package Management
              </p>

              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Success!
              </h3>

              <p className="text-sm leading-6 text-slate-500 mb-6">
                <span className="font-semibold text-slate-800">
                  "{createdPackageName}"
                </span>{' '}
                has been successfully added to your event
                offerings.
              </p>

              <div className="mb-5">
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full animate-[progress_3s_linear]" />
                </div>

                <p className="text-xs text-slate-400 mt-2">
                  Closing automatically...
                </p>
              </div>

              <Button
                onClick={() =>
                  setShowSuccessModal(false)
                }
                variant="primary"
                className="w-full"
              >
                Done
              </Button>

            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress {
          from {
            width: 100%;
          }

          to {
            width: 0%;
          }
        }
      `}</style>
    </ManagerLayout>
  )
}