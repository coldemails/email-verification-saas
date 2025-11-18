'use client';

import { useEffect, useRef, useState } from 'react';

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [activeLayer, setActiveLayer] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Only add mouse tracking on desktop
    if (isMobile) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  // Animate through layers
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLayer(prev => (prev + 1) % 12);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Calculate transform based on mouse position
  const getTransform = (depth: number, index?: number) => {
    // On mobile, no 3D transforms
    if (isMobile) return 'none';
    
    if (!isHovered) return `perspective(1200px) translateZ(${depth}px)`;
    
    const rotateX = -mousePosition.y * 8;
    const rotateY = mousePosition.x * 8;
    const translateZ = depth + (isHovered ? 20 : 0);
    
    return `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
  };

  const verificationLayers = [
    { icon: '✉️', name: 'Syntax Check', color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/30' },
    { icon: '🌐', name: 'DNS Validation', color: 'from-cyan-500 to-teal-500', shadow: 'shadow-cyan-500/30' },
    { icon: '📧', name: 'SMTP Verification', color: 'from-teal-500 to-emerald-500', shadow: 'shadow-teal-500/30' },
    { icon: '🗑️', name: 'Disposable Detection', color: 'from-emerald-500 to-green-500', shadow: 'shadow-emerald-500/30' },
    { icon: '👤', name: 'Role Account Filter', color: 'from-green-500 to-lime-500', shadow: 'shadow-green-500/30' },
    { icon: '🎯', name: 'Catch-all Detection', color: 'from-lime-500 to-yellow-500', shadow: 'shadow-lime-500/30' },
    { icon: '🚫', name: 'Spam Trap Check', color: 'from-yellow-500 to-orange-500', shadow: 'shadow-yellow-500/30' },
    { icon: '⚠️', name: 'Blacklist Check', color: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/30' },
    { icon: '✏️', name: 'Typo Correction', color: 'from-red-500 to-pink-500', shadow: 'shadow-red-500/30' },
    { icon: '⏳', name: 'Greylist Handling', color: 'from-pink-500 to-purple-500', shadow: 'shadow-pink-500/30' },
    { icon: '📊', name: 'Risk Scoring', color: 'from-purple-500 to-violet-500', shadow: 'shadow-purple-500/30' },
    { icon: '✅', name: 'Deliverability Score', color: 'from-violet-500 to-indigo-500', shadow: 'shadow-violet-500/30' }
  ];

  return (
    <div 
      ref={containerRef}
      className="relative w-full min-h-[850px] md:h-[850px] flex items-center justify-center overflow-visible px-4"
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      style={{ transformStyle: isMobile ? 'flat' : 'preserve-3d' }}
    >
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-violet-50 opacity-50"></div>
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-violet-500/10 blur-3xl transition-all duration-500"
        style={{ 
          opacity: isHovered ? 0.8 : 0.4
        }}
      />

      {/* Main container */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full max-w-[1400px]">
        
        {/* LEFT: Speed Badge */}
        <div
          className="bg-white rounded-[28px] shadow-2xl border-2 border-slate-200 p-8 md:p-10 w-full max-w-[320px] md:w-[280px] transition-all duration-500 hover:scale-105"
          style={{ 
            transform: getTransform(80),
            transformStyle: isMobile ? 'flat' : 'preserve-3d',
            WebkitFontSmoothing: 'antialiased',
            backfaceVisibility: 'hidden'
          }}
        >
          <div className="text-center">
            {/* Lightning icon - upgraded with gradient background */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/50 relative">
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
              <svg className="w-10 h-10 text-white relative z-10 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
              </svg>
            </div>
            
            {/* Number */}
            <div className="text-[56px] font-bold tracking-tighter bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3 leading-none">
              1,770
            </div>
            
            {/* Label */}
            <p className="text-[16px] text-slate-600 font-semibold mb-2">emails/minute</p>
            <div className="inline-block px-4 py-2 bg-cyan-50 rounded-full border border-cyan-200">
              <p className="text-[12px] font-bold text-cyan-700">⚡ 60x faster</p>
            </div>
          </div>
        </div>

        {/* CENTER: 12-Layer Stack */}
        <div
          className="relative"
          style={{ 
            transform: getTransform(100),
            transformStyle: isMobile ? 'flat' : 'preserve-3d'
          }}
        >
          {/* Title card on top */}
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-[20px] shadow-2xl shadow-blue-500/40 z-50">
            <p className="text-[22px] font-bold tracking-tight text-center">12-Layer Deep Verification</p>
          </div>

          {/* Main active layer - large and prominent */}
          <div className="relative w-full max-w-[550px] md:w-[550px] h-[200px] flex items-center justify-center">
            <div className="bg-white rounded-[32px] border-3 border-cyan-400 shadow-2xl shadow-cyan-500/30 p-10 w-full transform hover:scale-105 transition-all duration-500"
              style={{
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
            >
              <div className="flex items-center gap-8">
                {/* Large Icon */}
                <div className={`w-24 h-24 rounded-[24px] bg-gradient-to-br ${verificationLayers[activeLayer].color} flex items-center justify-center shadow-xl ${verificationLayers[activeLayer].shadow} animate-pulse`}>
                  <span className="text-[48px]">{verificationLayers[activeLayer].icon}</span>
                </div>
                
                {/* Text */}
                <div className="flex-1">
                  <p className="text-[28px] font-bold text-slate-900 tracking-tight mb-2">
                    {verificationLayers[activeLayer].name}
                  </p>
                  <p className="text-[16px] text-slate-500 font-medium">
                    Layer {activeLayer + 1} of 12
                  </p>
                </div>
                
                {/* Check icon */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-scale-in">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Stack visualization - behind main card */}
            <div className="absolute inset-0 -z-10">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 bg-white rounded-[28px] border border-slate-300 opacity-60"
                  style={{
                    transform: `translateY(${(i + 1) * 6}px) translateZ(-${(i + 1) * 10}px) scale(${1 - (i + 1) * 0.02})`,
                    zIndex: -i - 1
                  }}
                />
              ))}
            </div>
          </div>

          {/* Progress indicator */}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
            <div className="inline-block px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full border border-slate-200 shadow-lg">
              <p className="text-[14px] font-semibold text-slate-700">
                Processing: <span className="text-cyan-600">Layer {activeLayer + 1}/12</span>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Accuracy Badge */}
        <div
          className="bg-white rounded-[28px] shadow-2xl border-2 border-slate-200 p-8 md:p-10 w-full max-w-[320px] md:w-[280px] transition-all duration-500 hover:scale-105"
          style={{ 
            transform: getTransform(80),
            transformStyle: isMobile ? 'flat' : 'preserve-3d',
            WebkitFontSmoothing: 'antialiased',
            backfaceVisibility: 'hidden'
          }}
        >
          <div className="text-center">
            {/* Check icon - upgraded with gradient background */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xl shadow-emerald-500/50 relative">
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
              <svg className="w-10 h-10 text-white relative z-10 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" fillRule="evenodd" clipRule="evenodd"/>
              </svg>
            </div>
            
            {/* Number */}
            <div className="text-[56px] font-bold tracking-tighter bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3 leading-none">
              97%
            </div>
            
            {/* Label */}
            <p className="text-[16px] text-slate-600 font-semibold mb-2">Accuracy</p>
            <div className="inline-block px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
              <p className="text-[12px] font-bold text-emerald-700">✓ Industry-leading</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0) rotate(-180deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      {/* Trust Badges - moved here */}
      <div className="absolute -bottom-32 md:-bottom-32 left-1/2 transform -translate-x-1/2 w-full max-w-[1100px] px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="flex flex-col items-center text-center p-5 rounded-[18px] bg-white border border-emerald-200/50 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 group">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-2 shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
              <span className="text-[20px]">🔒</span>
            </div>
            <p className="text-[12px] font-semibold text-slate-900 tracking-tight">Bank-level Encryption</p>
          </div>

          <div className="flex flex-col items-center text-center p-5 rounded-[18px] bg-white border border-cyan-200/50 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 group">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center mb-2 shadow-md shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
              <span className="text-[20px]">⚡</span>
            </div>
            <p className="text-[12px] font-semibold text-slate-900 tracking-tight">99.9% Uptime</p>
          </div>

          <div className="flex flex-col items-center text-center p-5 rounded-[18px] bg-white border border-blue-200/50 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-2 shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <span className="text-[20px]">🗑️</span>
            </div>
            <p className="text-[12px] font-semibold text-slate-900 tracking-tight">Auto-delete in 30 days</p>
          </div>

          <div className="flex flex-col items-center text-center p-5 rounded-[18px] bg-white border border-slate-200/50 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-300 group">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center mb-2 shadow-md shadow-slate-500/20 group-hover:scale-110 transition-transform duration-300">
              <span className="text-[20px]">🌍</span>
            </div>
            <p className="text-[12px] font-semibold text-slate-900 tracking-tight">GDPR Compliant</p>
          </div>
        </div>
      </div>
    </div>
  );
}