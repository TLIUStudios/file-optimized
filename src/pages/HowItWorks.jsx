import { Upload, Cpu, Download, Shield, Zap, Image, Film, Music, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import SEOHead from "../components/SEOHead";

export default function HowItWorks() {
  return (
    <>
      <SEOHead 
        title="How It Works - File Optimized | Compress Images, Videos & Audio"
        description="Learn how File Optimized compresses your images, videos, and audio files. Discover our privacy-first approach with browser-based processing that keeps your files secure."
      />
      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            How File Optimized Works
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Professional media optimization that's fast, secure, and happens entirely in your browser.
          </p>
        </div>

        {/* 3 Step Process */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-12">
            Simple 3-Step Process
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-emerald-600" />
              </div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">1</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Upload Your Files</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Drag and drop or click to select your images, videos, or audio files. Batch upload multiple files at once.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Cpu className="w-10 h-10 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">2</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Automatic Processing</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Your files are instantly optimized using advanced compression algorithms—all within your browser.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Download className="w-10 h-10 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-purple-600 mb-2">3</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Download & Use</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Download your optimized files individually or as a ZIP. Use them anywhere—websites, social media, email.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="mb-20 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/3 flex justify-center">
              <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-xl">
                <Shield className="w-16 h-16 text-emerald-600" />
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Your Privacy is Our Priority
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
                Unlike most online tools, File Optimized processes your files entirely in your browser. Your media never touches our servers—ever.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  No file uploads to external servers
                </li>
                <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  No data collection from your files
                </li>
                <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  Works offline after initial page load
                </li>
                <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  HTTPS encryption for all connections
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Supported Formats */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-12">
            Supported File Types
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-950 rounded-lg flex items-center justify-center mb-4">
                <Image className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Images</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                <li><strong>JPEG/JPG</strong> - Photos, web images</li>
                <li><strong>PNG</strong> - Graphics, screenshots</li>
                <li><strong>WebP</strong> - Modern web format</li>
                <li><strong>AVIF</strong> - Next-gen compression</li>
                <li><strong>GIF</strong> - Animated images</li>
              </ul>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-4">
                Convert between any format instantly
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center mb-4">
                <Film className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Videos</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                <li><strong>MP4</strong> - Universal video format</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-4">
                Features include:
              </p>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-sm">
                <li>• Video compression</li>
                <li>• Trimming & cutting</li>
                <li>• Auto captions (AI)</li>
                <li>• Color adjustments</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 rounded-lg flex items-center justify-center mb-4">
                <Music className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Audio</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                <li><strong>MP3</strong> - Compressed audio</li>
                <li><strong>WAV</strong> - Uncompressed audio</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-4">
                Features include:
              </p>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-sm">
                <li>• Audio compression</li>
                <li>• Trimming</li>
                <li>• Volume adjustment</li>
                <li>• Fade in/out effects</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
            Powered by Modern Technology
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-600" />
                  Browser-Based Processing
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  We use WebAssembly and modern JavaScript APIs to run powerful compression algorithms directly in your browser. This means instant processing with no upload wait times.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-600" />
                  Advanced Algorithms
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Our compression uses industry-leading algorithms including MozJPEG for JPEG, OxiPNG for PNG, and native browser encoders for WebP and AVIF formats.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Image className="w-5 h-5 text-emerald-600" />
                  AI Upscaling
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Enhance image resolution using AI-powered upscaling. Increase image size up to 4x while maintaining sharpness and detail—perfect for printing or large displays.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  Zero Server Storage
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Your files exist only in your browser's memory during processing. Once you close the tab, they're gone. We have no database of user files—because we never receive them.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Is File Optimized really free?</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Yes! Our free plan includes all core features with generous limits. Pro users get higher limits, no ads, and priority processing.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How much can I reduce my file sizes?</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Results vary by file type and content, but typical reductions are 50-80% for images without noticeable quality loss. Videos can often be reduced by 30-60%.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Do you store my files?</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                No. All processing happens in your browser. We never upload, store, or have access to your files. Your data stays on your device.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">What browsers are supported?</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                File Optimized works on all modern browsers including Chrome, Firefox, Safari, and Edge. For best performance, we recommend using the latest version of Chrome or Firefox.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Optimize Your Files?
          </h2>
          <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
            Start compressing your images, videos, and audio files in seconds. No signup required for basic features.
          </p>
          <Link 
            to={createPageUrl('Home')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </>
  );
}