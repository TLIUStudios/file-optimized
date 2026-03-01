import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, X, Loader2, CheckCircle2, ArrowRight, Eye, Edit2, Box, RefreshCcw, Cloud, ChevronDown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import GLBComparisonModal from "./GLBComparisonModal";
import GLBViewer from "./GLBViewer";
import { compressGLB } from "./glbCompressor";

export default function GLBCard({ file, onRemove, onProcessed }) {
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [originalSize, setOriginalSize] = useState(file.size);
  const [compressedSize, setCompressedSize] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [compressedBlob, setCompressedBlob] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [fileName, setFileName] = useState(file.name);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const processGLB = async () => {
    setProcessing(true);
    setProcessingProgress(0);
    
    try {
      setProcessingProgress(40);
      
      const compressedBlobData = await compressGLB(file);
      
      setProcessingProgress(80);
      
      const savings = ((1 - compressedBlobData.size / file.size) * 100).toFixed(1);
      setCompressedSize(compressedBlobData.size);
      setCompressedBlob(compressedBlobData);
      setProcessed(true);
      
      setProcessingProgress(100);
      
      // Track compression stat
      try {
        await base44.entities.CompressionStat.create({
          original_size: file.size,
          compressed_size: compressedBlobData.size,
          media_type: '3d',
          output_format: 'glb'
        });
      } catch (error) {
        console.log('Stat tracking error:', error);
      }

      onProcessed({
        id: file.name,
        originalFile: file,
        compressedBlob: compressedBlobData,
        compressedUrl: URL.createObjectURL(compressedBlobData),
        originalSize: file.size,
        compressedSize: compressedBlobData.size,
        format: 'glb',
        filename: file.name,
        mediaType: '3d',
        fileFormat: 'glb',
        originalFileFormat: 'glb'
      });
      
      toast.success(`GLB optimized! ${Math.abs(parseFloat(savings))}% size reduction`);
    } catch (error) {
      console.error('GLB compression error:', error);
      toast.error('Failed to optimize GLB');
    } finally {
      setProcessing(false);
    }
  };



  const downloadGLB = () => {
    if (!compressedBlob) return;
    const url = URL.createObjectURL(compressedBlob);
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

  const handleSaveFileName = () => {
    if (fileName.trim()) {
      setIsRenaming(false);
      toast.success('File renamed');
    }
  };

  return (
    <>
      <Card className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">3D Model</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onRemove} 
            className="bg-slate-900/90 dark:bg-slate-900/90 hover:bg-red-600 dark:hover:bg-red-600 text-white rounded-lg transition-colors h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Preview */}
        <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 dark:bg-slate-950">
          {/* Original GLB */}
          {file && (
            <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-600">
              <GLBViewer file={file} disableInteraction={true} />
              <div className="absolute inset-0 pointer-events-none" />
              <Badge className="absolute top-2 left-2 bg-slate-700 dark:bg-slate-800 text-white border border-slate-600 dark:border-slate-700">
                Original
              </Badge>
              <Badge className="absolute bottom-2 right-2 bg-slate-900 dark:bg-slate-950 text-white border border-slate-700 dark:border-slate-800">
                GLB
              </Badge>
            </div>
          )}
          {/* Compressed GLB */}
          {compressedBlob ? (
            <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-emerald-500 dark:border-emerald-600">
              <GLBViewer file={compressedBlob} disableInteraction={true} />
              <div className="absolute inset-0 pointer-events-none" />
              <Badge className="absolute top-2 left-2 bg-emerald-600 dark:bg-emerald-700 text-white border border-emerald-500 dark:border-emerald-600">
                Optimized
              </Badge>
              <Badge className="absolute bottom-2 right-2 bg-slate-900 dark:bg-slate-950 text-white border border-slate-700 dark:border-slate-800">
                GLB
              </Badge>
            </div>
          ) : (
            <div className="aspect-square rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-400 dark:border-slate-600">
              <p className="text-sm text-slate-400 text-center px-2">Preview after Optimizing Asset</p>
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-2 group">
            {isRenaming ? (
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                onBlur={handleSaveFileName}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveFileName()}
                autoFocus
                className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            ) : (
              <p className="text-sm font-medium text-slate-200 dark:text-slate-300 flex-1 truncate" title={fileName}>
                {fileName}
              </p>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsRenaming(!isRenaming)}
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="w-4 h-4 text-slate-400" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
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

          <div className="space-y-2">
            {!processed ? (
              <Button 
                onClick={processGLB} 
                disabled={processing} 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white relative overflow-hidden"
              >
                {processing && <div className="absolute inset-0 bg-emerald-500 transition-all duration-300 ease-linear" style={{ width: `${processingProgress}%`, left: 0 }} />}
                <span className="relative z-10 flex items-center justify-center">
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing... {Math.round(processingProgress)}%
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Optimize Asset
                    </>
                  )}
                </span>
              </Button>
            ) : (
              <>
                <div className="flex gap-2">
                  <Button 
                    onClick={processGLB} 
                    variant="outline"
                    className="flex-1"
                    disabled={processing}
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Reprocess
                  </Button>
                  <Button 
                    onClick={downloadGLB} 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={processing}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>

                <Button variant="outline" className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0">
                  <Cloud className="w-4 h-4 mr-2" />
                  Save to...
                  <ChevronDown className="w-4 h-4 ml-auto" />
                </Button>
              </>
            )}
          </div>

          {processed && (
            <div className="flex items-center gap-2 text-sm p-3 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved {formatFileSize(originalSize - compressedSize)}</span>
            </div>
          )}
        </div>
      </Card>

      {showComparison && (
        <GLBComparisonModal
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
          originalFile={file}
          compressedFile={compressedBlob}
          originalSize={originalSize}
          compressedSize={compressedSize}
          fileName={file.name}
        />
      )}
    </>
  );
}