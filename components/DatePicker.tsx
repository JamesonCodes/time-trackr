'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns'

interface DatePickerProps {
  value: string // YYYY-MM-DD format
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Select date", 
  className = "",
  disabled = false 
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('top')
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Parse current value
  const selectedDate = value ? new Date(value) : null

  // Update current month when value changes
  useEffect(() => {
    if (value) {
      setCurrentMonth(new Date(value))
    }
  }, [value])

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const startDate = new Date(monthStart)
  startDate.setDate(startDate.getDate() - getDay(monthStart)) // Start from Sunday
  const endDate = new Date(monthEnd)
  endDate.setDate(endDate.getDate() + (6 - getDay(monthEnd))) // End on Saturday

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  const handleDateSelect = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd')
    onChange(formattedDate)
    setIsOpen(false)
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    handleDateSelect(today)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isDropdown = (target as Element)?.closest('[data-date-picker]')
      
      if (containerRef.current && !containerRef.current.contains(target) && !isDropdown) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update dropdown position when modal scrolls or resizes
  useEffect(() => {
    if (!isOpen || !dropdownRef.current || !containerRef.current) return

    const updatePosition = () => {
      const containerRect = containerRef.current!.getBoundingClientRect()
      
      // Check if dropdown would go off-screen and adjust position
      const dropdownHeight = 350 // Approximate dropdown height
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - containerRect.bottom
      const spaceAbove = containerRect.top
      
      // Add more buffer space to prevent overlap
      const bufferSpace = 20
      
      // Prefer top position (like time picker), fall back to bottom if not enough space above
      if (spaceAbove >= dropdownHeight + bufferSpace) {
        setDropdownPosition('top')
        dropdownRef.current!.style.top = 'auto'
        dropdownRef.current!.style.bottom = `${window.innerHeight - containerRect.top + bufferSpace}px`
      } else {
        setDropdownPosition('bottom')
        dropdownRef.current!.style.bottom = 'auto'
        dropdownRef.current!.style.top = `${containerRect.bottom + bufferSpace}px`
      }
      
      // Ensure dropdown doesn't go off the right edge and center when possible
      const dropdownWidth = 320 // Calendar width
      const spaceRight = window.innerWidth - containerRect.left
      
      // Try to center the dropdown relative to the input field
      const inputCenter = containerRect.left + (containerRect.width / 2)
      const idealLeft = inputCenter - (dropdownWidth / 2)
      
      // Check if centered position would fit
      if (idealLeft >= 10 && idealLeft + dropdownWidth <= window.innerWidth - 10) {
        dropdownRef.current!.style.left = `${idealLeft}px`
      } else if (spaceRight < dropdownWidth) {
        dropdownRef.current!.style.left = `${Math.max(10, containerRect.right - dropdownWidth)}px`
      } else {
        dropdownRef.current!.style.left = `${containerRect.left}px`
      }
    }

    updatePosition()
    
    // Update position on scroll and resize
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])

  const displayValue = value ? format(selectedDate!, 'MMM d, yyyy') : placeholder

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2 text-sm border rounded-lg cursor-pointer transition-colors
          ${disabled 
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700' 
            : 'bg-gray-800 text-gray-100 border-gray-600 hover:border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }
          ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <span className={value ? 'text-gray-100' : 'text-gray-400'}>
            {displayValue}
          </span>
          <div className="flex flex-col">
            <ChevronUp size={12} className="text-gray-400" />
            <ChevronDown size={12} className="text-gray-400 -mt-1" />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] w-80 glass-card rounded-xl shadow-2xl"
          data-date-picker
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToPreviousMonth()
              }}
              className="p-2 text-gray-400 hover:text-white hover:glass-subtle rounded-lg transition-all duration-200"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-100">
                {format(currentMonth, 'MMMM yyyy')}
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToNextMonth()
              }}
              className="p-2 text-gray-400 hover:text-white hover:glass-subtle rounded-lg transition-all duration-200"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-xs text-gray-400 text-center py-2 font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isToday = isSameDay(day, new Date())
                
                return (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDateSelect(day)
                    }}
                    className={`
                      w-8 h-8 text-sm rounded-lg transition-all duration-200 flex items-center justify-center
                      ${!isCurrentMonth 
                        ? 'text-gray-600 hover:bg-white/5' 
                        : isSelected
                          ? 'glass-tint-blue text-white font-medium shadow-lg shadow-blue-500/25'
                          : isToday
                            ? 'bg-blue-500/20 text-blue-300 font-medium hover:bg-blue-500/30'
                            : 'text-gray-200 hover:glass-subtle hover:text-white'
                      }
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-white/10 p-3 glass-subtle rounded-b-xl">
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToToday()
              }}
              className="w-full px-3 py-2 text-xs text-gray-300 hover:text-white hover:glass-subtle rounded-lg transition-all duration-200 font-medium"
            >
              Today
            </button>
          </div>
        </div>
        , document.body
      )}
    </div>
  )
}
