import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ToastProps {
  id: string
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

export default function Toast({
  id,
  type = 'info',
  title,
  message,
  duration = 4000,
  onClose,
}: ToastProps) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true)
      setTimeout(() => onClose(id), 200)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-800',
          icon: <CheckCircle className="size-5 text-green-600" />,
        }
      case 'error':
        return {
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          icon: <AlertCircle className="size-5 text-red-600" />,
        }
      case 'warning':
        return {
          bgColor: 'bg-amber-50 border-amber-200',
          textColor: 'text-amber-800',
          icon: <AlertTriangle className="size-5 text-amber-600" />,
        }
      default:
        return {
          bgColor: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800',
          icon: <Info className="size-5 text-blue-600" />,
        }
    }
  }

  const { bgColor, textColor, icon } = getStyles()

  return (
    <div
      className={`${bgColor} border rounded-lg p-4 shadow-lg transition-all duration-200 ${
        isClosing ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1">
          <h3 className={`font-semibold ${textColor}`}>{title}</h3>
          {message && (
            <p className={`text-sm mt-1 ${textColor} opacity-90`}>{message}</p>
          )}
        </div>
        <button
          onClick={() => {
            setIsClosing(true)
            setTimeout(() => onClose(id), 200)
          }}
          className={`p-1 hover:bg-white/50 rounded transition`}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
