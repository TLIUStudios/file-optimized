
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, MoveHorizontal, ZoomIn, ZoomOut, Maximize2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";

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
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    category: '',
    mood: '',
    altText: '',
    tags: ''
  });
  const [loadingMetadata, setLoadingMetadata] = useState({});
  const containerRef = useRef(null);

  // Extract file extensions
  const originalExt = fileName.split('.').pop().toUpperCase();
  const compressedExt = compressedImage.split('data:image/')[1]?.split(';')[0].toUpperCase() || 'WEBP';

  // Get image dimensions and generate metadata
  useEffect(() => {
    if (originalImage) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = originalImage;

      // Generate all metadata on open
      generateAllMetadata();
    }
  }, [originalImage]);

  const generateAllMetadata = async () => {
    setLoadingMetadata({
      title: true,
      description: true,
      category: true,
      mood: true,
      altText: true,
      tags: true
    });

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this image and generate SEO-optimized metadata. Return a JSON object with:
- title: A concise, descriptive title (max 60 characters)
- description: A detailed description (max 160 characters)
- category: Single category (e.g., Nature, Technology, Business, Art, Food, etc.)
- mood: Overall mood/emotion (e.g., Peaceful, Energetic, Professional, Playful, etc.)
- altText: Accessibility-friendly alt text (max 125 characters)
- tags: Comma-separated relevant tags (max 10 tags)`,
        file_urls: [originalImage],
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            mood: { type: "string" },
            altText: { type: "string" },
            tags: { type: "string" }
          }
        }
      });

      setMetadata(response);
    } catch (error) {
      console.error('Error generating metadata:', error);
      setMetadata({
        title: 'Error generating metadata',
        description: 'Please try again',
        category: 'Unknown',
        mood: 'Unknown',
        altText: 'Image',
        tags: ''
      });
    } finally {
      setLoadingMetadata({});
    }
  };

  const regenerateField = async (field) => {
    setLoadingMetadata(prev => ({ ...prev, [field]: true }));

    try {
      const prompts = {
        title: 'Generate a concise, SEO-optimized title for this image (max 60 characters)',
        description: 'Generate a detailed, SEO-friendly description for this image (max 160 characters)',
        category: 'Categorize this image into one category (e.g., Nature, Technology, Business, Art, Food, etc.)',
        mood: 'Describe the overall mood or emotion of this image (e.g., Peaceful, Energetic, Professional, Playful)',
        altText: 'Generate accessibility-friendly alt text for this image (max 125 characters)',
        tags: 'Generate comma-separated relevant tags for this image (max 10 tags)'
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompts[field],
        file_urls: [originalImage]
      });

      setMetadata(prev => ({ ...prev, [field]: response }));
    } catch (error) {
      console.error(`Error regenerating ${field}:`, error);
    } finally {
      setLoadingMetadata(prev => ({ ...prev, [field]: false }));
    }
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
  const aspectRatio = imageDimensions.width && imageDimensions.height 
    ? (imageDimensions.width / imageDimensions.height).toFixed(2) 
    : 'N/A';

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[98vh] p-0 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-slate-800 [&>button]:hidden">
        {/* Close Button - Top Right with Red Hover */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-[100] bg-slate-900/90 hover:bg-red-600 text-white rounded-lg transition-colors h-10 w-10"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Side - Image Comparison */}
          <div className="flex-1 relative overflow-hidden flex flex-col min-h-0">
            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 z-[50] flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={handleZoomIn}
                className="bg-slate-800/90 hover:bg-slate-700 backdrop-blur-sm border border-slate-700 text-white h-9 w-9"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleZoomOut}
                className="bg-slate-800/90 hover:bg-slate-700 backdrop-blur-sm border border-slate-700 text-white h-9 w-9"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleResetZoom}
                className="bg-slate-800/90 hover:bg-slate-700 backdrop-blur-sm border border-slate-700 text-white h-9 w-9"
                title="Reset"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-md px-3 flex items-center text-xs text-white font-medium">
                {(zoom * 100).toFixed(0)}%
              </div>
            </div>

            <div 
              ref={containerRef}
              className="relative flex-1 bg-slate-950 select-none flex flex-col overflow-hidden min-h-0"
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
              {/* Image Container - Takes up available space minus label height */}
              <div className="flex-1 relative w-full flex items-center justify-center overflow-hidden min-h-0 p-4">
                <div
                  className="relative w-full h-full flex items-center justify-center"
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                    transformOrigin: 'center',
                    transition: isDragging || isPanning ? 'none' : 'transform 0.2s ease-out'
                  }}
                >
                  {/* Compressed Image (Background - Right Side) */}
                  <div className="relative flex items-center justify-center max-w-full max-h-full">
                    <img
                      src={compressedImage}
                      alt="Compressed"
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                      draggable="false"
                    />
                  </div>

                  {/* Original Image (Foreground - Left Side with clip) */}
                  <div
                    className="absolute inset-0 flex items-center justify-center overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  >
                    <div className="relative flex items-center justify-center max-w-full max-h-full">
                      <img
                        src={originalImage}
                        alt="Original"
                        className="max-w-full max-h-full w-auto h-auto object-contain"
                        draggable="false"
                      />
                    </div>
                  </div>
                </div>

                {/* Slider Line - only show when not zoomed/panning */}
                {zoom === 1 && !isPanning && (
                  <>
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl z-10"
                      style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                    >
                      {/* Slider Handle */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center cursor-col-resize border-2 border-slate-300">
                        <MoveHorizontal className="w-5 h-5 text-slate-900" />
                      </div>
                    </div>

                    {/* Instruction */}
                    {sliderPosition === 50 && !isDragging && (
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm border border-slate-700 pointer-events-none animate-pulse shadow-lg">
                        ← Drag to compare →
                      </div>
                    )}
                  </>
                )}

                {/* Pan instruction when zoomed */}
                {zoom > 1 && !isPanning && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm border border-slate-700 pointer-events-none shadow-lg">
                    Click and drag to pan • Scroll to zoom
                  </div>
                )}
              </div>

              {/* Labels Below Image - Fixed Height */}
              <div className="h-20 w-full flex items-center justify-between px-6 bg-slate-950/80 border-t border-slate-800 flex-shrink-0">
                <div className="flex flex-col gap-1.5">
                  <Badge className="bg-slate-900/95 backdrop-blur-sm text-white border border-slate-700 text-sm px-3 py-1.5 shadow-lg font-semibold w-fit">
                    Original
                  </Badge>
                  <Badge className="bg-slate-900/95 backdrop-blur-sm text-white border border-slate-700 text-xs px-2.5 py-1 font-bold shadow-lg w-fit">
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
          <div className="w-full lg:w-[380px] xl:w-[420px] bg-gradient-to-b from-slate-900 to-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col overflow-y-auto max-h-[45vh] lg:max-h-full">
            <div className="p-4 lg:p-5 space-y-4">
              {/* Header */}
              <div>
                <h2 className="text-white text-sm lg:text-base font-bold mb-2 break-words leading-tight line-clamp-2">{fileName}</h2>
                <p className="text-slate-400 text-xs leading-relaxed">Compare quality and analyze compression efficiency</p>
              </div>

              {/* Main Stats Cards */}
              <div className="space-y-2.5">
                <Card className="bg-slate-950/50 border-slate-800 p-3.5 shadow-xl">
                  <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider mb-1">Original Size</p>
                  <p className="text-white text-xl lg:text-2xl font-bold">{formatFileSize(originalSize)}</p>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-500 p-3.5 shadow-xl">
                  <p className="text-emerald-100 text-[10px] font-medium uppercase tracking-wider mb-1">Compressed Size</p>
                  <p className="text-white text-xl lg:text-2xl font-bold mb-1.5">{formatFileSize(compressedSize)}</p>
                  <Badge className="bg-white/20 text-white backdrop-blur-sm text-xs px-2 py-0.5 font-bold">
                    {savingsPercent}% smaller
                  </Badge>
                </Card>

                <Card className="bg-slate-950/50 border-slate-800 p-3.5 shadow-xl">
                  <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider mb-1">Space Saved</p>
                  <p className="text-emerald-400 text-lg lg:text-xl font-bold">{formatFileSize(savingsAmount)}</p>
                </Card>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

              {/* Compression Details */}
              <div className="space-y-2.5">
                <h3 className="text-white font-semibold text-xs uppercase tracking-wider">Compression Details</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-2.5 bg-slate-950/50 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-xs font-medium">Compression Ratio</span>
                    <span className="text-white font-bold text-sm">{(compressedSize / originalSize).toFixed(3)}:1</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 px-2.5 bg-slate-950/50 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-xs font-medium">Aspect Ratio</span>
                    <span className="text-white font-bold text-sm">{aspectRatio} ({imageDimensions.width} × {imageDimensions.height})</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 px-2.5 bg-slate-950/50 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-xs font-medium">Quality</span>
                    <Badge className="bg-emerald-600 text-white font-semibold text-xs px-2 py-0.5">High</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 px-2.5 bg-slate-950/50 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-xs font-medium">Processing</span>
                    <Badge className="bg-blue-600 text-white font-semibold text-xs px-2 py-0.5">Browser-side</Badge>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

              {/* AI Generated Metadata */}
              <div className="space-y-2.5">
                <h3 className="text-white font-semibold text-xs uppercase tracking-wider">AI Generated Metadata</h3>
                
                <div className="space-y-3">
                  {/* Title */}
                  <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-slate-400 text-xs font-medium">Title</label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => regenerateField('title')}
                        disabled={loadingMetadata.title}
                        className="h-6 w-6 hover:bg-slate-800"
                      >
                        <RefreshCw className={`w-3 h-3 text-slate-400 ${loadingMetadata.title ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    <p className="text-white text-xs leading-relaxed">
                      {loadingMetadata.title ? 'Generating...' : metadata.title || 'Generating...'}
                    </p>
                  </div>

                  {/* Description */}
                  <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-slate-400 text-xs font-medium">Description</label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => regenerateField('description')}
                        disabled={loadingMetadata.description}
                        className="h-6 w-6 hover:bg-slate-800"
                      >
                        <RefreshCw className={`w-3 h-3 text-slate-400 ${loadingMetadata.description ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    <p className="text-white text-xs leading-relaxed">
                      {loadingMetadata.description ? 'Generating...' : metadata.description || 'Generating...'}
                    </p>
                  </div>

                  {/* Category */}
                  <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-slate-400 text-xs font-medium">Category</label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => regenerateField('category')}
                        disabled={loadingMetadata.category}
                        className="h-6 w-6 hover:bg-slate-800"
                      >
                        <RefreshCw className={`w-3 h-3 text-slate-400 ${loadingMetadata.category ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    <p className="text-white text-xs leading-relaxed">
                      {loadingMetadata.category ? 'Generating...' : metadata.category || 'Generating...'}
                    </p>
                  </div>

                  {/* Mood */}
                  <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-slate-400 text-xs font-medium">Mood</label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => regenerateField('mood')}
                        disabled={loadingMetadata.mood}
                        className="h-6 w-6 hover:bg-slate-800"
                      >
                        <RefreshCw className={`w-3 h-3 text-slate-400 ${loadingMetadata.mood ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    <p className="text-white text-xs leading-relaxed">
                      {loadingMetadata.mood ? 'Generating...' : metadata.mood || 'Generating...'}
                    </p>
                  </div>

                  {/* Alt Text */}
                  <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-slate-400 text-xs font-medium">Alt Text</label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => regenerateField('altText')}
                        disabled={loadingMetadata.altText}
                        className="h-6 w-6 hover:bg-slate-800"
                      >
                        <RefreshCw className={`w-3 h-3 text-slate-400 ${loadingMetadata.altText ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    <p className="text-white text-xs leading-relaxed">
                      {loadingMetadata.altText ? 'Generating...' : metadata.altText || 'Generating...'}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-slate-400 text-xs font-medium">Tags</label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => regenerateField('tags')}
                        disabled={loadingMetadata.tags}
                        className="h-6 w-6 hover:bg-slate-800"
                      >
                        <RefreshCw className={`w-3 h-3 text-slate-400 ${loadingMetadata.tags ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    <p className="text-white text-xs leading-relaxed">
                      {loadingMetadata.tags ? 'Generating...' : metadata.tags || 'Generating...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

              {/* Privacy Notice */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-base">🔒</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-xs mb-1">100% Private</h4>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      All processing happens locally in your browser. Your images never leave your device.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
