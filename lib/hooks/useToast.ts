'use client'

import { useState, useCallback } from 'react'
import { Toast, ToastType } from '@/components/Toast'

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    duration?: number
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      type,
      message,
      duration
    }

    setToasts(prev => [...prev, newToast])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    showToast,
    dismissToast,
    dismissAll
  }
}
