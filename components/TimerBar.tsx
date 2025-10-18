'use client'

import React, { useState, useEffect } from 'react'
import { useTimer } from '@/lib/hooks/useTimer'
import { useProjects } from '@/lib/db'
import ProjectSelector from './ProjectSelector'

export default function TimerBar() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>()
  const [note, setNote] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  const timer = useTimer()
  const projects = useProjects()

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  // Mobile FAB
  if (isMobile) {
    return (
      <>
        {/* Mobile FAB */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`fixed bottom-4 right-4 z-50 w-16 h-16 rounded-full glass-strong transition-all duration-300 ${
            timer.isRunning 
              ? 'glass-tint-green shadow-green-500/30' 
              : 'glass-tint-blue shadow-blue-500/30'
          }`}
        >
          <div className="flex flex-col items-center justify-center text-white">
            <div className="text-xs font-mono font-bold">
              {timer.isRunning ? timer.getFormattedElapsedTime() : '00:00'}
            </div>
            {timer.isRunning && (
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse mt-1" />
            )}
          </div>
        </button>

        {/* Mobile Expanded Panel */}
        {isExpanded && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md" onClick={() => setIsExpanded(false)}>
            <div className="fixed bottom-0 left-0 right-0 glass-strong border-t border-gray-600 rounded-t-xl p-6 glass-enter" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-100">Timer</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 text-gray-400 hover:text-gray-100"
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>

              {/* Timer Display */}
              <div className="text-center mb-6">
                <div className={`text-4xl font-mono font-bold mb-2 ${
                  timer.isRunning ? 'text-green-100' : 'text-gray-300'
                }`}>
                  {timer.isRunning ? timer.getFormattedElapsedTime() : '00:00:00'}
                </div>
                {timer.isRunning && timer.currentEntry && (
                  <div className="flex items-center justify-center gap-2">
                    {selectedProject && (
                      <div 
                        className="px-2 py-1 rounded text-xs font-semibold text-white uppercase tracking-wide"
                        style={{ backgroundColor: selectedProject.color || '#6B7280' }}
                      >
                        {selectedProject.name}
                      </div>
                    )}
                    {timer.currentEntry.note && (
                      <div className="text-sm text-gray-300 italic">
                        {timer.currentEntry.note}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="space-y-4">
                {!timer.isRunning && (
                  <>
                    <div className="space-y-3">
                      <ProjectSelector
                        selectedProjectId={selectedProjectId}
                        onProjectSelect={setSelectedProjectId}
                        placeholder="Project"
                      />
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Optional note..."
                        className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <button
                      onClick={handleStartTimer}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      Start Timer
                    </button>
                  </>
                )}

                {timer.isRunning && (
                  <button
                    onClick={handleStopTimer}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h12v12H6z"/>
                    </svg>
                    Stop Timer
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add bottom padding to prevent content from being hidden behind the FAB */}
        <div className="h-20" />
      </>
    )
  }

  return (
    <>
      {/* Desktop Timer Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg transition-all duration-500 ${
        timer.isRunning 
          ? 'glass-tint-green border-green-600 shadow-green-500/20' 
          : 'glass-strong border-gray-600 shadow-gray-500/10'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Timer Display */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              {/* Timer Status with Animation */}
              <div className="flex items-center gap-3">
                {timer.isRunning && (
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50 glass-subtle" />
                )}
                <div className={`text-3xl font-mono font-bold tracking-wider transition-all duration-300 ${
                  timer.isRunning 
                    ? 'text-green-100 drop-shadow-lg' 
                    : 'text-gray-300'
                }`}>
                  {timer.isRunning ? timer.getFormattedElapsedTime() : '00:00:00'}
                </div>
                {timer.isRunning && (
                  <div className="text-xs text-green-300 font-medium animate-pulse">
                    REC
                  </div>
                )}
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
                  <div className="flex items-center gap-2 opacity-60 hover:opacity-80 transition-opacity duration-300">
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
                      placeholder="Optional note..."
                      className="px-3 py-2 text-sm border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 w-40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Primary Start Button */}
                  <button
                    onClick={handleStartTimer}
                    className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white border-none rounded-lg cursor-pointer text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 min-w-[100px] justify-center hover:shadow-green-500/25"
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
                    className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white border-none rounded-lg cursor-pointer text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 min-w-[100px] justify-center hover:shadow-red-500/25"
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