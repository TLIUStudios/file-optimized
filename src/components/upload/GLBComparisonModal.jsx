import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import GLBViewer from './GLBViewer';

export default function GLBComparisonModal({ isOpen, onClose, originalFile, compressedFile, originalSize, compressedSize, fileName }) {
   const [sliderPosition, setSliderPosition] = useState(50);

   useEffect(() => {
     if (!isOpen) return;
   }, [isOpen]);

  const handleMouseDown = (e) => {
    const container = e.currentTarget?.parentElement;
    if (!container) return;

    const handleMouseMove = (moveEvent) => {
      const rect = container.getBoundingClientRect();
      const newPosition = Math.max(0, Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100));
      setSliderPosition(newPosition);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 bg-slate-900 border-slate-800">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b border-slate-800">
          <DialogTitle className="text-white">{fileName}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Original</p>
              <p className="text-lg font-semibold text-white">{(originalSize / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Compressed</p>
              <p className="text-lg font-semibold text-emerald-400">{(compressedSize / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
            <p className="text-sm text-slate-300">
              Size reduction: <span className="text-emerald-400 font-semibold">{savings}%</span>
            </p>
          </div>

          <div className="relative w-full h-96 bg-slate-950 rounded-lg overflow-hidden group">
            {/* Original on left */}
            <div className="absolute inset-0">
              <GLBViewer file={originalUrl} label="Original" />
            </div>

            {/* Compressed on right - masked */}
            <div
              className="absolute inset-0"
              style={{
                width: `${100 - sliderPosition}%`,
                right: 0,
                overflow: 'hidden',
              }}
            >
              <GLBViewer file={compressedUrl} label="Compressed" />
            </div>

            {/* Slider handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-emerald-500 cursor-col-resize hover:w-2 transition-all"
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={handleMouseDown}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-500 rounded-full shadow-lg flex items-center justify-center text-white text-xs font-bold">
                ↔
              </div>
            </div>

            {/* Drag instruction */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 rounded text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Drag to compare
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center mt-4">
            Drag the slider left and right to compare the original and compressed 3D models
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}