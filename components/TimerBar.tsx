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
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-700 border-t border-gray-600 shadow-lg backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Timer Display */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              {/* Timer Status with Animation */}
              <div className="flex items-center gap-3">
                {timer.isRunning && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
                <div className="text-3xl font-mono font-bold text-white tracking-wider">
                  {timer.isRunning ? timer.getFormattedElapsedTime() : '00:00:00'}
                </div>
              </div>
              
              {/* Active Timer Info */}
              {timer.isRunning && timer.currentEntry && (
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {selectedProject && (
                    <div 
                      className="px-2 py-1 rounded text-xs font-semibold text-white uppercase tracking-wide"
                      style={{ backgroundColor: selectedProject.color || '#6B7280' }}
                    >
                      {selectedProject.name}
                    </div>
                  )}
                  {timer.currentEntry.note && (
                    <div className="text-sm text-gray-300 italic truncate">
                      {timer.currentEntry.note}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {!timer.isRunning ? (
                <>
                  {/* Secondary Controls */}
                  <div className="flex items-center gap-2 opacity-80">
                    {/* Project Selector */}
                    <div className="min-w-[180px]">
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
                      className="px-3 py-2 text-sm border border-gray-500 rounded-md bg-gray-600 text-white placeholder-gray-400 w-40 focus:border-gray-400 focus:bg-gray-500 focus:outline-none transition-all duration-200"
                    />
                  </div>

                  {/* Primary Start Button */}
                  <button
                    onClick={handleStartTimer}
                    className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white border-none rounded-lg cursor-pointer text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 min-w-[100px] justify-center"
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
                    className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white border-none rounded-lg cursor-pointer text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 min-w-[100px] justify-center"
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
      <div className="h-20" />
    </>
  )
}