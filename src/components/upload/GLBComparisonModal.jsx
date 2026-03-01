import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import GLBViewer from './GLBViewer';

export default function GLBComparisonModal({ isOpen, onClose, originalFile, compressedFile, originalSize, compressedSize, fileName }) {
  const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] p-0 bg-slate-900 border-slate-800">
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
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Original</p>
              <p className="text-lg font-semibold text-white">{(originalSize / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            <div className="flex items-end justify-center">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-sm text-slate-300">
                  <span className="text-emerald-400 font-semibold text-base">{savings}%</span>
                  <span className="text-slate-400"> reduction</span>
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Compressed</p>
              <p className="text-lg font-semibold text-emerald-400">{(compressedSize / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white">Before</h3>
              <div className="w-full h-96 bg-slate-950 rounded-lg overflow-hidden">
                <GLBViewer file={originalFile} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white">After</h3>
              <div className="w-full h-96 bg-slate-950 rounded-lg overflow-hidden">
                <GLBViewer file={compressedFile} />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}