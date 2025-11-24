'use client';

import { useEffect, useRef, useState } from 'react';

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [activeLayer, setActiveLayer] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount (mobile breakpoint = 768)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mouse parallax on desktop only
  useEffect(() => {
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

  // Animate through layers (900ms as requested)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLayer((prev) => (prev + 1) % 12);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  const getTransform = (depth: number) => {
    if (isMobile) return 'none';
    if (!isHovered) return `perspective(1200px) translateZ(${depth}px)`;
    const rotateX = -mousePosition.y * 8;
    const rotateY = mousePosition.x * 8;
    const translateZ = depth + 20;
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
      className="relative w-full min-h-[700px] md:min-h-[850px] flex items-center justify-center overflow-visible px-4"
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      style={{ transformStyle: isMobile ? 'flat' : 'preserve-3d' }}
    >
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-violet-50 opacity-60"></div>
      <div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-cyan-500/8 to-violet-500/8 blur-3xl transition-all duration-500"
        style={{ opacity: isHovered ? 0.8 : 0.45 }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full max-w-[1400px]">
        {/* LEFT: Speed Badge */}
        <div
          className="bg-white rounded-[24px] shadow-2xl border-2 border-slate-200 p-6 sm:p-8 md:p-10 w-full max-w-[300px] md:w-[280px] transition-transform duration-500 hover:scale-105"
          style={{
            transform: getTransform(60),
            transformStyle: isMobile ? 'flat' : 'preserve-3d',
            WebkitFontSmoothing: 'antialiased',
            backfaceVisibility: 'hidden'
          }}
        >
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/40 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
              </svg>
            </div>

            <div className="text-[44px] sm:text-[52px] md:text-[56px] font-bold tracking-tighter bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 leading-none">
              1,770
            </div>

            <p className="text-[14px] sm:text-[15px] md:text-[16px] text-slate-600 font-semibold mb-2">emails/minute</p>
            <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-cyan-50 rounded-full border border-cyan-200">
              <p className="text-[11px] sm:text-[12px] font-bold text-cyan-700">⚡ 60x faster</p>
            </div>
          </div>
        </div>

        {/* CENTER: 12-Layer Stack */}
        <div
          className="relative flex-shrink-0"
          style={{
            transform: getTransform(80),
            transformStyle: isMobile ? 'flat' : 'preserve-3d'
          }}
        >
          {/* Title bubble (responsive offsets + padding) */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2
              -top-12 sm:-top-16 md:-top-24
              bg-gradient-to-br from-blue-600 to-cyan-600 text-white
              px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-[18px] shadow-2xl shadow-blue-500/40 z-50 text-center"
          >
            <p className="text-[16px] sm:text-[18px] md:text-[22px] font-bold tracking-tight">
              12-Layer Deep Verification
            </p>
          </div>

          {/* Main active layer card (responsive width/height/padding) */}
          <div
            className="relative w-full
              max-w-[340px] sm:max-w-[420px] md:max-w-[550px]
              h-[150px] sm:h-[170px] md:h-[200px] flex items-center justify-center"
          >
            <div
              className="bg-white rounded-[28px] border border-cyan-200 shadow-2xl p-4 sm:p-6 md:p-10 w-full transform hover:scale-105 transition-all duration-500"
              style={{
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
            >
              <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
                {/* Large Icon */}
                <div
                  className={`w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-[20px] bg-gradient-to-br ${verificationLayers[activeLayer].color} flex items-center justify-center shadow-xl ${verificationLayers[activeLayer].shadow} animate-pulse`}
                >
                  <span className="text-[30px] sm:text-[40px] md:text-[48px]">{verificationLayers[activeLayer].icon}</span>
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className="text-[18px] sm:text-[22px] md:text-[28px] font-bold text-slate-900 tracking-tight mb-0 ">
                    {verificationLayers[activeLayer].name}
                  </p>
                  <p className="text-[13px] sm:text-[14px] md:text-[16px] text-slate-500 font-medium mt-1">
                    Layer {activeLayer + 1} of 12
                  </p>
                </div>

                {/* Check icon */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg animate-scale-in">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Subtle stacked cards behind (keeps depth visual but responsive) */}
            <div className="absolute inset-0 -z-10">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 bg-white rounded-[20px] border border-slate-300 opacity-60"
                  style={{
                    transform: `translateY(${(i + 1) * 6}px) translateZ(-${(i + 1) * 8}px) scale(${1 - (i + 1) * 0.015})`,
                    zIndex: -i - 1
                  }}
                />
              ))}
            </div>
          </div>

          {/* Progress indicator (responsive bottom offset + padding) */}
          <div className="absolute left-1/2 transform -translate-x-1/2
            -bottom-8 sm:-bottom-10 md:-bottom-16 text-center">
            <div className="inline-block px-4 py-2 sm:px-5 sm:py-3 bg-white/95 backdrop-blur-sm rounded-full border border-slate-200 shadow-lg">
              <p className="text-[12px] sm:text-[13px] md:text-[14px] font-semibold text-slate-700">
                Processing: <span className="text-cyan-600">Layer {activeLayer + 1}/12</span>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Accuracy Badge */}
        <div
          className="bg-white rounded-[24px] shadow-2xl border-2 border-slate-200 p-6 sm:p-8 md:p-10 w-full max-w-[300px] md:w-[280px] transition-transform duration-500 hover:scale-105"
          style={{
            transform: getTransform(60),
            transformStyle: isMobile ? 'flat' : 'preserve-3d',
            WebkitFontSmoothing: 'antialiased',
            backfaceVisibility: 'hidden'
          }}
        >
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xl relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" fillRule="evenodd" clipRule="evenodd" />
              </svg>
            </div>

            <div className="text-[44px] sm:text-[52px] md:text-[56px] font-bold tracking-tighter bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2 leading-none">
              97%
            </div>

            <p className="text-[14px] sm:text-[15px] md:text-[16px] text-slate-600 font-semibold mb-2">Accuracy</p>
            <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-50 rounded-full border border-emerald-200">
              <p className="text-[11px] sm:text-[12px] font-bold text-emerald-700">✓ Industry-leading</p>
            </div>
          </div>
        </div>
      </div>

      {/* small CSS animations */}
      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.6) rotate(-160deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      {/* Trust Badges row */}
      <div className="absolute -bottom-28 md:-bottom-32 left-1/2 transform -translate-x-1/2 w-full max-w-[1100px] px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="flex flex-col items-center text-center p-4 sm:p-5 rounded-[14px] bg-white border border-emerald-200/50 hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-2 shadow-md">
              <span className="text-[18px]">🔒</span>
            </div>
            <p className="text-[11px] sm:text-[12px] font-semibold text-slate-900 tracking-tight">Bank-level Encryption</p>
          </div>

          <div className="flex flex-col items-center text-center p-4 sm:p-5 rounded-[14px] bg-white border border-cyan-200/50 hover:border-cyan-300 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center mb-2 shadow-md">
              <span className="text-[18px]">⚡</span>
            </div>
            <p className="text-[11px] sm:text-[12px] font-semibold text-slate-900 tracking-tight">99.9% Uptime</p>
          </div>

          <div className="flex flex-col items-center text-center p-4 sm:p-5 rounded-[14px] bg-white border border-blue-200/50 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-2 shadow-md">
              <span className="text-[18px]">🗑️</span>
            </div>
            <p className="text-[11px] sm:text-[12px] font-semibold text-slate-900 tracking-tight">Auto-delete in 30 days</p>
          </div>

          <div className="flex flex-col items-center text-center p-4 sm:p-5 rounded-[14px] bg-white border border-slate-200/50 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center mb-2 shadow-md">
              <span className="text-[18px]">🌍</span>
            </div>
            <p className="text-[11px] sm:text-[12px] font-semibold text-slate-900 tracking-tight">GDPR Compliant</p>
          </div>
        </div>
      </div>
    </div>
  );
}
