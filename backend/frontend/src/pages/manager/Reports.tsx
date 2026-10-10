import { useState, useEffect } from 'react'
import { Download, DollarSign, Building2, Calendar, Star } from 'lucide-react'
import ManagerLayout from '@/components/layout/ManagerLayout'
import Button from '@/components/ui/Button'
import hotelService from '@/services/hotelService'
import reservationService, { ReservationResponse } from '@/services/reservationService'
import reviewService from '@/services/reviewService'

const money = (n: number) => `LKR ${n.toLocaleString('en-LK')}`

export default function Reports() {
  const [loading, setLoading] = useState(true)
  const [hotelId, setHotelId] = useState<number | null>(null)
  const [reservations, setReservations] = useState<ReservationResponse[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const hotel = await hotelService.getManagerHotel()
      setHotelId(hotel.id)

      const reservationsData = await reservationService.getAllReservationsByHotel(hotel.id)
      setReservations(reservationsData)

      const reviewsData = await reviewService.getReviewsByHotel(hotel.id)
      setReviews(reviewsData)

      console.log('Loaded reservations:', reservationsData)
      console.log('Loaded reviews:', reviewsData)
    } catch (err: any) {
      console.error('Failed to load data:', err)
      setError(err.response?.data?.message || 'Failed to load reports data')
    } finally {
      setLoading(false)
    }
  }

  const completedReservations = reservations.filter(r => r.status === 'COMPLETED')
  const approvedReservations = reservations.filter(r => r.status === 'APPROVED')
  
  // Total revenue from completed reservations
  const grossRevenue = completedReservations.reduce((sum, r) => sum + r.totalPrice, 0)
  
  // Average rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1)
    : '0.0'
  
  // Booking conversion (completed / total)
  const bookingConversion = reservations.length > 0
    ? ((completedReservations.length / reservations.length) * 100).toFixed(1)
    : '0.0'

  // Occupancy rate (approved + completed / total)
  const occupancyRate = reservations.length > 0
    ? (((completedReservations.length + approvedReservations.length) / reservations.length) * 100).toFixed(1)
    : '0.0'

  // Revenue by event type
  const revenueByEventType: Record<string, number> = {}
  completedReservations.forEach(r => {
    const eventType = r.eventType // Use the actual eventType from the package
    revenueByEventType[eventType] = (revenueByEventType[eventType] || 0) + r.totalPrice
  })

  const revenueBreakdown = Object.entries(revenueByEventType)
    .map(([type, revenue]) => ({
      type,
      revenue,
      percentage: grossRevenue > 0 ? Math.round((revenue / grossRevenue) * 100) : 0
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4)

  // Monthly data (last 4 months)
  const getMonthData = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const currentMonth = new Date().getMonth()
    const monthlyData: any[] = []

    for (let i = 3; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const monthName = months[monthIndex]
      
      const monthReservations = reservations.filter(r => {
        const resDate = new Date(r.createdAt)
        return resDate.getMonth() === monthIndex
      })

      const monthCompleted = monthReservations.filter(r => r.status === 'COMPLETED')
      const monthRevenue = monthCompleted.reduce((sum, r) => sum + r.totalPrice, 0)
      const monthOccupancy = monthReservations.length > 0
        ? Math.round((monthCompleted.length / monthReservations.length) * 100)
        : 0

      monthlyData.push({
        month: monthName,
        reservations: monthReservations.length,
        revenue: monthRevenue,
        occupancy: monthOccupancy
      })
    }

    return monthlyData
  }

  const monthlyData = getMonthData()

  // Last 12 months chart data
  const getLast12MonthsData = () => {
    const months = []
    const currentMonth = new Date().getMonth()
    
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const monthReservations = reservations.filter(r => {
        const resDate = new Date(r.createdAt)
        return resDate.getMonth() === monthIndex
      })
      
      months.push(monthReservations.length)
    }
    
    // Normalize to percentages for chart
    const maxValue = Math.max(...months, 1)
    return months.map(count => Math.round((count / maxValue) * 100))
  }

  const chartData = getLast12MonthsData()

  const handleDownload = () => {
    // Create CSV content
    const csvContent = [
      ['Month', 'Reservations', 'Revenue', 'Occupancy'],
      ...monthlyData.map(row => [
        row.month,
        row.reservations,
        row.revenue,
        `${row.occupancy}%`
      ])
    ].map(row => row.join(',')).join('\n')

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hotel-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

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
      <div className="max-w-6xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-amber-700 uppercase tracking-wide font-medium mb-2">PERFORMANCE</p>
            <h2 className="text-3xl font-serif text-gray-900 mb-2">Reports & insights</h2>
            <p className="text-gray-600">Track revenue, occupancy, and booking trends across your property.</p>
          </div>
          <Button onClick={handleDownload} variant="primary">
            <Download className="w-4 h-4" />
            Download report
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-blue-700" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Gross revenue</p>
            <p className="text-2xl font-bold text-gray-900">{money(grossRevenue)}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-green-700" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Occupancy rate</p>
            <p className="text-2xl font-bold text-gray-900">{occupancyRate}%</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-purple-700" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Booking conversion</p>
            <p className="text-2xl font-bold text-gray-900">{bookingConversion}%</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-amber-700" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Guest satisfaction</p>
            <p className="text-2xl font-bold text-gray-900">{avgRating} / 5</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Booking Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Booking activity</h3>
              <p className="text-sm text-gray-600">Last 12 months</p>
            </div>

            {/* Simple Bar Chart */}
            <div className="flex items-end justify-between h-48 gap-2">
              {chartData.map((height, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2">
                  <div 
                    className="w-full bg-green-700 rounded-t"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                  <span className="text-xs text-gray-500">
                    {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Event Type */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by event type</h3>
            {revenueBreakdown.length > 0 ? (
              <div className="space-y-4">
                {revenueBreakdown.map((item) => (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{item.type}</span>
                      <span className="text-sm font-bold text-gray-900">{money(item.revenue)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-700 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No revenue data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Performance Table */}
        <div className="bg-white rounded-lg border border-gray-200 mt-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Monthly performance</h3>
            <p className="text-sm text-gray-600">Manage your EventStay inventory and operations</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MONTH
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RESERVATIONS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    REVENUE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    OCCUPANCY
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyData.length > 0 ? (
                  monthlyData.map((row) => (
                    <tr key={row.month} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.month}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{row.reservations}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{money(row.revenue)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{row.occupancy}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No data available yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ManagerLayout>
  )
}
