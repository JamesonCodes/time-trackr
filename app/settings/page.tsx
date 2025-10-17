'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Settings, Trash2, Database, Download } from 'lucide-react'
import { useEntries, useProjects, db } from '@/lib/db'
import CSVExportButton from '@/components/CSVExportButton'

export default function SettingsPage() {
  const [showClearModal, setShowClearModal] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [storageStats, setStorageStats] = useState({
    entries: 0,
    projects: 0,
    totalSize: 0
  })

  const entries = useEntries()
  const projects = useProjects()

  // Calculate storage statistics
  useEffect(() => {
    const calculateStats = async () => {
      try {
        const entryCount = await db.entries.count()
        const projectCount = await db.projects.count()
        
        // Estimate storage size (rough calculation)
        const estimatedSize = (entryCount * 200) + (projectCount * 100) // bytes
        
        setStorageStats({
          entries: entryCount,
          projects: projectCount,
          totalSize: estimatedSize
        })
      } catch (error) {
        console.error('Failed to calculate storage stats:', error)
      }
    }

    calculateStats()
  }, [entries, projects])

  const handleClearAllData = async () => {
    setIsClearing(true)
    
    try {
      await db.entries.clear()
      await db.projects.clear()
      setShowClearModal(false)
      
      // Show success message
      alert('All data has been cleared successfully.')
    } catch (error) {
      console.error('Failed to clear data:', error)
      alert('Failed to clear data. Please try again.')
    } finally {
      setIsClearing(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg text-sm font-medium border border-gray-600 transition-colors duration-200"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <Settings size={32} className="text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-100">
              Settings
            </h1>
          </div>
          <p className="text-gray-400">
            Manage your data and preferences
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {/* Data Management */}
          <div style={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#f9fafb',
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Database size={20} />
              Data Management
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#9ca3af',
              margin: '0 0 20px 0'
            }}>
              Export or clear your time tracking data
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <CSVExportButton 
                variant="all"
                style={{
                  width: '100%',
                  justifyContent: 'center'
                }}
              />
              
              <button
                onClick={() => setShowClearModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  width: '100%',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef4444'
                }}
              >
                <Trash2 size={16} />
                Clear All Data
              </button>
            </div>
          </div>

          {/* Storage Statistics */}
          <div style={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#f9fafb',
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Database size={20} />
              Storage Statistics
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#9ca3af',
              margin: '0 0 20px 0'
            }}>
              Overview of your stored data
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: '#374151',
                borderRadius: '6px'
              }}>
                <span style={{ color: '#d1d5db', fontSize: '14px' }}>Time Entries</span>
                <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: '600' }}>
                  {storageStats.entries}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: '#374151',
                borderRadius: '6px'
              }}>
                <span style={{ color: '#d1d5db', fontSize: '14px' }}>Projects</span>
                <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: '600' }}>
                  {storageStats.projects}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: '#374151',
                borderRadius: '6px'
              }}>
                <span style={{ color: '#d1d5db', fontSize: '14px' }}>Estimated Size</span>
                <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: '600' }}>
                  {formatFileSize(storageStats.totalSize)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Data Confirmation Modal */}
        {showClearModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Trash2 size={32} style={{ color: 'white' }} />
              </div>
              
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#f9fafb',
                margin: '0 0 8px 0'
              }}>
                Clear All Data
              </h3>
              
              <p style={{
                fontSize: '14px',
                color: '#9ca3af',
                margin: '0 0 24px 0',
                lineHeight: '1.5'
              }}>
                This will permanently delete all your time entries and projects. 
                This action cannot be undone.
              </p>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => setShowClearModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#374151',
                    color: '#f9fafb',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllData}
                  disabled={isClearing}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: isClearing ? '#6b7280' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isClearing ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {isClearing ? 'Clearing...' : 'Clear All Data'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
