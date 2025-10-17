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
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-100 mb-2">
                  TimeTrackr
                </h1>
                <p className="text-gray-400">
                  Track your time locally and privately
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Secondary Navigation - Lightweight */}
                <div className="flex gap-1">
                  <a
                    href="/reports"
                    className="px-3 py-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-700 text-sm font-normal rounded-md transition-all duration-200"
                  >
                    Reports
                  </a>
                  <a
                    href="/projects"
                    className="px-3 py-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-700 text-sm font-normal rounded-md transition-all duration-200"
                  >
                    Projects
                  </a>
                  <a
                    href="/settings"
                    className="px-3 py-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-700 text-sm font-normal rounded-md transition-all duration-200"
                  >
                    Settings
                  </a>
                </div>

                {/* Primary Action - Prominent */}
                <CSVExportButton 
                  variant="all"
                  className="px-4 py-2.5 text-sm font-medium"
                />
              </div>
            </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Today's Time Card */}
            <div className="flex-1 min-w-[200px] bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Clock size={20} className="text-blue-300" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                    Time Today
                  </p>
                  <p className="text-2xl font-bold text-gray-100">
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
            <div className="flex-1 min-w-[200px] bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg flex items-center justify-center">
                  <FolderOpen size={20} className="text-green-300" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                    Projects
                  </p>
                  <p className="text-2xl font-bold text-gray-100">
                    {projects?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Entries Card */}
            <div className="flex-1 min-w-[200px] bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 size={20} className="text-purple-300" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                    Entries
                  </p>
                  <p className="text-2xl font-bold text-gray-100">
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

            {/* Today's Entries Card */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm mb-8">
              {/* Card Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-gray-100">
                  Today's Entries
                </h2>
                
                {/* Add Manual Entry Button */}
                {!showManualEntry && (
                  <button
                    onClick={() => setShowManualEntry(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    <Plus size={16} />
                    Add Entry
                  </button>
                )}
              </div>

              {/* Card Content */}
              <div className="px-6 pb-6">
                {showManualEntry ? (
                  <div className="mt-4">
                    <EntryForm 
                      onEntryCreated={() => setShowManualEntry(false)}
                      onCancel={() => setShowManualEntry(false)}
                    />
                  </div>
                ) : (
                  <EntryList 
                    dateFilter={today}
                    showDateHeaders={false}
                  />
                )}
              </div>
            </div>
      </div>
    </div>
  )
}
