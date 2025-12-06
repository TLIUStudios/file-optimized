import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, MoveHorizontal, ZoomIn, ZoomOut, Maximize2, Copy, RefreshCw, Download as DownloadIcon, Check, Loader2, CheckCircle2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import SocialShareModal from "../SocialShareModal";

// Helper component for the download options modal for images
function DownloadWithOptionsModal({
  isOpen,
  onClose,
  onDownloadSpecificFormat,
  onDownloadAllFormatsZip,
  availableImageFormats,
  fileName,
  // For future enhancements, AI metadata could be passed here to offer inclusion options
  // aiTitle, aiDescription, aiAltText, aiTags,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Download Image Options</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="py-4 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose how you'd like to download your compressed image.
          </p>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Download as single format:</h4>
            {availableImageFormats.map((fmt) => (
              <Button
                key={fmt}
                className="w-full justify-start text-gray-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                variant="outline"
                onClick={() => {
                  onDownloadSpecificFormat(fmt);
                  onClose();
                }}
              >
                <DownloadIcon className="h-4 w-4 mr-2" /> Download as {fmt.toUpperCase()}
              </Button>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Other options:</h4>
            <Button
              className="w-full justify-start text-gray-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              variant="outline"
              onClick={() => {
                onDownloadAllFormatsZip();
                onClose();
              }}
            >
              <DownloadIcon className="h-4 w-4 mr-2" /> Download all formats (.zip)
            </Button>
            {/* Future option for metadata inclusion could go here */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


export default function ImageComparisonModal({
  isOpen,
  onClose,
  originalImage,
  compressedImage,
  originalSize,
  compressedSize,
  fileName,
  mediaType = 'image',
  fileFormat = 'webp',
  originalFileFormat = null,
  generatedAnimations = null, // Add this prop for animation variations
  onFilenameChange = null, // Callback to sync filename changes back to parent
  cachedFormatData = null, // Pre-cached format blobs and sizes
  cachedSeoMetadata = null, // Pre-cached SEO metadata
  onFormatDataCached = null, // Callback to cache format data
  onSeoMetadataCached = null // Callback to cache SEO metadata
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [aiTitle, setAiTitle] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [aiCategory, setAiCategory] = useState("");
  const [aiMood, setAiMood] = useState("");
  const [aiAltText, setAiAltText] = useState("");
  const [aiTags, setAiTags] = useState("");
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiHashtags, setAiHashtags] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingField, setRegeneratingField] = useState(null);
  const [showDownloadModalForImage, setShowDownloadModalForImage] = useState(false);
  const [originalResolution, setOriginalResolution] = useState(null);
  const [compressedResolution, setCompressedResolution] = useState(null);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [seoGenerationTime, setSeoGenerationTime] = useState(6); // Estimated time for SEO generation


  const containerRef = useRef(null);
  const imageContainerRef = useRef(null);

  // Load original and compressed image resolutions for comparison
  useEffect(() => {
    if (mediaType === 'image' && originalImage) {
      const img = new Image();
      img.onload = () => {
        setOriginalResolution({ width: img.width, height: img.height });
      };
      img.src = originalImage;
    }
  }, [originalImage, mediaType]);

  useEffect(() => {
    if (mediaType === 'image' && compressedImage) {
      const img = new Image();
      img.onload = () => {
        setCompressedResolution({ width: img.width, height: img.height });
      };
      img.src = compressedImage;
    }
  }, [compressedImage, mediaType]);

  // Extract file extensions
  const originalExt = originalFileFormat ? originalFileFormat.toUpperCase() : fileName.split('.').pop().toUpperCase();
  const compressedExt = fileFormat.toUpperCase();

  // Define available formats based on media type and file format
  const availableFormats = mediaType === 'video' 
    ? (fileFormat === 'gif' ? ['mp4', 'gif'] : ['mp4', 'gif'])
    : mediaType === 'audio'
    ? ['mp3', 'wav']
    : fileFormat === 'gif'
    ? ['gif', 'mp4']
    : ['jpg', 'png', 'webp', 'avif'];
  
  // Track selected format for conversion and preview
  const [selectedFormat, setSelectedFormat] = useState(fileFormat);
  const [previewFormat, setPreviewFormat] = useState(fileFormat);
  const [previewSize, setPreviewSize] = useState(compressedSize);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedBlob, setConvertedBlob] = useState(null);
  const [allFormatSizes, setAllFormatSizes] = useState({});
  const [loadingFormatSizes, setLoadingFormatSizes] = useState(false);
  const [cachedFormatBlobs, setCachedFormatBlobs] = useState({}); // Cache all format blobs
  const [formatsGenerated, setFormatsGenerated] = useState(false); // Track if formats have been generated

  // Check if we're displaying animated variations
  const isAnimationVariations = generatedAnimations && generatedAnimations.length > 0;

  // Load image dimensions
  useEffect(() => {
    if (originalImage && mediaType === 'image') {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = originalImage;
    } else if (mediaType !== 'image') {
      // Reset image dimensions if not an image
      setImageDimensions({ width: 0, height: 0 });
    }
  }, [originalImage, mediaType]);

  // Load cached SEO metadata if available
  useEffect(() => {
    if (cachedSeoMetadata) {
      setAiTitle(cachedSeoMetadata.title || "");
      setAiDescription(cachedSeoMetadata.description || "");
      setAiCategory(cachedSeoMetadata.category || "");
      setAiMood(cachedSeoMetadata.mood || "");
      setAiAltText(cachedSeoMetadata.altText || "");
      setAiTags(cachedSeoMetadata.tags || "");
      setAiKeywords(cachedSeoMetadata.keywords || "");
      setAiHashtags(cachedSeoMetadata.hashtags || "");
    }
  }, [cachedSeoMetadata]);

  // Load cached format data if available, otherwise wait for user to generate
  useEffect(() => {
    if (mediaType !== 'image' || isAnimationVariations) {
      return;
    }

    // Use cached data if available
    if (cachedFormatData) {
      setAllFormatSizes(cachedFormatData.sizes);
      setCachedFormatBlobs(cachedFormatData.blobs);
      setFormatsGenerated(true);
    }
  }, [cachedFormatData, mediaType, isAnimationVariations]);

  // Generate all format sizes on demand
  const generateAllFormats = async () => {
    if (formatsGenerated || loadingFormatSizes) return;
    
    setLoadingFormatSizes(true);
    const sizes = {};
    const blobs = {};

    try {
      // Use the actual compressed blob for the current format
      const currentBlob = await fetch(compressedImage).then(r => r.blob());
      sizes[fileFormat] = compressedSize;
      blobs[fileFormat] = currentBlob;

      const img = new Image();
      img.src = compressedImage;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0);

      // Generate and cache blobs for each format
      for (const format of ['jpg', 'png', 'webp']) {
        if (format === fileFormat) continue;
        
        try {
          const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
          
          let blob;
          if (format === 'png') {
            try {
              if (!window.imageCompression) {
                await new Promise((resolve, reject) => {
                  const script = document.createElement('script');
                  script.src = 'https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js';
                  script.onload = () => setTimeout(() => window.imageCompression ? resolve() : reject(new Error('Library not loaded')), 100);
                  script.onerror = reject;
                  document.head.appendChild(script);
                });
              }

              const canvasBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
              blob = await window.imageCompression(canvasBlob, {
                maxSizeMB: Math.max(0.1, (canvasBlob.size / 1024 / 1024) * 0.85),
                maxWidthOrHeight: Math.max(canvas.width, canvas.height),
                useWebWorker: true,
                fileType: 'image/png',
                initialQuality: 0.85
              });
            } catch (pngError) {
              blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));
            }
          } else {
            const quality = format === 'jpg' ? 0.85 : 0.90;
            blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
          }
          
          if (blob) {
            sizes[format] = blob.size;
            blobs[format] = blob;
          }
        } catch (err) {
          console.warn(`Failed to generate ${format}:`, err);
        }
      }

      // Generate AVIF
      try {
        if (!window.imageCompression) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js';
            script.onload = () => setTimeout(() => window.imageCompression ? resolve() : reject(new Error('Library not loaded')), 100);
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        const response = await fetch(compressedImage);
        const sourceBlob = await response.blob();
        
        const avifBlob = await window.imageCompression(sourceBlob, {
          maxSizeMB: 50,
          fileType: 'image/avif',
          useWebWorker: true,
          initialQuality: 0.85
        });
        
        sizes.avif = avifBlob.size;
        blobs.avif = avifBlob;
      } catch (err) {
        console.warn('AVIF not supported:', err);
      }

      setAllFormatSizes(sizes);
      setCachedFormatBlobs(blobs);
      setFormatsGenerated(true);
      
      // Cache the data for reuse
      if (onFormatDataCached) {
        onFormatDataCached({ sizes, blobs });
      }
    } catch (error) {
      console.error('Error calculating format sizes:', error);
    } finally {
      setLoadingFormatSizes(false);
    }
  };

  const generateMetadata = async () => {
    console.log('🚀 Starting AI metadata generation...');
    setIsGenerating(true);
    setAiTitle("");
    setAiDescription("");
    setAiCategory("");
    setAiMood("");
    setAiAltText("");
    setAiTags("");

    // AI metadata generation only makes sense for images, and current prompt is image-specific.
    if (mediaType !== 'image') {
        toast.info('AI metadata generation is currently only supported for images.');
        setIsGenerating(false);
        return;
    }

    try {
      // Convert compressed image blob
      const res = await fetch(compressedImage);
      const blob = await res.blob();
      console.log('✅ Blob created:', blob.size, 'bytes');

      // Create a simple file object
      const file = new File([blob], 'image.jpg', { type: blob.type });
      console.log('📁 File created');

      // Upload
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      console.log('☁️ Upload complete:', uploadResult.file_url);

      // Generate with AI - updated prompt for more fields
      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt: "Analyze this image and provide: a short title (under 60 chars), brief description (under 160 chars), category (1-2 words), mood (1-2 words describing the emotional tone), alt text for accessibility (descriptive, under 125 chars), 10 playful/fun social media tags (comma-separated, use casual slang, trendy words, vibes, aesthetic terms like 'aesthetic', 'vibes', 'iconic', 'slay', 'mood'), 10 professional SEO keywords (comma-separated, use formal descriptive language for search engines like 'digital illustration', 'high resolution image', 'professional artwork'), and 10 social media hashtags (format: #word, #anotherword, #thirdword with space after comma). IMPORTANT: Ensure tags, keywords, and hashtags are all completely different from each other with no overlap.",
        file_urls: [uploadResult.file_url],
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            mood: { type: "string" },
            alt_text: { type: "string" },
            tags: { type: "string" },
            keywords: { type: "string" },
            hashtags: { type: "string" }
          }
        }
      });

      console.log('🤖 AI Response:', aiResult);

      setAiTitle(aiResult.title || "Generated Title");
      setAiDescription(aiResult.description || "Generated description of the image.");
      setAiCategory(aiResult.category || "General");
      setAiMood(aiResult.mood || "Neutral");
      setAiAltText(aiResult.alt_text || "Image description");
      setAiTags(aiResult.tags || "image, photo");
      setAiKeywords(aiResult.keywords || "image, photo, digital");
      setAiHashtags(aiResult.hashtags || "#image #photo");
      
      // Cache the SEO metadata for reuse
      if (onSeoMetadataCached) {
        onSeoMetadataCached({
          title: aiResult.title || "Generated Title",
          description: aiResult.description || "Generated description of the image.",
          category: aiResult.category || "General",
          mood: aiResult.mood || "Neutral",
          altText: aiResult.alt_text || "Image description",
          tags: aiResult.tags || "image, photo",
          keywords: aiResult.keywords || "image, photo, digital",
          hashtags: aiResult.hashtags || "#image #photo"
        });
      }
      
      toast.success('Metadata generated!');

    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Could not generate metadata: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateField = async (fieldName) => {
    console.log(`🔄 Regenerating ${fieldName}...`);
    setRegeneratingField(fieldName); // Set the field being regenerated

    if (mediaType !== 'image') {
        toast.info('AI metadata regeneration is currently only supported for images.');
        setRegeneratingField(null);
        return;
    }

    try {
      const res = await fetch(compressedImage);
      const blob = await res.blob();
      const file = new File([blob], 'image.jpg', { type: blob.type });
      const uploadResult = await base44.integrations.Core.UploadFile({ file });

      let prompt = "";
      let schemaProperty = "";

      switch (fieldName) {
        case "title":
          prompt = "Analyze this image and provide ONLY a short, catchy title (under 60 chars).";
          schemaProperty = "title";
          break;
        case "description":
          prompt = "Analyze this image and provide ONLY a brief, informative description (under 160 chars).";
          schemaProperty = "description";
          break;
        case "category":
          prompt = "Analyze this image and provide ONLY a category (1-2 words, e.g., 'Nature', 'Technology', 'People').";
          schemaProperty = "category";
          break;
        case "mood":
          prompt = "Analyze this image and provide ONLY the mood or emotional tone (1-2 words, e.g., 'Calm', 'Energetic', 'Melancholic').";
          schemaProperty = "mood";
          break;
        case "alt_text":
          prompt = "Analyze this image and provide ONLY accessible alt text - a descriptive sentence for screen readers (under 125 chars).";
          schemaProperty = "alt_text";
          break;
        case "tags":
          prompt = "Analyze this image and provide ONLY 10 playful/fun social media tags (comma-separated, use casual slang, trendy words, vibes, aesthetic terms).";
          schemaProperty = "tags";
          break;
        case "keywords":
          prompt = "Analyze this image and provide ONLY 10 professional SEO keywords (comma-separated, use formal descriptive language for search engines).";
          schemaProperty = "keywords";
          break;
        case "hashtags":
          prompt = "Analyze this image and provide ONLY 10 social media hashtags (format: #word, #anotherword, #thirdword with space after comma).";
          schemaProperty = "hashtags";
          break;
        default:
          throw new Error("Invalid field name for regeneration.");
      }

      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [uploadResult.file_url],
        response_json_schema: {
          type: "object",
          properties: {
            [schemaProperty]: { type: "string" }
          }
        }
      });

      // Update specific state based on fieldName
      switch (fieldName) {
        case "title":
          setAiTitle(aiResult.title || "Generated Title");
          break;
        case "description":
          setAiDescription(aiResult.description || "Generated description");
          break;
        case "category":
          setAiCategory(aiResult.category || "General");
          break;
        case "mood":
          setAiMood(aiResult.mood || "Neutral");
          break;
        case "alt_text":
          setAiAltText(aiResult.alt_text || "Image description");
          break;
        case "tags":
          setAiTags(aiResult.tags || "image, photo");
          break;
        case "keywords":
          setAiKeywords(aiResult.keywords || "image, photo, digital");
          break;
        case "hashtags":
          setAiHashtags(aiResult.hashtags || "#image #photo");
          break;
      }

      // Update cached metadata after regeneration
      if (onSeoMetadataCached) {
        onSeoMetadataCached({
          title: aiTitle,
          description: aiDescription,
          category: aiCategory,
          mood: aiMood,
          altText: aiAltText,
          tags: aiTags,
          keywords: aiKeywords,
          hashtags: aiHashtags,
          [fieldName === 'alt_text' ? 'altText' : fieldName]: aiResult[fieldName]
        });
      }

      toast.success(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} regenerated!`);
    } catch (error) {
      console.error(`❌ Error regenerating ${fieldName}:`, error);
      toast.error(`Failed to regenerate ${fieldName}: ${error.message}`);
    } finally {
      setRegeneratingField(null); // Reset the regenerating field state
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  // Use cached blobs for downloads
  const performSingleMediaDownload = async (mediaUrl, format, mediaTypeOverride = mediaType) => {
    try {
      toast.info(`Preparing download as ${format.toUpperCase()}...`);
      
      if (mediaTypeOverride === 'image') {
        // Use cached blob if available
        const cachedBlob = cachedFormatBlobs[format];
        
        if (cachedBlob) {
          const url = URL.createObjectURL(cachedBlob);
          const link = document.createElement('a');
          link.href = url;
          const baseName = fileName.split('.')[0];
          link.download = `${baseName}.${format}`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success(`Downloaded as ${format.toUpperCase()}!`);
          return;
        }
        
        // Fallback: generate if not cached (shouldn't happen)
        toast.warning('Generating format...');
      } else {
        const link = document.createElement('a');
        link.href = mediaUrl;
        const baseName = fileName.split('.')[0];
        link.download = `${baseName}.${format || fileFormat}`;
        link.click();
        toast.success(`${mediaTypeOverride.charAt(0).toUpperCase() + mediaTypeOverride.slice(1)} downloaded!`);
      }
    } catch (error) {
      console.error('Error downloading format:', error);
      toast.error(`Failed to download as ${format.toUpperCase()}: ` + error.message);
    }
  };
  
  // Use cached blobs for format conversion
  const convertToFormat = async (format) => {
    if (format === selectedFormat && previewFormat === format) {
      return; // Already on this format
    }
    
    setIsConverting(true);
    setSelectedFormat(format);
    
    try {
      if (mediaType === 'image' && !isAnimationVariations) {
        // If formats not generated yet, generate them first
        if (!formatsGenerated) {
          toast.info('Generating formats...');
          await generateAllFormats();
          // After generation, the blob should be available
          const cachedBlob = cachedFormatBlobs[format];
          if (cachedBlob) {
            setConvertedBlob(cachedBlob);
            setPreviewSize(cachedBlob.size);
            setPreviewFormat(format);
            
            const sizeDiff = cachedBlob.size - originalSize;
            const percentChange = ((sizeDiff / originalSize) * 100).toFixed(1);
            
            if (cachedBlob.size > originalSize) {
              toast.info(`${format.toUpperCase()}: ${formatFileSize(cachedBlob.size)} (+${percentChange}% larger)`);
            } else {
              toast.success(`${format.toUpperCase()}: ${formatFileSize(cachedBlob.size)} (${Math.abs(percentChange)}% smaller)`);
            }
          }
          setIsConverting(false);
          return;
        }
        
        // Use cached blob if available
        const cachedBlob = cachedFormatBlobs[format];
        
        if (cachedBlob) {
          setConvertedBlob(cachedBlob);
          setPreviewSize(cachedBlob.size);
          setPreviewFormat(format);
          
          const sizeDiff = cachedBlob.size - originalSize;
          const percentChange = ((sizeDiff / originalSize) * 100).toFixed(1);
          
          if (cachedBlob.size > originalSize) {
            toast.info(`${format.toUpperCase()}: ${formatFileSize(cachedBlob.size)} (+${percentChange}% larger)`);
          } else {
            toast.success(`${format.toUpperCase()}: ${formatFileSize(cachedBlob.size)} (${Math.abs(percentChange)}% smaller)`);
          }
          
          setIsConverting(false);
          return;
        }
        
        // If still not cached after generation attempt, show error
        toast.error('Failed to generate format');
        setSelectedFormat(previewFormat);
      } else {
        setPreviewFormat(format);
      }
    } catch (error) {
      console.error('❌ Conversion error:', error);
      toast.error(`${error.message || 'Failed to convert to ' + format.toUpperCase()}`);
      setSelectedFormat(previewFormat);
    } finally {
      setIsConverting(false);
    }
  };

  // Use cached blobs for ZIP download
  const downloadAllImageFormatsAsZip = async () => {
    toast.info('Creating multi-format ZIP...');

    try {
      const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
      const zip = new JSZip();
      const baseName = fileName.split('.')[0];

      // Use cached blobs for all formats
      for (const format of ['jpg', 'png', 'webp', 'avif']) {
        const blob = cachedFormatBlobs[format];
        if (blob) {
          zip.file(`${baseName}.${format}`, blob);
          console.log(`✓ Added ${format} to ZIP (${(blob.size / 1024).toFixed(1)}KB)`);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${baseName}-all-formats.zip`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.success('All formats downloaded!');
    } catch (error) {
      console.error('Error creating ZIP:', error);
      toast.error('Failed to create multi-format ZIP: ' + error.message);
    }
  };

  const downloadAllAnimationsAsZip = async () => {
    toast.info('Creating animations ZIP...');
    try {
      const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
      const zip = new JSZip();

      const baseName = fileName.split('.').slice(0, -1).join('.') || fileName;

      for (const anim of generatedAnimations) {
        const response = await fetch(anim.url);
        const blob = await response.blob();
        zip.file(`${baseName}_${anim.name.toLowerCase().replace(/\s+/g, '_')}.gif`, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${baseName}-animations.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('All animations downloaded!');
    } catch (error) {
      console.error('Error creating animations ZIP:', error);
      toast.error('Failed to create animations ZIP: ' + error.message);
    }
  };

  const downloadMedia = async () => {
    if (isAnimationVariations) {
      await downloadAllAnimationsAsZip();
      return;
    }

    // If we have a converted blob, download that directly
    if (convertedBlob) {
      const url = URL.createObjectURL(convertedBlob);
      const link = document.createElement('a');
      link.href = url;
      const baseName = fileName.split('.')[0];
      link.download = `${baseName}.${selectedFormat}`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded as ${selectedFormat.toUpperCase()}!`);
    } else {
      // Otherwise use the original compressed image
      performSingleMediaDownload(compressedImage, selectedFormat, mediaType);
    }
  };


  const getAspectRatio = (width, height) => {
    if (!width || !height) return "N/A";
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    const ratioW = width / divisor;
    const ratioH = height / divisor;

    const ratio = width / height;
    if (Math.abs(ratio - 1) < 0.01) return "1:1";
    if (Math.abs(ratio - 16/9) < 0.01) return "16:9";
    if (Math.abs(ratio - 4/3) < 0.01) return "4:3";
    if (Math.abs(ratio - 3/2) < 0.01) return "3:2";
    if (Math.abs(ratio - 21/9) < 0.01) return "21:9";
    if (Math.abs(ratio - 9/16) < 0.01) return "9:16";

    if (ratioW > 100 || ratioH > 100) { // To prevent very large ratios for small differences
      return `${ratio.toFixed(2)}:1`;
    }
    return `${ratioW}:${ratioH}`;
  };

  const getOrientation = (width, height) => {
    if (!width || !height) return "N/A";
    const ratio = width / height;
    if (Math.abs(ratio - 1) < 0.01) return "Square";
    if (ratio > 1) return "Landscape";
    return "Portrait";
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && !isPanning) {
        if (imageContainerRef.current) {
          const rect = imageContainerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percentage = (x / rect.width) * 100;
          setSliderPosition(Math.max(0, Math.min(100, percentage)));
        }
      }

      if (isPanning) {
        const deltaX = e.clientX - panStart.x;
        const deltaY = e.clientY - panStart.y;
        setPan({ x: pan.x + deltaX, y: pan.y + deltaY });
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 1) {
        if (isDragging && !isPanning && imageContainerRef.current) {
          const rect = imageContainerRef.current.getBoundingClientRect();
          const x = e.touches[0].clientX - rect.left;
          const percentage = (x / rect.width) * 100;
          setSliderPosition(Math.max(0, Math.min(100, percentage)));
        }

        if (isPanning) {
          const deltaX = e.touches[0].clientX - panStart.x;
          const deltaY = e.touches[0].clientY - panStart.y;
          setPan({ x: pan.x + deltaX, y: pan.y + deltaY });
          setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsPanning(false);
    };

    if (isDragging || isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isPanning, panStart, pan]);

  useEffect(() => {
    const handleWheel = (e) => {
      if (mediaType === 'image' && imageContainerRef.current?.contains(e.target)) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
      }
    };

    const container = imageContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [mediaType]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(3, prev + 0.25));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.5, prev - 0.25));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePanStart = (e) => {
    if (zoom > 1 && e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Use preview size for calculations when format is selected
  const displaySize = previewSize;
  const savingsPercent = originalSize ? ((1 - displaySize / originalSize) * 100).toFixed(1) : '0';
  const savingsAmount = originalSize - displaySize;
  
  // Check if file got larger
  const sizeIncreased = displaySize > originalSize;

  const hasAnyMetadata = aiTitle || aiDescription || aiCategory || aiMood || aiAltText || aiTags || aiKeywords || aiHashtags;


  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[98vh] p-0 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 [&>button]:hidden overflow-hidden">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {mediaType === 'image' && !isAnimationVariations && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleZoomIn}
                  className="h-9 w-9 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleZoomOut}
                  className="h-9 w-9 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleResetZoom}
                  className="h-9 w-9 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <div className="bg-white dark:bg-slate-800 rounded-md px-3 h-9 flex items-center text-xs text-slate-900 dark:text-white font-medium border border-slate-200 dark:border-slate-700">
                  {(zoom * 100).toFixed(0)}%
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Format Selector Buttons */}
            {!isAnimationVariations && (
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 p-1">
                {availableFormats.map((fmt) => (
                  <Button
                    key={fmt}
                    onClick={() => convertToFormat(fmt)}
                    variant={selectedFormat === fmt ? "default" : "ghost"}
                    size="sm"
                    disabled={isConverting}
                    className={cn(
                      "h-8 px-3 text-xs transition-all",
                      selectedFormat === fmt 
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                        : "hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                  >
                    {isConverting && selectedFormat === fmt ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      fmt.toUpperCase()
                    )}
                  </Button>
                ))}
              </div>
            )}
            
            {/* Download Button */}
            <Button
              onClick={() => downloadMedia()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-4 text-xs font-semibold"
            >
              <DownloadIcon className="w-3.5 h-3.5 mr-1.5" />
              Download
            </Button>
            
            {/* Download All Formats as ZIP */}
            {mediaType === 'image' && !isAnimationVariations && (
              <Button
                onClick={downloadAllImageFormatsAsZip}
                variant="outline"
                className="h-8 px-3 text-xs"
              >
                <DownloadIcon className="w-3 h-3 mr-1" />
                .ZIP
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex h-full pt-[60px]">
          {/* Left Side - Media Display */}
          <div className="flex-1 relative flex flex-col min-w-0">
            {isAnimationVariations ? (
              // Animation Variations Grid (2x2)
              <div className="relative w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
                <div className="grid grid-cols-2 gap-4 w-full max-w-5xl">
                  {generatedAnimations.map((anim, index) => (
                    <div
                      key={index}
                      className="relative aspect-video bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden group cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = anim.url;
                        const baseName = fileName.split('.').slice(0, -1).join('.') || fileName;
                        link.download = `${baseName}_${anim.name.toLowerCase().replace(/\s+/g, '_')}.gif`;
                        link.click();
                        toast.success(`${anim.name} downloaded!`);
                      }}
                    >
                      <img
                        src={anim.url}
                        alt={anim.name}
                        className="w-full h-full object-contain"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/0 to-slate-900/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Label */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-emerald-600 text-white font-semibold">
                          {anim.name}
                        </Badge>
                      </div>

                      {/* Size */}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-slate-900/80 text-white text-xs">
                          {formatFileSize(anim.size)}
                        </Badge>
                      </div>

                      {/* Number Label */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-white text-[120px] font-bold opacity-20 group-hover:opacity-10 transition-opacity">
                          {index + 1}
                        </div>
                      </div>

                      {/* Download Icon on Hover */}
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-emerald-600 rounded-full p-2">
                          <DownloadIcon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom instruction bar */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  <div className="px-4 py-2 bg-emerald-600/80 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
                    Click any animation to download
                  </div>
                </div>
              </div>
            ) : mediaType === 'image' ? (
              <div className="relative w-full h-full bg-slate-100 dark:bg-slate-900 flex flex-col">
                <div className="flex-1 relative flex items-start justify-start overflow-hidden select-none p-4">
                  <div
                    className="relative"
                    style={{
                      transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                      transition: isDragging || isPanning ? 'none' : 'transform 0.2s ease-out'
                    }}
                  >
                    <div
                      ref={imageContainerRef}
                      className="relative cursor-col-resize"
                      style={{
                        cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'col-resize'
                      }}
                      onMouseDown={(e) => {
                        if (zoom > 1) {
                          handlePanStart(e);
                        } else {
                          setIsDragging(true);
                        }
                      }}
                      onTouchStart={(e) => {
                        if (zoom > 1 && e.touches.length === 1) {
                          setIsPanning(true);
                          setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                        } else if (e.touches.length === 1) {
                          setIsDragging(true);
                        }
                      }}
                    >
                      <img
                        src={compressedImage}
                        alt="Compressed"
                        className="max-h-[calc(100vh-180px)] max-w-full w-auto h-auto object-contain"
                        draggable="false"
                      />
                      <div
                        className="absolute top-0 left-0 w-full h-full overflow-hidden"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                      >
                        <img
                          src={originalImage}
                          alt="Original"
                          className="max-h-[calc(100vh-180px)] max-w-full w-auto h-auto object-contain"
                          draggable="false"
                        />
                      </div>
                      {zoom === 1 && !isPanning && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl z-10"
                          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                        >
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-slate-700 rounded-full shadow-2xl flex items-center justify-center cursor-col-resize border-2 border-slate-300 dark:border-slate-600">
                            <MoveHorizontal className="w-5 h-5 text-slate-700 dark:text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="h-16 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-sm border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-semibold">Original</span>
                    <Badge className="bg-slate-700 text-white text-xs px-2 py-0.5 font-bold">
                      {originalExt}
                    </Badge>
                  </div>
                  {zoom === 1 && (
                    <div className="px-4 py-2 bg-slate-800/80 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
                      ← Drag to compare →
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-semibold">Compressed</span>
                    <Badge className="bg-emerald-600 text-white text-xs px-2 py-0.5 font-bold">
                      {previewFormat.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              // Video or Audio player
              <div className="relative w-full h-full bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center">
                <div className="flex-1 relative w-full flex items-center justify-center p-4">
                  {mediaType === 'video' && (
                    <video controls src={compressedImage} className="max-w-full max-h-full object-contain" />
                  )}
                  {mediaType === 'audio' && (
                    <audio controls src={compressedImage} className="max-w-full max-h-full" />
                  )}
                </div>
                <div className="h-16 w-full flex items-center justify-between px-6 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col gap-1">
                    <Badge className="bg-slate-700 dark:bg-slate-800 text-white text-sm px-3 py-1 font-semibold w-fit">
                      Original
                    </Badge>
                    <Badge className="bg-slate-700 dark:bg-slate-800 text-white text-xs px-2 py-0.5 font-bold w-fit">
                      {originalExt}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1 items-end">
                    <Badge className="bg-emerald-600 text-white text-sm px-3 py-1 font-semibold w-fit">
                      Compressed
                    </Badge>
                    <Badge className="bg-emerald-600 text-white text-xs px-2 py-0.5 font-bold w-fit">
                      {previewFormat.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="w-[360px] xl:w-[400px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto flex-shrink-0">
            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-slate-900 dark:text-white text-sm font-bold mb-1 break-words line-clamp-2">
                  {fileName}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Compare quality and analyze compression efficiency</p>
              </div>

              <div className="space-y-3">
                {/* Social Media Share */}
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  size="sm"
                  onClick={() => setShowSocialShare(true)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share to Social Media
                </Button>
              
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Original Size</p>
                  <p className="text-slate-900 dark:text-white text-2xl font-bold">{formatFileSize(originalSize)}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">Format: {originalExt}</p>
                </div>

                {!isAnimationVariations && mediaType === 'image' && (
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-3">Available Formats</p>
                    {!formatsGenerated && !loadingFormatSizes ? (
                      <div className="text-center py-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Generate all format conversions to compare sizes</p>
                        <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400 mb-3">
                          ~3-5s estimated
                        </Badge>
                        <Button
                          onClick={generateAllFormats}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                        >
                          <RefreshCw className="w-3 h-3 mr-2" />
                          Generate Formats
                        </Button>
                      </div>
                    ) : loadingFormatSizes ? (
                      <div className="flex items-center justify-center py-4">
                        <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
                        <span className="ml-2 text-xs text-slate-500">Generating formats...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {availableFormats.map((format) => {
                          const size = allFormatSizes[format] || previewSize;
                          const isSelected = selectedFormat === format;
                          const isBigger = size > originalSize;
                          const percentChange = (((size - originalSize) / originalSize) * 100).toFixed(1);
                          
                          return (
                            <button
                              key={format}
                              onClick={() => convertToFormat(format)}
                              disabled={isConverting}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                isSelected
                                  ? isBigger
                                    ? 'bg-red-500/10 border-red-500/50'
                                    : 'bg-emerald-500/10 border-emerald-500/50'
                                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">{format}</span>
                                {isSelected && <Check className="w-3 h-3 text-emerald-600" />}
                              </div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-white">{formatFileSize(size)}</div>
                              <div className={`text-xs mt-1 ${
                                isBigger ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                              }`}>
                                {isBigger ? '+' : ''}{percentChange}%
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                
                {(isAnimationVariations || mediaType !== 'image') && (
                  <div className={cn(
                    "rounded-lg p-4",
                    sizeIncreased
                      ? "bg-gradient-to-br from-red-600 to-red-700"
                      : "bg-gradient-to-br from-emerald-600 to-emerald-700"
                  )}>
                    <p className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider mb-1",
                      sizeIncreased ? "text-red-100" : "text-emerald-100"
                    )}>
                      {isAnimationVariations ? 'Total Generated Size' : 'Compressed Size'}
                    </p>
                    <p className="text-white text-2xl font-bold mb-2">{formatFileSize(compressedSize)}</p>
                    {!isAnimationVariations && (
                      <Badge className={cn(
                        "text-xs px-2 py-0.5 font-bold",
                        sizeIncreased 
                          ? "bg-white/20 text-white"
                          : "bg-white/20 text-white"
                      )}>
                        {sizeIncreased ? `+${Math.abs(parseFloat(savingsPercent))}% larger` : `${savingsPercent}% smaller`}
                      </Badge>
                    )}
                  </div>
                )}

                {isAnimationVariations ? (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-blue-700 dark:text-blue-400 text-xs font-medium mb-2">
                      🎬 {generatedAnimations.length} Animation Variations
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 text-xs">
                      Click any animation in the grid to download it individually, or use the download button above to get all variations as a ZIP.
                    </p>
                  </div>
                ) : (
                  <div className={cn(
                    "border rounded-lg p-4",
                    sizeIncreased
                      ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  )}>
                    <p className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider mb-1",
                      sizeIncreased 
                        ? "text-red-500 dark:text-red-400" 
                        : "text-slate-500 dark:text-slate-400"
                    )}>
                      {sizeIncreased ? 'Size Increase' : 'Space Saved'} {mediaType === 'image' && `(${selectedFormat.toUpperCase()})`}
                    </p>
                    <p className={cn(
                      "text-xl font-bold",
                      sizeIncreased 
                        ? "text-red-600 dark:text-red-400" 
                        : "text-emerald-600 dark:text-emerald-400"
                    )}>
                      {sizeIncreased ? '+' : ''}{formatFileSize(Math.abs(savingsAmount))}
                    </p>
                  </div>
                )}
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-800" />

              {!isAnimationVariations && (
                <div className="space-y-2">
                  <h3 className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider">Optimization Details</h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Compression Ratio</span>
                      <span className="text-slate-900 dark:text-white font-bold text-sm">{(displaySize / originalSize).toFixed(3)}:1</span>
                    </div>

                    <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Quality</span>
                      <Badge className="bg-emerald-600 text-white font-semibold text-xs">High</Badge>
                    </div>

                    <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Processing</span>
                      <Badge className="bg-blue-600 text-white font-semibold text-xs">Browser-side</Badge>
                    </div>

                    {mediaType === 'image' && imageDimensions.width > 0 && (
                      <>
                        <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Resolution</span>
                          {originalResolution && compressedResolution && (originalResolution.width !== compressedResolution.width || originalResolution.height !== compressedResolution.height) ? (
                            <span className="font-bold text-sm">
                              <span className="text-slate-900 dark:text-white">{originalResolution.width} × {originalResolution.height}</span>
                              <span className="text-slate-500 dark:text-slate-400"> → </span>
                              <span className="text-emerald-600 dark:text-emerald-400">{compressedResolution.width} × {compressedResolution.height}</span>
                            </span>
                          ) : (
                            <span className="text-slate-900 dark:text-white font-bold text-sm">{imageDimensions.width} × {imageDimensions.height}</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Orientation</span>
                          <span className="text-slate-900 dark:text-white font-bold text-sm">{getOrientation(imageDimensions.width, imageDimensions.height)}</span>
                        </div>

                        <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Aspect Ratio</span>
                          <span className="text-slate-900 dark:text-white font-bold text-sm">{getAspectRatio(imageDimensions.width, imageDimensions.height)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {isAnimationVariations && (
                <div className="space-y-2">
                  <h3 className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider">Animation Details</h3>
                  <div className="space-y-2">
                    {generatedAnimations.map((anim, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = anim.url;
                          const baseName = fileName.split('.').slice(0, -1).join('.') || fileName;
                          link.download = `${baseName}_${anim.name.toLowerCase().replace(/\s+/g, '_')}.gif`;
                          link.click();
                          toast.success(`${anim.name} downloaded!`);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                            <img src={anim.url} alt={anim.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-slate-900 dark:text-white font-medium text-sm">{anim.name}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs">{formatFileSize(anim.size)}</p>
                          </div>
                        </div>
                        <DownloadIcon className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isAnimationVariations && (
                <>
                  <div className="h-px bg-slate-200 dark:bg-slate-800" />
                  {/* SEO Generation Section */}
                  {mediaType === 'image' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider">SEO Generation</h3>
                      {hasAnyMetadata && !isGenerating && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={generateMetadata}
                          className="h-7 px-2 text-xs"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Regenerate All
                        </Button>
                      )}
                    </div>

                    {isGenerating ? (
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-6 text-center">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Analyzing image with AI...</p>
                        <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400">
                          ~5-8s estimated
                        </Badge>
                      </div>
                    ) : hasAnyMetadata ? (
                      <div className="space-y-2">
                        {/* Title */}
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Title</label>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => regenerateField('title')}
                                disabled={regeneratingField === 'title'}
                                className="h-5 w-5 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                              >
                                <RefreshCw className={cn("w-3 h-3", regeneratingField === 'title' && "animate-spin")} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(aiTitle, 'Title')}
                                className="h-5 w-5 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={aiTitle}
                            readOnly
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm text-slate-900 dark:text-white"
                          />
                        </div>

                        {/* Description */}
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Description</label>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => regenerateField('description')}
                                disabled={regeneratingField === 'description'}
                                className="h-5 w-5 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                              >
                                <RefreshCw className={cn("w-3 h-3", regeneratingField === 'description' && "animate-spin")} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(aiDescription, 'Description')}
                                className="h-5 w-5 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <textarea
                            value={aiDescription}
                            readOnly
                            rows={3}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs text-slate-900 dark:text-white resize-none"
                          />
                        </div>

                        {/* Category & Mood */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Category</label>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => regenerateField('category')}
                                  disabled={regeneratingField === 'category'}
                                  className="h-5 w-5 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                                >
                                  <RefreshCw className={cn("w-3 h-3", regeneratingField === 'category' && "animate-spin")} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(aiCategory, 'Category')}
                                  className="h-5 w-5 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <input
                              type="text"
                              value={aiCategory}
                              readOnly
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Mood</label>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => regenerateField('mood')}
                                  disabled={regeneratingField === 'mood'}
                                  className="h-5 w-5 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                                >
                                  <RefreshCw className={cn("w-3 h-3", regeneratingField === 'mood' && "animate-spin")} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(aiMood, 'Mood')}
                                  className="h-5 w-5 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <input
                              type="text"
                              value={aiMood}
                              readOnly
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>

                        {/* Alt Text */}
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Alt Text</label>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => regenerateField('alt_text')}
                                disabled={regeneratingField === 'alt_text'}
                                className="h-5 w-5 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                              >
                                <RefreshCw className={cn("w-3 h-3", regeneratingField === 'alt_text' && "animate-spin")} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(aiAltText, 'Alt Text')}
                                className="h-5 w-5 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <textarea
                            value={aiAltText}
                            readOnly
                            rows={2}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs text-slate-900 dark:text-white resize-none"
                          />
                        </div>

                        {/* Tags */}
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Tags</label>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => regenerateField('tags')}
                                disabled={regeneratingField === 'tags'}
                                className="h-5 w-5 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                              >
                                <RefreshCw className={cn("w-3 h-3", regeneratingField === 'tags' && "animate-spin")} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(aiTags, 'Tags')}
                                className="h-5 w-5 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={aiTags}
                            readOnly
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs text-slate-900 dark:text-white"
                          />
                        </div>

                        {/* Keywords */}
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Keywords</label>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => regenerateField('keywords')}
                                disabled={regeneratingField === 'keywords'}
                                className="h-5 w-5 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                              >
                                <RefreshCw className={cn("w-3 h-3", regeneratingField === 'keywords' && "animate-spin")} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(aiKeywords, 'Keywords')}
                                className="h-5 w-5 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={aiKeywords}
                            readOnly
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs text-slate-900 dark:text-white"
                          />
                        </div>

                        {/* Hashtags */}
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Hashtags</label>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => regenerateField('hashtags')}
                                disabled={regeneratingField === 'hashtags'}
                                className="h-5 w-5 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                              >
                                <RefreshCw className={cn("w-3 h-3", regeneratingField === 'hashtags' && "animate-spin")} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(aiHashtags, 'Hashtags')}
                                className="h-5 w-5 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={aiHashtags}
                            readOnly
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Generate AI-powered metadata for this image</p>
                        <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400 mb-3">
                          ~5-10s estimated
                        </Badge>
                        <Button
                          size="sm"
                          onClick={generateMetadata}
                          className="bg-slate-700 hover:bg-slate-800 text-white text-xs h-8 w-full"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Generate Metadata
                        </Button>
                      </div>
                    )}
                  </div>
                  )}
                </>
              )}
            </div>

            {/* Privacy Notice */}
            <div className="mt-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 mx-5 mb-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                🔒 All processing happens locally in your browser. Your images never leave your device.
              </p>
            </div>
          </div>
        </div>

        {/* Download Options Modal for Images */}
        {mediaType === 'image' && !isAnimationVariations && (
          <DownloadWithOptionsModal
            isOpen={showDownloadModalForImage}
            onClose={() => setShowDownloadModalForImage(false)}
            onDownloadSpecificFormat={(format) => performSingleMediaDownload(compressedImage, format)}
            onDownloadAllFormatsZip={downloadAllImageFormatsAsZip}
            availableImageFormats={['jpg', 'png', 'webp', 'avif']} // Pass image specific formats
            fileName={fileName}
            // For future AI metadata integration:
            // aiTitle={aiTitle}
            // aiDescription={aiDescription}
            // aiAltText={aiAltText}
            // aiTags={aiTags}
          />
        )}

        {/* Social Share Modal */}
        <SocialShareModal
          isOpen={showSocialShare}
          onClose={() => setShowSocialShare(false)}
          imageUrl={compressedImage}
          fileName={fileName}
        />
      </DialogContent>
    </Dialog>
  );
}