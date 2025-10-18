'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('top')
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isDropdown = (target as Element)?.closest('[data-project-selector]')
      
      if (containerRef.current && !containerRef.current.contains(target) && !isDropdown) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update dropdown position when modal scrolls or resizes
  useEffect(() => {
    if (!isOpen || !dropdownRef.current || !containerRef.current) return

    const updatePosition = () => {
      const containerRect = containerRef.current!.getBoundingClientRect()
      
      // Check if dropdown would go off-screen and adjust position
      const dropdownHeight = 200 // Approximate dropdown height
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - containerRect.bottom
      const spaceAbove = containerRect.top
      
      // Add more buffer space to prevent overlap
      const bufferSpace = 20
      
      // Prefer top position (like time picker), fall back to bottom if not enough space above
      if (spaceAbove >= dropdownHeight + bufferSpace) {
        setDropdownPosition('top')
        dropdownRef.current!.style.top = 'auto'
        dropdownRef.current!.style.bottom = `${window.innerHeight - containerRect.top + bufferSpace}px`
      } else {
        setDropdownPosition('bottom')
        dropdownRef.current!.style.bottom = 'auto'
        dropdownRef.current!.style.top = `${containerRect.bottom + bufferSpace}px`
      }
      
      // Ensure dropdown doesn't go off the right edge and center when possible
      const dropdownWidth = 300 // Dropdown width
      const spaceRight = window.innerWidth - containerRect.left
      
      // Try to center the dropdown relative to the input field
      const inputCenter = containerRect.left + (containerRect.width / 2)
      const idealLeft = inputCenter - (dropdownWidth / 2)
      
      // Check if centered position would fit
      if (idealLeft >= 10 && idealLeft + dropdownWidth <= window.innerWidth - 10) {
        dropdownRef.current!.style.left = `${idealLeft}px`
      } else if (spaceRight < dropdownWidth) {
        dropdownRef.current!.style.left = `${Math.max(10, containerRect.right - dropdownWidth)}px`
      } else {
        dropdownRef.current!.style.left = `${containerRect.left}px`
      }
    }

    updatePosition()
    
    // Update position on scroll and resize
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])

  const defaultStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    ...style
  }

  return (
    <div ref={containerRef} style={defaultStyle}>
      {/* Selected Project Display */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          border: '1px solid #4b5563',
          borderRadius: '8px',
          backgroundColor: '#374151',
          color: '#f3f4f6',
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
      {isOpen && !disabled && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] w-80 glass-card rounded-xl shadow-2xl"
          data-project-selector
          onClick={(e) => e.stopPropagation()}
        >
          {/* No Project Option */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleSelect(undefined)
            }}
            className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:glass-subtle hover:text-white rounded-lg transition-all duration-200 flex items-center gap-2"
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
              onClick={(e) => {
                e.stopPropagation()
                handleSelect(project.id)
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 flex items-center gap-2 ${
                selectedProjectId === project.id
                  ? 'bg-blue-500/20 text-blue-300 font-medium border border-blue-500/30'
                  : 'text-gray-200 hover:glass-subtle hover:text-white'
              }`}
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
            <div className="px-3 py-4 text-center text-gray-400 text-sm">
              No projects created yet
            </div>
          )}
        </div>
        , document.body
      )}
    </div>
  )
}
