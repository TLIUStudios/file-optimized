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
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] p-0 overflow-hidden bg-slate-950">
        <DialogHeader className="p-6 pb-4 border-b border-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-white text-xl mb-2">{fileName}</DialogTitle>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Original:</span>
                  <span className="text-white font-medium">{formatFileSize(originalSize)}</span>
                </div>
                <div className="h-4 w-px bg-slate-700" />
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Compressed:</span>
                  <span className="text-emerald-400 font-medium">{formatFileSize(compressedSize)}</span>
                </div>
                <Badge className="bg-emerald-600 text-white">
                  Saved {savingsPercent}%
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6">
          <div 
            ref={containerRef}
            className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden cursor-col-resize select-none"
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
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

            {/* Labels */}
            <Badge className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white border border-slate-700">
              Original
            </Badge>
            <Badge className="absolute top-4 right-4 bg-emerald-600/80 backdrop-blur-sm text-white border border-emerald-500">
              Compressed
            </Badge>

            {/* Slider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-10"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              {/* Slider Handle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center cursor-col-resize">
                <MoveHorizontal className="w-6 h-6 text-slate-900" />
              </div>
            </div>

            {/* Instruction */}
            {sliderPosition === 50 && !isDragging && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm border border-slate-700 pointer-events-none animate-pulse">
                ← Drag to compare →
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
              <p className="text-slate-400 text-sm mb-1">Original Size</p>
              <p className="text-white text-xl font-bold">{formatFileSize(originalSize)}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
              <p className="text-slate-400 text-sm mb-1">Compressed Size</p>
              <p className="text-emerald-400 text-xl font-bold">{formatFileSize(compressedSize)}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
              <p className="text-slate-400 text-sm mb-1">Space Saved</p>
              <p className="text-emerald-400 text-xl font-bold">{savingsPercent}%</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}