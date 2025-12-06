import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, MoveHorizontal, ZoomIn, ZoomOut, Maximize2, Copy, RefreshCw, Download as DownloadIcon, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import SocialShareModal from "../SocialShareModal";

export default function ImageComparisonModal({
  isOpen,
  onClose,
  originalImage,
  compressedImage,
  originalSize,
  compressedSize,
  fileName,
  mediaType = 'image',
  fileFormat = 'webp',
  originalFileFormat = null,
  generatedAnimations = null,
  cachedFormatData = null,
  cachedSeoMetadata = null,
  onFormatDataCached = null,
  onSeoMetadataCached = null
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(fileFormat);
  const [previewFormat, setPreviewFormat] = useState(fileFormat);
  const [isConverting, setIsConverting] = useState(false);
  const [allFormatSizes, setAllFormatSizes] = useState({});
  const [cachedFormatBlobs, setCachedFormatBlobs] = useState({});
  const [formatsGenerated, setFormatsGenerated] = useState(false);
  const [loadingFormatSizes, setLoadingFormatSizes] = useState(false);
  const [previewSize, setPreviewSize] = useState(compressedSize);
  const [convertedBlob, setConvertedBlob] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const [aiTitle, setAiTitle] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [aiCategory, setAiCategory] = useState("");
  const [aiMood, setAiMood] = useState("");
  const [aiAltText, setAiAltText] = useState("");
  const [aiTags, setAiTags] = useState("");
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiHashtags, setAiHashtags] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const isAnimationVariations = generatedAnimations && generatedAnimations.length > 0;
  const originalExt = originalFileFormat ? originalFileFormat.toUpperCase() : fileName.split('.').pop().toUpperCase();
  
  const availableFormats = mediaType === 'video' 
    ? ['mp4', 'gif']
    : mediaType === 'audio'
    ? ['mp3', 'wav']
    : fileFormat === 'gif'
    ? ['gif', 'mp4']
    : ['jpg', 'png', 'webp', 'avif'];

  // Load image dimensions
  useEffect(() => {
    if (originalImage && mediaType === 'image') {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = originalImage;
    }
  }, [originalImage, mediaType]);

  // Load cached data
  useEffect(() => {
    if (cachedSeoMetadata) {
      setAiTitle(cachedSeoMetadata.title || "");
      setAiDescription(cachedSeoMetadata.description || "");
      setAiCategory(cachedSeoMetadata.category || "");
      setAiMood(cachedSeoMetadata.mood || "");
      setAiAltText(cachedSeoMetadata.altText || "");
      setAiTags(cachedSeoMetadata.tags || "");
      setAiKeywords(cachedSeoMetadata.keywords || "");
      setAiHashtags(cachedSeoMetadata.hashtags || "");
    }
  }, [cachedSeoMetadata]);

  useEffect(() => {
    if (cachedFormatData && mediaType === 'image' && !isAnimationVariations) {
      setAllFormatSizes(cachedFormatData.sizes);
      setCachedFormatBlobs(cachedFormatData.blobs);
      setFormatsGenerated(true);
    }
  }, [cachedFormatData, mediaType, isAnimationVariations]);

  // Slider drag handlers
  useEffect(() => {
    const handleMove = (clientX) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    };

    const handleMouseMove = (e) => {
      if (isDragging) handleMove(e.clientX);
    };

    const handleTouchMove = (e) => {
      if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX);
    };

    const handleEnd = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const generateAllFormats = async () => {
    if (loadingFormatSizes) return;
    setLoadingFormatSizes(true);
    const sizes = {};
    const blobs = {};

    try {
      const currentBlob = await fetch(compressedImage).then(r => r.blob());
      sizes[fileFormat] = compressedSize;
      blobs[fileFormat] = currentBlob;

      const img = new Image();
      img.src = compressedImage;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      for (const format of ['jpg', 'png', 'webp', 'avif']) {
        if (format === fileFormat) continue;
        
        try {
          const mimeType = format === 'jpg' ? 'image/jpeg' : format === 'avif' ? 'image/avif' : `image/${format}`;
          const quality = format === 'jpg' ? 0.85 : 0.90;
          const blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
          
          if (blob) {
            sizes[format] = blob.size;
            blobs[format] = blob;
          }
        } catch (err) {
          console.warn(`Failed to generate ${format}:`, err);
        }
      }

      setAllFormatSizes(sizes);
      setCachedFormatBlobs(blobs);
      setFormatsGenerated(true);
      
      if (onFormatDataCached) {
        onFormatDataCached({ sizes, blobs });
      }
    } catch (error) {
      console.error('Error generating formats:', error);
    } finally {
      setLoadingFormatSizes(false);
    }
  };

  const convertToFormat = async (format) => {
    if (format === selectedFormat) return;
    
    setIsConverting(true);
    setSelectedFormat(format);
    
    const cachedBlob = cachedFormatBlobs[format];
    if (cachedBlob) {
      setConvertedBlob(cachedBlob);
      setPreviewSize(cachedBlob.size);
      setPreviewFormat(format);
    }
    
    setIsConverting(false);
  };

  const downloadMedia = () => {
    const blob = convertedBlob || (async () => {
      const res = await fetch(compressedImage);
      return await res.blob();
    })();
    
    Promise.resolve(blob).then(b => {
      const url = URL.createObjectURL(b);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName.split('.')[0]}.${selectedFormat}`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Downloaded!');
    });
  };

  const downloadAllFormatsZip = async () => {
    toast.info('Creating ZIP...');
    const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
    const zip = new JSZip();
    const baseName = fileName.split('.')[0];

    for (const [format, blob] of Object.entries(cachedFormatBlobs)) {
      if (blob) zip.file(`${baseName}.${format}`, blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${baseName}-all-formats.zip`;
    link.click();
    toast.success('Downloaded!');
  };

  const generateMetadata = async () => {
    if (mediaType !== 'image') return;
    setIsGenerating(true);

    try {
      const res = await fetch(compressedImage);
      const blob = await res.blob();
      const file = new File([blob], 'image.jpg', { type: blob.type });
      const uploadResult = await base44.integrations.Core.UploadFile({ file });

      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt: "Analyze this image and provide: title (60 chars max), description (160 chars max), category (1-2 words), mood (1-2 words), alt text (125 chars max), 10 social tags (comma-separated), 10 SEO keywords (comma-separated), 10 hashtags (format: #word, #word2)",
        file_urls: [uploadResult.file_url],
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            mood: { type: "string" },
            alt_text: { type: "string" },
            tags: { type: "string" },
            keywords: { type: "string" },
            hashtags: { type: "string" }
          }
        }
      });

      setAiTitle(aiResult.title || "");
      setAiDescription(aiResult.description || "");
      setAiCategory(aiResult.category || "");
      setAiMood(aiResult.mood || "");
      setAiAltText(aiResult.alt_text || "");
      setAiTags(aiResult.tags || "");
      setAiKeywords(aiResult.keywords || "");
      setAiHashtags(aiResult.hashtags || "");
      
      if (onSeoMetadataCached) {
        onSeoMetadataCached({
          title: aiResult.title,
          description: aiResult.description,
          category: aiResult.category,
          mood: aiResult.mood,
          altText: aiResult.alt_text,
          tags: aiResult.tags,
          keywords: aiResult.keywords,
          hashtags: aiResult.hashtags
        });
      }
      
      toast.success('Metadata generated!');
    } catch (error) {
      toast.error('Failed to generate metadata');
    } finally {
      setIsGenerating(false);
    }
  };

  const displaySize = previewSize;
  const savingsPercent = ((1 - displaySize / originalSize) * 100).toFixed(1);
  const savingsAmount = originalSize - displaySize;
  const sizeIncreased = displaySize > originalSize;
  const hasAnyMetadata = aiTitle || aiDescription || aiCategory || aiMood || aiAltText || aiTags || aiKeywords || aiHashtags;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[98vh] p-0 bg-slate-950 [&>button]:hidden">
        
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-slate-900/95 backdrop-blur border-b border-slate-800">
          <div className="flex items-center gap-2">
            {mediaType === 'image' && !isAnimationVariations && (
              <>
                <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(3, zoom + 0.25))} className="h-9 w-9 text-white hover:bg-slate-800">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="h-9 w-9 text-white hover:bg-slate-800">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setZoom(1)} className="h-9 w-9 text-white hover:bg-slate-800">
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <div className="bg-slate-800 rounded px-3 h-9 flex items-center text-xs text-white font-medium">
                  {(zoom * 100).toFixed(0)}%
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isAnimationVariations && (
              <div className="flex gap-1 bg-slate-800 rounded p-1">
                {availableFormats.map((fmt) => (
                  <Button
                    key={fmt}
                    onClick={() => convertToFormat(fmt)}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 px-3 text-xs text-white",
                      selectedFormat === fmt && "bg-emerald-600 hover:bg-emerald-700"
                    )}
                  >
                    {fmt.toUpperCase()}
                  </Button>
                ))}
              </div>
            )}
            
            <Button onClick={downloadMedia} className="bg-emerald-600 hover:bg-emerald-700 h-9 px-4 text-xs text-white">
              <DownloadIcon className="w-4 h-4 mr-1.5" />
              Download
            </Button>
            
            {mediaType === 'image' && !isAnimationVariations && (
              <Button onClick={downloadAllFormatsZip} variant="outline" className="h-9 px-3 text-xs border-slate-700 text-white hover:bg-slate-800">
                ZIP
              </Button>
            )}
            
            <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 text-white hover:bg-red-600">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex h-full pt-[60px]">
          {/* Image Comparison Area */}
          <div className="flex-1 flex flex-col bg-slate-900">
            {mediaType === 'image' && !isAnimationVariations ? (
              <>
                <div
                  ref={containerRef}
                  className="flex-1 relative bg-slate-900 select-none overflow-hidden flex items-center justify-center"
                  style={{ cursor: 'col-resize' }}
                  onMouseDown={() => setIsDragging(true)}
                  onTouchStart={() => setIsDragging(true)}
                >
                  <div className="relative flex" style={{ transform: `scale(${zoom})` }}>
                    {/* Original image - left side */}
                    <div style={{ width: `${sliderPosition}%`, overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={originalImage}
                        alt="Original"
                        className="h-auto max-h-[calc(100vh-200px)] w-auto"
                        draggable="false"
                        style={{ maxWidth: 'none', display: 'block' }}
                      />
                    </div>
                    
                    {/* Compressed image - right side */}
                    <div style={{ width: `${100 - sliderPosition}%`, overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={compressedImage}
                        alt="Compressed"
                        className="h-auto max-h-[calc(100vh-200px)] w-auto"
                        draggable="false"
                        style={{ maxWidth: 'none', display: 'block', marginLeft: `-${sliderPosition / (100 - sliderPosition) * 100}%` }}
                      />
                    </div>
                    
                    {/* Slider */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl"
                      style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)', pointerEvents: 'none' }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-2 border-slate-400">
                        <MoveHorizontal className="w-5 h-5 text-slate-800" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom labels */}
                <div className="h-16 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
                  <div className="flex flex-col gap-1">
                    <Badge className="bg-slate-700 text-white text-sm px-3 py-1 font-semibold w-fit">Original</Badge>
                    <Badge className="bg-slate-700 text-white text-xs px-2 py-0.5 font-bold w-fit">{originalExt}</Badge>
                  </div>
                  {zoom === 1 && (
                    <div className="px-4 py-2 bg-slate-700/80 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
                      ← Drag to compare →
                    </div>
                  )}
                  <div className="flex flex-col gap-1 items-end">
                    <Badge className="bg-emerald-600 text-white text-sm px-3 py-1 font-semibold w-fit">Compressed</Badge>
                    <Badge className="bg-emerald-600 text-white text-xs px-2 py-0.5 font-bold w-fit">{previewFormat.toUpperCase()}</Badge>
                  </div>
                </div>
              </>
            ) : isAnimationVariations ? (
              <div className="flex-1 bg-slate-900 p-4 overflow-auto">
                <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
                  {generatedAnimations.map((anim, i) => (
                    <div
                      key={i}
                      className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-500"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = anim.url;
                        link.download = `${fileName.split('.')[0]}_${anim.name.toLowerCase().replace(/\s+/g, '_')}.gif`;
                        link.click();
                        toast.success(`${anim.name} downloaded!`);
                      }}
                    >
                      <img src={anim.url} alt={anim.name} className="w-full h-full object-contain" />
                      <Badge className="absolute top-2 left-2 bg-emerald-600">{anim.name}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-slate-900 flex items-center justify-center p-4">
                {mediaType === 'video' && <video controls src={compressedImage} className="max-w-full max-h-full" />}
                {mediaType === 'audio' && <audio controls src={compressedImage} className="w-full" />}
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="w-[400px] bg-slate-900 border-l border-slate-800 overflow-y-auto flex-shrink-0">
            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-white text-sm font-bold mb-1 break-words">{fileName}</h2>
                <p className="text-slate-400 text-xs">Compare quality and analyze compression efficiency</p>
              </div>

              <Button variant="outline" className="w-full border-slate-700 text-white hover:bg-slate-800" size="sm" onClick={() => setShowSocialShare(true)}>
                <Share2 className="w-4 h-4 mr-2" />
                Share to Social Media
              </Button>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Original Size</p>
                <p className="text-white text-2xl font-bold">{formatFileSize(originalSize)}</p>
                <p className="text-slate-400 text-xs mt-2">Format: {originalExt}</p>
              </div>

              {mediaType === 'image' && !isAnimationVariations && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-3">Available Formats</p>
                  {!formatsGenerated ? (
                    <div className="text-center py-3">
                      <p className="text-xs text-slate-400 mb-2">Generate all formats to compare sizes</p>
                      <Badge variant="outline" className="border-emerald-600 text-emerald-400 mb-3 text-xs">
                        ~3-5s estimated
                      </Badge>
                      <Button onClick={generateAllFormats} disabled={loadingFormatSizes} size="sm" className="bg-emerald-600 hover:bg-emerald-700 w-full text-white">
                        {loadingFormatSizes ? <RefreshCw className="w-3 h-3 animate-spin mr-2" /> : <RefreshCw className="w-3 h-3 mr-2" />}
                        {loadingFormatSizes ? 'Generating...' : 'Generate Formats'}
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {availableFormats.map((format) => {
                        const size = allFormatSizes[format] || previewSize;
                        const isSelected = selectedFormat === format;
                        const isBigger = size > originalSize;
                        const percentChange = (((size - originalSize) / originalSize) * 100).toFixed(1);
                        
                        return (
                          <button
                            key={format}
                            onClick={() => convertToFormat(format)}
                            className={cn(
                              "p-3 rounded-lg border text-left transition-all",
                              isSelected
                                ? isBigger
                                  ? "bg-red-900/20 border-red-600"
                                  : "bg-emerald-900/20 border-emerald-600"
                                : "bg-slate-900 border-slate-700 hover:border-slate-600"
                            )}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-white uppercase">{format}</span>
                              {isSelected && <Check className="w-3 h-3 text-emerald-500" />}
                            </div>
                            <div className="text-sm font-semibold text-white">{formatFileSize(size)}</div>
                            <div className={cn(
                              "text-xs mt-1",
                              isBigger ? "text-red-400" : "text-emerald-400"
                            )}>
                              {isBigger ? '+' : ''}{percentChange}%
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className={cn(
                "rounded-lg p-4",
                sizeIncreased ? "bg-gradient-to-br from-red-600 to-red-700" : "bg-gradient-to-br from-emerald-600 to-emerald-700"
              )}>
                <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wider mb-1">
                  Space Saved (WEBP)
                </p>
                <p className="text-white text-2xl font-bold mb-2">{formatFileSize(Math.abs(savingsAmount))}</p>
                <Badge className="bg-white/20 text-white text-xs px-2 py-0.5 font-bold">
                  {savingsPercent}%
                </Badge>
              </div>

              {mediaType === 'image' && !isAnimationVariations && (
                <>
                  <div className="h-px bg-slate-800" />
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold text-xs uppercase tracking-wider">Optimization Details</h3>
                    {imageDimensions.width > 0 && (
                      <div className="flex items-center justify-between py-2 px-3 bg-slate-800 rounded-lg border border-slate-700">
                        <span className="text-slate-400 text-xs font-medium">Resolution</span>
                        <span className="text-white font-bold text-sm">{imageDimensions.width} × {imageDimensions.height}</span>
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-slate-800" />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-semibold text-xs uppercase tracking-wider">SEO Generation</h3>
                      {hasAnyMetadata && (
                        <Button variant="ghost" size="sm" onClick={generateMetadata} className="h-7 px-2 text-xs text-white hover:bg-slate-800">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Regenerate
                        </Button>
                      )}
                    </div>

                    {!hasAnyMetadata ? (
                      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
                        <p className="text-xs text-slate-400 mb-3">Generate AI-powered metadata</p>
                        <Badge variant="outline" className="border-emerald-600 text-emerald-400 mb-3 text-xs">
                          ~5-10s estimated
                        </Badge>
                        <Button onClick={generateMetadata} disabled={isGenerating} size="sm" className="bg-slate-700 hover:bg-slate-600 w-full text-white">
                          {isGenerating ? <RefreshCw className="w-3 h-3 animate-spin mr-2" /> : <RefreshCw className="w-3 h-3 mr-2" />}
                          {isGenerating ? 'Generating...' : 'Generate Metadata'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Title</label>
                          <input
                            value={aiTitle}
                            readOnly
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                          />
                        </div>
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Description</label>
                          <textarea
                            value={aiDescription}
                            readOnly
                            rows={2}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white resize-none"
                          />
                        </div>
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Tags</label>
                          <input
                            value={aiTags}
                            readOnly
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                <p className="text-xs text-slate-400 text-center">
                  🔒 All processing happens locally in your browser
                </p>
              </div>
            </div>
          </div>
        </div>

        <SocialShareModal
          isOpen={showSocialShare}
          onClose={() => setShowSocialShare(false)}
          imageUrl={compressedImage}
          fileName={fileName}
        />
      </DialogContent>
    </Dialog>
  );
}