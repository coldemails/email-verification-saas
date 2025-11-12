// Socket.io Event Types for Email Verification

export interface JobStatusEvent {
  jobId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  message: string;
  timestamp: string;
}

export interface JobProgressEvent {
  jobId: string;
  totalEmails: number;
  processedEmails: number;
  validEmails: number;
  invalidEmails: number;
  unknownEmails: number;
  percentage: number;
  message: string;
}

export interface JobCompletedEvent {
  jobId: string;
  status: 'COMPLETED';
  totalEmails: number;
  processedEmails: number;
  validEmails: number;
  invalidEmails: number;
  unknownEmails: number;
  message: string;
  timestamp: string;
}

export interface JobFailedEvent {
  jobId: string;
  status: 'FAILED';
  message: string;
  error: string;
  timestamp: string;
}

export const SOCKET_EVENTS = {
  JOB_STATUS: 'job-status',
  JOB_PROGRESS: 'job-progress',
  JOB_COMPLETED: 'job-completed',
  JOB_FAILED: 'job-failed',
  JOIN_JOB: 'join-job',
  LEAVE_JOB: 'leave-job',
} as const;