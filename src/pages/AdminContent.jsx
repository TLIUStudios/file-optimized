import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, BookOpen, HelpCircle, Shield, Loader2, X, Database, FileText, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "../components/SEOHead";
import LiveAnalyticsDashboard from "../components/admin/LiveAnalyticsDashboard";

// Import built-in articles from Blog page
const builtInArticles = [
  { id: "builtin-1", title: "The Ultimate Guide to Image Compression for Web", slug: "ultimate-guide-image-compression-web", category: "image-compression", published: true, isBuiltIn: true },
  { id: "builtin-2", title: "JPEG vs PNG vs WebP vs AVIF: Complete Format Comparison", slug: "jpeg-png-webp-avif-comparison", category: "file-formats", published: true, isBuiltIn: true },
  { id: "builtin-3", title: "How to Compress Videos Without Losing Quality", slug: "compress-videos-without-losing-quality", category: "video-compression", published: true, isBuiltIn: true },
  { id: "builtin-4", title: "Understanding Lossy vs Lossless Compression", slug: "lossy-vs-lossless-compression-explained", category: "tutorials", published: true, isBuiltIn: true },
  { id: "builtin-5", title: "Optimizing Images for Social Media in 2025", slug: "optimize-images-social-media-2025", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-6", title: "Audio Compression: MP3 vs WAV vs AAC", slug: "audio-compression-mp3-wav-aac", category: "audio-compression", published: true, isBuiltIn: true },
  { id: "builtin-7", title: "10 Website Speed Tips Using Image Optimization", slug: "website-speed-image-optimization-tips", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-8", title: "GIF Optimization: Reduce Size Without Losing Animation", slug: "gif-optimization-reduce-size", category: "image-compression", published: true, isBuiltIn: true },
  { id: "builtin-9", title: "What is WebP and Why Should You Use It?", slug: "what-is-webp-why-use-it", category: "file-formats", published: true, isBuiltIn: true },
  { id: "builtin-10", title: "Video Codec Explained: H.264, H.265, VP9, AV1", slug: "video-codecs-explained", category: "video-compression", published: true, isBuiltIn: true },
  { id: "builtin-11", title: "Browser-Based vs Server-Side Compression", slug: "browser-vs-server-compression", category: "tutorials", published: true, isBuiltIn: true },
  { id: "builtin-12", title: "How to Choose the Right Compression Quality", slug: "choose-right-compression-quality", category: "tips-tricks", published: true, isBuiltIn: true },
  { id: "builtin-13", title: "PNG Compression: Best Practices for Transparency", slug: "png-compression-transparency", category: "image-compression", published: true, isBuiltIn: true },
  { id: "builtin-14", title: "AVIF: The Next Generation Image Format", slug: "avif-next-generation-format", category: "file-formats", published: true, isBuiltIn: true },
  { id: "builtin-15", title: "Batch Processing: Compress Multiple Files Efficiently", slug: "batch-processing-multiple-files", category: "tutorials", published: true, isBuiltIn: true },
  { id: "builtin-16", title: "Image SEO: Alt Text, File Names, and Optimization", slug: "image-seo-alt-text-optimization", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-17", title: "How AI Upscaling Works", slug: "how-ai-upscaling-works", category: "tutorials", published: true, isBuiltIn: true },
  { id: "builtin-18", title: "Compressing Screenshots: Best Formats and Settings", slug: "compressing-screenshots-best-formats", category: "tips-tricks", published: true, isBuiltIn: true },
  { id: "builtin-19", title: "E-commerce Image Optimization Guide", slug: "ecommerce-image-optimization", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-20", title: "Audio for Podcasts: Compression and Quality", slug: "audio-podcasts-compression-quality", category: "audio-compression", published: true, isBuiltIn: true },
  { id: "builtin-21", title: "Video for Email: Size Limits and Best Practices", slug: "video-for-email-size-limits", category: "video-compression", published: true, isBuiltIn: true },
  { id: "builtin-22", title: "Core Web Vitals and Image Optimization", slug: "core-web-vitals-image-optimization", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-23", title: "Responsive Images: srcset and sizes Explained", slug: "responsive-images-srcset-sizes", category: "tutorials", published: true, isBuiltIn: true },
  { id: "builtin-24", title: "Converting Between Audio Formats", slug: "converting-audio-formats", category: "audio-compression", published: true, isBuiltIn: true },
  { id: "builtin-25", title: "Privacy-First File Processing: Why It Matters", slug: "privacy-first-file-processing", category: "tutorials", published: true, isBuiltIn: true },
  { id: "builtin-26", title: "Understanding Color Profiles: sRGB, Adobe RGB, and Display P3", slug: "understanding-color-profiles", category: "tutorials", published: true, isBuiltIn: true },
  { id: "builtin-27", title: "How to Reduce Video File Size for YouTube", slug: "reduce-video-size-youtube", category: "video-compression", published: true, isBuiltIn: true },
  { id: "builtin-28", title: "Image Optimization for WordPress Sites", slug: "image-optimization-wordpress", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-29", title: "What is Bit Depth and Why Does It Matter?", slug: "bit-depth-explained", category: "tutorials", published: true, isBuiltIn: true },
  { id: "builtin-30", title: "Mobile Image Optimization: Best Practices", slug: "mobile-image-optimization", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-31", title: "Lossless vs Lossy Audio: When to Use Each", slug: "lossless-vs-lossy-audio", category: "audio-compression", published: true, isBuiltIn: true },
  { id: "builtin-32", title: "How to Compress 4K Video Without Losing Quality", slug: "compress-4k-video", category: "video-compression", published: true, isBuiltIn: true },
  { id: "builtin-33", title: "Understanding EXIF Data: What It Is and How to Remove It", slug: "exif-data-explained", category: "tips-tricks", published: true, isBuiltIn: true },
  { id: "builtin-34", title: "SVG vs PNG: When to Use Vector Graphics", slug: "svg-vs-png-comparison", category: "file-formats", published: true, isBuiltIn: true },
  { id: "builtin-35", title: "How WebAssembly Enables Browser-Based Compression", slug: "webassembly-browser-compression", category: "tutorials", published: true, isBuiltIn: true },
  { id: "builtin-36", title: "Optimizing Product Photos for Amazon and eBay", slug: "product-photos-amazon-ebay", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-37", title: "Video Bitrate Guide: Finding the Right Settings", slug: "video-bitrate-guide", category: "video-compression", published: true, isBuiltIn: true },
  { id: "builtin-38", title: "Image Compression for Email: Size Limits by Provider", slug: "image-compression-email", category: "tips-tricks", published: true, isBuiltIn: true },
  { id: "builtin-39", title: "HDR Images: What They Are and How to Optimize Them", slug: "hdr-images-optimization", category: "image-compression", published: true, isBuiltIn: true },
  { id: "builtin-40", title: "Audio Normalization: Consistent Volume Across Files", slug: "audio-normalization-guide", category: "audio-compression", published: true, isBuiltIn: true },
  { id: "builtin-41", title: "Lazy Loading Images: Implementation Guide", slug: "lazy-loading-images-guide", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-42", title: "Converting GIF to MP4: Why and How", slug: "converting-gif-to-mp4", category: "file-formats", published: true, isBuiltIn: true },
  { id: "builtin-43", title: "Image Sprites: Combining Multiple Images", slug: "image-sprites-guide", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-44", title: "Compression Artifacts: Types and How to Avoid Them", slug: "compression-artifacts-guide", category: "tips-tricks", published: true, isBuiltIn: true },
  { id: "builtin-45", title: "HEIF Format: Apple's Modern Image Format", slug: "heif-format-explained", category: "file-formats", published: true, isBuiltIn: true },
  { id: "builtin-46", title: "Optimizing Images for Retina Displays", slug: "retina-display-optimization", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-47", title: "Audio Sample Rate: 44.1kHz vs 48kHz vs 96kHz", slug: "audio-sample-rate-comparison", category: "audio-compression", published: true, isBuiltIn: true },
  { id: "builtin-48", title: "Thumbnail Generation: Best Practices", slug: "thumbnail-generation-guide", category: "image-compression", published: true, isBuiltIn: true },
  { id: "builtin-49", title: "Progressive JPEG vs Baseline JPEG", slug: "progressive-vs-baseline-jpeg", category: "file-formats", published: true, isBuiltIn: true },
  { id: "builtin-50", title: "Complete Guide to Video Container Formats", slug: "video-container-formats-guide", category: "file-formats", published: true, isBuiltIn: true },
  { id: "builtin-51", title: "Image Optimization for Shopify Stores", slug: "image-optimization-shopify", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-52", title: "Understanding Video Resolution: 720p to 8K", slug: "video-resolution-guide", category: "video-compression", published: true, isBuiltIn: true },
  { id: "builtin-53", title: "Opus Audio Format: The Ultimate Guide", slug: "opus-audio-format-guide", category: "audio-compression", published: true, isBuiltIn: true },
  { id: "builtin-54", title: "Image Optimization for Next.js Applications", slug: "image-optimization-nextjs", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-55", title: "Color Banding: Causes and Solutions", slug: "color-banding-solutions", category: "tips-tricks", published: true, isBuiltIn: true },
  { id: "builtin-56", title: "Screen Recording Compression Tips", slug: "screen-recording-compression", category: "video-compression", published: true, isBuiltIn: true },
  { id: "builtin-57", title: "Instagram Reels: Optimal Video Settings", slug: "instagram-reels-video-settings", category: "video-compression", published: true, isBuiltIn: true },
  { id: "builtin-58", title: "Bulk Image Resizing Strategies", slug: "bulk-image-resizing-strategies", category: "tips-tricks", published: true, isBuiltIn: true },
  { id: "builtin-59", title: "WebM vs MP4: Which Format Should You Choose?", slug: "webm-vs-mp4-comparison", category: "file-formats", published: true, isBuiltIn: true },
  { id: "builtin-60", title: "Image CDN Best Practices", slug: "image-cdn-best-practices", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-61", title: "RAW Image Processing for Beginners", slug: "raw-image-processing-beginners", category: "image-compression", published: true, isBuiltIn: true },
  { id: "builtin-62", title: "Audio Bitrate Guide: From 128kbps to Lossless", slug: "audio-bitrate-guide", category: "audio-compression", published: true, isBuiltIn: true },
  { id: "builtin-63", title: "Video Streaming Optimization Tips", slug: "video-streaming-optimization", category: "video-compression", published: true, isBuiltIn: true },
  { id: "builtin-64", title: "TIFF vs PNG: When to Use Each Format", slug: "tiff-vs-png-comparison", category: "file-formats", published: true, isBuiltIn: true },
  { id: "builtin-65", title: "Optimizing Background Videos for Websites", slug: "background-videos-optimization", category: "video-compression", published: true, isBuiltIn: true },
  { id: "builtin-66", title: "Image Compression for Game Development", slug: "image-compression-game-development", category: "image-compression", published: true, isBuiltIn: true },
  { id: "builtin-67", title: "Understanding DPI and PPI for Digital Images", slug: "dpi-ppi-digital-images", category: "tutorials", published: true, isBuiltIn: true },
  { id: "builtin-68", title: "Compressing Medical Images: Best Practices", slug: "compressing-medical-images", category: "image-compression", published: true, isBuiltIn: true },
  { id: "builtin-69", title: "Audio for Video: Syncing and Compression", slug: "audio-video-syncing-compression", category: "audio-compression", published: true, isBuiltIn: true },
  { id: "builtin-70", title: "Creating Optimized Favicons and App Icons", slug: "optimized-favicons-app-icons", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-71", title: "Video Compression for Discord", slug: "video-compression-discord", category: "video-compression", published: true, isBuiltIn: true },
  { id: "builtin-72", title: "Understanding Image Histograms", slug: "understanding-image-histograms", category: "tutorials", published: true, isBuiltIn: true },
  { id: "builtin-73", title: "Podcast Audio: Recording to Publishing", slug: "podcast-audio-recording-publishing", category: "audio-compression", published: true, isBuiltIn: true },
  { id: "builtin-74", title: "Image Optimization for Email Marketing", slug: "image-optimization-email-marketing", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-75", title: "H.266/VVC: The Next Video Codec", slug: "h266-vvc-next-video-codec", category: "file-formats", published: true, isBuiltIn: true },
  { id: "builtin-76", title: "Compressing Animated Stickers and Emojis", slug: "compressing-animated-stickers", category: "image-compression", published: true, isBuiltIn: true },
  { id: "builtin-77", title: "Video SEO: Optimizing for Search Engines", slug: "video-seo-optimization", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-78", title: "Audio Restoration Before Compression", slug: "audio-restoration-before-compression", category: "audio-compression", published: true, isBuiltIn: true },
  { id: "builtin-79", title: "Print vs Web Image Optimization", slug: "print-vs-web-image-optimization", category: "tutorials", published: true, isBuiltIn: true },
  { id: "builtin-80", title: "Compressing 360° and VR Videos", slug: "compressing-360-vr-videos", category: "video-compression", published: true, isBuiltIn: true },
  { id: "builtin-81", title: "Image Compression for Photographers", slug: "image-compression-photographers", category: "image-compression", published: true, isBuiltIn: true },
  { id: "builtin-82", title: "Understanding Audio Channels: Mono, Stereo, Surround", slug: "audio-channels-mono-stereo-surround", category: "audio-compression", published: true, isBuiltIn: true },
  { id: "builtin-83", title: "Optimizing Product 360° Spin Images", slug: "product-360-spin-images", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-84", title: "FLAC vs ALAC: Lossless Audio Showdown", slug: "flac-vs-alac-comparison", category: "file-formats", published: true, isBuiltIn: true },
  { id: "builtin-85", title: "Optimizing Images for Dark Mode", slug: "optimizing-images-dark-mode", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-86", title: "Video Compression for Online Courses", slug: "video-compression-online-courses", category: "video-compression", published: true, isBuiltIn: true },
  { id: "builtin-87", title: "Understanding JPEG Quality Levels", slug: "jpeg-quality-levels-explained", category: "tutorials", published: true, isBuiltIn: true },
  { id: "builtin-88", title: "Audio Compression for Mobile Games", slug: "audio-compression-mobile-games", category: "audio-compression", published: true, isBuiltIn: true },
  { id: "builtin-89", title: "Creating Web-Optimized Infographics", slug: "web-optimized-infographics", category: "image-compression", published: true, isBuiltIn: true },
  { id: "builtin-90", title: "Video Encoding Presets Explained", slug: "video-encoding-presets-explained", category: "tutorials", published: true, isBuiltIn: true },
  { id: "builtin-91", title: "Optimizing OG Images for Social Sharing", slug: "og-images-social-sharing", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-92", title: "Lossless Image Rotation and Cropping", slug: "lossless-rotation-cropping", category: "tips-tricks", published: true, isBuiltIn: true },
  { id: "builtin-93", title: "Audio Formats for Audiobooks", slug: "audio-formats-audiobooks", category: "audio-compression", published: true, isBuiltIn: true },
  { id: "builtin-94", title: "Optimizing Images for Notion and Docs", slug: "images-notion-google-docs", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-95", title: "Video Compression for Webinars", slug: "video-compression-webinars", category: "video-compression", published: true, isBuiltIn: true },
  { id: "builtin-96", title: "Understanding PNG Compression Levels", slug: "png-compression-levels", category: "tutorials", published: true, isBuiltIn: true },
  { id: "builtin-97", title: "Audio Compression for Voice Assistants", slug: "audio-compression-voice-assistants", category: "audio-compression", published: true, isBuiltIn: true },
  { id: "builtin-98", title: "Creating Lightweight Hero Images", slug: "lightweight-hero-images", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-99", title: "Video Thumbnails: Creation and Optimization", slug: "video-thumbnails-creation-optimization", category: "video-compression", published: true, isBuiltIn: true },
  { id: "builtin-100", title: "Batch Converting Image Formats", slug: "batch-converting-image-formats", category: "tips-tricks", published: true, isBuiltIn: true },
  { id: "builtin-101", title: "Audio Loudness Standards: LUFS Explained", slug: "audio-loudness-lufs-explained", category: "audio-compression", published: true, isBuiltIn: true },
  { id: "builtin-102", title: "Image Optimization for AR Filters", slug: "image-optimization-ar-filters", category: "image-compression", published: true, isBuiltIn: true },
  { id: "builtin-103", title: "Understanding Video Timecodes", slug: "understanding-video-timecodes", category: "tutorials", published: true, isBuiltIn: true },
  { id: "builtin-104", title: "Optimizing Images for Pinterest", slug: "optimizing-images-pinterest", category: "web-optimization", published: true, isBuiltIn: true },
  { id: "builtin-105", title: "Video Compression Myths Debunked", slug: "video-compression-myths-debunked", category: "tips-tricks", published: true, isBuiltIn: true },
];

// Built-in FAQs count (updated)
const builtInFaqsCount = 100;

const articleCategories = [
  { value: "image-compression", label: "Image Compression" },
  { value: "video-compression", label: "Video Compression" },
  { value: "audio-compression", label: "Audio Compression" },
  { value: "file-formats", label: "File Formats" },
  { value: "web-optimization", label: "Web Optimization" },
  { value: "tutorials", label: "Tutorials" },
  { value: "tips-tricks", label: "Tips & Tricks" }
];

const faqCategories = [
  { value: "General", label: "General" },
  { value: "File Support", label: "File Support" },
  { value: "Compression & Quality", label: "Compression & Quality" },
  { value: "Privacy & Security", label: "Privacy & Security" },
  { value: "Features", label: "Features" },
  { value: "Pro Plan", label: "Pro Plan" },
  { value: "Troubleshooting", label: "Troubleshooting" },
  { value: "Formats & Best Practices", label: "Formats & Best Practices" },
  { value: "Account & Billing", label: "Account & Billing" },
  { value: "Technical", label: "Technical" },
  { value: "Mobile & Devices", label: "Mobile & Devices" },
  { value: "Advanced Features", label: "Advanced Features" }
];

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analytics");
  const [editingArticle, setEditingArticle] = useState(null);
  const [editingFaq, setEditingFaq] = useState(null);
  const [showArticleDialog, setShowArticleDialog] = useState(false);
  const [showFaqDialog, setShowFaqDialog] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const currentUser = await base44.auth.me();
        console.log("Admin check - user role:", currentUser?.role);
        setUser(currentUser);
        if (currentUser?.role !== 'admin') {
          toast.error("Access denied. Admin only. Your role: " + (currentUser?.role || 'none'));
        }
      } catch (e) {
        console.error("Admin check error:", e);
        toast.error("Please sign in");
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  const { data: articles = [], isLoading: articlesLoading, error: articlesError } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: async () => {
      console.log("Fetching articles as admin...");
      const result = await base44.entities.Article.list('-created_date', 100);
      console.log("Articles fetched:", result?.length);
      return result;
    },
    enabled: user?.role === 'admin'
  });

  const { data: faqs = [], isLoading: faqsLoading, error: faqsError } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: async () => {
      console.log("Fetching FAQs as admin...");
      const result = await base44.entities.FAQItem.list('category', 100);
      console.log("FAQs fetched:", result?.length);
      return result;
    },
    enabled: user?.role === 'admin'
  });

  // Log any errors
  if (articlesError) console.error("Articles error:", articlesError);
  if (faqsError) console.error("FAQs error:", faqsError);

  const articleMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        return base44.entities.Article.update(data.id, data);
      }
      return base44.entities.Article.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      setShowArticleDialog(false);
      setEditingArticle(null);
      toast.success("Article saved!");
    },
    onError: (e) => toast.error(e.message)
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id) => base44.entities.Article.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success("Article deleted");
    }
  });

  const faqMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        return base44.entities.FAQItem.update(data.id, data);
      }
      return base44.entities.FAQItem.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      setShowFaqDialog(false);
      setEditingFaq(null);
      toast.success("FAQ saved!");
    },
    onError: (e) => toast.error(e.message)
  });

  const deleteFaqMutation = useMutation({
    mutationFn: (id) => base44.entities.FAQItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      toast.success("FAQ deleted");
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
        <p className="text-slate-600 dark:text-slate-400">This page is only accessible to administrators.</p>
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Admin Dashboard - File Optimized" />
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Content Management</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage blog articles and FAQ items</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{builtInArticles.length}</p>
                <p className="text-xs text-slate-500">Built-in Articles</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{articles.length}</p>
                <p className="text-xs text-slate-500">Custom Articles</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <HelpCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{builtInFaqsCount}</p>
                <p className="text-xs text-slate-500">Built-in FAQs</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Database className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{faqs.length}</p>
                <p className="text-xs text-slate-500">Custom FAQs</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" /> Live Analytics
            </TabsTrigger>
            <TabsTrigger value="articles" className="gap-2">
              <BookOpen className="w-4 h-4" /> All Articles ({builtInArticles.length + articles.length})
            </TabsTrigger>
            <TabsTrigger value="faqs" className="gap-2">
              <HelpCircle className="w-4 h-4" /> All FAQs ({builtInFaqsCount + faqs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <LiveAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="articles">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-slate-500">
                Showing {builtInArticles.length} built-in + {articles.length} custom articles
              </p>
              <Button onClick={() => { setEditingArticle({}); setShowArticleDialog(true); }} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" /> New Article
              </Button>
            </div>
            
            {articlesLoading ? (
              <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
            ) : (
              <div className="space-y-3">
                {/* Built-in Articles */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Built-in Articles ({builtInArticles.length})
                    <Badge variant="outline" className="text-xs">Read-only</Badge>
                  </h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {builtInArticles.map(article => (
                      <Card key={article.id} className="p-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 dark:text-white truncate text-sm">{article.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {article.category} • <span className="text-emerald-600">Published</span>
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">Built-in</Badge>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Custom Articles */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4" /> Custom Articles ({articles.length})
                    <Badge className="text-xs bg-blue-100 text-blue-700">Editable</Badge>
                  </h3>
                  {articles.length > 0 ? (
                    <div className="space-y-2">
                      {articles.map(article => (
                        <Card key={article.id} className="p-3 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 dark:text-white truncate text-sm">{article.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {article.category} • {article.published ? <span className="text-emerald-600">Published</span> : <span className="text-amber-600">Draft</span>}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" variant="outline" onClick={() => { setEditingArticle(article); setShowArticleDialog(true); }}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => {
                              if (confirm("Delete this article?")) deleteArticleMutation.mutate(article.id);
                            }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-slate-500 text-sm">No custom articles yet. Click "New Article" to create one.</p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="faqs">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-slate-500">
                Showing {builtInFaqsCount} built-in + {faqs.length} custom FAQs
              </p>
              <Button onClick={() => { setEditingFaq({}); setShowFaqDialog(true); }} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" /> New FAQ
              </Button>
            </div>
            
            {faqsLoading ? (
              <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
            ) : (
              <div className="space-y-3">
                {/* Built-in FAQs Info */}
                <Card className="p-4 bg-slate-50 dark:bg-slate-800/50 mb-6">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white mb-1">Built-in FAQs ({builtInFaqsCount})</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        There are {builtInFaqsCount} built-in FAQ questions across 11 categories (General, File Support, Compression & Quality, Privacy & Security, Features, Pro Plan, Troubleshooting, Formats & Conversion, Technical, Formats & Best Practices, Account & Billing). These are hardcoded and always available on the FAQ page.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Custom FAQs */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4" /> Custom FAQs ({faqs.length})
                    <Badge className="text-xs bg-blue-100 text-blue-700">Editable</Badge>
                  </h3>
                  {faqs.length > 0 ? (
                    <div className="space-y-2">
                      {faqs.map(faq => (
                        <Card key={faq.id} className="p-3 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 dark:text-white truncate text-sm">{faq.question}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {faq.category} • {faq.published ? <span className="text-emerald-600">Published</span> : <span className="text-amber-600">Draft</span>}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" variant="outline" onClick={() => { setEditingFaq(faq); setShowFaqDialog(true); }}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => {
                              if (confirm("Delete this FAQ?")) deleteFaqMutation.mutate(faq.id);
                            }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-slate-500 text-sm">No custom FAQs yet. Click "New FAQ" to create one.</p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Article Dialog */}
        <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
            <div className="absolute top-4 right-4 z-50">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowArticleDialog(false)}
                className="bg-slate-900/90 dark:bg-slate-900/90 hover:bg-red-600 dark:hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <DialogHeader>
              <DialogTitle>{editingArticle?.id ? "Edit Article" : "New Article"}</DialogTitle>
            </DialogHeader>
            <ArticleForm 
              article={editingArticle} 
              onSave={(data) => articleMutation.mutate(data)}
              loading={articleMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* FAQ Dialog */}
        <Dialog open={showFaqDialog} onOpenChange={setShowFaqDialog}>
          <DialogContent className="max-w-xl [&>button]:hidden">
            <div className="absolute top-4 right-4 z-50">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFaqDialog(false)}
                className="bg-slate-900/90 dark:bg-slate-900/90 hover:bg-red-600 dark:hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <DialogHeader>
              <DialogTitle>{editingFaq?.id ? "Edit FAQ" : "New FAQ"}</DialogTitle>
            </DialogHeader>
            <FaqForm 
              faq={editingFaq} 
              onSave={(data) => faqMutation.mutate(data)}
              loading={faqMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

function ArticleForm({ article, onSave, loading }) {
  const [form, setForm] = useState({
    title: article?.title || "",
    slug: article?.slug || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "",
    category: article?.category || "tutorials",
    tags: article?.tags?.join(", ") || "",
    featured_image: article?.featured_image || "",
    read_time: article?.read_time || 5,
    published: article?.published ?? true,
    id: article?.id
  });

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Title</label>
        <Input 
          value={form.title} 
          onChange={(e) => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })}
          placeholder="Article title"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Slug</label>
        <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="url-friendly-slug" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Category</label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {articleCategories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Read Time (min)</label>
          <Input type="number" value={form.read_time} onChange={(e) => setForm({ ...form, read_time: parseInt(e.target.value) || 5 })} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Excerpt</label>
        <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short summary..." rows={2} />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Content (Markdown)</label>
        <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Article content in markdown..." rows={10} />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Tags (comma separated)</label>
        <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="tag1, tag2, tag3" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Featured Image URL</label>
        <Input value={form.featured_image} onChange={(e) => setForm({ ...form, featured_image: e.target.value })} placeholder="https://..." />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
          <span className="text-sm">Published</span>
        </div>
        <Button onClick={() => onSave({ ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) })} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Article
        </Button>
      </div>
    </div>
  );
}

function FaqForm({ faq, onSave, loading }) {
  const [form, setForm] = useState({
    question: faq?.question || "",
    answer: faq?.answer || "",
    category: faq?.category || "General",
    order: faq?.order || 0,
    published: faq?.published ?? true,
    id: faq?.id
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Question</label>
        <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="What is...?" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Answer</label>
        <Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="The answer..." rows={5} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Category</label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {faqCategories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Order</label>
          <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
          <span className="text-sm">Published</span>
        </div>
        <Button onClick={() => onSave(form)} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save FAQ
        </Button>
      </div>
    </div>
  );
}