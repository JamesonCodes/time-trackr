'use client'

import { useState } from 'react'
import { useProjects, useEntries, useRunningEntry, projectService, entryService } from '@/lib/db'
import { useTimer } from '@/lib/hooks/useTimer'

export default function DatabaseTest() {
  const [projectName, setProjectName] = useState('')
  const [entryNote, setEntryNote] = useState('')
  
  const projects = useProjects()
  const entries = useEntries()
  const runningEntry = useRunningEntry()
  const timer = useTimer()

  const handleCreateProject = async () => {
    if (projectName.trim()) {
      try {
        await projectService.create(projectName.trim())
        setProjectName('')
      } catch (error) {
        console.error('Failed to create project:', error)
      }
    }
  }

  const handleStartTimer = async () => {
    try {
      await timer.startTimer(undefined, entryNote)
      setEntryNote('')
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Database Test</h2>
      
      {/* Projects Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Projects</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project name"
            className="px-3 py-2 border rounded-md"
          />
          <button
            onClick={handleCreateProject}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Create Project
          </button>
        </div>
        <div className="space-y-2">
          {projects?.map((project) => (
            <div key={project.id} className="p-3 border rounded-md">
              <span className="font-medium">{project.name}</span>
              {project.color && (
                <span className="ml-2 px-2 py-1 text-xs rounded" style={{ backgroundColor: project.color }}>
                  {project.color}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Timer Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Timer</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={entryNote}
            onChange={(e) => setEntryNote(e.target.value)}
            placeholder="Entry note (optional)"
            className="px-3 py-2 border rounded-md"
          />
          {timer.isRunning ? (
            <button
              onClick={handleStopTimer}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Stop Timer
            </button>
          ) : (
            <button
              onClick={handleStartTimer}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Start Timer
            </button>
          )}
        </div>
        {timer.isRunning && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-lg font-mono">{timer.getFormattedElapsedTime()}</p>
            <p className="text-sm text-gray-600">Running since {timer.startTime}</p>
          </div>
        )}
      </div>

      {/* Entries Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Entries</h3>
        <div className="space-y-2">
          {entries?.map((entry) => (
            <div key={entry.id} className="p-3 border rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {entry.startTs} - {entry.endTs || 'Running'}
                  </p>
                  {entry.note && <p className="text-sm text-gray-600">{entry.note}</p>}
                  <p className="text-xs text-gray-500">Source: {entry.source}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                  {entry.projectId || 'No project'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Running Entry */}
      {runningEntry && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Running Entry</h3>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="font-medium">Currently running</p>
            <p className="text-sm text-gray-600">Started: {runningEntry.startTs}</p>
            {runningEntry.note && <p className="text-sm text-gray-600">Note: {runningEntry.note}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
