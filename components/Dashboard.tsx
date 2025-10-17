'use client'

import { useState } from 'react'
import { useEntries, useProjects, useRunningEntry, entryService } from '@/lib/db'
import { useTimer } from '@/lib/hooks/useTimer'
import { formatDate, formatTime, formatDuration, calculateDuration } from '@/lib/utils/time'
import { Plus, Clock, FolderOpen, BarChart3, Settings } from 'lucide-react'
import EntryForm from './EntryForm'
import EntryList from './EntryList'
import CSVExportButton from './CSVExportButton'

export default function Dashboard() {
  const [showManualEntry, setShowManualEntry] = useState(false)

  const entries = useEntries()
  const projects = useProjects()
  const runningEntry = useRunningEntry()
  const timer = useTimer()

  // Get today's entries
  const today = new Date().toISOString().split('T')[0]
  const todayEntries = entries?.filter(entry => 
    entry.startTs.startsWith(today)
  ) || []

  const getProjectName = (projectId?: string) => {
    if (!projectId) return 'No Project'
    const project = projects?.find(p => p.id === projectId)
    return project?.name || 'Unknown Project'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '32px'
            }}>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#f9fafb',
                  margin: '0 0 8px 0'
                }}>
                  TimeTrackr
                </h1>
                <p style={{
                  fontSize: '16px',
                  color: '#9ca3af',
                  margin: 0
                }}>
                  Track your time locally and privately
                </p>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                {/* Secondary Navigation - Lightweight */}
                <div style={{
                  display: 'flex',
                  gap: '4px'
                }}>
                  <a
                    href="/reports"
                    style={{
                      padding: '6px 12px',
                      color: '#9ca3af',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '400',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#f9fafb'
                      e.currentTarget.style.backgroundColor = '#374151'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9ca3af'
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    Reports
                  </a>
                  <a
                    href="/projects"
                    style={{
                      padding: '6px 12px',
                      color: '#9ca3af',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '400',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#f9fafb'
                      e.currentTarget.style.backgroundColor = '#374151'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9ca3af'
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    Projects
                  </a>
                  <a
                    href="/settings"
                    style={{
                      padding: '6px 12px',
                      color: '#9ca3af',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '400',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#f9fafb'
                      e.currentTarget.style.backgroundColor = '#374151'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9ca3af'
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    Settings
                  </a>
                </div>

                {/* Primary Action - Prominent */}
                <CSVExportButton 
                  variant="all"
                  style={{
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                />
              </div>
            </div>

        {/* Stats Cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {/* Desktop: Horizontal layout, Mobile: Vertical stack */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            {/* Today's Time Card */}
            <div style={{
              flex: '1',
              minWidth: '200px',
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  padding: '8px',
                  backgroundColor: '#1e40af',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock size={20} color="#60a5fa" />
                </div>
                <div>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#9ca3af',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Time Today
                  </p>
                  <p style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#f9fafb',
                    margin: 0
                  }}>
                    {formatDuration(todayEntries.reduce((total, entry) => {
                      if (entry.endTs) {
                        return total + calculateDuration(entry.startTs, entry.endTs)
                      }
                      return total
                    }, 0))}
                  </p>
                </div>
              </div>
            </div>

            {/* Projects Card */}
            <div style={{
              flex: '1',
              minWidth: '200px',
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  padding: '8px',
                  backgroundColor: '#059669',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FolderOpen size={20} color="#6ee7b7" />
                </div>
                <div>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#9ca3af',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Projects
                  </p>
                  <p style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#f9fafb',
                    margin: 0
                  }}>
                    {projects?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Entries Card */}
            <div style={{
              flex: '1',
              minWidth: '200px',
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  padding: '8px',
                  backgroundColor: '#7c3aed',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BarChart3 size={20} color="#c4b5fd" />
                </div>
                <div>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#9ca3af',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Entries
                  </p>
                  <p style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#f9fafb',
                    margin: 0
                  }}>
                    {entries?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Running Timer Status */}
        {runningEntry && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  Timer Running
                </h3>
                <p className="text-green-600 dark:text-green-400">
                  {getProjectName(runningEntry.projectId)} • {runningEntry.note || 'No note'}
                </p>
              </div>
              <div className="text-2xl font-mono font-bold text-green-800 dark:text-green-200">
                {timer.getFormattedElapsedTime()}
              </div>
            </div>
          </div>
        )}

        {/* Manual Entry Form */}
        {showManualEntry ? (
          <EntryForm 
            onEntryCreated={() => setShowManualEntry(false)}
            onCancel={() => setShowManualEntry(false)}
          />
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '32px'
          }}>
            <button
              onClick={() => setShowManualEntry(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <Plus size={16} />
              Add Manual Entry
            </button>
          </div>
        )}

        {/* Today's Entries */}
        <div style={{
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '8px',
          padding: '24px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#f9fafb',
            margin: '0 0 16px 0'
          }}>
            Today's Entries
          </h2>
          
          <EntryList 
            dateFilter={today}
            showDateHeaders={false}
          />
        </div>
      </div>
    </div>
  )
}
