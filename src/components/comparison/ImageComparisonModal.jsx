
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, MoveHorizontal, ZoomIn, ZoomOut, Maximize2, Copy, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // Assuming cn utility is available at this path

export default function ImageComparisonModal({
  isOpen,
  onClose,
  originalImage,
  compressedImage,
  originalSize,
  compressedSize,
  fileName
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingField, setRegeneratingField] = useState(null); // New state for individual field regeneration
  const containerRef = useRef(null);
  const imageContainerRef = useRef(null);

  // Extract file extensions
  const originalExt = fileName.split('.').pop().toUpperCase();
  const compressedExt = compressedImage.split('data:image/')[1]?.split(';')[0].toUpperCase() || 'WEBP';

  // Load image dimensions
  useEffect(() => {
    if (originalImage) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = originalImage;
    }
  }, [originalImage]);

  const generateMetadata = async () => {
    console.log('🚀 Starting AI metadata generation...');
    setIsGenerating(true);
    setAiTitle("");
    setAiDescription("");
    setAiCategory("");
    setAiMood("");
    setAiAltText("");
    setAiTags("");

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
        prompt: "Analyze this image and provide: a short title (under 60 chars), brief description (under 160 chars), category (1-2 words), mood (1-2 words describing the emotional tone), alt text for accessibility (descriptive, under 125 chars), and 5-8 relevant tags (comma-separated keywords).",
        file_urls: [uploadResult.file_url],
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            mood: { type: "string" },
            alt_text: { type: "string" },
            tags: { type: "string" }
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
          prompt = "Analyze this image and provide ONLY 5-8 relevant keywords as comma-separated tags.";
          schemaProperty = "tags";
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

  const downloadImage = (format = null) => {
    if (!format) {
      // Download current compressed image
      const link = document.createElement('a');
      link.href = compressedImage;
      link.download = fileName;
      link.click();
      toast.success('Image downloaded!');
      return;
    }

    // Convert and download in different format
    const img = new Image();
    img.src = compressedImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error(`Failed to create ${format.toUpperCase()} image blob.`);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const baseName = fileName.split('.')[0];
        link.download = `${baseName}.${format}`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success(`Downloaded as ${format.toUpperCase()}!`);
      }, mimeType, 0.95);
    };
    img.onerror = () => {
      toast.error('Failed to load image for conversion.');
    };
  };

  const getAspectRatio = (width, height) => {
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
      if (imageContainerRef.current?.contains(e.target)) {
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
  }, []);

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

  const savingsPercent = ((1 - compressedSize / originalSize) * 100).toFixed(1);
  const savingsAmount = originalSize - compressedSize;

  const hasAnyMetadata = aiTitle || aiDescription || aiCategory || aiMood || aiAltText || aiTags;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[98vh] p-0 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 [&>button]:hidden overflow-hidden">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
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
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 p-1">
              <Button
                onClick={() => downloadImage()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
              <Button
                onClick={() => downloadImage('webp')}
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                WebP
              </Button>
              <Button
                onClick={() => downloadImage('png')}
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                PNG
              </Button>
              <Button
                onClick={() => downloadImage('jpg')}
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                JPG
              </Button>
            </div>
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

        <div className="flex flex-col lg:flex-row h-full overflow-hidden pt-[60px]">
          {/* Left Side - Image Comparison */}
          <div className="flex-1 relative overflow-hidden flex flex-col min-h-0">
            <div
              ref={containerRef}
              className="relative w-full h-full bg-slate-100 dark:bg-slate-900 select-none flex flex-col items-center justify-center overflow-hidden"
            >
              <div className="flex-1 relative w-full flex items-center justify-center py-4">
                <div
                  ref={imageContainerRef}
                  className="relative"
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                    transformOrigin: 'center',
                    transition: isDragging || isPanning ? 'none' : 'transform 0.2s ease-out',
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
                  <div className="relative">
                    <img
                      src={compressedImage}
                      alt="Compressed"
                      className="max-w-[85vw] lg:max-w-[60vw] max-h-[calc(100vh-200px)] w-auto h-auto object-contain"
                      draggable="false"
                    />

                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <img
                        src={originalImage}
                        alt="Original"
                        className="max-w-[85vw] lg:max-w-[60vw] max-h-[calc(100vh-200px)] w-auto h-auto object-contain"
                        draggable="false"
                      />
                    </div>

                    {zoom === 1 && !isPanning && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl z-10 pointer-events-none"
                        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                      >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-slate-700 rounded-full shadow-2xl flex items-center justify-center cursor-col-resize border-2 border-slate-300 dark:border-slate-600 pointer-events-auto">
                          <MoveHorizontal className="w-5 h-5 text-slate-700 dark:text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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

                {zoom === 1 && (
                  <div className="px-4 py-2 bg-slate-600/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-lg text-white text-sm font-medium animate-pulse">
                    ← Drag to compare →
                  </div>
                )}

                <div className="flex flex-col gap-1 items-end">
                  <Badge className="bg-emerald-600 text-white text-sm px-3 py-1 font-semibold w-fit">
                    Compressed
                  </Badge>
                  <Badge className="bg-emerald-600 text-white text-xs px-2 py-0.5 font-bold w-fit">
                    {compressedExt}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-full lg:w-[360px] xl:w-[400px] bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto">
            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-slate-900 dark:text-white text-sm font-bold mb-1 break-words line-clamp-2">{fileName}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Compare quality and analyze compression efficiency</p>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Original Size</p>
                  <p className="text-slate-900 dark:text-white text-2xl font-bold">{formatFileSize(originalSize)}</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-4">
                  <p className="text-emerald-100 text-[10px] font-semibold uppercase tracking-wider mb-1">Compressed Size</p>
                  <p className="text-white text-2xl font-bold mb-2">{formatFileSize(compressedSize)}</p>
                  <Badge className="bg-white/20 text-white text-xs px-2 py-0.5 font-bold">
                    {savingsPercent}% smaller
                  </Badge>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Space Saved</p>
                  <p className="text-emerald-600 dark:text-emerald-400 text-xl font-bold">{formatFileSize(savingsAmount)}</p>
                </div>
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-800" />

              <div className="space-y-2">
                <h3 className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider">Compression Details</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Compression Ratio</span>
                    <span className="text-slate-900 dark:text-white font-bold text-sm">{(compressedSize / originalSize).toFixed(3)}:1</span>
                  </div>

                  <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Quality</span>
                    <Badge className="bg-emerald-600 text-white font-semibold text-xs">High</Badge>
                  </div>

                  <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Processing</span>
                    <Badge className="bg-blue-600 text-white font-semibold text-xs">Browser-side</Badge>
                  </div>

                  {imageDimensions.width > 0 && (
                    <>
                      <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Resolution</span>
                        <span className="text-slate-900 dark:text-white font-bold text-sm">{imageDimensions.width} × {imageDimensions.height}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Aspect Ratio</span>
                        <span className="text-slate-900 dark:text-white font-bold text-sm">{getAspectRatio(imageDimensions.width, imageDimensions.height)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-800" />

              {/* AI Generated Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider">AI Generated</h3>
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
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Analyzing image with AI...</p>
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
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Generate AI-powered metadata for this image</p>
                    <Button
                      size="sm"
                      onClick={generateMetadata}
                      className="bg-slate-700 hover:bg-slate-800 text-white text-xs h-8"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Generate Metadata
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="mt-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 mx-5 mb-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                🔒 All processing happens locally in your browser. Your images never leave your device.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
