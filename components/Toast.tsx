'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastProps {
  toast: Toast
  onDismiss: (id: string) => void
}

const ToastComponent = ({ toast, onDismiss }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const duration = toast.duration || 3000
    const timer = setTimeout(() => {
      handleDismiss()
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.duration])

  const handleDismiss = () => {
    setIsLeaving(true)
    setTimeout(() => onDismiss(toast.id), 200) // Wait for exit animation
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-400" />
      case 'error':
        return <XCircle size={20} className="text-red-400" />
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-400" />
      case 'info':
        return <Info size={20} className="text-blue-400" />
      default:
        return <Info size={20} className="text-blue-400" />
    }
  }

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'glass-tint-green border-green-600/30'
      case 'error':
        return 'glass-tint-red border-red-600/30'
      case 'warning':
        return 'glass-tint-amber border-yellow-600/30'
      case 'info':
        return 'glass-tint-blue border-blue-600/30'
      default:
        return 'glass-strong border-gray-600/30'
    }
  }

  return createPortal(
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-sm w-full transform transition-all duration-200 ease-out ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`${getBackgroundColor()} rounded-lg shadow-lg p-4 flex items-start gap-3 glass-enter`}
      >
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-100 break-words">
            {toast.message}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-200 transition-colors"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>,
    document.body
  )
}

export default ToastComponent
