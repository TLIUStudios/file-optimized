import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, X, Loader2, CheckCircle2, ArrowRight, Settings2, AlertCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import LazyImage from "./LazyImage";

export default function ImageCard({ image, onRemove, onProcessed, onCompare }) {
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [preview, setPreview] = useState(null);
  const [compressedPreview, setCompressedPreview] = useState(null);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState('webp');
  const [maxWidth, setMaxWidth] = useState(null);
  const [maxHeight, setMaxHeight] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setOriginalSize(image.size);
    };
    reader.readAsDataURL(image);
  }, [image]);

  const processImage = async () => {
    setProcessing(true);
    setError(null);
    
    try {
      const img = new Image();
      img.src = preview;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Apply resizing if specified
      if (maxWidth && width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (maxHeight && height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to desired format
      const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
      let qualityValue = quality / 100;
      let blob = null;
      let attempts = 0;
      const maxAttempts = 5;

      // Try to compress, reducing quality if result is larger than original
      while (attempts < maxAttempts) {
        blob = await new Promise((resolve) => {
          canvas.toBlob(
            (b) => resolve(b),
            mimeType,
            qualityValue
          );
        });

        // If compressed size is smaller or we've tried enough times, use it
        if (blob.size < image.size || attempts === maxAttempts - 1) {
          break;
        }

        // Reduce quality and try again
        qualityValue -= 0.15;
        attempts++;
      }

      // If still larger than original, use a more aggressive format
      if (blob.size >= image.size) {
        // Try WebP with lower quality as fallback
        const fallbackQuality = 0.6;
        blob = await new Promise((resolve) => {
          canvas.toBlob(
            (b) => resolve(b),
            'image/webp',
            fallbackQuality
          );
        });

        // If still larger, show error
        if (blob.size >= image.size) {
          setError('Unable to reduce file size. Image may already be highly optimized.');
          setProcessing(false);
          return;
        }
      }

      const compressedUrl = URL.createObjectURL(blob);
      setCompressedPreview(compressedUrl);
      setCompressedSize(blob.size);
      setProcessed(true);

      onProcessed({
        id: image.name,
        originalFile: image,
        compressedBlob: blob,
        compressedUrl,
        originalSize: image.size,
        compressedSize: blob.size,
        format,
        filename: `${image.name.split('.')[0]}.${format}`
      });

    } catch (error) {
      console.error('Error processing image:', error);
      setError('Failed to process image. Please try again.');
    }
    
    setProcessing(false);
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = compressedPreview;
    link.download = `${image.name.split('.')[0]}_compressed.${format}`;
    link.click();
  };

  const handleCompare = () => {
    if (processed && compressedPreview) {
      onCompare({
        original: preview,
        compressed: compressedPreview,
        originalSize,
        compressedSize,
        fileName: image.name
      });
    }
  };

  const savingsPercent = processed 
    ? ((1 - compressedSize / originalSize) * 100).toFixed(1)
    : 0;

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow">
      <div className="relative">
        <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 dark:bg-slate-950">
          {preview && (
            <div 
              className="relative aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 cursor-pointer group"
              onClick={processed ? handleCompare : undefined}
            >
              <LazyImage 
                src={preview} 
                alt="Original" 
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
              />
              <Badge className="absolute top-2 left-2 bg-slate-900/80 text-white">
                Original
              </Badge>
              {processed && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white dark:bg-slate-800 rounded-full p-3">
                    <Eye className="w-6 h-6 text-slate-900 dark:text-white" />
                  </div>
                </div>
              )}
            </div>
          )}
          {compressedPreview ? (
            <div 
              className="relative aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 cursor-pointer group"
              onClick={handleCompare}
            >
              <LazyImage 
                src={compressedPreview} 
                alt="Compressed" 
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
              />
              <Badge className="absolute top-2 left-2 bg-emerald-600 text-white">
                Compressed
              </Badge>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white dark:bg-slate-800 rounded-full p-3">
                  <Eye className="w-6 h-6 text-slate-900 dark:text-white" />
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-square rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <p className="text-sm text-slate-400 text-center px-2">Preview after compression</p>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="font-medium text-sm text-slate-900 dark:text-white truncate" title={image.name}>
            {image.name}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span>{formatFileSize(originalSize)}</span>
            {processed && (
              <>
                <ArrowRight className="w-3 h-3" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {formatFileSize(compressedSize)}
                </span>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  -{savingsPercent}%
                </Badge>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs">{error}</span>
          </div>
        )}

        <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between" size="sm">
              <span className="flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Compression Settings
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Output Format
              </label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webp">WebP (Best compression)</SelectItem>
                  <SelectItem value="jpg">JPG (Universal)</SelectItem>
                  <SelectItem value="png">PNG (Lossless)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Quality: {quality}%
              </label>
              <Slider
                value={[quality]}
                onValueChange={(value) => setQuality(value[0])}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Lower quality = smaller file size
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                  Max Width (px)
                </label>
                <input
                  type="number"
                  placeholder="Auto"
                  value={maxWidth || ''}
                  onChange={(e) => setMaxWidth(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full h-9 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                  Max Height (px)
                </label>
                <input
                  type="number"
                  placeholder="Auto"
                  value={maxHeight || ''}
                  onChange={(e) => setMaxHeight(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full h-9 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex gap-2">
          {!processed ? (
            <Button
              onClick={processImage}
              disabled={processing}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Compress Image'
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={processImage}
                variant="outline"
                className="flex-1"
                disabled={processing}
              >
                Reprocess
              </Button>
              <Button
                onClick={downloadImage}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </>
          )}
        </div>

        {processed && !error && (
          <>
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved {formatFileSize(originalSize - compressedSize)}</span>
            </div>
            <Button
              onClick={handleCompare}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Compare Before/After
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}