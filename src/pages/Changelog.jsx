import { Calendar, Sparkles, Bug, Wrench, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SEOHead from "../components/SEOHead";

const changelog = [
  {
    version: "0.0.3",
    date: "December 6, 2025",
    type: "fix",
    changes: [
      "Fixed video-to-GIF conversion getting stuck at 60%",
      "Fixed time estimation - now only decreases, never increases",
      "Added timeout protection for GIF encoding (120s limit)",
      "Improved progress tracking for video-to-GIF conversion"
    ]
  },
  {
    version: "0.0.2",
    date: "December 6, 2025",
    type: "improvement",
    changes: [
      "Increased chat support button size for better visibility",
      "Enhanced chat widget appearance and accessibility"
    ]
  },
  {
    version: "0.0.1",
    date: "December 6, 2025",
    type: "feature",
    changes: [
      "Initial release of File Optimized",
      "Image compression (JPG, PNG, WebP, AVIF)",
      "Video optimization (MP4)",
      "Audio compression (MP3, WAV)",
      "GIF optimization and conversion",
      "AI-powered image upscaling",
      "Animation creator from static images",
      "Format conversion between all supported types",
      "Real-time compression statistics",
      "100% client-side processing for privacy",
      "Fully responsive mobile design",
      "Dark mode support",
      "Batch processing (9 files for Free, 30 for Pro)",
      "Pro plan with larger file limits (500MB)",
      "Advanced compression settings and presets",
      "Visual themes (Snow, Fireworks, Halloween, Hearts, Sakura, Autumn, Confetti, Bubbles)",
      "AI-powered SEO metadata generation",
      "Social media sharing integration",
      "Video/Audio/GIF editors",
      "Performance benchmarks",
      "Blog with 25+ SEO-optimized articles",
      "Glossary and tool comparisons"
    ]
  }
];

const typeConfig = {
  feature: { icon: Sparkles, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400", label: "New Features" },
  improvement: { icon: Wrench, color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400", label: "Improvements" },
  fix: { icon: Bug, color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400", label: "Bug Fixes" }
};

export default function Changelog() {
  return (
    <>
      <SEOHead 
        title="Changelog - File Optimized | What's New"
        description="See the latest updates, new features, and improvements to File Optimized. We're constantly improving our compression tool."
      />
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Changelog
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            What's new in File Optimized
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
          
          <div className="space-y-8">
            {changelog.map((release, i) => {
              const config = typeConfig[release.type];
              const Icon = config.icon;
              
              return (
                <div key={i} className="relative pl-20">
                  <div className="absolute left-4 w-8 h-8 bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-full flex items-center justify-center">
                    <Icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        v{release.version}
                      </h2>
                      <Badge className={config.color}>
                        {config.label}
                      </Badge>
                      <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        {release.date}
                      </span>
                    </div>
                    
                    <ul className="space-y-2">
                      {release.changes.map((change, j) => (
                        <li key={j} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                          <span className="text-emerald-500 mt-1">•</span>
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
          <p>Want a feature? <a href="https://support.tliu.co/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Submit a request</a> or <a href="https://discord.gg/gRJesCUYz9" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">join our Discord</a>!</p>
        </div>
      </div>
    </>
  );
}