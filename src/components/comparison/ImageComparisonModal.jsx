import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, MoveHorizontal, ZoomIn, ZoomOut, Maximize2, Copy, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

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
  const [aiMetadata, setAiMetadata] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
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

  // Auto-generate AI metadata when modal opens
  useEffect(() => {
    if (isOpen && originalImage && !aiMetadata && !isGenerating) {
      generateMetadata();
    }
  }, [isOpen, originalImage]);

  const generateMetadata = async () => {
    setIsGenerating(true);
    try {
      // Convert base64 to blob and upload
      const response = await fetch(originalImage);
      const blob = await response.blob();
      const { file_url } = await base44.integrations.Core.UploadFile({ file: blob });

      // Generate metadata with AI
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this image carefully and generate a title and description.

TITLE: Create a short, catchy, SEO-friendly title (max 60 characters) that describes what's in the image.
DESCRIPTION: Write a brief, engaging description (max 160 characters) that describes the image content.

Be specific about what you see. If it's food, mention what food. If it's an animal, describe it. If it's a scene, describe it.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" }
          },
          required: ["title", "description"]
        }
      });

      if (result?.title && result?.description) {
        setAiMetadata(result);
      }
    } catch (error) {
      console.error('Failed to generate metadata:', error);
      setAiMetadata({
        title: "Image Analysis Failed",
        description: "Unable to generate metadata for this image."
      });
    }
    setIsGenerating(false);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = compressedImage;
    link.download = fileName;
    link.click();
    toast.success('Image downloaded!');
  };

  // Calculate aspect ratio
  const getAspectRatio = (width, height) => {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    const ratioW = width / divisor;
    const ratioH = height / divisor;
    
    // Common aspect ratios
    const ratio = width / height;
    if (Math.abs(ratio - 1) < 0.01) return "1:1";
    if (Math.abs(ratio - 16/9) < 0.01) return "16:9";
    if (Math.abs(ratio - 4/3) < 0.01) return "4:3";
    if (Math.abs(ratio - 3/2) < 0.01) return "3:2";
    if (Math.abs(ratio - 21/9) < 0.01) return "21:9";
    if (Math.abs(ratio - 9/16) < 0.01) return "9:16";
    
    if (ratioW > 100 || ratioH > 100) {
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

  // Wheel zoom - only when hovering over image
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
            <Button
              onClick={downloadImage}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
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
              {/* Image Container */}
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
                    {/* Compressed Image */}
                    <img
                      src={compressedImage}
                      alt="Compressed"
                      className="max-w-[85vw] lg:max-w-[60vw] max-h-[calc(100vh-200px)] w-auto h-auto object-contain"
                      draggable="false"
                    />

                    {/* Original Image with clip */}
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

                    {/* Slider Line */}
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

              {/* Labels */}
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
              {/* Header */}
              <div>
                <h2 className="text-slate-900 dark:text-white text-sm font-bold mb-1 break-words line-clamp-2">{fileName}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Compare quality and analyze compression efficiency</p>
              </div>

              {/* Stats */}
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

              {/* Divider */}
              <div className="h-px bg-slate-200 dark:bg-slate-800" />

              {/* Details */}
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

              {/* Divider */}
              <div className="h-px bg-slate-200 dark:bg-slate-800" />

              {/* AI Generated Text Fields */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider">AI Generated</h3>
                  {aiMetadata && !isGenerating && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={generateMetadata}
                      className="h-7 px-2 text-xs"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Regenerate
                    </Button>
                  )}
                </div>

                {isGenerating && (
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-6 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Generating metadata...</p>
                  </div>
                )}

                {!isGenerating && aiMetadata && (
                  <div className="space-y-2">
                    {/* Title Field */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Title</label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(aiMetadata.title, 'Title')}
                          className="h-5 w-5 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <input
                        type="text"
                        value={aiMetadata.title}
                        readOnly
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Description Field */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Description</label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(aiMetadata.description, 'Description')}
                          className="h-5 w-5 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <textarea
                        value={aiMetadata.description}
                        readOnly
                        rows={3}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-xs text-slate-900 dark:text-white resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}