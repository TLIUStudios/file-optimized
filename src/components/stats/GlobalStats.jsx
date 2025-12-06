import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Globe } from "lucide-react";

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
    refetchInterval: 120000, // Reduced frequency: 2 minutes
    staleTime: 90000, // Consider data fresh for 90 seconds
    cacheTime: 300000, // Keep in cache for 5 minutes
    retry: 1, // Reduce retries
    retryDelay: 2000,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on every mount
    refetchOnReconnect: false
  });

  const statsWithSavings = stats.filter(s => s.saved_bytes > 0);
  const totalSaved = statsWithSavings.reduce((sum, s) => sum + s.saved_bytes, 0);
  const totalCompressions = statsWithSavings.length;

  const showContent = !isLoading && totalSaved > 0;

  return (
    <div className="h-[60px] max-w-md mx-auto">
      <div className={`relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-3 text-white shadow-lg transition-all duration-500 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="flex items-center justify-between gap-3">
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
      </div>
    </div>
  );
}