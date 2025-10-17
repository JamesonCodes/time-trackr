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

  // Sort entries within each group by start time
  Object.keys(groupedEntries).forEach(date => {
    groupedEntries[date].sort((a, b) => 
      new Date(a.startTs).getTime() - new Date(b.startTs).getTime()
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
      <div style={{
        textAlign: 'center',
        padding: '48px 24px',
        color: '#9ca3af'
      }}>
        <Clock size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
        <p style={{ fontSize: '16px', margin: 0 }}>
          No entries found
        </p>
        <p style={{ fontSize: '14px', margin: '8px 0 0 0', opacity: 0.7 }}>
          Start a timer or add a manual entry to get started
        </p>
      </div>
    )
  }

  return (
    <div>
      {sortedDates.map(date => (
        <div key={date} style={{ marginBottom: '24px' }}>
          {showDateHeaders && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
              padding: '8px 0',
              borderBottom: '1px solid #374151'
            }}>
              <Calendar size={16} style={{ color: '#9ca3af' }} />
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#f9fafb',
                margin: 0
              }}>
                {formatDate(date)}
              </h3>
              <span style={{
                fontSize: '14px',
                color: '#9ca3af',
                marginLeft: 'auto'
              }}>
                {groupedEntries[date].length} entries
              </span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {groupedEntries[date].map(entry => (
              <div key={entry.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '8px'
              }}>
                {editingEntry === entry.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    {/* Project Selector */}
                    <select
                      value={editForm.projectId}
                      onChange={(e) => setEditForm(prev => ({ ...prev, projectId: e.target.value }))}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '1px solid #4b5563',
                        borderRadius: '4px',
                        backgroundColor: '#1f2937',
                        color: '#f9fafb',
                        minWidth: '120px'
                      }}
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
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '1px solid #4b5563',
                        borderRadius: '4px',
                        backgroundColor: '#1f2937',
                        color: '#f9fafb',
                        width: '100px'
                      }}
                    />

                    {/* End Time */}
                    <input
                      type="time"
                      value={editForm.endTime}
                      onChange={(e) => setEditForm(prev => ({ ...prev, endTime: e.target.value }))}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '1px solid #4b5563',
                        borderRadius: '4px',
                        backgroundColor: '#1f2937',
                        color: '#f9fafb',
                        width: '100px'
                      }}
                    />

                    {/* Note */}
                    <input
                      type="text"
                      value={editForm.note}
                      onChange={(e) => setEditForm(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="Note..."
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '1px solid #4b5563',
                        borderRadius: '4px',
                        backgroundColor: '#1f2937',
                        color: '#f9fafb',
                        flex: 1,
                        minWidth: '120px'
                      }}
                    />

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleSaveEdit(entry.id)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingEntry(null)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          backgroundColor: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      {/* Project Badge */}
                      <div
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: getProjectColor(entry.projectId),
                          color: 'white',
                          minWidth: '80px',
                          textAlign: 'center'
                        }}
                      >
                        {getProjectName(entry.projectId)}
                      </div>

                      {/* Time Range */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px' }}>
                        <span style={{ fontSize: '14px', color: '#d1d5db' }}>
                          {formatTime(entry.startTs)} - {entry.endTs ? formatTime(entry.endTs) : 'Running'}
                        </span>
                      </div>

                      {/* Duration */}
                      <div style={{ minWidth: '80px' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#f9fafb'
                        }}>
                          {entry.endTs ? formatDuration(calculateDuration(entry.startTs, entry.endTs)) : 'Running...'}
                        </span>
                      </div>

                      {/* Note */}
                      {entry.note && (
                        <div style={{ flex: 1, minWidth: '120px' }}>
                          <span style={{ fontSize: '14px', color: '#9ca3af' }}>
                            {entry.note}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleEdit(entry)}
                        style={{
                          padding: '6px',
                          backgroundColor: 'transparent',
                          border: '1px solid #4b5563',
                          borderRadius: '4px',
                          color: '#9ca3af',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        style={{
                          padding: '6px',
                          backgroundColor: 'transparent',
                          border: '1px solid #4b5563',
                          borderRadius: '4px',
                          color: '#ef4444',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
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
