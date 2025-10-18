'use client'

import React, { useState } from 'react'
import { useEntries, useProjects, entryService } from '@/lib/db'
import { formatTime, formatDuration, calculateDuration, getTimeBucket } from '@/lib/utils/time'
import { Edit, Trash2, Clock, ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react'
import TimePicker from './TimePicker'
import DatePicker from './DatePicker'
import ProjectSelector from './ProjectSelector'

interface GroupedEntryListProps {
  dateFilter?: string
  projectFilter?: string
}

type GroupingType = 'project' | 'time'

interface GroupedEntries {
  [key: string]: {
    entries: any[]
    totalDuration: number
    isExpanded: boolean
  }
}

export default function GroupedEntryList({ dateFilter, projectFilter }: GroupedEntryListProps) {
  const [groupingType, setGroupingType] = useState<GroupingType>('project')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    projectId: '',
    startDate: '',
    startTime: '',
    endTime: '',
    note: ''
  })

  const entries = useEntries()
  const projects = useProjects()

  // Filter entries
  let filteredEntries = entries || []
  
  if (dateFilter) {
    filteredEntries = filteredEntries.filter(entry => 
      entry.startTs.startsWith(dateFilter)
    )
  }
  
  if (projectFilter) {
    filteredEntries = filteredEntries.filter(entry => 
      entry.projectId === projectFilter
    )
  }

  // Group entries
  const groupedEntries: GroupedEntries = {}
  
  filteredEntries.forEach(entry => {
    let groupKey: string
    
    if (groupingType === 'project') {
      groupKey = entry.projectId || 'no-project'
    } else {
      groupKey = getTimeBucket(entry.startTs)
    }
    
    if (!groupedEntries[groupKey]) {
      groupedEntries[groupKey] = {
        entries: [],
        totalDuration: 0,
        isExpanded: true
      }
    }
    
    groupedEntries[groupKey].entries.push(entry)
    
    if (entry.endTs) {
      groupedEntries[groupKey].totalDuration += calculateDuration(entry.startTs, entry.endTs)
    }
  })

  // Sort entries within each group by start time (most recent first)
  Object.keys(groupedEntries).forEach(groupKey => {
    groupedEntries[groupKey].entries.sort((a, b) => 
      new Date(b.startTs).getTime() - new Date(a.startTs).getTime()
    )
  })

  // Initialize expanded groups
  React.useEffect(() => {
    const newExpandedGroups = new Set(Object.keys(groupedEntries))
    setExpandedGroups(newExpandedGroups)
  }, [groupingType])

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

  const getGroupName = (groupKey: string) => {
    if (groupingType === 'project') {
      if (groupKey === 'no-project') return 'No Project'
      const project = projects?.find(p => p.id === groupKey)
      return project?.name || 'Unknown Project'
    } else {
      return groupKey
    }
  }

  const toggleGroup = (groupKey: string) => {
    const newExpandedGroups = new Set(expandedGroups)
    if (newExpandedGroups.has(groupKey)) {
      newExpandedGroups.delete(groupKey)
    } else {
      newExpandedGroups.add(groupKey)
    }
    setExpandedGroups(newExpandedGroups)
  }

  const toggleEntry = (entryId: string) => {
    const newExpandedEntries = new Set(expandedEntries)
    if (newExpandedEntries.has(entryId)) {
      newExpandedEntries.delete(entryId)
    } else {
      newExpandedEntries.add(entryId)
    }
    setExpandedEntries(newExpandedEntries)
  }

  const handleEdit = (entry: any) => {
    setEditingEntry(entry.id)
    
    // Convert to 12-hour format for TimePicker
    const startDate = new Date(entry.startTs)
    const endDate = entry.endTs ? new Date(entry.endTs) : null
    
    const formatTimeForPicker = (date: Date) => {
      const hour = date.getHours()
      const minute = date.getMinutes()
      const period = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`
    }

    setEditForm({
      projectId: entry.projectId || '',
      startDate: entry.startTs.split('T')[0],
      startTime: formatTimeForPicker(startDate),
      endTime: endDate ? formatTimeForPicker(endDate) : '',
      note: entry.note || ''
    })
  }

  const handleSaveEdit = async (entryId: string) => {
    try {
      const entry = entries?.find(e => e.id === entryId)
      if (!entry) return

      // Convert TimePicker format back to 24-hour format
      const convertTimePickerTo24Hour = (timeString: string) => {
        const [time, period] = timeString.split(' ')
        const [hour, minute] = time.split(':')
        let hour24 = parseInt(hour)
        
        if (period === 'PM' && hour24 !== 12) {
          hour24 += 12
        } else if (period === 'AM' && hour24 === 12) {
          hour24 = 0
        }
        
        return `${hour24.toString().padStart(2, '0')}:${minute}:00.000Z`
      }
      
      // Create new timestamps with the edited times
      const newStartTs = `${editForm.startDate}T${convertTimePickerTo24Hour(editForm.startTime)}`
      const newEndTs = editForm.endTime ? `${editForm.startDate}T${convertTimePickerTo24Hour(editForm.endTime)}` : undefined

      if (newEndTs && newEndTs <= newStartTs) {
        alert('End time must be after start time')
        return
      }

      await entryService.update(entryId, {
        projectId: editForm.projectId || undefined,
        startTs: newStartTs,
        endTs: newEndTs,
        note: editForm.note || undefined
      })

      setEditingEntry(null)
    } catch (error) {
      console.error('Failed to update entry:', error)
      alert('Failed to update entry')
    }
  }

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      await entryService.delete(entryId)
    } catch (error) {
      console.error('Failed to delete entry:', error)
      alert('Failed to delete entry')
    }
  }

  const groupKeys = Object.keys(groupedEntries).sort((a, b) => {
    if (groupingType === 'project') {
      // Sort "No Project" last
      if (a === 'no-project') return 1
      if (b === 'no-project') return -1
      return getGroupName(a).localeCompare(getGroupName(b))
    } else {
      // Sort time buckets chronologically
      const order = { 'Morning': 0, 'Afternoon': 1, 'Evening': 2 }
      return order[a as keyof typeof order] - order[b as keyof typeof order]
    }
  })

  if (filteredEntries.length === 0) {
    return (
      <div className="text-center py-12 px-6 text-gray-400">
        <Clock size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-base mb-2">
          No entries for today
        </p>
        <p className="text-sm opacity-70">
          Start the timer or add a manual entry to begin tracking
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Grouping Toggle */}
      <div className="flex items-center justify-between mb-6 mt-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Group by:</span>
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setGroupingType('project')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-200 ${
                groupingType === 'project'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Project
            </button>
            <button
              onClick={() => setGroupingType('time')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-200 ${
                groupingType === 'time'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Time
            </button>
          </div>
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-3">
        {groupKeys.map(groupKey => {
          const group = groupedEntries[groupKey]
          const isExpanded = expandedGroups.has(groupKey)
          
          return (
            <div key={groupKey} className="bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(groupKey)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-600 transition-colors duration-200"
                role="button"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-gray-100">
                      {getGroupName(groupKey)}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {group.entries.length} entries • {formatDuration(group.totalDuration)}
                    </p>
                  </div>
                </div>
              </button>

              {/* Group Content */}
              {isExpanded && (
                <div className="border-t border-gray-600">
                  {group.entries.map(entry => (
                    <div key={entry.id} className="border-b border-gray-600 last:border-b-0">
                      {editingEntry === entry.id ? (
                        <div className="p-4 bg-gray-800">
                          <div className="space-y-4">
                            {/* Date and Time Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {/* Date */}
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Date
                                </label>
                                <DatePicker
                                  value={editForm.startDate}
                                  onChange={(value) => setEditForm(prev => ({ ...prev, startDate: value }))}
                                  placeholder="Select date"
                                />
                              </div>

                              {/* Start Time */}
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Start Time
                                </label>
                                <TimePicker
                                  value={editForm.startTime}
                                  onChange={(value) => setEditForm(prev => ({ ...prev, startTime: value }))}
                                  placeholder="Select start time"
                                />
                              </div>

                              {/* End Time */}
                              <div className="sm:col-span-2 lg:col-span-1">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  End Time
                                </label>
                                <TimePicker
                                  value={editForm.endTime}
                                  onChange={(value) => setEditForm(prev => ({ ...prev, endTime: value }))}
                                  placeholder="Select end time"
                                />
                              </div>
                            </div>

                            {/* Project and Note Row */}
                            <div className="grid grid-cols-1 gap-4">
                              {/* Project */}
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Project
                                </label>
                                <ProjectSelector
                                  selectedProjectId={editForm.projectId}
                                  onProjectSelect={(projectId) => setEditForm(prev => ({ ...prev, projectId: projectId || '' }))}
                                  placeholder="Select project"
                                />
                              </div>

                              {/* Note */}
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Note
                                </label>
                                <textarea
                                  value={editForm.note}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, note: e.target.value }))}
                                  placeholder="Optional note..."
                                  rows={3}
                                  className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors resize-none min-h-[44px]"
                                />
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-end">
                              <button
                                onClick={() => setEditingEntry(null)}
                                className="px-4 py-3 sm:py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors min-h-[44px] touch-manipulation"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(entry.id)}
                                className="px-4 py-3 sm:py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors min-h-[44px] touch-manipulation"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="group flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors duration-200">
                          {/* Mobile Layout */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: getProjectColor(entry.projectId) }}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                  <span className="text-sm font-medium text-gray-100 truncate">
                                    {getProjectName(entry.projectId)}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {formatTime(entry.startTs)} - {entry.endTs ? formatTime(entry.endTs) : 'Running'}
                                  </span>
                                </div>
                                {entry.note && (
                                  <div className="text-xs text-gray-300 truncate">
                                    {entry.note}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-sm font-mono text-gray-200 flex-shrink-0">
                              {entry.endTs ? formatDuration(calculateDuration(entry.startTs, entry.endTs)) : 'Running...'}
                            </div>
                          </div>
                          
                          {/* Action Buttons - Always visible on mobile */}
                          <div className="flex items-center gap-1 ml-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="p-2 sm:p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors duration-200 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-manipulation"
                              title="Edit entry"
                            >
                              <Edit size={16} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="p-2 sm:p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors duration-200 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-manipulation"
                              title="Delete entry"
                            >
                              <Trash2 size={16} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
