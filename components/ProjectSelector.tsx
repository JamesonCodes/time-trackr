'use client'

import React, { useState } from 'react'
import { useProjects } from '@/lib/db'
import { ChevronDown } from 'lucide-react'

interface ProjectSelectorProps {
  selectedProjectId?: string
  onProjectSelect: (projectId: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  style?: React.CSSProperties
}

export default function ProjectSelector({
  selectedProjectId,
  onProjectSelect,
  placeholder = 'Select Project',
  disabled = false,
  style = {}
}: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const projects = useProjects()

  const selectedProject = projects?.find(p => p.id === selectedProjectId)

  // Debug: Log projects and dropdown state
  React.useEffect(() => {
    console.log('ProjectSelector projects:', projects)
    console.log('ProjectSelector isOpen:', isOpen)
  }, [projects, isOpen])

  const handleSelect = (projectId: string | undefined) => {
    onProjectSelect(projectId)
    setIsOpen(false)
  }

  const defaultStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    ...style
  }

  return (
    <div style={defaultStyle}>
      {/* Selected Project Display */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          border: '1px solid #4b5563',
          borderRadius: '6px',
          backgroundColor: '#1f2937',
          color: '#f9fafb',
          minHeight: '40px',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: 1
        }}>
          {selectedProject ? (
            <>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: selectedProject.color || '#6b7280',
                  flexShrink: 0
                }}
              />
              <span style={{
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {selectedProject.name}
              </span>
            </>
          ) : (
            <span style={{
              fontSize: '14px',
              color: '#9ca3af'
            }}>
              {placeholder}
            </span>
          )}
        </div>
        
        <ChevronDown 
          size={16} 
          style={{
            color: '#9ca3af',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </div>

      {/* Dropdown Options */}
      {isOpen && !disabled && (
        <div style={{
          position: 'fixed',
          top: 'auto',
          bottom: '100px', // Position above timer bar
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          backgroundColor: '#1f2937',
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {/* No Project Option */}
          <button
            onClick={() => handleSelect(undefined)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '8px 12px',
              fontSize: '14px',
              backgroundColor: 'transparent',
              color: '#f9fafb',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#6b7280',
                flexShrink: 0
              }}
            />
            <span>No Project</span>
          </button>

          {/* Project Options */}
          {projects?.map(project => (
            <button
              key={project.id}
              onClick={() => handleSelect(project.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                fontSize: '14px',
                backgroundColor: selectedProjectId === project.id ? '#374151' : 'transparent',
                color: '#f9fafb',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (selectedProjectId !== project.id) {
                  e.currentTarget.style.backgroundColor = '#374151'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedProjectId !== project.id) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: project.color || '#6b7280',
                  flexShrink: 0
                }}
              />
              <span>{project.name}</span>
            </button>
          ))}

          {/* Empty State */}
          {(!projects || projects.length === 0) && (
            <div style={{
              padding: '16px 12px',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '14px'
            }}>
              No projects created yet
            </div>
          )}
        </div>
      )}

      {/* Click Outside Handler */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
