'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, Database, Eye, Lock, Download } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-400 hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to App
          </Link>
          
          <div className="flex items-center mb-4">
            <Shield className="w-8 h-8 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-gray-100">
              Privacy Policy
            </h1>
          </div>
          
          <p className="text-gray-400 text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-8">
          <div className="prose prose-invert max-w-none">
            
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-100 mb-4">
                Introduction
              </h2>
              <p className="text-gray-300 leading-relaxed">
                TimeTrackr is a privacy-focused time tracking application that prioritizes your data security and privacy. 
                This privacy policy explains how we handle your information when you use our application.
              </p>
            </section>

            {/* Data Storage */}
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <Database className="w-6 h-6 text-green-400 mr-2" />
                <h2 className="text-2xl font-semibold text-gray-100">
                  Data Storage & Privacy
                </h2>
              </div>
              
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-green-200 mb-3">
                  🛡️ Your Data Stays Local
                </h3>
                <p className="text-green-300">
                  <strong>All your time tracking data is stored exclusively on your device.</strong> 
                  We do not collect, store, or transmit any of your personal data, time entries, projects, or notes to our servers or any third parties.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-100 mb-3">
                What Data is Stored Locally
              </h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                <li>Time tracking entries (start/end times, notes, project associations)</li>
                <li>Project information (names, colors, creation dates)</li>
                <li>User preferences (last selected project)</li>
                <li>Application settings and configurations</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-100 mb-3">
                Storage Technology
              </h3>
              <p className="text-gray-300 mb-4">
                We use the following browser technologies to store your data locally:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>IndexedDB:</strong> Primary database for all time tracking data</li>
                <li><strong>localStorage:</strong> User preferences and settings</li>
              </ul>
            </section>

            {/* Data Collection */}
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <Eye className="w-6 h-6 text-blue-400 mr-2" />
                <h2 className="text-2xl font-semibold text-gray-100">
                  Data Collection
                </h2>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-200 mb-3">
                  📊 No Data Collection
                </h3>
                <p className="text-blue-300">
                  We do not collect any personal information, analytics data, or usage statistics. 
                  Your time tracking activities remain completely private and anonymous to us.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-100 mb-3">
                What We Don't Collect
              </h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Personal identification information</li>
                <li>Time tracking data or project information</li>
                <li>Usage analytics or behavior tracking</li>
                <li>IP addresses or location data</li>
                <li>Device information or browser details</li>
                <li>Any data that could identify you personally</li>
              </ul>
            </section>

            {/* Third Parties */}
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <Lock className="w-6 h-6 text-purple-400 mr-2" />
                <h2 className="text-2xl font-semibold text-gray-100">
                  Third-Party Services
                </h2>
              </div>
              
              <p className="text-gray-300 mb-4">
                TimeTrackr is hosted on Vercel, but this hosting service only serves the application files. 
                Vercel does not have access to your personal data as it's stored locally on your device.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-100 mb-3">
                External Dependencies
              </h3>
              <p className="text-gray-300 mb-4">
                The application uses the following external libraries that do not collect personal data:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>Dexie.js:</strong> Local database management (no data transmission)</li>
                <li><strong>React/Next.js:</strong> Application framework (no data collection)</li>
                <li><strong>Tailwind CSS:</strong> Styling framework (no data collection)</li>
                <li><strong>Lucide React:</strong> Icon library (no data collection)</li>
              </ul>
            </section>

            {/* Data Export */}
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <Download className="w-6 h-6 text-orange-400 mr-2" />
                <h2 className="text-2xl font-semibold text-gray-100">
                  Data Export & Backup
                </h2>
              </div>
              
              <p className="text-gray-300 mb-4">
                You have complete control over your data. The application provides built-in export functionality 
                that allows you to download your time tracking data as CSV files for backup or migration purposes.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-100 mb-3">
                Your Rights
              </h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Export all your data at any time</li>
                <li>Delete all data from your device</li>
                <li>Modify or update your data as needed</li>
                <li>Use the application offline without data loss</li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-100 mb-4">
                Data Security
              </h2>
              
              <p className="text-gray-300 mb-4">
                Since all data is stored locally on your device, your information is protected by:
              </p>
              
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Your device's built-in security measures</li>
                <li>Browser security features and sandboxing</li>
                <li>No network transmission of sensitive data</li>
                <li>No server-side storage that could be compromised</li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-100 mb-4">
                Children's Privacy
              </h2>
              
              <p className="text-gray-300">
                TimeTrackr does not collect any personal information from anyone, including children under 13. 
                Since all data is stored locally on the user's device, there are no privacy concerns regarding 
                children's data collection.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-100 mb-4">
                Changes to This Privacy Policy
              </h2>
              
              <p className="text-gray-300">
                We may update this privacy policy from time to time. Any changes will be posted on this page 
                with an updated revision date. Since we don't collect contact information, we cannot notify you 
                directly of changes, so we recommend checking this page periodically.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-100 mb-4">
                Contact Information
              </h2>
              
              <p className="text-gray-300">
                If you have any questions about this privacy policy or the application, please refer to the 
                project repository or contact the developer through the appropriate channels.
              </p>
            </section>

            {/* Summary */}
            <div className="bg-gray-700 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-100 mb-3">
                Privacy Summary
              </h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li>✅ No data collection or transmission</li>
                <li>✅ All data stored locally on your device</li>
                <li>✅ No third-party data sharing</li>
                <li>✅ Complete user control over data</li>
                <li>✅ Works offline without privacy concerns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
