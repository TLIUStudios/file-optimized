
import { useState, useEffect, lazy } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, X, Loader2, CheckCircle2, ArrowRight, Settings2, AlertCircle, Info, Edit2, RefreshCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import LazyImage from "./LazyImage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// Lazy load the editor
const ImageEditor = lazy(() => import("./ImageEditor"));

export default function ImageCard({ image, onRemove, onProcessed, onCompare }) {
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [preview, setPreview] = useState(null); // Current original preview (might change after editing)
  const [compressedPreview, setCompressedPreview] = useState(null);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState('webp'); // User's chosen format for initial compression
  const [maxWidth, setMaxWidth] = useState(null);
  const [maxHeight, setMaxHeight] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState(null);
  
  // Advanced settings
  const [compressionMode, setCompressionMode] = useState('balanced');
  const [stripMetadata, setStripMetadata] = useState(true);
  const [noiseReduction, setNoiseReduction] = useState(false);

  // New states for editing and format conversion
  const [showEditor, setShowEditor] = useState(false);
  const [outputFormat, setOutputFormat] = useState(null); // Actual format of the compressedPreview

  // Check if original image is GIF
  const isGif = image.type === 'image/gif';

  useEffect(() => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setOriginalSize(image.size);
    };
    reader.readAsDataURL(image);
    
    // Set format to gif if the image is a gif
    if (isGif) {
      setFormat('gif');
    }
  }, [image, isGif]);

  const processImage = async () => {
    setProcessing(true);
    setError(null);
    setOutputFormat(null); // Reset output format on re-process
    
    try {
      const img = new Image();
      img.src = preview;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Apply resizing if specified - with upscaling support
      if (maxWidth || maxHeight) {
        const aspectRatio = width / height;
        
        if (maxWidth && maxHeight) {
          // Both limits specified - scale to fit within bounds
          const widthRatio = maxWidth / width;
          const heightRatio = maxHeight / height;
          const ratio = Math.min(widthRatio, heightRatio);
          
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        } else if (maxWidth) {
          // Only width specified - scale to exact width (upscale or downscale)
          width = maxWidth;
          height = Math.round(width / aspectRatio);
        } else if (maxHeight) {
          // Only height specified - scale to exact height (upscale or downscale)
          height = maxHeight;
          width = Math.round(height * aspectRatio);
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      
      // Apply noise reduction if enabled (via smoothing)
      if (noiseReduction) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
      
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to desired format
      const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
      
      // Adjust quality based on compression mode
      let baseQuality = quality / 100;
      if (compressionMode === 'aggressive') {
        baseQuality = Math.max(0.5, baseQuality - 0.15);
      } else if (compressionMode === 'maximum') {
        baseQuality = Math.max(0.3, baseQuality - 0.3);
      }
      
      let qualityValue = baseQuality;
      let blob = null;
      let attempts = 0;
      const maxAttempts = compressionMode === 'aggressive' || compressionMode === 'maximum' ? 8 : 5;

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
        if (blob && blob.size < image.size || attempts === maxAttempts - 1) {
          break;
        }
        
        // Ensure quality does not go below zero
        qualityValue = Math.max(0.01, qualityValue - (compressionMode === 'maximum' ? 0.2 : 0.15));
        attempts++;
      }

      // If still larger than original:
      if (blob && blob.size >= image.size) {
        if (!isGif) { // Only try WebP fallback for non-GIFs
            const fallbackQuality = compressionMode === 'maximum' ? 0.4 : 0.6;
            blob = await new Promise((resolve) => {
                canvas.toBlob(
                    (b) => resolve(b),
                    'image/webp',
                    fallbackQuality
                );
            });
            // If still larger after WebP fallback, then show error
            if (blob && blob.size >= image.size) {
                setError('Unable to reduce file size. Image may already be highly optimized or changing format did not help.');
                setProcessing(false);
                return;
            }
        } else { // It's a GIF and didn't reduce significantly
            setError('Unable to significantly reduce GIF file size. GIFs are generally harder to compress without specialized tools.');
            setProcessing(false);
            return;
        }
      }

      const compressedUrl = URL.createObjectURL(blob);
      setCompressedPreview(compressedUrl);
      setCompressedSize(blob.size);
      setProcessed(true);
      setOutputFormat(format); // Set output format to the initially compressed format

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
    link.download = `${image.name.split('.')[0]}_compressed.${outputFormat || format}`;
    link.click();
  };

  const handleCompare = () => {
    if (processed && compressedPreview) {
      onCompare({
        original: preview,
        compressed: compressedPreview,
        originalSize,
        compressedSize,
        fileName: `${image.name.split('.')[0]}_compressed.${outputFormat || format}`
      });
    }
  };

  const handleEditImage = () => {
    setShowEditor(true);
  };

  const handleSaveEdit = (newImageUrl, newBlob) => {
    setPreview(newImageUrl);
    // Update the original size if needed (e.g., if cropping significantly changed content)
    setOriginalSize(newBlob.size); 
    // If the image was already processed, mark it as unprocessed so it needs to be re-compressed
    if (processed) {
      setProcessed(false);
      setCompressedPreview(null);
      setCompressedSize(0);
      setError(null);
    }
    setShowEditor(false);
    toast.success("Image edited successfully. Re-compress to apply changes.");
  };

  const convertFormat = async (newFormat) => {
    if (!compressedPreview || processing) return;
    
    setProcessing(true);
    setError(null);

    try {
      const img = new Image();
      img.src = compressedPreview;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const mimeType = newFormat === 'jpg' ? 'image/jpeg' : `image/${newFormat}`;
      const blob = await new Promise((resolve) => {
        // Use the current compression quality for format conversion
        canvas.toBlob((b) => resolve(b), mimeType, quality / 100);
      });

      const url = URL.createObjectURL(blob);
      setCompressedPreview(url);
      setCompressedSize(blob.size); // Update compressed size for the new format
      setOutputFormat(newFormat); // Update the actual output format
      
      onProcessed({
        id: image.name,
        originalFile: image, // Keep original file
        compressedBlob: blob,
        compressedUrl: url,
        originalSize: originalSize, // Original size remains the same
        compressedSize: blob.size,
        format: newFormat,
        filename: `${image.name.split('.')[0]}.${newFormat}`
      });
      
      toast.success(`Converted to ${newFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Error converting format:', error);
      setError('Failed to convert format');
      toast.error('Failed to convert format');
    } finally {
      setProcessing(false);
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

  // Extract file extensions
  const originalExt = image.name.split('.').pop().toUpperCase();
  const displayFormat = outputFormat || format;
  const displayCompressedExt = displayFormat.toUpperCase();

  // Define available formats based on whether it's a GIF
  const availableFormats = isGif ? ['gif'] : ['avif', 'jpg', 'png', 'webp'];

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
              <Badge className="absolute bottom-2 right-2 bg-slate-900/95 backdrop-blur-sm text-white border border-slate-700 text-xs px-2 py-1 font-bold shadow-lg">
                {originalExt}
              </Badge>
              {!isGif && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditImage();
                  }}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 h-7 w-7 rounded-lg"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
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
              <Badge className="absolute bottom-2 right-2 bg-emerald-600/95 backdrop-blur-sm text-white border border-emerald-500 text-xs px-2 py-1 font-bold shadow-lg">
                {displayCompressedExt}
              </Badge>
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
          className="absolute top-2 right-2 bg-slate-900/90 dark:bg-slate-900/90 hover:bg-red-600 dark:hover:bg-red-600 text-white rounded-lg transition-colors z-10"
        >
          <X className="w-4 h-4" />
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

        {/* Format Converter - shown after compression */}
        {processed && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Convert Format
            </label>
            <div className="grid grid-cols-4 gap-2">
              {availableFormats.map((fmt) => (
                <Button
                  key={fmt}
                  size="sm"
                  variant={displayFormat === fmt ? "default" : "outline"}
                  onClick={() => convertFormat(fmt)}
                  disabled={displayFormat === fmt || processing}
                  className={cn(
                    "relative text-xs h-9",
                    displayFormat === fmt && "bg-emerald-600 hover:bg-emerald-700"
                  )}
                >
                  {fmt.toUpperCase()}
                  {fmt === 'webp' && (
                    <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500 animate-pulse" />
                  )}
                  {displayFormat === fmt && processing && <Loader2 className="ml-1 h-3 w-3 animate-spin" />}
                </Button>
              ))}
            </div>
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
            <TooltipProvider>
              {/* Compression Mode */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Compression Algorithm
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-slate-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        <strong>Balanced:</strong> Good quality with moderate compression<br/>
                        <strong>Aggressive:</strong> Smaller files with slight quality loss<br/>
                        <strong>Maximum:</strong> Smallest files, noticeable quality reduction
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select value={compressionMode} onValueChange={setCompressionMode} disabled={processing}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                    <SelectItem value="maximum">Maximum Compression</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Output Format */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Output Format
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-slate-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        <strong>WebP:</strong> Best compression, modern browsers<br/>
                        <strong>JPG:</strong> Universal support, good for photos<br/>
                        <strong>PNG:</strong> Lossless, best for graphics/transparency
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select value={format} onValueChange={setFormat} disabled={processing || isGif}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {isGif ? (
                      <SelectItem value="gif">GIF (Animated)</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="avif">AVIF (Newer, more efficient)</SelectItem>
                        <SelectItem value="webp">WebP (Best compression)</SelectItem>
                        <SelectItem value="jpg">JPG (Universal)</SelectItem>
                        <SelectItem value="png">PNG (Lossless)</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Quality Slider */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Quality: {quality}%
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-slate-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">Lower quality = smaller file size. 70-85% is usually optimal for web use.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Slider
                  value={[quality]}
                  onValueChange={(value) => setQuality(value[0])}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                  disabled={processing}
                />
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Max Width (px)
                    </label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-slate-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Scales image proportionally to fit within this width while maintaining aspect ratio</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <input
                    type="number"
                    placeholder="Auto"
                    value={maxWidth || ''}
                    onChange={(e) => setMaxWidth(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full h-9 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                    disabled={processing}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Max Height (px)
                    </label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-slate-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Scales image proportionally to fit within this height while maintaining aspect ratio</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <input
                    type="number"
                    placeholder="Auto"
                    value={maxHeight || ''}
                    onChange={(e) => setMaxHeight(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full h-9 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                    disabled={processing}
                  />
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Strip Metadata
                    </label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-slate-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Removes EXIF data, GPS coordinates, and other metadata to reduce file size and improve privacy</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Switch
                    checked={stripMetadata}
                    onCheckedChange={setStripMetadata}
                    disabled={processing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Noise Reduction
                    </label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-slate-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Applies smoothing to reduce image noise, which can help achieve better compression ratios</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Switch
                    checked={noiseReduction}
                    onCheckedChange={setNoiseReduction}
                    disabled={processing}
                  />
                </div>
              </div>
            </TooltipProvider>
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
                <RefreshCcw className="w-4 h-4 mr-2" />
                Reprocess
              </Button>
              <Button
                onClick={downloadImage}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={processing}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </>
          )}
        </div>

        {processed && !error && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            <span>Saved {formatFileSize(originalSize - compressedSize)}</span>
          </div>
        )}
      </div>

      {/* Editor Modal - Lazy load */}
      {showEditor && !isGif && (
        <ImageEditor
          isOpen={showEditor}
          onClose={() => setShowEditor(false)}
          imageData={preview}
          onSave={handleSaveEdit}
        />
      )}
    </Card>
  );
}
