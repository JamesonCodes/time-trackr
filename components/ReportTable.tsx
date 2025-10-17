'use client'

import React, { useState, useEffect } from 'react'
import { useEntries, useProjects } from '@/lib/db'
import { format, startOfWeek, endOfWeek, isWithinInterval, eachDayOfInterval, isSameDay } from 'date-fns'
import { Clock, TrendingUp, Calendar, FolderOpen } from 'lucide-react'

interface DaySummary {
  date: Date
  entries: any[]
  totalMinutes: number
  projectBreakdown: Record<string, { minutes: number; count: number }>
}

export default function ReportTable() {
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const [weekData, setWeekData] = useState<DaySummary[]>([])
  const [totalWeekMinutes, setTotalWeekMinutes] = useState(0)
  const [projectTotals, setProjectTotals] = useState<Record<string, number>>({})

  const entries = useEntries()
  const projects = useProjects()

  // Calculate week data when entries or selected week changes
  useEffect(() => {
    if (!entries) return

    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 0 })
    
    // Get entries for this week
    const weekEntries = entries.filter(entry => 
      entry.endTs && isWithinInterval(new Date(entry.startTs), { start: weekStart, end: weekEnd })
    )

    // Group by day
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
    const daySummaries: DaySummary[] = days.map(date => {
      const dayEntries = weekEntries.filter(entry => 
        isSameDay(new Date(entry.startTs), date)
      )

      const totalMinutes = dayEntries.reduce((total, entry) => {
        if (entry.endTs) {
          const start = new Date(entry.startTs)
          const end = new Date(entry.endTs)
          const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / 1000 / 60)
          return total + diffInMinutes
        }
        return total
      }, 0)

      const projectBreakdown: Record<string, { minutes: number; count: number }> = {}
      dayEntries.forEach(entry => {
        const projectId = entry.projectId || 'no-project'
        const projectName = projects?.find(p => p.id === projectId)?.name || 'No Project'
        
        if (!projectBreakdown[projectName]) {
          projectBreakdown[projectName] = { minutes: 0, count: 0 }
        }
        
        if (entry.endTs) {
          const start = new Date(entry.startTs)
          const end = new Date(entry.endTs)
          const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / 1000 / 60)
          projectBreakdown[projectName].minutes += diffInMinutes
        }
        projectBreakdown[projectName].count += 1
      })

      return {
        date,
        entries: dayEntries,
        totalMinutes,
        projectBreakdown
      }
    })

    setWeekData(daySummaries)

    // Calculate totals
    const totalMinutes = daySummaries.reduce((total, day) => total + day.totalMinutes, 0)
    setTotalWeekMinutes(totalMinutes)

    // Calculate project totals
    const projectTotals: Record<string, number> = {}
    daySummaries.forEach(day => {
      Object.entries(day.projectBreakdown).forEach(([projectName, data]) => {
        projectTotals[projectName] = (projectTotals[projectName] || 0) + data.minutes
      })
    })
    setProjectTotals(projectTotals)

  }, [entries, projects, selectedWeek])

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatDurationHours = (minutes: number) => {
    return (minutes / 60).toFixed(1)
  }

  const getProjectColor = (projectName: string) => {
    if (projectName === 'No Project') return '#6b7280'
    const project = projects?.find(p => p.name === projectName)
    return project?.color || '#6b7280'
  }

  if (!entries || entries.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '48px 24px',
        color: '#9ca3af'
      }}>
        <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
        <p style={{ fontSize: '16px', margin: 0 }}>
          No time entries found
        </p>
        <p style={{ fontSize: '14px', margin: '8px 0 0 0', opacity: 0.7 }}>
          Start tracking time to see your weekly reports
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: '#374151',
          border: '1px solid #4b5563',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <Clock size={20} style={{ color: '#3b82f6' }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#d1d5db'
            }}>
              Total Time
            </span>
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#f9fafb'
          }}>
            {formatDuration(totalWeekMinutes)}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#9ca3af'
          }}>
            {formatDurationHours(totalWeekMinutes)} hours
          </div>
        </div>

        <div style={{
          backgroundColor: '#374151',
          border: '1px solid #4b5563',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <FolderOpen size={20} style={{ color: '#10b981' }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#d1d5db'
            }}>
              Projects
            </span>
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#f9fafb'
          }}>
            {Object.keys(projectTotals).length}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#9ca3af'
          }}>
            active this week
          </div>
        </div>

        <div style={{
          backgroundColor: '#374151',
          border: '1px solid #4b5563',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <TrendingUp size={20} style={{ color: '#f59e0b' }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#d1d5db'
            }}>
              Daily Average
            </span>
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#f9fafb'
          }}>
            {formatDuration(Math.round(totalWeekMinutes / 7))}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#9ca3af'
          }}>
            per day
          </div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#f9fafb',
          margin: '0 0 16px 0'
        }}>
          Daily Breakdown
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {weekData.map((day, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                padding: '16px'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#f9fafb'
                  }}>
                    {format(day.date, 'EEEE, MMMM d')}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#9ca3af'
                  }}>
                    {day.entries.length} entries
                  </div>
                </div>
                <div style={{
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#f9fafb'
                  }}>
                    {formatDuration(day.totalMinutes)}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}>
                    {formatDurationHours(day.totalMinutes)}h
                  </div>
                </div>
              </div>

              {/* Project Breakdown */}
              {Object.keys(day.projectBreakdown).length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {Object.entries(day.projectBreakdown).map(([projectName, data]) => (
                    <div
                      key={projectName}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        backgroundColor: '#1f2937',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    >
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: getProjectColor(projectName)
                        }}
                      />
                      <span style={{ color: '#d1d5db' }}>
                        {projectName}
                      </span>
                      <span style={{ color: '#9ca3af' }}>
                        {formatDuration(data.minutes)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {day.totalMinutes === 0 && (
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  No time tracked
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Project Summary */}
      {Object.keys(projectTotals).length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#f9fafb',
            margin: '0 0 16px 0'
          }}>
            Project Summary
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {Object.entries(projectTotals)
              .sort(([,a], [,b]) => b - a)
              .map(([projectName, minutes]) => (
                <div
                  key={projectName}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: '#374151',
                    borderRadius: '6px'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: getProjectColor(projectName)
                      }}
                    />
                    <span style={{
                      fontSize: '14px',
                      color: '#f9fafb'
                    }}>
                      {projectName}
                    </span>
                  </div>
                  <div style={{
                    textAlign: 'right'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#f9fafb'
                    }}>
                      {formatDuration(minutes)}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#9ca3af'
                    }}>
                      {formatDurationHours(minutes)}h
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
