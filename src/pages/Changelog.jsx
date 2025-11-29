import { Clock, Sparkles, Bug, Zap, Shield } from "lucide-react";
import SEOHead from "../components/SEOHead";

const releases = [
  {
    version: "2.0.0",
    date: "November 2025",
    title: "Major Update - Video & Audio Support",
    type: "major",
    changes: [
      { type: "feature", text: "Added MP4 video compression with H.264 encoding" },
      { type: "feature", text: "Added MP3 and WAV audio compression" },
      { type: "feature", text: "New video editor with trimming and captions" },
      { type: "feature", text: "AI-powered automatic caption generation" },
      { type: "feature", text: "GIF to MP4 and MP4 to GIF conversion" },
      { type: "improvement", text: "Improved batch processing performance" },
      { type: "improvement", text: "New modern UI design" }
    ]
  },
  {
    version: "1.5.0",
    date: "October 2025",
    title: "AVIF Support & AI Upscaling",
    type: "minor",
    changes: [
      { type: "feature", text: "Added AVIF format support" },
      { type: "feature", text: "AI-powered image upscaling up to 4x" },
      { type: "feature", text: "New image comparison tool" },
      { type: "improvement", text: "Better PNG compression using advanced library" },
      { type: "fix", text: "Fixed GIF frame timing issues" }
    ]
  },
  {
    version: "1.0.0",
    date: "September 2025",
    title: "Initial Release",
    type: "major",
    changes: [
      { type: "feature", text: "JPEG, PNG, WebP image compression" },
      { type: "feature", text: "Animated GIF optimization" },
      { type: "feature", text: "Batch processing up to 10 files" },
      { type: "feature", text: "Format conversion between image types" },
      { type: "feature", text: "100% client-side processing for privacy" },
      { type: "feature", text: "Pro plan with extended limits" }
    ]
  }
];

const typeIcons = {
  feature: { icon: Sparkles, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950" },
  improvement: { icon: Zap, color: "text-blue-600 bg-blue-100 dark:bg-blue-950" },
  fix: { icon: Bug, color: "text-amber-600 bg-amber-100 dark:bg-amber-950" },
  security: { icon: Shield, color: "text-red-600 bg-red-100 dark:bg-red-950" }
};

export default function Changelog() {
  return (
    <>
      <SEOHead 
        title="Changelog - File Optimized | Version History"
        description="See what's new in File Optimized. Track all updates, new features, improvements, and bug fixes across all versions."
      />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Changelog
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Track all updates and improvements to File Optimized
          </p>
        </div>

        <div className="space-y-8">
          {releases.map((release, index) => (
            <div key={release.version} className="relative">
              {index < releases.length - 1 && (
                <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800" />
              )}
              
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    release.type === 'major' ? 'bg-emerald-100 dark:bg-emerald-950' : 'bg-blue-100 dark:bg-blue-950'
                  }`}>
                    <span className={`font-bold ${
                      release.type === 'major' ? 'text-emerald-600' : 'text-blue-600'
                    }`}>
                      {release.version.split('.')[0]}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        v{release.version}
                      </h2>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full">
                        {release.date}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">{release.title}</p>
                  </div>
                </div>

                <ul className="space-y-2">
                  {release.changes.map((change, i) => {
                    const { icon: Icon, color } = typeIcons[change.type];
                    return (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${color}`}>
                          <Icon className="w-3 h-3" />
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{change.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}