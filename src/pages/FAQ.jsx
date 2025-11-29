import { useState } from "react";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import SEOHead from "../components/SEOHead";

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "What is File Optimized?",
        a: "File Optimized is a free online tool that compresses images, videos, and audio files directly in your browser. Unlike other services, your files never leave your device - all processing happens locally for maximum privacy and speed."
      },
      {
        q: "Is File Optimized really free?",
        a: "Yes! Our free plan includes all core features with generous limits (50MB per file, 10 files at once). Pro users get higher limits (500MB per file, 30 files), no ads, and priority processing for just $10/month or $100/year."
      },
      {
        q: "Do I need to create an account?",
        a: "No account is required to use File Optimized. You can start compressing files immediately. Creating an account unlocks additional features like saving preferences and accessing Pro features."
      },
      {
        q: "What makes File Optimized different from other compression tools?",
        a: "Privacy is our core difference. Most online tools upload your files to their servers. File Optimized processes everything in your browser - your files never touch our servers. This means faster processing, complete privacy, and it even works offline after the initial page load."
      }
    ]
  },
  {
    category: "File Support",
    questions: [
      {
        q: "What file formats are supported?",
        a: "We support a wide range of formats:\n• Images: JPEG, PNG, WebP, AVIF, GIF\n• Video: MP4\n• Audio: MP3, WAV\nYou can also convert between formats (e.g., PNG to WebP, WAV to MP3)."
      },
      {
        q: "What's the maximum file size I can compress?",
        a: "Free users can compress files up to 50MB each. Pro users enjoy a 500MB limit per file, perfect for larger videos and high-resolution images."
      },
      {
        q: "Can I compress multiple files at once?",
        a: "Yes! Free users can batch process up to 10 files simultaneously. Pro users can process up to 30 files at once. Simply drag and drop multiple files or select them from the file picker."
      },
      {
        q: "Do you support animated GIFs?",
        a: "Yes, we fully support animated GIF compression. Our tool preserves all frames and animations while reducing file size. You can also edit GIFs, adjust frame timing, and add text overlays."
      }
    ]
  },
  {
    category: "Compression & Quality",
    questions: [
      {
        q: "How much can I reduce my file sizes?",
        a: "Results vary depending on the file type and original compression:\n• Images: Typically 50-80% reduction\n• Videos: Usually 30-60% reduction\n• Audio: Generally 40-70% reduction\nOur smart algorithms find the optimal balance between size and quality."
      },
      {
        q: "Will compression reduce the quality of my files?",
        a: "Our algorithms are designed to minimize quality loss while maximizing compression. For most use cases (web, social media, email), the difference is imperceptible. You can also adjust the quality slider to control the compression level."
      },
      {
        q: "Can I adjust the compression level?",
        a: "Yes! Each file card has a quality slider (1-100) that lets you control the trade-off between file size and quality. Lower values = smaller files, higher values = better quality. We recommend 70-85 for most uses."
      },
      {
        q: "What compression algorithms do you use?",
        a: "We use industry-leading algorithms:\n• JPEG: MozJPEG encoder\n• PNG: OxiPNG optimizer\n• WebP/AVIF: Native browser encoders\n• Video: H.264/AVC codec\n• Audio: Web Audio API processing"
      }
    ]
  },
  {
    category: "Privacy & Security",
    questions: [
      {
        q: "Are my files uploaded to your servers?",
        a: "No. All file processing happens entirely in your browser using JavaScript and WebAssembly. Your files never leave your device. We have no ability to see, access, or store your files."
      },
      {
        q: "Is my data safe?",
        a: "Absolutely. Since processing is local, your files remain completely private. We use HTTPS encryption for all connections, and any account data is securely stored with industry-standard encryption."
      },
      {
        q: "Can I use File Optimized offline?",
        a: "Yes! After the initial page load, File Optimized can work offline. The compression algorithms run entirely in your browser, so you don't need an internet connection to process files."
      },
      {
        q: "Do you collect any data from my files?",
        a: "No. We cannot and do not collect any data from your files. We only collect anonymous usage statistics (page views, feature usage) to improve the service, and this can be disabled."
      }
    ]
  },
  {
    category: "Features",
    questions: [
      {
        q: "Can I convert files to different formats?",
        a: "Yes! You can convert between any supported format:\n• Images: JPEG ↔ PNG ↔ WebP ↔ AVIF\n• Audio: WAV ↔ MP3\nJust select the output format in the file card settings."
      },
      {
        q: "What is AI Upscaling?",
        a: "AI Upscaling uses machine learning to increase image resolution while maintaining sharpness. You can upscale images up to 4x their original size - perfect for printing low-resolution photos or enlarging graphics."
      },
      {
        q: "Can I edit videos?",
        a: "Yes! Our video editor includes:\n• Trimming and cutting\n• Brightness, contrast, saturation adjustments\n• Auto-generated captions (AI-powered)\n• Fade in/out effects\n• And more!"
      },
      {
        q: "What's the Compare feature?",
        a: "After compressing a file, click 'Compare' to see a side-by-side comparison of the original and compressed versions. You can use a slider to examine quality differences and see exactly how much space you saved."
      }
    ]
  },
  {
    category: "Pro Plan",
    questions: [
      {
        q: "What do I get with Pro?",
        a: "Pro includes:\n• 500MB file size limit (vs 50MB free)\n• 30 files batch upload (vs 10 free)\n• No advertisements\n• Priority processing\n• Visual themes customization\n• Support the development"
      },
      {
        q: "How much does Pro cost?",
        a: "Pro is $10/month or $100/year (save $20 with annual). You can cancel anytime, and your Pro features remain active until the end of your billing period."
      },
      {
        q: "Can I cancel my Pro subscription?",
        a: "Yes, you can cancel anytime from your Profile page. After cancellation, you'll retain Pro access until the end of your current billing period, then revert to the free plan."
      },
      {
        q: "Is there a free trial?",
        a: "We don't offer a trial because our free plan is already fully functional! Try all the core features for free, then upgrade to Pro if you need higher limits or want to support development."
      }
    ]
  },
  {
    category: "Troubleshooting",
    questions: [
      {
        q: "Why is processing slow on my device?",
        a: "Processing speed depends on your device's CPU power and the file size. Large videos or high-resolution images take longer. Try closing other browser tabs or using a more powerful device for best results."
      },
      {
        q: "My file isn't compressing much. Why?",
        a: "Some files are already highly optimized and can't be compressed further. This is common with:\n• Previously compressed JPEGs\n• Optimized PNGs\n• Already-compressed videos\nTry converting to a more efficient format like WebP."
      },
      {
        q: "The page isn't loading properly. What should I do?",
        a: "Try these steps:\n1. Refresh the page (Ctrl/Cmd + R)\n2. Clear your browser cache\n3. Try a different browser (Chrome/Firefox recommended)\n4. Disable browser extensions that might interfere"
      },
      {
        q: "How do I report a bug or request a feature?",
        a: "Visit our support portal at support.tliu.co to submit bug reports or feature requests. You can also join our Discord community for real-time help and discussions."
      }
    ]
  }
];

function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="border-b border-slate-200 dark:border-slate-800 last:border-0">
      <button
        onClick={onToggle}
        className="w-full py-4 flex items-start justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 px-4 -mx-4 transition-colors"
      >
        <span className="font-medium text-slate-900 dark:text-white pr-4">{question}</span>
        <ChevronDown className={cn(
          "w-5 h-5 text-slate-500 flex-shrink-0 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>
      {isOpen && (
        <div className="pb-4 px-4 -mx-4">
          <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [openItems, setOpenItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const toggleItem = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      (activeCategory === "all" || category.category === activeCategory) &&
      (searchQuery === "" || 
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(category => category.questions.length > 0);

  const categories = ["all", ...faqs.map(f => f.category)];

  return (
    <>
      <SEOHead 
        title="FAQ - File Optimized | Frequently Asked Questions"
        description="Find answers to common questions about File Optimized. Learn about file compression, supported formats, privacy features, Pro plans, and troubleshooting tips."
      />
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to know about File Optimized
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                activeCategory === cat
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-8">
          {filteredFaqs.map((category, categoryIndex) => (
            <div key={category.category} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-white">{category.category}</h2>
              </div>
              <div className="px-6">
                {category.questions.map((item, questionIndex) => (
                  <FAQItem
                    key={questionIndex}
                    question={item.q}
                    answer={item.a}
                    isOpen={openItems[`${categoryIndex}-${questionIndex}`]}
                    onToggle={() => toggleItem(categoryIndex, questionIndex)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No questions found matching your search.</p>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-12 text-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-8 border border-emerald-200 dark:border-emerald-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Still have questions?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Can't find what you're looking for? We're here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="https://support.tliu.co/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
            >
              Contact Support
            </a>
            <a 
              href="https://discord.gg/gRJesCUYz9" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Join Discord
            </a>
          </div>
        </div>
      </div>
    </>
  );
}