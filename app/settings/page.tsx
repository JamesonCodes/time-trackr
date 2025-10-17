'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Settings, Trash2, Database, Download, HardDrive } from 'lucide-react'
import { useEntries, useProjects, db } from '@/lib/db'
import CSVExportButton from '@/components/CSVExportButton'

export default function SettingsPage() {
  const [showConfirmation, setShowConfirmation] = useState(false)
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
      setShowConfirmation(false)
      
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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
              gap: '16px'
            }}>
              <CSVExportButton 
                variant="all"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '10px 14px'
                }}
              />
              
              {!showConfirmation ? (
                <button
                  onClick={() => setShowConfirmation(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
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
              ) : (
                <div style={{
                  backgroundColor: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: '#f9fafb',
                    margin: '0',
                    lineHeight: '1.4'
                  }}>
                    Are you sure? This will permanently delete all entries.
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <button
                      onClick={() => setShowConfirmation(false)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        backgroundColor: '#6b7280',
                        color: '#f9fafb',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4b5563'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#6b7280'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearAllData}
                      disabled={isClearing}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        backgroundColor: isClearing ? '#6b7280' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: isClearing ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isClearing) {
                          e.currentTarget.style.backgroundColor = '#dc2626'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isClearing) {
                          e.currentTarget.style.backgroundColor = '#ef4444'
                        }
                      }}
                    >
                      {isClearing ? 'Clearing...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}
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
              <HardDrive size={20} />
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
                <div>
                  <span style={{ color: '#d1d5db', fontSize: '14px' }}>Time Entries</span>
                  <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>
                    Total entries stored locally
                  </div>
                </div>
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
                <div>
                  <span style={{ color: '#d1d5db', fontSize: '14px' }}>Projects</span>
                  <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>
                    Active projects in your workspace
                  </div>
                </div>
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
                <div>
                  <span style={{ color: '#d1d5db', fontSize: '14px' }}>Estimated Size</span>
                  <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>
                    Current storage footprint
                  </div>
                </div>
                <span style={{ color: '#f9fafb', fontSize: '16px', fontWeight: '600' }}>
                  {formatFileSize(storageStats.totalSize)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* App Info Footer */}
        <div style={{
          marginTop: '32px',
          textAlign: 'left'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '500',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px'
          }}>
            App Info
          </div>
          <div style={{
            fontSize: '13px',
            color: '#9ca3af',
            lineHeight: '1.4'
          }}>
            Version 1.0.0 • Local-first build • Last updated Oct 2025
          </div>
        </div>

      </div>
    </div>
  )
}
