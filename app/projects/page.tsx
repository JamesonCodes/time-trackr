'use client'

import ProjectManagement from '@/components/ProjectManagement'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-16 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          {/* Mobile Header */}
          <div className="block md:hidden mb-6">
            {/* Back Button */}
            <div className="mb-4">
              <Link
                href="/"
                className="inline-flex items-center text-gray-400 hover:text-gray-100 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-100 mb-2">
              Projects
            </h1>
            <p className="text-sm text-gray-400">
              Manage your projects and track time
            </p>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:block">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/"
                className="inline-flex items-center text-gray-400 hover:text-gray-100 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              Projects
            </h1>
            <p className="text-gray-400">
              Manage your projects and track time across different tasks
            </p>
          </div>
        </div>
        
        <ProjectManagement />
      </div>
    </div>
  )
}
