import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, Heart, MapPin, Search, Star, SlidersHorizontal, X } from 'lucide-react'
import { hotelService, HotelResponse } from '@/services'
import { eventPackageService, EventPackageResponse } from '@/services'
import Button from '@/components/ui/Button'
import authService from '@/services/authService'

const money = (n: number) => `LKR ${n.toLocaleString('en-LK')}`

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold text-[#19352c]">
      <span className="grid size-9 place-items-center rounded-xl bg-[#e8f0eb] text-[#276247]">
        <Building2 className="size-5" />
      </span>
      <span className="text-[19px]">
        Event<span className="text-[#b48643]">Stay</span>
      </span>
    </Link>
  )
}

function Rating({ v, n }: { v: number; n?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <Star className="size-4 fill-[#d8a84e] text-[#d8a84e]" />
      <b>{v}</b>
      {n && <span className="text-muted-foreground">({n})</span>}
    </span>
  )
}

function HotelCard({ hotel, onViewPackages }: { hotel: HotelResponse; onViewPackages: (hotel: HotelResponse) => void }) {
  const imgUrl = hotel.image 
    ? `data:image/jpeg;base64,${hotel.image}`
    : `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80`
  
  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[1.7]">
        <img src={imgUrl} alt={hotel.name} className="size-full object-cover" />
        <button className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-[#276247]" aria-label="Save venue">
          <Heart className="size-4" />
        </button>
      </div>
      <div className="p-4">
        <div className="flex justify-between gap-3">
          <div>
            <h3 className="font-semibold text-[#183b30]">{hotel.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {hotel.city}
            </p>
          </div>
          {hotel.starRating && (
            <Rating v={hotel.starRating} />
          )}
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{hotel.description}</p>
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <span className="text-xs text-muted-foreground">Verified venue</span>
          <button 
            onClick={() => onViewPackages(hotel)}
            className="text-sm font-semibold text-[#276247] hover:underline"
          >
            View packages <ArrowRight className="ml-1 inline size-4" />
          </button>
        </div>
      </div>
    </article>
  )
}

export default function Hotels() {
  const navigate = useNavigate()
  const [hotels, setHotels] = useState<HotelResponse[]>([])
  const [packages, setPackages] = useState<EventPackageResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedHotel, setSelectedHotel] = useState<HotelResponse | null>(null)
  const [showPackages, setShowPackages] = useState(false)
  const [searchEventType, setSearchEventType] = useState('Wedding')

  useEffect(() => {
    loadHotels()
  }, [])

  const loadHotels = async () => {
    try {
      setLoading(true)
      const hotelsData = await hotelService.getAllHotels()
      const packagesData = await eventPackageService.getAllPackages()
      setHotels(hotelsData)
      setPackages(packagesData)
      console.log('✅ Hotels loaded:', hotelsData.length)
      console.log('✅ Packages loaded:', packagesData.length)
    } catch (err: any) {
      console.error('❌ Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewPackages = (hotel: HotelResponse) => {
    setSelectedHotel(hotel)
    setShowPackages(true)
  }

  const hotelPackages = selectedHotel
    ? packages.filter(pkg => pkg.venueId === selectedHotel.id)
    : []

  const filteredPackages = hotelPackages.filter(pkg => 
    searchEventType === 'All' || pkg.eventType === searchEventType.toUpperCase()
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#276247]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Logo />
          <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
            <Link to="/">Home</Link>
            <Link className="font-semibold text-[#276247]" to="/hotels">
              Find a venue
            </Link>
          </nav>
          <button 
            onClick={() => {
              authService.logout()
              navigate('/')
            }}
            className="rounded-full border border-[#276247] px-4 py-2 text-sm font-semibold text-[#276247] hover:bg-[#e8f0eb]"
          >
            Sign out
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[.18em] text-[#b48643]">The EventStay collection</span>
            <h1 className="mt-3 font-serif text-5xl text-[#183b30]">Find your perfect venue</h1>
            <p className="mt-3 text-muted-foreground">{hotels.length} beautiful venues across Sri Lanka, ready to host your event.</p>
          </div>
        </div>

        <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
          {['All', 'Wedding', 'Birthday', 'Conference', 'Corporate', 'Anniversary'].map((x) => (
            <button
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
                searchEventType === x
                  ? 'border-[#276247] bg-[#e8f0eb] font-semibold text-[#276247]'
                  : 'bg-white text-muted-foreground hover:border-[#276247]'
              }`}
              key={x}
              onClick={() => setSearchEventType(x)}
            >
              {x}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.length > 0 ? (
            hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} onViewPackages={handleViewPackages} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No hotels available</p>
            </div>
          )}
        </div>
      </main>

      {/* Packages Modal */}
      {showPackages && selectedHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h2 className="text-2xl font-serif text-[#183b30]">{selectedHotel.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedHotel.city}</p>
              </div>
              <button 
                onClick={() => setShowPackages(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <h3 className="font-semibold text-lg text-[#183b30] mb-4">Event Packages</h3>
              
              {filteredPackages.length > 0 ? (
                <div className="space-y-4">
                  {filteredPackages.map((pkg) => (
                    <div key={pkg.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-[#183b30]">{pkg.packageName}</h4>
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                              {pkg.eventType}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                          
                          {pkg.includedFacilities && pkg.includedFacilities.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-[#355047] mb-2">Facilities:</p>
                              <div className="flex flex-wrap gap-2">
                                {pkg.includedFacilities.map((facility) => (
                                  <span key={facility.id} className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                                    {facility.facilityName}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-[#183b30]">{money(Number(pkg.basePrice))}</span>
                            <span className="text-sm text-muted-foreground">base price</span>
                          </div>
                        </div>
                        <Button 
                          onClick={() => navigate(`/booking/${pkg.id}`)}
                          variant="primary"
                          size="sm"
                          className="ml-4"
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No packages available for this event type</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
