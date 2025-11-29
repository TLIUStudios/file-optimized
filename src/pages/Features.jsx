import { Image, Film, Music, Zap, Shield, Wand2, Layers, FileType, Download, Scissors, Type, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import SEOHead from "../components/SEOHead";

const features = [
  {
    icon: Image,
    title: "Image Compression",
    description: "Reduce image file sizes by up to 90% while maintaining visual quality. Support for JPEG, PNG, WebP, AVIF, and GIF formats.",
    details: ["Smart quality optimization", "Batch processing", "Format conversion", "Metadata removal"]
  },
  {
    icon: Film,
    title: "Video Compression",
    description: "Compress MP4 videos to smaller sizes perfect for web, social media, and email sharing.",
    details: ["H.264 encoding", "Quality presets", "Resolution adjustment", "Fast processing"]
  },
  {
    icon: Music,
    title: "Audio Compression",
    description: "Optimize MP3 and WAV files for podcasts, music, and web audio with adjustable quality settings.",
    details: ["Bitrate control", "Format conversion", "Volume normalization", "Trimming tools"]
  },
  {
    icon: Wand2,
    title: "AI Upscaling",
    description: "Enhance image resolution using AI technology. Upscale photos up to 4x their original size while maintaining sharpness.",
    details: ["2x and 4x upscaling", "Smart detail enhancement", "Photo restoration", "Print-ready output"]
  },
  {
    icon: FileType,
    title: "Format Conversion",
    description: "Convert between any supported format instantly. Transform JPEG to WebP, PNG to AVIF, WAV to MP3, and more.",
    details: ["Cross-format conversion", "Batch conversion", "Quality preservation", "Modern format support"]
  },
  {
    icon: Scissors,
    title: "Video Editor",
    description: "Trim, cut, and edit videos directly in your browser. Add captions, adjust colors, and apply effects.",
    details: ["Trim and cut", "Auto captions (AI)", "Color adjustments", "Fade effects"]
  },
  {
    icon: Layers,
    title: "Batch Processing",
    description: "Process multiple files simultaneously. Upload up to 30 files at once and download as a ZIP archive.",
    details: ["Multi-file upload", "Parallel processing", "ZIP download", "Consistent settings"]
  },
  {
    icon: Shield,
    title: "100% Private",
    description: "All processing happens in your browser. Your files never leave your device or touch our servers.",
    details: ["Client-side processing", "No file uploads", "Works offline", "HTTPS encryption"]
  }
];

export default function Features() {
  return (
    <>
      <SEOHead 
        title="Features - File Optimized | Image, Video & Audio Tools"
        description="Explore all features of File Optimized: image compression, video editing, audio optimization, AI upscaling, format conversion, and more. 100% private browser-based processing."
      />
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Powerful Features
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to optimize your media files, all in one place.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                    {feature.description}
                  </p>
                  <ul className="grid grid-cols-2 gap-2">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-16">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Supported Formats</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Input Formats</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Output Formats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">Images</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">JPEG, PNG, WebP, AVIF, GIF, BMP</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">JPEG, PNG, WebP, AVIF, GIF</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">Videos</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">MP4</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">MP4</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">Audio</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">MP3, WAV</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">MP3, WAV</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Try These Features?
          </h2>
          <p className="text-emerald-100 mb-6 max-w-xl mx-auto">
            Start optimizing your files for free. No signup required.
          </p>
          <Link 
            to={createPageUrl('Home')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <Zap className="w-5 h-5" />
            Start Optimizing
          </Link>
        </div>
      </div>
    </>
  );
}