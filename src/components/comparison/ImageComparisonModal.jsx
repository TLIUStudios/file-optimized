
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, MoveHorizontal, ZoomIn, ZoomOut, Maximize2, RefreshCw, Loader2 } from "lucide-react";
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
  const containerRef = useRef(null);

  // AI-generated metadata state
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    category: '',
    mood: '',
    altText: '',
    tags: ''
  });
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [regenerating, setRegenerating] = useState({});

  // Extract file extensions
  const originalExt = fileName.split('.').pop().toUpperCase();
  const compressedExt = compressedImage.split('data:image/')[1]?.split(';')[0].toUpperCase() || 'WEBP';

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

  // Get image dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
    };
    img.src = originalImage;
  }, [originalImage]);

  // Generate AI metadata when modal opens
  useEffect(() => {
    if (isOpen && !metadata.title && !loadingMetadata) { // Only generate if not already generated or currently loading
      generateAllMetadata();
    }
  }, [isOpen, metadata.title, loadingMetadata]); // Depend on isOpen and metadata.title to trigger once, and loadingMetadata to prevent re-triggering while loading

  const generateAllMetadata = async () => {
    setLoadingMetadata(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this image and generate comprehensive metadata for it. Be creative, descriptive, and SEO-friendly.
        
Please provide:
1. A catchy, descriptive title (max 60 characters)
2. A detailed description (2-3 sentences explaining what's in the image)
3. A single category (e.g., Nature, People, Food, Technology, Animals, Architecture, Business, Art, Sports, Travel, or Other.) Only respond with one category.
4. The overall mood/emotion (e.g., Happy, Serene, Energetic, Professional, etc.)
5. SEO-optimized alt text (concise but descriptive)
6. Relevant tags (comma-separated, 5-8 tags, ensure they are distinct and relevant)

The filename is: ${fileName}.`,
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
          },
          required: ["title", "description", "category", "mood", "altText", "tags"]
        }
      });

      setMetadata(response);
    } catch (error) {
      console.error('Error generating metadata:', error);
      setMetadata({
        title: 'Error generating title',
        description: 'Error generating description',
        category: 'Uncategorized',
        mood: 'Neutral',
        altText: fileName,
        tags: 'image, photo, error'
      });
    } finally {
      setLoadingMetadata(false);
    }
  };

  const regenerateField = async (fieldName) => {
    setRegenerating(prev => ({ ...prev, [fieldName]: true }));
    try {
      const prompts = {
        title: `Generate a catchy, descriptive title (max 60 characters) for this image. Filename: ${fileName}.`,
        description: `Write a detailed 2-3 sentence description of what's in this image. Be descriptive and engaging.`,
        category: `Categorize this image into ONE of these categories: Nature, People, Food, Technology, Animals, Architecture, Business, Art, Sports, Travel, or Other. Only respond with the category name.`,
        mood: `Describe the overall mood or emotion of this image in 1-2 words (e.g., Happy, Serene, Energetic, Professional, Melancholic, Vibrant, etc.)`,
        altText: `Generate SEO-optimized alt text for this image. Be concise but descriptive (max 125 characters).`,
        tags: `Generate 5-8 relevant, SEO-friendly tags for this image, separated by commas.`
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompts[fieldName],
        file_urls: [originalImage]
      });

      setMetadata(prev => ({ ...prev, [fieldName]: response.trim() }));
    } catch (error) {
      console.error(`Error regenerating ${fieldName}:`, error);
    } finally {
      setRegenerating(prev => ({ ...prev, [fieldName]: false }));
    }
  };

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

  const calculateAspectRatio = () => {
    if (imageDimensions.width === 0 || imageDimensions.height === 0) return 'Loading...';
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(imageDimensions.width, imageDimensions.height);
    const width = imageDimensions.width / divisor;
    const height = imageDimensions.height / divisor;
    return `${width}:${height}`;
  };

  const savingsPercent = ((1 - compressedSize / originalSize) * 100).toFixed(1);
  const savingsAmount = originalSize - compressedSize;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[98vh] p-0 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-slate-800 [&>button]:hidden">
        {/* Close Button - Top Right with Red Hover - Only this one */}
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
          <div className="flex-1 relative overflow-hidden flex flex-col">
            {/* Zoom Controls - Higher z-index to prevent overlap */}
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
              className="relative w-full h-full bg-slate-950 select-none flex flex-col items-center justify-center overflow-hidden"
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
              <div className="flex-1 relative w-full flex items-center justify-center pb-2">
                <div
                  className="relative"
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                    transformOrigin: 'center',
                    transition: isDragging || isPanning ? 'none' : 'transform 0.2s ease-out',
                    maxWidth: 'calc(100% - 32px)',
                    maxHeight: 'calc(100% - 32px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* Compressed Image (Background - Right Side) */}
                  <div className="relative flex items-center justify-center">
                    <img
                      src={compressedImage}
                      alt="Compressed"
                      className="max-w-full max-h-[70vh] lg:max-h-[75vh] w-auto h-auto object-contain"
                      draggable="false"
                    />
                  </div>

                  {/* Original Image (Foreground - Left Side with clip) */}
                  <div
                    className="absolute inset-0 flex items-center justify-center overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  >
                    <div className="relative flex items-center justify-center">
                      <img
                        src={originalImage}
                        alt="Original"
                        className="max-w-full max-h-[70vh] lg:max-h-[75vh] w-auto h-auto object-contain"
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
                      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm border border-slate-700 pointer-events-none animate-pulse shadow-lg">
                        ← Drag to compare →
                      </div>
                    )}
                  </>
                )}

                {/* Pan instruction when zoomed */}
                {zoom > 1 && !isPanning && (
                  <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm border border-slate-700 pointer-events-none shadow-lg">
                    Click and drag to pan • Scroll to zoom
                  </div>
                )}
              </div>

              {/* Labels Below Image - Far Left and Far Right */}
              <div className="h-16 w-full flex items-center justify-between px-6 bg-slate-950/50 border-t border-slate-800">
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
          <div className="w-full lg:w-[360px] xl:w-[400px] bg-gradient-to-b from-slate-900 to-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col overflow-y-auto max-h-[45vh] lg:max-h-full">
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

              {/* Details */}
              <div className="space-y-2.5">
                <h3 className="text-white font-semibold text-xs uppercase tracking-wider">Compression Details</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-2.5 bg-slate-950/50 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-xs font-medium">Compression Ratio</span>
                    <span className="text-white font-bold text-sm">{(compressedSize / originalSize).toFixed(3)}:1</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 px-2.5 bg-slate-950/50 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-xs font-medium">Aspect Ratio</span>
                    <span className="text-white font-bold text-sm">{calculateAspectRatio()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 px-2.5 bg-slate-950/50 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-xs font-medium">Dimensions</span>
                    <span className="text-white font-bold text-sm">{imageDimensions.width} × {imageDimensions.height}</span>
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

              {/* AI-Generated Metadata */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-xs uppercase tracking-wider">AI-Generated Metadata</h3>
                  {loadingMetadata && (
                    <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
                  )}
                </div>

                {loadingMetadata ? (
                  <div className="text-slate-400 text-xs text-center py-8">
                    Generating metadata with AI...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Title */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Title</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => regenerateField('title')}
                          disabled={regenerating.title}
                          className="h-6 w-6 hover:bg-slate-800"
                        >
                          <RefreshCw className={`w-3 h-3 text-slate-400 ${regenerating.title ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                      <p className="text-white text-sm leading-relaxed">{metadata.title}</p>
                    </div>

                    {/* Description */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Description</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => regenerateField('description')}
                          disabled={regenerating.description}
                          className="h-6 w-6 hover:bg-slate-800"
                        >
                          <RefreshCw className={`w-3 h-3 text-slate-400 ${regenerating.description ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                      <p className="text-white text-sm leading-relaxed">{metadata.description}</p>
                    </div>

                    {/* Category */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Category</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => regenerateField('category')}
                          disabled={regenerating.category}
                          className="h-6 w-6 hover:bg-slate-800"
                        >
                          <RefreshCw className={`w-3 h-3 text-slate-400 ${regenerating.category ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                      <Badge className="bg-blue-600 text-white text-xs px-2 py-1">{metadata.category}</Badge>
                    </div>

                    {/* Mood */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Mood</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => regenerateField('mood')}
                          disabled={regenerating.mood}
                          className="h-6 w-6 hover:bg-slate-800"
                        >
                          <RefreshCw className={`w-3 h-3 text-slate-400 ${regenerating.mood ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                      <Badge className="bg-purple-600 text-white text-xs px-2 py-1">{metadata.mood}</Badge>
                    </div>

                    {/* Alt Text */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Alt Text</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => regenerateField('altText')}
                          disabled={regenerating.altText}
                          className="h-6 w-6 hover:bg-slate-800"
                        >
                          <RefreshCw className={`w-3 h-3 text-slate-400 ${regenerating.altText ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                      <p className="text-white text-sm leading-relaxed">{metadata.altText}</p>
                    </div>

                    {/* Tags */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Tags</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => regenerateField('tags')}
                          disabled={regenerating.tags}
                          className="h-6 w-6 hover:bg-slate-800"
                        >
                          <RefreshCw className={`w-3 h-3 text-slate-400 ${regenerating.tags ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {metadata.tags.split(',').map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Privacy Notice */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 hidden lg:block">
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
