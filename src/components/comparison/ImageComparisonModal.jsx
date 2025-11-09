import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, MoveHorizontal } from "lucide-react";
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
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, percentage)));
    };

    const handleTouchMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, percentage)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
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
  }, [isDragging]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const savingsPercent = ((1 - compressedSize / originalSize) * 100).toFixed(1);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 overflow-hidden bg-slate-950 flex flex-col">
        <DialogHeader className="p-4 md:p-6 pb-3 md:pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-white text-base md:text-xl mb-2 truncate">{fileName}</DialogTitle>
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
              className="text-slate-400 hover:text-white hover:bg-slate-800 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div 
            ref={containerRef}
            className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden cursor-col-resize select-none flex items-center justify-center"
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
          >
            {/* Compressed Image (Background - Right Side) */}
            <img
              src={compressedImage}
              alt="Compressed"
              className="max-w-full max-h-full w-auto h-auto object-contain"
              draggable="false"
            />

            {/* Original Image (Foreground - Left Side with clip) */}
            <div
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img
                src={originalImage}
                alt="Original"
                className="max-w-full max-h-full w-auto h-auto object-contain"
                draggable="false"
              />
            </div>

            {/* Labels */}
            <Badge className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white border border-slate-700 text-xs">
              Original
            </Badge>
            <Badge className="absolute top-4 right-4 bg-emerald-600/80 backdrop-blur-sm text-white border border-emerald-500 text-xs">
              Compressed
            </Badge>

            {/* Slider Line */}
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
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 md:p-6 pt-0 flex-shrink-0">
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