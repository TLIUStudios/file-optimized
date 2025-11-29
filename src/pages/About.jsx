import { Shield, Zap, Lock, Globe, Users, Award, Heart, Code } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import SEOHead from "../components/SEOHead";

export default function About() {
  return (
    <>
      <SEOHead 
        title="About File Optimized - Our Mission & Story"
        description="Learn about File Optimized, the privacy-first media compression tool. Discover our mission to make file optimization accessible, fast, and secure for everyone."
      />
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            About File Optimized
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            We're on a mission to make media optimization accessible, fast, and completely private for everyone.
          </p>
        </div>

        {/* Our Story */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <Heart className="w-6 h-6 text-emerald-600" />
            Our Story
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-4">
              File Optimized was born from a simple frustration: why should compressing an image or video require uploading sensitive files to unknown servers? We believed there had to be a better way.
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-4">
              Founded in 2025 by TLIU Studios, we set out to build a media optimization tool that prioritizes user privacy above all else. By leveraging modern browser technologies, we've created a platform where your files never leave your device during processing.
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              Today, File Optimized serves thousands of users worldwide—from photographers optimizing their portfolios to developers reducing asset sizes for faster websites.
            </p>
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
            <Award className="w-6 h-6 text-emerald-600" />
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Privacy First</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Your files are processed entirely in your browser. We never upload, store, or have access to your media files. What happens on your device, stays on your device.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Speed & Efficiency</h3>
              <p className="text-slate-600 dark:text-slate-400">
                No upload wait times. No server queues. Processing starts instantly because everything runs locally on your machine using cutting-edge web technologies.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Accessibility</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Professional-grade optimization tools should be available to everyone. Our free tier provides powerful features, with Pro unlocking even more capabilities.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Continuous Innovation</h3>
              <p className="text-slate-600 dark:text-slate-400">
                We're constantly improving our algorithms and adding new features. From AI-powered upscaling to advanced format conversions, we push the boundaries of what's possible in-browser.
              </p>
            </div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
            <Shield className="w-6 h-6 text-emerald-600" />
            What We Offer
          </h2>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-8 border border-emerald-200 dark:border-emerald-800">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Image Optimization</h3>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                  <li>• JPEG, PNG, WebP, AVIF compression</li>
                  <li>• GIF optimization</li>
                  <li>• Format conversion</li>
                  <li>• AI-powered upscaling</li>
                  <li>• Batch processing</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Video Processing</h3>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                  <li>• MP4 compression</li>
                  <li>• Video trimming & editing</li>
                  <li>• Auto-generated captions</li>
                  <li>• Quality adjustments</li>
                  <li>• Filter effects</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Audio Tools</h3>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                  <li>• MP3 & WAV support</li>
                  <li>• Audio compression</li>
                  <li>• Trimming & editing</li>
                  <li>• Volume normalization</li>
                  <li>• Fade effects</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <Users className="w-6 h-6 text-emerald-600" />
            The Team
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
            File Optimized is developed and maintained by <a href="https://www.tliu.co/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 font-medium">TLIU Studios</a>, a creative technology studio focused on building tools that empower creators and professionals.
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            We're a small but passionate team dedicated to making the web faster and more efficient, one optimized file at a time.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Ready to Optimize Your Files?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Start compressing your images, videos, and audio files for free. No account required.
          </p>
          <Link 
            to={createPageUrl('Home')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Zap className="w-5 h-5" />
            Start Optimizing Now
          </Link>
        </section>
      </div>
    </>
  );
}