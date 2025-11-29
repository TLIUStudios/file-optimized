import { Check, X, Zap, Shield, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import SEOHead from "../components/SEOHead";

const competitors = [
  {
    name: "File Optimized",
    highlight: true,
    features: {
      browserProcessing: true,
      noUpload: true,
      freeToUse: true,
      batchProcessing: true,
      videoSupport: true,
      audioSupport: true,
      aiUpscaling: true,
      formatConversion: true,
      noWatermark: true,
      offlineCapable: true,
    }
  },
  {
    name: "TinyPNG",
    highlight: false,
    features: {
      browserProcessing: false,
      noUpload: false,
      freeToUse: "Limited",
      batchProcessing: "Limited",
      videoSupport: false,
      audioSupport: false,
      aiUpscaling: false,
      formatConversion: false,
      noWatermark: true,
      offlineCapable: false,
    }
  },
  {
    name: "Squoosh",
    highlight: false,
    features: {
      browserProcessing: true,
      noUpload: true,
      freeToUse: true,
      batchProcessing: false,
      videoSupport: false,
      audioSupport: false,
      aiUpscaling: false,
      formatConversion: true,
      noWatermark: true,
      offlineCapable: true,
    }
  },
  {
    name: "Compressor.io",
    highlight: false,
    features: {
      browserProcessing: false,
      noUpload: false,
      freeToUse: "Limited",
      batchProcessing: "Pro only",
      videoSupport: false,
      audioSupport: false,
      aiUpscaling: false,
      formatConversion: "Limited",
      noWatermark: true,
      offlineCapable: false,
    }
  }
];

const featureLabels = {
  browserProcessing: "Browser-side Processing",
  noUpload: "Files Never Uploaded",
  freeToUse: "Free to Use",
  batchProcessing: "Batch Processing",
  videoSupport: "Video Compression",
  audioSupport: "Audio Compression",
  aiUpscaling: "AI Upscaling",
  formatConversion: "Format Conversion",
  noWatermark: "No Watermark",
  offlineCapable: "Works Offline",
};

export default function Comparisons() {
  return (
    <>
      <SEOHead 
        title="Compare File Optimized vs Competitors | Best Image Compressor"
        description="See how File Optimized compares to TinyPNG, Squoosh, and other compression tools. Compare features, privacy, and capabilities side by side."
      />
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            How We Compare
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            See why File Optimized is the privacy-first choice for media compression
          </p>
        </div>

        {/* Key Differentiators */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
            <Shield className="w-10 h-10 text-emerald-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">100% Private</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Your files never leave your device. All processing happens in your browser, ensuring complete privacy.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <Zap className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">All-in-One Tool</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Compress images, videos, and audio. Convert formats, upscale with AI, and edit—all in one place.
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
            <Globe className="w-10 h-10 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Works Offline</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              After initial load, File Optimized works without internet. Perfect for sensitive files.
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto mb-16">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-900 dark:text-white">Feature</th>
                {competitors.map((comp, i) => (
                  <th 
                    key={i} 
                    className={`text-center py-4 px-4 text-sm font-semibold ${
                      comp.highlight 
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" 
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {comp.name}
                    {comp.highlight && (
                      <span className="block text-xs font-normal text-emerald-600 dark:text-emerald-400">
                        ⭐ Our Tool
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(featureLabels).map(([key, label], index) => (
                <tr 
                  key={key} 
                  className={`border-b border-slate-100 dark:border-slate-800 ${
                    index % 2 === 0 ? "bg-slate-50/50 dark:bg-slate-900/50" : ""
                  }`}
                >
                  <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-300">{label}</td>
                  {competitors.map((comp, i) => {
                    const value = comp.features[key];
                    return (
                      <td 
                        key={i} 
                        className={`text-center py-4 px-4 ${
                          comp.highlight ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""
                        }`}
                      >
                        {value === true ? (
                          <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                        ) : value === false ? (
                          <X className="w-5 h-5 text-slate-300 dark:text-slate-600 mx-auto" />
                        ) : (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">{value}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to try the best compression tool?
          </h2>
          <p className="text-emerald-100 mb-6 max-w-xl mx-auto">
            Start optimizing your files for free. No signup required, no files uploaded.
          </p>
          <Link to={createPageUrl('Home')}>
            <Button className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-8 py-3">
              Start Compressing Free
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}