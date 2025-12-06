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
      className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Global Impact</h3>
          <p className="text-sm text-emerald-100">Combined savings from all users</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <TrendingDown className="w-5 h-5 mb-2 text-emerald-100" />
          <div className="text-3xl font-bold">{formatBytes(totalSaved)}</div>
          <div className="text-xs text-emerald-100 mt-1">Total Space Saved</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="text-3xl font-bold">{totalCompressions.toLocaleString()}</div>
          <div className="text-xs text-emerald-100 mt-1">Files Optimized</div>
        </div>
      </div>
    </motion.div>
  );
}