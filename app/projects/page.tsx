'use client'

import ProjectManagement from '@/components/ProjectManagement'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ProjectsPage() {
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
          
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Projects
          </h1>
          <p className="text-gray-400">
            Manage your projects and track time across different tasks
          </p>
        </div>
        
        <ProjectManagement />
      </div>
    </div>
  )
}
