'use client'

import { useState, useEffect, useCallback } from 'react'
import { entryService, type Entry } from '@/lib/db'
import { calculateDurationToNow, formatDuration } from '@/lib/utils/time'

interface TimerState {
  isRunning: boolean
  elapsedTime: number
  startTime: string | null
  currentEntry: Entry | null
}

export const useTimer = () => {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    elapsedTime: 0,
    startTime: null,
    currentEntry: null
  })

  // Load running entry on mount
  useEffect(() => {
    const loadRunningEntry = async () => {
      try {
        const runningEntry = await entryService.getRunning()
        if (runningEntry) {
          setTimerState({
            isRunning: true,
            elapsedTime: calculateDurationToNow(runningEntry.startTs),
            startTime: runningEntry.startTs,
            currentEntry: runningEntry
          })
        }
      } catch (error) {
        console.error('Failed to load running entry:', error)
      }
    }

    loadRunningEntry()
  }, [])

  // Update elapsed time every second when running
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerState.isRunning && timerState.startTime) {
      interval = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          elapsedTime: calculateDurationToNow(prev.startTime!)
        }))
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerState.isRunning, timerState.startTime])

  const startTimer = useCallback(async (projectId?: string, note?: string) => {
    try {
      // Stop any existing running timer
      if (timerState.isRunning) {
        await stopTimer()
      }

      const now = new Date().toISOString()
      const entry = await entryService.create({
        projectId,
        startTs: now,
        note,
        source: 'timer'
      })

      setTimerState({
        isRunning: true,
        elapsedTime: 0,
        startTime: now,
        currentEntry: entry
      })
    } catch (error) {
      console.error('Failed to start timer:', error)
      throw error
    }
  }, [timerState.isRunning])

  const stopTimer = useCallback(async () => {
    try {
      if (timerState.currentEntry) {
        await entryService.update(timerState.currentEntry.id, {
          endTs: new Date().toISOString()
        })
      }

      setTimerState({
        isRunning: false,
        elapsedTime: 0,
        startTime: null,
        currentEntry: null
      })
    } catch (error) {
      console.error('Failed to stop timer:', error)
      throw error
    }
  }, [timerState.currentEntry])

  const pauseTimer = useCallback(async () => {
    // For now, we'll just stop the timer
    // In a more advanced implementation, we could add pause/resume functionality
    await stopTimer()
  }, [stopTimer])

  const resumeTimer = useCallback(async () => {
    if (timerState.currentEntry) {
      await startTimer(timerState.currentEntry.projectId, timerState.currentEntry.note)
    }
  }, [timerState.currentEntry, startTimer])

  const getFormattedElapsedTime = useCallback(() => {
    return formatDuration(timerState.elapsedTime)
  }, [timerState.elapsedTime])

  const getElapsedHours = useCallback(() => {
    return timerState.elapsedTime / 60
  }, [timerState.elapsedTime])

  return {
    ...timerState,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    getFormattedElapsedTime,
    getElapsedHours
  }
}
