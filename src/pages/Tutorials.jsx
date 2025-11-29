import { Play, Image, Film, Music, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import SEOHead from "../components/SEOHead";

const tutorials = [
  {
    icon: Image,
    title: "How to Compress Images",
    duration: "2 min",
    steps: [
      "Drag and drop your images onto the upload zone",
      "Adjust the quality slider (70-85% recommended)",
      "Select output format (WebP for best compression)",
      "Click 'Optimize Asset' to process",
      "Download your compressed image"
    ],
    tips: [
      "WebP format offers 25-35% better compression than JPEG",
      "Use 'Compare' to check quality before downloading",
      "Batch process up to 10 files at once (30 for Pro)"
    ]
  },
  {
    icon: Film,
    title: "How to Compress Videos",
    duration: "3 min",
    steps: [
      "Upload your MP4 video file",
      "Choose video quality preset",
      "Adjust bitrate if needed (lower = smaller file)",
      "Optionally trim the video using the editor",
      "Process and download your optimized video"
    ],
    tips: [
      "1080p at 5-8 Mbps is ideal for web sharing",
      "Use the video editor to trim unnecessary footage",
      "Convert to GIF for short loops (under 10 seconds)"
    ]
  },
  {
    icon: Music,
    title: "How to Compress Audio",
    duration: "2 min",
    steps: [
      "Upload your MP3 or WAV file",
      "Select output format and bitrate",
      "Use the audio editor to trim if needed",
      "Process your audio file",
      "Download the compressed result"
    ],
    tips: [
      "128 kbps is good for podcasts",
      "256 kbps recommended for music",
      "Convert WAV to MP3 for 90%+ size reduction"
    ]
  },
  {
    icon: Zap,
    title: "How to Upscale Images",
    duration: "2 min",
    steps: [
      "Upload the image you want to enlarge",
      "Open 'Upscale Settings'",
      "Enable upscaling and choose multiplier (2x, 4x, etc.)",
      "Or select a resolution preset (720p, 1080p, 4K)",
      "Process to generate your high-resolution image"
    ],
    tips: [
      "AI upscaling works best on photos",
      "Start with 2x for best quality",
      "Check 'Standard Resolutions' for exact dimensions"
    ]
  }
];

export default function Tutorials() {
  return (
    <>
      <SEOHead 
        title="Tutorials - File Optimized | Step-by-Step Guides"
        description="Learn how to compress images, videos, and audio files with our easy step-by-step tutorials. Master file optimization in minutes."
      />
      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Play className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Quick Start Tutorials
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Learn how to optimize your files in just a few minutes
          </p>
        </div>

        {/* Tutorials */}
        <div className="space-y-8 mb-12">
          {tutorials.map((tutorial, index) => (
            <div key={index} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 rounded-xl flex items-center justify-center">
                    <tutorial.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{tutorial.title}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{tutorial.duration} read</p>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
                <div className="p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Steps</h3>
                  <ol className="space-y-3">
                    {tutorial.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center text-xs font-bold text-emerald-600 flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Pro Tips</h3>
                  <ul className="space-y-3">
                    {tutorial.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="text-emerald-500">💡</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Try It Yourself?</h2>
          <p className="text-emerald-100 mb-6">Start optimizing your files now—no signup required.</p>
          <Link 
            to={createPageUrl('Home')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
          >
            Start Optimizing
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}