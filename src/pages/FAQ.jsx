import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import SEOHead from "../components/SEOHead";

// Comprehensive FAQ database
const defaultFaqs = [
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
      },
      {
        q: "Why does my compressed file look different?",
        a: "Lossy compression removes some data to achieve smaller file sizes. At quality settings below 70%, you may notice artifacts especially around sharp edges. Try increasing the quality slider (75-85% is usually optimal) or use lossless formats like PNG for critical images."
      },
      {
        q: "Can I recover my original file after compression?",
        a: "No, compression is a one-way process. File Optimized processes files locally without storing anything, so always keep your original files backed up before compressing if you need them."
      },
      {
        q: "Why is the output file larger than the original?",
        a: "This can happen when:\n• Converting to a less efficient format (e.g., JPEG to PNG)\n• The original was already heavily optimized\n• Quality setting is higher than the original\n• Adding transparency to non-transparent images\nTry a different format or lower quality setting."
      }
    ]
  },
  {
    category: "Formats & Conversion",
    questions: [
      {
        q: "What's the difference between lossy and lossless compression?",
        a: "Lossy compression (JPEG, MP3) permanently removes some data to achieve smaller files - the original cannot be perfectly reconstructed. Lossless compression (PNG, FLAC) preserves all original data but achieves smaller size reductions. Choose based on whether quality or file size is your priority."
      },
      {
        q: "When should I use WebP vs JPEG?",
        a: "Use WebP when:\n• Your audience uses modern browsers\n• You want 25-35% smaller files than JPEG\n• You need both photos and transparency\n\nUse JPEG when:\n• Maximum compatibility is needed\n• Editing software requires it\n• Sharing via email or older platforms"
      },
      {
        q: "What is AVIF and should I use it?",
        a: "AVIF is a next-generation image format offering 50% better compression than JPEG. It supports HDR, wide color gamut, and transparency. Use it for maximum compression when your audience has modern browsers (Chrome, Firefox, Safari 16+). Provide WebP or JPEG fallbacks for older browsers."
      },
      {
        q: "Can I convert GIFs to video?",
        a: "Yes! Converting GIF to MP4 typically reduces file size by 80-90% while maintaining quality. Use this for longer animations or when embedding in websites. MP4 videos also play more smoothly than GIFs."
      },
      {
        q: "What quality setting should I use?",
        a: "For most purposes:\n• 75-85%: Best balance of size and quality for web\n• 85-95%: High quality for portfolios/professional work\n• Below 70%: Only when file size is critical\n\nAlways use the Compare feature to check quality before saving."
      }
    ]
  },
  {
    category: "Technical",
    questions: [
      {
        q: "How does browser-based processing work?",
        a: "File Optimized uses WebAssembly and JavaScript APIs to process files directly in your browser. When you upload a file, it's loaded into your browser's memory, processed using optimized algorithms, and the result is kept locally. No data is sent to external servers."
      },
      {
        q: "What browsers are supported?",
        a: "File Optimized works best on:\n• Chrome 80+ (recommended)\n• Firefox 75+\n• Safari 14+\n• Edge 80+\n\nSome features like AVIF encoding require newer browsers. For best performance, keep your browser updated."
      },
      {
        q: "Why do I need a fast computer for large files?",
        a: "Browser-based processing uses your device's CPU. Large files (especially 4K videos) require significant processing power. If processing is slow, try:\n• Closing other applications\n• Using a desktop instead of mobile\n• Processing fewer files at once\n• Reducing resolution before compression"
      },
      {
        q: "Is there a file size limit?",
        a: "Free users can process files up to 50MB each, with 9 files at once. Pro users get 500MB per file and 30 files batch processing. These limits ensure stable performance across different devices."
      },
      {
        q: "What is WebAssembly and why does it matter?",
        a: "WebAssembly (WASM) is a technology that allows near-native code execution in browsers. This enables File Optimized to run complex compression algorithms at high speed directly in your browser, without needing server uploads."
      },
      {
        q: "Does File Optimized work on mobile devices?",
        a: "Yes! File Optimized is fully responsive and works on smartphones and tablets. However, processing speed depends on your device's capabilities. For large files or batch processing, a desktop or laptop will be faster."
      }
    ]
  },
  {
    category: "Formats & Best Practices",
    questions: [
      {
        q: "What's the best format for website images?",
        a: "For most websites in 2025, we recommend:\n• WebP as the primary format (best compression + quality balance)\n• AVIF for cutting-edge browsers (even better compression)\n• JPEG as fallback for older browsers\n• PNG only when you need transparency"
      },
      {
        q: "What resolution should my images be?",
        a: "For web use:\n• Hero/banner images: 1920px wide maximum\n• Blog/content images: 800-1200px wide\n• Thumbnails: 300-400px wide\n• Product images: 1000-1500px for zoom capability\n\nAlways consider your actual display size and serve appropriately sized images."
      },
      {
        q: "How do I prepare images for printing?",
        a: "For print, you need higher resolution than web:\n• Minimum 300 DPI at final print size\n• Use JPEG quality 90-100% or lossless PNG\n• Keep original files - don't compress for print\n• Color profile: CMYK for professional printing, sRGB for photo labs"
      },
      {
        q: "What bitrate should I use for videos?",
        a: "Recommended video bitrates:\n• 720p: 2-5 Mbps\n• 1080p: 5-10 Mbps\n• 4K: 20-40 Mbps\n\nHigher bitrates for fast action content, lower for talking heads or static scenes."
      },
      {
        q: "What's the ideal audio quality for podcasts?",
        a: "For podcasts and voice content:\n• Format: MP3 or AAC\n• Bitrate: 96-128 kbps (mono) or 128-192 kbps (stereo)\n• Sample rate: 44.1 kHz\n\nHigher bitrates are unnecessary for speech and waste bandwidth."
      },
      {
        q: "Should I strip metadata from my files?",
        a: "It depends on your use case:\n• Strip for privacy: Removes location, camera info, timestamps\n• Strip for smaller files: Can save a few KB per image\n• Keep for archival: Preserves valuable information\n• Keep for SEO: Some metadata helps search engines"
      }
    ]
  },
  {
    category: "Account & Billing",
    questions: [
      {
        q: "How do I upgrade to Pro?",
        a: "Click the 'Upgrade to Pro' button on the homepage or visit the Pricing page. You'll be taken to a secure Stripe checkout. After payment, your account is instantly upgraded."
      },
      {
        q: "What payment methods do you accept?",
        a: "We use Stripe for secure payments and accept:\n• Credit/debit cards (Visa, Mastercard, Amex)\n• Apple Pay and Google Pay\n• Many local payment methods depending on your country"
      },
      {
        q: "Can I get a refund?",
        a: "We offer refunds on a case-by-case basis within 7 days of purchase if you haven't extensively used Pro features. Contact support.tliu.co for refund requests."
      },
      {
        q: "How do I manage my subscription?",
        a: "Visit your Profile page and click 'Manage Subscription' to access the Stripe customer portal. There you can update payment methods, view invoices, or cancel your subscription."
      },
      {
        q: "What happens to my files if I cancel Pro?",
        a: "Nothing happens to your files - they're processed locally and never stored on our servers. After cancellation, you'll revert to free plan limits (50MB file size, 9 files at once)."
      },
      {
        q: "Do you offer discounts for annual billing?",
        a: "Yes! Annual billing is $100/year compared to $10/month, saving you $20 (17% discount). Select 'Annual' on the pricing page to get this discount."
      },
      {
        q: "Can I switch between monthly and annual billing?",
        a: "Yes, you can change your billing cycle from the subscription management portal. Changes take effect at the next billing date."
      }
    ]
  },
  {
    category: "Mobile & Devices",
    questions: [
      {
        q: "Does File Optimized work on iPhone and iPad?",
        a: "Yes! File Optimized is fully responsive and works on Safari for iOS. Processing happens in your browser, though larger files may be slower on mobile devices due to hardware limitations."
      },
      {
        q: "Does it work on Android devices?",
        a: "Yes! File Optimized works on Chrome for Android and other mobile browsers. For best performance, use Chrome browser."
      },
      {
        q: "Why is processing slower on my phone?",
        a: "Mobile devices have less processing power than desktop computers. For large files or batch processing, we recommend using a laptop or desktop. Closing other apps can also help."
      },
      {
        q: "Can I use File Optimized on a tablet?",
        a: "Absolutely! Tablets like iPad and Android tablets work great with File Optimized. The interface adapts to your screen size automatically."
      },
      {
        q: "Is there a mobile app?",
        a: "File Optimized is a web app that works in any browser - no app download needed. You can add it to your home screen for quick access (works like an app!)."
      }
    ]
  },
  {
    category: "Advanced Features",
    questions: [
      {
        q: "What is AI upscaling and how does it work?",
        a: "AI upscaling uses machine learning algorithms to intelligently increase image resolution. Unlike traditional resizing that just interpolates pixels, AI adds realistic detail to create sharper, higher-resolution images."
      },
      {
        q: "How do I create animations from images?",
        a: "Upload an image, click on settings, and select 'Create Animation'. You can generate effects like zoom, pan, pulse, or rotate. These work best with still images and create engaging motion graphics."
      },
      {
        q: "Can I add captions to videos?",
        a: "Yes! Our video editor includes AI-powered caption generation. Upload a video, open the editor, and use the caption feature. Captions are burned into the video for universal playback."
      },
      {
        q: "How do I compare original vs compressed?",
        a: "After processing any file, click the 'Compare' button on the media card. This opens a side-by-side comparison with a slider to examine quality differences in detail."
      },
      {
        q: "Can I edit images before compressing?",
        a: "Yes! Click the edit button on any image card to access our built-in editor. You can crop, rotate, adjust brightness/contrast, add filters, and more before compression."
      },
      {
        q: "What are visual themes?",
        a: "Pro users can enable visual themes that add animated effects to the interface - snow, fireworks, hearts, sakura blossoms, and more. Find them in your Profile settings."
      }
    ]
  },
  {
    category: "Performance & Speed",
    questions: [
      {
        q: "Why does processing take longer for some files?",
        a: "Processing time depends on file size, format, and your device's hardware. Large videos take longer than small images. 4K video may take several minutes while a small JPEG processes in under a second."
      },
      {
        q: "How can I speed up batch processing?",
        a: "Close other browser tabs, ensure your device is plugged in (battery saver mode slows processing), and use Chrome for best WebAssembly performance. Pro users get priority processing."
      },
      {
        q: "Does internet speed affect processing?",
        a: "No! All processing happens locally on your device. Internet speed only affects the initial page load. Once loaded, you can even work offline."
      },
      {
        q: "Why is my browser freezing during processing?",
        a: "Very large files or batch processing many files can temporarily slow your browser. Processing runs in Web Workers to minimize this, but complex operations may still cause brief delays."
      },
      {
        q: "What's the fastest format to convert to?",
        a: "JPEG is typically fastest for photos. WebP offers a good balance of speed and compression. AVIF provides best compression but takes longer to encode."
      }
    ]
  },
  {
    category: "File Management",
    questions: [
      {
        q: "Can I save my compression settings?",
        a: "Your last used settings are automatically remembered for each file type. Pro users get additional preset options for frequently used configurations."
      },
      {
        q: "How do I download all processed files at once?",
        a: "Click the 'Download All' button in the stats bar above your files. This creates a ZIP file containing all your processed images with a single click."
      },
      {
        q: "Can I rename files before downloading?",
        a: "Yes! Click on the filename in any processed file card to edit it. The new name will be used when you download the file."
      },
      {
        q: "What happens if I refresh the page?",
        a: "All uploaded and processed files will be cleared since nothing is stored on servers. Make sure to download your files before navigating away or refreshing."
      },
      {
        q: "Can I reorder my uploaded files?",
        a: "Yes! Simply drag and drop files to reorder them. This is helpful when you want to process or download them in a specific sequence."
      },
      {
        q: "Is there a way to undo compression?",
        a: "You can always re-process a file with different settings by clicking the settings button. The original file is kept in memory until you remove it or refresh the page."
      }
    ]
  },
  {
    category: "Browser Compatibility",
    questions: [
      {
        q: "Which browser works best?",
        a: "Chrome and Edge offer the best performance due to superior WebAssembly support. Firefox works well but may be slightly slower. Safari works but has some format limitations."
      },
      {
        q: "Why doesn't AVIF work in my browser?",
        a: "AVIF encoding requires modern browser features. It works in Chrome 85+, Firefox 93+, and Edge 121+. Safari support is limited. We'll show a warning if your browser doesn't support it."
      },
      {
        q: "Does it work in Incognito/Private mode?",
        a: "Yes! File Optimized works in private browsing mode. However, your settings won't be saved between sessions in this mode."
      },
      {
        q: "Why am I seeing different results in different browsers?",
        a: "Different browsers have varying implementations of image/video codecs. Results should be similar, but slight variations in output size or quality can occur."
      },
      {
        q: "Can I use browser extensions with File Optimized?",
        a: "Yes, but some ad blockers or privacy extensions might interfere with certain features. If you experience issues, try disabling extensions temporarily."
      }
    ]
  },
  {
    category: "Quality & Output",
    questions: [
      {
        q: "Why is my compressed file larger than the original?",
        a: "This can happen when: converting to a less efficient format (JPEG to PNG), the original was already heavily compressed, or upscaling an image. Try a lower quality setting or different format."
      },
      {
        q: "How do I get the smallest possible file size?",
        a: "Use WebP or AVIF format, set quality to 60-70%, resize to the actual display size you need, and remove metadata. The comparison tool helps you find the right balance."
      },
      {
        q: "Will compression remove my photo metadata?",
        a: "By default, EXIF data (camera info, GPS, etc.) is preserved. You can choose to strip metadata in the settings for smaller files and better privacy."
      },
      {
        q: "What quality setting should I use for printing?",
        a: "For print, use 90-100% quality and avoid aggressive compression. PNG or high-quality JPEG at 300 DPI is recommended. For web-only use, 75-85% is usually sufficient."
      },
      {
        q: "Can I compress a file multiple times?",
        a: "While possible, each lossy compression degrades quality slightly. It's best to compress from the original source file. Lossless formats (PNG) can be recompressed without degradation."
      }
    ]
  },
  {
    category: "Integration & Workflow",
    questions: [
      {
        q: "Can I use File Optimized with my CMS?",
        a: "Absolutely! Optimize your images before uploading to WordPress, Shopify, Squarespace, Wix, or any other CMS. This ensures fast loading without relying on CMS compression."
      },
      {
        q: "Is there an API for automated compression?",
        a: "Currently, File Optimized is a browser-based tool without a public API. For automation needs, we recommend our browser tool for manual optimization or exploring server-side alternatives."
      },
      {
        q: "Can I integrate this into my development workflow?",
        a: "You can use File Optimized to optimize assets before adding them to your project. For CI/CD pipelines, consider build-time optimization tools that complement our manual optimization."
      },
      {
        q: "Does it work with cloud storage?",
        a: "Files must be on your device to process. You can download files from Google Drive, Dropbox, etc., optimize them, then re-upload. We don't directly integrate with cloud storage."
      },
      {
        q: "Can I share compressed files directly?",
        a: "After processing, use the share button to generate a shareable preview. For the actual file, download it first and share through your preferred method."
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
  const [displayCount, setDisplayCount] = useState(5);

  // Fetch FAQs from database
  const { data: dbFaqs = [], isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => base44.entities.FAQItem.filter({ published: true }, 'order', 100),
  });

  // Combine database FAQs with defaults, grouped by category
  const faqs = (() => {
    // If we have database FAQs, merge with defaults
    if (dbFaqs.length > 0) {
      const grouped = {};
      // First add all default FAQs
      defaultFaqs.forEach(cat => {
        grouped[cat.category] = { category: cat.category, questions: [...cat.questions] };
      });
      // Then add/override with database FAQs
      dbFaqs.forEach(faq => {
        if (!grouped[faq.category]) {
          grouped[faq.category] = { category: faq.category, questions: [] };
        }
        // Add if not already present
        const exists = grouped[faq.category].questions.some(q => q.q === faq.question);
        if (!exists) {
          grouped[faq.category].questions.push({ q: faq.question, a: faq.answer });
        }
      });
      return Object.values(grouped);
    }
    // Otherwise use defaults
    return defaultFaqs;
  })();

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
          {filteredFaqs.slice(0, displayCount).map((category, categoryIndex) => (
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

        {filteredFaqs.length > displayCount && (
          <div className="text-center mt-8">
            <Button 
              onClick={() => setDisplayCount(prev => prev + 5)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Load More Categories ({filteredFaqs.length - displayCount} remaining)
            </Button>
          </div>
        )}

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