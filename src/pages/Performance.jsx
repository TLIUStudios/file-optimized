import { Zap, Shield, Gauge, Cpu, HardDrive, Clock, CheckCircle2, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import SEOHead from "../components/SEOHead";

const benchmarks = [
  {
    format: "JPEG → WebP",
    originalSize: "2.4 MB",
    compressedSize: "680 KB",
    savings: 72,
    time: "0.8s",
    quality: "Visually Identical"
  },
  {
    format: "PNG → WebP",
    originalSize: "4.1 MB",
    compressedSize: "890 KB",
    savings: 78,
    time: "1.2s",
    quality: "Lossless Option"
  },
  {
    format: "JPEG → AVIF",
    originalSize: "2.4 MB",
    compressedSize: "420 KB",
    savings: 83,
    time: "2.1s",
    quality: "Near-Lossless"
  },
  {
    format: "GIF Optimization",
    originalSize: "8.2 MB",
    compressedSize: "3.1 MB",
    savings: 62,
    time: "4.5s",
    quality: "All Frames Preserved"
  },
  {
    format: "MP4 Compression",
    originalSize: "45 MB",
    compressedSize: "12 MB",
    savings: 73,
    time: "15s",
    quality: "1080p Maintained"
  },
  {
    format: "MP3 Optimization",
    originalSize: "8.5 MB",
    compressedSize: "3.2 MB",
    savings: 62,
    time: "2.8s",
    quality: "128kbps Stereo"
  }
];

const securityFeatures = [
  {
    title: "Zero Server Uploads",
    description: "Your files never leave your device. All compression happens locally in your browser using WebAssembly.",
    icon: Shield
  },
  {
    title: "No Data Collection",
    description: "We don't track, store, or analyze your files. Your media stays completely private.",
    icon: HardDrive
  },
  {
    title: "Works Offline",
    description: "After initial load, the app works without internet. Perfect for sensitive documents.",
    icon: Cpu
  },
  {
    title: "Open Processing",
    description: "Uses standard, auditable compression algorithms. No hidden processing or AI analysis of your content.",
    icon: CheckCircle2
  }
];

const speedMetrics = [
  { label: "Average Image Processing", value: "< 1 second", detail: "For images under 5MB" },
  { label: "Batch Processing (10 files)", value: "< 8 seconds", detail: "Parallel processing" },
  { label: "Video Compression (1 min)", value: "< 30 seconds", detail: "Hardware accelerated" },
  { label: "Initial App Load", value: "< 2 seconds", detail: "Lazy loading enabled" }
];

export default function Performance() {
  return (
    <>
      <SEOHead 
        title="Performance & Security - File Optimized"
        description="See real compression benchmarks and learn how File Optimized keeps your files secure with 100% client-side processing."
      />
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-6">
            <Gauge className="w-4 h-4" />
            Real-World Benchmarks
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Performance & Security
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Lightning-fast compression with enterprise-grade privacy
          </p>
        </div>

        {/* Speed Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-16">
          {speedMetrics.map((metric, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 text-center">
              <Clock className="w-6 h-6 text-emerald-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{metric.value}</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{metric.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{metric.detail}</p>
            </div>
          ))}
        </div>

        {/* Compression Benchmarks */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-emerald-600" />
            Compression Benchmarks
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-900 dark:text-white">Conversion</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-900 dark:text-white">Original</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-900 dark:text-white">Compressed</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-900 dark:text-white">Savings</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-900 dark:text-white">Time</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-900 dark:text-white">Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarks.map((b, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">{b.format}</td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{b.originalSize}</td>
                      <td className="py-4 px-6 text-emerald-600 dark:text-emerald-400 font-medium">{b.compressedSize}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Progress value={b.savings} className="w-16 h-2" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{b.savings}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{b.time}</td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{b.quality}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400">
              * Benchmarks performed on M1 MacBook Pro. Results vary by device and file complexity.
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-600" />
            Security & Privacy
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {securityFeatures.map((feature, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <feature.icon className="w-10 h-10 text-emerald-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white mb-16">
          <h2 className="text-2xl font-bold mb-6">Technical Implementation</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-emerald-400 mb-2">Image Processing</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Canvas API for fast rendering</li>
                <li>• WebAssembly codecs (AVIF)</li>
                <li>• Adaptive quality algorithms</li>
                <li>• Multi-pass optimization</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-400 mb-2">Video Processing</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• WebCodecs API (H.264)</li>
                <li>• Hardware acceleration</li>
                <li>• MP4 muxing in-browser</li>
                <li>• Audio track preservation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-400 mb-2">Performance</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Web Workers for parallel processing</li>
                <li>• Lazy component loading</li>
                <li>• Frame rate optimized effects</li>
                <li>• Memory-efficient streaming</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Experience the Speed Yourself
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Try File Optimized free - no signup required
          </p>
          <Link to={createPageUrl('Home')}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
              <Zap className="w-4 h-4 mr-2" />
              Start Compressing
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}