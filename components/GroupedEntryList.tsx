'use client'

import React, { useState } from 'react'
import { useEntries, useProjects, entryService } from '@/lib/db'
import { formatTime, formatDuration, calculateDuration, getTimeBucket } from '@/lib/utils/time'
import { Edit, Trash2, Clock, ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react'

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
    setEditForm({
      projectId: entry.projectId || '',
      startTime: entry.startTs.split('T')[1].substring(0, 5),
      endTime: entry.endTs ? entry.endTs.split('T')[1].substring(0, 5) : '',
      note: entry.note || ''
    })
  }

  const handleSaveEdit = async (entryId: string) => {
    try {
      const entry = entries?.find(e => e.id === entryId)
      if (!entry) return

      const startDate = entry.startTs.split('T')[0]
      const startTs = new Date(`${startDate}T${editForm.startTime}`).toISOString()
      const endTs = editForm.endTime ? new Date(`${startDate}T${editForm.endTime}`).toISOString() : undefined

      if (endTs && endTs <= startTs) {
        alert('End time must be after start time')
        return
      }

      await entryService.update(entryId, {
        projectId: editForm.projectId || undefined,
        startTs,
        endTs,
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
                          <div className="flex items-center gap-3">
                            {/* Project Selector */}
                            <select
                              value={editForm.projectId}
                              onChange={(e) => setEditForm(prev => ({ ...prev, projectId: e.target.value }))}
                              className="px-2 py-1 text-xs border border-gray-600 rounded bg-gray-700 text-gray-100 min-w-[120px]"
                            >
                              <option value="">No Project</option>
                              {projects?.map(project => (
                                <option key={project.id} value={project.id}>
                                  {project.name}
                                </option>
                              ))}
                            </select>

                            {/* Start Time */}
                            <input
                              type="time"
                              value={editForm.startTime}
                              onChange={(e) => setEditForm(prev => ({ ...prev, startTime: e.target.value }))}
                              className="px-2 py-1 text-xs border border-gray-600 rounded bg-gray-700 text-gray-100 w-24"
                            />

                            {/* End Time */}
                            <input
                              type="time"
                              value={editForm.endTime}
                              onChange={(e) => setEditForm(prev => ({ ...prev, endTime: e.target.value }))}
                              className="px-2 py-1 text-xs border border-gray-600 rounded bg-gray-700 text-gray-100 w-24"
                            />

                            {/* Note */}
                            <input
                              type="text"
                              value={editForm.note}
                              onChange={(e) => setEditForm(prev => ({ ...prev, note: e.target.value }))}
                              placeholder="Note..."
                              className="px-2 py-1 text-xs border border-gray-600 rounded bg-gray-700 text-gray-100 flex-1 min-w-[120px]"
                            />

                            {/* Action Buttons */}
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleSaveEdit(entry.id)}
                                className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded cursor-pointer transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingEntry(null)}
                                className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded cursor-pointer transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="group">
                          {/* Compact Summary Row */}
                          <button
                            onClick={() => toggleEntry(entry.id)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-600 transition-colors duration-200"
                            role="button"
                            aria-expanded={expandedEntries.has(entry.id)}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              {/* Project Badge */}
                              <div
                                className="px-3 py-1.5 rounded text-xs font-semibold text-white min-w-[90px] text-center uppercase tracking-wide"
                                style={{ backgroundColor: getProjectColor(entry.projectId) }}
                              >
                                {getProjectName(entry.projectId)}
                              </div>

                              {/* Time Range */}
                              <div className="min-w-[180px]">
                                <div className="text-sm font-medium text-gray-100 mb-0.5">
                                  {formatTime(entry.startTs)} - {entry.endTs ? formatTime(entry.endTs) : 'Running'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {entry.endTs ? formatDuration(calculateDuration(entry.startTs, entry.endTs)) : 'Running...'}
                                </div>
                              </div>

                              {/* Note Preview */}
                              {entry.note && (
                                <div className="flex-1 min-w-[120px]">
                                  <div className="text-sm text-gray-300 truncate">
                                    {entry.note}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Expand/Collapse Icon */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {expandedEntries.has(entry.id) ? (
                                <ChevronDown size={16} className="text-gray-400" />
                              ) : (
                                <ChevronRight size={16} className="text-gray-400" />
                              )}
                            </div>
                          </button>

                          {/* Expanded Details */}
                          {expandedEntries.has(entry.id) && (
                            <div className="px-4 pt-4 pb-4 bg-gray-800 border-t border-gray-600">
                              {/* Full Note */}
                              {entry.note && (
                                <div className="mb-4">
                                  <p className="text-xs text-gray-400 mb-1">Note:</p>
                                  <p className="text-sm text-gray-300">{entry.note}</p>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(entry)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-transparent border border-gray-500 rounded-md text-gray-400 hover:bg-gray-600 hover:border-gray-400 hover:text-gray-100 transition-all duration-200"
                                >
                                  <Edit size={14} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(entry.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-transparent border border-gray-500 rounded-md text-gray-400 hover:bg-red-600 hover:border-red-500 hover:text-white transition-all duration-200"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
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
