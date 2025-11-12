'use client';

import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';

interface JobProgressProps {
  jobId: string;
}

export function JobProgress({ jobId }: JobProgressProps) {
  const [progress, setProgress] = useState({
    processed: 0,
    total: 0,
    valid: 0,
    invalid: 0,
    unknown: 0,
  });

  useEffect(() => {
    // Join the job room
    socket.emit('join-job', jobId);

    // Listen for progress updates
    socket.on('job-progress', (data) => {
      console.log('Progress update:', data);
      setProgress(data);
    });

    // Listen for completion
    socket.on('job-completed', (data) => {
      console.log('Job completed:', data);
      setProgress(data);
    });

    return () => {
      socket.off('job-progress');
      socket.off('job-completed');
      socket.emit('leave-job', jobId);
    };
  }, [jobId]);

  const percentage = progress.total > 0 
    ? Math.round((progress.processed / progress.total) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <span>Processing: {progress.processed} / {progress.total}</span>
        <span>{percentage}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div 
          className="bg-blue-600 h-4 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-600">Valid Emails</p>
          <p className="text-2xl font-bold text-green-600">{progress.valid}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Invalid Emails</p>
          <p className="text-2xl font-bold text-red-600">{progress.invalid}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Unknown</p>
          <p className="text-2xl font-bold text-yellow-600">{progress.unknown}</p>
        </div>
      </div>
    </div>
  );
}