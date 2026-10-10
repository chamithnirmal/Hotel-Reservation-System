import { useState } from 'react'
import { ToastMessage } from '@/components/ui/ToastContainer'

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (
    title: string,
    options?: {
      type?: 'success' | 'error' | 'warning' | 'info'
      message?: string
      duration?: number
    }
  ) => {
    const id = Date.now().toString()
    const toast: ToastMessage = {
      id,
      type: options?.type || 'info',
      title,
      message: options?.message,
      duration: options?.duration || 4000,
    }
    setToasts((prev) => [...prev, toast])
    return id
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const success = (title: string, message?: string) => {
    addToast(title, { type: 'success', message })
  }

  const error = (title: string, message?: string) => {
    addToast(title, { type: 'error', message })
  }

  const warning = (title: string, message?: string) => {
    addToast(title, { type: 'warning', message })
  }

  const info = (title: string, message?: string) => {
    addToast(title, { type: 'info', message })
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}
