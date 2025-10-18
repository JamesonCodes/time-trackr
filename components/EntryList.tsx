'use client'

import { useState } from 'react'
import { useEntries, useProjects, entryService } from '@/lib/db'
import { formatDate, formatTime, formatDuration, calculateDuration } from '@/lib/utils/time'
import { Edit, Trash2, Clock, Calendar } from 'lucide-react'

interface EntryListProps {
  dateFilter?: string
  projectFilter?: string
  showDateHeaders?: boolean
}

export default function EntryList({ 
  dateFilter, 
  projectFilter, 
  showDateHeaders = true 
}: EntryListProps) {
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

  // Group entries by date
  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = entry.startTs.split('T')[0]
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(entry)
    return groups
  }, {} as Record<string, typeof filteredEntries>)

  // Sort entries within each group by start time (most recent first)
  Object.keys(groupedEntries).forEach(date => {
    groupedEntries[date].sort((a, b) => 
      new Date(b.startTs).getTime() - new Date(a.startTs).getTime()
    )
  })

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

  const sortedDates = Object.keys(groupedEntries).sort().reverse()

  if (filteredEntries.length === 0) {
    return (
      <div className="text-center py-12 px-6 text-gray-400">
        <Clock size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-base mb-2">
          No entries found
        </p>
        <p className="text-sm opacity-70">
          Start a timer or add a manual entry to get started
        </p>
      </div>
    )
  }

  return (
    <div>
      {sortedDates.map(date => (
        <div key={date} className="mb-6">
          {showDateHeaders && (
            <div className="flex items-center gap-2 mb-3 py-2 border-b border-gray-700">
              <Calendar size={16} className="text-gray-400" />
              <h3 className="text-base font-semibold text-gray-100">
                {formatDate(date)}
              </h3>
              <span className="text-sm text-gray-400 ml-auto">
                {groupedEntries[date].length} entries
              </span>
            </div>
          )}

              <div className="flex flex-col gap-3 mt-4">
                {groupedEntries[date].map(entry => (
                  <div 
                    key={entry.id} 
                    className="flex items-center justify-between px-4 sm:px-5 py-4 bg-gray-700 border border-gray-600 rounded-lg transition-all duration-200 cursor-pointer hover:bg-gray-600 hover:border-gray-500"
                  >
                {editingEntry === entry.id ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 w-full">
                    {/* Mobile Edit Form - Stacked */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                      {/* Project Selector */}
                      <select
                        value={editForm.projectId}
                        onChange={(e) => setEditForm(prev => ({ ...prev, projectId: e.target.value }))}
                        className="px-3 py-2 text-sm border border-gray-600 rounded bg-gray-800 text-gray-100 min-h-[44px]"
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
                        className="px-3 py-2 text-sm border border-gray-600 rounded bg-gray-800 text-gray-100 min-h-[44px]"
                      />

                      {/* End Time */}
                      <input
                        type="time"
                        value={editForm.endTime}
                        onChange={(e) => setEditForm(prev => ({ ...prev, endTime: e.target.value }))}
                        className="px-3 py-2 text-sm border border-gray-600 rounded bg-gray-800 text-gray-100 min-h-[44px]"
                      />

                      {/* Note */}
                      <input
                        type="text"
                        value={editForm.note}
                        onChange={(e) => setEditForm(prev => ({ ...prev, note: e.target.value }))}
                        placeholder="Note..."
                        className="px-3 py-2 text-sm border border-gray-600 rounded bg-gray-800 text-gray-100 min-h-[44px] sm:col-span-2 lg:col-span-1"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 sm:gap-1 w-full sm:w-auto">
                      <button
                        onClick={() => handleSaveEdit(entry.id)}
                        className="flex-1 sm:flex-none px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded cursor-pointer transition-colors min-h-[44px] touch-manipulation"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingEntry(null)}
                        className="flex-1 sm:flex-none px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded cursor-pointer transition-colors min-h-[44px] touch-manipulation"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                        {/* Mobile Layout - Stacked */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                          {/* Project Badge */}
                          <div
                            className="px-3 py-1.5 rounded text-xs font-semibold text-white min-w-[90px] text-center uppercase tracking-wide flex-shrink-0"
                            style={{ backgroundColor: getProjectColor(entry.projectId) }}
                          >
                            {getProjectName(entry.projectId)}
                          </div>

                          {/* Time Range */}
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-100 mb-0.5">
                              {formatTime(entry.startTs)} - {entry.endTs ? formatTime(entry.endTs) : 'Running'}
                            </div>
                            <div className="text-xs text-gray-400">
                              {entry.endTs ? formatDuration(calculateDuration(entry.startTs, entry.endTs)) : 'Running...'}
                            </div>
                          </div>

                          {/* Note */}
                          {entry.note && (
                            <div className="flex-1 sm:min-w-[120px]">
                              <div className="text-sm text-gray-300">
                                {entry.note}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons - Always visible on mobile */}
                        <div className="flex gap-1.5 opacity-100 sm:opacity-60 sm:hover:opacity-100 transition-opacity duration-200 ml-3">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="p-2 sm:p-2 bg-transparent border border-gray-500 rounded-md text-gray-400 hover:bg-gray-600 hover:border-gray-400 hover:text-gray-100 transition-all duration-200 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-manipulation"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-2 sm:p-2 bg-transparent border border-gray-500 rounded-md text-gray-400 hover:bg-red-600 hover:border-red-500 hover:text-white transition-all duration-200 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-manipulation"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
