'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../lib/auth';
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
  startedAt?: string;
  completedAt?: string;
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

// Counter animation hook
function useCountUp(end: number, duration: number = 2000, shouldStart: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, shouldStart]);

  return count;
}

// Intersection Observer hook
function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return { ref, isInView };
}

export default function DashboardPage() {
  useAuth();

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
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isDragging, setIsDragging] = useState(false);

  const { ref: statsRef, isInView: statsInView } = useInView({ threshold: 0.3 });

  // Animated counters for stats
  const totalVerified = jobs.reduce((sum, job) => sum + job.processedEmails, 0);
  const totalInvalid = jobs.reduce((sum, job) => sum + job.invalidEmails, 0);
  const totalUnknown = jobs.reduce((sum, job) => sum + job.unknownEmails, 0);
  
  const animatedVerified = useCountUp(totalVerified, 1500, statsInView);
  const animatedInvalid = useCountUp(totalInvalid, 1500, statsInView);
  const animatedUnknown = useCountUp(totalUnknown, 1500, statsInView);
  const animatedJobs = useCountUp(jobs.length, 1500, statsInView);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
                startedAt: data.startedAt,
                completedAt: data.completedAt,
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

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
      setUploadError('');
    } else {
      setUploadError('Please drop a CSV file');
    }
  };

  // Reset upload state
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
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle upload
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

      try {
        const text = await selectedFile.text();
        const rows = text.split(/\r?\n/).map(r => r.trim()).filter(r => r.length > 0);
        const localCount = Math.max(0, rows.length - 1);
        setDetectedCount(localCount);
      } catch (readErr) {
        console.warn('Could not read file client-side for fallback count', readErr);
        setDetectedCount(0);
      }

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

  // Start verification
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
      if (job.uploadedAt) {
        const elapsed = Math.floor((Date.now() - new Date(job.uploadedAt).getTime()) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
      }
      return 'Starting...';
    }
    
    if (job.startedAt && job.completedAt) {
      const processingMs = new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime();
      const seconds = Math.floor(processingMs / 1000);
      const minutes = Math.floor(seconds / 60);
      
      if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      } else {
        return `${seconds}s`;
      }
    }
    
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-cyan-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-cyan-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Premium Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300"></div>
              <span className="font-bold text-xl text-slate-900">OnlyValidEmails</span>
            </Link>
            
            <div className="flex items-center gap-4">
              {/* Credits Display */}
              <div className="flex items-center gap-3 bg-gradient-to-r from-cyan-50 to-blue-50 px-5 py-3 rounded-2xl border border-cyan-200/50 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-md shadow-cyan-500/20">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] text-slate-600 font-medium tracking-wide uppercase">Available Credits</div>
                  <div className="text-[18px] font-bold text-slate-900">{user?.credits?.toLocaleString() || 0}</div>
                </div>
              </div>

              <Link 
                href="/pricing" 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-2.5 rounded-xl text-[14px] font-semibold hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 active:scale-95"
              >
                Buy Credits
              </Link>

              {/* User Menu Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-11 h-11 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center hover:from-slate-200 hover:to-slate-300 transition-all duration-300 shadow-sm border border-slate-200"
                >
                  <span className="font-bold text-slate-700 text-[15px]">{user?.name?.charAt(0) || 'U'}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fade-in-scale">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-[15px] font-semibold text-slate-900">{user?.name || 'User'}</p>
                      <p className="text-[13px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        router.push('/settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 transition flex items-center gap-3"
                    >
                      <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-slate-700 font-medium text-[14px]">Account Settings</span>
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-red-50 transition flex items-center gap-3 text-red-600"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-[14px]">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Welcome Section with Animation */}
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-[42px] font-bold mb-3 text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-[17px] text-slate-600 tracking-tight">Here's what's happening with your email verifications</p>
        </div>

        {/* Premium Stats Cards */}
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 animate-fade-in-up animation-delay-100">
          {/* Total Verified - Emerald Theme */}
          <div className="relative bg-white rounded-[28px] p-8 border-2 border-slate-200 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[13px] font-semibold text-slate-600 tracking-wide uppercase">Total Verified</div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-[48px] font-bold mb-2 bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent tracking-tighter">
                {animatedVerified.toLocaleString()}
              </div>
              <div className="text-[13px] text-emerald-500 font-semibold">All time verified</div>
            </div>
          </div>

          {/* Invalid - Red Theme */}
          <div className="relative bg-white rounded-[28px] p-8 border-2 border-slate-200 hover:border-red-300 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[13px] font-semibold text-slate-600 tracking-wide uppercase">Invalid</div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-[48px] font-bold mb-2 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent tracking-tighter">
                {animatedInvalid.toLocaleString()}
              </div>
              <div className="text-[13px] text-slate-500 font-medium">
                {totalVerified > 0 ? ((totalInvalid / totalVerified) * 100).toFixed(1) : 0}% failure rate
              </div>
            </div>
          </div>

          {/* Unknown - Amber Theme */}
          <div className="relative bg-white rounded-[28px] p-8 border-2 border-slate-200 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[13px] font-semibold text-slate-600 tracking-wide uppercase">Unknown</div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-[48px] font-bold mb-2 bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent tracking-tighter">
                {animatedUnknown.toLocaleString()}
              </div>
              <div className="text-[13px] text-slate-500 font-medium">
                {totalVerified > 0 ? ((totalUnknown / totalVerified) * 100).toFixed(1) : 0}% unknown
              </div>
            </div>
          </div>

          {/* Total Jobs - Blue Theme */}
          <div className="relative bg-white rounded-[28px] p-8 border-2 border-slate-200 hover:border-cyan-300 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[13px] font-semibold text-slate-600 tracking-wide uppercase">Total Jobs</div>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div className="text-[48px] font-bold mb-2 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent tracking-tighter">
                {animatedJobs}
              </div>
              <div className="text-[13px] text-slate-500 font-medium">
                {jobs.filter(j => j.status === 'COMPLETED').length} completed
              </div>
            </div>
          </div>
        </div>

        {/* Premium Upload Dropzone */}
        <div className="mb-10 animate-fade-in-up animation-delay-200">
          <div
            onClick={() => setShowUploadModal(true)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative bg-white border-3 ${isDragging ? 'border-cyan-500 bg-cyan-50' : 'border-dashed border-slate-300'} rounded-[32px] p-12 hover:border-cyan-400 hover:bg-gradient-to-br hover:from-cyan-50/50 hover:to-blue-50/50 transition-all duration-300 cursor-pointer group overflow-hidden`}
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative flex flex-col items-center justify-center">
              {/* Upload Icon with Animation */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-[24px] blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-[24px] flex items-center justify-center shadow-2xl shadow-cyan-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>

              <h3 className="text-[28px] font-bold text-slate-900 mb-3 tracking-tight">Upload New List</h3>
              <p className="text-[16px] text-slate-600 mb-2 tracking-tight">Drag & drop your CSV file here, or click to browse</p>
              <p className="text-[13px] text-slate-500">Supports CSV files up to 500,000 emails</p>
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-[32px] p-16 text-center border-2 border-slate-200 animate-fade-in-up animation-delay-300">
            <div className="w-20 h-20 mx-auto mb-6 rounded-[24px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-[24px] font-bold text-slate-900 mb-3 tracking-tight">No verification jobs yet</h3>
            <p className="text-[16px] text-slate-600">Upload a CSV file to start verifying email addresses</p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in-up animation-delay-300">
            {jobs.map((job, index) => {
              const progress = activeJobProgress.get(job.id);
              const passedPercent = job.totalEmails > 0 ? Math.round((job.validEmails / job.totalEmails) * 100) : 0;
              const failedPercent = job.totalEmails > 0 ? Math.round((job.invalidEmails / job.totalEmails) * 100) : 0;
              const unknownPercent = job.totalEmails > 0 ? Math.round((job.unknownEmails / job.totalEmails) * 100) : 0;
              
              return (
                <div 
                  key={job.id} 
                  className="bg-white rounded-[32px] p-8 border-2 border-slate-200 hover:border-cyan-300 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* File Header */}
                  <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-slate-100">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-[20px] flex items-center justify-center shadow-md">
                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-bold text-[20px] text-slate-900 tracking-tight">{job.fileName}</div>
                        <div className="text-[14px] text-slate-500">Added on {formatDate(job.uploadedAt)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {job.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleDownload(job.id, job.fileName)}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2 font-semibold text-[14px]"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Export
                        </button>
                      )}
                      <button
                        className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2 font-semibold text-[14px]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Stats
                      </button>
                      <button 
                        onClick={() => handleDelete(job.id)}
                        className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2 font-semibold text-[14px]"
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
                    <div className="mb-8 bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[15px] font-bold text-cyan-900 flex items-center gap-2">
                          <span className="w-2 h-2 bg-cyan-600 rounded-full animate-pulse"></span>
                          Processing: {job.processedEmails.toLocaleString()} / {job.totalEmails.toLocaleString()}
                        </span>
                        <span className="text-[16px] font-bold text-cyan-600">
                          {Math.round((job.processedEmails / job.totalEmails) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-cyan-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-4 rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-cyan-500"
                          style={{ width: `${Math.round((job.processedEmails / job.totalEmails) * 100)}%` }}
                        ></div>
                      </div>
                      {progress && (
                        <p className="text-[12px] text-cyan-700 mt-3 flex items-center gap-2 font-medium">
                          <span className="w-2 h-2 bg-cyan-600 rounded-full animate-pulse"></span>
                          Live updates active
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-6 mb-8">
                    <div>
                      <div className="text-[13px] text-slate-600 mb-2 font-semibold tracking-wide uppercase">Valid Emails</div>
                      <div className="text-[42px] font-bold text-slate-900 mb-1 tracking-tighter">{job.validEmails.toLocaleString()}</div>
                      <div className="text-[14px] text-emerald-600 font-semibold">{passedPercent}% of total</div>
                    </div>

                    <div>
                      <div className="text-[13px] text-slate-600 mb-2 font-semibold tracking-wide uppercase">Invalid Emails</div>
                      <div className="text-[42px] font-bold text-slate-900 mb-1 tracking-tighter">{job.invalidEmails.toLocaleString()}</div>
                      <div className="text-[14px] text-red-600 font-semibold">{failedPercent}% of total</div>
                    </div>

                    <div>
                      <div className="text-[13px] text-slate-600 mb-2 font-semibold tracking-wide uppercase">Unknown</div>
                      <div className="text-[42px] font-bold text-slate-900 mb-1 tracking-tighter">{job.unknownEmails.toLocaleString()}</div>
                      <div className="text-[14px] text-amber-600 font-semibold">{unknownPercent}% of total</div>
                    </div>

                    <div>
                      <div className="text-[13px] text-slate-600 mb-2 font-semibold tracking-wide uppercase">Total Processed</div>
                      <div className="text-[42px] font-bold text-slate-900 mb-1 tracking-tighter">{job.totalEmails.toLocaleString()}</div>
                      <div className={`text-[14px] font-semibold ${job.status === 'COMPLETED' ? 'text-emerald-600' : 'text-cyan-600'}`}>
                        {job.status === 'COMPLETED' ? '100% completed' : 'Processing...'}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Bar Chart */}
                  <div className="mb-8">
                    <div className="flex h-10 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner">
                      {passedPercent > 0 && (
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-[14px] font-bold"
                          style={{ width: `${passedPercent}%` }}
                        >
                          {passedPercent > 10 && `${passedPercent}%`}
                        </div>
                      )}
                      
                      {failedPercent > 0 && (
                        <div 
                          className="bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white text-[14px] font-bold"
                          style={{ width: `${failedPercent}%` }}
                        >
                          {failedPercent > 5 && `${failedPercent}%`}
                        </div>
                      )}
                      
                      {unknownPercent > 0 && (
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center text-white text-[14px] font-bold"
                          style={{ width: `${unknownPercent}%` }}
                        >
                          {unknownPercent > 5 && `${unknownPercent}%`}
                        </div>
                      )}
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center gap-8 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-md bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                        <span className="text-[13px] text-slate-600 font-medium">Valid</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-md bg-gradient-to-r from-red-500 to-orange-500"></div>
                        <span className="text-[13px] text-slate-600 font-medium">Invalid</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-md bg-gradient-to-r from-amber-500 to-yellow-500"></div>
                        <span className="text-[13px] text-slate-600 font-medium">Unknown</span>
                      </div>
                    </div>
                  </div>

                  {/* Processing Info & Verification Methods */}
                  <div className="grid md:grid-cols-2 gap-8 pt-8 border-t-2 border-slate-100">
                    {/* Processing Info */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 mb-4 text-[16px] tracking-tight">Verification Summary</h4>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-md shadow-cyan-500/20">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-[13px] text-slate-600 font-medium">Processing Time</span>
                          <div className="font-bold text-slate-900 text-[15px]">{getProcessingTime(job)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-[13px] text-slate-600 font-medium">Average Speed</span>
                          <div className="font-bold text-slate-900 text-[15px]">{Math.round(job.totalEmails / Math.max(1, job.processedEmails / 10))} emails/sec</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${job.status === 'COMPLETED' ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-cyan-500 to-blue-500'} flex items-center justify-center shadow-md ${job.status === 'COMPLETED' ? 'shadow-emerald-500/20' : 'shadow-cyan-500/20'}`}>
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-[13px] text-slate-600 font-medium">Status</span>
                          <div className={`font-bold text-[15px] ${job.status === 'COMPLETED' ? 'text-emerald-600' : job.status === 'PROCESSING' ? 'text-cyan-600' : 'text-amber-600'}`}>
                            {job.status === 'COMPLETED' ? 'Completed' : job.status === 'PROCESSING' ? 'Processing' : job.status === 'PENDING' ? 'Pending' : 'Failed'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Verification Methods */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-4 text-[16px] tracking-tight">Verification Methods Applied</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {['SMTP Verification', 'DNS Validation', 'Syntax Check', 'Disposable Detection', 
                          'Catch All Detection', 'Blacklist Check', 'Role Account Detection', 'Typo Correction',
                          'Spam Trap Check', 'Greylist Handling', 'Reputation Lookup', 'Deliverability Score'].map((method, i) => (
                          <div 
                            key={i} 
                            className="flex items-center gap-2 text-slate-700 py-1"
                          >
                            <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-[13px] font-medium tracking-tight">{method}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in">
          <div className="bg-white rounded-[32px] p-10 max-w-lg w-full shadow-2xl animate-scale-in">
            <h3 className="text-[32px] font-bold mb-6 text-slate-900 tracking-tight">Upload Email List</h3>
            
            {/* STEP 1: File Upload */}
            {step === 'upload' && (
              <>
                <div 
                  className={`relative w-full p-8 mb-6 border-3 ${selectedFile ? 'border-emerald-300 bg-emerald-50' : 'border-dashed border-slate-300 bg-slate-50'} rounded-2xl transition-all duration-300`}
                >
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
                    className="block w-full text-center py-4 cursor-pointer"
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-slate-900 font-bold text-[16px]">
                          {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-slate-600 text-[15px]">
                          <span className="text-cyan-600 font-bold">Click to choose</span> your CSV file
                        </span>
                      </div>
                    )}
                  </label>
                  
                  <p className="text-[12px] text-slate-500 mt-4 text-center">
                    You can upload up to {user?.credits?.toLocaleString() || 0} emails based on your available credits.
                  </p>
                </div>

                {uploadError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-[14px] text-red-600 font-medium">{uploadError}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      resetUploadState();
                    }}
                    className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition font-bold text-[15px]"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:shadow-lg hover:shadow-blue-500/25 transition disabled:opacity-50 font-bold text-[15px]"
                  >
                    {uploading ? 'Processing...' : 'Continue'}
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: Processing Screen */}
            {step === 'processing' && (
              <div className="text-center py-12">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-cyan-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-cyan-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-slate-900 font-bold text-[18px]">Uploading your list...</p>
                <p className="text-[14px] text-slate-500 mt-2">This takes about 2.5 seconds.</p>
              </div>
            )}

            {/* STEP 3: Column Selection & Confirmation */}
            {step === 'confirm' && showColumnSelector && (
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-[14px] text-slate-600">
                    📄 <strong className="text-slate-900">{selectedFile?.name}</strong>
                  </p>
                </div>

                <div>
                  <label className="text-[14px] font-bold text-slate-700 mb-3 block">
                    Select column containing emails:
                  </label>
                  <select
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                    className="w-full border-2 border-slate-300 rounded-2xl px-4 py-3 focus:border-cyan-500 focus:outline-none text-[15px] font-medium"
                  >
                    <option value="">-- Choose a column --</option>
                    {columnSelection.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200">
                  <div className="space-y-2 text-[14px]">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Emails detected:</span>
                      <strong className="text-slate-900">{detectedCount.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Credits required:</span>
                      <strong className="text-slate-900">{detectedCount.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Available credits:</span>
                      <strong className="text-cyan-600">{user?.credits?.toLocaleString() || 0}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      resetUploadState();
                      setStep('upload');
                    }}
                    className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition font-bold text-[15px]"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={startVerification}
                    disabled={!selectedColumn}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:shadow-lg hover:shadow-blue-500/25 transition disabled:opacity-50 font-bold text-[15px]"
                  >
                    Start Verification
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-fade-in-scale {
          animation: fadeInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
}