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
      <div style={{
        textAlign: 'center',
        padding: '64px 24px'
      }}>
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
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            margin: '0 auto'
          }}
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#f9fafb',
            margin: '0 0 4px 0'
          }}>
            All Projects
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#9ca3af',
            margin: 0
          }}>
            {projects?.length || 0} projects
          </p>
        </div>
        
        {!showCreateForm && !editingProject && (
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Plus size={16} />
            New Project
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingProject) && (
        <div style={{
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#f9fafb',
              margin: 0
            }}>
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h3>
            <button
              onClick={editingProject ? cancelEdit : () => setShowCreateForm(false)}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={editingProject ? handleEdit : handleCreate}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              {/* Project Name */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#d1d5db',
                  marginBottom: '4px'
                }}>
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: errors.name ? '2px solid #ef4444' : '1px solid #4b5563',
                    borderRadius: '6px',
                    backgroundColor: '#111827',
                    color: '#f9fafb'
                  }}
                />
                {errors.name && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Color Picker */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#d1d5db',
                  marginBottom: '8px'
                }}>
                  Color
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '8px'
                }}>
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      style={{
                        width: '40px',
                        height: '40px',
                            borderRadius: '8px',
                            border: formData.color === color.value ? '3px solid #f9fafb' : '2px solid #4b5563',
                            backgroundColor: color.value,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                      }}
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

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px'
            }}>
              <button
                type="button"
                onClick={editingProject ? cancelEdit : () => setShowCreateForm(false)}
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
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: isSubmitting ? '#6b7280' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Saving...' : (editingProject ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {projects?.map(project => (
          <div
            key={project.id}
            style={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flex: 1
            }}>
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
              <div style={{ flex: 1 }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#f9fafb',
                  margin: '0 0 4px 0'
                }}>
                  {project.name}
                </h4>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  fontSize: '14px',
                  color: '#9ca3af'
                }}>
                  <span>{getProjectEntryCount(project.id)} entries</span>
                  <span>{formatDuration(getProjectTotalTime(project.id))} total</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button
                onClick={() => startEdit(project)}
                style={{
                  padding: '6px',
                  backgroundColor: 'transparent',
                  border: '1px solid #4b5563',
                  borderRadius: '4px',
                  color: '#9ca3af',
                  cursor: 'pointer'
                }}
                title="Edit project"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => handleDelete(project.id)}
                style={{
                  padding: '6px',
                  backgroundColor: 'transparent',
                  border: '1px solid #4b5563',
                  borderRadius: '4px',
                  color: '#ef4444',
                  cursor: 'pointer'
                }}
                title="Delete project"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
