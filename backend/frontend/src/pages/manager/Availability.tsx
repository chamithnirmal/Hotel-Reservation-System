import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import venueService, { VenueResponse } from '@/services/venueService'
import hotelService from '@/services/hotelService'
import reservationService, { type ReservationResponse } from '@/services/reservationService'
import ManagerLayout from '@/components/layout/ManagerLayout'

interface CalendarDay {
  date: Date
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  reservations: ReservationResponse[]
  bookingCount: number
}

export default function Availability() {
  const [venues, setVenues] = useState<VenueResponse[]>([])
  const [selectedVenue, setSelectedVenue] = useState<VenueResponse | null>(null)
  const [selectedVenueName, setSelectedVenueName] = useState<string>('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState<ReservationResponse[]>([])
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadVenues()
  }, [])

  useEffect(() => {
    if (selectedVenue) {
      console.log(`Loading reservations for hotel ID: ${selectedVenue.hotelId}`)
      loadReservations()
    }
  }, [selectedVenue, currentMonth])

  useEffect(() => {
    generateCalendarDays()
  }, [reservations, currentMonth])

  const loadVenues = async () => {
    try {
      setLoading(true)
      setError('')

      const managerHotel = await hotelService.getManagerHotel()

      if (!managerHotel) {
        setError('No hotel found. Please create a hotel first.')
        setLoading(false)
        return
      }

      const data = await venueService.getVenuesByHotel(managerHotel.id)
      setVenues(data)
      
      if (data.length > 0) {
        setSelectedVenue(data[0])
        setSelectedVenueName(data[0].venueName)
      } else {
        setError('No venues found. Please create a venue first.')
      }
    } catch (err) {
      console.error('Failed to load venues:', err)
      setError('Failed to load venues')
    } finally {
      setLoading(false)
    }
  }

  const loadReservations = async () => {
    try {
      if (!selectedVenue) return
      const hotelReservations = await reservationService.getAllReservationsByHotel(selectedVenue.hotelId)
      console.log('Loaded reservations:', hotelReservations)
      setReservations(hotelReservations)
    } catch (err) {
      console.error('Failed to load reservations:', err)
      setError('Failed to load reservations')
    }
  }

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: CalendarDay[] = []

    // Add empty days for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -(startingDayOfWeek - i))
      days.push({
        date: prevDate,
        day: prevDate.getDate(),
        isCurrentMonth: false,
        isToday: false,
        reservations: [],
        bookingCount: 0
      })
    }

    // Add days of current month
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i, 0, 0, 0, 0)

      const dateYear = date.getFullYear()
      const dateMonth = String(date.getMonth() + 1).padStart(2, '0')
      const dateDay = String(date.getDate()).padStart(2, '0')
      const dateStr = `${dateYear}-${dateMonth}-${dateDay}`

      console.log(`Checking date: ${dateStr}`)

      // Find reservations for this date
      const dayReservations = reservations.filter(r => {
        const reservationDateStr = r.eventDate.split('T')[0]
        console.log(`  Comparing with reservation date: ${reservationDateStr}`)
        return reservationDateStr === dateStr
      })

      console.log(`  Found ${dayReservations.length} reservations for ${dateStr}`)

      const isToday = date.toDateString() === today.toDateString()

      days.push({
        date,
        day: i,
        isCurrentMonth: true,
        isToday,
        reservations: dayReservations,
        bookingCount: dayReservations.length
      })
    }

    // Add empty days for next month
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i)
      days.push({
        date: nextDate,
        day: i,
        isCurrentMonth: false,
        isToday: false,
        reservations: [],
        bookingCount: 0
      })
    }

    console.log('Calendar days generated:', days)
    setCalendarDays(days)
  }

  const handleVenueChange = (venueId: number) => {
    const venue = venues.find(v => v.id === venueId)
    if (venue) {
      setSelectedVenue(venue)
      setSelectedVenueName(venue.venueName)
    }
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayShorts = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Statistics
  const totalDays = 30
  const bookedDays = calendarDays.filter(d => d.isCurrentMonth && d.bookingCount > 0).length
  const availableDays = totalDays - bookedDays
  const bookingPercentage = totalDays > 0 ? Math.round((bookedDays / totalDays) * 100) : 0

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
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-amber-700 uppercase tracking-wide font-medium mb-2">CALENDAR</p>
          <h1 className="text-4xl font-serif text-[#183b30] mb-3">Venue Availability</h1>
          <p className="text-gray-600 text-lg">Manage and view your venue's availability calendar with real-time booking status.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Debug Info */}
        {reservations.length === 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">No Bookings Found</p>
              <p className="text-sm">Either no reservations exist for this venue or they may not have event dates assigned. Check browser console for debug logs.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            {/* Venue Selector */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <label className="block text-sm font-semibold text-[#183b30] mb-3">Select Venue</label>
              <select
                value={selectedVenue?.id || ''}
                onChange={(e) => handleVenueChange(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent font-medium"
              >
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>{venue.venueName}</option>
                ))}
              </select>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Calendar Header */}
              <div className="bg-gradient-to-r from-[#183b30] to-[#276247] px-6 py-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h2>
                  <p className="text-green-100 text-sm mt-1">{selectedVenueName}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={previousMonth}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {dayShorts.map((day) => (
                    <div key={day} className="text-center py-3">
                      <p className="text-xs font-bold text-[#276247] uppercase tracking-wide">{day}</p>
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((dayData, idx) => {
                    const isBooked = dayData.bookingCount > 0
                    const isSelected = selectedDate?.toDateString() === dayData.date.toDateString()

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(dayData.date)}
                        className={`
                          aspect-square flex flex-col items-center justify-center rounded-2xl border-2 text-sm font-semibold
                          transition-all cursor-pointer relative group
                          ${!dayData.isCurrentMonth ? 'opacity-30 cursor-default' : ''}
                          ${isBooked 
                            ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100' 
                            : dayData.isToday
                            ? 'bg-green-50 border-green-400 text-green-700 hover:bg-green-100'
                            : isSelected
                            ? 'bg-blue-50 border-blue-400 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-gray-300'}
                        `}
                        disabled={!dayData.isCurrentMonth}
                      >
                        <span className="text-lg">{dayData.day}</span>
                        {isBooked && (
                          <span className="text-xs mt-1 font-bold">{dayData.bookingCount} booking{dayData.bookingCount > 1 ? 's' : ''}</span>
                        )}
                        {dayData.isToday && !isBooked && (
                          <span className="text-xs mt-1 text-green-600">Today</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-50 border-2 border-green-400 rounded-lg" />
                  <span className="text-xs font-medium text-gray-700">Available / Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-50 border-2 border-red-300 rounded-lg" />
                  <span className="text-xs font-medium text-gray-700">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-50 border-2 border-blue-400 rounded-lg" />
                  <span className="text-xs font-medium text-gray-700">Selected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div>
            {/* Statistics Cards */}
            <div className="space-y-4 mb-6">
              {/* Occupancy */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-red-900">Occupancy</h3>
                  <Calendar className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-700">{bookingPercentage}%</p>
                <p className="text-xs text-red-600 mt-2">{bookedDays} of {totalDays} days booked</p>
              </div>

              {/* Available Days */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-green-900">Available Days</h3>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-700">{availableDays}</p>
                <p className="text-xs text-green-600 mt-2">Open for bookings this month</p>
              </div>
            </div>

            {/* Selected Date Details */}
            {selectedDate && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-[#183b30] mb-4">
                  {dayNames[selectedDate.getDay()]}, {selectedDate.toLocaleDateString()}
                </h3>

                {calendarDays.find(d => d.date.toDateString() === selectedDate.toDateString())?.reservations?.length ? (
                  <div className="space-y-3">
                    {calendarDays.find(d => d.date.toDateString() === selectedDate.toDateString())?.reservations?.map((res, idx) => (
                      <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="font-semibold text-red-900 text-sm">{res.eventName}</p>
                        <p className="text-xs text-red-700 mt-1">{res.customerName}</p>
                        <p className="text-xs text-red-600 mt-1">Status: <span className="font-bold uppercase">{res.status}</span></p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-green-700">Date is Available</p>
                    <p className="text-xs text-green-600 mt-1">No bookings on this date</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ManagerLayout>
  )
}
