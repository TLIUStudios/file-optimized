import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, MoveHorizontal, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[98vh] p-0 overflow-hidden bg-slate-950 border-slate-800">
        <div className="flex h-full">
          {/* Left Side - Image Comparison */}
          <div className="flex-1 relative overflow-hidden">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 z-30 text-slate-400 hover:text-white hover:bg-slate-800/80 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Zoom Controls */}
            <div className="absolute top-4 right-16 z-20 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={handleZoomIn}
                className="bg-slate-800/90 hover:bg-slate-700 backdrop-blur-sm border border-slate-700"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-white" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleZoomOut}
                className="bg-slate-800/90 hover:bg-slate-700 backdrop-blur-sm border border-slate-700"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-white" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleResetZoom}
                className="bg-slate-800/90 hover:bg-slate-700 backdrop-blur-sm border border-slate-700"
                title="Reset Zoom"
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </Button>
              <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-md px-3 py-2 text-xs text-white flex items-center">
                {(zoom * 100).toFixed(0)}%
              </div>
            </div>

            <div 
              ref={containerRef}
              className="relative w-full h-full bg-slate-900 select-none"
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
                  position: 'relative'
                }}
              >
                {/* Compressed Image (Background - Right Side) */}
                <img
                  src={compressedImage}
                  alt="Compressed"
                  className="absolute inset-0 w-full h-full object-contain"
                  draggable="false"
                />

                {/* Original Image (Foreground - Left Side with clip) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img
                    src={originalImage}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-contain"
                    draggable="false"
                  />
                </div>
              </div>

              {/* Labels */}
              <Badge className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white border border-slate-700 text-xs z-10">
                Original
              </Badge>
              <Badge className="absolute top-4 left-24 bg-emerald-600/80 backdrop-blur-sm text-white border border-emerald-500 text-xs z-10">
                Compressed
              </Badge>

              {/* Slider Line - only show when not zoomed/panning */}
              {zoom === 1 && !isPanning && (
                <>
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-10"
                    style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                  >
                    {/* Slider Handle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-2xl flex items-center justify-center cursor-col-resize">
                      <MoveHorizontal className="w-5 h-5 md:w-6 md:h-6 text-slate-900" />
                    </div>
                  </div>

                  {/* Instruction */}
                  {sliderPosition === 50 && !isDragging && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm text-white px-3 py-2 md:px-4 rounded-full text-xs md:text-sm border border-slate-700 pointer-events-none animate-pulse">
                      ← Drag to compare →
                    </div>
                  )}
                </>
              )}

              {/* Pan instruction when zoomed */}
              {zoom > 1 && !isPanning && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm text-white px-3 py-2 md:px-4 rounded-full text-xs md:text-sm border border-slate-700 pointer-events-none">
                  Click and drag to pan • Scroll to zoom
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Information Panel */}
          <div className="w-80 xl:w-96 bg-slate-900 border-l border-slate-800 flex flex-col p-6 overflow-y-auto">
            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-white text-lg font-semibold mb-2 break-words">{fileName}</h2>
                <p className="text-slate-400 text-sm">Compare the quality and file size between original and compressed versions</p>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                  <p className="text-slate-400 text-xs mb-2">Original Size</p>
                  <p className="text-white text-2xl font-bold">{formatFileSize(originalSize)}</p>
                </div>

                <div className="bg-slate-950 rounded-lg p-4 border border-emerald-800/30">
                  <p className="text-slate-400 text-xs mb-2">Compressed Size</p>
                  <p className="text-emerald-400 text-2xl font-bold">{formatFileSize(compressedSize)}</p>
                </div>

                <div className="bg-emerald-600 rounded-lg p-4">
                  <p className="text-emerald-100 text-xs mb-2">Total Savings</p>
                  <p className="text-white text-3xl font-bold">{savingsPercent}%</p>
                  <p className="text-emerald-100 text-sm mt-2">
                    Reduced by {formatFileSize(originalSize - compressedSize)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">Compression Ratio</span>
                  <span className="text-white font-medium">{(compressedSize / originalSize).toFixed(2)}:1</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">Quality</span>
                  <Badge className="bg-emerald-600 text-white">High</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">Processing</span>
                  <Badge className="bg-blue-600 text-white">Local</Badge>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-slate-500 text-xs text-center">
                🔒 All processing happens in your browser. Your images never leave your device.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}