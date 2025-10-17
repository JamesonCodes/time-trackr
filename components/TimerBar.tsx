'use client'

import React, { useState } from 'react'
import { useTimer } from '@/lib/hooks/useTimer'
import { useProjects } from '@/lib/db'
import ProjectSelector from './ProjectSelector'

export default function TimerBar() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>()
  const [note, setNote] = useState('')
  
  const timer = useTimer()
  const projects = useProjects()

  // Debug: Log projects to see if they're loading
  React.useEffect(() => {
    console.log('TimerBar projects:', projects)
  }, [projects])

  const handleStartTimer = async () => {
    try {
      await timer.startTimer(selectedProjectId, note.trim() || undefined)
      setNote('')
    } catch (error) {
      console.error('Failed to start timer:', error)
    }
  }

  const handleStopTimer = async () => {
    try {
      await timer.stopTimer()
    } catch (error) {
      console.error('Failed to stop timer:', error)
    }
  }

  const selectedProject = projects?.find(p => p.id === selectedProjectId)

  return (
    <>
      {/* Floating Timer Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: '#1f2937',
        borderTop: '1px solid #374151',
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Timer Display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '24px', fontFamily: 'monospace', fontWeight: 'bold', color: 'white' }}>
                {timer.isRunning ? timer.getFormattedElapsedTime() : '00:00:00'}
              </div>
              
              {timer.isRunning && timer.currentEntry && (
                <div style={{ fontSize: '14px', color: '#d1d5db' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectedProject && (
                      <span 
                        style={{ 
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: selectedProject.color || '#6B7280',
                          color: 'white'
                        }}
                      >
                        {selectedProject.name}
                      </span>
                    )}
                    {timer.currentEntry.note && (
                      <span style={{ color: '#9ca3af' }}>
                        {timer.currentEntry.note}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Timer Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!timer.isRunning ? (
                <>
                  {/* Project Selector */}
                  <div style={{ minWidth: '200px' }}>
                    <ProjectSelector
                      selectedProjectId={selectedProjectId}
                      onProjectSelect={setSelectedProjectId}
                      placeholder="Select Project"
                    />
                  </div>

                  {/* Note Input */}
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note..."
                    style={{
                      padding: '8px 12px',
                      fontSize: '14px',
                      border: '1px solid #4b5563',
                      borderRadius: '6px',
                      backgroundColor: '#374151',
                      color: '#f9fafb',
                      width: '200px'
                    }}
                  />

                  {/* Start Button */}
                  <button
                    onClick={handleStartTimer}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 16px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span>Start</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Stop Button */}
                  <button
                    onClick={handleStopTimer}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 16px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h12v12H6z"/>
                    </svg>
                    <span>Stop</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add bottom padding to prevent content from being hidden behind the timer bar */}
      <div style={{ height: '80px' }} />
    </>
  )
}