'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import ReportTable from '@/components/ReportTable'
import WeekSelector from '@/components/WeekSelector'
import CSVExportButton from '@/components/CSVExportButton'

export default function ReportsPage() {
  const [selectedWeek, setSelectedWeek] = useState(new Date())

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          {/* Top Row - Navigation and Actions */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg text-sm font-medium border border-gray-600 transition-colors duration-200"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            
            <div className="flex gap-2">
              <CSVExportButton 
                variant="week" 
                weekStart={selectedWeek}
              />
              <CSVExportButton 
                variant="all"
              />
            </div>
          </div>
          
          {/* Title Section */}
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 size={32} className="text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-100">
              Reports & Analytics
            </h1>
          </div>
          <p className="text-gray-400">
            Analyze your time tracking data with weekly summaries and insights
          </p>
        </div>

        {/* Report Table with Week Selector passed as prop */}
        <ReportTable 
          selectedWeek={selectedWeek}
          onWeekChange={setSelectedWeek}
        />
      </div>
    </div>
  )
}
