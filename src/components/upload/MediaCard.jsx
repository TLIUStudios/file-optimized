
import { useState, useEffect, lazy, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, X, Loader2, CheckCircle2, ArrowRight, Settings2, AlertCircle, Info, Edit2, RefreshCcw, Sparkles, Film, Music, Video, ChevronDown, Check, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LazyImage from "./LazyImage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger, // Added TooltipTrigger
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

// Lazy load the editor and download modal
const ImageEditor = lazy(() => import("./ImageEditor"));
const DownloadModal = lazy(() => import("./DownloadModal"));
const GifEditor = lazy(() => import("./GifEditor"));
const VideoEditor = lazy(() => import("./VideoEditor")); // New: Lazy load VideoEditor
const AudioEditor = lazy(() => import("./AudioEditor")); // New: Lazy load AudioEditor

export default function MediaCard({ image, onRemove, onProcessed, onCompare, autoProcess }) {
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
  const [compressionMode, setCompressionMode] = useState('balanced');
  const [stripMetadata, setStripMetadata] = useState(true);
  const [noiseReduction, setNoiseReduction] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [outputFormat, setOutputFormat] = useState(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [compressedBlob, setCompressedBlob] = useState(null);
  const [enableUpscale, setEnableUpscale] = useState(false);
  const [upscaleSettingsOpen, setUpscaleSettingsOpen] = useState(false);
  const [upscaleMultiplier, setUpscaleMultiplier] = useState(null);
  const [originalImageDimensions, setOriginalImageDimensions] = useState({ width: 0, height: 0 });
  const [showGifEditor, setShowGifEditor] = useState(false);
  const [showVideoEditor, setShowVideoEditor] = useState(false); // New: State for Video Editor
  const [showAudioEditor, setShowAudioEditor] = useState(false); // New: State for Audio Editor

  // Animation states
  const [animationSettingsOpen, setAnimationSettingsOpen] = useState(false);
  const [enableAnimation, setEnableAnimation] = useState(false);
  const [animationDuration, setAnimationDuration] = useState(5);
  const [animationType, setAnimationType] = useState('zoom'); // 'zoom', 'glow'
  const [generatedAnimations, setGeneratedAnimations] = useState([]);

  // Processing time states
  const [processingStartTime, setProcessingStartTime] = useState(null);
  const [estimatedTimeForFile, setEstimatedTimeForFile] = useState(null);

  // GIF.js states (kept for regular GIF processing)
  const [gifJsLoaded, setGifJsLoaded] = useState(false);
  const [workerBlobUrl, setWorkerBlobUrl] = useState(null);
  const [outputGifFrameCount, setOutputGifFrameCount] = useState(0);

  // Editable filename
  const [editableFilename, setIsEditingFilename] = useState('');
  const [isEditingFilename, setEditableFilename] = useState(false);

  // Add metadata viewer state
  const [showMetadataViewer, setShowMetadataViewer] = useState(false);
  const [fileMetadata, setFileMetadata] = useState(null);

  // Media type detection
  const isImage = image.type.startsWith('image/');
  const isVideo = image.type.startsWith('video/');
  const isAudio = image.type.startsWith('audio/');
  const isGif = image.type === 'image/gif';

  // GIF-specific states
  const [gifFrameCount, setGifFrameCount] = useState(0);
  const [gifSettings, setGifSettings] = useState({ width: 0, height: 0, frames: [] });

  // Video/Audio specific states
  const [videoBitrate, setVideoBitrate] = useState(1000);
  const [audioBitrate, setAudioBitrate] = useState(128);
  const [frameRate, setFrameRate] = useState(30);
  const [videoPreset, setVideoPreset] = useState('medium');
  const [videoResolution, setVideoResolution] = useState('original'); // 'original', '1080p', '720p', '480p'
  const [audioQuality, setAudioQuality] = useState('standard');
  const [gifOptimization, setGifOptimization] = useState('quality'); // Changed default to 'quality'

  // FFmpeg states
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);
  const [ffmpegLoadError, setFfmpegLoadError] = useState(null);
  const ffmpegRef = useRef(null);

  const processMediaRef = useRef(null);

  // Load FFmpeg when video/audio is uploaded - IMPROVED ERROR HANDLING
  useEffect(() => {
    // Check if FFmpeg is needed for current media type or format (e.g., GIF to MP4)
    if ((isVideo || isAudio || (isGif && format === 'mp4')) && !ffmpegLoaded && !ffmpegLoading && !ffmpegLoadError) {
      loadFFmpeg();
    }
  }, [isVideo, isAudio, isGif, format, ffmpegLoaded, ffmpegLoading, ffmpegLoadError]);

  const loadFFmpeg = async () => {
    if (ffmpegLoading || ffmpegLoaded) return;

    setFfmpegLoading(true);

    try {
      console.log('🎬 Loading FFmpeg from unpkg.com...');
      console.log('⏳ This may take 10-30 seconds depending on your connection');

      // Import FFmpeg library
      const FFmpegModule = await import('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js');
      const { FFmpeg } = FFmpegModule;

      console.log('✅ FFmpeg library imported');
      const ffmpeg = new FFmpeg();

      ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]:', message);
      });

      ffmpeg.on('progress', ({ progress }) => {
        if (progress > 0 && progress < 1) {
          console.log(`[FFmpeg] Progress: ${(progress * 100).toFixed(0)}%`);
        }
      });

      console.log('🔄 Loading FFmpeg core files (WASM)...');

      // Load FFmpeg core
      await ffmpeg.load({
        coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
        wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
      });

      ffmpegRef.current = ffmpeg;
      setFfmpegLoaded(true);
      setFfmpegLoading(false);
      setFfmpegLoadError(null);

      console.log('✅ FFmpeg fully loaded and ready!');
      toast.success('Video/audio processor loaded successfully!');

    } catch (error) {
      console.error('❌ FFmpeg load error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name
      });

      setFfmpegLoading(false);
      setFfmpegLoadError(error.message);

      // Detailed error message for user
      let errorMsg = 'Failed to load video/audio processor. ';

      if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
        errorMsg += 'Check your internet connection and try refreshing the page.';
      } else if (error.message.includes('CORS')) {
        errorMsg += 'Browser security blocked the request. Try using Chrome or Edge.';
      } else if (error.message.includes('SharedArrayBuffer')) {
        errorMsg += 'Your browser needs SharedArrayBuffer support. Use Chrome/Edge with HTTPS.';
      } else {
        errorMsg += `Error: ${error.message}`;
      }

      toast.error(errorMsg, { duration: 10000 });
    }
  };

  useEffect(() => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      setPreview(reader.result);
      setOriginalSize(image.size);
      setIsEditingFilename(image.name);

      if (isImage && !isGif) {
        const img = new Image();
        img.onload = () => {
          setOriginalImageDimensions({ width: img.width, height: img.height });
        };
        img.src = reader.result;
      }

      if (isGif) {
        try {
          await parseGif(reader.result);
        } catch (error) {
          console.error('Error parsing GIF:', error);
        }
      }
    };
    reader.readAsDataURL(image);

    if (isGif) {
      setFormat('gif');
    } else if (isVideo) {
      setFormat('mp4');
    } else if (isAudio) {
      setFormat('mp3');
    } else if (isImage) {
      setFormat('jpg');
    }
  }, [image, isGif, isVideo, isAudio, isImage]);

  useEffect(() => {
    if (autoProcess && !processed && !processing && processMediaRef.current) {
      processMediaRef.current();
    }
  }, [autoProcess, processed, processing]);

  useEffect(() => {
    // Load GIF.js for both animations AND GIF compression
    if (((enableAnimation && isImage && !isGif) || isGif) && !gifJsLoaded) {
      const loadGifJs = async () => {
        try {
          if (window.GIF && workerBlobUrl) {
            setGifJsLoaded(true);
            return;
          }

          console.log('📦 Loading GIF.js library...');

          if (!window.GIF) {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js';
              script.onload = () => {
                setTimeout(() => {
                  if (window.GIF) resolve();
                  else reject(new Error('GIF.js not available after script load'));
                }, 100);
              };
              script.onerror = () => reject(new Error('Failed to load GIF.js'));
              document.head.appendChild(script);
            });
          }

          console.log('👷 Loading worker script...');
          const workerResponse = await fetch('https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js');
          const workerText = await workerResponse.text();
          const workerBlob = new Blob([workerText], { type: 'application/javascript' });
          const workerUrl = URL.createObjectURL(workerBlob);

          setWorkerBlobUrl(workerUrl);
          setGifJsLoaded(true);
          console.log('✅ GIF.js and worker loaded successfully');

          if (enableAnimation) {
            toast.success('Animation engine ready!');
          }
        } catch (error) {
          console.error('Failed to load GIF.js:', error);
          toast.error('Failed to load GIF processor: ' + error.message);
        }
      };

      loadGifJs();
    }
  }, [enableAnimation, isGif, gifJsLoaded, workerBlobUrl, isImage]);

  useEffect(() => {
    return () => {
      if (workerBlobUrl) {
        URL.revokeObjectURL(workerBlobUrl);
      }
    };
  }, [workerBlobUrl]);

  // Update estimated time during processing
  useEffect(() => {
    if (processing && processingStartTime) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - processingStartTime;
        // Estimate based on file type and size
        let estimatedTotal = 3000; // Default 3 seconds

        if (isGif) {
          estimatedTotal = Math.max(5000, gifFrameCount * 50); // ~50ms per frame
        } else if (isVideo) {
          estimatedTotal = Math.max(10000, image.size / 100000); // Rough estimate
        } else if (isImage && enableAnimation) {
          estimatedTotal = 8000; // Animation takes ~8 seconds
        } else if (isImage) {
          estimatedTotal = 2000; // Simple image compression
        }

        const remaining = Math.max(0, estimatedTotal - elapsed);
        setEstimatedTimeForFile(Math.ceil(remaining / 1000));
      }, 500);

      return () => clearInterval(interval);
    } else {
      setEstimatedTimeForFile(null);
    }
  }, [processing, processingStartTime, isGif, isVideo, isImage, enableAnimation, gifFrameCount, image.size]);


  const parseGif = async (dataUrl) => {
    try {
      const response = await fetch(dataUrl);
      const arrayBuffer = await response.arrayBuffer();

      const { parseGIF, decompressFrames } = await import('https://cdn.jsdelivr.net/npm/gifuct-js@2.1.2/+esm');
      const gif = parseGIF(arrayBuffer);
      const frames = decompressFrames(gif, true);

      setGifFrameCount(frames.length);
      setGifSettings({
        width: frames[0]?.dims?.width || 0,
        height: frames[0]?.dims?.height || 0,
        frames: frames
      });
    } catch (error) {
      console.error('Error parsing GIF:', error);
    }
  };

  const getAspectRatio = (width, height) => {
    if (!width || !height) return "N/A";
    const commonDivisor = (a, b) => b === 0 ? a : commonDivisor(b, a % b);
    const divisor = commonDivisor(width, height);
    const ratioW = width / divisor;
    const ratioH = height / divisor;

    // Provide common named ratios for better UX
    const ratioFloat = width / height;
    if (Math.abs(ratioFloat - 1) < 0.01) return "1:1 (Square)";
    if (Math.abs(ratioFloat - 16/9) < 0.01) return "16:9 (Widescreen)";
    if (Math.abs(ratioFloat - 4/3) < 0.01) return "4:3 (Standard)";
    if (Math.abs(ratioFloat - 3/2) < 0.01) return "3:2";
    if (Math.abs(ratioFloat - 21/9) < 0.01) return "21:9 (Ultrawide)";
    if (Math.abs(ratioFloat - 9/16) < 0.01) return "9:16 (Vertical)";

    // Fallback for less common ratios, simplify if numbers are large
    if (ratioW > 100 || ratioH > 100) {
      return `${ratioFloat.toFixed(2)}:1`;
    }
    return `${ratioW}:${ratioH}`;
  };

  // Add function to extract metadata
  const extractMetadata = async () => {
    try {
      const metadata = {
        name: editableFilename,
        type: image.type,
        size: formatFileSize(originalSize),
        lastModified: new Date(image.lastModified).toLocaleString(),
      };

      if (isImage && !isGif) {
        const img = new Image();
        img.src = preview;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error('Failed to load image for metadata.'));
        });
        metadata.width = img.width;
        metadata.height = img.height;
        metadata.aspectRatio = getAspectRatio(img.width, img.height);
      } else if (isGif) {
        metadata.width = gifSettings.width || 'N/A';
        metadata.height = gifSettings.height || 'N/A';
        metadata.frames = gifFrameCount || 'N/A';
        metadata.aspectRatio = getAspectRatio(gifSettings.width, gifSettings.height);
      } else if (isVideo) {
        metadata.format = 'Video File';
      } else if (isAudio) {
        metadata.format = 'Audio File';
      }

      if (processed) {
        metadata.compressedSize = formatFileSize(compressedSize);
        metadata.savings = `${savingsPercent}%`;
        metadata.compressedFormat = displayCompressedExt;
        if (outputGifFrameCount > 0) metadata.compressedFrames = outputGifFrameCount;
      }

      setFileMetadata(metadata);
      setShowMetadataViewer(true);
    } catch (error) {
      console.error('Error extracting metadata:', error);
      toast.error('Failed to extract metadata: ' + error.message);
    }
  };

  const processMedia = async () => {
    setProcessing(true);
    setProcessingStartTime(Date.now());
    setError(null);
    setOutputFormat(null);
    setOutputGifFrameCount(0);

    try {
      if (isImage && !isGif && enableAnimation) { // NEW: Handle simple animation
        await processImageToAnimation();
      } else if (isVideo) {
        if (!ffmpegLoaded) {
          toast.error('Video processor still loading. Please wait...');
          setProcessing(false);
          setProcessingStartTime(null);
          return;
        }
        if (format === 'gif') {
          await convertVideoToGif();
        } else {
          await processVideo();
        }
      } else if (isAudio) {
        if (!ffmpegLoaded) {
          toast.error('Audio processor still loading. Please wait...');
          setProcessing(false);
          setProcessingStartTime(null);
          return;
        }
        await processAudio();
      } else if (isGif) {
        if (!ffmpegLoaded && format === 'mp4') { // Only block if MP4 conversion is requested
          toast.error('Video processor still loading (needed for GIF to MP4 conversion). Please wait...');
          setProcessing(false);
          setProcessingStartTime(null);
          return;
        }
        if (format === 'mp4') {
          await convertGifToMp4();
        } else {
          await processGif();
        }
      } else if (isImage) {
        await processStaticImage();
      }
    } catch (error) {
      console.error('Error processing media:', error);
      setError(`Failed to process. ${error.message}`);
      toast.error('Processing failed: ' + error.message);
    }

    setProcessing(false);
    setProcessingStartTime(null);
    setEstimatedTimeForFile(null);
  };

  useEffect(() => {
    processMediaRef.current = processMedia;
  });

  // Video processing with FFmpeg
  const processVideo = async () => {
    try {
      console.log('🎥 Starting video compression...');
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) throw new Error('FFmpeg not loaded');

      // Write input file
      const inputData = new Uint8Array(await image.arrayBuffer());
      const inputExt = image.name.split('.').pop();
      await ffmpeg.writeFile(`input.${inputExt}`, inputData);

      // Build FFmpeg command based on settings
      const args = ['-i', `input.${inputExt}`];

      // Video codec and quality
      args.push('-c:v', 'libx264');
      args.push('-preset', videoPreset);
      args.push('-crf', String(Math.round((100 - quality) / 4))); // 0-25 CRF scale

      // Bitrate
      if (videoBitrate) {
        args.push('-b:v', `${videoBitrate}k`);
      }

      // Frame rate
      if (frameRate) {
        args.push('-r', String(frameRate));
      }

      // Resolution
      if (videoResolution !== 'original') {
        const resMap = {
          '1080p': '1920:-1', // -1 maintains aspect ratio
          '720p': '1280:-1',
          '480p': '854:-1'
        };
        args.push('-vf', `scale=${resMap[videoResolution]}`);
      }

      // Audio
      args.push('-c:a', 'aac');
      args.push('-b:a', `${audioBitrate}k`);

      args.push('output.mp4');

      console.log('FFmpeg command:', args.join(' '));
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });

      // Cleanup
      await ffmpeg.deleteFile(`input.${inputExt}`);
      await ffmpeg.deleteFile('output.mp4');

      const compressedUrl = URL.createObjectURL(blob);
      setCompressedPreview(compressedUrl);
      setCompressedSize(blob.size);
      setCompressedBlob(blob);
      setProcessed(true);
      setOutputFormat('mp4');

      onProcessed({
        id: image.name,
        originalFile: image,
        compressedBlob: blob,
        compressedUrl,
        originalSize: image.size,
        compressedSize: blob.size,
        format: 'mp4',
        filename: getOutputFilename('mp4'),
        mediaType: 'video',
        fileFormat: 'mp4'
      });

      const savings = ((1 - blob.size / image.size) * 100).toFixed(1);
      toast.success(`Video compressed! Saved ${savings}%`);
    } catch (error) {
      console.error('Video processing failed:', error);
      throw error;
    }
  };

  // Audio processing with FFmpeg
  const processAudio = async () => {
    try {
      console.log('🎵 Starting audio compression...');
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) throw new Error('FFmpeg not loaded');

      const inputExt = image.name.split('.').pop();
      await ffmpeg.writeFile(`input.${inputExt}`, new Uint8Array(await image.arrayBuffer()));

      const outputExt = format;
      const args = ['-i', `input.${inputExt}`];

      if (format === 'mp3') {
        args.push('-codec:a', 'libmp3lame');
        args.push('-b:a', `${audioBitrate}k`);
        args.push('-q:a', audioQuality === 'high' ? '0' : audioQuality === 'standard' ? '2' : '4');
      } else if (format === 'wav') {
        args.push('-codec:a', 'pcm_s16le'); // PCM 16-bit signed little-endian
        args.push('-ar', '44100'); // Default sample rate
      }

      args.push(`output.${outputExt}`);

      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(`output.${outputExt}`);
      const mimeType = format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
      const blob = new Blob([data.buffer], { type: mimeType });

      await ffmpeg.deleteFile(`input.${inputExt}`);
      await ffmpeg.deleteFile(`output.${outputExt}`);

      const compressedUrl = URL.createObjectURL(blob);
      setCompressedPreview(compressedUrl);
      setCompressedSize(blob.size);
      setCompressedBlob(blob);
      setProcessed(true);
      setOutputFormat(format);

      onProcessed({
        id: image.name,
        originalFile: image,
        compressedBlob: blob,
        compressedUrl,
        originalSize: image.size,
        compressedSize: blob.size,
        format,
        filename: getOutputFilename(format),
        mediaType: 'audio',
        fileFormat: format
      });

      const savings = ((1 - blob.size / image.size) * 100).toFixed(1);
      toast.success(`Audio compressed! Saved ${savings}%`);
    } catch (error) {
      console.error('Audio processing failed:', error);
      throw error;
    }
  };

  // Convert video to GIF
  const convertVideoToGif = async () => {
    try {
      console.log('🎬 Converting video to GIF...');
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) throw new Error('FFmpeg not loaded');

      const inputExt = image.name.split('.').pop();
      await ffmpeg.writeFile(`input.${inputExt}`, new Uint8Array(await image.arrayBuffer()));

      const fps = Math.max(5, Math.round(frameRate / 2)); // Use half of desired frame rate, min 5
      const scale = maxWidth || 480; // Default to 480px width if not set

      await ffmpeg.exec([
        '-i', `input.${inputExt}`,
        '-vf', `fps=${fps},scale=${scale}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
        '-loop', '0',
        'output.gif'
      ]);

      const data = await ffmpeg.readFile('output.gif');
      const blob = new Blob([data.buffer], { type: 'image/gif' });

      await ffmpeg.deleteFile(`input.${inputExt}`);
      await ffmpeg.deleteFile('output.gif');

      const compressedUrl = URL.createObjectURL(blob);
      setCompressedPreview(compressedUrl);
      setCompressedSize(blob.size);
      setCompressedBlob(blob);
      setProcessed(true);
      setOutputFormat('gif');

      onProcessed({
        id: image.name,
        originalFile: image,
        compressedBlob: blob,
        compressedUrl,
        originalSize: image.size,
        compressedSize: blob.size,
        format: 'gif',
        filename: getOutputFilename('gif'),
        mediaType: 'image',
        fileFormat: 'gif'
      });

      toast.success('Video converted to GIF!');
    } catch (error) {
      console.error('Video to GIF conversion failed:', error);
      throw error;
    }
  };

  // Convert GIF to MP4
  const convertGifToMp4 = async () => {
    try {
      console.log('🎞️ Converting GIF to MP4...');
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) throw new Error('FFmpeg not loaded');

      const response = await fetch(preview);
      const gifBlob = await response.blob();
      await ffmpeg.writeFile('input.gif', new Uint8Array(await gifBlob.arrayBuffer()));

      // Basic conversion settings, could be expanded
      await ffmpeg.exec([
        '-i', 'input.gif',
        '-movflags', 'faststart',
        '-pix_fmt', 'yuv420p',
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', // Ensure even dimensions for compatibility
        'output.mp4'
      ]);

      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });

      await ffmpeg.deleteFile('input.gif');
      await ffmpeg.deleteFile('output.mp4');

      const compressedUrl = URL.createObjectURL(blob);
      setCompressedPreview(compressedUrl);
      setCompressedSize(blob.size);
      setCompressedBlob(blob);
      setProcessed(true);
      setOutputFormat('mp4');

      onProcessed({
        id: image.name,
        originalFile: image,
        compressedBlob: blob,
        compressedUrl,
        originalSize: image.size,
        compressedSize: blob.size,
        format: 'mp4',
        filename: getOutputFilename('mp4'),
        mediaType: 'video',
        fileFormat: 'mp4'
      });

      toast.success('GIF converted to MP4!');
    } catch (error) {
      console.error('GIF to MP4 conversion failed:', error);
      throw error;
    }
  };

  const processGif = async () => {
    try {
      console.log('🎞️ Starting GIF optimization...');

      if (!gifJsLoaded || !window.GIF || !workerBlobUrl) {
        toast.error('GIF processor still loading. Please wait...');
        return;
      }

      const response = await fetch(preview);
      const originalBlob = await response.blob();

      if (!gifSettings.frames || gifSettings.frames.length === 0) {
        console.warn('No frames found, using original');
        const compressedUrl = URL.createObjectURL(originalBlob);
        setCompressedPreview(compressedUrl);
        setCompressedSize(originalBlob.size);
        setCompressedBlob(originalBlob);
        setProcessed(true);
        setOutputFormat('gif');
        setOutputGifFrameCount(gifFrameCount);

        onProcessed({
          id: image.name,
          originalFile: image,
          compressedBlob: originalBlob,
          compressedUrl,
          originalSize: image.size,
          compressedSize: originalBlob.size,
          format: 'gif',
          filename: getOutputFilename('gif'),
          mediaType: 'image',
          fileFormat: 'gif'
        });

        toast.info('GIF has no frames to optimize');
        return;
      }

      console.log(`Original: ${gifSettings.frames.length} frames, ${gifSettings.width}x${gifSettings.height}`);

      // KEEP EXACT ORIGINAL DIMENSIONS
      const targetWidth = gifSettings.width;
      const targetHeight = gifSettings.height;

      const framesToProcess = gifSettings.frames;
      const maxFrames = Math.min(framesToProcess.length, 500);

      console.log(`Processing ${maxFrames} frames...`);

      // Background canvas for frame accumulation
      const backgroundCanvas = document.createElement('canvas');
      backgroundCanvas.width = targetWidth;
      backgroundCanvas.height = targetHeight;
      const backgroundCtx = backgroundCanvas.getContext('2d', { alpha: true });

      backgroundCtx.clearRect(0, 0, targetWidth, targetHeight);

      const processedFrames = [];

      for (let i = 0; i < maxFrames; i++) {
        const frame = framesToProcess[i];
        if (!frame || !frame.patch || !frame.dims) continue;

        try {
          // Handle disposal
          if (i > 0) {
            const prevFrame = framesToProcess[i - 1];
            if (prevFrame && prevFrame.disposalType === 2) {
              backgroundCtx.clearRect(
                prevFrame.dims.left || 0,
                prevFrame.dims.top || 0,
                prevFrame.dims.width,
                prevFrame.dims.height
              );
            }
          }

          // Draw frame patch
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = frame.dims.width;
          tempCanvas.height = frame.dims.height;
          const tempCtx = tempCanvas.getContext('2d', { alpha: true });

          if (!tempCtx) continue;

          const imageData = new ImageData(
            new Uint8ClampedArray(frame.patch),
            frame.dims.width,
            frame.dims.height
          );
          tempCtx.putImageData(imageData, 0, 0);

          backgroundCtx.imageSmoothingEnabled = true;
          backgroundCtx.imageSmoothingQuality = 'high';
          backgroundCtx.drawImage(
            tempCanvas,
            frame.dims.left || 0,
            frame.dims.top || 0
          );

          // Copy to output canvas
          const outputCanvas = document.createElement('canvas');
          outputCanvas.width = targetWidth;
          outputCanvas.height = targetHeight;
          const outputCtx = outputCanvas.getContext('2d', { alpha: true });
          outputCtx.drawImage(backgroundCanvas, 0, 0);

          // EXACT original delay - frame.delay is in centiseconds
          const originalDelay = frame.delay || 10; // Default to 10 centiseconds (100ms) if missing
          const delayMs = originalDelay * 10; // Convert to milliseconds

          processedFrames.push({
            canvas: outputCanvas,
            delay: delayMs
          });

          if (i % 10 === 0) {
            console.log(`Frame ${i + 1}/${maxFrames} (${delayMs}ms)`);
          }
        } catch (err) {
          console.error(`Frame ${i} error:`, err);
        }
      }

      if (processedFrames.length === 0) {
        throw new Error('No frames processed');
      }

      console.log(`✨ Encoding ${processedFrames.length} frames...`);

      const GIF = window.GIF;

      // Use quality 10 for balanced compression (1=best/largest, 20=worst/smallest)
      const gifQuality = 10;

      const gif = new GIF({
        workers: 4,
        quality: gifQuality,
        width: targetWidth,
        height: targetHeight,
        workerScript: workerBlobUrl,
        repeat: 0,
        dither: false,
        transparent: null
      });

      for (let i = 0; i < processedFrames.length; i++) {
        const { canvas, delay } = processedFrames[i];
        gif.addFrame(canvas, {
          delay: delay,
          copy: true,
          dispose: 2
        });
      }

      const gifBlob = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 300000);

        gif.on('finished', (blob) => {
          clearTimeout(timeout);
          console.log(`✅ Done: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
          resolve(blob);
        });

        gif.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });

        gif.render();
      });

      if (!gifBlob || gifBlob.size === 0) {
        throw new Error('Encoding failed');
      }

      const compressedUrl = URL.createObjectURL(gifBlob);
      setCompressedPreview(compressedUrl);
      setCompressedSize(gifBlob.size);
      setCompressedBlob(gifBlob);
      setProcessed(true);
      setOutputFormat('gif');
      setOutputGifFrameCount(processedFrames.length);

      onProcessed({
        id: image.name,
        originalFile: image,
        compressedBlob: gifBlob,
        compressedUrl,
        originalSize: image.size,
        compressedSize: gifBlob.size,
        format: 'gif',
        filename: getOutputFilename('gif'),
        mediaType: 'image',
        fileFormat: 'gif'
      });

      const savings = ((1 - gifBlob.size / image.size) * 100).toFixed(1);

      if (gifBlob.size < image.size) {
        toast.success(`✨ GIF optimized! ${processedFrames.length} frames • Saved ${savings}%`);
      } else {
        toast.warning(`GIF processed (${(gifBlob.size / 1024 / 1024).toFixed(2)}MB). May already be optimized.`);
      }
    } catch (error) {
      console.error('❌ GIF failed:', error);

      try {
        const response = await fetch(preview);
        const originalBlob = await response.blob();
        const compressedUrl = URL.createObjectURL(originalBlob);

        setCompressedPreview(compressedUrl);
        setCompressedSize(originalBlob.size);
        setCompressedBlob(originalBlob);
        setProcessed(true);
        setOutputFormat('gif');

        onProcessed({
          id: image.name,
          originalFile: image,
          compressedBlob: originalBlob,
          compressedUrl,
          originalSize: image.size,
          compressedSize: originalBlob.size,
          format: 'gif',
          filename: getOutputFilename('gif'),
          mediaType: 'image',
          fileFormat: 'gif'
        });

        toast.warning('Using original GIF');
      } catch (fallbackError) {
        throw error;
      }
    }
  };

  const processStaticImage = async () => {
    const img = new Image();
    img.src = preview;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;

    // Handle upscaling with multiplier or custom dimensions
    if (enableUpscale && upscaleMultiplier) {
      // Use multiplier
      width = Math.round(img.width * (upscaleMultiplier / 100));
      height = Math.round(img.height * (upscaleMultiplier / 100));
    } else if (maxWidth || maxHeight || enableUpscale) { // The '|| enableUpscale' here ensures the block is entered if only upscaling is enabled without specific dims/multiplier
      const aspectRatio = width / height;

      if (maxWidth && maxHeight) {
        const widthRatio = maxWidth / img.width;
        const heightRatio = maxHeight / img.height;
        const ratio = enableUpscale ? Math.max(widthRatio, heightRatio) : Math.min(widthRatio, heightRatio);

        width = Math.round(img.width * ratio);
        height = Math.round(img.height * ratio);
      } else if (maxWidth) {
        // If enabling upscale and maxWidth is set, apply it.
        // If not enabling upscale, only apply if maxWidth is less than current width (downscale).
        if (enableUpscale || maxWidth < width) {
          width = maxWidth;
          height = Math.round(maxWidth / aspectRatio);
        }
      } else if (maxHeight) {
        // Similar logic for maxHeight
        if (enableUpscale || maxHeight < height) {
          height = maxHeight;
          width = Math.round(maxHeight * aspectRatio);
        }
      }
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    if (noiseReduction || enableUpscale) { // Added enableUpscale
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }

    ctx.drawImage(img, 0, 0, width, height);

    const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;

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

    while (attempts < maxAttempts) {
      blob = await new Promise((resolve) => {
        canvas.toBlob(
          (b) => resolve(b),
          mimeType,
          qualityValue
        );
      });

      if (enableUpscale || blob.size < image.size || attempts === maxAttempts - 1) {
        break;
      }

      qualityValue -= compressionMode === 'maximum' ? 0.2 : 0.15;
      attempts++;
    }

    if (!enableUpscale && blob.size >= image.size) { // Only show error if not upscaling and size increased
      const fallbackQuality = compressionMode === 'maximum' ? 0.4 : 0.6;
      blob = await new Promise((resolve) => {
        canvas.toBlob(
          (b) => resolve(b),
          'image/webp',
          fallbackQuality
        );
      });

      if (blob.size >= image.size) {
        setError('Unable to reduce file size. Image may already be highly optimized.');
        return;
      }
    }

    const compressedUrl = URL.createObjectURL(blob);
    setCompressedPreview(compressedUrl);
    setCompressedSize(blob.size);
    setCompressedBlob(blob); // ADDED
    setProcessed(true);
    setOutputFormat(format);

    onProcessed({
      id: image.name,
      originalFile: image,
      compressedBlob: blob,
      compressedUrl,
      originalSize: image.size,
      compressedSize: blob.size,
      format,
      filename: getOutputFilename(format), // Use new helper
      mediaType: 'image',
      fileFormat: format
    });
  };

  // Ultra-smooth professional animation effects
  const processImageToAnimation = async () => {
    if (!gifJsLoaded || !window.GIF || !workerBlobUrl) {
      toast.error('Animation library not ready. Please wait...');
      return;
    }

    try {
      console.log(`🎬 Creating ${animationType} animation...`);
      toast.info('Creating animation from your image...', { duration: Infinity, id: 'anim-gen' });

      // Load the original image
      const img = new Image();
      img.src = preview;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
      });

      console.log(`✅ Image loaded: ${img.width}x${img.height}`);

      // Prepare canvas
      let width = Math.min(img.width, 800);
      let height = Math.min(img.height, 800);

      // Maintain aspect ratio
      if (img.width > width || img.height > height) {
        const ratio = Math.min(width / img.width, height / img.height);
        width = Math.round(img.width * ratio);
        height = Math.round(img.height * ratio);
      }

      // Ensure even dimensions
      width = width % 2 === 0 ? width : width - 1;
      height = height % 2 === 0 ? height : height - 1;

      const totalFrames = 120; // 120 frames for ultra-smooth animation
      const frames = [];

      console.log(`Generating ${totalFrames} frames with ${animationType} effect...`);

      for (let i = 0; i < totalFrames; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, width, height);
        ctx.save();

        // Calculate smooth progress using easing (0 to 1 and back to 0)
        const rawProgress = i < totalFrames / 2
          ? i / (totalFrames / 2)
          : 2 - (i / (totalFrames / 2));

        // Apply smooth easing (ease-in-out cubic)
        const progress = rawProgress < 0.5
          ? 4 * rawProgress * rawProgress * rawProgress
          : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

        // Apply animation effect - ONLY ZOOM AND GLOW
        switch (animationType) {
          case 'zoom':
            // Smooth zoom from 100% to 110% and back
            const scale = 1 + (progress * 0.1);
            ctx.translate(width / 2, height / 2);
            ctx.scale(scale, scale);
            ctx.translate(-width / 2, -height / 2);
            break;

          case 'glow':
            // Subtle glow pulsing effect
            const glowIntensity = progress * 0.3;

            // Draw image normally first
            ctx.globalAlpha = 1;
            ctx.drawImage(img, 0, 0, width, height);

            // Add glow layer
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = glowIntensity;
            ctx.filter = 'blur(8px)';
            ctx.drawImage(img, -4, -4, width + 8, height + 8);

            ctx.restore();
            frames.push(canvas);
            continue; // Skip normal drawing
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();

        frames.push(canvas);

        if (i % 20 === 0) {
          console.log(`Generated frame ${i + 1}/${totalFrames}`);
        }
      }

      console.log(`✅ All frames generated, creating GIF...`);
      toast.info('Rendering GIF...', { id: 'anim-gen' });

      // Create GIF
      const GIF = window.GIF;
      const gif = new GIF({
        workers: 4,
        quality: 5,
        width,
        height,
        workerScript: workerBlobUrl,
        repeat: 0,
        dither: false
      });

      const frameDelay = Math.round((animationDuration * 1000) / totalFrames);

      for (const canvas of frames) {
        gif.addFrame(canvas, { delay: frameDelay, copy: true, dispose: 2 });
      }

      const gifBlob = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 180000);
        gif.on('finished', (blob) => { clearTimeout(timeout); resolve(blob); });
        gif.on('error', (err) => { clearTimeout(timeout); reject(err); });
        gif.on('progress', (p) => {
          if (p % 0.2 < 0.01) {
            toast.info(`Rendering: ${(p * 100).toFixed(0)}%...`, { id: 'anim-gen' });
          }
        });
        gif.render();
      });

      console.log(`✅ GIF created: ${(gifBlob.size / 1024).toFixed(1)}KB`);

      const gifUrl = URL.createObjectURL(gifBlob);
      const animationData = {
        name: animationType.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        blob: gifBlob,
        url: gifUrl,
        size: gifBlob.size,
        description: `${animationType} effect applied to your image`,
        frameCount: totalFrames
      };

      setGeneratedAnimations([animationData]);

      setCompressedPreview(gifUrl);
      setCompressedSize(gifBlob.size);
      setCompressedBlob(gifBlob);
      setProcessed(true);
      setOutputFormat('gif');
      setOutputGifFrameCount(totalFrames);

      onProcessed({
        id: image.name,
        originalFile: image,
        compressedBlob: gifBlob,
        compressedUrl: gifUrl,
        originalSize: image.size,
        compressedSize: gifBlob.size,
        format: 'gif',
        filename: getOutputFilename('gif'),
        mediaType: 'image',
        fileFormat: 'gif',
        animations: [animationData]
      });

      toast.dismiss('anim-gen');
      toast.success(`Animation created! (${totalFrames} frames)`);

    } catch (error) {
      console.error('❌ Animation failed:', error);
      toast.dismiss('anim-gen');
      toast.error('Animation failed: ' + error.message);
      throw error;
    }
  };

  const savingsPercent = processed
    ? ((1 - compressedSize / originalSize) * 100).toFixed(1)
    : 0;

  // Check if file got larger
  const sizeIncreased = processed && compressedSize > originalSize;

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const originalExt = image.name.split('.').pop().toUpperCase();
  const displayFormat = outputFormat || format;
  const displayCompressedExt = displayFormat.toUpperCase();

  let availableFormats = [];
  if (isImage && !isGif) {
    availableFormats = enableAnimation ? ['gif'] : ['jpg', 'png', 'webp', 'avif'];
  } else if (isGif) {
    availableFormats = ffmpegLoaded ? ['gif', 'mp4'] : ['gif'];
  } else if (isVideo) {
    availableFormats = ffmpegLoaded ? ['mp4', 'gif'] : ['mp4'];
  } else if (isAudio) {
    availableFormats = ['mp3', 'wav'];
  }

  const mediaIcon = isVideo ? Video : isAudio ? Music : isGif ? Film : null;
  const MediaIcon = mediaIcon;

  const performSingleMediaDownload = async (blobToDownload, targetFormat, mediaType, filename) => {
    if (!blobToDownload) {
      toast.error("No file data available to download.");
      return;
    }

    let finalBlob = blobToDownload;
    let finalFilename = filename;

    // Check if targetFormat is different and media is image, then perform on-the-fly conversion
    if (mediaType === 'image' && targetFormat && blobToDownload.type !== (targetFormat === 'jpg' ? 'image/jpeg' : `image/${targetFormat}`)) {
      try {
        toast.info(`Converting to ${targetFormat.toUpperCase()} for download...`);
        const img = new Image();
        img.src = URL.createObjectURL(blobToDownload); // Create URL from blob to load into image element
        await new Promise((resolve, reject) => {
          img.onload = () => { URL.revokeObjectURL(img.src); resolve(); };
          img.onerror = () => { URL.revokeObjectURL(img.src); reject(new Error('Failed to load image for conversion.')); };
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const mimeType = targetFormat === 'jpg' ? 'image/jpeg' : `image/${targetFormat}`;
        // Basic check for browser support to prevent errors on unsupported formats (e.g., AVIF on some browsers)
        if (!canvas.toDataURL(mimeType).startsWith(`data:${mimeType}`)) {
          throw new Error(`Browser does not support converting to ${targetFormat.toUpperCase()}.`);
        }

        const convertedBlob = await new Promise((resolve) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error(`Failed to create ${targetFormat.toUpperCase()} image blob.`));
          }, mimeType, quality / 100); // Use quality slider value
        });
        finalBlob = convertedBlob;
      } catch (error) {
        console.error("Error during on-the-fly image conversion for download:", error);
        toast.error(`Failed to convert image to ${targetFormat} for download: ${error.message}`);
        return;
      }
    }

    // Actual download using the finalBlob
    try {
      const url = URL.createObjectURL(finalBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = finalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`'${finalFilename}' downloaded!`);
    } catch (error) {
      console.error("Error during download:", error);
      toast.error("Failed to download file.");
    }
  };

  const downloadAllImageFormatsAsZip = async () => {
    toast.info('Creating multi-format ZIP...');

    try {
      const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
      const zip = new JSZip();

      const img = new Image();
      img.src = compressedPreview; // Use compressedPreview (URL)

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image for ZIP conversion.'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const baseName = editableFilename.split('.')[0];
      const imageFormatsForZip = [
        { ext: 'jpg', mime: 'image/jpeg' },
        { ext: 'png', mime: 'image/png' },
        { ext: 'webp', mime: 'image/webp' },
        { ext: 'avif', mime: 'image/avif' }
      ];

      for (const f of imageFormatsForZip) {
        const blob = await new Promise((resolve) => {
          if (canvas.toDataURL(f.mime).startsWith(`data:${f.mime}`)) {
            canvas.toBlob(resolve, f.mime, 0.95);
          } else {
            console.warn(`Browser does not support converting to ${f.ext}. Skipping.`);
            resolve(null);
          }
        });
        if (blob) {
          zip.file(`${baseName}.${f.ext}`, blob);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${baseName}-all-formats.zip`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.success('All formats downloaded!');
    } catch (error) {
      console.error('Error creating ZIP:', error);
      toast.error('Failed to create multi-format ZIP: ' + error.message);
    }
  };

  const downloadAllAnimationsAsZip = async () => {
    toast.info('Creating animations ZIP...');
    try {
      const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
      const zip = new JSZip();

      const baseName = editableFilename.split('.').slice(0, -1).join('.') || editableFilename;

      for (const anim of generatedAnimations) {
        const response = await fetch(anim.url);
        const blob = await response.blob();
        zip.file(`${baseName}_${anim.name.toLowerCase().replace(/\s+/g, '_')}.gif`, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${baseName}-animations.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('All animations downloaded!');
    } catch (error) {
      console.error('Error creating animations ZIP:', error);
      toast.error('Failed to create animations ZIP: ' + error.message);
    }
  };

  const downloadMedia = async (formatOverride = null) => {
    if (!compressedBlob && generatedAnimations.length === 0) {
      toast.error("No processed file available for download.");
      return;
    }

    const mediaType = isVideo ? 'video' : isAudio ? 'audio' : 'image';
    const currentCompressedFormat = outputFormat || format;

    if (generatedAnimations.length > 0) {
      await downloadAllAnimationsAsZip();
      return;
    }

    if (mediaType === 'image' && formatOverride === null) {
      setShowDownloadModal(true);
      return;
    }

    performSingleMediaDownload(
      compressedBlob,
      formatOverride || currentCompressedFormat,
      mediaType,
      getOutputFilename(formatOverride || currentCompressedFormat)
    );
  };

  const getOutputFilename = (targetFormat = null) => {
    const nameWithoutExt = editableFilename.split('.').slice(0, -1).join('.') || editableFilename;
    const finalExt = targetFormat || outputFormat || format;
    return `${nameWithoutExt}.${finalExt}`;
  };

  const handleCompare = () => {
    if (processed && compressedPreview && (isImage || isGif)) {
      onCompare({
        original: preview,
        compressed: compressedPreview,
        originalSize,
        compressedSize,
        fileName: getOutputFilename(),
        mediaType: isVideo ? 'video' : isAudio ? 'audio' : 'image',
        fileFormat: outputFormat || format
      });
    }
  };

  const handleEditImage = () => {
    setShowEditor(true);
  };

  const handleSaveEdit = (newImageUrl, newBlob) => {
    setPreview(newImageUrl);
    setOriginalSize(newBlob.size);
    if (processed) {
      setProcessed(false);
      setCompressedPreview(null);
      setCompressedSize(0);
      setError(null);
    }
    setShowEditor(false);
    toast.success("Image edited successfully. Re-compress to apply changes.");
  };

  const handleSaveGifEdit = (newBlob) => {
    const newUrl = URL.createObjectURL(newBlob);
    setPreview(newUrl);
    setOriginalSize(newBlob.size);
    setGifSettings(prev => ({ ...prev, frames: [], width: 0, height: 0 })); // Clear frames, they need re-parsing
    parseGif(newUrl); // Re-parse the GIF frames from the new blob
    setProcessed(false);
    setCompressedPreview(null);
    setCompressedSize(0);
    setError(null);
    setShowGifEditor(false);
    toast.success("GIF edited successfully. Re-compress to finalize.");
  };

  // New: Handle saving video edits
  const handleSaveVideoEdit = (newVideoBlob, newVideoUrl) => {
    setPreview(newVideoUrl);
    setOriginalSize(newVideoBlob.size);
    if (processed) {
      setProcessed(false);
      setCompressedPreview(null);
      setCompressedSize(0);
      setError(null);
    }
    setShowVideoEditor(false);
    toast.success("Video edited successfully. Re-compress to apply changes.");
  };

  // New: Handle saving audio edits
  const handleSaveAudioEdit = (newAudioBlob, newAudioUrl) => {
    setPreview(newAudioUrl);
    setOriginalSize(newAudioBlob.size);
    if (processed) {
      setProcessed(false);
      setCompressedPreview(null);
      setCompressedSize(0);
      setError(null);
    }
    setShowAudioEditor(false);
    toast.success("Audio edited successfully. Re-compress to apply changes.");
  };

  const convertFormat = async (newFormat) => {
    if (!compressedPreview || processing) return;

    // If already in the target format, do nothing
    if (newFormat === (outputFormat || format)) {
      toast.info(`Already in ${newFormat.toUpperCase()} format.`);
      return;
    }

    if (enableAnimation && newFormat !== 'gif') {
      toast.error('Cannot convert format while animation is enabled.');
      return;
    }


    // For video/audio/GIF conversions that require FFmpeg, we trigger a full re-process.
    // This handles: isVideo to gif, isGif to mp4, isAudio to mp3/wav, or (re)processing video/audio
    if (isVideo || isAudio || (isGif && newFormat === 'mp4')) {
      if (!ffmpegLoaded) {
        toast.error('Video processor still loading. Please wait...');
        return;
      }
      setFormat(newFormat); // Update the target format for processMedia
      await processMedia(); // Re-run the full processing logic
      return;
    }

    // For static images, convert on the fly using canvas
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
        canvas.toBlob((b) => resolve(b), mimeType, quality / 100);
      });

      const url = URL.createObjectURL(blob);
      setCompressedPreview(url);
      setCompressedSize(blob.size);
      setCompressedBlob(blob);
      setOutputFormat(newFormat);
      setFormat(newFormat); // Update the internal format state as well

      onProcessed({
        id: image.name,
        originalFile: image,
        compressedBlob: blob,
        compressedUrl: url,
        originalSize: originalSize,
        compressedSize: blob.size,
        format: newFormat,
        filename: getOutputFilename(newFormat),
        mediaType: 'image',
        fileFormat: newFormat
      });

      toast.success(`Converted to ${newFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Error converting format:', error);
      setError('Failed to convert format');
      toast.error('Failed to convert format: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow">
      <div className="relative">
        <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 dark:bg-slate-950">
          {preview && (
            <div
              className="relative aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 cursor-pointer group"
              onClick={(isImage || isGif) && processed ? handleCompare : undefined}
            >
              {(isGif && gifFrameCount > 0) ? (
                <Badge className="absolute -top-8 left-0 bg-slate-900/90 text-white text-xs px-3 py-1.5 font-bold flex items-center gap-1 shadow-lg z-10 rounded-md">
                  <Film className="w-3 h-3" />
                  {gifFrameCount} frames
                </Badge>
              ) : null}

              {isImage ? (
                <LazyImage
                  src={preview}
                  alt="Original"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : isVideo ? (
                <video src={preview} controls muted loop className="w-full h-full object-cover"></video>
              ) : isAudio ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <Music className="w-16 h-16 text-slate-400 mb-2" />
                  <audio src={preview} controls className="w-full" />
                </div>
              ) : null}
              <Badge className="absolute top-2 left-2 bg-slate-900/80 text-white">
                Original
              </Badge>
              <Badge className="absolute bottom-2 right-2 bg-slate-900/95 backdrop-blur-sm text-white border border-slate-700 text-xs px-2 py-1 font-bold shadow-lg">
                {originalExt}
              </Badge>
              {isImage && !isGif && (
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
              {isGif && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowGifEditor(true);
                  }}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 h-7 w-7 rounded-lg"
                >
                  <Wand2 className="w-3 h-3" />
                </Button>
              )}
              {isVideo && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!ffmpegLoaded) {
                      toast.error('Video processor not loaded yet');
                      return;
                    }
                    setShowVideoEditor(true);
                  }}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 h-7 w-7 rounded-lg"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}
              {isAudio && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!ffmpegLoaded) {
                      toast.error('Audio processor not loaded yet');
                      return;
                    }
                    setShowAudioEditor(true);
                  }}
                  className="absolute top-10 right-2 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 h-7 w-7 rounded-lg"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
          {compressedPreview ? (
            <div
              className="relative aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 cursor-pointer group"
              onClick={(isImage || isGif) ? handleCompare : undefined}
            >
              {(isGif && outputGifFrameCount > 0) ? (
                <Badge className="absolute -top-8 left-0 bg-slate-900/90 text-white text-xs px-3 py-1.5 font-bold flex items-center gap-1 shadow-lg z-10 rounded-md">
                  <Film className="w-3 h-3" />
                  {outputGifFrameCount} frames
                </Badge>
              ) : null}

              {isImage ? (
                <LazyImage
                  src={compressedPreview}
                  alt="Compressed"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : isVideo ? (
                <video src={compressedPreview} controls muted loop className="w-full h-full object-cover"></video>
              ) : isAudio ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <Music className="w-16 h-16 text-emerald-500 mb-2" />
                  <audio src={compressedPreview} controls className="w-full" />
                </div>
              ) : null}
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
          className="absolute top-0 right-2 bg-slate-900/90 dark:bg-slate-900/90 hover:bg-red-600 dark:hover:bg-red-600 text-white rounded-lg transition-colors z-20 shadow-lg"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          {isEditingFilename ? (
            <div className="flex items-center gap-2 mb-1">
              <input
                type="text"
                value={editableFilename}
                onChange={(e) => setIsEditingFilename(e.target.value)}
                className="flex-1 text-sm font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onBlur={() => setEditableFilename(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditableFilename(false);
                    toast.success('Filename updated!');
                  }
                  if (e.key === 'Escape') {
                    setIsEditingFilename(image.name);
                    setEditableFilename(false);
                  }
                }}
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditableFilename(false);
                  toast.success('Filename updated!');
                }}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <Check className="w-4 h-4 text-emerald-600" />
              </Button>
            </div>
          ) : (
            <div
              className="group flex items-center gap-2 mb-1 cursor-pointer bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 rounded px-3 py-2 transition-all"
              onClick={() => setEditableFilename(true)}
            >
              <p
                className="flex-1 font-medium text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate transition-colors"
                title={editableFilename}
              >
                {editableFilename}
              </p>
              <Edit2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex-shrink-0 transition-colors" />
            </div>
          )}
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span>{formatFileSize(originalSize)}</span>
            {processed && (
              <>
                <ArrowRight className="w-3 h-3" />
                <span className={cn(
                  "font-medium",
                  sizeIncreased
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400"
                )}>
                  {formatFileSize(compressedSize)}
                </span>
                <Badge variant="secondary" className={cn(
                  sizeIncreased
                    ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                )}>
                  {sizeIncreased ? '+' : ''}{Math.abs(parseFloat(savingsPercent))}%
                </Badge>
              </>
            )}
            {processing && estimatedTimeForFile !== null && (
              <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400 ml-auto">
                ~{estimatedTimeForFile}s
              </Badge>
            )}
          </div>
        </div>

        {/* Metadata Viewer button */}
        <Button
          variant="outline"
          size="sm"
          onClick={extractMetadata}
          className="w-full justify-center mt-3 text-xs"
        >
          <Info className="w-3 h-3 mr-1" /> View Metadata
        </Button>

        {error && (
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs">{error}</span>
          </div>
        )}

        {/* Convert Format Selector - Show AFTER compression */}
        {processed && availableFormats.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Convert Format
            </label>
            <div className={cn(
              "grid gap-2",
              availableFormats.length === 1 ? "grid-cols-1" : availableFormats.length === 2 ? "grid-cols-2" : "grid-cols-4"
            )}>
              {availableFormats.map((fmt) => (
                <Button
                  key={fmt}
                  size="sm"
                  variant={displayFormat === fmt ? "default" : "outline"}
                  onClick={() => convertFormat(fmt)}
                  disabled={displayFormat === fmt || processing || (ffmpegLoading && (isVideo || isAudio || (isGif && fmt === 'mp4')))}
                  className={cn(
                    "relative text-xs h-9",
                    format === fmt && "bg-emerald-600 hover:bg-emerald-700"
                  )}
                >
                  {fmt.toUpperCase()}
                  {displayFormat === fmt && processing && <Loader2 className="ml-1 h-3 w-3 animate-spin" />}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Output Format Selector - Show BEFORE compression */}
        {!processed && availableFormats.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Output Format
            </label>
            <div className={cn(
              "grid gap-2",
              availableFormats.length === 1 ? "grid-cols-1" : availableFormats.length === 2 ? "grid-cols-2" : "grid-cols-4"
            )}>
              {availableFormats.map((fmt) => (
                <Button
                  key={fmt}
                  size="sm"
                  variant={format === fmt ? "default" : "outline"}
                  onClick={() => setFormat(fmt)}
                  disabled={processing || (ffmpegLoading && (isVideo || isAudio || (isGif && fmt === 'mp4')))}
                  className={cn(
                    "relative text-xs h-9",
                    format === fmt && "bg-emerald-600 hover:bg-emerald-700"
                  )}
                >
                  {fmt.toUpperCase()}
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
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform duration-200",
                settingsOpen && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <TooltipProvider>
              {/* Loading state for FFmpeg - ONLY show for video/audio files */}
              {(isVideo || isAudio || (isGif && format === 'mp4')) && ffmpegLoading && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      <strong>Loading video/audio processor...</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* FFmpeg load error - ONLY show for video/audio files */}
              {(isVideo || isAudio || (isGif && format === 'mp4')) && ffmpegLoadError && !ffmpegLoading && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-xs text-red-700 dark:text-red-400 font-semibold">
                      Video/audio processor unavailable
                    </p>
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                    Try refreshing the page or using Chrome/Edge browser
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFfmpegLoadError(null);
                      setFfmpegLoading(false);
                      setFfmpegLoaded(false);
                      setTimeout(() => loadFFmpeg(), 100);
                    }}
                    className="text-xs h-7"
                  >
                    <RefreshCcw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                </div>
              )}

              {/* GIF Settings - LOCKED TO OPTIMAL */}
              {isGif && format === 'gif' && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      Optimal GIF Settings (Auto)
                    </h4>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-3">
                    Settings optimized for best quality and original timing/resolution.
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 px-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                      <span className="text-xs text-slate-700 dark:text-slate-300">Quality Level</span>
                      <Badge className="bg-emerald-600 text-white text-xs">Excellent (10)</Badge>
                    </div>

                    <div className="flex items-center justify-between py-2 px-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                      <span className="text-xs text-slate-700 dark:text-slate-300">Frame Processing</span>
                      <Badge className="bg-emerald-600 text-white text-xs">All Frames</Badge>
                    </div>

                    <div className="flex items-center justify-between py-2 px-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                      <span className="text-xs text-slate-700 dark:text-slate-300">Resolution</span>
                      <Badge className="bg-emerald-600 text-white text-xs">Original Resolution</Badge>
                    </div>

                    <div className="flex items-center justify-between py-2 px-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                      <span className="text-xs text-slate-700 dark:text-slate-300">Frame Rate</span>
                      <Badge className="bg-emerald-600 text-white text-xs">Original Frame Rate</Badge>
                    </div>

                    <div className="flex items-center justify-between py-2 px-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                      <span className="text-xs text-slate-700 dark:text-slate-300">Color Mode</span>
                      <Badge className="bg-emerald-600 text-white text-xs">No Dithering</Badge>
                    </div>

                    <div className="flex items-center justify-between py-2 px-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                      <span className="text-xs text-slate-700 dark:text-slate-300">Smoothing</span>
                      <Badge className="bg-emerald-600 text-white text-xs">High Quality</Badge>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Optimized for excellent visual quality while preserving original timing and dimensions.
                  </p>
                </div>
              )}

              {/* Video Settings */}
              {isVideo && ffmpegLoaded && (
                <>
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
                      disabled={processing}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Video Bitrate: {videoBitrate} kbps
                    </label>
                    <Slider
                      value={[videoBitrate]}
                      onValueChange={(value) => setVideoBitrate(value[0])}
                      min={500}
                      max={5000}
                      step={100}
                      className="w-full"
                      disabled={processing}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Resolution
                    </label>
                    <Select value={videoResolution} onValueChange={setVideoResolution} disabled={processing}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">Original</SelectItem>
                        <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                        <SelectItem value="720p">720p (HD)</SelectItem>
                        <SelectItem value="480p">480p (SD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Frame Rate: {frameRate} fps
                    </label>
                    <Slider
                      value={[frameRate]}
                      onValueChange={(value) => setFrameRate(value[0])}
                      min={15}
                      max={60}
                      step={5}
                      className="w-full"
                      disabled={processing}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Encoding Preset
                    </label>
                    <Select value={videoPreset} onValueChange={setVideoPreset} disabled={processing}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ultrafast">Ultrafast (Fastest, Larger)</SelectItem>
                        <SelectItem value="fast">Fast</SelectItem>
                        <SelectItem value="medium">Medium (Balanced)</SelectItem>
                        <SelectItem value="slow">Slow (Better Quality)</SelectItem>
                        <SelectItem value="veryslow">Very Slow (Best Quality)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Audio Bitrate: {audioBitrate} kbps
                    </label>
                    <Slider
                      value={[audioBitrate]}
                      onValueChange={(value) => setAudioBitrate(value[0])}
                      min={64}
                      max={320}
                      step={16}
                      className="w-full"
                      disabled={processing}
                    />
                  </div>
                </>
              )}

              {/* Audio Settings */}
              {isAudio && ffmpegLoaded && (
                <>
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Audio Bitrate: {audioBitrate} kbps
                    </label>
                    <Slider
                      value={[audioBitrate]}
                      onValueChange={(value) => setAudioBitrate(value[0])}
                      min={64}
                      max={320}
                      step={16}
                      className="w-full"
                      disabled={processing}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Audio Quality
                    </label>
                    <Select value={audioQuality} onValueChange={setAudioQuality} disabled={processing}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Quality</SelectItem>
                        <SelectItem value="standard">Standard (Recommended)</SelectItem>
                        <SelectItem value="low">Low (Smaller Size)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Image/GIF Specific Settings (when not video or audio or GIF with gif format) */}
              {!(isAudio || isVideo || enableAnimation || (isGif && format === 'gif')) && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Compression Mode
                      </label>
                    </div>
                    <Select value={compressionMode} onValueChange={setCompressionMode} disabled={processing}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                        <SelectItem value="maximum">Maximum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Quality: {quality}%
                      </label>
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

                  {(isImage && !isGif) && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Max Width (px)
                          </label>
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
                  )}

                  {(isImage && !isGif) && (
                    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Strip Metadata
                        </label>
                        <Switch
                          checked={stripMetadata}
                          onCheckedChange={setStripMetadata}
                          disabled={processing}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Noise Reduction
                        </label>
                        <Switch
                          checked={noiseReduction}
                          onCheckedChange={setNoiseReduction}
                          disabled={processing}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </TooltipProvider>
          </CollapsibleContent>
        </Collapsible>

        {(isImage && !isGif) && (
          <Collapsible open={upscaleSettingsOpen} onOpenChange={setUpscaleSettingsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between" size="sm">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Upscale Settings
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  upscaleSettingsOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <TooltipProvider>
                {/* Resolution Display */}
                {originalImageDimensions.width > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 dark:text-slate-400">Original Resolution:</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {originalImageDimensions.width} × {originalImageDimensions.height}
                      </span>
                    </div>
                    {(enableUpscale && (upscaleMultiplier || maxWidth || maxHeight)) && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Target Resolution:</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {(() => {
                            let targetWidth = originalImageDimensions.width;
                            let targetHeight = originalImageDimensions.height;
                            const aspectRatio = targetWidth / targetHeight;

                            if (upscaleMultiplier) {
                              targetWidth = Math.round(originalImageDimensions.width * (upscaleMultiplier / 100));
                              targetHeight = Math.round(originalImageDimensions.height * (upscaleMultiplier / 100));
                            } else if (maxWidth || maxHeight) {
                              // For upscaling, we always take the maximum ratio to ensure the image meets or exceeds the target size
                              const widthRatio = maxWidth ? maxWidth / originalImageDimensions.width : 0;
                              const heightRatio = maxHeight ? maxHeight / originalImageDimensions.height : 0;

                              let ratio = 1;
                              if (maxWidth && maxHeight) {
                                ratio = Math.max(widthRatio, heightRatio);
                              } else if (maxWidth) {
                                ratio = widthRatio;
                              } else if (maxHeight) {
                                ratio = heightRatio;
                              }

                              targetWidth = Math.round(originalImageDimensions.width * ratio);
                              targetHeight = Math.round(originalImageDimensions.height * ratio);
                            }

                            return `${targetWidth} × ${targetHeight}`;
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Enable Upscaling
                    </label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-slate-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Allow increasing image dimensions beyond original size</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Switch
                    checked={enableUpscale}
                    onCheckedChange={(checked) => {
                      setEnableUpscale(checked);
                      if (!checked) {
                        setUpscaleMultiplier(null);
                        setMaxWidth(null);
                        setMaxHeight(null);
                      }
                    }}
                    disabled={processing}
                  />
                </div>

                {enableUpscale && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                        Upscale Multiplier
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[100, 150, 200, 300, 400, 500].map((multiplier) => (
                          <Button
                            key={multiplier}
                            size="sm"
                            variant={upscaleMultiplier === multiplier ? "default" : "outline"}
                            onClick={() => {
                              setUpscaleMultiplier(multiplier);
                              // Clear manual dimensions when using multiplier
                              setMaxWidth(null);
                              setMaxHeight(null);
                            }}
                            disabled={processing}
                            className={cn(
                              "text-xs h-9",
                              upscaleMultiplier === multiplier && "bg-emerald-600 hover:bg-emerald-700"
                            )}
                          >
                            {multiplier}%
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                        Or Set Custom Dimensions
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">
                            Max Width (px)
                          </label>
                          <input
                            type="number"
                            placeholder="Auto"
                            value={maxWidth || ''}
                            onChange={(e) => {
                              setMaxWidth(e.target.value ? parseInt(e.target.value) : null);
                              if (e.target.value) {
                                setUpscaleMultiplier(null); // Clear multiplier if custom dimension is set
                              }
                            }}
                            className="w-full h-9 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                            disabled={processing}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">
                            Max Height (px)
                          </label>
                          <input
                            type="number"
                            placeholder="Auto"
                            value={maxHeight || ''}
                            onChange={(e) => {
                              setMaxHeight(e.target.value ? parseInt(e.target.value) : null);
                              if (e.target.value) {
                                setUpscaleMultiplier(null); // Clear multiplier if custom dimension is set
                              }
                            }}
                            className="w-full h-9 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                            disabled={processing}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </TooltipProvider>
            </CollapsibleContent>
          </Collapsible>
        )}

        {(isImage && !isGif) && (
          <Collapsible open={animationSettingsOpen} onOpenChange={setAnimationSettingsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between" size="sm">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Simple Animation {!gifJsLoaded && enableAnimation && <span className="text-xs text-slate-500">(Loading...)</span>}
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  animationSettingsOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <TooltipProvider>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Enable Animation
                    </label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-slate-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Animate your image with smooth camera effects</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Switch
                    checked={enableAnimation}
                    onCheckedChange={(checked) => {
                      setEnableAnimation(checked);
                      if (checked) {
                        setFormat('gif');
                        setGeneratedAnimations([]);
                        setOutputGifFrameCount(0);
                        toast.info('Format set to GIF. Click Compress to create animation!');
                      } else {
                        setFormat('jpg');
                        setGeneratedAnimations([]);
                        setOutputGifFrameCount(0);
                      }
                    }}
                    disabled={processing}
                  />
                </div>

                {enableAnimation && (
                  <>
                    {!gifJsLoaded && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                        <p className="text-xs text-emerald-700 dark:text-emerald-400">
                          <strong>⚡ Loading animation engine...</strong>
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                        Animation Type
                      </label>
                      <Select value={animationType} onValueChange={setAnimationType} disabled={processing}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zoom">Smooth Zoom</SelectItem>
                          <SelectItem value="glow">Glow Pulse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                        Animation Duration: {animationDuration}s
                      </label>
                      <Slider
                        value={[animationDuration]}
                        onValueChange={(value) => setAnimationDuration(value[0])}
                        min={3}
                        max={10}
                        step={1}
                        className="w-full"
                        disabled={processing}
                      />
                    </div>
                  </>
                )}
              </TooltipProvider>
            </CollapsibleContent>
          </Collapsible>
        )}

        <div className="flex gap-2">
          {!processed ? (
            <Button
              onClick={processMedia}
              disabled={processing || (isVideo && !ffmpegLoaded) || (isAudio && !ffmpegLoaded) || (isGif && format === 'mp4' && !ffmpegLoaded) || (((isGif && format === 'gif') || (isImage && !isGif && enableAnimation)) && !gifJsLoaded)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {MediaIcon && <MediaIcon className="w-4 h-4 mr-2" />}
                  {enableAnimation ? 'Create Animation' : (isVideo ? 'Compress Video' : isAudio ? 'Compress Audio' : isGif ? 'Compress GIF' : 'Compress Image')}
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={processMedia}
                variant="outline"
                className="flex-1"
                disabled={processing || (isVideo && !ffmpegLoaded) || (isAudio && !ffmpegLoaded) || (isGif && format === 'mp4' && !ffmpegLoaded) || (((isGif && format === 'gif') || (isImage && !isGif && enableAnimation)) && !gifJsLoaded)}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Reprocess
              </Button>
              <Button
                onClick={() => downloadMedia()} // Call without arguments for default logic
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
          <div className={cn(
            "flex items-center gap-2 text-sm p-3 rounded-lg",
            compressedSize < originalSize
              ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
              : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30"
          )}>
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {compressedSize < originalSize
                ? `Saved ${formatFileSize(originalSize - compressedSize)}`
                : `Added (+${formatFileSize(compressedSize - originalSize)})`
              }
            </span>
          </div>
        )}
      </div>

      {showEditor && isImage && !isGif && (
        <ImageEditor
          isOpen={showEditor}
          onClose={() => setShowEditor(false)}
          imageData={preview}
          onSave={handleSaveEdit}
        />
      )}

      {showGifEditor && isGif && (
        <GifEditor
          isOpen={showGifEditor}
          onClose={() => setShowGifEditor(false)}
          gifData={preview}
          onSave={handleSaveGifEdit}
        />
      )}

      {showVideoEditor && isVideo && ( // New: Video Editor Dialog
        <VideoEditor
          isOpen={showVideoEditor}
          onClose={() => setShowVideoEditor(false)}
          videoData={image} // Pass the original file object
          videoUrl={preview} // Pass the Data URL for preview
          ffmpegRef={ffmpegRef}
          onSave={handleSaveVideoEdit}
        />
      )}

      {showAudioEditor && isAudio && ( // New: Audio Editor Dialog
        <AudioEditor
          isOpen={showAudioEditor}
          onClose={() => setShowAudioEditor(false)}
          audioData={image} // Pass the original file object
          audioUrl={preview} // Pass the Data URL for preview
          ffmpegRef={ffmpegRef}
          onSave={handleSaveAudioEdit}
        />
      )}

      {showDownloadModal && compressedBlob && (
        <DownloadModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          blob={compressedBlob}
          originalFilename={getOutputFilename()}
          format={outputFormat || format}
          generatedAnimations={generatedAnimations.length > 0 ? generatedAnimations : null}
        />
      )}

      {showMetadataViewer && fileMetadata && (
        <Dialog open={showMetadataViewer} onOpenChange={setShowMetadataViewer}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>File Metadata</DialogTitle>
              <DialogDescription>
                Detailed information about your file.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {Object.entries(fileMetadata).map(([key, value]) => (
                <div key={key} className="contents">
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    {key.replace(/([A-Z])/g, ' $1').trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:
                  </span>
                  <span className="text-slate-900 dark:text-white">{String(value)}</span>
                </div>
              ))}
            </div>
            <Button onClick={() => setShowMetadataViewer(false)}>Close</Button>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
