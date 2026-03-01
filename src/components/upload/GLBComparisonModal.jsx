import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download as DownloadIcon } from 'lucide-react';
import { toast } from 'sonner';
import GLBViewer from './GLBViewer';

export default function GLBComparisonModal({ isOpen, onClose, originalFile, compressedFile, originalSize, compressedSize, fileName }) {
  const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);
  const savingsAmount = originalSize - compressedSize;

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const downloadCompressed = () => {
    if (!compressedFile) return;
    const url = URL.createObjectURL(compressedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${fileName} downloaded!`);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[98vh] max-h-[98vh] p-0 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 [&>button]:hidden overflow-hidden">
        {/* Top Toolbar */}
        <div className="absolute top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{fileName}</h2>
            <Badge variant="secondary" className="text-xs">3D Model</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={downloadCompressed}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 text-xs font-semibold"
            >
              <DownloadIcon className="w-3 h-3 mr-1.5" />
              Download
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 bg-slate-900/90 dark:bg-slate-900/90 hover:bg-red-600 dark:hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-full overflow-hidden pt-[52px]">
          {/* Left Side - 3D Models Comparison */}
          <div className="flex-1 relative overflow-hidden flex flex-col min-h-0">
            <div className="flex-1 grid grid-cols-2 gap-4 p-4 bg-slate-100 dark:bg-slate-900">
              {/* Original Model */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Original</h3>
                  <Badge className="bg-slate-700 dark:bg-slate-800 text-white text-xs">GLB</Badge>
                </div>
                <div className="flex-1 bg-slate-950 rounded-lg overflow-hidden">
                  <GLBViewer file={originalFile} />
                </div>
              </div>

              {/* Compressed Model */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Compressed</h3>
                  <Badge className="bg-emerald-600 text-white text-xs">GLB</Badge>
                </div>
                <div className="flex-1 bg-slate-950 rounded-lg overflow-hidden">
                  <GLBViewer file={compressedFile} />
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="h-14 px-6 bg-slate-100 dark:bg-slate-900 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold">{savings}%</span> smaller • Optimized with Draco compression
              </div>
            </div>
          </div>

          {/* Right Panel - Stats */}
          <div className="w-full lg:w-80 bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto">
            <div className="p-4 sm:p-5 space-y-4">
              {/* File Info */}
              <div>
                <h2 className="text-slate-900 dark:text-white text-sm font-bold mb-1 break-words line-clamp-2">
                  {fileName}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Compare file sizes and optimization metrics
                </p>
              </div>

              {/* Original Size */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
                  Original Size
                </p>
                <p className="text-slate-900 dark:text-white text-2xl font-bold">
                  {formatFileSize(originalSize)}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">Format: GLB</p>
              </div>

              {/* Compression Result */}
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-4">
                <p className="text-emerald-100 text-[10px] font-semibold uppercase tracking-wider mb-1">
                  Compressed Size
                </p>
                <p className="text-white text-2xl font-bold mb-2">
                  {formatFileSize(compressedSize)}
                </p>
                <Badge className="bg-white/20 text-white text-xs font-bold px-2 py-1">
                  {savings}% smaller
                </Badge>
              </div>

              {/* Space Saved */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
                  Space Saved
                </p>
                <p className="text-emerald-600 dark:text-emerald-400 text-xl font-bold">
                  {formatFileSize(savingsAmount)}
                </p>
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-800" />

              {/* Optimization Details */}
              <div className="space-y-2">
                <h3 className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider">
                  Optimization Details
                </h3>

                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Compression Ratio</span>
                  <span className="text-slate-900 dark:text-white font-bold text-sm">
                    {(compressedSize / originalSize).toFixed(3)}:1
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Method</span>
                  <Badge className="bg-emerald-600 text-white font-semibold text-xs">Draco</Badge>
                </div>

                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Processing</span>
                  <Badge className="bg-blue-600 text-white font-semibold text-xs">Browser-side</Badge>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 mt-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  🔒 All processing happens locally in your browser. Your files never leave your device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}