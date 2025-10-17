'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import ReportTable from '@/components/ReportTable'
import WeekSelector from '@/components/WeekSelector'

export default function ReportsPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#111827',
      paddingTop: '80px' // Account for timer bar
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        <div style={{
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#374151',
                color: '#f9fafb',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                border: '1px solid #4b5563',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4b5563'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#374151'
              }}
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <BarChart3 size={32} style={{ color: '#3b82f6' }} />
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#f9fafb',
              margin: 0
            }}>
              Reports & Analytics
            </h1>
          </div>
          <p style={{
            fontSize: '16px',
            color: '#9ca3af',
            margin: 0
          }}>
            Analyze your time tracking data with weekly summaries and insights
          </p>
        </div>

        {/* Week Selector */}
        <div style={{
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#f9fafb',
            margin: '0 0 16px 0'
          }}>
            Select Week
          </h2>
          <WeekSelector />
        </div>

        {/* Report Table */}
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
            margin: '0 0 16px 0'
          }}>
            Weekly Summary
          </h2>
          <ReportTable />
        </div>
      </div>
    </div>
  )
}
