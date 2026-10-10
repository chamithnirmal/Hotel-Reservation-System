import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  title: string
  message: string
  type?: 'confirm' | 'success' | 'error' | 'warning' | 'info'
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export default function Modal({
  isOpen,
  title,
  message,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
}: ModalProps) {
  if (!isOpen) return null

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✓',
          bgColor: 'bg-green-100',
          textColor: 'text-green-600',
          buttonColor: 'bg-green-600 hover:bg-green-700',
        }
      case 'error':
        return {
          icon: '✕',
          bgColor: 'bg-red-100',
          textColor: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-700',
        }
      case 'warning':
        return {
          icon: '!',
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-600',
          buttonColor: 'bg-amber-600 hover:bg-amber-700',
        }
      case 'confirm':
        return {
          icon: '?',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
        }
      default:
        return {
          icon: 'ℹ',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
        }
    }
  }

  const { icon, bgColor, textColor, buttonColor } = getIconAndColor()
  const showCancelButton = type === 'confirm' || type === 'warning'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-serif text-[#183b30]">{title}</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${bgColor}`}>
              <span className={`text-xl font-bold ${textColor}`}>{icon}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed flex-1">{message}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          {showCancelButton && (
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 px-4 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2 ${buttonColor}`}
          >
            {isLoading && (
              <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
