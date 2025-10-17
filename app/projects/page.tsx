'use client'

import ProjectManagement from '@/components/ProjectManagement'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ProjectsPage() {
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
          
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#f9fafb',
            margin: '0 0 8px 0'
          }}>
            Projects
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#9ca3af',
            margin: 0
          }}>
            Manage your projects and track time across different tasks
          </p>
        </div>
        
        <ProjectManagement />
      </div>
    </div>
  )
}
