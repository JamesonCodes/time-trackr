'use client'

import React, { useState, useEffect } from 'react'
import { useEntries, useProjects, entryService } from '@/lib/db'
import { format, startOfWeek, endOfWeek, isWithinInterval, eachDayOfInterval, isSameDay } from 'date-fns'
import { calculateDuration } from '@/lib/utils/time'
import { Clock, TrendingUp, Calendar, ChevronDown, ChevronRight, Edit, Trash2 } from 'lucide-react'
import WeekSelector from './WeekSelector'
import WeekTimelineBar from './WeekTimelineBar'

interface DaySummary {
  date: Date
  entries: any[]
  totalMinutes: number
  projectBreakdown: Record<string, { minutes: number; count: number }>
}

interface ReportTableProps {
  selectedWeek: Date
  onWeekChange: (date: Date) => void
  selectedProject: string
  onProjectChange: (projectId: string) => void
}

export default function ReportTable({ selectedWeek, onWeekChange, selectedProject, onProjectChange }: ReportTableProps) {
  const [weekData, setWeekData] = useState<DaySummary[]>([])
  const [totalWeekMinutes, setTotalWeekMinutes] = useState(0)
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({
    startTime: '',
    endTime: '',
    note: '',
    projectId: ''
  })

  const entries = useEntries()
  const projects = useProjects()

  // Calculate week data when entries or selected week changes
  useEffect(() => {
    if (!entries) return

    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 0 })
    
    // Get entries for this week
    let weekEntries = entries.filter(entry => 
      entry.endTs && isWithinInterval(new Date(entry.startTs), { start: weekStart, end: weekEnd })
    )

    // Filter by selected project
    if (selectedProject !== 'all') {
      if (selectedProject === 'no-project') {
        weekEntries = weekEntries.filter(entry => !entry.projectId)
      } else {
        weekEntries = weekEntries.filter(entry => entry.projectId === selectedProject)
      }
    }

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

    setWeekData(daySummaries.reverse())

    // Calculate totals
    const totalMinutes = daySummaries.reduce((total, day) => total + day.totalMinutes, 0)
    setTotalWeekMinutes(totalMinutes)

  }, [entries, projects, selectedWeek, selectedProject])

  const toggleDay = (dateString: string) => {
    const newExpandedDays = new Set(expandedDays)
    if (newExpandedDays.has(dateString)) {
      newExpandedDays.delete(dateString)
    } else {
      newExpandedDays.add(dateString)
    }
    setExpandedDays(newExpandedDays)
  }

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
    if (projectName === 'No Project') return '#9ca3af' // gray-400 for better contrast
    const project = projects?.find(p => p.name === projectName)
    return project?.color || '#6b7280'
  }

  const handleEditEntry = (entryId: string) => {
    const entry = entries?.find(e => e.id === entryId)
    if (entry) {
      setEditFormData({
        startTime: format(new Date(entry.startTs), 'HH:mm'),
        endTime: entry.endTs ? format(new Date(entry.endTs), 'HH:mm') : '',
        note: entry.note || '',
        projectId: entry.projectId || ''
      })
      setEditingEntry(entryId)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingEntry) return
    
    try {
      const entry = entries?.find(e => e.id === editingEntry)
      if (!entry) return

      // Get the original date from the entry
      const originalDate = new Date(entry.startTs).toISOString().split('T')[0]
      
      // Create new timestamps with the edited times
      const newStartTs = `${originalDate}T${editFormData.startTime}:00.000Z`
      const newEndTs = editFormData.endTime ? `${originalDate}T${editFormData.endTime}:00.000Z` : undefined

      // Update the entry
      await entryService.update(editingEntry, {
        startTs: newStartTs,
        endTs: newEndTs,
        note: editFormData.note || undefined,
        projectId: editFormData.projectId || undefined
      })

      setEditingEntry(null)
    } catch (error) {
      console.error('Failed to update entry:', error)
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await entryService.delete(entryId)
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete entry:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingEntry(null)
  }


  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-12 px-6 text-gray-400">
        <Calendar size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-base mb-2">
          No time entries found
        </p>
        <p className="text-sm opacity-70">
          Start tracking time to see your weekly reports
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Project Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-300">Filter:</span>
          <select
            value={selectedProject}
            onChange={(e) => onProjectChange(e.target.value)}
            className="px-3 py-2 pr-4 text-sm border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
          >
            <option value="all">All Projects</option>
            <option value="no-project">No Project</option>
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Weekly Summary Cards - Primary Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Total Time Card */}
          <div className="flex-1 min-w-[200px] glass-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 glass-tint-blue rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-blue-300" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                  {selectedProject === 'all' ? 'Total Time' : 
                   selectedProject === 'no-project' ? 'No Project Time' :
                   `Time for ${projects?.find(p => p.id === selectedProject)?.name || 'Project'}`}
                </p>
                <p className="text-2xl font-bold text-gray-100">
                  {formatDuration(totalWeekMinutes)}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDurationHours(totalWeekMinutes)} hours
                </p>
              </div>
            </div>
          </div>


          {/* Daily Average Card */}
          <div className="flex-1 min-w-[200px] glass-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 glass-tint-amber rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-amber-300" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                  {selectedProject === 'all' ? 'Daily Average' : 
                   selectedProject === 'no-project' ? 'No Project Daily Avg' :
                   `${projects?.find(p => p.id === selectedProject)?.name || 'Project'} Daily Avg`}
                </p>
                <p className="text-2xl font-bold text-gray-100">
                  {formatDuration(Math.round(totalWeekMinutes / 7))}
                </p>
                <p className="text-xs text-gray-400">
                  per day
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigation & Timeline - Secondary Section */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-100">
            Week Overview
          </h2>
        </div>
        <WeekSelector selectedWeek={selectedWeek} onWeekChange={onWeekChange} />
        <WeekTimelineBar weekData={weekData} />
      </div>

      {/* Daily Breakdown - Tertiary Section */}
      <div id="daily-breakdown" className="glass-card rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          Daily Breakdown
        </h3>
        
        <div className="space-y-3">
          {weekData.map((day, index) => {
            const dateString = day.date.toISOString().split('T')[0]
            const isExpanded = expandedDays.has(dateString)
            const isEmpty = day.totalMinutes === 0
            
            return (
              <div
                key={index}
                className={`glass-subtle rounded-lg overflow-hidden transition-all duration-200 ${
                  isEmpty ? 'opacity-50' : 'opacity-100'
                } ${index > 0 ? 'mt-3' : ''}`}
              >
                {/* Day Header */}
                <button
                  onClick={() => !isEmpty && toggleDay(dateString)}
                  disabled={isEmpty}
                  className={`w-full flex items-center justify-between p-4 transition-colors duration-200 ${
                    isEmpty 
                      ? 'cursor-default' 
                      : 'hover:bg-gray-600 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {!isEmpty && (
                      isExpanded ? (
                        <ChevronDown size={16} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-400" />
                      )
                    )}
                    <div className="text-left">
                      <div className={`text-sm font-semibold ${
                        isEmpty ? 'text-gray-500' : 'text-gray-100'
                      }`}>
                        {format(day.date, 'EEEE, MMMM d')}
                      </div>
                      <div className={`text-xs ${
                        isEmpty ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {isEmpty ? 'No time tracked' : `${day.entries.length} entries`}
                      </div>
                    </div>
                  </div>
                  {!isEmpty && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-100">
                        {formatDuration(day.totalMinutes)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDurationHours(day.totalMinutes)}h
                      </div>
                    </div>
                  )}
                </button>

                {/* Day Content - Collapsible */}
                {!isEmpty && isExpanded && (
                  <div className="border-t border-gray-600/50">
                    {/* Project Breakdown */}
                    {Object.keys(day.projectBreakdown).length > 0 && (
                      <div className="p-4 glass-subtle">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(day.projectBreakdown).map(([projectName, data]) => (
                            <div
                              key={projectName}
                              className="flex items-center gap-2 px-3 py-1.5 glass-subtle rounded-lg text-xs"
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: getProjectColor(projectName) }}
                              />
                              <span className="text-gray-200">
                                {projectName}
                              </span>
                              <span className="text-gray-400">
                                {formatDuration(data.minutes)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Individual Entries */}
                    <div className="p-4 space-y-2">
                      {day.entries.map((entry) => {
                        const projectName = projects?.find(p => p.id === entry.projectId)?.name || 'No Project'
                        const startTime = format(new Date(entry.startTs), 'HH:mm')
                        const endTime = entry.endTs ? format(new Date(entry.endTs), 'HH:mm') : 'Running'
                        const duration = entry.endTs ? calculateDuration(entry.startTs, entry.endTs) : '0m'
                        
                        return (
                          <div
                            key={entry.id}
                            className="group flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors duration-200"
                          >
                            {editingEntry === entry.id ? (
                              /* Edit Form */
                              <div className="flex-1 space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Start Time</label>
                                    <input
                                      type="time"
                                      value={editFormData.startTime}
                                      onChange={(e) => setEditFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                      className="w-full px-2 py-1 text-xs border border-gray-600 rounded bg-gray-800 text-gray-100 focus:border-blue-500 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-400 mb-1 block">End Time</label>
                                    <input
                                      type="time"
                                      value={editFormData.endTime}
                                      onChange={(e) => setEditFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                      className="w-full px-2 py-1 text-xs border border-gray-600 rounded bg-gray-800 text-gray-100 focus:border-blue-500 focus:outline-none"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-400 mb-1 block">Note</label>
                                  <input
                                    type="text"
                                    value={editFormData.note}
                                    onChange={(e) => setEditFormData(prev => ({ ...prev, note: e.target.value }))}
                                    placeholder="Optional note..."
                                    className="w-full px-2 py-1 text-xs border border-gray-600 rounded bg-gray-800 text-gray-100 focus:border-blue-500 focus:outline-none"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleSaveEdit}
                                    className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Display Mode */
                              <>
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: getProjectColor(projectName) }}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-medium text-gray-100 truncate">
                                        {projectName}
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        {startTime} - {endTime}
                                      </span>
                                    </div>
                                    {entry.note && (
                                      <div className="text-xs text-gray-300 truncate">
                                        {entry.note}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-sm font-mono text-gray-200 flex-shrink-0">
                                    {formatDuration(parseInt(duration))}
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    onClick={() => handleEditEntry(entry.id)}
                                    className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors duration-200"
                                    title="Edit entry"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(entry.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors duration-200"
                                    title="Delete entry"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">
              Delete Entry
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this time entry? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-300 hover:text-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEntry(deleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}