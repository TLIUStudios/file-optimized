import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, X, Loader2, CheckCircle2, ArrowRight, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function GLBCard({ file, onRemove, onProcessed }) {
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [originalSize, setOriginalSize] = useState(file.size);
  const [compressedSize, setCompressedSize] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [compressedBlob, setCompressedBlob] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const processGLB = async () => {
    setProcessing(true);
    setProcessingProgress(0);
    
    try {
      setProcessingProgress(20);
      
      const arrayBuffer = await file.arrayBuffer();
      const view = new Uint8Array(arrayBuffer);
      
      setProcessingProgress(40);
      
      // Compress using gzip
      const compressedArrayBuffer = await parseAndOptimizeGLB(view);
      const compressedBlob = new Blob([compressedArrayBuffer], { type: 'application/gzip' });
      
      setProcessingProgress(80);
      
      const savings = ((1 - compressedBlob.size / file.size) * 100).toFixed(1);
      setCompressedSize(compressedBlob.size);
      setProcessed(true);
      
      setProcessingProgress(100);
      
      onProcessed({
        id: file.name,
        originalFile: file,
        compressedBlob: compressedBlob,
        compressedUrl: URL.createObjectURL(compressedBlob),
        originalSize: file.size,
        compressedSize: compressedBlob.size,
        format: 'glb',
        filename: file.name.replace('.glb', '.glb.gz'),
        mediaType: '3d',
        fileFormat: 'glb',
        originalFileFormat: 'glb'
      });
      
      toast.success(`GLB compressed! ${Math.abs(parseFloat(savings))}% size reduction`);
    } catch (error) {
      console.error('GLB compression error:', error);
      toast.error('Failed to optimize GLB');
    } finally {
      setProcessing(false);
    }
  };

  const parseAndOptimizeGLB = async (data) => {
    try {
      // Use native gzip compression for actual file size reduction
      const blob = new Blob([data]);
      const stream = blob.stream().pipeThrough(new CompressionStream('gzip'));
      const compressedBlob = await new Response(stream).blob();
      return new Uint8Array(await compressedBlob.arrayBuffer());
    } catch (error) {
      console.error('Gzip compression failed:', error);
      return data;
    }
  };

  const downloadGLB = () => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${file.name} downloaded!`);
  };

  const savingsPercent = processed ? ((1 - compressedSize / originalSize) * 100).toFixed(1) : 0;

  return (
    <Card className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-start gap-2">
          <Film className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            3D Model
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onRemove} 
          className="bg-slate-900/90 dark:bg-slate-900/90 hover:bg-red-600 dark:hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1 truncate" title={file.name}>
            {file.name}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span>{formatFileSize(originalSize)}</span>
            {processed && (
              <>
                <ArrowRight className="w-3 h-3" />
                <span className={cn("font-medium", "text-emerald-600 dark:text-emerald-400")}>{formatFileSize(compressedSize)}</span>
                {savingsPercent > 0 && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    {Math.abs(parseFloat(savingsPercent))}%
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {!processed ? (
            <Button 
              onClick={processGLB} 
              disabled={processing} 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white relative overflow-hidden text-sm"
            >
              {processing && <div className="absolute inset-0 bg-emerald-500 transition-all duration-300 ease-linear" style={{ width: `${processingProgress}%`, left: 0 }} />}
              <span className="relative z-10 flex items-center justify-center">
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Processing... {Math.round(processingProgress)}%</span>
                    <span className="sm:hidden">{Math.round(processingProgress)}%</span>
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Prepare GLB</span>
                    <span className="sm:hidden">Prepare</span>
                  </>
                )}
              </span>
            </Button>
          ) : (
            <Button 
              onClick={downloadGLB} 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Download</span>
              <span className="sm:hidden">Download</span>
            </Button>
          )}
        </div>

        {processed && (
          <div className="flex items-center gap-2 text-sm p-3 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30">
            <CheckCircle2 className="w-4 h-4" />
            <span>GLB ready for download</span>
          </div>
        )}
      </div>
    </Card>
  );
}