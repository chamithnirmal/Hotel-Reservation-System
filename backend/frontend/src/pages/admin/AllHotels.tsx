import { useState, useEffect } from 'react'
import { Search, Building2, MapPin, Phone, Mail, Star, Eye, Loader } from 'lucide-react'
import hotelService, { HotelResponse } from '@/services/hotelService'

export default function AllHotels() {
  const [hotels, setHotels] = useState<HotelResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHotel, setSelectedHotel] = useState<HotelResponse | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })

  useEffect(() => {
    loadHotels()
  }, [])

  const loadHotels = async () => {
    try {
      setLoading(true)
      const allHotels = await hotelService.getAllHotels()
      setHotels(allHotels)

      const pendingCount = allHotels.filter(h => h.registrationStatus === 'PENDING').length
      const approvedCount = allHotels.filter(h => h.registrationStatus === 'APPROVED').length
      const rejectedCount = allHotels.filter(h => h.registrationStatus === 'REJECTED').length

      setStats({
        total: allHotels.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      })

      console.log('✅ All hotels loaded:', allHotels.length)
    } catch (err: any) {
      console.error('❌ Failed to load hotels:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.managerName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewDetails = (hotel: HotelResponse) => {
    setSelectedHotel(hotel)
    setShowDetailsModal(true)
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
        <h2 className="text-3xl font-serif text-[#183b30] mt-1">All Hotels</h2>
        <p className="text-sm text-muted-foreground mt-1">Browse and view all registered hotels in the EventStay platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total hotels</p>
              <p className="mt-2 text-3xl font-semibold text-[#183b30]">{stats.total}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-[#e8f0eb] text-[#276247]">
              <Building2 className="size-5" />
            </span>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="mt-2 text-3xl font-semibold text-green-600">{stats.approved}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-green-100">
              <Star className="size-5 text-green-600" />
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
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="mt-2 text-3xl font-semibold text-red-600">{stats.rejected}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-red-100">
              <span className="text-red-600 text-lg">✕</span>
            </span>
          </div>
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h3 className="font-semibold text-[#183b30]">All registered hotels</h3>
            <p className="mt-1 text-xs text-muted-foreground">View details of all hotels in the system</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search hotels"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#276247] w-64"
            />
          </div>
        </div>

        {filteredHotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {filteredHotels.map((hotel) => (
              <div key={hotel.id} className="border rounded-xl p-4 hover:shadow-md transition">
                {/* Hotel Image */}
                {hotel.image && (
                  <div className="rounded-lg overflow-hidden aspect-video bg-gray-100 mb-4">
                    <img
                      src={`data:image/jpeg;base64,${hotel.image}`}
                      alt={hotel.hotelName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Hotel Info */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-[#183b30] text-lg">{hotel.hotelName}</h4>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        hotel.registrationStatus === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : hotel.registrationStatus === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {hotel.registrationStatus}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{hotel.description}</p>
                  </div>

                  <div className="space-y-2 pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="size-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-[#355047]">{hotel.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="size-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-[#355047]">{hotel.contactPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="size-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-[#355047] truncate">{hotel.email}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewDetails(hotel)}
                    className="w-full mt-4 py-2 px-4 bg-[#276247] text-white text-sm font-medium rounded-lg hover:bg-[#1a4a36] transition flex items-center justify-center gap-2"
                  >
                    <Eye className="size-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="size-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="font-semibold text-[#183b30]">No hotels found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-serif text-[#183b30]">Hotel Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Hotel Image */}
              {selectedHotel.image && (
                <div className="rounded-xl overflow-hidden aspect-video bg-gray-100">
                  <img
                    src={`data:image/jpeg;base64,${selectedHotel.image}`}
                    alt={selectedHotel.hotelName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Basic Info */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-2xl font-semibold text-[#183b30]">{selectedHotel.hotelName}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedHotel.registrationStatus === 'APPROVED'
                      ? 'bg-green-100 text-green-800'
                      : selectedHotel.registrationStatus === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedHotel.registrationStatus}
                  </span>
                </div>
                <p className="text-muted-foreground">{selectedHotel.description}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#e8f0eb] rounded-lg p-4">
                  <p className="text-xs text-muted-foreground uppercase mb-1 font-medium">Location</p>
                  <p className="font-semibold text-[#183b30]">{selectedHotel.city}</p>
                  <p className="text-sm text-[#355047] mt-1">{selectedHotel.address}</p>
                </div>

                <div className="bg-[#e8f0eb] rounded-lg p-4">
                  <p className="text-xs text-muted-foreground uppercase mb-1 font-medium">Contact Phone</p>
                  <p className="font-semibold text-[#183b30]">{selectedHotel.contactPhone}</p>
                </div>

                <div className="bg-[#e8f0eb] rounded-lg p-4">
                  <p className="text-xs text-muted-foreground uppercase mb-1 font-medium">Email</p>
                  <p className="font-semibold text-[#183b30] truncate">{selectedHotel.email}</p>
                </div>

                <div className="bg-[#e8f0eb] rounded-lg p-4">
                  <p className="text-xs text-muted-foreground uppercase mb-1 font-medium">Manager</p>
                  <p className="font-semibold text-[#183b30]">{selectedHotel.managerName}</p>
                </div>

                {selectedHotel.starRating && (
                  <div className="bg-[#e8f0eb] rounded-lg p-4">
                    <p className="text-xs text-muted-foreground uppercase mb-1 font-medium">Star Rating</p>
                    <div className="flex items-center gap-1">
                      {[...Array(selectedHotel.starRating)].map((_, i) => (
                        <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-[#e8f0eb] rounded-lg p-4">
                  <p className="text-xs text-muted-foreground uppercase mb-1 font-medium">Hotel ID</p>
                  <p className="font-semibold text-[#183b30]">#{selectedHotel.id}</p>
                </div>
              </div>

              {/* Amenities */}
              {selectedHotel.amenities && selectedHotel.amenities.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-[#183b30] mb-3">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedHotel.amenities.map((amenity, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registered:</span>
                  <span className="text-[#183b30] font-medium">
                    {new Date(selectedHotel.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                {selectedHotel.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="text-[#183b30] font-medium">
                      {new Date(selectedHotel.updatedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
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
