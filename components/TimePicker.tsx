'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface TimePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function TimePicker({ 
  value, 
  onChange, 
  placeholder = "Select time", 
  className = "",
  disabled = false 
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedColumn, setFocusedColumn] = useState<'hour' | 'minute' | 'period'>('hour')
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Parse current value
  const parseTime = (timeString: string) => {
    if (!timeString) return { hour: 12, minute: 0, period: 'AM' }
    
    const [time, period] = timeString.split(' ')
    const [hour, minute] = time.split(':').map(Number)
    
    return {
      hour: period === 'PM' && hour !== 12 ? hour + 12 : period === 'AM' && hour === 12 ? 0 : hour,
      minute: minute || 0,
      period: period || 'AM'
    }
  }

  const formatTime = (hour: number, minute: number, period: string) => {
    const displayHour = period === 'AM' && hour === 0 ? 12 : 
                       period === 'PM' && hour > 12 ? hour - 12 : 
                       period === 'AM' && hour === 12 ? 12 : hour
    return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`
  }

  const currentTime = parseTime(value)
  const [selectedTime, setSelectedTime] = useState(currentTime)

  // Update selected time when value changes externally
  useEffect(() => {
    setSelectedTime(parseTime(value))
  }, [value])

  // Generate options
  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = Array.from({ length: 60 }, (_, i) => i)
  const periods = ['AM', 'PM']

  const handleTimeChange = (type: 'hour' | 'minute' | 'period', newValue: number | string) => {
    const newTime = { ...selectedTime, [type]: newValue }
    setSelectedTime(newTime)
    
    const formattedTime = formatTime(
      type === 'hour' ? newValue as number : newTime.hour,
      type === 'minute' ? newValue as number : newTime.minute,
      type === 'period' ? newValue as string : newTime.period
    )
    
    onChange(formattedTime)
  }

  const handleScroll = (type: 'hour' | 'minute' | 'period', direction: 'up' | 'down') => {
    const current = selectedTime[type]
    let newValue: number | string = current

    if (type === 'hour') {
      newValue = direction === 'up' 
        ? (current as number) === 12 ? 1 : (current as number) + 1
        : (current as number) === 1 ? 12 : (current as number) - 1
    } else if (type === 'minute') {
      newValue = direction === 'up'
        ? (current as number) === 59 ? 0 : (current as number) + 1
        : (current as number) === 0 ? 59 : (current as number) - 1
    } else if (type === 'period') {
      newValue = current === 'AM' ? 'PM' : 'AM'
    }

    handleTimeChange(type, newValue)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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
      const dropdown = dropdownRef.current!
      
      // Position dropdown below the input
      dropdown.style.top = `${containerRect.bottom + 4}px`
      dropdown.style.left = `${containerRect.left}px`
      
      // Check if dropdown would go off-screen and adjust
      const dropdownRect = dropdown.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      
      // If dropdown goes below viewport, position it above the input
      if (dropdownRect.bottom > viewportHeight - 10) {
        dropdown.style.top = `${containerRect.top - dropdownRect.height - 4}px`
      }
      
      // If dropdown goes off right edge, align it to the right edge of input
      if (dropdownRect.right > viewportWidth - 10) {
        dropdown.style.left = `${containerRect.right - dropdownRect.width}px`
      }
      
      // If dropdown goes off left edge, align it to the left edge of input
      if (dropdownRect.left < 10) {
        dropdown.style.left = `${containerRect.left}px`
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

  const displayValue = value || placeholder

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
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="fixed z-[60] w-80 bg-gray-900/20 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl"
        >
          <div className="flex">
            {/* Hours Column */}
            <div className="flex-1 p-3 bg-white/5 rounded-l-xl">
              <div className="text-xs text-gray-300 text-center mb-3 font-medium tracking-wider">HOUR</div>
              <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    onClick={() => handleTimeChange('hour', hour)}
                    className={`
                      px-3 py-2 text-center text-sm rounded-lg cursor-pointer transition-all duration-200
                      ${selectedTime.hour === hour
                        ? 'bg-blue-500/80 text-white font-medium shadow-lg shadow-blue-500/25'
                        : 'text-gray-200 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    {hour.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div className="flex-1 p-3 bg-white/5 border-l border-white/10">
              <div className="text-xs text-gray-300 text-center mb-3 font-medium tracking-wider">MIN</div>
              <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {minutes.map((minute) => (
                  <div
                    key={minute}
                    onClick={() => handleTimeChange('minute', minute)}
                    className={`
                      px-3 py-2 text-center text-sm rounded-lg cursor-pointer transition-all duration-200
                      ${selectedTime.minute === minute
                        ? 'bg-blue-500/80 text-white font-medium shadow-lg shadow-blue-500/25'
                        : 'text-gray-200 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    {minute.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>

            {/* Period Column */}
            <div className="flex-1 p-3 bg-white/5 border-l border-white/10 rounded-r-xl">
              <div className="text-xs text-gray-300 text-center mb-3 font-medium tracking-wider">PERIOD</div>
              <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {periods.map((period) => (
                  <div
                    key={period}
                    onClick={() => handleTimeChange('period', period)}
                    className={`
                      px-3 py-2 text-center text-sm rounded-lg cursor-pointer transition-all duration-200
                      ${selectedTime.period === period
                        ? 'bg-blue-500/80 text-white font-medium shadow-lg shadow-blue-500/25'
                        : 'text-gray-200 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    {period}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-white/10 p-3 bg-white/5 rounded-b-xl">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const now = new Date()
                  const hour = now.getHours()
                  const minute = now.getMinutes()
                  const period = hour >= 12 ? 'PM' : 'AM'
                  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
                  handleTimeChange('hour', displayHour)
                  handleTimeChange('minute', minute)
                  handleTimeChange('period', period)
                }}
                className="flex-1 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium"
              >
                Now
              </button>
              <button
                onClick={() => {
                  const oneHourLater = new Date()
                  oneHourLater.setHours(oneHourLater.getHours() + 1)
                  const hour = oneHourLater.getHours()
                  const minute = oneHourLater.getMinutes()
                  const period = hour >= 12 ? 'PM' : 'AM'
                  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
                  handleTimeChange('hour', displayHour)
                  handleTimeChange('minute', minute)
                  handleTimeChange('period', period)
                }}
                className="flex-1 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium"
              >
                +1 Hour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
