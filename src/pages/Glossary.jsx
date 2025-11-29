import { useState } from "react";
import { Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import SEOHead from "../components/SEOHead";

const glossaryTerms = [
  {
    term: "AVIF",
    definition: "AV1 Image File Format - A modern image format that offers superior compression compared to JPEG and WebP. Developed by the Alliance for Open Media, AVIF supports both lossy and lossless compression, transparency, and HDR."
  },
  {
    term: "Bitrate",
    definition: "The amount of data processed per unit of time in a video or audio file, typically measured in kilobits per second (kbps) or megabits per second (Mbps). Higher bitrate generally means better quality but larger file size."
  },
  {
    term: "Codec",
    definition: "Short for 'compressor-decompressor' - software that encodes and decodes digital media. Examples include H.264 for video and AAC for audio. The codec determines how data is compressed and the resulting quality."
  },
  {
    term: "Compression",
    definition: "The process of reducing file size by encoding data more efficiently. Can be lossy (permanently removes some data) or lossless (preserves all original data). Essential for web optimization and storage efficiency."
  },
  {
    term: "DPI/PPI",
    definition: "Dots Per Inch / Pixels Per Inch - Measures the resolution of an image. Higher DPI means more detail. 72 DPI is standard for web, while 300 DPI is typical for print."
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
    term: "H.264 (AVC)",
    definition: "Advanced Video Coding - The most widely used video compression standard. Offers excellent compression efficiency and is supported by virtually all devices and platforms. Used in MP4 containers."
  },
  {
    term: "H.265 (HEVC)",
    definition: "High Efficiency Video Coding - A newer video compression standard offering 50% better compression than H.264 at the same quality. Requires more processing power and has licensing considerations."
  },
  {
    term: "JPEG",
    definition: "Joint Photographic Experts Group - The most common image format for photographs. Uses lossy compression, making it ideal for photos but not for graphics with sharp edges or text."
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
    term: "Metadata",
    definition: "Information embedded in a file that describes its properties, such as creation date, camera settings (EXIF), copyright info, and GPS coordinates. Can be stripped to reduce file size and protect privacy."
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
    term: "PNG",
    definition: "Portable Network Graphics - A lossless image format that supports transparency. Ideal for graphics, logos, and screenshots where sharp edges must be preserved. Larger than JPEG for photographs."
  },
  {
    term: "Resolution",
    definition: "The dimensions of an image or video in pixels (width × height). Common resolutions include 1920×1080 (1080p/Full HD), 3840×2160 (4K/UHD), and various mobile sizes."
  },
  {
    term: "Upscaling",
    definition: "The process of increasing an image's resolution beyond its original size. AI-powered upscaling uses machine learning to add detail and maintain sharpness, unlike traditional methods that simply interpolate pixels."
  },
  {
    term: "WAV",
    definition: "Waveform Audio File Format - An uncompressed audio format that preserves full quality. Results in large file sizes but is ideal for audio editing and archival purposes."
  },
  {
    term: "WebP",
    definition: "A modern image format developed by Google that provides superior compression for web images. Supports both lossy and lossless compression, transparency, and animation. 25-35% smaller than JPEG."
  }
];

export default function Glossary() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTerms = glossaryTerms.filter(item =>
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            const letterTerms = filteredTerms.filter(t => t.term[0].toUpperCase() === letter);
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

        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No terms found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </>
  );
}