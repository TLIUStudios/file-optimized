import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { TrendingDown, Calendar, Clock, Database } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return bytes.toFixed(0) + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

const calculateStats = (stats, hours) => {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const filtered = stats.filter(s => new Date(s.created_date) > cutoff);
  return filtered.reduce((sum, s) => sum + s.saved_bytes, 0);
};

export default function CompressionStats({ userEmail }) {
  const { data: stats = [], isLoading } = useQuery({
    queryKey: ['compressionStats', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return await base44.entities.CompressionStat.filter({ created_by: userEmail }, '-created_date', 1000);
    },
    enabled: !!userEmail
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </Card>
    );
  }

  const allTime = stats.reduce((sum, s) => sum + s.saved_bytes, 0);
  const last24h = calculateStats(stats, 24);
  const last7d = calculateStats(stats, 24 * 7);
  const last30d = calculateStats(stats, 24 * 30);
  const last365d = calculateStats(stats, 24 * 365);

  const periods = [
    { label: '24 Hours', value: last24h, icon: Clock },
    { label: '7 Days', value: last7d, icon: Calendar },
    { label: '30 Days', value: last30d, icon: Calendar },
    { label: '1 Year', value: last365d, icon: Calendar },
    { label: 'All Time', value: allTime, icon: Database }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950 rounded-lg flex items-center justify-center">
          <TrendingDown className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Your Compression Stats</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total space saved over time</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {periods.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
          >
            <Icon className="w-4 h-4 text-slate-400 mb-1" />
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{label}</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatBytes(value)}
            </div>
          </div>
        ))}
      </div>

      {stats.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Total compressions:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{stats.length}</span>
          </div>
        </div>
      )}
    </Card>
  );
}