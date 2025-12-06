import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Globe, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

export default function GlobalStats() {
  const [glitchText, setGlitchText] = useState([]);
  
  useEffect(() => {
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
    const interval = setInterval(() => {
      setGlitchText(Array.from({ length: 20 }, () => 
        Array.from({ length: 15 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      ));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const { data: stats = [], isLoading } = useQuery({
    queryKey: ['globalCompressionStats'],
    queryFn: async () => {
      try {
        return await base44.entities.CompressionStat.list('-created_date', 10000);
      } catch (error) {
        console.error('Failed to fetch global stats:', error);
        return [];
      }
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: [], // Show empty array immediately
    retry: 2, // Retry failed requests twice
    retryDelay: 1000 // Wait 1 second between retries
  });

  // Only count positive savings (when file size was actually reduced)
  const statsWithSavings = stats.filter(s => s.saved_bytes > 0);
  const totalSaved = statsWithSavings.reduce((sum, s) => sum + s.saved_bytes, 0);
  const totalCompressions = statsWithSavings.length;

  // Show loading skeleton
  if (isLoading || totalSaved === 0) {
    if (isLoading) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-3 text-white shadow-lg max-w-md mx-auto overflow-hidden"
        >
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex flex-col items-start">
                <h3 className="text-xs font-bold leading-tight">Global Impact</h3>
                <p className="text-[10px] text-emerald-100 leading-tight">Loading...</p>
              </div>
            </div>

            <div className="flex items-center gap-24">
              <div className="text-right">
                <div className="text-base font-bold h-6 w-20 bg-white/20 rounded animate-pulse"></div>
                <div className="text-[10px] text-emerald-100">Space Saved</div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold h-6 w-16 bg-white/20 rounded animate-pulse"></div>
                <div className="text-[10px] text-emerald-100">Files</div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-3 text-white shadow-lg max-w-md mx-auto overflow-hidden"
    >
      {/* Matrix falling code background effect */}
      <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden font-mono">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-[9px] leading-tight whitespace-pre animate-matrix-fall"
            style={{
              left: `${(i * 6.67)}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              color: i % 3 === 0 ? '#6ee7b7' : i % 3 === 1 ? '#34d399' : '#a7f3d0'
            }}
          >
            {glitchText[i % glitchText.length]?.split('').join('\n')}
          </div>
        ))}
      </div>
      
      {/* Multiple glitch scanlines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent animate-scanline opacity-30" />
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent animate-scanline-reverse opacity-20" />
        <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-emerald-300 to-transparent animate-scanline-horizontal opacity-20" />
      </div>
      
      {/* RGB glitch split effect */}
      <div className="absolute inset-0 pointer-events-none animate-rgb-split opacity-30 mix-blend-screen">
        <div className="absolute inset-0 bg-red-500 animate-glitch-x" style={{ mixBlendMode: 'screen', opacity: 0.1 }} />
        <div className="absolute inset-0 bg-cyan-500 animate-glitch-y" style={{ mixBlendMode: 'screen', opacity: 0.1 }} />
      </div>
      
      {/* Digital noise overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none animate-digital-noise" 
           style={{ 
             backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`
           }} 
      />
      
      {/* Random pixel corruption effect */}
      <div className="absolute inset-0 pointer-events-none animate-pixel-corrupt opacity-10">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-300 animate-glitch-pixel"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${0.5 + Math.random()}s`
            }}
          />
        ))}
      </div>
      
      <style>{`
        @keyframes matrix-fall {
          0% { 
            transform: translateY(-120%); 
            opacity: 0;
          }
          10% { opacity: 1; }
          85% { opacity: 0.8; }
          100% { 
            transform: translateY(220%); 
            opacity: 0;
          }
        }
        @keyframes scanline {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes scanline-reverse {
          0% { bottom: -2px; }
          100% { bottom: 100%; }
        }
        @keyframes scanline-horizontal {
          0% { left: -2px; }
          100% { left: 100%; }
        }
        @keyframes digital-noise {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2px, -1px); }
          20% { transform: translate(2px, 1px); }
          30% { transform: translate(-1px, 2px); }
          40% { transform: translate(1px, -2px); }
          50% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          70% { transform: translate(-2px, 1px); }
          80% { transform: translate(1px, -1px); }
          90% { transform: translate(-1px, -2px); }
        }
        @keyframes glitch-x {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        @keyframes glitch-y {
          0%, 100% { transform: translateY(0); }
          33% { transform: translateY(-2px); }
          66% { transform: translateY(2px); }
        }
        @keyframes rgb-split {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.1; }
        }
        @keyframes glitch-pixel {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        .animate-matrix-fall {
          animation: matrix-fall linear infinite;
        }
        .animate-scanline {
          animation: scanline 2s linear infinite;
        }
        .animate-scanline-reverse {
          animation: scanline-reverse 3s linear infinite;
        }
        .animate-scanline-horizontal {
          animation: scanline-horizontal 4s linear infinite;
        }
        .animate-digital-noise {
          animation: digital-noise 0.3s steps(4, end) infinite;
        }
        .animate-glitch-x {
          animation: glitch-x 0.5s ease-in-out infinite;
        }
        .animate-glitch-y {
          animation: glitch-y 0.7s ease-in-out infinite;
        }
        .animate-rgb-split {
          animation: rgb-split 1.5s ease-in-out infinite;
        }
        .animate-glitch-pixel {
          animation: glitch-pixel 1s ease-in-out infinite;
        }
      `}</style>
      {/* Animated Lightning Border Effect */}
      <div className="absolute inset-0 rounded-xl pointer-events-none">
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-xl animate-pulse" style={{ 
          boxShadow: '0 0 30px rgba(52, 211, 153, 0.8), inset 0 0 30px rgba(52, 211, 153, 0.4)',
          animationDuration: '1.5s'
        }} />
        
        {/* Animated lightning SVG border */}
        <svg className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 8px rgba(52, 211, 153, 0.8))' }}>
          <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" fill="none" stroke="url(#lightning-gradient)" strokeWidth="3" rx="12" className="animate-dash" strokeDasharray="300" strokeDashoffset="0" />
          <defs>
            <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#34d399', stopOpacity: 1 }}>
                <animate attributeName="stop-color" values="#34d399;#6ee7b7;#a7f3d0;#6ee7b7;#34d399" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" style={{ stopColor: '#6ee7b7', stopOpacity: 1 }}>
                <animate attributeName="stop-color" values="#6ee7b7;#a7f3d0;#6ee7b7;#34d399;#6ee7b7" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" style={{ stopColor: '#34d399', stopOpacity: 1 }}>
                <animate attributeName="stop-color" values="#34d399;#6ee7b7;#a7f3d0;#6ee7b7;#34d399" dur="2s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>
        </svg>
        
        {/* Animated Lightning Zaps */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 bg-gradient-to-b from-transparent via-emerald-300 to-transparent animate-zap"
            style={{
              height: '20px',
              left: `${(i + 1) * 12}%`,
              top: '0',
              animationDelay: `${i * 0.3}s`,
              animationDuration: '2s',
              filter: 'drop-shadow(0 0 6px rgba(52, 211, 153, 0.8))',
              opacity: 0
            }}
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <div
            key={`bottom-${i}`}
            className="absolute w-0.5 bg-gradient-to-t from-transparent via-emerald-300 to-transparent animate-zap"
            style={{
              height: '20px',
              left: `${(i + 1) * 12}%`,
              bottom: '0',
              animationDelay: `${i * 0.3 + 1}s`,
              animationDuration: '2s',
              filter: 'drop-shadow(0 0 6px rgba(52, 211, 153, 0.8))',
              opacity: 0
            }}
          />
        ))}
        {[...Array(4)].map((_, i) => (
          <div
            key={`left-${i}`}
            className="absolute h-0.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent animate-zap"
            style={{
              width: '20px',
              left: '0',
              top: `${(i + 1) * 25}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: '2s',
              filter: 'drop-shadow(0 0 6px rgba(52, 211, 153, 0.8))',
              opacity: 0
            }}
          />
        ))}
        {[...Array(4)].map((_, i) => (
          <div
            key={`right-${i}`}
            className="absolute h-0.5 bg-gradient-to-l from-transparent via-emerald-300 to-transparent animate-zap"
            style={{
              width: '20px',
              right: '0',
              top: `${(i + 1) * 25}%`,
              animationDelay: `${i * 0.4 + 0.5}s`,
              animationDuration: '2s',
              filter: 'drop-shadow(0 0 6px rgba(52, 211, 153, 0.8))',
              opacity: 0
            }}
          />
        ))}
      </div>
      
      <style>{`
        @keyframes dash {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -600; }
        }
        .animate-dash {
          animation: dash 3s linear infinite;
        }
        @keyframes zap {
          0% { opacity: 0; transform: scaleY(0); }
          10% { opacity: 1; transform: scaleY(1); }
          20% { opacity: 0.8; }
          30% { opacity: 1; }
          40% { opacity: 0; transform: scaleY(1); }
          100% { opacity: 0; transform: scaleY(0); }
        }
        .animate-zap {
          animation: zap 2s ease-in-out infinite;
        }
      `}</style>
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div className="flex flex-col items-start">
            <h3 className="text-xs font-bold leading-tight">Global Impact</h3>
            <p className="text-[10px] text-emerald-100 leading-tight">Combined from all users</p>
          </div>
        </div>

        <div className="flex items-center gap-24">
          <div className="text-right">
            <div className="text-base font-bold">{formatBytes(totalSaved)}</div>
            <div className="text-[10px] text-emerald-100">Space Saved</div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold">{totalCompressions.toLocaleString()}</div>
            <div className="text-[10px] text-emerald-100">Files</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}