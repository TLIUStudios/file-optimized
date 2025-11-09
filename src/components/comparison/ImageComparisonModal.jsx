import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, MoveHorizontal, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
  const containerRef = useRef(null);

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
      <DialogContent className="max-w-[100vw] w-full h-[100vh] max-h-[100vh] p-0 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-0 rounded-none sm:rounded-lg sm:max-w-[98vw] sm:w-[98vw] sm:h-[98vh]">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Side - Image Comparison */}
          <div className="flex-1 relative overflow-hidden order-2 lg:order-1">
            {/* Close Button - Circular with X like slider handle */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer border-2 border-slate-300 hover:bg-red-500 hover:border-red-600 transition-all group"
              aria-label="Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 group-hover:text-white transition-colors" />
            </button>

            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={handleZoomIn}
                className="bg-slate-800/90 hover:bg-slate-700 backdrop-blur-sm border border-slate-700 text-white h-9 w-9 sm:h-10 sm:w-10"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleZoomOut}
                className="bg-slate-800/90 hover:bg-slate-700 backdrop-blur-sm border border-slate-700 text-white h-9 w-9 sm:h-10 sm:w-10"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleResetZoom}
                className="bg-slate-800/90 hover:bg-slate-700 backdrop-blur-sm border border-slate-700 text-white h-9 w-9 sm:h-10 sm:w-10"
                title="Reset Zoom"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-md px-2 sm:px-3 py-2 text-xs text-white flex items-center font-medium">
                {(zoom * 100).toFixed(0)}%
              </div>
            </div>

            <div 
              ref={containerRef}
              className="relative w-full h-full bg-slate-950 select-none flex items-center justify-center"
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
              <div
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transformOrigin: 'center',
                  transition: isDragging || isPanning ? 'none' : 'transform 0.2s ease-out',
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Compressed Image (Background - Right Side) */}
                <img
                  src={compressedImage}
                  alt="Compressed"
                  className="max-w-full max-h-full object-contain"
                  draggable="false"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />

                {/* Original Image (Foreground - Left Side with clip) */}
                <div
                  className="absolute inset-0 overflow-hidden flex items-center justify-center"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img
                    src={originalImage}
                    alt="Original"
                    className="max-w-full max-h-full object-contain"
                    draggable="false"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                </div>
              </div>

              {/* Slider Line - only show when not zoomed/panning */}
              {zoom === 1 && !isPanning && (
                <>
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-2xl z-10"
                    style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                  >
                    {/* Slider Handle - Same style as close button */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-2xl flex items-center justify-center cursor-col-resize border-2 border-slate-300">
                      <MoveHorizontal className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
                    </div>
                  </div>

                  {/* Labels */}
                  <Badge className="absolute top-1/2 left-4 -translate-y-1/2 bg-slate-900/95 backdrop-blur-sm text-white border border-slate-700 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 z-10 shadow-lg">
                    Original
                  </Badge>
                  <Badge className="absolute top-1/2 right-4 lg:right-auto lg:left-[calc(50%+2rem)] -translate-y-1/2 bg-emerald-600/95 backdrop-blur-sm text-white border border-emerald-500 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 z-10 shadow-lg">
                    Compressed
                  </Badge>

                  {/* Instruction */}
                  {sliderPosition === 50 && !isDragging && (
                    <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm border border-slate-700 pointer-events-none animate-pulse shadow-lg">
                      ← Drag to compare →
                    </div>
                  )}
                </>
              )}

              {/* Pan instruction when zoomed */}
              {zoom > 1 && !isPanning && (
                <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm border border-slate-700 pointer-events-none shadow-lg">
                  Click and drag to pan • Scroll to zoom
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Information Panel */}
          <div className="w-full lg:w-80 xl:w-96 bg-gradient-to-b from-slate-900 to-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col overflow-y-auto order-1 lg:order-2 max-h-[35vh] lg:max-h-full">
            <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Header */}
              <div>
                <h2 className="text-white text-base sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 break-words leading-tight">{fileName}</h2>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">Compare quality and analyze compression efficiency</p>
              </div>

              {/* Main Stats Cards */}
              <div className="space-y-3 sm:space-y-4">
                <Card className="bg-slate-950 border-slate-800 p-3 sm:p-4 lg:p-5 shadow-xl">
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 sm:mb-2">Original Size</p>
                  <p className="text-white text-xl sm:text-2xl lg:text-3xl font-bold">{formatFileSize(originalSize)}</p>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-500 p-3 sm:p-4 lg:p-5 shadow-xl">
                  <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider mb-1 sm:mb-2">Compressed Size</p>
                  <p className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">{formatFileSize(compressedSize)}</p>
                  <div className="flex items-baseline gap-2">
                    <Badge className="bg-white/20 text-white backdrop-blur-sm text-sm sm:text-base px-2 sm:px-3 py-0.5 sm:py-1 font-bold">
                      {savingsPercent}% smaller
                    </Badge>
                  </div>
                </Card>

                <Card className="bg-slate-950 border-slate-800 p-3 sm:p-4 lg:p-5 shadow-xl">
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 sm:mb-2">Space Saved</p>
                  <p className="text-emerald-400 text-lg sm:text-xl lg:text-2xl font-bold">{formatFileSize(savingsAmount)}</p>
                </Card>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

              {/* Details */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-white font-semibold text-xs sm:text-sm uppercase tracking-wider">Compression Details</h3>
                
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-xs sm:text-sm font-medium">Compression Ratio</span>
                    <span className="text-white text-sm sm:text-base font-bold">{(compressedSize / originalSize).toFixed(3)}:1</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-xs sm:text-sm font-medium">Quality</span>
                    <Badge className="bg-emerald-600 text-white font-semibold text-xs">High</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-xs sm:text-sm font-medium">Processing</span>
                    <Badge className="bg-blue-600 text-white font-semibold text-xs">Browser-side</Badge>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent hidden lg:block" />

              {/* Privacy Notice */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 lg:p-5 hidden lg:block">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg sm:text-xl">🔒</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-xs sm:text-sm mb-1">100% Private</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
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