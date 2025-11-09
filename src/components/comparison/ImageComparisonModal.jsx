import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, MoveHorizontal, ZoomIn, ZoomOut, Maximize2, Copy, RefreshCw, Sparkles } from "lucide-react";
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
  const [generatingMetadata, setGeneratingMetadata] = useState(false);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Extract file extensions
  const originalExt = fileName.split('.').pop().toUpperCase();
  const compressedExt = compressedImage.split('data:image/')[1]?.split(';')[0].toUpperCase() || 'WEBP';

  // Load image dimensions and calculate display size
  useEffect(() => {
    if (originalImage) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        
        // Calculate the actual display size
        const maxWidth = window.innerWidth * 0.98 - 32; // Account for padding
        const maxHeight = window.innerHeight * 0.70;
        
        let displayWidth = img.width;
        let displayHeight = img.height;
        
        // Scale down if needed
        if (displayWidth > maxWidth || displayHeight > maxHeight) {
          const widthRatio = maxWidth / displayWidth;
          const heightRatio = maxHeight / displayHeight;
          const ratio = Math.min(widthRatio, heightRatio);
          
          displayWidth = displayWidth * ratio;
          displayHeight = displayHeight * ratio;
        }
        
        setImageSize({ width: displayWidth, height: displayHeight });
      };
      img.src = originalImage;
    }
  }, [originalImage]);

  // Generate AI metadata when modal opens
  useEffect(() => {
    if (isOpen && originalImage && !aiMetadata && !generatingMetadata) {
      generateAIMetadata();
    }
  }, [isOpen, originalImage]);

  const generateAIMetadata = async () => {
    setGeneratingMetadata(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this image and generate SEO-optimized, playful, and engaging metadata. Be creative but accurate. 

Generate:
- A catchy title (max 60 characters)
- An engaging description (max 160 characters) 
- A main category
- The mood/feeling of the image
- Descriptive alt text for accessibility (max 125 characters)
- 5-8 relevant keywords/tags`,
        file_urls: [originalImage],
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            mood: { type: "string" },
            alt_text: { type: "string" },
            tags: { type: "array", items: { type: "string" } }
          },
          required: ["title", "description", "category", "mood", "alt_text", "tags"]
        }
      });
      
      setAiMetadata(response);
      toast.success('AI metadata generated!');
    } catch (error) {
      console.error('Failed to generate metadata:', error);
      toast.error('Failed to generate AI metadata');
    }
    setGeneratingMetadata(false);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
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
    
    // If not a common ratio, return calculated ratio (but simplify if too large)
    if (ratioW > 100 || ratioH > 100) {
      return `${ratio.toFixed(2)}:1`;
    }
    return `${ratioW}:${ratioH}`;
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && !isPanning && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        setSliderPosition(Math.max(0, Math.min(100, percentage)));
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
        if (isDragging && !isPanning && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
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

  // Wheel zoom
  useEffect(() => {
    const handleWheel = (e) => {
      if (containerRef.current?.contains(e.target)) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
      }
    };

    const container = containerRef.current;
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
      <DialogContent className="max-w-[98vw] w-[98vw] h-[98vh] p-0 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-slate-300 dark:border-slate-800 [&>button]:hidden overflow-hidden">
        {/* Close Button - Top Right with Red Hover */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-[100] bg-slate-100/90 hover:bg-red-600 dark:bg-slate-900/90 dark:hover:bg-red-600 text-slate-900 hover:text-white dark:text-white rounded-lg transition-colors h-10 w-10"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* Left Side - Image Comparison */}
          <div className="flex-1 relative overflow-hidden flex flex-col min-h-0">
            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 z-[50] flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={handleZoomIn}
                className="bg-slate-200/90 hover:bg-slate-300 dark:bg-slate-800/90 dark:hover:bg-slate-700 backdrop-blur-sm border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white h-9 w-9"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleZoomOut}
                className="bg-slate-200/90 hover:bg-slate-300 dark:bg-slate-800/90 dark:hover:bg-slate-700 backdrop-blur-sm border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white h-9 w-9"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleResetZoom}
                className="bg-slate-200/90 hover:bg-slate-300 dark:bg-slate-800/90 dark:hover:bg-slate-700 backdrop-blur-sm border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white h-9 w-9"
                title="Reset"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <div className="bg-slate-200/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-300 dark:border-slate-700 rounded-md px-3 flex items-center text-xs text-slate-900 dark:text-white font-medium">
                {(zoom * 100).toFixed(0)}%
              </div>
            </div>

            <div 
              ref={containerRef}
              className="relative w-full h-full bg-slate-200 dark:bg-slate-950 select-none flex flex-col items-center justify-center overflow-hidden"
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
              {/* Image Container */}
              <div className="flex-1 relative w-full flex items-center justify-center pt-16">
                {imageSize.width > 0 && (
                  <div
                    ref={imageRef}
                    className="relative"
                    style={{
                      width: `${imageSize.width}px`,
                      height: `${imageSize.height}px`,
                      transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                      transformOrigin: 'center',
                      transition: isDragging || isPanning ? 'none' : 'transform 0.2s ease-out'
                    }}
                  >
                    {/* Compressed Image (Background - Full) */}
                    <img
                      src={compressedImage}
                      alt="Compressed"
                      className="absolute inset-0 w-full h-full object-cover"
                      draggable="false"
                      style={{ width: '100%', height: '100%' }}
                    />

                    {/* Original Image (Foreground - Clipped) */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ 
                        clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                        width: '100%',
                        height: '100%'
                      }}
                    >
                      <img
                        src={originalImage}
                        alt="Original"
                        className="absolute inset-0 w-full h-full object-cover"
                        draggable="false"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>

                    {/* Slider Line - White on both modes */}
                    {zoom === 1 && !isPanning && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl z-10"
                        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                      >
                        {/* Slider Handle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-2xl flex items-center justify-center cursor-col-resize border-2 border-slate-400 dark:border-slate-300">
                          <MoveHorizontal className="w-5 h-5 text-slate-900 dark:text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Pan instruction when zoomed */}
                {zoom > 1 && !isPanning && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800/95 dark:bg-slate-900/95 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm border border-slate-600 dark:border-slate-700 pointer-events-none shadow-lg">
                    Click and drag to pan • Scroll to zoom
                  </div>
                )}
              </div>

              {/* Instruction - Below Image */}
              {zoom === 1 && sliderPosition === 50 && !isDragging && (
                <div className="py-3 bg-slate-800/95 dark:bg-slate-900/95 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm border border-slate-600 dark:border-slate-700 shadow-lg animate-pulse">
                  ← Drag to compare →
                </div>
              )}

              {/* Labels Below Image */}
              <div className="h-16 w-full flex items-center justify-between px-6 bg-slate-100/50 dark:bg-slate-950/50 border-t border-slate-300 dark:border-slate-800">
                <div className="flex flex-col gap-1.5">
                  <Badge className="bg-slate-800/95 dark:bg-slate-900/95 backdrop-blur-sm text-white border border-slate-600 dark:border-slate-700 text-sm px-3 py-1.5 shadow-lg font-semibold w-fit">
                    Original
                  </Badge>
                  <Badge className="bg-slate-800/95 dark:bg-slate-900/95 backdrop-blur-sm text-white border border-slate-600 dark:border-slate-700 text-xs px-2.5 py-1 font-bold shadow-lg w-fit">
                    {originalExt}
                  </Badge>
                </div>
                
                <div className="flex flex-col gap-1.5 items-end">
                  <Badge className="bg-emerald-600/95 backdrop-blur-sm text-white border border-emerald-500 text-sm px-3 py-1.5 shadow-lg font-semibold w-fit">
                    Compressed
                  </Badge>
                  <Badge className="bg-emerald-600/95 backdrop-blur-sm text-white border border-emerald-500 text-xs px-2.5 py-1 font-bold shadow-lg w-fit">
                    {compressedExt}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Information Panel */}
          <div className="w-full lg:w-[360px] xl:w-[400px] bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 border-t lg:border-t-0 lg:border-l border-slate-300 dark:border-slate-800 flex flex-col overflow-y-auto min-h-0">
            <div className="p-4 lg:p-5 space-y-4">
              {/* Header */}
              <div>
                <h2 className="text-slate-900 dark:text-white text-sm lg:text-base font-bold mb-2 break-words leading-tight line-clamp-2">{fileName}</h2>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">Compare quality and analyze compression efficiency</p>
              </div>

              {/* Main Stats Cards */}
              <div className="space-y-2.5">
                <Card className="bg-white/50 dark:bg-slate-950/50 border-slate-300 dark:border-slate-800 p-3.5 shadow-xl">
                  <p className="text-slate-600 dark:text-slate-400 text-[10px] font-medium uppercase tracking-wider mb-1">Original Size</p>
                  <p className="text-slate-900 dark:text-white text-xl lg:text-2xl font-bold">{formatFileSize(originalSize)}</p>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-500 p-3.5 shadow-xl">
                  <p className="text-emerald-100 text-[10px] font-medium uppercase tracking-wider mb-1">Compressed Size</p>
                  <p className="text-white text-xl lg:text-2xl font-bold mb-1.5">{formatFileSize(compressedSize)}</p>
                  <Badge className="bg-white/20 text-white backdrop-blur-sm text-xs px-2 py-0.5 font-bold">
                    {savingsPercent}% smaller
                  </Badge>
                </Card>

                <Card className="bg-white/50 dark:bg-slate-950/50 border-slate-300 dark:border-slate-800 p-3.5 shadow-xl">
                  <p className="text-slate-600 dark:text-slate-400 text-[10px] font-medium uppercase tracking-wider mb-1">Space Saved</p>
                  <p className="text-emerald-600 dark:text-emerald-400 text-lg lg:text-xl font-bold">{formatFileSize(savingsAmount)}</p>
                </Card>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-400 dark:via-slate-700 to-transparent" />

              {/* Details */}
              <div className="space-y-2.5">
                <h3 className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider">Compression Details</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-2.5 bg-white/50 dark:bg-slate-950/50 rounded-lg border border-slate-300 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Compression Ratio</span>
                    <span className="text-slate-900 dark:text-white font-bold text-sm">{(compressedSize / originalSize).toFixed(3)}:1</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 px-2.5 bg-white/50 dark:bg-slate-950/50 rounded-lg border border-slate-300 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Quality</span>
                    <Badge className="bg-emerald-600 text-white font-semibold text-xs px-2 py-0.5">High</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 px-2.5 bg-white/50 dark:bg-slate-950/50 rounded-lg border border-slate-300 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Processing</span>
                    <Badge className="bg-blue-600 text-white font-semibold text-xs px-2 py-0.5">Browser-side</Badge>
                  </div>

                  {imageDimensions.width > 0 && (
                    <>
                      <div className="flex items-center justify-between py-2 px-2.5 bg-white/50 dark:bg-slate-950/50 rounded-lg border border-slate-300 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Resolution</span>
                        <span className="text-slate-900 dark:text-white font-bold text-sm">{imageDimensions.width} × {imageDimensions.height}</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 px-2.5 bg-white/50 dark:bg-slate-950/50 rounded-lg border border-slate-300 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Aspect Ratio</span>
                        <span className="text-slate-900 dark:text-white font-bold text-sm">{getAspectRatio(imageDimensions.width, imageDimensions.height)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-400 dark:via-slate-700 to-transparent" />

              {/* AI-Generated Metadata */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider">AI Metadata</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateAIMetadata}
                    disabled={generatingMetadata}
                    className="h-7 px-2 text-xs hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${generatingMetadata ? 'animate-spin' : ''}`} />
                    Regenerate
                  </Button>
                </div>

                {generatingMetadata && (
                  <div className="bg-white/50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800 rounded-lg p-4 text-center">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                    <p className="text-xs text-slate-600 dark:text-slate-400">Analyzing image with AI...</p>
                  </div>
                )}

                {aiMetadata && !generatingMetadata && (
                  <div className="space-y-2">
                    {/* Title */}
                    <div className="bg-white/50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800 rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Title</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(aiMetadata.title, 'Title')}
                          className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-900 dark:text-white font-medium leading-relaxed">{aiMetadata.title}</p>
                    </div>

                    {/* Description */}
                    <div className="bg-white/50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800 rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Description</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(aiMetadata.description, 'Description')}
                          className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-900 dark:text-white leading-relaxed">{aiMetadata.description}</p>
                    </div>

                    {/* Category & Mood */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800 rounded-lg p-2.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Category</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(aiMetadata.category, 'Category')}
                            className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-slate-900 dark:text-white font-medium">{aiMetadata.category}</p>
                      </div>

                      <div className="bg-white/50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800 rounded-lg p-2.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Mood</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(aiMetadata.mood, 'Mood')}
                            className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-slate-900 dark:text-white font-medium">{aiMetadata.mood}</p>
                      </div>
                    </div>

                    {/* Alt Text */}
                    <div className="bg-white/50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800 rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Alt Text</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(aiMetadata.alt_text, 'Alt Text')}
                          className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-900 dark:text-white leading-relaxed">{aiMetadata.alt_text}</p>
                    </div>

                    {/* Tags */}
                    <div className="bg-white/50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800 rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Tags</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(aiMetadata.tags.join(', '), 'Tags')}
                          className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {aiMetadata.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {!aiMetadata && !generatingMetadata && (
                  <div className="bg-white/50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800 rounded-lg p-4 text-center">
                    <Sparkles className="w-5 h-5 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Generate SEO-optimized metadata for this image</p>
                    <Button
                      size="sm"
                      onClick={generateAIMetadata}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
                    >
                      Generate Metadata
                    </Button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-400 dark:via-slate-700 to-transparent" />

              {/* Privacy Notice */}
              <div className="bg-white/50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800 rounded-xl p-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-base">🔒</span>
                  </div>
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-semibold text-xs mb-1">100% Private</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed">
                      All processing happens locally in your browser. Your images never leave your device.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom padding for better scroll experience */}
              <div className="h-4" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}