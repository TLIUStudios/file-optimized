import { Image, Film, Music, ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import SEOHead from "../components/SEOHead";

const imageFormats = [
  {
    name: "JPEG",
    ext: ".jpg, .jpeg",
    description: "Best for photographs and complex images with many colors and gradients.",
    pros: ["Universal compatibility", "Excellent for photos", "Adjustable quality"],
    cons: ["Lossy compression", "No transparency", "Artifacts at low quality"],
    useFor: "Photos, web images, social media"
  },
  {
    name: "PNG",
    ext: ".png",
    description: "Ideal for graphics, logos, and images requiring transparency.",
    pros: ["Lossless compression", "Full transparency", "Sharp edges"],
    cons: ["Larger file sizes", "Not ideal for photos"],
    useFor: "Logos, icons, screenshots, graphics"
  },
  {
    name: "WebP",
    ext: ".webp",
    description: "Modern format offering 25-35% smaller files than JPEG with excellent quality.",
    pros: ["Great compression", "Supports transparency", "Supports animation"],
    cons: ["Limited legacy support"],
    useFor: "Web images, modern websites"
  },
  {
    name: "AVIF",
    ext: ".avif",
    description: "Next-generation format with up to 50% better compression than JPEG.",
    pros: ["Best compression", "HDR support", "Excellent quality"],
    cons: ["Slower encoding", "Growing browser support"],
    useFor: "Maximum compression needs"
  },
  {
    name: "GIF",
    ext: ".gif",
    description: "Classic format for simple animations and graphics with limited colors.",
    pros: ["Animation support", "Universal support", "Simple graphics"],
    cons: ["256 color limit", "Large file sizes"],
    useFor: "Animated images, memes, simple graphics"
  }
];

const videoFormats = [
  {
    name: "MP4",
    ext: ".mp4",
    description: "The universal video format supported everywhere.",
    pros: ["Universal compatibility", "Good compression", "Streaming support"],
    cons: ["Requires encoding"],
    useFor: "Web videos, social media, general use"
  }
];

const audioFormats = [
  {
    name: "MP3",
    ext: ".mp3",
    description: "The most popular compressed audio format.",
    pros: ["Universal support", "Small file sizes", "Adjustable quality"],
    cons: ["Lossy compression"],
    useFor: "Music, podcasts, web audio"
  },
  {
    name: "WAV",
    ext: ".wav",
    description: "Uncompressed audio format with perfect quality.",
    pros: ["Lossless quality", "No compression artifacts"],
    cons: ["Large file sizes"],
    useFor: "Professional audio, editing, archiving"
  }
];

function FormatCard({ format }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{format.name}</h3>
        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-600 dark:text-slate-400">
          {format.ext}
        </span>
      </div>
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{format.description}</p>
      
      <div className="space-y-3 mb-4">
        <div>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">PROS</p>
          <ul className="space-y-1">
            {format.pros.map((pro, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Check className="w-3 h-3 text-emerald-500" />
                {pro}
              </li>
            ))}
          </ul>
        </div>
        {format.cons && format.cons.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">CONS</p>
            <ul className="space-y-1">
              {format.cons.map((con, i) => (
                <li key={i} className="text-sm text-slate-500 dark:text-slate-500">• {con}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          <strong>Best for:</strong> {format.useFor}
        </p>
      </div>
    </div>
  );
}

export default function Formats() {
  return (
    <>
      <SEOHead 
        title="Supported File Formats - File Optimized"
        description="Complete guide to all file formats supported by File Optimized. Learn about JPEG, PNG, WebP, AVIF, GIF, MP4, MP3, and WAV formats and when to use each."
      />
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Supported File Formats
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Comprehensive guide to every format we support and when to use each one.
          </p>
        </div>

        {/* Image Formats */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-950 rounded-lg flex items-center justify-center">
              <Image className="w-5 h-5 text-pink-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Image Formats</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {imageFormats.map(format => (
              <FormatCard key={format.name} format={format} />
            ))}
          </div>
        </section>

        {/* Video Formats */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center">
              <Film className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Video Formats</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoFormats.map(format => (
              <FormatCard key={format.name} format={format} />
            ))}
          </div>
        </section>

        {/* Audio Formats */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Audio Formats</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audioFormats.map(format => (
              <FormatCard key={format.name} format={format} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-8 border border-emerald-200 dark:border-emerald-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Ready to Convert Your Files?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Convert between any supported format instantly. No signup required.
          </p>
          <Link 
            to={createPageUrl('Home')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
          >
            Start Converting
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}