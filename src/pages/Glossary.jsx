import { useState, useMemo } from "react";
import { Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SEOHead from "../components/SEOHead";

const glossaryTerms = [
  {
    term: "AAC",
    definition: "Advanced Audio Coding - A lossy audio compression format that offers better sound quality than MP3 at similar bitrates. Commonly used in iTunes, YouTube, and mobile devices."
  },
  {
    term: "Aliasing",
    definition: "Visual artifacts that appear as jagged or stair-stepped edges on diagonal lines in digital images. Anti-aliasing techniques smooth these edges for a cleaner appearance."
  },
  {
    term: "Alpha Channel",
    definition: "A component of an image that stores transparency information. Each pixel can have varying levels of transparency (0-255), allowing for smooth edges and partial transparency effects."
  },
  {
    term: "Artifact",
    definition: "Unintended visual distortions in compressed images or videos, such as blocky areas, color banding, or mosquito noise. More aggressive compression typically produces more artifacts."
  },
  {
    term: "Aspect Ratio",
    definition: "The proportional relationship between width and height of an image or video. Common ratios include 16:9 (widescreen), 4:3 (standard), 1:1 (square), and 9:16 (vertical/mobile)."
  },
  {
    term: "AVIF",
    definition: "AV1 Image File Format - A modern image format that offers superior compression compared to JPEG and WebP. Developed by the Alliance for Open Media, AVIF supports both lossy and lossless compression, transparency, and HDR."
  },
  {
    term: "Batch Processing",
    definition: "The technique of processing multiple files simultaneously or in sequence using the same settings, saving time compared to handling files individually."
  },
  {
    term: "Bit Depth",
    definition: "The number of bits used to represent each color channel in an image. 8-bit provides 256 levels per channel (16.7 million colors), while 16-bit offers 65,536 levels for smoother gradients."
  },
  {
    term: "Bitrate",
    definition: "The amount of data processed per unit of time in a video or audio file, typically measured in kilobits per second (kbps) or megabits per second (Mbps). Higher bitrate generally means better quality but larger file size."
  },
  {
    term: "BMP",
    definition: "Bitmap Image File - An uncompressed raster image format that preserves exact pixel data. Rarely used on the web due to large file sizes but useful for archival purposes."
  },
  {
    term: "Chroma Subsampling",
    definition: "A compression technique that reduces color information while preserving luminance detail. Expressed as ratios like 4:2:0 (used in most video) or 4:4:4 (full color detail)."
  },
  {
    term: "Client-Side Processing",
    definition: "File processing that occurs in the user's web browser rather than on a remote server. Offers privacy benefits and eliminates upload times but depends on device capabilities."
  },
  {
    term: "Codec",
    definition: "Short for 'compressor-decompressor' - software that encodes and decodes digital media. Examples include H.264 for video and AAC for audio. The codec determines how data is compressed and the resulting quality."
  },
  {
    term: "Color Profile",
    definition: "A set of data describing how colors should be interpreted and displayed. Common profiles include sRGB (web standard), Adobe RGB (print), and Display P3 (modern displays)."
  },
  {
    term: "Color Space",
    definition: "A model that defines the range of colors that can be represented. RGB is used for screens, CMYK for print, and specialized spaces like LAB for color-accurate editing."
  },
  {
    term: "Compression",
    definition: "The process of reducing file size by encoding data more efficiently. Can be lossy (permanently removes some data) or lossless (preserves all original data). Essential for web optimization and storage efficiency."
  },
  {
    term: "Compression Ratio",
    definition: "The ratio between the original and compressed file sizes. A 10:1 ratio means the compressed file is one-tenth the size of the original."
  },
  {
    term: "Container Format",
    definition: "A file format that can hold multiple types of data (video, audio, subtitles, metadata) together. Examples include MP4, MKV, WebM, and AVI."
  },
  {
    term: "Core Web Vitals",
    definition: "Google's metrics for measuring user experience: Largest Contentful Paint (LCP), First Input Delay (FID), and Cumulative Layout Shift (CLS). Image optimization directly impacts LCP scores."
  },
  {
    term: "Cropping",
    definition: "Removing unwanted portions of an image by selecting a specific rectangular area to keep. Does not reduce image resolution within the cropped area."
  },
  {
    term: "DCT",
    definition: "Discrete Cosine Transform - A mathematical technique used in JPEG compression to convert spatial pixel data into frequency components, enabling efficient compression."
  },
  {
    term: "Dithering",
    definition: "A technique that simulates missing colors by arranging available colors in patterns. Used when reducing color depth or converting to formats with limited color palettes like GIF."
  },
  {
    term: "DPI/PPI",
    definition: "Dots Per Inch / Pixels Per Inch - Measures the resolution of an image. Higher DPI means more detail. 72 DPI is standard for web, while 300 DPI is typical for print."
  },
  {
    term: "Encoding",
    definition: "The process of converting raw media data into a compressed format using a specific codec. Quality settings during encoding determine the balance between file size and quality."
  },
  {
    term: "EXIF",
    definition: "Exchangeable Image File Format - Metadata embedded in images containing camera settings, date/time, GPS location, and other information. Can be stripped for privacy and smaller file sizes."
  },
  {
    term: "FLAC",
    definition: "Free Lossless Audio Codec - An audio format that compresses without any quality loss. Files are larger than MP3 but preserve original audio fidelity perfectly."
  },
  {
    term: "Frame",
    definition: "A single still image within a video sequence. Standard video displays 24-60 frames per second to create the illusion of motion."
  },
  {
    term: "Frame Rate",
    definition: "The number of individual frames displayed per second in a video, measured in fps (frames per second). Common rates include 24fps (cinematic), 30fps (standard video), and 60fps (smooth motion)."
  },
  {
    term: "GIF",
    definition: "Graphics Interchange Format - A bitmap image format that supports animation and limited transparency. Uses lossless compression but is limited to 256 colors, making it suitable for simple graphics and short animations."
  },
  {
    term: "GOP",
    definition: "Group of Pictures - In video compression, a sequence of frames consisting of I-frames (keyframes), P-frames (predicted), and B-frames (bidirectional). Longer GOPs improve compression but reduce seek accuracy."
  },
  {
    term: "H.264 (AVC)",
    definition: "Advanced Video Coding - The most widely used video compression standard. Offers excellent compression efficiency and is supported by virtually all devices and platforms. Used in MP4 containers."
  },
  {
    term: "H.265 (HEVC)",
    definition: "High Efficiency Video Coding - A newer video compression standard offering 50% better compression than H.264 at the same quality. Requires more processing power and has licensing considerations."
  },
  {
    term: "HDR",
    definition: "High Dynamic Range - Technology that captures and displays a wider range of brightness levels and colors than standard images, resulting in more realistic and vibrant visuals."
  },
  {
    term: "Histogram",
    definition: "A graph showing the distribution of tones in an image from shadows (left) to highlights (right). Useful for understanding exposure and optimizing image quality."
  },
  {
    term: "I-Frame",
    definition: "Intra-frame or keyframe - A complete image in a video sequence that doesn't reference other frames. Seeking in video typically jumps to I-frames."
  },
  {
    term: "ICC Profile",
    definition: "International Color Consortium Profile - Data that describes how colors should be interpreted to ensure consistent appearance across different devices and software."
  },
  {
    term: "Interpolation",
    definition: "The process of estimating new pixel values when resizing images. Methods include nearest-neighbor (fast, blocky), bilinear (smooth), and bicubic (higher quality)."
  },
  {
    term: "JPEG",
    definition: "Joint Photographic Experts Group - The most common image format for photographs. Uses lossy compression, making it ideal for photos but not for graphics with sharp edges or text."
  },
  {
    term: "JPEG 2000",
    definition: "An improved JPEG standard offering better compression and quality, plus support for lossless compression and transparency. Limited browser support prevents widespread web use."
  },
  {
    term: "JPEG XL",
    definition: "A next-generation image format designed to eventually replace JPEG. Offers superior compression, lossless capability, and can transcode existing JPEGs without quality loss."
  },
  {
    term: "Keyframe",
    definition: "A complete reference frame in video that other frames are built from. More keyframes improve seeking but increase file size."
  },
  {
    term: "Latency",
    definition: "The delay between initiating an action and seeing the result. In file processing, this includes time for encoding, decoding, and data transfer."
  },
  {
    term: "Lazy Loading",
    definition: "A technique that delays loading images until they're about to enter the viewport, improving initial page load time and reducing bandwidth for images never viewed."
  },
  {
    term: "LCH",
    definition: "A color space using Lightness, Chroma (saturation), and Hue. More intuitive for color adjustments than RGB because changes to one value don't unexpectedly affect others."
  },
  {
    term: "Lossless Compression",
    definition: "A compression method that reduces file size without losing any data. The original file can be perfectly reconstructed. Examples include PNG for images and FLAC for audio."
  },
  {
    term: "Lossy Compression",
    definition: "A compression method that achieves smaller file sizes by permanently removing some data. The removed data is typically imperceptible to humans. Examples include JPEG for images and MP3 for audio."
  },
  {
    term: "Luminance",
    definition: "The brightness component of an image, separate from color (chrominance). Human vision is more sensitive to luminance than color, which compression algorithms exploit."
  },
  {
    term: "Metadata",
    definition: "Information embedded in a file that describes its properties, such as creation date, camera settings (EXIF), copyright info, and GPS coordinates. Can be stripped to reduce file size and protect privacy."
  },
  {
    term: "MKV",
    definition: "Matroska Video - An open-source container format supporting virtually unlimited video, audio, and subtitle tracks. Popular for high-quality video archival."
  },
  {
    term: "Moire Pattern",
    definition: "An interference pattern that appears when fine details in images interact with display pixels, common in photos of screens, fabrics, or fine lines."
  },
  {
    term: "MP3",
    definition: "MPEG Audio Layer III - The most widely used audio format. Uses lossy compression to significantly reduce file size while maintaining acceptable quality for most listening purposes."
  },
  {
    term: "MP4",
    definition: "MPEG-4 Part 14 - A digital multimedia container format that can store video, audio, subtitles, and metadata. The most common video format for web and mobile, typically using H.264 video codec."
  },
  {
    term: "Muxing",
    definition: "The process of combining separate video, audio, and subtitle streams into a single container file. Demuxing is the reverse process."
  },
  {
    term: "Noise",
    definition: "Random variations in brightness or color in images, often appearing as grain. Can result from high ISO settings, poor lighting, or compression artifacts."
  },
  {
    term: "Noise Reduction",
    definition: "Processing that reduces visual noise while attempting to preserve image detail. Can be applied during capture, editing, or compression."
  },
  {
    term: "Optimization",
    definition: "The process of adjusting file parameters to achieve the best balance between quality and file size for a specific use case, such as web display or archival."
  },
  {
    term: "Opus",
    definition: "A versatile audio codec excelling at both speech and music. Offers better quality than MP3 at lower bitrates and is royalty-free."
  },
  {
    term: "PNG",
    definition: "Portable Network Graphics - A lossless image format that supports transparency. Ideal for graphics, logos, and screenshots where sharp edges must be preserved. Larger than JPEG for photographs."
  },
  {
    term: "Posterization",
    definition: "A visual artifact where smooth gradients appear as distinct bands of color, caused by insufficient bit depth or aggressive compression."
  },
  {
    term: "Progressive Loading",
    definition: "A technique where images load in increasing quality levels, showing a low-quality preview first that improves as more data arrives. Improves perceived loading speed."
  },
  {
    term: "Quantization",
    definition: "The process of reducing the precision of values during compression, which introduces some loss but significantly reduces file size."
  },
  {
    term: "Raster Image",
    definition: "An image composed of a grid of pixels, as opposed to vector graphics. JPEG, PNG, and GIF are all raster formats."
  },
  {
    term: "Resampling",
    definition: "The process of changing an image's pixel count when resizing. Quality depends on the resampling algorithm used (bilinear, bicubic, Lanczos, etc.)."
  },
  {
    term: "Resolution",
    definition: "The dimensions of an image or video in pixels (width × height). Common resolutions include 1920×1080 (1080p/Full HD), 3840×2160 (4K/UHD), and various mobile sizes."
  },
  {
    term: "RGB",
    definition: "Red, Green, Blue - The color model used by screens where colors are created by combining different intensities of red, green, and blue light."
  },
  {
    term: "Sample Rate",
    definition: "In audio, the number of samples per second used to represent the sound wave. CD quality is 44.1kHz; higher rates like 48kHz or 96kHz capture more detail."
  },
  {
    term: "Sharpening",
    definition: "Processing that increases edge contrast to make images appear more detailed. Should be applied carefully as over-sharpening creates visible halos."
  },
  {
    term: "TIFF",
    definition: "Tagged Image File Format - A flexible format supporting various compression methods and high bit depths. Commonly used in professional photography and printing."
  },
  {
    term: "Transcoding",
    definition: "Converting media from one codec or format to another. May involve re-encoding (with potential quality loss) or remuxing (changing container without re-encoding)."
  },
  {
    term: "Transparency",
    definition: "The property allowing parts of an image to be see-through. Supported by PNG, WebP, AVIF, and GIF formats, but not JPEG."
  },
  {
    term: "Upscaling",
    definition: "The process of increasing an image's resolution beyond its original size. AI-powered upscaling uses machine learning to add detail and maintain sharpness, unlike traditional methods that simply interpolate pixels."
  },
  {
    term: "Variable Bitrate (VBR)",
    definition: "An encoding method that adjusts bitrate based on content complexity. Uses more data for complex scenes and less for simple ones, optimizing quality per file size."
  },
  {
    term: "Vector Graphics",
    definition: "Images defined by mathematical shapes rather than pixels. Can be scaled infinitely without quality loss. Formats include SVG, AI, and EPS."
  },
  {
    term: "VP9",
    definition: "An open-source video codec developed by Google, offering similar compression to HEVC without licensing fees. Widely used on YouTube."
  },
  {
    term: "WAV",
    definition: "Waveform Audio File Format - An uncompressed audio format that preserves full quality. Results in large file sizes but is ideal for audio editing and archival purposes."
  },
  {
    term: "WebAssembly",
    definition: "A binary instruction format enabling near-native code execution in browsers. Used for high-performance tasks like image/video processing in web applications."
  },
  {
    term: "WebM",
    definition: "An open-source video container format using VP8/VP9 video and Vorbis/Opus audio. Optimized for web use with good compression and broad browser support."
  },
  {
    term: "WebP",
    definition: "A modern image format developed by Google that provides superior compression for web images. Supports both lossy and lossless compression, transparency, and animation. 25-35% smaller than JPEG."
  },
  {
    term: "Wide Color Gamut",
    definition: "Color spaces like Display P3 or Adobe RGB that represent more colors than sRGB. Important for HDR content and professional color work."
  },
  {
    term: "XMP",
    definition: "Extensible Metadata Platform - Adobe's standard for embedding metadata in files, including editing history, keywords, and rights information."
  }
];

export default function Glossary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(30);

  const filteredTerms = glossaryTerms.filter(item =>
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedTerms = filteredTerms.slice(0, displayCount);
  const hasMore = filteredTerms.length > displayCount;

  const alphabet = [...new Set(glossaryTerms.map(t => t.term[0].toUpperCase()))].sort();

  return (
    <>
      <SEOHead 
        title="Glossary - File Optimized | Image & Video Terms Explained"
        description="Learn the meaning of common image and video compression terms. Our glossary explains codecs, formats, compression methods, and more in simple language."
      />
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Glossary
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Technical terms explained in simple language
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* Alphabet Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {alphabet.map(letter => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="w-8 h-8 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              {letter}
            </a>
          ))}
        </div>

        {/* Terms List */}
        <div className="space-y-6">
          {alphabet.map(letter => {
            const letterTerms = displayedTerms.filter(t => t.term[0].toUpperCase() === letter);
            if (letterTerms.length === 0) return null;

            return (
              <div key={letter} id={`letter-${letter}`}>
                <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                  {letter}
                </h2>
                <div className="space-y-4">
                  {letterTerms.map((item, index) => (
                    <div 
                      key={index}
                      className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800"
                    >
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {item.term}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && !searchQuery && (
          <div className="text-center mt-10">
            <Button
              onClick={() => setDisplayCount(prev => prev + 30)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
            >
              Load More Terms ({filteredTerms.length - displayCount} remaining)
            </Button>
          </div>
        )}

        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No terms found matching "{searchQuery}"</p>
          </div>
        )}

        {/* Total count */}
        <div className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
          {glossaryTerms.length} terms in glossary
        </div>
      </div>
    </>
  );
}