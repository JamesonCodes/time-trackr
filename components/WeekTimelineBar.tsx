'use client'

import React from 'react'
import { format } from 'date-fns'

interface DaySummary {
  date: Date
  totalMinutes: number
}

interface WeekTimelineBarProps {
  weekData: DaySummary[]
}

export default function WeekTimelineBar({ weekData }: WeekTimelineBarProps) {
  // Find max minutes for scaling
  const maxMinutes = Math.max(...weekData.map(day => day.totalMinutes), 1)
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div>
      {/* Bars Container */}
      <div className="flex items-end justify-between gap-2 px-4 py-6">
        {weekData.map((day, index) => {
          const heightPercentage = maxMinutes > 0 ? (day.totalMinutes / maxMinutes) * 100 : 0
          const minHeight = day.totalMinutes > 0 ? 8 : 0 // Minimum 8px if there's any time
          const barHeight = Math.max(minHeight, (heightPercentage / 100) * 60) // Max 60px
          
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-2 group"
            >
              {/* Bar */}
              <div className="relative w-full flex items-end justify-center" style={{ height: '60px' }}>
                <div
                  className="w-full rounded-t transition-all duration-300 group-hover:opacity-80 relative"
                  style={{
                    height: `${barHeight}px`,
                    background: day.totalMinutes > 0
                      ? 'linear-gradient(to top, #3b82f6, #60a5fa)'
                      : '#374151'
                  }}
                >
                  {/* Tooltip on hover */}
                  {day.totalMinutes > 0 && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10 shadow-lg">
                      {format(day.date, 'EEEE')} — {formatDuration(day.totalMinutes)}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Day Label */}
              <div className="text-xs font-medium text-gray-400">
                {format(day.date, 'EEE')[0]}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Day Labels Row */}
      <div className="flex justify-between gap-2 px-4">
        {weekData.map((day, index) => (
          <div key={index} className="flex-1 text-center">
            <div className="text-xs text-gray-500">
              {format(day.date, 'EEE')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

