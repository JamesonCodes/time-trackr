'use client'

import { useState } from 'react'
import { useTimer } from '@/lib/hooks/useTimer'
import { useProjects } from '@/lib/db'

export default function TimerBar() {
  const [showProjectSelector, setShowProjectSelector] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>()
  const [note, setNote] = useState('')
  
  const timer = useTimer()
  const projects = useProjects()

  const handleStartTimer = async () => {
    try {
      await timer.startTimer(selectedProjectId, note.trim() || undefined)
      setNote('')
      setShowProjectSelector(false)
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
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowProjectSelector(!showProjectSelector)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '8px 12px',
                        fontSize: '14px',
                        border: '1px solid #4b5563',
                        borderRadius: '6px',
                        backgroundColor: '#374151',
                        color: '#f9fafb',
                        cursor: 'pointer'
                      }}
                    >
                      <span>
                        {selectedProject ? selectedProject.name : 'Select Project'}
                      </span>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showProjectSelector && (
                      <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        marginBottom: '8px',
                        left: 0,
                        width: '192px',
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '6px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        zIndex: 10
                      }}>
                        <div style={{ padding: '8px' }}>
                          <button
                            onClick={() => {
                              setSelectedProjectId(undefined)
                              setShowProjectSelector(false)
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '4px 8px',
                              fontSize: '14px',
                              backgroundColor: 'transparent',
                              color: '#f9fafb',
                              border: 'none',
                              cursor: 'pointer',
                              borderRadius: '4px'
                            }}
                          >
                            No Project
                          </button>
                          {projects?.map((project) => (
                            <button
                              key={project.id}
                              onClick={() => {
                                setSelectedProjectId(project.id)
                                setShowProjectSelector(false)
                              }}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '4px 8px',
                                fontSize: '14px',
                                backgroundColor: 'transparent',
                                color: '#f9fafb',
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '4px',
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
                                  backgroundColor: project.color || '#6B7280'
                                }}
                              />
                              <span>{project.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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