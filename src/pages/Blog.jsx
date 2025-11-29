import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Search, Clock, ArrowRight, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import SEOHead from "../components/SEOHead";

const categoryLabels = {
  "image-compression": "Image Compression",
  "video-compression": "Video Compression", 
  "audio-compression": "Audio Compression",
  "file-formats": "File Formats",
  "web-optimization": "Web Optimization",
  "tutorials": "Tutorials",
  "tips-tricks": "Tips & Tricks"
};

// Built-in articles for SEO and content
const builtInArticles = [
  {
    id: "builtin-1",
    title: "The Ultimate Guide to Image Compression for Web",
    slug: "ultimate-guide-image-compression-web",
    excerpt: "Learn everything about compressing images for faster websites without sacrificing visual quality.",
    category: "image-compression",
    tags: ["web performance", "SEO", "compression"],
    read_time: 12,
    published: true
  },
  {
    id: "builtin-2",
    title: "JPEG vs PNG vs WebP vs AVIF: Complete Format Comparison",
    slug: "jpeg-png-webp-avif-comparison",
    excerpt: "A comprehensive comparison of image formats to help you choose the right one for every situation.",
    category: "file-formats",
    tags: ["JPEG", "PNG", "WebP", "AVIF", "formats"],
    read_time: 10,
    published: true
  },
  {
    id: "builtin-3",
    title: "How to Compress Videos Without Losing Quality",
    slug: "compress-videos-without-losing-quality",
    excerpt: "Professional techniques for reducing video file sizes while maintaining excellent visual quality.",
    category: "video-compression",
    tags: ["video", "H.264", "compression", "quality"],
    read_time: 9,
    published: true
  },
  {
    id: "builtin-4",
    title: "Understanding Lossy vs Lossless Compression",
    slug: "lossy-vs-lossless-compression-explained",
    excerpt: "Learn the fundamental difference between compression types and when to use each method.",
    category: "tutorials",
    tags: ["compression", "lossy", "lossless", "fundamentals"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-5",
    title: "Optimizing Images for Social Media in 2025",
    slug: "optimize-images-social-media-2025",
    excerpt: "Get the perfect image sizes and formats for Instagram, Facebook, Twitter, LinkedIn, and TikTok.",
    category: "web-optimization",
    tags: ["social media", "Instagram", "Facebook", "optimization"],
    read_time: 8,
    published: true
  },
  {
    id: "builtin-6",
    title: "Audio Compression: MP3 vs WAV vs AAC",
    slug: "audio-compression-mp3-wav-aac",
    excerpt: "Compare audio formats and learn which one is best for music, podcasts, and voice recordings.",
    category: "audio-compression",
    tags: ["audio", "MP3", "WAV", "AAC"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-7",
    title: "10 Website Speed Tips Using Image Optimization",
    slug: "website-speed-image-optimization-tips",
    excerpt: "Practical tips to dramatically improve your website loading speed through smart image optimization.",
    category: "web-optimization",
    tags: ["performance", "speed", "SEO", "Core Web Vitals"],
    read_time: 8,
    published: true
  },
  {
    id: "builtin-8",
    title: "GIF Optimization: Reduce Size Without Losing Animation",
    slug: "gif-optimization-reduce-size",
    excerpt: "Learn how to compress animated GIFs while keeping them smooth and vibrant.",
    category: "image-compression",
    tags: ["GIF", "animation", "optimization"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-9",
    title: "What is WebP and Why Should You Use It?",
    slug: "what-is-webp-why-use-it",
    excerpt: "Discover the modern image format that's revolutionizing web performance.",
    category: "file-formats",
    tags: ["WebP", "Google", "modern formats"],
    read_time: 5,
    published: true
  },
  {
    id: "builtin-10",
    title: "Video Codec Explained: H.264, H.265, VP9, AV1",
    slug: "video-codecs-explained",
    excerpt: "Understand video codecs and how they affect quality, file size, and compatibility.",
    category: "video-compression",
    tags: ["codecs", "H.264", "H.265", "VP9", "AV1"],
    read_time: 11,
    published: true
  },
  {
    id: "builtin-11",
    title: "Browser-Based vs Server-Side Compression",
    slug: "browser-vs-server-compression",
    excerpt: "Compare the pros and cons of client-side and server-side file processing approaches.",
    category: "tutorials",
    tags: ["privacy", "browser", "processing"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-12",
    title: "How to Choose the Right Compression Quality",
    slug: "choose-right-compression-quality",
    excerpt: "Find the sweet spot between file size and visual quality for your specific needs.",
    category: "tips-tricks",
    tags: ["quality", "settings", "optimization"],
    read_time: 5,
    published: true
  },
  {
    id: "builtin-13",
    title: "PNG Compression: Best Practices for Transparency",
    slug: "png-compression-transparency",
    excerpt: "Master PNG optimization for graphics, logos, and images requiring transparency.",
    category: "image-compression",
    tags: ["PNG", "transparency", "graphics"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-14",
    title: "AVIF: The Next Generation Image Format",
    slug: "avif-next-generation-format",
    excerpt: "Everything you need to know about AVIF and its impressive compression capabilities.",
    category: "file-formats",
    tags: ["AVIF", "AV1", "next-gen"],
    read_time: 8,
    published: true
  },
  {
    id: "builtin-15",
    title: "Batch Processing: Compress Multiple Files Efficiently",
    slug: "batch-processing-multiple-files",
    excerpt: "Learn how to optimize your workflow by processing multiple files at once.",
    category: "tutorials",
    tags: ["batch", "workflow", "efficiency"],
    read_time: 5,
    published: true
  },
  {
    id: "builtin-16",
    title: "Image SEO: Alt Text, File Names, and Optimization",
    slug: "image-seo-alt-text-optimization",
    excerpt: "Improve your search rankings with properly optimized images and metadata.",
    category: "web-optimization",
    tags: ["SEO", "alt text", "metadata"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-17",
    title: "How AI Upscaling Works",
    slug: "how-ai-upscaling-works",
    excerpt: "Understand the technology behind AI-powered image enhancement and when to use it.",
    category: "tutorials",
    tags: ["AI", "upscaling", "machine learning"],
    read_time: 8,
    published: true
  },
  {
    id: "builtin-18",
    title: "Compressing Screenshots: Best Formats and Settings",
    slug: "compressing-screenshots-best-formats",
    excerpt: "The optimal approach for compressing screenshots while keeping text sharp and readable.",
    category: "tips-tricks",
    tags: ["screenshots", "PNG", "text"],
    read_time: 5,
    published: true
  },
  {
    id: "builtin-19",
    title: "E-commerce Image Optimization Guide",
    slug: "ecommerce-image-optimization",
    excerpt: "Optimize product images for faster load times and better conversion rates.",
    category: "web-optimization",
    tags: ["e-commerce", "products", "conversion"],
    read_time: 9,
    published: true
  },
  {
    id: "builtin-20",
    title: "Audio for Podcasts: Compression and Quality",
    slug: "audio-podcasts-compression-quality",
    excerpt: "Best practices for compressing podcast audio to balance file size and listening experience.",
    category: "audio-compression",
    tags: ["podcasts", "audio", "voice"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-21",
    title: "Video for Email: Size Limits and Best Practices",
    slug: "video-for-email-size-limits",
    excerpt: "How to compress videos small enough for email while maintaining watchability.",
    category: "video-compression",
    tags: ["email", "small files", "sharing"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-22",
    title: "Core Web Vitals and Image Optimization",
    slug: "core-web-vitals-image-optimization",
    excerpt: "How image optimization directly impacts your Google Core Web Vitals scores.",
    category: "web-optimization",
    tags: ["Core Web Vitals", "Google", "LCP", "CLS"],
    read_time: 8,
    published: true
  },
  {
    id: "builtin-23",
    title: "Responsive Images: srcset and sizes Explained",
    slug: "responsive-images-srcset-sizes",
    excerpt: "Serve the right image size to every device for optimal performance.",
    category: "tutorials",
    tags: ["responsive", "srcset", "mobile"],
    read_time: 9,
    published: true
  },
  {
    id: "builtin-24",
    title: "Converting Between Audio Formats",
    slug: "converting-audio-formats",
    excerpt: "A guide to converting between MP3, WAV, AAC, and other audio formats.",
    category: "audio-compression",
    tags: ["conversion", "formats", "audio"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-25",
    title: "Privacy-First File Processing: Why It Matters",
    slug: "privacy-first-file-processing",
    excerpt: "Understanding the importance of local, browser-based file processing for data security.",
    category: "tutorials",
    tags: ["privacy", "security", "local processing"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-26",
    title: "Understanding Color Profiles: sRGB, Adobe RGB, and Display P3",
    slug: "understanding-color-profiles",
    excerpt: "Learn about color spaces and when to use each for web, print, and professional work.",
    category: "tutorials",
    tags: ["color", "sRGB", "Adobe RGB", "Display P3"],
    read_time: 8,
    published: true
  },
  {
    id: "builtin-27",
    title: "How to Reduce Video File Size for YouTube",
    slug: "reduce-video-size-youtube",
    excerpt: "Optimal settings for uploading videos to YouTube without quality loss or long processing times.",
    category: "video-compression",
    tags: ["YouTube", "upload", "video settings"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-28",
    title: "Image Optimization for WordPress Sites",
    slug: "image-optimization-wordpress",
    excerpt: "Complete guide to optimizing images on WordPress for better performance and SEO.",
    category: "web-optimization",
    tags: ["WordPress", "CMS", "plugins"],
    read_time: 10,
    published: true
  },
  {
    id: "builtin-29",
    title: "What is Bit Depth and Why Does It Matter?",
    slug: "bit-depth-explained",
    excerpt: "Understanding 8-bit vs 16-bit images and when higher bit depth is worth the larger file size.",
    category: "tutorials",
    tags: ["bit depth", "color", "quality"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-30",
    title: "Mobile Image Optimization: Best Practices",
    slug: "mobile-image-optimization",
    excerpt: "Optimize images specifically for mobile devices to improve load times and user experience.",
    category: "web-optimization",
    tags: ["mobile", "responsive", "performance"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-31",
    title: "Lossless vs Lossy Audio: When to Use Each",
    slug: "lossless-vs-lossy-audio",
    excerpt: "Detailed comparison of audio compression methods and their ideal use cases.",
    category: "audio-compression",
    tags: ["lossless", "lossy", "FLAC", "MP3"],
    read_time: 8,
    published: true
  },
  {
    id: "builtin-32",
    title: "How to Compress 4K Video Without Losing Quality",
    slug: "compress-4k-video",
    excerpt: "Tips for handling high-resolution video files while maintaining stunning visual quality.",
    category: "video-compression",
    tags: ["4K", "UHD", "high resolution"],
    read_time: 9,
    published: true
  },
  {
    id: "builtin-33",
    title: "Understanding EXIF Data: What It Is and How to Remove It",
    slug: "exif-data-explained",
    excerpt: "Learn what metadata your photos contain and why you might want to strip it for privacy.",
    category: "tips-tricks",
    tags: ["EXIF", "metadata", "privacy"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-34",
    title: "SVG vs PNG: When to Use Vector Graphics",
    slug: "svg-vs-png-comparison",
    excerpt: "Compare vector and raster formats to choose the best option for logos, icons, and graphics.",
    category: "file-formats",
    tags: ["SVG", "PNG", "vector", "graphics"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-35",
    title: "How WebAssembly Enables Browser-Based Compression",
    slug: "webassembly-browser-compression",
    excerpt: "The technology behind fast, private file processing directly in your web browser.",
    category: "tutorials",
    tags: ["WebAssembly", "browser", "technology"],
    read_time: 8,
    published: true
  },
  {
    id: "builtin-36",
    title: "Optimizing Product Photos for Amazon and eBay",
    slug: "product-photos-amazon-ebay",
    excerpt: "Requirements and best practices for e-commerce marketplace product images.",
    category: "web-optimization",
    tags: ["Amazon", "eBay", "e-commerce", "marketplace"],
    read_time: 8,
    published: true
  },
  {
    id: "builtin-37",
    title: "Video Bitrate Guide: Finding the Right Settings",
    slug: "video-bitrate-guide",
    excerpt: "How to choose the optimal bitrate for different video resolutions and use cases.",
    category: "video-compression",
    tags: ["bitrate", "settings", "quality"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-38",
    title: "Image Compression for Email: Size Limits by Provider",
    slug: "image-compression-email",
    excerpt: "Navigate attachment size limits for Gmail, Outlook, Yahoo, and other email providers.",
    category: "tips-tricks",
    tags: ["email", "attachments", "size limits"],
    read_time: 5,
    published: true
  },
  {
    id: "builtin-39",
    title: "HDR Images: What They Are and How to Optimize Them",
    slug: "hdr-images-optimization",
    excerpt: "Everything you need to know about High Dynamic Range images and their compression.",
    category: "image-compression",
    tags: ["HDR", "dynamic range", "modern formats"],
    read_time: 9,
    published: true
  },
  {
    id: "builtin-40",
    title: "Audio Normalization: Consistent Volume Across Files",
    slug: "audio-normalization-guide",
    excerpt: "How to ensure consistent audio levels when compressing multiple audio files.",
    category: "audio-compression",
    tags: ["normalization", "volume", "consistency"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-41",
    title: "Lazy Loading Images: Implementation Guide",
    slug: "lazy-loading-images-guide",
    excerpt: "Step-by-step guide to implementing lazy loading for better page performance.",
    category: "web-optimization",
    tags: ["lazy loading", "performance", "JavaScript"],
    read_time: 8,
    published: true
  },
  {
    id: "builtin-42",
    title: "Converting GIF to MP4: Why and How",
    slug: "converting-gif-to-mp4",
    excerpt: "Reduce file sizes by up to 90% by converting animated GIFs to video format.",
    category: "file-formats",
    tags: ["GIF", "MP4", "conversion", "animation"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-43",
    title: "Image Sprites: Combining Multiple Images",
    slug: "image-sprites-guide",
    excerpt: "Reduce HTTP requests by combining multiple images into a single sprite sheet.",
    category: "web-optimization",
    tags: ["sprites", "CSS", "HTTP requests"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-44",
    title: "Compression Artifacts: Types and How to Avoid Them",
    slug: "compression-artifacts-guide",
    excerpt: "Identify and prevent common compression artifacts like blocking, ringing, and banding.",
    category: "tips-tricks",
    tags: ["artifacts", "quality", "troubleshooting"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-45",
    title: "HEIF Format: Apple's Modern Image Format",
    slug: "heif-format-explained",
    excerpt: "Understanding HEIF/HEIC files from iPhones and how to convert them for wider use.",
    category: "file-formats",
    tags: ["HEIF", "HEIC", "Apple", "iPhone"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-46",
    title: "Optimizing Images for Retina Displays",
    slug: "retina-display-optimization",
    excerpt: "Best practices for serving crisp images on high-DPI screens without huge file sizes.",
    category: "web-optimization",
    tags: ["Retina", "HiDPI", "responsive"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-47",
    title: "Audio Sample Rate: 44.1kHz vs 48kHz vs 96kHz",
    slug: "audio-sample-rate-comparison",
    excerpt: "When to use different sample rates and their impact on quality and file size.",
    category: "audio-compression",
    tags: ["sample rate", "audio quality", "settings"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-48",
    title: "Thumbnail Generation: Best Practices",
    slug: "thumbnail-generation-guide",
    excerpt: "Create optimized thumbnails for galleries, videos, and content previews.",
    category: "image-compression",
    tags: ["thumbnails", "galleries", "preview"],
    read_time: 5,
    published: true
  },
  {
    id: "builtin-49",
    title: "Progressive JPEG vs Baseline JPEG",
    slug: "progressive-vs-baseline-jpeg",
    excerpt: "Compare loading behaviors and when to use each JPEG encoding method.",
    category: "file-formats",
    tags: ["JPEG", "progressive", "encoding"],
    read_time: 5,
    published: true
  },
  {
    id: "builtin-50",
    title: "Complete Guide to Video Container Formats",
    slug: "video-container-formats-guide",
    excerpt: "MP4, MKV, WebM, AVI: Understanding the differences between video containers.",
    category: "file-formats",
    tags: ["containers", "MP4", "MKV", "WebM"],
    read_time: 9,
    published: true
  },
  {
    id: "builtin-51",
    title: "Image Optimization for Shopify Stores",
    slug: "image-optimization-shopify",
    excerpt: "Complete guide to optimizing product images for Shopify to improve loading speed and conversions.",
    category: "web-optimization",
    tags: ["Shopify", "e-commerce", "product images"],
    read_time: 8,
    published: true
  },
  {
    id: "builtin-52",
    title: "Understanding Video Resolution: 720p to 8K",
    slug: "video-resolution-guide",
    excerpt: "Everything you need to know about video resolutions and when to use each.",
    category: "video-compression",
    tags: ["resolution", "720p", "1080p", "4K", "8K"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-53",
    title: "Opus Audio Format: The Ultimate Guide",
    slug: "opus-audio-format-guide",
    excerpt: "Learn about the Opus codec that outperforms MP3 and AAC for voice and music.",
    category: "audio-compression",
    tags: ["Opus", "codec", "voice", "music"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-54",
    title: "Image Optimization for Next.js Applications",
    slug: "image-optimization-nextjs",
    excerpt: "Best practices for handling images in Next.js with automatic optimization.",
    category: "web-optimization",
    tags: ["Next.js", "React", "web development"],
    read_time: 9,
    published: true
  },
  {
    id: "builtin-55",
    title: "Color Banding: Causes and Solutions",
    slug: "color-banding-solutions",
    excerpt: "How to identify and fix color banding issues in compressed images and videos.",
    category: "tips-tricks",
    tags: ["banding", "gradients", "quality"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-56",
    title: "Screen Recording Compression Tips",
    slug: "screen-recording-compression",
    excerpt: "Optimize screen recordings for tutorials and presentations without losing clarity.",
    category: "video-compression",
    tags: ["screen recording", "tutorials", "presentations"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-57",
    title: "Instagram Reels: Optimal Video Settings",
    slug: "instagram-reels-video-settings",
    excerpt: "Get the best quality for your Instagram Reels with optimal compression settings.",
    category: "video-compression",
    tags: ["Instagram", "Reels", "social media"],
    read_time: 5,
    published: true
  },
  {
    id: "builtin-58",
    title: "Bulk Image Resizing Strategies",
    slug: "bulk-image-resizing-strategies",
    excerpt: "Efficient methods for resizing hundreds of images while maintaining quality.",
    category: "tips-tricks",
    tags: ["batch", "resize", "workflow"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-59",
    title: "WebM vs MP4: Which Format Should You Choose?",
    slug: "webm-vs-mp4-comparison",
    excerpt: "Compare WebM and MP4 video formats for web delivery and browser compatibility.",
    category: "file-formats",
    tags: ["WebM", "MP4", "video formats"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-60",
    title: "Image CDN Best Practices",
    slug: "image-cdn-best-practices",
    excerpt: "How to use CDNs effectively for image delivery and optimization.",
    category: "web-optimization",
    tags: ["CDN", "delivery", "performance"],
    read_time: 8,
    published: true
  },
  {
    id: "builtin-61",
    title: "RAW Image Processing for Beginners",
    slug: "raw-image-processing-beginners",
    excerpt: "Understanding RAW files and how to convert them to web-friendly formats.",
    category: "image-compression",
    tags: ["RAW", "photography", "conversion"],
    read_time: 9,
    published: true
  },
  {
    id: "builtin-62",
    title: "Audio Bitrate Guide: From 128kbps to Lossless",
    slug: "audio-bitrate-guide",
    excerpt: "Choose the right audio bitrate for music, podcasts, and voice recordings.",
    category: "audio-compression",
    tags: ["bitrate", "quality", "MP3"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-63",
    title: "Video Streaming Optimization Tips",
    slug: "video-streaming-optimization",
    excerpt: "Prepare videos for smooth streaming on websites and platforms.",
    category: "video-compression",
    tags: ["streaming", "buffering", "adaptive"],
    read_time: 8,
    published: true
  },
  {
    id: "builtin-64",
    title: "TIFF vs PNG: When to Use Each Format",
    slug: "tiff-vs-png-comparison",
    excerpt: "Compare TIFF and PNG for professional and web use cases.",
    category: "file-formats",
    tags: ["TIFF", "PNG", "professional"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-65",
    title: "Optimizing Background Videos for Websites",
    slug: "background-videos-optimization",
    excerpt: "Create lightweight background videos that don't slow down your site.",
    category: "video-compression",
    tags: ["background", "hero", "web design"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-66",
    title: "Image Compression for Game Development",
    slug: "image-compression-game-development",
    excerpt: "Optimize textures and sprites for faster game loading and performance.",
    category: "image-compression",
    tags: ["gaming", "textures", "sprites"],
    read_time: 10,
    published: true
  },
  {
    id: "builtin-67",
    title: "Understanding DPI and PPI for Digital Images",
    slug: "dpi-ppi-digital-images",
    excerpt: "Learn the difference between DPI and PPI and when each matters.",
    category: "tutorials",
    tags: ["DPI", "PPI", "resolution", "print"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-68",
    title: "Compressing Medical Images: Best Practices",
    slug: "compressing-medical-images",
    excerpt: "Special considerations for compressing DICOM and medical imaging files.",
    category: "image-compression",
    tags: ["medical", "DICOM", "healthcare"],
    read_time: 8,
    published: true
  },
  {
    id: "builtin-69",
    title: "Audio for Video: Syncing and Compression",
    slug: "audio-video-syncing-compression",
    excerpt: "Best practices for audio tracks in video files to maintain sync and quality.",
    category: "audio-compression",
    tags: ["video", "sync", "AAC"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-70",
    title: "Creating Optimized Favicons and App Icons",
    slug: "optimized-favicons-app-icons",
    excerpt: "Generate properly sized and compressed icons for all platforms.",
    category: "web-optimization",
    tags: ["favicon", "icons", "PWA"],
    read_time: 5,
    published: true
  },
  {
    id: "builtin-71",
    title: "Video Compression for Discord",
    slug: "video-compression-discord",
    excerpt: "Compress videos to meet Discord's 25MB file limit while keeping quality.",
    category: "video-compression",
    tags: ["Discord", "sharing", "file limit"],
    read_time: 5,
    published: true
  },
  {
    id: "builtin-72",
    title: "Understanding Image Histograms",
    slug: "understanding-image-histograms",
    excerpt: "Read histograms to analyze and improve image exposure before compression.",
    category: "tutorials",
    tags: ["histogram", "exposure", "analysis"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-73",
    title: "Podcast Audio: Recording to Publishing",
    slug: "podcast-audio-recording-publishing",
    excerpt: "Complete workflow for podcast audio from recording to optimized distribution.",
    category: "audio-compression",
    tags: ["podcast", "recording", "publishing"],
    read_time: 11,
    published: true
  },
  {
    id: "builtin-74",
    title: "Image Optimization for Email Marketing",
    slug: "image-optimization-email-marketing",
    excerpt: "Create fast-loading images that display correctly across email clients.",
    category: "web-optimization",
    tags: ["email", "marketing", "newsletters"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-75",
    title: "H.266/VVC: The Next Video Codec",
    slug: "h266-vvc-next-video-codec",
    excerpt: "Preview the upcoming H.266 codec and what it means for video compression.",
    category: "file-formats",
    tags: ["H.266", "VVC", "future"],
    read_time: 8,
    published: true
  },
  {
    id: "builtin-76",
    title: "Compressing Animated Stickers and Emojis",
    slug: "compressing-animated-stickers",
    excerpt: "Optimize animated stickers for messaging apps and social platforms.",
    category: "image-compression",
    tags: ["stickers", "emoji", "animation"],
    read_time: 5,
    published: true
  },
  {
    id: "builtin-77",
    title: "Video SEO: Optimizing for Search Engines",
    slug: "video-seo-optimization",
    excerpt: "Make your videos discoverable with proper metadata and compression.",
    category: "web-optimization",
    tags: ["SEO", "video", "metadata"],
    read_time: 8,
    published: true
  },
  {
    id: "builtin-78",
    title: "Audio Restoration Before Compression",
    slug: "audio-restoration-before-compression",
    excerpt: "Clean up audio files before compression for better final quality.",
    category: "audio-compression",
    tags: ["restoration", "noise", "cleanup"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-79",
    title: "Print vs Web Image Optimization",
    slug: "print-vs-web-image-optimization",
    excerpt: "Different requirements and best practices for print and web images.",
    category: "tutorials",
    tags: ["print", "web", "CMYK", "RGB"],
    read_time: 8,
    published: true
  },
  {
    id: "builtin-80",
    title: "Compressing 360° and VR Videos",
    slug: "compressing-360-vr-videos",
    excerpt: "Special considerations for immersive video formats.",
    category: "video-compression",
    tags: ["360", "VR", "immersive"],
    read_time: 9,
    published: true
  },
  {
    id: "builtin-81",
    title: "Image Compression for Photographers",
    slug: "image-compression-photographers",
    excerpt: "Professional workflow for photographers delivering optimized images.",
    category: "image-compression",
    tags: ["photography", "professional", "workflow"],
    read_time: 10,
    published: true
  },
  {
    id: "builtin-82",
    title: "Understanding Audio Channels: Mono, Stereo, Surround",
    slug: "audio-channels-mono-stereo-surround",
    excerpt: "When to use different audio channel configurations and their file size impact.",
    category: "audio-compression",
    tags: ["stereo", "mono", "surround", "5.1"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-83",
    title: "Optimizing Product 360° Spin Images",
    slug: "product-360-spin-images",
    excerpt: "Create smooth, fast-loading 360° product views for e-commerce.",
    category: "web-optimization",
    tags: ["e-commerce", "360", "product"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-84",
    title: "FLAC vs ALAC: Lossless Audio Showdown",
    slug: "flac-vs-alac-comparison",
    excerpt: "Compare the two major lossless audio formats for quality and compatibility.",
    category: "file-formats",
    tags: ["FLAC", "ALAC", "lossless"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-85",
    title: "Optimizing Images for Dark Mode",
    slug: "optimizing-images-dark-mode",
    excerpt: "Ensure your images look great in both light and dark modes.",
    category: "web-optimization",
    tags: ["dark mode", "design", "accessibility"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-86",
    title: "Video Compression for Online Courses",
    slug: "video-compression-online-courses",
    excerpt: "Optimize educational videos for LMS platforms and online learning.",
    category: "video-compression",
    tags: ["education", "LMS", "courses"],
    read_time: 8,
    published: true
  },
  {
    id: "builtin-87",
    title: "Understanding JPEG Quality Levels",
    slug: "jpeg-quality-levels-explained",
    excerpt: "What actually happens at each JPEG quality setting from 1-100.",
    category: "tutorials",
    tags: ["JPEG", "quality", "compression"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-88",
    title: "Audio Compression for Mobile Games",
    slug: "audio-compression-mobile-games",
    excerpt: "Balance audio quality and file size for mobile game development.",
    category: "audio-compression",
    tags: ["gaming", "mobile", "sound effects"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-89",
    title: "Creating Web-Optimized Infographics",
    slug: "web-optimized-infographics",
    excerpt: "Design and export infographics that load fast without losing clarity.",
    category: "image-compression",
    tags: ["infographics", "design", "graphics"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-90",
    title: "Video Encoding Presets Explained",
    slug: "video-encoding-presets-explained",
    excerpt: "Understand ultrafast, medium, slow presets and when to use each.",
    category: "tutorials",
    tags: ["encoding", "presets", "speed"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-91",
    title: "Optimizing OG Images for Social Sharing",
    slug: "og-images-social-sharing",
    excerpt: "Create perfect Open Graph images that display correctly everywhere.",
    category: "web-optimization",
    tags: ["Open Graph", "social", "meta"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-92",
    title: "Lossless Image Rotation and Cropping",
    slug: "lossless-rotation-cropping",
    excerpt: "Edit JPEG images without recompression quality loss.",
    category: "tips-tricks",
    tags: ["lossless", "editing", "JPEG"],
    read_time: 5,
    published: true
  },
  {
    id: "builtin-93",
    title: "Audio Formats for Audiobooks",
    slug: "audio-formats-audiobooks",
    excerpt: "Best formats and settings for distributing audiobook content.",
    category: "audio-compression",
    tags: ["audiobooks", "M4B", "chapters"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-94",
    title: "Optimizing Images for Notion and Docs",
    slug: "images-notion-google-docs",
    excerpt: "Best practices for embedding images in documentation tools.",
    category: "web-optimization",
    tags: ["Notion", "Google Docs", "documentation"],
    read_time: 5,
    published: true
  },
  {
    id: "builtin-95",
    title: "Video Compression for Webinars",
    slug: "video-compression-webinars",
    excerpt: "Optimize recorded webinars for sharing and archiving.",
    category: "video-compression",
    tags: ["webinar", "recording", "sharing"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-96",
    title: "Understanding PNG Compression Levels",
    slug: "png-compression-levels",
    excerpt: "How PNG compression works and optimal settings for different use cases.",
    category: "tutorials",
    tags: ["PNG", "compression", "levels"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-97",
    title: "Audio Compression for Voice Assistants",
    slug: "audio-compression-voice-assistants",
    excerpt: "Optimize audio for Alexa Skills, Google Actions, and voice apps.",
    category: "audio-compression",
    tags: ["Alexa", "Google", "voice"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-98",
    title: "Creating Lightweight Hero Images",
    slug: "lightweight-hero-images",
    excerpt: "Design impactful hero sections without sacrificing page speed.",
    category: "web-optimization",
    tags: ["hero", "landing page", "performance"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-99",
    title: "Video Thumbnails: Creation and Optimization",
    slug: "video-thumbnails-creation-optimization",
    excerpt: "Create eye-catching thumbnails that are optimized for all platforms.",
    category: "video-compression",
    tags: ["thumbnails", "YouTube", "click-through"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-100",
    title: "Batch Converting Image Formats",
    slug: "batch-converting-image-formats",
    excerpt: "Efficiently convert hundreds of images between formats at once.",
    category: "tips-tricks",
    tags: ["batch", "conversion", "workflow"],
    read_time: 5,
    published: true
  },
  {
    id: "builtin-101",
    title: "Audio Loudness Standards: LUFS Explained",
    slug: "audio-loudness-lufs-explained",
    excerpt: "Meet platform loudness requirements for Spotify, YouTube, and more.",
    category: "audio-compression",
    tags: ["LUFS", "loudness", "standards"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-102",
    title: "Image Optimization for AR Filters",
    slug: "image-optimization-ar-filters",
    excerpt: "Create lightweight assets for Instagram, Snapchat, and TikTok AR effects.",
    category: "image-compression",
    tags: ["AR", "filters", "social media"],
    read_time: 7,
    published: true
  },
  {
    id: "builtin-103",
    title: "Understanding Video Timecodes",
    slug: "understanding-video-timecodes",
    excerpt: "How timecodes work and why they matter for video editing and compression.",
    category: "tutorials",
    tags: ["timecode", "editing", "professional"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-104",
    title: "Optimizing Images for Pinterest",
    slug: "optimizing-images-pinterest",
    excerpt: "Pinterest-specific image optimization for maximum engagement.",
    category: "web-optimization",
    tags: ["Pinterest", "social media", "pins"],
    read_time: 6,
    published: true
  },
  {
    id: "builtin-105",
    title: "Video Compression Myths Debunked",
    slug: "video-compression-myths-debunked",
    excerpt: "Common misconceptions about video compression and the truth behind them.",
    category: "tips-tricks",
    tags: ["myths", "facts", "video"],
    read_time: 7,
    published: true
  }
];

const categoryColors = {
  "image-compression": "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400",
  "video-compression": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  "audio-compression": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  "file-formats": "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  "web-optimization": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  "tutorials": "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400",
  "tips-tricks": "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
};

function ArticleCard({ article }) {
  return (
    <Link 
      to={createPageUrl(`BlogArticle?slug=${article.slug}`)}
      className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all hover:border-emerald-500 dark:hover:border-emerald-500"
    >
      {article.featured_image && (
        <div className="aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img 
            src={article.featured_image} 
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", categoryColors[article.category])}>
            {categoryLabels[article.category]}
          </span>
          {article.read_time && (
            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-3 h-3" />
              {article.read_time} min read
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
          {article.excerpt}
        </p>
        <span className="inline-flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 group-hover:gap-2 transition-all">
          Read more <ArrowRight className="w-4 h-4 ml-1" />
        </span>
      </div>
    </Link>
  );
}

function ArticleCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <Skeleton className="aspect-video" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [displayCount, setDisplayCount] = useState(12);

  const { data: dbArticles = [], isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: () => base44.entities.Article.filter({ published: true }, '-created_date', 100),
  });

  // Combine database articles with built-in articles
  const articles = [...dbArticles, ...builtInArticles];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = activeCategory === "all" || article.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const displayedArticles = filteredArticles.slice(0, displayCount);
  const hasMore = filteredArticles.length > displayCount;

  const categories = ["all", ...Object.keys(categoryLabels)];

  return (
    <>
      <SEOHead 
        title="Blog - File Optimized | Tips, Tutorials & Guides"
        description="Learn about image compression, video optimization, file formats, and web performance. Expert tips and tutorials to help you optimize your media files."
      />
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Blog & Resources
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Tips, tutorials, and guides to help you optimize your media files
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
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
              {cat === "all" ? "All Articles" : categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <ArticleCardSkeleton key={i} />)}
          </div>
        ) : displayedArticles.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setDisplayCount(prev => prev + 12)}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Load More Articles ({filteredArticles.length - displayCount} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No articles found</h3>
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery ? "Try a different search term" : "Check back soon for new content!"}
            </p>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-emerald-100 mb-6 max-w-xl mx-auto">
            Join our Discord community to get the latest tips, updates, and connect with other users.
          </p>
          <a 
            href="https://discord.gg/gRJesCUYz9"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
          >
            Join Discord Community
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </>
  );
}