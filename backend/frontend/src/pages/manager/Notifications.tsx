import { Bell, AlertCircle, CheckCircle, Info } from 'lucide-react'
import ManagerLayout from '@/components/layout/ManagerLayout'
import Badge from '@/components/ui/Badge'

export default function Notifications() {
  // Mock notifications - replace with real API data
  const notifications = [
    {
      id: 1,
      type: 'booking',
      title: 'New booking request',
      message: 'Jayani Wijesinghe requested Royal Ballroom for March 15, 2025',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'review',
      title: 'New review received',
      message: 'Customer left a 5-star review for your Lake Terrace venue',
      time: '5 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'approval',
      title: 'Hotel approved',
      message: 'Your hotel has been approved by EventStay admin',
      time: '1 day ago',
      read: true
    },
    {
      id: 4,
      type: 'info',
      title: 'Price update recommended',
      message: 'Peak season is approaching. Consider updating your pricing',
      time: '2 days ago',
      read: true
    }
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Bell className="w-5 h-5" />
      case 'review': return <CheckCircle className="w-5 h-5" />
      case 'approval': return <CheckCircle className="w-5 h-5" />
      default: return <Info className="w-5 h-5" />
    }
  }

  const getIconBg = (type: string) => {
    switch (type) {
      case 'booking': return 'bg-blue-100 text-blue-700'
      case 'review': return 'bg-green-100 text-green-700'
      case 'approval': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <ManagerLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-amber-700 uppercase tracking-wide font-medium mb-2">ALERTS</p>
          <h2 className="text-3xl font-serif text-gray-900 mb-2">Notifications</h2>
          <p className="text-gray-600">Stay updated on bookings, reviews, and important updates.</p>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconBg(notification.type)}`}>
                {getIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                <p className="text-xs text-gray-500">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (hidden when there are notifications) */}
        {notifications.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        )}
      </div>
    </ManagerLayout>
  )
}
