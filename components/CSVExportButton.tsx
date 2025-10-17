'use client'

import React, { useState } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import { useEntries, useProjects } from '@/lib/db'
import { exportEntriesToCSV, exportWeekToCSV, exportAllDataToCSV } from '@/lib/utils/csvExport'

interface CSVExportButtonProps {
  variant?: 'default' | 'week' | 'all'
  weekStart?: Date
  disabled?: boolean
  style?: React.CSSProperties
}

export default function CSVExportButton({ 
  variant = 'default', 
  weekStart, 
  disabled = false,
  style = {}
}: CSVExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const entries = useEntries()
  const projects = useProjects()

  const handleExport = async () => {
    if (!entries || !projects) return

    setIsExporting(true)
    
    try {
      switch (variant) {
        case 'week':
          if (weekStart) {
            exportWeekToCSV(entries, projects, weekStart)
          }
          break
        case 'all':
          exportAllDataToCSV(entries, projects)
          break
        default:
          exportEntriesToCSV({ entries, projects })
          break
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const getButtonText = () => {
    if (isExporting) return 'Exporting...'
    
    switch (variant) {
      case 'week':
        return 'Export Week'
      case 'all':
        return 'Export All Data'
      default:
        return 'Export CSV'
    }
  }

  const getIcon = () => {
    if (isExporting) {
      return <div style={{
        width: '16px',
        height: '16px',
        border: '2px solid #9ca3af',
        borderTop: '2px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
    }
    return variant === 'all' ? <FileSpreadsheet size={16} /> : <Download size={16} />
  }

  const defaultStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: disabled ? '#6b7280' : '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    ...style
  }

  return (
    <>
      <button
        onClick={handleExport}
        disabled={disabled || isExporting}
        style={defaultStyle}
        onMouseEnter={(e) => {
          if (!disabled && !isExporting) {
            e.currentTarget.style.backgroundColor = '#059669'
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isExporting) {
            e.currentTarget.style.backgroundColor = '#10b981'
          }
        }}
      >
        {getIcon()}
        {getButtonText()}
      </button>

      {/* CSS for loading spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
