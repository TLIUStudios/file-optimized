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
    refetchInterval: 60000 // Refresh every minute
  });

  const totalSaved = stats.reduce((sum, s) => sum + s.saved_bytes, 0);
  const totalCompressions = stats.length;

  if (totalSaved === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 text-white shadow-lg max-w-2xl mx-auto overflow-hidden"
    >
      {/* Animated Lightning Border Effect */}
      <div className="absolute inset-0 rounded-xl pointer-events-none">
        <div className="absolute inset-0 rounded-xl animate-pulse" style={{ 
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.6), inset 0 0 20px rgba(16, 185, 129, 0.3)',
          animationDuration: '2s'
        }} />
        <svg className="absolute inset-0 w-full h-full" style={{ filter: 'blur(1px)' }}>
          <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="url(#lightning-gradient)" strokeWidth="2" rx="12" className="animate-dash" strokeDasharray="400" strokeDashoffset="0" />
          <defs>
            <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.8 }}>
                <animate attributeName="stop-color" values="#10b981;#34d399;#10b981" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" style={{ stopColor: '#34d399', stopOpacity: 1 }}>
                <animate attributeName="stop-color" values="#34d399;#6ee7b7;#34d399" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0.8 }}>
                <animate attributeName="stop-color" values="#10b981;#34d399;#10b981" dur="3s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      <style>{`
        @keyframes dash {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -800; }
        }
        .animate-dash {
          animation: dash 4s linear infinite;
        }
      `}</style>
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Global Impact</h3>
            <p className="text-xs text-emerald-100">Combined from all users</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold">{formatBytes(totalSaved)}</div>
            <div className="text-xs text-emerald-100">Space Saved</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalCompressions.toLocaleString()}</div>
            <div className="text-xs text-emerald-100">Files</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}