'use client'

import React, { useState } from 'react'
import { useProjects, useEntries, projectService } from '@/lib/db'
import { Plus, Edit, Trash2, Palette, FolderOpen } from 'lucide-react'

const COLOR_OPTIONS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Slate', value: '#64748b' },
  { name: 'Zinc', value: '#71717a' }
]

export default function ProjectManagement() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const projects = useProjects()
  const entries = useEntries()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setErrors({ name: 'Project name is required' })
      return
    }

    setIsSubmitting(true)
    
    try {
      await projectService.create(formData.name.trim(), formData.color)
      
      setFormData({ name: '', color: '#3b82f6' })
      setErrors({})
      setShowCreateForm(false)
    } catch (error) {
      console.error('Failed to create project:', error)
      setErrors({ submit: 'Failed to create project. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setErrors({ name: 'Project name is required' })
      return
    }

    if (!editingProject) return

    setIsSubmitting(true)
    
    try {
      await projectService.update(editingProject, {
        name: formData.name.trim(),
        color: formData.color
      })
      
      setFormData({ name: '', color: '#3b82f6' })
      setErrors({})
      setEditingProject(null)
    } catch (error) {
      console.error('Failed to update project:', error)
      setErrors({ submit: 'Failed to update project. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (projectId: string) => {
    const project = projects?.find(p => p.id === projectId)
    if (!project) return

    const entryCount = entries?.filter(e => e.projectId === projectId).length || 0
    
    if (entryCount > 0) {
      if (!confirm(`Cannot delete "${project.name}" because it has ${entryCount} time entries. Please reassign or delete the entries first.`)) {
        return
      }
    } else {
      if (!confirm(`Are you sure you want to delete "${project.name}"?`)) {
        return
      }
    }

    try {
      await projectService.delete(projectId)
    } catch (error) {
      console.error('Failed to delete project:', error)
      alert('Failed to delete project. Please try again.')
    }
  }

  const startEdit = (project: any) => {
    setEditingProject(project.id)
    setFormData({
      name: project.name,
      color: project.color || '#3b82f6'
    })
    setErrors({})
  }

  const cancelEdit = () => {
    setEditingProject(null)
    setFormData({ name: '', color: '#3b82f6' })
    setErrors({})
  }

  const getProjectEntryCount = (projectId: string) => {
    return entries?.filter(e => e.projectId === projectId).length || 0
  }

  const getProjectTotalTime = (projectId: string) => {
    const projectEntries = entries?.filter(e => e.projectId === projectId) || []
    return projectEntries.reduce((total, entry) => {
      if (entry.endTs) {
        const start = new Date(entry.startTs)
        const end = new Date(entry.endTs)
        const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / 1000 / 60)
        return total + diffInMinutes
      }
      return total
    }, 0)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  if (projects?.length === 0 && !showCreateForm) {
    return (
      <div className="text-center py-16 px-6">
        <FolderOpen size={64} style={{ margin: '0 auto 24px', color: '#6b7280' }} />
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#f9fafb',
          margin: '0 0 8px 0'
        }}>
          No Projects Yet
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#9ca3af',
          margin: '0 0 32px 0'
        }}>
          Create your first project to start organizing your time tracking
        </p>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-6 py-3 glass-tint-blue text-white rounded-lg cursor-pointer text-base font-medium mx-auto glass-hover"
        >
          <Plus size={20} />
          Create First Project
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header with Create Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-100 mb-1">
              All Projects
            </h2>
            <p className="text-sm text-gray-400">
              {projects?.length || 0} projects
            </p>
          </div>
        
        {!showCreateForm && !editingProject && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 glass-tint-blue text-white rounded-lg cursor-pointer text-sm font-medium glass-hover"
          >
            <Plus size={16} />
            New Project
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingProject) && (
        <div className="glass-card rounded-lg p-6 mb-6 glass-enter">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-100">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h3>
            <button
              onClick={editingProject ? cancelEdit : () => setShowCreateForm(false)}
              className="p-2 text-gray-400 hover:text-gray-100 cursor-pointer rounded"
            >
              ✕
            </button>
          </div>

          <form onSubmit={editingProject ? handleEdit : handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name..."
                  className={`w-full px-3 py-2.5 text-sm glass-subtle rounded-md text-white ${
                    errors.name ? 'border-2 border-red-500' : 'border border-gray-500'
                  } focus:border-gray-400 focus:glass-card focus:outline-none`}
                />
                {errors.name && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      className={`w-10 h-10 rounded-lg cursor-pointer flex items-center justify-center transition-all duration-200 ${
                        formData.color === color.value 
                          ? 'glass-strong border-2 border-white' 
                          : 'glass-subtle border border-gray-500 hover:glass-card'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {formData.color === color.value && (
                        <span style={{ color: 'white', fontSize: '16px' }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errors.submit && (
              <p style={{ color: '#ef4444', fontSize: '14px', margin: '0 0 16px 0' }}>
                {errors.submit}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={editingProject ? cancelEdit : () => setShowCreateForm(false)}
                className="px-4 py-2 text-sm text-gray-400 glass-subtle border border-gray-500 rounded-md cursor-pointer hover:glass-card"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm text-white border-none rounded-md ${
                  isSubmitting 
                    ? 'glass-subtle cursor-not-allowed' 
                    : 'glass-tint-blue cursor-pointer hover:glass-card'
                }`}
              >
                {isSubmitting ? 'Saving...' : (editingProject ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div className="flex flex-col gap-3">
        {projects?.map(project => (
          <div
            key={project.id}
            className="glass-card rounded-lg p-4 flex items-center justify-between glass-hover"
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Color Indicator */}
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: project.color || '#6b7280',
                  flexShrink: 0
                }}
              />
              
              {/* Project Info */}
              <div className="flex-1">
                <h4 className="text-base font-semibold text-gray-100 mb-1">
                  {project.name}
                </h4>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>{getProjectEntryCount(project.id)} entries</span>
                  <span>{formatDuration(getProjectTotalTime(project.id))} total</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1.5">
              <button
                onClick={() => startEdit(project)}
                className="p-2 glass-subtle border border-gray-500 rounded-md text-gray-400 cursor-pointer hover:glass-card hover:text-gray-100 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Edit project"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(project.id)}
                className="p-2 glass-subtle border border-gray-500 rounded-md text-red-400 cursor-pointer hover:glass-card hover:text-red-300 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Delete project"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
