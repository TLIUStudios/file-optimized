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
      <DialogContent className="max-w-[98vw] w-[98vw] h-[98vh] p-0 overflow-hidden bg-slate-950 flex flex-col border-slate-800">
        {/* Header */}
        <div className="p-4 md:p-6 pb-3 md:pb-4 border-b border-slate-800 flex-shrink-0 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 pr-12">
              <h2 className="text-white text-base md:text-xl mb-2 truncate font-semibold">{fileName}</h2>
              <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Original:</span>
                  <span className="text-white font-medium">{formatFileSize(originalSize)}</span>
                </div>
                <div className="h-4 w-px bg-slate-700" />
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Compressed:</span>
                  <span className="text-emerald-400 font-medium">{formatFileSize(compressedSize)}</span>
                </div>
                <Badge className="bg-emerald-600 text-white text-xs">
                  Saved {savingsPercent}%
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800 flex-shrink-0 absolute top-4 right-4"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-3 md:p-4 relative">
          {/* Zoom Controls */}
          <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
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
            <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-md px-2 py-1 text-xs text-white text-center">
              {(zoom * 100).toFixed(0)}%
            </div>
          </div>

          <div 
            ref={containerRef}
            className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden select-none"
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
            <Badge className="absolute top-4 right-20 bg-emerald-600/80 backdrop-blur-sm text-white border border-emerald-500 text-xs z-10">
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

        {/* Stats */}
        <div className="p-3 md:p-4 flex-shrink-0">
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <div className="bg-slate-900 rounded-lg p-3 md:p-4 border border-slate-800">
              <p className="text-slate-400 text-xs md:text-sm mb-1">Original</p>
              <p className="text-white text-base md:text-xl font-bold truncate">{formatFileSize(originalSize)}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 md:p-4 border border-slate-800">
              <p className="text-slate-400 text-xs md:text-sm mb-1">Compressed</p>
              <p className="text-emerald-400 text-base md:text-xl font-bold truncate">{formatFileSize(compressedSize)}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 md:p-4 border border-slate-800">
              <p className="text-slate-400 text-xs md:text-sm mb-1">Saved</p>
              <p className="text-emerald-400 text-base md:text-xl font-bold">{savingsPercent}%</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}