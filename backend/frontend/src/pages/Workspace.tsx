import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CalendarCheck,
  CircleDollarSign,
  Clock3,
  Heart,
  Hotel,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import { mockHotels, mockReservations } from '@/lib/mock-data'
import type { UserRole } from '@/lib/types'
import HotelVerification from './admin/HotelVerification'
import AllHotels from './admin/AllHotels'
import AdminUsers from './admin/Users'
import AdminReservations from './admin/Reservations'
import AdminReports from './admin/Reports'
import hotelService from '@/services/hotelService'
import reservationService, { type ReservationResponse } from '@/services/reservationService'
import reviewService, { type ReviewResponse } from '@/services/reviewService'
import userService, { type UserResponse } from '@/services/userService'

const money = (n: number) => `LKR ${n.toLocaleString('en-LK')}`

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold text-[#183b30]">
      <span className="grid size-10 place-items-center rounded-lg bg-[#16a34a] text-white">
        <Building2 className="size-5" />
      </span>
      <span className="text-[20px]">
        Event<span className="text-[#f59e0b]">Stay</span>
      </span>
    </Link>
  )
}

function Badge({ children, tone = 'green' }: { children: React.ReactNode; tone?: string }) {
  const c = tone === 'gold' ? 'bg-[#fbf0d9] text-[#87611f]' : tone === 'blue' ? 'bg-[#e7eef8] text-[#315d91]' : tone === 'red' ? 'bg-[#f9e8e5] text-[#9e4037]' : 'bg-[#e7f3ec] text-[#276247]'
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${c}`}>{children}</span>
}

function Sidebar({ role }: { role: UserRole }) {
  const items =
    role === 'customer'
      ? [
          ['Dashboard', '/customer/dashboard', LayoutDashboard],
          ['Discover venues', '/customer/hotels', Search],
          ['My reservations', '/customer/reservations', CalendarCheck],
          ['Favorites', '/customer/favorites', Heart],
          ['My reviews', '/customer/reviews', Star],
          ['Notifications', '/customer/notifications', Bell],
          ['Profile settings', '/customer/profile', Settings],
        ]
      : role === 'manager'
        ? [
            ['Dashboard', '/manager/dashboard', LayoutDashboard],
            ['My hotel', '/manager/hotel', Hotel],
            ['Venues', '/manager/venues', Building2],
            ['Packages', '/manager/packages', Sparkles],
            ['Pricing', '/manager/pricing', CircleDollarSign],
            ['Availability', '/manager/availability', CalendarDays],
            ['Reservations', '/manager/reservations', CalendarCheck],
            ['Reviews', '/manager/reviews', Star],
            ['Reports', '/manager/reports', BarChart3],
            ['Notifications', '/manager/notifications', Bell],
            ['Profile', '/manager/profile', Settings],
          ]
        : [
            ['Overview', '/admin/dashboard', LayoutDashboard],
            ['Hotel verification', '/admin/verification', ShieldCheck],
            ['All hotels', '/admin/all-hotels', Hotel],
            ['Users', '/admin/users', Users],
            ['Reservations', '/admin/reservations', CalendarCheck],
            ['Reports', '/admin/reports', BarChart3],
            ['Activity log', '/admin/activity', Clock3],
            ['Settings', '/admin/settings', Settings],
          ]

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b p-6">
          <Logo />
          <p className="mt-2 text-[13px] capitalize text-gray-500">Manager Workspace</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {items.map(([t, p, I]: any) => (
            <Link
              key={p}
              to={p}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <I className="size-[18px]" />
              {t}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
              {role === 'customer' ? 'JW' : role === 'manager' ? 'DK' : 'AU'}
            </div>
            <div className="flex-1 min-w-0">
              <b className="block text-sm text-gray-900 truncate">
                {role === 'customer' ? 'Jayani Wijesinghe' : role === 'manager' ? 'Dilshan Kapoor' : 'Admin User'}
              </b>
              <span className="text-xs text-gray-500 truncate block">manager@eventstay.lk</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <span className="grid size-10 place-items-center rounded-xl bg-[#e8f0eb] text-[#276247]">
        <Icon className="size-5" />
      </span>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#183b30]">{value}</p>
    </div>
  )
}

function Chart({ reservations }: { reservations: ReservationResponse[] }) {
  const now = new Date()
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
    const month = monthDate.getMonth()
    const year = monthDate.getFullYear()
    
    const count = reservations.filter((r) => {
      const eventDate = new Date(r.eventDate)
      return eventDate.getMonth() === month && eventDate.getFullYear() === year
    }).length
    
    return {
      label: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][month],
      count,
      isCurrentMonth: month === now.getMonth() && year === now.getFullYear(),
    }
  })
  
  // Find max count for scaling (minimum 1 to avoid division by zero)
  const maxCount = Math.max(...monthlyData.map(d => d.count), 1)
  
  return (
    <div className="rounded-2xl border bg-white p-5">
      <h3 className="font-semibold text-[#183b30]">Booking activity</h3>
      <p className="mt-1 text-xs text-muted-foreground">Last 12 months</p>
      <div className="mt-8 flex h-40 items-end gap-2">
        {monthlyData.map((data, i) => {
          const heightPercent = data.count === 0 ? 10 : 20 + (data.count / maxCount) * 80
          
          return (
            <div key={i} className="flex flex-1 flex-col justify-end gap-2 relative group">
              <div
                style={{ height: `${heightPercent}%` }}
                className={`rounded-t-md transition-all ${data.isCurrentMonth ? 'bg-[#b48643]' : 'bg-[#c9ded0]'} hover:opacity-80`}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap left-1/2 -translate-x-1/2 z-10">
                {data.count} booking{data.count !== 1 ? 's' : ''}
              </div>
              <span className="text-center text-[10px] text-muted-foreground">{data.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Dashboard({ role }: { role: UserRole }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState<ReservationResponse[]>([])
  const [reviews, setReviews] = useState<ReviewResponse[]>([])
  const [hotels, setHotels] = useState<any[]>([])
  const [users, setUsers] = useState<UserResponse[]>([])
  const [stats, setStats] = useState({
    totalReservations: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    upcomingEvents: 0,
    totalHotels: 0,
    activeCustomers: 0,
    pendingVerification: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        if (role === 'manager') {
          // Fetch manager's hotel
          const hotel = await hotelService.getManagerHotel()
          
          // Fetch reservations for this hotel
          const allReservations = await reservationService.getAllReservationsByHotel(hotel.id)
          setReservations(allReservations)
          
          // Fetch reviews for this hotel
          const hotelReviews = await reviewService.getReviewsByHotel(hotel.id)
          setReviews(hotelReviews)
          
          const totalReservations = allReservations.length
          
          const now = new Date()
          const currentMonth = now.getMonth()
          const currentYear = now.getFullYear()
          const monthlyRevenue = allReservations
            .filter((r) => {
              if (r.status !== 'COMPLETED') return false
              const eventDate = new Date(r.eventDate)
              return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
            })
            .reduce((sum, r) => sum + r.totalPrice, 0)
          
          const averageRating = hotelReviews.length > 0
            ? hotelReviews.reduce((sum, r) => sum + r.rating, 0) / hotelReviews.length
            : 0
          
          // Count upcoming events (approved and pending)
          const upcomingEvents = allReservations.filter((r) => {
            const eventDate = new Date(r.eventDate)
            return eventDate >= now && (r.status === 'PENDING' || r.status === 'APPROVED')
          }).length
          
          setStats({
            totalReservations,
            monthlyRevenue,
            averageRating,
            upcomingEvents,
            totalHotels: 0,
            activeCustomers: 0,
            pendingVerification: 0,
          })
        } else if (role === 'admin') {
          // Fetch all hotels
          const allHotels = await hotelService.getAllHotels()
          setHotels(allHotels)
          
          // Fetch all users
          const allUsers = await userService.getAllUsers()
          setUsers(allUsers)
          
          // Fetch all reservations
          const allReservations = await reservationService.getAllReservations()
          setReservations(allReservations)
          
          const totalHotels = allHotels.length
          const activeCustomers = allUsers.filter(u => u.role === 'CUSTOMER' && u.isActive).length
          const totalReservations = allReservations.length
          const pendingVerification = allHotels.filter(h => h.registrationStatus === 'PENDING').length
          
          setStats({
            totalReservations,
            monthlyRevenue: 0,
            averageRating: 0,
            upcomingEvents: 0,
            totalHotels,
            activeCustomers,
            pendingVerification,
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [role])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  const now = new Date()
  const upcomingReservations = role === 'manager' 
    ? reservations
        .filter((r) => {
          const eventDate = new Date(r.eventDate)
          return eventDate >= now && (r.status === 'PENDING' || r.status === 'APPROVED')
        })
        .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
        .slice(0, 3)
    : []
  
  const recentHotels = role === 'admin'
    ? hotels
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    : []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h2 className="mt-1 font-serif text-3xl text-[#183b30]">
          {role === 'customer'
            ? 'Make room for something memorable.'
            : role === 'manager'
              ? 'Good morning, Manager.'
              : 'Platform overview'}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(role === 'customer'
          ? [
              ['Upcoming events', '2', CalendarDays],
              ['Saved venues', '8', Heart],
              ['Completed events', '6', Award],
            ]
          : role === 'manager'
            ? [
                ['Total reservations', stats.totalReservations.toString(), CalendarCheck],
                ['This month revenue', `LKR ${stats.monthlyRevenue.toLocaleString('en-LK')}`, CircleDollarSign],
                ['Upcoming events', stats.upcomingEvents.toString(), Building2],
                ['Average rating', stats.averageRating.toFixed(1), Star],
              ]
            : [
                ['Total hotels', stats.totalHotels.toString(), Hotel],
                ['Active customers', stats.activeCustomers.toString(), Users],
                ['Total reservations', stats.totalReservations.toString(), CalendarCheck],
                ['Pending verification', stats.pendingVerification.toString(), Clock3],
              ]
        ).map(([l, v, I]: any) => (
          <Stat key={l} label={l} value={v} icon={I} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        {role !== 'customer' && <Chart reservations={reservations} />}
        <div className="rounded-2xl bg-[#193e31] p-6 text-white">
          <Sparkles className="size-6 text-[#d8b87a]" />
          <h3 className="mt-5 font-serif text-2xl">
            {role === 'customer' ? 'Need a little inspiration?' : role === 'manager' ? 'Make your next decision count.' : 'Platform insights at a glance.'}
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/70">
            {role === 'admin' 
              ? 'Monitor hotel performance, manage verifications, and keep the platform running smoothly.'
              : 'Explore insights, manage reservations, and keep every detail beautifully on track.'}
          </p>
          <button
            onClick={() =>
              navigate(role === 'customer' ? '/hotels' : role === 'manager' ? '/manager/reservations' : '/admin/verification')
            }
            className="mt-6 inline-block rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#193e31]"
          >
            Open workspace <ArrowRight className="ml-1 inline size-4" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white">
        <div className="flex items-center justify-between border-b p-5">
          <h3 className="font-semibold text-[#183b30]">
            {role === 'customer' ? 'Upcoming reservations' : role === 'manager' ? 'Upcoming reservations' : 'Recent hotels'}
          </h3>
          <Link 
            to={role === 'customer' ? '/customer/reservations' : role === 'manager' ? '/manager/reservations' : '/admin/all-hotels'} 
            className="text-sm font-semibold text-[#276247]"
          >
            View all
          </Link>
        </div>
        {role === 'admin' ? (
          recentHotels.length === 0 ? (
            <div className="p-5 text-center text-sm text-muted-foreground">
              No hotels registered yet
            </div>
          ) : (
            recentHotels.map((hotel) => (
              <div key={hotel.id} className="flex flex-wrap items-center gap-4 border-b p-5 last:border-0">
                <span className={`grid size-10 place-items-center rounded-xl ${
                  hotel.registrationStatus === 'PENDING' 
                    ? 'bg-[#fef8e7] text-[#87611f]' 
                    : hotel.registrationStatus === 'APPROVED'
                    ? 'bg-[#e8f0eb] text-[#276247]'
                    : 'bg-[#f9e8e5] text-[#9e4037]'
                }`}>
                  <Hotel className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <b className="text-sm text-[#183b30]">{hotel.name}</b>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {hotel.city} · Manager: {hotel.managerName}
                  </p>
                </div>
                <Badge tone={
                  hotel.registrationStatus === 'PENDING' 
                    ? 'gold' 
                    : hotel.registrationStatus === 'APPROVED' 
                    ? 'green' 
                    : 'red'
                }>
                  {hotel.registrationStatus.toLowerCase()}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="size-3 fill-current text-[#f59e0b]" />
                  <span>{hotel.starRating}</span>
                </div>
                <button 
                  onClick={() => navigate('/admin/all-hotels')}
                  className="rounded-lg p-2 hover:bg-muted"
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>
            ))
          )
        ) : upcomingReservations.length === 0 ? (
          <div className="p-5 text-center text-sm text-muted-foreground">
            No upcoming reservations
          </div>
        ) : (
          upcomingReservations.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-4 border-b p-5 last:border-0">
              <span className="grid size-10 place-items-center rounded-xl bg-[#eef4ef] text-[#276247]">
                <CalendarDays className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <b className="text-sm text-[#183b30]">{r.eventName}</b>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.hotelName} · {new Date(r.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <Badge tone={r.status === 'PENDING' ? 'gold' : r.status === 'APPROVED' ? 'green' : r.status === 'REJECTED' ? 'red' : 'blue'}>
                {r.status.toLowerCase()}
              </Badge>
              <b className="text-sm text-[#183b30]">{money(r.totalPrice)}</b>
              <button className="rounded-lg p-2 hover:bg-muted">
                <ArrowRight className="size-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function Workspace({ role, adminPage }: { role: UserRole; adminPage?: string }) {
  return (
    <div className="flex min-h-screen bg-[#fbfaf7]">
      <Sidebar role={role} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden">
              <Menu className="size-5" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground">EventStay workspace</p>
              <h1 className="font-serif text-xl capitalize text-[#183b30]">
                {adminPage === 'hotels' 
                  ? 'hotel verification' 
                  : adminPage === 'all-hotels' 
                  ? 'all hotels' 
                  : adminPage === 'users'
                  ? 'user management'
                  : adminPage === 'reservations'
                  ? 'reservations'
                  : adminPage === 'reports'
                  ? 'platform reports'
                  : `${role} dashboard`}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Bell className="size-5 text-muted-foreground" />
            <Link to="/" className="text-sm text-muted-foreground">
              Exit
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 md:p-8">
          {adminPage === 'hotels' ? (
            <HotelVerification />
          ) : adminPage === 'all-hotels' ? (
            <AllHotels />
          ) : adminPage === 'users' ? (
            <AdminUsers />
          ) : adminPage === 'reservations' ? (
            <AdminReservations />
          ) : adminPage === 'reports' ? (
            <AdminReports />
          ) : (
            <Dashboard role={role} />
          )}
        </main>
      </div>
    </div>
  )
}
