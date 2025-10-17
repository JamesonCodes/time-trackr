'use client'

import React, { useState } from 'react'
import { useProjects, entryService } from '@/lib/db'
import { formatDate, formatTime } from '@/lib/utils/time'
import { Plus, X } from 'lucide-react'

interface EntryFormProps {
  onEntryCreated?: () => void
  onCancel?: () => void
  initialDate?: string
}

export default function EntryForm({ onEntryCreated, onCancel, initialDate }: EntryFormProps) {
  const [formData, setFormData] = useState({
    projectId: '',
    startDate: initialDate || new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    note: ''
  })

  // Set default times when component mounts
  React.useEffect(() => {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000).toTimeString().slice(0, 5)
    
    setFormData(prev => ({
      ...prev,
      startTime: prev.startTime || currentTime,
      endTime: prev.endTime || oneHourLater
    }))
  }, [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const projects = useProjects()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required'
    }
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required'
    }
    if (formData.startTime && formData.endTime) {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.startDate}T${formData.endTime}`)
      
      if (endDateTime <= startDateTime) {
        newErrors.endTime = 'End time must be after start time'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form data:', formData)
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const startTs = new Date(`${formData.startDate}T${formData.startTime}`).toISOString()
      const endTs = new Date(`${formData.startDate}T${formData.endTime}`).toISOString()

      console.log('Creating entry with:', { startTs, endTs })

      await entryService.create({
        projectId: formData.projectId || undefined,
        startTs,
        endTs,
        note: formData.note || undefined,
        source: 'manual'
      })

      // Reset form
      setFormData({
        projectId: '',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        note: ''
      })
      setErrors({})

      onEntryCreated?.()
    } catch (error) {
      console.error('Failed to create entry:', error)
      setErrors({ submit: 'Failed to create entry. Please try again.' })
    } finally {
      setIsSubmitting(false)
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
    <div style={{
      backgroundColor: '#1f2937',
      border: '1px solid #374151',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '32px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#f9fafb',
          margin: 0
        }}>
          Manual Entry
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Project Selector */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#d1d5db',
              marginBottom: '4px'
            }}>
              Project
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                backgroundColor: '#374151',
                color: '#f9fafb'
              }}
            >
              <option value="">No Project</option>
              {projects?.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#d1d5db',
              marginBottom: '4px'
            }}>
              Note
            </label>
            <input
              type="text"
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Optional note..."
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                backgroundColor: '#374151',
                color: '#f9fafb'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          {/* Date */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#d1d5db',
              marginBottom: '4px'
            }}>
              Date
            </label>
            <div
              style={{
                position: 'relative',
                width: '100%',
                cursor: 'pointer'
              }}
              onClick={() => {
                const input = document.getElementById('startDate') as HTMLInputElement
                input?.showPicker?.() || input?.focus()
              }}
            >
              <input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: '2px solid #4b5563',
                  borderRadius: '8px',
                  backgroundColor: '#1f2937',
                  color: '#f9fafb',
                  minHeight: '48px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  pointerEvents: 'none' // Prevent direct interaction, use wrapper click
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.backgroundColor = '#111827'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#4b5563'
                  e.target.style.backgroundColor = '#1f2937'
                }}
              />
            </div>
          </div>

          {/* Start Time */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#d1d5db',
              marginBottom: '4px'
            }}>
              Start Time
            </label>
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        const input = document.getElementById('startTime') as HTMLInputElement
                        input?.showPicker?.() || input?.focus()
                      }}
                    >
                      <input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          fontSize: '16px',
                          border: errors.startTime ? '2px solid #ef4444' : '2px solid #4b5563',
                          borderRadius: '8px',
                          backgroundColor: '#1f2937',
                          color: '#f9fafb',
                          minHeight: '48px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxSizing: 'border-box',
                          pointerEvents: 'none' // Prevent direct interaction, use wrapper click
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#3b82f6'
                          e.target.style.backgroundColor = '#111827'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = errors.startTime ? '#ef4444' : '#4b5563'
                          e.target.style.backgroundColor = '#1f2937'
                        }}
                      />
                    </div>
            {errors.startTime && (
              <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                {errors.startTime}
              </p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#d1d5db',
              marginBottom: '4px'
            }}>
              End Time
            </label>
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        const input = document.getElementById('endTime') as HTMLInputElement
                        input?.showPicker?.() || input?.focus()
                      }}
                    >
                      <input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          fontSize: '16px',
                          border: errors.endTime ? '2px solid #ef4444' : '2px solid #4b5563',
                          borderRadius: '8px',
                          backgroundColor: '#1f2937',
                          color: '#f9fafb',
                          minHeight: '48px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxSizing: 'border-box',
                          pointerEvents: 'none' // Prevent direct interaction, use wrapper click
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#3b82f6'
                          e.target.style.backgroundColor = '#111827'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = errors.endTime ? '#ef4444' : '#4b5563'
                          e.target.style.backgroundColor = '#1f2937'
                        }}
                      />
                    </div>
            {errors.endTime && (
              <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                {errors.endTime}
              </p>
            )}
          </div>
        </div>

        {errors.submit && (
          <p style={{ color: '#ef4444', fontSize: '14px', margin: 0 }}>
            {errors.submit}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                color: '#9ca3af',
                backgroundColor: 'transparent',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: isSubmitting ? '#6b7280' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            <Plus size={16} />
            {isSubmitting ? 'Adding...' : 'Add Entry'}
          </button>
        </div>
      </form>
    </div>
  )
}
