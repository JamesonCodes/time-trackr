'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEntries, useProjects, useRunningEntry, entryService } from '@/lib/db'
import { useTimer } from '@/lib/hooks/useTimer'
import { formatDate, formatTime, formatDuration, calculateDuration } from '@/lib/utils/time'
import { Plus, Clock, FolderOpen, BarChart3, Settings } from 'lucide-react'
import EntryModal from './EntryModal'
import GroupedEntryList from './GroupedEntryList'
import CSVExportButton from './CSVExportButton'

export default function Dashboard() {
  const [showEntryModal, setShowEntryModal] = useState(false)
  const router = useRouter()

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

  const handleStatCardClick = (type: 'time' | 'projects' | 'entries') => {
    switch (type) {
      case 'time':
        router.push('/reports?filter=today')
        break
      case 'projects':
        router.push('/projects')
        break
      case 'entries':
        router.push('/reports?scrollTo=daily-breakdown')
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              {/* Mobile Header - Clean Layout */}
              <div className="block md:hidden">
                <div className="mb-4">
                  <h1 className="text-2xl font-bold text-gray-100 mb-1">
                    TimeTrackr
                  </h1>
                  <p className="text-sm text-gray-400">
                    Track your time locally and privately
                  </p>
                </div>
              </div>

              {/* Desktop Header - Original Layout */}
              <div className="hidden md:flex justify-between items-start">
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
            </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Today's Time Card */}
            <div 
              onClick={() => handleStatCardClick('time')}
              className="glass-card rounded-xl p-4 sm:p-5 cursor-pointer glass-hover"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 glass-tint-blue rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-blue-300 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                    Time Today
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-100 truncate">
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
            <div 
              onClick={() => handleStatCardClick('projects')}
              className="glass-card rounded-xl p-4 sm:p-5 cursor-pointer glass-hover"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 glass-tint-green rounded-lg flex items-center justify-center flex-shrink-0">
                  <FolderOpen size={18} className="text-green-300 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                    Projects
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-100">
                    {projects?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Entries Card */}
            <div 
              onClick={() => handleStatCardClick('entries')}
              className="glass-card rounded-xl p-4 sm:p-5 cursor-pointer glass-hover sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 glass-tint-purple rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 size={18} className="text-purple-300 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                    Entries
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-100">
                    {entries?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Running Timer Status */}
        {runningEntry && (
          <div className="glass-tint-green border border-green-600/30 rounded-lg p-4 mb-6 shadow-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-200">
                  Timer Running
                </h3>
                <p className="text-green-300">
                  {getProjectName(runningEntry.projectId)} • {runningEntry.note || 'No note'}
                </p>
              </div>
              <div className="text-2xl font-mono font-bold text-green-100 drop-shadow-lg">
                {timer.getFormattedElapsedTime()}
              </div>
            </div>
          </div>
        )}

            {/* Today's Entries Card */}
            <div 
              id="todays-entries" 
              className="glass-card rounded-xl mb-8"
            >
              {/* Card Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-gray-100">
                  Today's Entries
                </h2>
                
                {/* Add Entry Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowEntryModal(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 min-h-[44px] touch-manipulation"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add Entry</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>

              {/* Card Content */}
              <div className="px-6 pb-6">
                <GroupedEntryList 
                  dateFilter={today}
                />
              </div>
            </div>
      </div>

      {/* Entry Modal */}
      <EntryModal
        isOpen={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onEntryCreated={() => setShowEntryModal(false)}
      />
    </div>
  )
}
