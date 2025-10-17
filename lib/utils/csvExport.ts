import { format, parseISO } from 'date-fns'
import type { Entry, Project } from '@/lib/db'

export interface CSVExportOptions {
  entries: Entry[]
  projects: Project[]
  dateRange?: {
    start: Date
    end: Date
  }
  includeHeaders?: boolean
}

export interface CSVRow {
  date: string
  project: string
  start: string
  end: string
  duration_minutes: number
  duration_hours: string
  note: string
  source: string
}

export function generateCSVData(options: CSVExportOptions): CSVRow[] {
  const { entries, projects, dateRange, includeHeaders = true } = options

  // Filter entries by date range if provided
  let filteredEntries = entries
  if (dateRange) {
    filteredEntries = entries.filter(entry => {
      const entryDate = parseISO(entry.startTs)
      return entryDate >= dateRange.start && entryDate <= dateRange.end
    })
  }

  // Sort entries by start time
  filteredEntries.sort((a, b) => 
    new Date(a.startTs).getTime() - new Date(b.startTs).getTime()
  )

  // Generate CSV rows
  const rows: CSVRow[] = filteredEntries.map(entry => {
    const startDate = parseISO(entry.startTs)
    const endDate = entry.endTs ? parseISO(entry.endTs) : null
    
    // Calculate duration in minutes
    const durationMinutes = endDate 
      ? Math.floor((endDate.getTime() - startDate.getTime()) / 1000 / 60)
      : 0

    // Get project name
    const project = projects.find(p => p.id === entry.projectId)
    const projectName = project?.name || 'No Project'

    return {
      date: format(startDate, 'yyyy-MM-dd'),
      project: projectName,
      start: format(startDate, 'HH:mm:ss'),
      end: endDate ? format(endDate, 'HH:mm:ss') : 'Running',
      duration_minutes: durationMinutes,
      duration_hours: (durationMinutes / 60).toFixed(2),
      note: entry.note || '',
      source: entry.source
    }
  })

  return rows
}

export function convertToCSVString(rows: CSVRow[]): string {
  if (rows.length === 0) {
    return 'date,project,start,end,duration_minutes,duration_hours,note,source\n'
  }

  // CSV headers
  const headers = [
    'Date',
    'Project',
    'Start Time',
    'End Time',
    'Duration (minutes)',
    'Duration (hours)',
    'Note',
    'Source'
  ]

  // Convert rows to CSV format
  const csvRows = rows.map(row => [
    row.date,
    `"${row.project}"`, // Quote project names in case they contain commas
    row.start,
    row.end,
    row.duration_minutes.toString(),
    row.duration_hours,
    `"${row.note}"`, // Quote notes in case they contain commas
    row.source
  ])

  // Combine headers and rows
  const csvContent = [headers, ...csvRows]
    .map(row => row.join(','))
    .join('\n')

  return csvContent
}

export function downloadCSV(csvContent: string, filename: string): void {
  // Create blob with CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  
  // Create download link
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  // Trigger download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up
  URL.revokeObjectURL(url)
}

export function exportEntriesToCSV(options: CSVExportOptions): void {
  const rows = generateCSVData(options)
  const csvContent = convertToCSVString(rows)
  
  // Generate filename with timestamp
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
  const filename = `timetrackr-export-${timestamp}.csv`
  
  downloadCSV(csvContent, filename)
}

export function exportWeekToCSV(entries: Entry[], projects: Project[], weekStart: Date): void {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  exportEntriesToCSV({
    entries,
    projects,
    dateRange: {
      start: weekStart,
      end: weekEnd
    }
  })
}

export function exportAllDataToCSV(entries: Entry[], projects: Project[]): void {
  exportEntriesToCSV({
    entries,
    projects
  })
}
