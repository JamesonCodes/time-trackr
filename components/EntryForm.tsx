'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useProjects, entryService } from '@/lib/db'
import { formatDate, formatTime, calculateDurationBetweenTimes, formatDurationShort } from '@/lib/utils/time'
import { getLastProject, setLastProject } from '@/lib/utils/storage'
import { Plus, X } from 'lucide-react'
import ProjectSelector from './ProjectSelector'
import TimePicker from './TimePicker'
import DatePicker from './DatePicker'

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

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const projectRef = useRef<HTMLDivElement>(null)
  const noteRef = useRef<HTMLInputElement>(null)

  const projects = useProjects()

  // Set default times and load last project when component mounts
  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    const minute = now.getMinutes()
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const currentTime = `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`
    
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
    const laterHour = oneHourLater.getHours()
    const laterMinute = oneHourLater.getMinutes()
    const laterPeriod = laterHour >= 12 ? 'PM' : 'AM'
    const laterDisplayHour = laterHour === 0 ? 12 : laterHour > 12 ? laterHour - 12 : laterHour
    const oneHourLaterTime = `${laterDisplayHour.toString().padStart(2, '0')}:${laterMinute.toString().padStart(2, '0')} ${laterPeriod}`
    
    // Load last used project
    const lastProject = getLastProject()
    
    setFormData(prev => ({
      ...prev,
      startTime: prev.startTime || currentTime,
      endTime: prev.endTime || oneHourLaterTime,
      projectId: lastProject || prev.projectId
    }))
  }, [])

  // Calculate duration for preview
  const calculatedDuration = React.useMemo(() => {
    if (!formData.startTime || !formData.endTime) return null
    
    try {
      // Convert 12-hour format to 24-hour format for calculation
      const parseTimeString = (timeStr: string) => {
        const [time, period] = timeStr.split(' ')
        const [hour, minute] = time.split(':').map(Number)
        let hour24 = hour
        if (period === 'PM' && hour !== 12) hour24 = hour + 12
        if (period === 'AM' && hour === 12) hour24 = 0
        return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      }
      
      const startTime24 = parseTimeString(formData.startTime)
      const endTime24 = parseTimeString(formData.endTime)
      
      const duration = calculateDurationBetweenTimes(
        startTime24,
        endTime24,
        formData.startDate
      )
      
      return duration > 0 ? formatDurationShort(duration) : null
    } catch (error) {
      console.error('Error calculating duration:', error)
      return null
    }
  }, [formData.startTime, formData.endTime, formData.startDate])

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
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Convert 12-hour format to 24-hour format for database storage
      const parseTimeString = (timeStr: string) => {
        const [time, period] = timeStr.split(' ')
        const [hour, minute] = time.split(':').map(Number)
        let hour24 = hour
        if (period === 'PM' && hour !== 12) hour24 = hour + 12
        if (period === 'AM' && hour === 12) hour24 = 0
        return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      }
      
      const startTime24 = parseTimeString(formData.startTime)
      const endTime24 = parseTimeString(formData.endTime)
      
      const startTs = new Date(`${formData.startDate}T${startTime24}`).toISOString()
      const endTs = new Date(`${formData.startDate}T${endTime24}`).toISOString()

      await entryService.create({
        projectId: formData.projectId || undefined,
        startTs,
        endTs,
        note: formData.note || undefined,
        source: 'manual'
      })

      // Save last used project
      if (formData.projectId) {
        setLastProject(formData.projectId)
      }

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

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
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
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
      {/* Project and Note Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project Selector */}
        <div ref={projectRef}>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Project
          </label>
          <ProjectSelector
            selectedProjectId={formData.projectId || undefined}
            onProjectSelect={(projectId) => setFormData(prev => ({ ...prev, projectId: projectId || '' }))}
            placeholder="No Project"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Note
          </label>
          <input
            ref={noteRef}
            type="text"
            value={formData.note}
            onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
            placeholder="Optional note..."
            className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
            tabIndex={2}
          />
        </div>
      </div>

      {/* Subtle divider with label */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-gray-700"></div>
        <span className="text-sm text-gray-500 px-2">Time Details</span>
        <div className="flex-1 border-t border-gray-700"></div>
      </div>

      {/* Date and Time Group */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date
          </label>
          <DatePicker
            value={formData.startDate}
            onChange={(value) => setFormData(prev => ({ ...prev, startDate: value }))}
            placeholder="Select date"
          />
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Start Time
          </label>
          <TimePicker
            value={formData.startTime}
            onChange={(value) => setFormData(prev => ({ ...prev, startTime: value }))}
            placeholder="Select start time"
            className={errors.startTime ? 'border-red-500' : ''}
          />
          {errors.startTime && (
            <p className="text-red-400 text-xs mt-1">
              {errors.startTime}
            </p>
          )}
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            End Time
          </label>
          <TimePicker
            value={formData.endTime}
            onChange={(value) => setFormData(prev => ({ ...prev, endTime: value }))}
            placeholder="Select end time"
            className={errors.endTime ? 'border-red-500' : ''}
          />
          {errors.endTime && (
            <p className="text-red-400 text-xs mt-1">
              {errors.endTime}
            </p>
          )}
        </div>
      </div>

      {/* Duration Preview */}
      {calculatedDuration && (
        <div className="text-sm text-gray-400 flex items-center gap-1">
          <span>⏱</span>
          <span>{calculatedDuration} total</span>
        </div>
      )}

      {/* Error Messages */}
      {errors.submit && (
        <div className="text-red-400 text-sm">
          {errors.submit}
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-6 border-t border-gray-700">
        <div className="flex justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-400 bg-transparent border border-gray-600 rounded-lg hover:text-gray-200 hover:border-gray-500 transition-colors"
              tabIndex={7}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            tabIndex={6}
          >
            <Plus size={16} />
            {isSubmitting ? 'Adding...' : 'Add Entry'}
          </button>
        </div>
      </div>
    </form>
  )
}
