import { Calendar, Sparkles, Bug, Wrench, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SEOHead from "../components/SEOHead";

const changelog = [
  {
    version: "2.5.0",
    date: "November 2024",
    type: "feature",
    changes: [
      "Added AVIF format support with aggressive compression",
      "New visual themes: Snow, Fireworks, Halloween, Hearts, Sakura, Autumn, Confetti, Bubbles",
      "Performance page with real benchmarks",
      "Glossary of compression terms",
      "Tool comparison page",
      "25+ built-in SEO-optimized blog articles"
    ]
  },
  {
    version: "2.4.0",
    date: "November 2024",
    type: "feature",
    changes: [
      "Video editor with caption overlay support",
      "Audio editor with trim and fade effects",
      "GIF editor for frame manipulation",
      "Social media sharing integration",
      "AI-powered SEO metadata generation"
    ]
  },
  {
    version: "2.3.0",
    date: "October 2024",
    type: "feature",
    changes: [
      "Pro Plan with Stripe integration",
      "500MB file size limit for Pro users",
      "Batch processing up to 30 files",
      "Ad-free experience for Pro",
      "Billing history and subscription management"
    ]
  },
  {
    version: "2.2.0",
    date: "October 2024",
    type: "improvement",
    changes: [
      "Improved PNG compression using browser-image-compression",
      "Better GIF optimization preserving all frames",
      "Enhanced video processing with WebCodecs API",
      "Mobile-responsive design improvements",
      "Dark mode enhancements"
    ]
  },
  {
    version: "2.1.0",
    date: "September 2024",
    type: "feature",
    changes: [
      "Image upscaling with resolution presets",
      "Animation generation from static images",
      "Format conversion between all supported types",
      "Drag-and-drop file reordering",
      "Bulk download as ZIP"
    ]
  },
  {
    version: "2.0.0",
    date: "September 2024",
    type: "feature",
    changes: [
      "Complete UI redesign with modern look",
      "Video compression support (MP4)",
      "Audio compression support (MP3, WAV)",
      "GIF optimization and conversion",
      "Real-time compression preview",
      "Side-by-side comparison tool"
    ]
  },
  {
    version: "1.5.0",
    date: "August 2024",
    type: "improvement",
    changes: [
      "WebP format support",
      "Quality slider with live preview",
      "Metadata stripping option",
      "Noise reduction filter",
      "Improved compression algorithms"
    ]
  },
  {
    version: "1.0.0",
    date: "July 2024",
    type: "feature",
    changes: [
      "Initial release",
      "JPEG and PNG compression",
      "Client-side processing for privacy",
      "Basic image resizing",
      "Download optimized files"
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
        <div className="mt-12 text-center text-slate-500 dark:text-slate-400">
          <p>Want a feature? <a href="https://discord.gg/gRJesCUYz9" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Join our Discord</a> and let us know!</p>
        </div>
      </div>
    </>
  );
}