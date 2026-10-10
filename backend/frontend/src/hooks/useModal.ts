import { useState } from 'react'

export interface ModalConfig {
  isOpen: boolean
  title: string
  message: string
  type?: 'confirm' | 'success' | 'error' | 'warning' | 'info'
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
}

export function useModal(initialState?: Partial<ModalConfig>) {
  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isLoading: false,
    ...initialState,
  })

  const openModal = (config: Omit<ModalConfig, 'isOpen'>) => {
    setModal({
      ...config,
      isOpen: true,
    })
  }

  const closeModal = () => {
    setModal((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }

  const setLoading = (loading: boolean) => {
    setModal((prev) => ({
      ...prev,
      isLoading: loading,
    }))
  }

  const confirm = (title: string, message: string, confirmText = 'Confirm') => {
    openModal({
      title,
      message,
      type: 'confirm',
      confirmText,
    })
  }

  const warning = (title: string, message: string, confirmText = 'Proceed') => {
    openModal({
      title,
      message,
      type: 'warning',
      confirmText,
    })
  }

  const error = (title: string, message: string) => {
    openModal({
      title,
      message,
      type: 'error',
      confirmText: 'OK',
    })
  }

  return {
    modal,
    openModal,
    closeModal,
    setLoading,
    confirm,
    warning,
    error,
  }
}
