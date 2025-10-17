'use client'

import React from 'react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameWeek } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface WeekSelectorProps {
  selectedWeek: Date
  onWeekChange: (date: Date) => void
}

export default function WeekSelector({ selectedWeek, onWeekChange }: WeekSelectorProps) {
  // Get the start and end of the selected week (Sunday to Saturday)
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 0 })

  const goToPreviousWeek = () => {
    onWeekChange(subWeeks(selectedWeek, 1))
  }

  const goToNextWeek = () => {
    onWeekChange(addWeeks(selectedWeek, 1))
  }

  const goToCurrentWeek = () => {
    onWeekChange(new Date())
  }

  const isCurrentWeek = isSameWeek(selectedWeek, new Date(), { weekStartsOn: 0 })

  // Calculate week number
  const getWeekNumber = (date: Date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)
  }

  const weekNumber = getWeekNumber(weekStart)

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {/* Previous Week Button */}
      <button
        onClick={goToPreviousWeek}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg text-xs sm:text-sm font-medium border border-gray-600 transition-colors duration-200"
        aria-label={`Previous week: ${format(subWeeks(weekStart, 1), 'MMM d')} - ${format(subWeeks(weekEnd, 1), 'MMM d, yyyy')}`}
      >
        <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </button>

      {/* Week Display - Clickable Date Block */}
      <button
        onClick={() => {
          // Reserve for week picker functionality
          console.log('Week picker clicked - functionality to be implemented')
        }}
        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg transition-colors duration-200 group min-w-0 flex-1 max-w-xs"
        aria-label={`Selected week: ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}. Activate to change week.`}
      >
        <Calendar size={16} className="text-gray-400 group-hover:text-gray-300 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
        <div className="text-center min-w-0 flex-1">
          {/* Primary: Date Range */}
          <div className="text-sm sm:text-lg font-bold text-gray-100 group-hover:text-white truncate">
            {format(weekStart, 'MMM d')}–{format(weekEnd, 'MMM d, yyyy')}
          </div>
          {/* Secondary: Helper Caption */}
          <div className="text-xs text-gray-400 group-hover:text-gray-300 truncate">
            <span className="hidden sm:inline">{format(weekStart, 'EEE')}–{format(weekEnd, 'EEE')} • </span>Week {weekNumber}
          </div>
        </div>
      </button>

      {/* Next Week Button */}
      <button
        onClick={goToNextWeek}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg text-xs sm:text-sm font-medium border border-gray-600 transition-colors duration-200"
        aria-label={`Next week: ${format(addWeeks(weekStart, 1), 'MMM d')} - ${format(addWeeks(weekEnd, 1), 'MMM d, yyyy')}`}
      >
        <span className="hidden sm:inline">Next</span>
        <span className="sm:hidden">Next</span>
        <ChevronRight size={14} className="sm:w-4 sm:h-4" />
      </button>

      {/* Current Week Button */}
      {!isCurrentWeek && (
        <button
          onClick={goToCurrentWeek}
          className="px-2 sm:px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
        >
          <span className="hidden sm:inline">This Week</span>
          <span className="sm:hidden">Today</span>
        </button>
      )}
    </div>
  )
}
