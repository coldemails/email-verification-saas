'use client';

import Link from 'next/link';
import { useState } from 'react';

// Mock data - will be replaced with real API calls
const mockJobs = [
  {
    id: 1,
    filename: 'marketing-leads-oct-2025.csv',
    totalEmails: 5420,
    passed: 4832,
    failed: 142,
    unknown: 446,
    processingTime: '3m 24s',
    status: 'completed',
    date: 'Nov 2, 2025',
    verificationMethods: {
      smtpVerification: true,
      dnsValidation: true,
      syntaxCheck: true,
      disposableDetection: true,
      catchAllDetection: true,
      roleAccountDetection: true,
    }
  },
  {
    id: 2,
    filename: 'customer-database-clean.csv',
    totalEmails: 12350,
    passed: 10842,
    failed: 892,
    unknown: 616,
    processingTime: '7m 18s',
    status: 'completed',
    date: 'Nov 1, 2025',
    verificationMethods: {
      smtpVerification: true,
      dnsValidation: true,
      syntaxCheck: true,
      disposableDetection: true,
      catchAllDetection: true,
      roleAccountDetection: true,
    }
  },
  {
    id: 3,
    filename: 'webinar-registrations.csv',
    totalEmails: 2847,
    passed: 2654,
    failed: 89,
    unknown: 104,
    processingTime: '1m 52s',
    status: 'completed',
    date: 'Oct 31, 2025',
    verificationMethods: {
      smtpVerification: true,
      dnsValidation: true,
      syntaxCheck: true,
      disposableDetection: true,
      catchAllDetection: true,
      roleAccountDetection: true,
    }
  }
];

export default function DashboardPage() {
  const [jobs, setJobs] = useState(mockJobs);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleRemoveJob = (jobId: number) => {
    if (confirm('Are you sure you want to remove this verification?')) {
      setJobs(jobs.filter(job => job.id !== jobId));
    }
  };

  // User credits (mock data)
  const userCredits = 24580;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl"></div>
            <span className="font-bold text-xl">OnlyValidEmails</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Credits Display */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full border border-purple-200">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
              </svg>
              <div>
                <div className="text-xs text-gray-600">Available Credits</div>
                <div className="font-bold text-purple-600">{userCredits.toLocaleString()}</div>
              </div>
            </div>

            <Link 
              href="/pricing" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all"
            >
              Buy More Credits
            </Link>

            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <span className="font-bold text-gray-700">JD</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, John! 👋</h1>
          <p className="text-gray-600">Here's what's happening with your email verifications</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Total Verified</div>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">18,328</div>
            <div className="text-sm text-green-600">↑ 12% from last month</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Failed</div>
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">1,123</div>
            <div className="text-sm text-gray-500">5.4% failure rate</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Unknown</div>
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">1,166</div>
            <div className="text-sm text-gray-500">5.6% unknown</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Total Jobs</div>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">3</div>
            <div className="text-sm text-gray-500">All completed</div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <button
            onClick={() => setShowUploadModal(true)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8 rounded-2xl hover:shadow-xl transition-all duration-200 group"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold mb-1">Upload New List</div>
                <div className="text-purple-100">Click to upload or drag and drop your CSV file</div>
              </div>
            </div>
          </button>
        </div>

        {/* Verification Files - All Stats Visible */}
        <div className="space-y-6">
          {jobs.map((job) => {
            // Calculate percentages
            const passedPercent = Math.round((job.passed / job.totalEmails) * 100);
            const failedPercent = Math.round((job.failed / job.totalEmails) * 100);
            const unknownPercent = Math.round((job.unknown / job.totalEmails) * 100);
            
            // Calculate average speed
            const timeInSeconds = parseInt(job.processingTime.split('m')[0]) * 60 + parseInt(job.processingTime.split(' ')[1]);
            const emailsPerSecond = Math.round(job.totalEmails / timeInSeconds);

            return (
              <div key={job.id} className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-purple-300 transition-all">
                {/* File Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-lg text-gray-900">{job.filename}</div>
                      <div className="text-sm text-gray-500">Added on {job.date}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export
                    </button>
                    <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Statistics
                    </button>
                    <button 
                      onClick={() => handleRemoveJob(job.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6 mb-6">
                  {/* Valid */}
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Valid Emails</div>
                    <div className="text-3xl font-bold text-green-600 mb-1">{job.passed.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{passedPercent}% of total</div>
                  </div>

                  {/* Invalid */}
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Invalid Emails</div>
                    <div className="text-3xl font-bold text-red-600 mb-1">{job.failed.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{failedPercent}% of total</div>
                  </div>

                  {/* Unknown/Catch-all */}
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Unknown / Catch-all</div>
                    <div className="text-3xl font-bold text-yellow-600 mb-1">{job.unknown.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{unknownPercent}% of total</div>
                  </div>

                  {/* Total */}
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Total Processed</div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">{job.totalEmails.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">100% completed</div>
                  </div>
                </div>

                {/* Horizontal Bar Chart */}
                <div className="mb-6">
                  <div className="flex h-8 rounded-lg overflow-hidden border-2 border-gray-200">
                    {/* Valid (green) */}
                    <div 
                      className="bg-green-500 flex items-center justify-center text-white text-sm font-medium"
                      style={{ width: `${passedPercent}%` }}
                    >
                      {passedPercent > 10 && `${passedPercent}%`}
                    </div>
                    
                    {/* Failed (red) */}
                    <div 
                      className="bg-red-500 flex items-center justify-center text-white text-sm font-medium"
                      style={{ width: `${failedPercent}%` }}
                    >
                      {failedPercent > 5 && `${failedPercent}%`}
                    </div>
                    
                    {/* Unknown (yellow) */}
                    <div 
                      className="bg-yellow-500 flex items-center justify-center text-white text-sm font-medium"
                      style={{ width: `${unknownPercent}%` }}
                    >
                      {unknownPercent > 5 && `${unknownPercent}%`}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex justify-center gap-6 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-sm text-gray-600">Valid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-sm text-gray-600">Invalid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span className="text-sm text-gray-600">Unknown / Catch-all</span>
                    </div>
                  </div>
                </div>

                {/* Processing Info & Verification Methods */}
                <div className="grid md:grid-cols-2 gap-6 pt-6 border-t-2 border-gray-200">
                  {/* Processing Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <span className="text-sm text-gray-600">Processing Time: </span>
                        <span className="font-bold text-gray-900">{job.processingTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <span className="text-sm text-gray-600">Average Speed: </span>
                        <span className="font-bold text-gray-900">{emailsPerSecond} emails/second</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <span className="text-sm text-gray-600">Status: </span>
                        <span className="font-bold text-green-600">Completed</span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Methods */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Verification Methods Applied</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(job.verificationMethods).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          {value ? (
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className="text-xs text-gray-700">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-4">Upload Email List</h3>
            <div className="border-4 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-purple-500 transition-colors cursor-pointer">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="font-medium text-gray-700 mb-1">Drop your CSV file here</p>
              <p className="text-sm text-gray-500">or click to browse</p>
            </div>
            <button 
              onClick={() => setShowUploadModal(false)}
              className="mt-6 w-full py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}