import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Upload, Settings2, Download, Image, Film, Music, Zap, Shield, Globe, CheckCircle2, Link } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
{
  q: "Is File Optimized free to use?",
  a: "Yes! File Optimized is free to use with generous limits. Free users can compress files up to 50MB and batch up to 9 files at once. Upgrade to Pro for 500MB files, 30-file batches, priority speed, no ads, and cloud save features."
},
{
  q: "Are my files safe? Does anyone see them?",
  a: "Absolutely. All processing happens 100% in your browser using client-side technology. Your files never leave your device and are never uploaded to our servers. We have zero visibility into your files."
},
{
  q: "What file formats are supported?",
  a: "We support a wide range of formats. Images: JPEG, PNG, WEBP, AVIF, GIF. Video: MP4. Audio: MP3, WAV. You can also convert between formats - for example, convert JPEG to WEBP or MP3 to WAV."
},
{
  q: "How much compression can I expect?",
  a: "Results vary by file type and content, but images typically see 25-90% file size reduction. WEBP formats offer the best compression for web use. Videos and Audio files can be compressed significantly depending on the resolution and bitrate settings."
},
{
  q: "Can I compress multiple files at once?",
  a: "Yes! Free users can batch up to 9 files at once. Pro users can batch up to 30 files simultaneously with priority processing speed."
},
{
  q: "What is the difference between compression formats?",
  a: "JPEG is lossy and best for photos. PNG is lossless (no quality loss). WEBP offers excellent compression with broad browser support - great for web. AVIF offers the best compression ratios but has slightly lower compatibility. We show you the file size for each format so you can pick the best one that suites your needs."
},
{
  q: "Does compression reduce image quality?",
  a: "It depends on the format and settings. Lossless formats like PNG retain 100% quality. Lossy formats like JPEG and WebP reduce some quality to achieve smaller sizes. We let you set the quality level (1–100) so you have full control over the trade-off."
},
{
  q: "Do I need to create an account?",
  a: "No account is required to use the free features. Creating an account unlocks additional features like saving preferences, tracking your compression stats, and upgrading to Pro."
}];


const steps = [
{
  icon: Upload,
  title: "Upload Your Files",
  desc: "Drag & drop or click to select images, videos, or audio files.",
  color: "from-orange-500 to-amber-600",
  step: "01"
},
{
  icon: Settings2,
  title: "Choose Format & Quality",
  desc: "Pick your file output format and adjust quality settings to balance size vs. quality.",
  color: "from-orange-500 to-amber-600",
  step: "02"
},
{
  icon: Download,
  title: "Download Optimized Files",
  desc: "Download your compressed files individually or as a ZIP.",
  color: "from-orange-500 to-amber-600",
  step: "03"
}];


const formats = [
{ name: "JPEG", ext: "jpg", type: "image", desc: "Best for photos" },
{ name: "PNG", ext: "png", type: "image", desc: "Lossless quality" },
{ name: "WEBP", ext: "webp", type: "image", desc: "Modern web format" },
{ name: "AVIF", ext: "avif", type: "image", desc: "Next-gen compression" },
{ name: "GIF", ext: "gif", type: "image", desc: "Animated images" },
{ name: "MP4", ext: "mp4", type: "video", desc: "Universal video" },
{ name: "MP3", ext: "mp3", type: "audio", desc: "Compressed audio" },
{ name: "WAV", ext: "wav", type: "audio", desc: "Lossless audio" }];


const typeColors = {
  image: "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  video: "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  audio: "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800"
};

const typeIcons = { image: Image, video: Film, audio: Music };

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn(
      "border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all",
      open ? "bg-slate-50 dark:bg-slate-900" : "bg-white dark:bg-slate-950"
    )}>
      <button
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
        onClick={() => setOpen((o) => !o)}>

        <span className="font-medium text-slate-900 dark:text-white text-sm sm:text-base">{q}</span>
        <ChevronDown className={cn("w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-300", open && "rotate-180")} />
      </button>
      {open &&
      <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
          {a}
        </div>
      }
    </div>);

}

export default function HomepageContent() {
  return (
    <div className="mt-16 space-y-20">

      {/* Divider */}
      <div className="relative">
        <div className="absolute left-1/2 -translate-x-1/2 w-screen h-px bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* How It Works */}
      <section className="pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10">

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">How It Works</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">Optimize your files in three simple steps - no account required.

          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-0">
          {steps.map((step, i) =>
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-center">

              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-900 px-2 border border-slate-200 dark:border-slate-800 rounded-full">
                  STEP {step.step}
                </span>
              </div>
              <div className={cn("w-14 h-14 bg-gradient-to-br rounded-xl flex items-center justify-center mb-4 mx-auto shadow-md", step.color)}>
                <step.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 whitespace-nowrap">{step.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* See It In Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto">

        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">See It In Action</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto">Compare original vs. compressed side-by-side with our interactive slider.
You can see size breakdowns for every format available before you download.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69100dedd17537e37249237a/f27d51948_FileOptimized-Example1.png"
            alt="File Optimized - side-by-side image comparison with format size breakdown"
            className="w-full object-cover"
            loading="lazy" />

        </div>
      </motion.div>

      {/* Supported Formats */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10">

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">Supported Formats</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Compress and convert across all major image, video, and audio formats.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {formats.map((fmt, i) => {
            const Icon = typeIcons[fmt.type];
            return (
              <motion.div
                key={fmt.ext}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border",
                  typeColors[fmt.type]
                )}>

                <Icon className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm leading-tight">{fmt.name}</p>
                  <p className="text-xs opacity-70">{fmt.desc}</p>
                </div>
              </motion.div>);

          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-slate-400 dark:text-slate-600 mt-4">

          Convert between any supported format - e.g. JPEG → WEBP, MP3 → WAV, and more.
        </motion.p>
      </section>

      {/* Why Choose Us */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10">

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">Why File Optimized?</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">We built the tool we always wanted - fast, private, and powerful.

          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {[
          { icon: Shield, title: "Zero Data Collection", desc: "Files never leave your browser. No uploads, no servers, no tracking of your content.", color: "text-orange-500" },
          { icon: Zap, title: "Instant Processing", desc: "Client-side compression means results in seconds, not minutes. No upload wait time.", color: "text-orange-500" },
          { icon: CheckCircle2, title: "No Watermarks", desc: "Both Free and Pro plans produce clean output with zero watermarks on your files.", color: "text-orange-500" },
          { icon: Globe, title: "No Software Install", desc: "Works entirely in your browser. No downloads, no plugins, no app installations needed.", color: "text-orange-500" },
          { icon: Image, title: "Side-by-Side Comparison", desc: "Use our interactive comparison slider to see original vs. compressed quality before downloading.", color: "text-orange-500" },
          { icon: Film, title: "Multi-Format Support", desc: "Images, videos, and audio - all in one tool. Convert and compress any format with ease.", color: "text-orange-500" }].
          map((item, i) =>
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">

              <div className={cn("flex-shrink-0 mt-0.5", item.color)}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10">

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">Frequently Asked Questions</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Everything you need to know about File Optimized.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto space-y-3">

          {faqs.map((faq) =>
          <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">

          Still have questions?{" "}
          <a href="https://support.tliu.co/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
            Visit our Support Portal
          </a>
        </motion.p>
      </section>

    </div>);

}