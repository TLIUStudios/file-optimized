import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Globe, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

export default function GlobalStats() {
  const { data: stats = [] } = useQuery({
    queryKey: ['globalCompressionStats'],
    queryFn: async () => {
      return await base44.entities.CompressionStat.list('-created_date', 10000);
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000 // Consider data fresh for 30 seconds
  });

  const totalSaved = stats.reduce((sum, s) => sum + s.saved_bytes, 0);
  const totalCompressions = stats.length;

  if (totalSaved === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-3 text-white shadow-lg max-w-md mx-auto overflow-hidden"
    >
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