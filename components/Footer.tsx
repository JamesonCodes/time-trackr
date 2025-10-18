'use client'

import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="hidden md:block border-t border-gray-700 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400">
          <div className="flex items-center space-x-4 mb-2 sm:mb-0">
            <span>© 2025 TimeTrackr</span>
            <span>•</span>
            <span>Local-first time tracking</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/privacy" 
              className="inline-flex items-center text-gray-400 hover:text-gray-200 transition-colors duration-200"
            >
              <Shield className="w-4 h-4 mr-1" />
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
