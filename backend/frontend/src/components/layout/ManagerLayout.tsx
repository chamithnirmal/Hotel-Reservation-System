import { Link, useNavigate } from 'react-router-dom'
import { 
  Building2, 
  LayoutDashboard, 
  Hotel, 
  Sparkles, 
  CircleDollarSign, 
  CalendarDays, 
  CalendarCheck, 
  Star, 
  BarChart3, 
  Bell, 
  Settings 
} from 'lucide-react'

interface ManagerLayoutProps {
  children: React.ReactNode
}

export default function ManagerLayout({ children }: ManagerLayoutProps) {
  const navigate = useNavigate()

  const menuItems = [
    { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { label: 'My hotel', path: '/manager/hotel', icon: Hotel },
    { label: 'Venues', path: '/manager/venues', icon: Building2 },
    { label: 'Packages', path: '/manager/packages', icon: Sparkles },
    { label: 'Pricing', path: '/manager/pricing', icon: CircleDollarSign },
    { label: 'Availability', path: '/manager/availability', icon: CalendarDays },
    { label: 'Reservations', path: '/manager/reservations', icon: CalendarCheck },
    { label: 'Reviews', path: '/manager/reviews', icon: Star },
    { label: 'Reports', path: '/manager/reports', icon: BarChart3 },
    { label: 'Notifications', path: '/manager/notifications', icon: Bell },
    { label: 'Profile', path: '/manager/profile', icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">
                Event<span className="text-amber-600">Stay</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 mt-2">Manager Workspace</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                DK
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">Dilshan Kapoor</p>
                <p className="text-xs text-gray-500 truncate">manager@eventstay.lk</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64 flex-1">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 h-16 flex items-center justify-between px-8">
          <div>
            <p className="text-xs text-gray-500">EventStay workspace</p>
            <h1 className="text-xl font-serif text-gray-900">Hotel</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-700">
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Exit
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
