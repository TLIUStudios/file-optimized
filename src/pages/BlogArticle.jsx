import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { ArrowLeft, Clock, Calendar, Tag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
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

// Built-in article content
const builtInArticleContent = {
  "ultimate-guide-image-compression-web": {
    title: "The Ultimate Guide to Image Compression for Web",
    content: `## Why Image Compression Matters for the Web

Images typically account for 50-75% of a webpage's total weight. Optimizing them is the single most impactful thing you can do to speed up your site and improve user experience.

## Understanding Image Compression

Image compression reduces file size by removing redundant or less important data. There are two main types:

### Lossy Compression
Permanently removes some image data to achieve smaller files. Best for photographs where minor quality loss is acceptable. JPEG uses lossy compression.

### Lossless Compression
Reduces file size without losing any data. The original can be perfectly reconstructed. PNG uses lossless compression for graphics.

## Choosing the Right Format

| Format | Best For | Compression | Transparency |
|--------|----------|-------------|--------------|
| JPEG | Photos | Lossy | No |
| PNG | Graphics, Screenshots | Lossless | Yes |
| WebP | Web images | Both | Yes |
| AVIF | Maximum compression | Both | Yes |

## Quality Settings Explained

The quality slider (1-100) controls the compression level:

- **90-100%**: Near-lossless, minimal savings
- **75-85%**: Optimal balance for web (recommended)
- **50-70%**: Noticeable quality loss, significant savings
- **Below 50%**: Only for thumbnails or previews

## Best Practices

1. **Resize before compressing** - Don't compress a 4000px image for a 800px display
2. **Use WebP when possible** - 25-35% smaller than JPEG
3. **Strip metadata** - Remove EXIF data for smaller files
4. **Lazy load images** - Only load images when needed
5. **Serve responsive images** - Use srcset for different screen sizes

## Tools and Implementation

File Optimized makes compression easy with browser-based processing. Your files never leave your device, ensuring complete privacy while achieving excellent compression ratios.

## Conclusion

Effective image compression is essential for modern web development. By understanding formats, quality settings, and best practices, you can dramatically reduce page load times while maintaining visual quality.`,
    category: "image-compression",
    read_time: 12,
    tags: ["web performance", "SEO", "compression"]
  },
  "jpeg-png-webp-avif-comparison": {
    title: "JPEG vs PNG vs WebP vs AVIF: Complete Format Comparison",
    content: `## The Image Format Landscape

Choosing the right image format can make a significant difference in both file size and quality. Let's compare the four most important formats for the web.

## JPEG: The Universal Standard

**Best for:** Photographs, complex images with gradients

**Pros:**
- Excellent compression for photos (typically 10:1)
- Universal browser and software support
- Adjustable quality levels

**Cons:**
- No transparency support
- Lossy only - quality degrades with each edit
- Compression artifacts on sharp edges

**When to use:** Photos for web, social media, email attachments

## PNG: Perfect for Graphics

**Best for:** Logos, graphics, screenshots, images with transparency

**Pros:**
- Lossless compression preserves quality
- Full alpha channel transparency
- Perfect for sharp edges and text

**Cons:**
- Larger file sizes than JPEG for photos
- No native animation (use APNG or GIF)

**When to use:** Logos, icons, screenshots, graphics with text

## WebP: The Modern Choice

**Best for:** Web images where size matters

**Pros:**
- 25-35% smaller than JPEG at equal quality
- Supports both lossy and lossless compression
- Transparency and animation support

**Cons:**
- Not supported in very old browsers
- Less editing software support than JPEG/PNG

**When to use:** Primary format for modern websites

## AVIF: The Future

**Best for:** Maximum compression with excellent quality

**Pros:**
- 50% smaller than JPEG
- Superior color accuracy (HDR, wide gamut)
- Supports both lossy and lossless

**Cons:**
- Limited browser support (growing)
- Slower encoding/decoding
- Newer - less tool support

**When to use:** When targeting modern browsers and maximum performance

## File Size Comparison

For the same 1920x1080 photograph at similar quality:

| Format | File Size | Reduction |
|--------|-----------|-----------|
| JPEG | 350 KB | Baseline |
| PNG | 2.5 MB | +614% |
| WebP | 250 KB | -29% |
| AVIF | 175 KB | -50% |

## Recommendation

For most web projects in 2024:
1. **Primary:** WebP for all images
2. **Fallback:** JPEG for photos, PNG for graphics
3. **Future-proof:** AVIF where supported`,
    category: "file-formats",
    read_time: 10,
    tags: ["JPEG", "PNG", "WebP", "AVIF", "formats"]
  },
  "compress-videos-without-losing-quality": {
    title: "How to Compress Videos Without Losing Quality",
    content: `## The Video Compression Challenge

Video files are massive. A single minute of 4K footage can exceed 500MB. Compression is essential, but how do you shrink files without ruining quality?

## Understanding Video Compression

Videos are compressed using **codecs** (compressor-decompressor algorithms). The codec determines:
- How much the file can be compressed
- Quality at a given file size
- Compatibility with devices/platforms

## Popular Video Codecs

### H.264 (AVC)
The most widely supported codec. Works on virtually everything.
- **Efficiency:** Good
- **Compatibility:** Excellent
- **Best for:** Maximum compatibility

### H.265 (HEVC)
50% more efficient than H.264, but with licensing costs.
- **Efficiency:** Very Good
- **Compatibility:** Good (modern devices)
- **Best for:** High quality at smaller sizes

### VP9
Google's open-source alternative to H.265.
- **Efficiency:** Very Good
- **Compatibility:** Good (web-focused)
- **Best for:** YouTube, web video

### AV1
The newest, most efficient codec.
- **Efficiency:** Excellent
- **Compatibility:** Growing
- **Best for:** Future-proof, streaming

## Key Compression Settings

### Bitrate
Controls data per second. Higher = better quality, larger file.

| Use Case | Recommended Bitrate |
|----------|---------------------|
| Web/Social | 5-8 Mbps |
| YouTube 1080p | 8-12 Mbps |
| High Quality | 15-25 Mbps |
| Archive | 30+ Mbps |

### Resolution
Don't compress at higher resolution than needed:
- **Mobile:** 720p often sufficient
- **Web:** 1080p standard
- **Quality:** 4K only when necessary

### Frame Rate
- 24fps: Cinematic
- 30fps: Standard video
- 60fps: Smooth motion, gaming

## Tips for Quality Preservation

1. **Use 2-pass encoding** for better quality distribution
2. **Match source resolution** - don't upscale
3. **Keep original frame rate** - don't convert 24fps to 30fps
4. **Use CRF mode** instead of fixed bitrate when possible
5. **Avoid re-compression** - always compress from original

## Conclusion

For most uses, H.264 in MP4 container at 8-12 Mbps provides excellent quality with broad compatibility. Use File Optimized to compress videos easily in your browser.`,
    category: "video-compression",
    read_time: 9,
    tags: ["video", "H.264", "compression", "quality"]
  },
  "lossy-vs-lossless-compression-explained": {
    title: "Understanding Lossy vs Lossless Compression",
    content: `## The Two Fundamental Approaches

All file compression falls into two categories: lossy and lossless. Understanding the difference is crucial for choosing the right method.

## Lossless Compression

**Definition:** Reduces file size without losing any data. The original file can be perfectly reconstructed.

### How It Works
Lossless compression finds patterns in data and represents them more efficiently. For example, "AAAAAABBBB" could be stored as "6A4B".

### Examples
- **Images:** PNG, GIF (palette), TIFF
- **Audio:** FLAC, ALAC, WAV (uncompressed)
- **Archives:** ZIP, 7z, RAR
- **Documents:** PDF (text), DOCX

### Best For
- Source files for editing
- Text and code
- Medical/scientific images
- Archives and backups
- Graphics with sharp edges

## Lossy Compression

**Definition:** Achieves smaller files by permanently removing some data, typically data less perceptible to humans.

### How It Works
Lossy compression analyzes content and removes information humans are less likely to notice. In images, this might be subtle color variations. In audio, frequencies outside normal hearing range.

### Examples
- **Images:** JPEG, WebP (lossy mode), AVIF
- **Audio:** MP3, AAC, OGG
- **Video:** H.264, H.265, VP9

### Best For
- Web images and media
- Streaming content
- Social media sharing
- Email attachments
- Storage-constrained devices

## Comparison

| Aspect | Lossless | Lossy |
|--------|----------|-------|
| Quality | Perfect | Near-perfect to visible |
| File Size | Larger | Much smaller |
| Re-editing | Safe | Quality degrades |
| Best Use | Editing, archives | Distribution |

## The Quality-Size Tradeoff

With lossy compression, you control the tradeoff:
- **High quality (85-95%):** Minimal loss, moderate savings
- **Medium quality (70-84%):** Balanced, good for web
- **Low quality (<70%):** Significant loss, maximum savings

## When to Use Each

**Use Lossless:**
- You'll edit the file again
- Quality is critical (medical, legal)
- File has text or sharp edges
- You have storage space

**Use Lossy:**
- Final delivery (web, social)
- Storage/bandwidth is limited
- Slight quality loss is acceptable
- Photos and video content

## Conclusion

Neither method is "better" - each serves different purposes. For web delivery, lossy compression at 75-85% quality typically provides the best balance.`,
    category: "tutorials",
    read_time: 6,
    tags: ["compression", "lossy", "lossless", "fundamentals"]
  },
  "optimize-images-social-media-2024": {
    title: "Optimizing Images for Social Media in 2024",
    content: `## Why Social Media Image Optimization Matters

Each platform has specific image requirements. Using wrong dimensions results in cropping, quality loss, or slow loading. Here's your complete guide for 2024.

## Instagram

### Feed Posts
- **Square:** 1080 x 1080 px (1:1)
- **Portrait:** 1080 x 1350 px (4:5) - Best engagement
- **Landscape:** 1080 x 566 px (1.91:1)

### Stories & Reels
- **Size:** 1080 x 1920 px (9:16)
- **Safe zone:** Keep text 250px from edges

### Profile Photo
- **Size:** 320 x 320 px (displays as circle)

### Format Tips
- Use JPEG for photos at 80-85% quality
- Avoid heavy text overlays (impacts reach)

## Facebook

### Feed Images
- **Recommended:** 1200 x 630 px
- **Square posts:** 1200 x 1200 px

### Cover Photo
- **Desktop:** 820 x 312 px
- **Mobile:** 640 x 360 px (center important content)

### Profile Photo
- **Size:** 180 x 180 px

### Event Cover
- **Size:** 1920 x 1005 px

## Twitter/X

### In-Stream Images
- **Recommended:** 1200 x 675 px (16:9)
- **Max:** 1200 x 1200 px for square

### Header Photo
- **Size:** 1500 x 500 px

### Profile Photo
- **Size:** 400 x 400 px

## LinkedIn

### Feed Images
- **Recommended:** 1200 x 627 px
- **Square:** 1200 x 1200 px

### Cover Photo
- **Personal:** 1584 x 396 px
- **Company:** 1128 x 191 px

### Profile Photo
- **Size:** 400 x 400 px

## TikTok

### Video Thumbnails
- **Size:** 1080 x 1920 px (9:16)

### Profile Photo
- **Size:** 200 x 200 px

## YouTube

### Thumbnails
- **Size:** 1280 x 720 px (16:9)
- **Min width:** 640 px

### Channel Banner
- **Safe area:** 1546 x 423 px (center)
- **Full size:** 2560 x 1440 px

## General Tips

1. **Always upload highest quality** - platforms compress anyway
2. **Use PNG for graphics with text**
3. **Keep file sizes under 1MB** for faster uploads
4. **Test on mobile** - most users view on phones
5. **Use templates** for consistent branding

## Quick Reference Table

| Platform | Feed Image | Profile |
|----------|------------|---------|
| Instagram | 1080x1350 | 320x320 |
| Facebook | 1200x630 | 180x180 |
| Twitter | 1200x675 | 400x400 |
| LinkedIn | 1200x627 | 400x400 |
| TikTok | 1080x1920 | 200x200 |`,
    category: "web-optimization",
    read_time: 8,
    tags: ["social media", "Instagram", "Facebook", "optimization"]
  }
};

// Add more default content for other slugs
const defaultContent = {
  title: "Article",
  content: `## Coming Soon

This article is being written. Check back soon for comprehensive, helpful content about this topic.

In the meantime, try out File Optimized to compress your images, videos, and audio files for free!`,
  category: "tutorials",
  read_time: 5,
  tags: []
};

export default function BlogArticle() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  const { data: dbArticle, isLoading } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const articles = await base44.entities.Article.filter({ slug, published: true }, '-created_date', 1);
      return articles[0] || null;
    },
    enabled: !!slug
  });

  // Check built-in content if no database article
  const builtInContent = builtInArticleContent[slug];
  const article = dbArticle || (builtInContent ? { ...builtInContent, slug } : null);

  // Fetch related articles
  const { data: relatedArticles = [] } = useQuery({
    queryKey: ['related-articles', article?.category],
    queryFn: () => base44.entities.Article.filter({ category: article?.category, published: true }, '-created_date', 4),
    enabled: !!article?.category
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/4 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Article Not Found</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">The article you're looking for doesn't exist.</p>
        <Link to={createPageUrl('Blog')}>
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  const filtered = relatedArticles.filter(a => a.slug !== slug).slice(0, 3);

  return (
    <>
      <SEOHead 
        title={`${article.title} - File Optimized Blog`}
        description={article.excerpt || article.content?.substring(0, 160)}
      />
      <article className="max-w-4xl mx-auto py-8 px-4">
        {/* Back Link */}
        <Link 
          to={createPageUrl('Blog')}
          className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              {categoryLabels[article.category] || article.category}
            </Badge>
            {article.read_time && (
              <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4" />
                {article.read_time} min read
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-xl text-slate-600 dark:text-slate-400">
              {article.excerpt}
            </p>
          )}

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {article.tags.map((tag, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Featured Image */}
        {article.featured_image && (
          <img 
            src={article.featured_image} 
            alt={article.title}
            className="w-full rounded-xl mb-8 object-cover max-h-96"
          />
        )}

        {/* Content */}
        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>,
              p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              table: ({ children }) => <div className="overflow-x-auto my-6"><table className="min-w-full border-collapse border border-slate-200 dark:border-slate-700">{children}</table></div>,
              th: ({ children }) => <th className="border border-slate-200 dark:border-slate-700 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-left font-semibold">{children}</th>,
              td: ({ children }) => <td className="border border-slate-200 dark:border-slate-700 px-4 py-2">{children}</td>,
              code: ({ inline, children }) => inline ? (
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm">{children}</code>
              ) : (
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto my-4"><code>{children}</code></pre>
              ),
              blockquote: ({ children }) => <blockquote className="border-l-4 border-emerald-500 pl-4 italic my-4">{children}</blockquote>,
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Related Articles */}
        {filtered.length > 0 && (
          <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {filtered.map(related => (
                <Link 
                  key={related.id}
                  to={createPageUrl(`BlogArticle?slug=${related.slug}`)}
                  className="group bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-colors"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 line-clamp-2 mb-2">
                    {related.title}
                  </h3>
                  <span className="text-sm text-emerald-600 flex items-center">
                    Read more <ArrowRight className="w-3 h-3 ml-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to optimize your files?</h2>
          <p className="text-emerald-100 mb-6">
            Try File Optimized free - compress images, videos, and audio without uploading to any server.
          </p>
          <Link to={createPageUrl('Home')}>
            <Button className="bg-white text-emerald-700 hover:bg-emerald-50">
              Start Optimizing Free
            </Button>
          </Link>
        </div>
      </article>
    </>
  );
}