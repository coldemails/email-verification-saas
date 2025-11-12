'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Types
interface Job {
  id: string;
  fileName: string;
  totalEmails: number;
  processedEmails: number;
  validEmails: number;
  invalidEmails: number;
  unknownEmails: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  uploadedAt: string;
}

interface JobProgress {
  jobId: string;
  totalEmails: number;
  processedEmails: number;
  validEmails: number;
  invalidEmails: number;
  unknownEmails: number;
  percentage: number;
  message: string;
}

interface User {
  name: string;
  email: string;
  credits: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // State
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeJobProgress, setActiveJobProgress] = useState<Map<string, JobProgress>>(new Map());
  const [columnSelection, setColumnSelection] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [step, setStep] = useState<'upload' | 'processing' | 'confirm'>('upload');
  const [detectedCount, setDetectedCount] = useState<number>(0);

  // Fetch user data and jobs on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUserData(token);
    fetchJobs(token);
    initializeSocket(token);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Initialize Socket.io
  const initializeSocket = (token: string) => {
    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ Socket.io connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket.io disconnected');
    });

    socket.on('job-progress', (data: JobProgress) => {
      console.log('📊 Job progress:', data);
      setActiveJobProgress((prev) => {
        const updated = new Map(prev);
        updated.set(data.jobId, data);
        return updated;
      });

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === data.jobId
            ? {
                ...job,
                processedEmails: data.processedEmails,
                validEmails: data.validEmails,
                invalidEmails: data.invalidEmails,
                unknownEmails: data.unknownEmails,
                status: 'PROCESSING',
              }
            : job
        )
      );
    });

    socket.on('job-completed', (data: any) => {
      console.log('✅ Job completed:', data);
      setActiveJobProgress((prev) => {
        const updated = new Map(prev);
        updated.delete(data.jobId);
        return updated;
      });

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === data.jobId
            ? {
                ...job,
                status: 'COMPLETED',
                processedEmails: data.processedEmails,
                validEmails: data.validEmails,
                invalidEmails: data.invalidEmails,
                unknownEmails: data.unknownEmails,
              }
            : job
        )
      );

      const token = localStorage.getItem('token');
      if (token) fetchUserData(token);
    });

    socket.on('job-failed', (data: any) => {
      console.error('❌ Job failed:', data);
      setActiveJobProgress((prev) => {
        const updated = new Map(prev);
        updated.delete(data.jobId);
        return updated;
      });

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === data.jobId ? { ...job, status: 'FAILED' } : job
        )
      );
    });

    socketRef.current = socket;
  };

  // Fetch user data
  const fetchUserData = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    }
  };

  // Fetch all jobs
  const fetchJobs = async (token: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/verify/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(response.data.jobs);

      response.data.jobs.forEach((job: Job) => {
        if (job.status === 'PROCESSING' || job.status === 'PENDING') {
          socketRef.current?.emit('join-job', job.id);
        }
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setUploadError('Please select a CSV file');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadError('');
    }
  };

  // ✅ NEW: Reset function to clear everything
  const resetUploadState = () => {
    setSelectedFile(null);
    setSelectedColumn('');
    setColumnSelection([]);
    setDetectedCount(0);
    setUploadError('');
    setShowColumnSelector(false);
    setStep('upload');
    localStorage.removeItem('lastFilePath');
    localStorage.removeItem('originalFileName');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ✅ IMPROVED handleUpload - cleaner flow
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      setShowColumnSelector(false);
      setStep('processing');

      // Client-side fallback count
      try {
        const text = await selectedFile.text();
        const rows = text.split(/\r?\n/).map(r => r.trim()).filter(r => r.length > 0);
        const localCount = Math.max(0, rows.length - 1);
        setDetectedCount(localCount);
      } catch (readErr) {
        console.warn('Could not read file client-side for fallback count', readErr);
        setDetectedCount(0);
      }

      // Simulate processing
      await new Promise((r) => setTimeout(r, 2500));

      const formData = new FormData();
      formData.append('file', selectedFile);

      const headerRes = await axios.post(
        `${API_URL}/api/verify/confirm-column`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        }
      );

      console.log('confirm-column response:', headerRes.data);
      
      if (headerRes.data?.filePath) {
        localStorage.setItem('lastFilePath', headerRes.data.filePath);
        console.log('✅ Saved filePath:', headerRes.data.filePath);
      }
      
      if (headerRes.data?.originalFileName) {
        localStorage.setItem('originalFileName', headerRes.data.originalFileName);
        console.log('✅ Saved originalFileName:', headerRes.data.originalFileName);
      }

      const serverTotal =
        headerRes.data?.totalEmails ??
        headerRes.data?.total ??
        headerRes.data?.count ??
        0;

      const serverTotalInt = parseInt(String(serverTotal), 10) || 0;

      setColumnSelection(headerRes.data?.headers || []);
      setDetectedCount(serverTotalInt > 0 ? serverTotalInt : (detectedCount || 0));

      setShowColumnSelector(true);
      setStep('confirm');
    } catch (error: any) {
      console.error('Upload error:', error);
      const serverMessage = error?.response?.data ?? error?.message ?? 'Unable to process CSV.';
      setUploadError(String(serverMessage));
      setStep('upload');
    } finally {
      setUploading(false);
    }
  };

  // ✅ IMPROVED startVerification
  const startVerification = async () => {
    const token = localStorage.getItem('token');
    if (!token || !selectedColumn) {
      alert('Please select a column first.');
      return;
    }

    try {
      setUploading(true);

      const filePath = localStorage.getItem('lastFilePath');
      const originalFileName = localStorage.getItem('originalFileName');
      const formData = new FormData();

      if (filePath) {
        formData.append('filePath', filePath);
      } else if (selectedFile) {
        formData.append('file', selectedFile);
      }

      formData.append('selectedColumn', selectedColumn.trim());
      
      if (originalFileName) {
        formData.append('originalFileName', originalFileName);
        console.log('✅ Sending originalFileName:', originalFileName);
      }

      console.log('🚀 Starting verification with:', {
        filePath,
        selectedColumn: selectedColumn.trim(),
        originalFileName
      });

      const res = await axios.post(`${API_URL}/api/verify/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Verification started:', res.data);

      socketRef.current?.emit('join-job', res.data.jobId);
      fetchJobs(token);
      
      // ✅ Close modal and reset everything
      setShowUploadModal(false);
      resetUploadState();
    } catch (err: any) {
      console.error('❌ Verification failed:', err);
      const errorMsg = err.response?.data?.error || 'Verification failed. Please try again.';
      setUploadError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  // Handle job download
  const handleDownload = async (jobId: string, fileName: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/verify/jobs/${jobId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `results-${fileName}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download results. Please try again.');
    }
  };

  // Handle job deletion
  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to remove this verification?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/verify/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
      socketRef.current?.emit('leave-job', jobId);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete job. Please try again.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Just now';
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate processing time
  const getProcessingTime = (job: Job) => {
    if (job.status === 'PROCESSING' || job.status === 'PENDING') {
      return 'In progress...';
    }
    const seconds = Math.floor(job.totalEmails / 10);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Calculate stats
  const totalVerified = jobs.reduce((sum, job) => sum + job.processedEmails, 0);
  const totalValid = jobs.reduce((sum, job) => sum + job.validEmails, 0);
  const totalInvalid = jobs.reduce((sum, job) => sum + job.invalidEmails, 0);
  const totalUnknown = jobs.reduce((sum, job) => sum + job.unknownEmails, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
              </svg>
              <div>
                <div className="text-xs text-gray-600">Available Credits</div>
                <div className="font-bold text-gray-900">{user?.credits?.toLocaleString() || 0}</div>
              </div>
            </div>

            <Link 
              href="/pricing" 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              Buy More Credits
            </Link>

            {/* User Menu Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span className="font-bold text-gray-700">{user?.name?.charAt(0) || 'U'}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      router.push('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center gap-3"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 font-medium">Account Settings</span>
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center gap-3 text-red-600"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'User'}! 👋</h1>
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
            <div className="text-3xl font-bold mb-1 text-gray-900">{totalVerified.toLocaleString()}</div>
            <div className="text-sm text-green-600">All time verified</div>
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
            <div className="text-3xl font-bold mb-1 text-gray-900">{totalInvalid.toLocaleString()}</div>
            <div className="text-sm text-gray-500">
              {totalVerified > 0 ? ((totalInvalid / totalVerified) * 100).toFixed(1) : 0}% failure rate
            </div>
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
            <div className="text-3xl font-bold mb-1 text-gray-900">{totalUnknown.toLocaleString()}</div>
            <div className="text-sm text-gray-500">
              {totalVerified > 0 ? ((totalUnknown / totalVerified) * 100).toFixed(1) : 0}% unknown
            </div>
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
            <div className="text-3xl font-bold mb-1 text-gray-900">{jobs.length}</div>
            <div className="text-sm text-gray-500">
              {jobs.filter(j => j.status === 'COMPLETED').length} completed
            </div>
          </div>
        </div>

        {/* Upload Section - Simple white button */}
        <div className="mb-8">
          <button
            onClick={() => setShowUploadModal(true)}
            className="w-full bg-white border-2 border-gray-200 text-gray-900 p-6 rounded-2xl hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xl font-bold mb-1">Upload New List</div>
                <div className="text-gray-600 text-sm">Click to upload your CSV file</div>
              </div>
            </div>
          </button>
        </div>

        {/* Verification Files */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No verification jobs yet</h3>
            <p className="text-gray-600">Upload a CSV file to start verifying email addresses</p>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => {
              const progress = activeJobProgress.get(job.id);
              const passedPercent = job.totalEmails > 0 ? Math.round((job.validEmails / job.totalEmails) * 100) : 0;
              const failedPercent = job.totalEmails > 0 ? Math.round((job.invalidEmails / job.totalEmails) * 100) : 0;
              const unknownPercent = job.totalEmails > 0 ? Math.round((job.unknownEmails / job.totalEmails) * 100) : 0;
              
              const emailsPerSecond = job.totalEmails > 0 ? Math.round(job.totalEmails / Math.max(1, job.processedEmails / 10)) : 0;

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
                        <div className="font-bold text-lg text-gray-900">{job.fileName}</div>
                        <div className="text-sm text-gray-500">Added on {formatDate(job.uploadedAt)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {job.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleDownload(job.id, job.fileName)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Export
                        </button>
                      )}
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Statistics
                      </button>
                      <button 
                        onClick={() => handleDelete(job.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar (if processing) */}
                  {(job.status === 'PROCESSING' || job.status === 'PENDING') && (
                    <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">
                          Processing: {job.processedEmails} / {job.totalEmails}
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {Math.round((job.processedEmails / job.totalEmails) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.round((job.processedEmails / job.totalEmails) * 100)}%`,
                            backgroundColor: '#479f67'
                          }}
                        ></div>
                      </div>
                      {progress && (
                        <p className="text-xs text-blue-700 mt-2 flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                          Live updates active
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-6 mb-6">
                    <div>
                      <div className="text-sm text-gray-900 mb-1">Valid Emails</div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{job.validEmails.toLocaleString()}</div>
                      <div className="text-sm text-gray-900">{passedPercent}% of total</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-900 mb-1">Invalid Emails</div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{job.invalidEmails.toLocaleString()}</div>
                      <div className="text-sm text-gray-900">{failedPercent}% of total</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-900 mb-1">Unknown / Catch-all</div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{job.unknownEmails.toLocaleString()}</div>
                      <div className="text-sm text-gray-900">{unknownPercent}% of total</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-900 mb-1">Total Processed</div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{job.totalEmails.toLocaleString()}</div>
                      <div className="text-sm text-gray-900">
                        {job.status === 'COMPLETED' ? '100% completed' : 'In progress...'}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Bar Chart */}
                  <div className="mb-6">
                    <div className="flex h-8 rounded-lg overflow-hidden border-2 border-gray-200">
                      {passedPercent > 0 && (
                        <div 
                          className="flex items-center justify-center text-white text-sm font-medium"
                          style={{ width: `${passedPercent}%`, backgroundColor: '#479f67' }}
                        >
                          {passedPercent > 10 && `${passedPercent}%`}
                        </div>
                      )}
                      
                      {failedPercent > 0 && (
                        <div 
                          className="bg-red-500 flex items-center justify-center text-white text-sm font-medium"
                          style={{ width: `${failedPercent}%` }}
                        >
                          {failedPercent > 5 && `${failedPercent}%`}
                        </div>
                      )}
                      
                      {unknownPercent > 0 && (
                        <div 
                          className="bg-yellow-500 flex items-center justify-center text-white text-sm font-medium"
                          style={{ width: `${unknownPercent}%` }}
                        >
                          {unknownPercent > 5 && `${unknownPercent}%`}
                        </div>
                      )}
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center gap-6 mt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#479f67' }}></div>
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
                      <h4 className="font-semibold text-gray-900 mb-3">Verification Summary</h4>
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <span className="text-sm text-gray-600">Processing Time: </span>
                          <span className="font-bold text-gray-900">{getProcessingTime(job)}</span>
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
                        <svg className={`w-5 h-5 ${job.status === 'COMPLETED' ? 'text-green-600' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <span className="text-sm text-gray-600">Status: </span>
                          <span className={`font-bold ${job.status === 'COMPLETED' ? 'text-green-600' : job.status === 'PROCESSING' ? 'text-blue-600' : 'text-yellow-600'}`}>
                            {job.status === 'COMPLETED' ? 'Completed' : job.status === 'PROCESSING' ? 'Processing' : job.status === 'PENDING' ? 'Pending' : 'Failed'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Verification Methods */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Verification Methods Applied</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-700">SMTP Verification</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-700">DNS Validation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-700">Syntax Check</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-700">Disposable Detection</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-700">Catch All Detection</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-700">Role Account Detection</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-700">Spam Trap Check</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-700">Blacklist Check</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-700">Typo Correction</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-700">Greylist Handling</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-700">Reputation Lookup</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-gray-700">Deliverability Score</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ IMPROVED Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-4">Upload Email List</h3>
            
            {/* STEP 1: File Upload - Only show in upload step */}
            {step === 'upload' && (
              <>
                <div className="relative w-full p-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    id="fileUpload"
                    className="hidden"
                  />
                  
                  <label
                    htmlFor="fileUpload"
                    className="block w-full text-center py-3 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                  >
                    {selectedFile ? (
                      <span className="text-gray-700 font-medium">
                        📄 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        <span className="text-purple-600 font-medium">Click to choose</span> your CSV file
                      </span>
                    )}
                  </label>
                </div>

                {uploadError && (
                  <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      resetUploadState();
                    }}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50"
                  >
                    {uploading ? 'Processing...' : 'Continue'}
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: Processing Screen */}
            {step === 'processing' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-700">Uploading your list...</p>
                <p className="text-sm text-gray-500 mt-1">This takes about 2.5 seconds.</p>
              </div>
            )}

            {/* STEP 3: Column Selection & Confirmation */}
            {step === 'confirm' && showColumnSelector && (
              <div className="mt-4 space-y-4">
                {/* Show selected file name */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-600">
                    📄 <strong>{selectedFile?.name}</strong>
                  </p>
                </div>

                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select column containing emails:
                </label>
                <select
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl px-3 py-2 focus:border-purple-500"
                >
                  <option value="">-- Choose a column --</option>
                  {columnSelection.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 mt-3">
                  <p className="text-gray-700 text-sm">
                    Emails detected: <strong>{detectedCount}</strong><br />
                    Credits required: <strong>{detectedCount}</strong><br />
                    Available credits: <strong>{user?.credits || 0}</strong>
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      resetUploadState();
                      setStep('upload');
                    }}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={startVerification}
                    disabled={!selectedColumn}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50"
                  >
                    Start Verification
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}