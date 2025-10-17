'use client'

import React, { useState, useEffect } from 'react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameWeek } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

export default function WeekSelector() {
  const [selectedWeek, setSelectedWeek] = useState(new Date())

  // Get the start and end of the selected week (Sunday to Saturday)
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 0 })

  const goToPreviousWeek = () => {
    setSelectedWeek(prev => subWeeks(prev, 1))
  }

  const goToNextWeek = () => {
    setSelectedWeek(prev => addWeeks(prev, 1))
  }

  const goToCurrentWeek = () => {
    setSelectedWeek(new Date())
  }

  const isCurrentWeek = isSameWeek(selectedWeek, new Date(), { weekStartsOn: 0 })

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px'
    }}>
      {/* Previous Week Button */}
      <button
        onClick={goToPreviousWeek}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 12px',
          backgroundColor: '#374151',
          color: '#f9fafb',
          border: '1px solid #4b5563',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#4b5563'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#374151'
        }}
      >
        <ChevronLeft size={16} />
        Previous
      </button>

      {/* Week Display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flex: 1,
        justifyContent: 'center'
      }}>
        <Calendar size={20} style={{ color: '#9ca3af' }} />
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#f9fafb',
            marginBottom: '2px'
          }}>
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#9ca3af'
          }}>
            Week of {format(weekStart, 'MMMM d, yyyy')}
          </div>
        </div>
      </div>

      {/* Next Week Button */}
      <button
        onClick={goToNextWeek}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 12px',
          backgroundColor: '#374151',
          color: '#f9fafb',
          border: '1px solid #4b5563',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#4b5563'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#374151'
        }}
      >
        Next
        <ChevronRight size={16} />
      </button>

      {/* Current Week Button */}
      {!isCurrentWeek && (
        <button
          onClick={goToCurrentWeek}
          style={{
            padding: '8px 12px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6'
          }}
        >
          This Week
        </button>
      )}
    </div>
  )
}
