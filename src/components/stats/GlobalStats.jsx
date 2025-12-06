import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

export default function GlobalStats() {

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
          className="relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-3 text-white shadow-lg max-w-md mx-auto overflow-hidden"
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
      {/* Matrix falling code background effect - multiple layers */}
      <div className="absolute inset-0 opacity-35 pointer-events-none overflow-hidden font-mono">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute text-[10px] leading-none whitespace-pre animate-matrix-fall font-bold"
            style={{
              left: `${(i * 4)}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1.2 + Math.random() * 1.5}s`,
              color: i % 4 === 0 ? '#6ee7b7' : i % 4 === 1 ? '#34d399' : i % 4 === 2 ? '#a7f3d0' : '#10b981',
              textShadow: '0 0 12px currentColor, 0 0 20px currentColor',
              opacity: 0.8 + Math.random() * 0.2
            }}
          >
            {glitchText[i % glitchText.length]?.split('').join('\n')}
          </div>
        ))}
      </div>
      
      {/* Multiple glitch scanlines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent animate-scanline opacity-60 shadow-lg shadow-emerald-400/70" style={{ filter: 'blur(2px)' }} />
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent animate-scanline-reverse opacity-50" />
        <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-scanline-fast opacity-80 shadow-lg shadow-white/50" style={{ filter: 'blur(1.5px)' }} />
        <div className="absolute h-full w-1 bg-gradient-to-b from-transparent via-emerald-300 to-transparent animate-scanline-horizontal opacity-50 shadow-lg shadow-emerald-400/70" style={{ filter: 'blur(2px)' }} />
      </div>

      {/* RGB chromatic aberration glitch */}
      <div className="absolute inset-0 pointer-events-none opacity-60 mix-blend-screen">
        <div className="absolute inset-0 bg-red-500 animate-glitch-x-intense" style={{ mixBlendMode: 'screen', opacity: 0.25 }} />
        <div className="absolute inset-0 bg-cyan-400 animate-glitch-y-intense" style={{ mixBlendMode: 'screen', opacity: 0.25 }} />
        <div className="absolute inset-0 bg-green-400 animate-glitch-diagonal" style={{ mixBlendMode: 'screen', opacity: 0.2 }} />
      </div>

      {/* Digital noise overlay - more intense */}
      <div className="absolute inset-0 opacity-15 pointer-events-none animate-digital-noise-intense" 
           style={{ 
             backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.08) 1px, rgba(255,255,255,0.08) 2px)`
           }} 
      />

      {/* Random pixel corruption effect - more pixels */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-emerald-400 animate-glitch-pixel"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${0.3 + Math.random() * 0.7}s`,
              boxShadow: '0 0 6px currentColor, 0 0 10px currentColor'
            }}
          />
        ))}
      </div>

      {/* Horizontal data stream lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-300 to-transparent animate-data-stream"
            style={{
              top: `${(i + 1) * 10}%`,
              animationDelay: `${i * 0.25}s`,
              animationDuration: `${0.8 + Math.random() * 0.5}s`,
              boxShadow: '0 0 8px rgba(52, 211, 153, 0.6)'
            }}
          />
        ))}
      </div>

      {/* Glitch blocks */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-emerald-400 animate-glitch-blocks"
            style={{
              width: `${15 + Math.random() * 40}px`,
              height: `${3 + Math.random() * 5}px`,
              left: `${Math.random() * 90}%`,
              top: `${Math.random() * 90}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${0.4 + Math.random() * 1}s`,
              boxShadow: '0 0 10px currentColor'
            }}
          />
        ))}
      </div>

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

        @keyframes matrix-fall {
          0% { 
            transform: translateY(-150%); 
            opacity: 0;
          }
          5% { opacity: 0.8; }
          10% { opacity: 1; }
          80% { opacity: 1; }
          95% { opacity: 0.5; }
          100% { 
            transform: translateY(250%); 
            opacity: 0;
          }
        }
        @keyframes scanline {
          0% { top: -4px; }
          100% { top: 105%; }
        }
        @keyframes scanline-fast {
          0% { top: -4px; }
          100% { top: 105%; }
        }
        @keyframes scanline-reverse {
          0% { bottom: -4px; }
          100% { bottom: 105%; }
        }
        @keyframes scanline-horizontal {
          0% { left: -4px; }
          100% { left: 105%; }
        }
        @keyframes digital-noise-intense {
          0%, 100% { transform: translate(0, 0); }
          5% { transform: translate(-3px, -2px); }
          10% { transform: translate(3px, 2px); }
          15% { transform: translate(-2px, 3px); }
          20% { transform: translate(2px, -3px); }
          25% { transform: translate(-3px, -3px); }
          30% { transform: translate(3px, 3px); }
          35% { transform: translate(-3px, 2px); }
          40% { transform: translate(2px, -2px); }
          45% { transform: translate(-2px, -3px); }
          50% { transform: translate(3px, -3px); }
          55% { transform: translate(-3px, 3px); }
          60% { transform: translate(2px, 2px); }
          65% { transform: translate(-2px, -2px); }
          70% { transform: translate(3px, -2px); }
          75% { transform: translate(-3px, 2px); }
          80% { transform: translate(2px, 3px); }
          85% { transform: translate(-2px, -3px); }
          90% { transform: translate(3px, 2px); }
          95% { transform: translate(-3px, -2px); }
        }
        @keyframes glitch-x-intense {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-5px); }
          20% { transform: translateX(5px); }
          30% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          50% { transform: translateX(-3px); }
          60% { transform: translateX(3px); }
          70% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
          90% { transform: translateX(-4px); }
        }
        @keyframes glitch-y-intense {
          0%, 100% { transform: translateY(0); }
          15% { transform: translateY(-4px); }
          30% { transform: translateY(4px); }
          45% { transform: translateY(-3px); }
          60% { transform: translateY(3px); }
          75% { transform: translateY(-4px); }
          90% { transform: translateY(4px); }
        }
        @keyframes glitch-diagonal {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-3px, -3px); }
          50% { transform: translate(3px, 3px); }
          75% { transform: translate(-3px, 3px); }
        }
        @keyframes glitch-pixel {
          0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
          25% { opacity: 1; transform: scale(2) rotate(45deg); }
          50% { opacity: 0.7; transform: scale(1.5) rotate(-45deg); }
          75% { opacity: 1; transform: scale(2.5) rotate(90deg); }
        }
        @keyframes data-stream {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        @keyframes glitch-blocks {
          0%, 100% { opacity: 0; transform: translateX(0) scaleX(1); }
          10% { opacity: 1; transform: translateX(-20px) scaleX(1.5); }
          20% { opacity: 0.8; transform: translateX(15px) scaleX(0.8); }
          30% { opacity: 1; transform: translateX(-10px) scaleX(1.2); }
          40% { opacity: 0; transform: translateX(0) scaleX(1); }
        }
        .animate-matrix-fall {
          animation: matrix-fall linear infinite;
        }
        .animate-scanline {
          animation: scanline 1.5s linear infinite;
        }
        .animate-scanline-fast {
          animation: scanline-fast 0.8s linear infinite;
        }
        .animate-scanline-reverse {
          animation: scanline-reverse 2s linear infinite;
        }
        .animate-scanline-horizontal {
          animation: scanline-horizontal 2.5s linear infinite;
        }
        .animate-digital-noise-intense {
          animation: digital-noise-intense 0.2s steps(8, end) infinite;
        }
        .animate-glitch-x-intense {
          animation: glitch-x-intense 0.4s ease-in-out infinite;
        }
        .animate-glitch-y-intense {
          animation: glitch-y-intense 0.5s ease-in-out infinite;
        }
        .animate-glitch-diagonal {
          animation: glitch-diagonal 0.6s ease-in-out infinite;
        }
        .animate-glitch-pixel {
          animation: glitch-pixel 0.8s ease-in-out infinite;
        }
        .animate-data-stream {
          animation: data-stream 2s linear infinite;
        }
        .animate-glitch-blocks {
          animation: glitch-blocks 2s ease-in-out infinite;
        }
      `}</style>
      {/* Animated Lightning Border Effect */}
      <div className="absolute inset-0 rounded-xl pointer-events-none">
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-xl animate-pulse" style={{ 
          boxShadow: '0 0 50px rgba(52, 211, 153, 1), 0 0 80px rgba(52, 211, 153, 0.8), inset 0 0 40px rgba(52, 211, 153, 0.6), inset 0 0 60px rgba(52, 211, 153, 0.4)',
          animationDuration: '1.2s'
        }} />
        <div className="absolute inset-0 rounded-xl" style={{ 
          boxShadow: '0 0 100px rgba(110, 231, 183, 0.6), 0 0 150px rgba(16, 185, 129, 0.4)',
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