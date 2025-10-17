'use client'

import { useState } from 'react'
import { useEntries, useProjects, useRunningEntry, entryService } from '@/lib/db'
import { useTimer } from '@/lib/hooks/useTimer'
import { formatDate, formatTime, formatDuration, calculateDuration } from '@/lib/utils/time'
import { Plus, Clock, FolderOpen } from 'lucide-react'
import EntryForm from './EntryForm'
import EntryList from './EntryList'

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
          
          <a
            href="/projects"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#374151',
              color: '#f9fafb',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              border: '1px solid #4b5563',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4b5563'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#374151'
            }}
          >
            <FolderOpen size={16} />
            Manage Projects
          </a>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
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

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FolderOpen className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Projects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {projects?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {entries?.length || 0}
                </p>
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
