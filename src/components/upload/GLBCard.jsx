import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, X, Loader2, CheckCircle2, ArrowRight, Film, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import GLBComparisonModal from "./GLBComparisonModal";

export default function GLBCard({ file, onRemove, onProcessed }) {
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [originalSize, setOriginalSize] = useState(file.size);
  const [compressedSize, setCompressedSize] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [compressedBlob, setCompressedBlob] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

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
      
      // Optimize GLB structure
      const compressedArrayBuffer = parseAndOptimizeGLB(view);
      const compressedBlobData = new Blob([compressedArrayBuffer], { type: 'model/gltf-binary' });
      
      setProcessingProgress(80);
      
      const savings = ((1 - compressedBlobData.size / file.size) * 100).toFixed(1);
      setCompressedSize(compressedBlobData.size);
      setCompressedBlob(compressedBlobData);
      setProcessed(true);
      
      setProcessingProgress(100);
      
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

  const parseAndOptimizeGLB = (data) => {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const magic = view.getUint32(0, true);
    
    if (magic !== 0x46546C67) return data;

    const version = view.getUint32(4, true);
    const totalLength = view.getUint32(8, true);
    
    if (version !== 2) return data;

    let offset = 12;
    let jsonChunk = null;
    let binChunk = null;

    // Parse chunks
    while (offset < totalLength) {
      if (offset + 8 > totalLength) break;
      const chunkLength = view.getUint32(offset, true);
      const chunkType = view.getUint32(offset + 4, true);
      const chunkStart = offset + 8;

      if (chunkType === 0x4E4F534A) {
        jsonChunk = data.slice(chunkStart, chunkStart + chunkLength);
      } else if (chunkType === 0x004E4942) {
        binChunk = data.slice(chunkStart, chunkStart + chunkLength);
      }

      offset += 8 + chunkLength;
    }

    if (!jsonChunk || !binChunk) return data;

    const decoder = new TextDecoder();
    const jsonStr = decoder.decode(jsonChunk).trim();
    const json = JSON.parse(jsonStr);

    // Remove metadata and unnecessary extensions to reduce size
    delete json.asset?.generator;
    delete json.extras;
    
    if (json.extensionsUsed) {
      json.extensionsUsed = json.extensionsUsed.filter(e => 
        !['KHR_materials_unlit', 'KHR_lights_punctual'].includes(e)
      );
      if (json.extensionsUsed.length === 0) delete json.extensionsUsed;
    }

    if (json.extensions) {
      Object.keys(json.extensions).forEach(key => {
        if (['KHR_materials_unlit', 'KHR_lights_punctual'].includes(key)) {
          delete json.extensions[key];
        }
      });
      if (Object.keys(json.extensions).length === 0) delete json.extensions;
    }

    // Minify JSON
    const optimizedJsonStr = JSON.stringify(json);
    const encoder = new TextEncoder();
    const optimizedJsonData = encoder.encode(optimizedJsonStr);

    // Pad JSON chunk to 4-byte alignment
    const jsonPadding = (4 - (optimizedJsonData.length % 4)) % 4;
    const paddedJsonLength = optimizedJsonData.length + jsonPadding;

    // Build new GLB
    const newFileLength = 12 + 8 + paddedJsonLength + 8 + binChunk.length;
    const newGLB = new Uint8Array(newFileLength);
    const newView = new DataView(newGLB.buffer);

    // Header
    newView.setUint32(0, 0x46546C67, true);
    newView.setUint32(4, 2, true);
    newView.setUint32(8, newFileLength, true);

    // JSON chunk
    let pos = 12;
    newView.setUint32(pos, paddedJsonLength, true);
    pos += 4;
    newView.setUint32(pos, 0x4E4F534A, true);
    pos += 4;
    newGLB.set(optimizedJsonData, pos);
    pos += optimizedJsonData.length + jsonPadding;

    // Binary chunk
    newView.setUint32(pos, binChunk.length, true);
    pos += 4;
    newView.setUint32(pos, 0x004E4942, true);
    pos += 4;
    newGLB.set(binChunk, pos);

    return newGLB;
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

  return (
    <>
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
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowComparison(true)} 
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Preview</span>
                <span className="sm:hidden">View</span>
              </Button>
              <Button 
                onClick={downloadGLB} 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">DL</span>
              </Button>
            </div>
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