import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Star,
  Upload,
  X,
  Image as ImageIcon,
  MapPin,
  Phone,
  Mail,
  Building2,
  MessageSquare,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Sparkles,
  Pencil,
  ArrowRight,
} from 'lucide-react'

import {
  hotelService,
  authService,
  CreateHotelRequest,
  HotelResponse,
} from '@/services'

import ManagerLayout from '@/components/layout/ManagerLayout'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default function MyHotel() {
  const navigate = useNavigate()

  const [hotel, setHotel] = useState<HotelResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [venueCount, setVenueCount] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)

  const [formData, setFormData] = useState<CreateHotelRequest>({
    name: '',
    description: '',
    address: '',
    city: '',
    phoneNumber: '',
    email: '',
    starRating: 5,
    amenities: [],
  })

  useEffect(() => {
    loadHotel()
  }, [])

  const loadHotel = async () => {
    try {
      setLoading(true)

      const user = authService.getCurrentUser()

      if (!user) {
        navigate('/login')
        return
      }

      const data = await hotelService.getHotelsByManager(user.id)

      if (data.length > 0) {
        setHotel(data[0])
        await loadStatistics(data[0].id)
      }
    } catch (err: any) {
      console.error('Failed to load hotel:', err)
      setError(err.response?.data?.message || 'Failed to load hotel')
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async (hotelId: number) => {
    try {
      const { venueService } = await import('@/services')
      const { reviewService } = await import('@/services')

      const venues = await venueService.getAllVenues()

      setVenueCount(
        venues.filter(
          (v) => v.hotelId === hotelId && v.isActive
        ).length
      )

      const reviews = await reviewService.getAllReviews()

      setReviewCount(
        reviews.filter((r) => r.hotel?.id === hotelId).length
      )
    } catch (err) {
      console.error('Failed to load statistics:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await hotelService.createHotelWithImage(
        formData,
        imageFile || undefined
      )

      setShowForm(false)
      setImagePreview(null)
      setImageFile(null)

      await loadHotel()
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to create hotel'
      )
    }
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    setError('')
    setImageFile(file)

    const reader = new FileReader()

    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }

    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
    )
  }

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <ManagerLayout>
        <div className="min-h-[70vh] bg-[#f8f9fb] p-6 lg:p-10">
          <div className="mx-auto max-w-7xl animate-pulse space-y-8">
            <div className="space-y-3">
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="h-10 w-64 rounded bg-slate-200" />
              <div className="h-4 w-96 max-w-full rounded bg-slate-200" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="h-[420px] rounded-3xl bg-slate-200 lg:col-span-2" />
              <div className="h-[420px] rounded-3xl bg-slate-200" />
            </div>
          </div>
        </div>
      </ManagerLayout>
    )
  }

  /* ---------------- EMPTY STATE ---------------- */

  if (!hotel && !showForm) {
    return (
      <ManagerLayout>
        <div className="min-h-[80vh] bg-[#f8f9fb] px-6 py-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                <Sparkles className="h-4 w-4" />
                Property Profile
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                My Hotel
              </h1>

              <p className="mt-2 max-w-2xl text-slate-500">
                Create and manage your hotel profile, property
                information and guest-facing details.
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-8 py-14 text-center text-white lg:px-16">
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-amber-400/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-amber-400/10 blur-3xl" />

                <div className="relative mx-auto max-w-xl">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur">
                    <Building2 className="h-9 w-9 text-amber-300" />
                  </div>

                  <h2 className="text-3xl font-bold">
                    No hotel registered yet
                  </h2>

                  <p className="mt-3 text-slate-300">
                    Create your hotel profile to start managing
                    venues, packages and event reservations.
                  </p>

                  <div className="mt-8">
                    <Button
                      onClick={() => setShowForm(true)}
                      variant="primary"
                    >
                      Create Hotel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ManagerLayout>
    )
  }

  /* ---------------- CREATE FORM ---------------- */

  if (showForm) {
    return (
      <ManagerLayout>
        <div className="min-h-screen bg-[#f8f9fb] px-6 py-8 lg:px-10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8">
              <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                Property Setup
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Create Your Hotel
              </h1>

              <p className="mt-2 text-slate-500">
                Add the information guests will see when
                discovering your property.
              </p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                <X className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              {/* FORM HEADER */}

              <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5 lg:px-8">
                <h2 className="text-lg font-bold text-slate-900">
                  Hotel Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Provide accurate property details.
                </p>
              </div>

              <div className="space-y-8 p-6 lg:p-8">
                {/* IMAGE */}

                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-800">
                    Hotel Cover Image
                  </label>

                  {!imagePreview ? (
                    <div className="group rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition hover:border-amber-400 hover:bg-amber-50/30">
                      <input
                        type="file"
                        id="hotel-image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />

                      <label
                        htmlFor="hotel-image"
                        className="cursor-pointer"
                      >
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition group-hover:scale-105">
                          <Upload className="h-7 w-7 text-amber-600" />
                        </div>

                        <p className="font-semibold text-slate-900">
                          Upload hotel image
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          PNG, JPG or JPEG · Maximum 5MB
                        </p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200">
                      <img
                        src={imagePreview}
                        alt="Hotel preview"
                        className="h-72 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/80 text-white backdrop-blur transition hover:bg-red-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* BASIC DETAILS */}

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    label="Hotel Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Grand Event Hotel"
                    required
                  />

                  <FormField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Colombo"
                    required
                  />
                </div>

                <FormField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete hotel address"
                  required
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Describe your hotel and what makes it suitable for special events..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </div>

                {/* CONTACT */}

                <div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                    Contact Information
                  </h3>

                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="+94 XX XXX XXXX"
                      required
                    />

                    <FormField
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="hotel@example.com"
                      required
                    />
                  </div>
                </div>

                {/* RATING */}

                <div className="max-w-xs">
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Star Rating
                  </label>

                  <select
                    name="starRating"
                    value={formData.starRating}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <option key={star} value={star}>
                        {star} Star
                      </option>
                    ))}
                  </select>
                </div>

                {/* ACTIONS */}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" variant="primary">
                    Create Hotel
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </ManagerLayout>
    )
  }

  /* ---------------- MAIN HOTEL PAGE ---------------- */

  return (
    <ManagerLayout>
      <div className="min-h-screen bg-[#f8f9fb] px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-7xl">

          {/* PAGE HEADER */}

          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                <Sparkles className="h-4 w-4" />
                Property Profile
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                My Hotel
              </h1>

              <p className="mt-2 text-slate-500">
                Manage your property profile and guest-facing
                information.
              </p>
            </div>

            {hotel?.registrationStatus === 'APPROVED' && (
              <Button variant="primary">
                <span className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  Edit Hotel
                </span>
              </Button>
            )}
          </div>

          {/* HERO */}

          <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-[320px] overflow-hidden bg-slate-900">
              {hotel?.image ? (
                <img
                  src={`data:image/jpeg;base64,${hotel.image}`}
                  alt={hotel.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
                  <div className="text-center text-white">
                    <ImageIcon className="mx-auto mb-3 h-14 w-14 text-slate-500" />
                    <p className="text-sm text-slate-400">
                      No image uploaded
                    </p>
                  </div>
                </div>
              )}

              {/* OVERLAY */}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div className="text-white">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      {hotel?.registrationStatus === 'APPROVED' && (
                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Verified Property
                        </span>
                      )}

                      {hotel?.registrationStatus === 'PENDING' && (
                        <span className="flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                          <Clock3 className="h-3.5 w-3.5" />
                          Verification Pending
                        </span>
                      )}
                    </div>

                    <h2 className="text-3xl font-bold lg:text-4xl">
                      {hotel?.name}
                    </h2>

                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-200">
                      <MapPin className="h-4 w-4 text-amber-300" />
                      {hotel?.address}, {hotel?.city}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-xs text-slate-300">
                          Hotel Rating
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-2xl font-bold text-white">
                            {hotel?.starRating || 0}
                          </span>

                          <div>
                            {renderStars(hotel?.starRating || 0)}
                            <p className="mt-1 text-[11px] text-slate-300">
                              out of 5 stars
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* HERO FOOTER */}

            <div className="grid divide-y border-t border-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">
              <StatItem
                icon={<Building2 className="h-5 w-5" />}
                label="Active Venues"
                value={venueCount}
              />

              <StatItem
                icon={<MessageSquare className="h-5 w-5" />}
                label="Guest Reviews"
                value={reviewCount}
              />

              <StatItem
                icon={<ShieldCheck className="h-5 w-5" />}
                label="Verification"
                value={
                  hotel?.registrationStatus === 'APPROVED'
                    ? 'Verified'
                    : 'Pending'
                }
              />
            </div>
          </div>

          {/* CONTENT GRID */}

          <div className="grid gap-6 lg:grid-cols-3">

            {/* ABOUT */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 lg:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                    About Property
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    Hotel Overview
                  </h3>
                </div>
              </div>

              <p className="text-[15px] leading-7 text-slate-600">
                {hotel?.description}
              </p>

              {/* CONTACT */}

              <div className="mt-8 grid gap-4 border-t border-slate-100 pt-7 sm:grid-cols-2">
                <ContactCard
                  icon={<Mail className="h-5 w-5" />}
                  label="Email Address"
                  value={hotel?.email || '-'}
                />

                <ContactCard
                  icon={<Phone className="h-5 w-5" />}
                  label="Phone Number"
                  value={hotel?.phoneNumber || '-'}
                />

                <ContactCard
                  icon={<MapPin className="h-5 w-5" />}
                  label="Location"
                  value={`${hotel?.address}, ${hotel?.city}`}
                />

                <ContactCard
                  icon={<Building2 className="h-5 w-5" />}
                  label="Property Status"
                  value={
                    hotel?.registrationStatus === 'APPROVED'
                      ? 'Verified by EventStay'
                      : 'Pending verification'
                  }
                />
              </div>
            </div>

            {/* PROPERTY DETAILS */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Property Details
              </p>

              <h3 className="mt-1 text-xl font-bold text-slate-900">
                At a Glance
              </h3>

              <div className="mt-7 space-y-5">

                <DetailRow
                  label="Star Rating"
                  value={
                    <div className="flex items-center gap-2">
                      {renderStars(hotel?.starRating || 0)}
                      <span className="text-sm font-bold text-slate-900">
                        {hotel?.starRating}/5
                      </span>
                    </div>
                  }
                />

                <DetailRow
                  label="Guest Reviews"
                  value={
                    <span className="font-bold text-slate-900">
                      {reviewCount}
                    </span>
                  }
                />

                <DetailRow
                  label="Active Venues"
                  value={
                    <span className="font-bold text-slate-900">
                      {venueCount}
                    </span>
                  }
                />

                <DetailRow
                  label="Registration"
                  value={
                    hotel?.registrationStatus === 'APPROVED' ? (
                      <span className="font-semibold text-emerald-600">
                        Approved
                      </span>
                    ) : (
                      <span className="font-semibold text-amber-600">
                        Pending
                      </span>
                    )
                  }
                />

              </div>

              <div className="mt-7 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Property Verification
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {hotel?.registrationStatus === 'APPROVED'
                        ? 'Your property has been verified and can be presented to customers.'
                        : 'Your property is currently waiting for verification.'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
              >
                View Public Profile
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  )
}

/* =========================================================
   REUSABLE UI COMPONENTS
========================================================= */

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  label: string
  name: string
  value: string
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="ml-1 text-amber-600">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
      />
    </div>
  )
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
        {icon}
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 text-lg font-bold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  )
}

function ContactCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 transition hover:bg-amber-50/50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>

      <div className="text-right">{value}</div>
    </div>
  )
}