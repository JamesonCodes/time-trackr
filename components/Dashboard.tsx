'use client'

import { useState } from 'react'
import { useEntries, useProjects, useRunningEntry, entryService } from '@/lib/db'
import { useTimer } from '@/lib/hooks/useTimer'
import { formatDate, formatTime, formatDuration, calculateDuration } from '@/lib/utils/time'
import { Plus, Clock, FolderOpen } from 'lucide-react'

export default function Dashboard() {
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualEntry, setManualEntry] = useState({
    projectId: '',
    startTime: '',
    endTime: '',
    note: ''
  })

  const entries = useEntries()
  const projects = useProjects()
  const runningEntry = useRunningEntry()
  const timer = useTimer()

  // Get today's entries
  const today = new Date().toISOString().split('T')[0]
  const todayEntries = entries?.filter(entry => 
    entry.startTs.startsWith(today)
  ) || []

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!manualEntry.startTime || !manualEntry.endTime) {
      alert('Please fill in both start and end times')
      return
    }

    const startTs = new Date(`${today}T${manualEntry.startTime}`).toISOString()
    const endTs = new Date(`${today}T${manualEntry.endTime}`).toISOString()

    if (endTs <= startTs) {
      alert('End time must be after start time')
      return
    }

    try {
      await entryService.create({
        projectId: manualEntry.projectId || undefined,
        startTs,
        endTs,
        note: manualEntry.note || undefined,
        source: 'manual'
      })

      setManualEntry({
        projectId: '',
        startTime: '',
        endTime: '',
        note: ''
      })
      setShowManualEntry(false)
    } catch (error) {
      console.error('Failed to create manual entry:', error)
    }
  }

  const getProjectName = (projectId?: string) => {
    if (!projectId) return 'No Project'
    const project = projects?.find(p => p.id === projectId)
    return project?.name || 'Unknown Project'
  }

  const getProjectColor = (projectId?: string) => {
    if (!projectId) return '#6B7280'
    const project = projects?.find(p => p.id === projectId)
    return project?.color || '#6B7280'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            TimeTrackr
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your time locally and privately
          </p>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Manual Entry
              </h2>
              <button
                onClick={() => setShowManualEntry(!showManualEntry)}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{showManualEntry ? 'Cancel' : 'Add Entry'}</span>
              </button>
            </div>

            {showManualEntry && (
              <form onSubmit={handleManualEntry} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Project
                    </label>
                    <select
                      value={manualEntry.projectId}
                      onChange={(e) => setManualEntry(prev => ({ ...prev, projectId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">No Project</option>
                      {projects?.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Note
                    </label>
                    <input
                      type="text"
                      value={manualEntry.note}
                      onChange={(e) => setManualEntry(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="Optional note..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={manualEntry.startTime}
                      onChange={(e) => setManualEntry(prev => ({ ...prev, startTime: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={manualEntry.endTime}
                      onChange={(e) => setManualEntry(prev => ({ ...prev, endTime: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowManualEntry(false)}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                  >
                    Add Entry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Today's Entries */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Today's Entries
            </h2>
            
            {todayEntries.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No entries for today. Start a timer or add a manual entry!
              </p>
            ) : (
              <div className="space-y-3">
                {todayEntries.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getProjectColor(entry.projectId) }}
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {getProjectName(entry.projectId)}
                        </p>
                        {entry.note && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatTime(entry.startTs)} - {entry.endTs ? formatTime(entry.endTs) : 'Running'}
                      </p>
                      <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                        {entry.endTs ? formatDuration(calculateDuration(entry.startTs, entry.endTs)) : 'Running...'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
