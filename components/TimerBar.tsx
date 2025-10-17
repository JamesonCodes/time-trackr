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
        backgroundColor: '#374151', // Lighter surface tone than main background
        borderTop: '1px solid #4b5563',
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)',
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            {/* Timer Display */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              minWidth: '0',
              flex: '1'
            }}>
              {/* Timer Status with Animation */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {timer.isRunning && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }} />
                )}
                <div style={{
                  fontSize: '28px',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  color: '#f9fafb',
                  letterSpacing: '0.05em'
                }}>
                  {timer.isRunning ? timer.getFormattedElapsedTime() : '00:00:00'}
                </div>
              </div>
              
              {/* Active Timer Info */}
              {timer.isRunning && timer.currentEntry && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  minWidth: '0',
                  flex: '1'
                }}>
                  {selectedProject && (
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'white',
                      backgroundColor: selectedProject.color || '#6B7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {selectedProject.name}
                    </div>
                  )}
                  {timer.currentEntry.note && (
                    <div style={{
                      fontSize: '14px',
                      color: '#d1d5db',
                      fontStyle: 'italic',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {timer.currentEntry.note}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Timer Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexShrink: 0
            }}>
              {!timer.isRunning ? (
                <>
                  {/* Secondary Controls */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: '0.8'
                  }}>
                    {/* Project Selector */}
                    <div style={{ minWidth: '180px' }}>
                      <ProjectSelector
                        selectedProjectId={selectedProjectId}
                        onProjectSelect={setSelectedProjectId}
                        placeholder="Project"
                      />
                    </div>

                    {/* Note Input */}
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Note..."
                      style={{
                        padding: '8px 12px',
                        fontSize: '14px',
                        border: '1px solid #6b7280',
                        borderRadius: '6px',
                        backgroundColor: '#4b5563',
                        color: '#f9fafb',
                        width: '160px',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#9ca3af'
                        e.target.style.backgroundColor = '#6b7280'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#6b7280'
                        e.target.style.backgroundColor = '#4b5563'
                      }}
                    />
                  </div>

                  {/* Primary Start Button */}
                  <button
                    onClick={handleStartTimer}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.2s ease',
                      minWidth: '100px',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#059669'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#10b981'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span>Start</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Primary Stop Button */}
                  <button
                    onClick={handleStopTimer}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                      transition: 'all 0.2s ease',
                      minWidth: '100px',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ef4444'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
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

      {/* CSS Animation for Pulse Effect */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  )
}