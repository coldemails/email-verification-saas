'use client';

import { useEffect, useRef, useState } from 'react';

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate transform based on mouse position
  const getTransform = (depth: number) => {
    if (!isHovered) return 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    
    const rotateX = -mousePosition.y * 15; // Tilt up/down
    const rotateY = mousePosition.x * 15;  // Tilt left/right
    const translateZ = depth;
    
    return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[600px] flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Background glow - deepest layer */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-violet-500/20 blur-3xl transition-all duration-500"
        style={{ 
          transform: getTransform(-100),
          opacity: isHovered ? 1 : 0.6
        }}
      />

      {/* Main email verification card - center */}
      <div
        className="relative bg-white rounded-[32px] shadow-2xl border-2 border-slate-200 p-8 w-[420px] transition-all duration-500"
        style={{ 
          transform: getTransform(50),
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Card header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="text-[17px] font-semibold tracking-tight text-slate-900">Email List</h4>
              <p className="text-[13px] text-slate-500">Verifying 3 emails</p>
            </div>
          </div>
          <div className="animate-pulse">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </div>
          </div>
        </div>

        {/* Email verification items */}
        <div className="space-y-3">
          {/* Email 1 - Valid */}
          <div 
            className="flex items-center gap-3 p-4 rounded-[16px] bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50 animate-fade-in-up"
            style={{ 
              transform: getTransform(20),
              animationDelay: '0.1s'
            }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-md shadow-emerald-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-slate-900 truncate">john.smith@gmail.com</p>
              <p className="text-[12px] text-emerald-600 font-semibold">✓ Valid · SMTP verified</p>
            </div>
          </div>

          {/* Email 2 - Verifying */}
          <div 
            className="flex items-center gap-3 p-4 rounded-[16px] bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200/50 animate-fade-in-up"
            style={{ 
              transform: getTransform(20),
              animationDelay: '0.2s'
            }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-md shadow-cyan-500/30">
              <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-slate-900 truncate">sarah.jones@outlook.com</p>
              <p className="text-[12px] text-cyan-600 font-semibold">⚡ Checking DNS...</p>
            </div>
          </div>

          {/* Email 3 - Queue */}
          <div 
            className="flex items-center gap-3 p-4 rounded-[16px] bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200/50 animate-fade-in-up"
            style={{ 
              transform: getTransform(20),
              animationDelay: '0.3s'
            }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-gray-500 flex items-center justify-center shadow-md shadow-slate-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-slate-900 truncate">mike.wilson@company.com</p>
              <p className="text-[12px] text-slate-500 font-semibold">⏳ In queue</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-progress" style={{ width: '66%' }}></div>
          </div>
          <p className="text-[12px] text-slate-500 mt-2 text-center">2 of 3 verified · 66% complete</p>
        </div>
      </div>

      {/* Floating badge - top left */}
      <div
        className="absolute top-20 left-1/4 bg-white rounded-[20px] shadow-xl border border-slate-200 p-6 w-[200px] animate-fade-in-up animation-delay-400"
        style={{ 
          transform: getTransform(80),
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="text-center">
          <div className="text-[42px] font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            1,770
          </div>
          <p className="text-[13px] text-slate-600 font-medium">emails/min</p>
          <div className="mt-3 flex items-center justify-center gap-1">
            <svg className="w-4 h-4 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <span className="text-[11px] text-cyan-600 font-semibold">Lightning fast</span>
          </div>
        </div>
      </div>

      {/* Floating badge - top right */}
      <div
        className="absolute top-32 right-1/4 bg-white rounded-[20px] shadow-xl border border-slate-200 p-6 w-[180px] animate-fade-in-up animation-delay-500"
        style={{ 
          transform: getTransform(60),
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="text-center">
          <div className="text-[42px] font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
            97%
          </div>
          <p className="text-[13px] text-slate-600 font-medium">Accuracy</p>
          <div className="mt-3 inline-block px-3 py-1 bg-emerald-50 rounded-full">
            <span className="text-[11px] text-emerald-600 font-semibold">✓ Verified</span>
          </div>
        </div>
      </div>

      {/* Floating badge - bottom left */}
      <div
        className="absolute bottom-28 left-1/3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-[20px] shadow-xl border border-blue-500/20 p-5 w-[220px] text-white animate-fade-in-up animation-delay-600"
        style={{ 
          transform: getTransform(40),
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-semibold">12-Layer Check</p>
            <p className="text-[11px] opacity-90">Complete verification</p>
          </div>
        </div>
      </div>

      {/* Floating badge - bottom right */}
      <div
        className="absolute bottom-32 right-1/3 bg-white rounded-[20px] shadow-xl border border-slate-200 p-5 w-[200px] animate-fade-in-up animation-delay-700"
        style={{ 
          transform: getTransform(70),
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-slate-900">Secure</p>
            <p className="text-[11px] text-slate-500">Bank-level encryption</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 66%; }
        }

        .animate-progress {
          animation: progress 2s ease-out forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* Smooth transitions for all 3D elements */
        > div {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}