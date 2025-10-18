'use client'

import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import EntryForm from './EntryForm'
import Toast from './Toast'
import { useToast } from '@/lib/hooks/useToast'

interface EntryModalProps {
  isOpen: boolean
  onClose: () => void
  onEntryCreated?: () => void
}

export default function EntryModal({ isOpen, onClose, onEntryCreated }: EntryModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const { toasts, showToast, dismissToast } = useToast()

  // Focus trap and ESC key handling
  useEffect(() => {
    if (!isOpen) return

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      const isTimePicker = (target as Element)?.closest('[data-time-picker]')
      const isDatePicker = (target as Element)?.closest('[data-date-picker]')
      const isProjectSelector = (target as Element)?.closest('[data-project-selector]')
      
      if (modalRef.current && !modalRef.current.contains(target) && !isTimePicker && !isDatePicker && !isProjectSelector) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    // Focus the modal
    modalRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
      
      // Return focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleEntryCreated = () => {
    showToast('✅ Entry added successfully', 'success')
    onEntryCreated?.()
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-strong rounded-xl shadow-2xl glass-enter"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600/50">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold text-gray-100">
              New Time Entry
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Manual Entry
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-100 hover:bg-gray-700 rounded-lg transition-colors duration-200"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <EntryForm
            onEntryCreated={handleEntryCreated}
            onCancel={onClose}
          />
        </div>
      </div>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={dismissToast}
        />
      ))}
    </div>,
    document.body
  )
}
