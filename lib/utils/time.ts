/**
 * Time Utilities
 * 
 * Helper functions for time formatting and calculations.
 * Used throughout the app for consistent time display and duration calculations.
 * 
 * Features:
 * - Duration formatting (HH:MM:SS and decimal hours)
 * - Date/time formatting for display
 * - Duration calculations with second-level precision
 * - Integration with date-fns for robust date handling
 */

import { format, parseISO, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns'

// Format duration in minutes to HH:MM:SS
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  const secs = Math.floor((minutes % 1) * 60)
  
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Format duration in minutes to decimal hours (e.g., 1.5 hours)
export const formatDurationHours = (minutes: number): string => {
  const hours = minutes / 60
  return hours.toFixed(1)
}

// Calculate duration between two timestamps in minutes
export const calculateDuration = (startTs: string, endTs: string): number => {
  const start = parseISO(startTs)
  const end = parseISO(endTs)
  const diffInSeconds = Math.floor((end.getTime() - start.getTime()) / 1000)
  return diffInSeconds / 60 // Convert to minutes with decimal precision
}

// Calculate duration from start timestamp to now in minutes
export const calculateDurationToNow = (startTs: string): number => {
  const start = parseISO(startTs)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - start.getTime()) / 1000)
  return diffInSeconds / 60 // Convert to minutes with decimal precision
}

// Format timestamp to readable date string
export const formatDate = (timestamp: string): string => {
  return format(parseISO(timestamp), 'MMM d, yyyy')
}

// Format timestamp to readable time string
export const formatTime = (timestamp: string): string => {
  return format(parseISO(timestamp), 'h:mm a')
}

// Format timestamp to readable date and time string
export const formatDateTime = (timestamp: string): string => {
  return format(parseISO(timestamp), 'MMM d, yyyy h:mm a')
}

// Get start of day for a given date
export const getStartOfDay = (date: Date): string => {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  return startOfDay.toISOString()
}

// Get end of day for a given date
export const getEndOfDay = (date: Date): string => {
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  return endOfDay.toISOString()
}

// Get start of week (Sunday) for a given date
export const getStartOfWeek = (date: Date): string => {
  const startOfWeek = new Date(date)
  const day = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - day
  startOfWeek.setDate(diff)
  startOfWeek.setHours(0, 0, 0, 0)
  return startOfWeek.toISOString()
}

// Get end of week (Saturday) for a given date
export const getEndOfWeek = (date: Date): string => {
  const endOfWeek = new Date(date)
  const day = endOfWeek.getDay()
  const diff = endOfWeek.getDate() - day + 6
  endOfWeek.setDate(diff)
  endOfWeek.setHours(23, 59, 59, 999)
  return endOfWeek.toISOString()
}

// Check if two dates are the same day
export const isSameDay = (date1: string, date2: string): boolean => {
  const d1 = parseISO(date1)
  const d2 = parseISO(date2)
  return differenceInDays(d1, d2) === 0
}

// Get relative time string (e.g., "2 hours ago")
export const getRelativeTime = (timestamp: string): string => {
  const date = parseISO(timestamp)
  const now = new Date()
  const diffInMinutes = differenceInMinutes(now, date)
  
  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = differenceInHours(now, date)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = differenceInDays(now, date)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return formatDate(timestamp)
}

// Get time bucket for grouping entries by time of day
export const getTimeBucket = (timestamp: string): 'Morning' | 'Afternoon' | 'Evening' => {
  const hour = parseISO(timestamp).getHours()
  if (hour < 12) return 'Morning'
  if (hour < 18) return 'Afternoon'
  return 'Evening'
}

// Generate time range options for reports
export const getTimeRangeOptions = () => {
  const now = new Date()
  const today = new Date(now)
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const lastWeek = new Date(now)
  lastWeek.setDate(lastWeek.getDate() - 7)
  const lastMonth = new Date(now)
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  
  return {
    today: {
      label: 'Today',
      start: getStartOfDay(today),
      end: getEndOfDay(today)
    },
    yesterday: {
      label: 'Yesterday',
      start: getStartOfDay(yesterday),
      end: getEndOfDay(yesterday)
    },
    lastWeek: {
      label: 'Last 7 days',
      start: getStartOfDay(lastWeek),
      end: getEndOfDay(today)
    },
    lastMonth: {
      label: 'Last 30 days',
      start: getStartOfDay(lastMonth),
      end: getEndOfDay(today)
    }
  }
}
