import { useState, useEffect, lazy, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, X, Loader2, CheckCircle2, ArrowRight, Settings2, AlertCircle, Info, Edit2, RefreshCcw, Sparkles, Film, Music, Video, ChevronDown, Check, Wand2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LazyImage from "./LazyImage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

// Lazy load the editor and download modal
const ImageEditor = lazy(() => import("./ImageEditor"));
const DownloadModal = lazy(() => import("./DownloadModal"));
const GifEditor = lazy(() => import("./GifEditor"));

export default function MediaCard({ image, onRemove, onProcessed, onCompare, autoProcess, isPro }) {
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [preview, setPreview] = useState(null);
  const [compressedPreview, setCompressedPreview] = useState(null);
  const [quality, setQuality] = useState(85);
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
  const [animationSettingsOpen, setAnimationSettingsOpen] = useState(false);
  const [enableAnimation, setEnableAnimation] = useState(false);
  const [animationDuration, setAnimationDuration] = useState(5);
  const [animationType, setAnimationType] = useState('zoom');
  const [generatedAnimations, setGeneratedAnimations] = useState([]);
  const [processingStartTime, setProcessingStartTime] = useState(null);
  const [estimatedTimeForFile, setEstimatedTimeForFile] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [gifJsLoaded, setGifJsLoaded] = useState(false);
  const [workerBlobUrl, setWorkerBlobUrl] = useState(null);
  const [outputGifFrameCount, setOutputGifFrameCount] = useState(0);
  const [editableFilename, setEditableFilename] = useState('');
  const [isEditingFilename, setIsEditingFilename] = useState(false);
  const [showMetadataViewer, setShowMetadataViewer] = useState(false);
  const [fileMetadata, setFileMetadata] = useState(null);
  const isImage = image.type.startsWith('image/');
  const isVideo = image.type.startsWith('video/');
  const isAudio = image.type.startsWith('audio/');
  const isGif = image.type === 'image/gif';
  const [gifFrameCount, setGifFrameCount] = useState(0);
  const [gifSettings, setGifSettings] = useState({ width: 0, height: 0, frames: [] });
  const [videoBitrate, setVideoBitrate] = useState(1000);
  const [audioBitrate, setAudioBitrate] = useState(128);
  const [frameRate, setFrameRate] = useState(30);
  const [videoPreset, setVideoPreset] = useState('medium');
  const [videoResolution, setVideoResolution] = useState('original');
  const [audioQuality, setAudioQuality] = useState('standard');
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);
  const [ffmpegLoadError, setFfmpegLoadError] = useState(null);
  const ffmpegRef = useRef(null);
  const processMediaRef = useRef(null);
  const mediaIcon = isVideo ? Video : isAudio ? Music : isGif ? Film : isImage ? ImageIcon : null;
  const MediaIcon = mediaIcon;

  useEffect(() => {
    if ((isVideo || isAudio || (isGif && format === 'mp4')) && !ffmpegLoaded && !ffmpegLoading && !ffmpegLoadError) {
      loadFFmpeg();
    }
  }, [isVideo, isAudio, isGif, format, ffmpegLoaded, ffmpegLoading, ffmpegLoadError]);

  const loadFFmpeg = async () => {
    if (ffmpegLoading || ffmpegLoaded) return;
    setFfmpegLoading(true);
    let toastId = null;
    try {
      toastId = toast.loading('Loading video/audio processor...', { duration: Infinity });
      const { FFmpeg } = await import('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js');
      const ffmpeg = new FFmpeg();
      ffmpeg.on('log', ({ message }) => console.log('FFmpeg:', message));
      ffmpeg.on('progress', ({ progress }) => {
        if (progress > 0 && progress < 1) console.log(`FFmpeg Progress: ${(progress * 100).toFixed(1)}%`);
      });
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg.load({
        coreURL: `${baseURL}/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg-core.wasm`,
      });
      ffmpegRef.current = ffmpeg;
      setFfmpegLoaded(true);
      setFfmpegLoading(false);
      setFfmpegLoadError(null);
      if (toastId) toast.dismiss(toastId);
      toast.success('Audio/video processor ready!');
    } catch (error) {
      console.error('❌ FFmpeg load error:', error);
      setFfmpegLoading(false);
      setFfmpegLoadError(error.message);
      if (toastId) toast.dismiss(toastId);
      toast.error('Audio/video processor failed to load.', { duration: 8000 });
      setTimeout(() => setFfmpegLoadError(null), 10000);
    }
  };

  useEffect(() => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      setPreview(reader.result);
      setOriginalSize(image.size);
      setEditableFilename(image.name);
      if (isImage && !isGif) {
        const img = new Image();
        img.onload = () => setOriginalImageDimensions({ width: img.width, height: img.height });
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
    if (isGif) setFormat('gif');
    else if (isVideo) setFormat('mp4');
    else if (isAudio) setFormat('mp3');
    else if (isImage) setFormat('jpg');
  }, [image, isGif, isVideo, isAudio, isImage]);

  useEffect(() => {
    if (autoProcess && !processed && !processing && processMediaRef.current) {
      processMediaRef.current();
    }
  }, [autoProcess, processed, processing]);

  useEffect(() => {
    if (((enableAnimation && isImage && !isGif) || isGif) && !gifJsLoaded) {
      const loadGifJs = async () => {
        try {
          if (window.GIF && workerBlobUrl) {
            setGifJsLoaded(true);
            return;
          }
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
          const workerResponse = await fetch('https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js');
          const workerText = await workerResponse.text();
          const workerBlob = new Blob([workerText], { type: 'application/javascript' });
          const workerUrl = URL.createObjectURL(workerBlob);
          setWorkerBlobUrl(workerUrl);
          setGifJsLoaded(true);
          if (enableAnimation) toast.success('Animation engine ready!');
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
      if (workerBlobUrl) URL.revokeObjectURL(workerBlobUrl);
    };
  }, [workerBlobUrl]);

  useEffect(() => {
    if (processing && processingStartTime) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - processingStartTime;
        let estimatedTotal = 3000;
        if (isGif) estimatedTotal = Math.max(5000, gifFrameCount * 50);
        else if (isVideo) estimatedTotal = Math.max(10000, image.size / 100000);
        else if (isImage && enableAnimation) estimatedTotal = 8000;
        else if (isImage) estimatedTotal = 2000;
        const remaining = Math.max(0, estimatedTotal - elapsed);
        setEstimatedTimeForFile(Math.ceil(remaining / 1000));
        const progress = Math.min(95, (elapsed / estimatedTotal) * 100);
        setProcessingProgress(progress);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setEstimatedTimeForFile(null);
      setProcessingProgress(0);
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
    const ratioFloat = width / height;
    if (Math.abs(ratioFloat - 1) < 0.01) return "1:1 (Square)";
    if (Math.abs(ratioFloat - 16/9) < 0.01) return "16:9 (Widescreen)";
    if (Math.abs(ratioFloat - 4/3) < 0.01) return "4:3 (Standard)";
    if (Math.abs(ratioFloat - 3/2) < 0.01) return "3:2";
    if (Math.abs(ratioFloat - 21/9) < 0.01) return "21:9 (Ultrawide)";
    if (Math.abs(ratioFloat - 9/16) < 0.01) return "9:16 (Vertical)";
    if (ratioW > 100 || ratioH > 100) return `${ratioFloat.toFixed(2)}:1`;
    return `${ratioW}:${ratioH}`;
  };

  const formatDuration = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity || seconds === null) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    let parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);
    return parts.join(' ');
  };

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
        metadata.megapixels = ((img.width * img.height) / 1000000).toFixed(2) + ' MP';
        metadata.format = image.name.split('.').pop().toUpperCase();
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
      if (isImage && !isGif && enableAnimation) await processImageToAnimation();
      else if (isVideo) {
        if (!ffmpegLoaded) {
          toast.error('Video processor still loading. Please wait...');
          setProcessing(false);
          setProcessingStartTime(null);
          return;
        }
        if (format === 'gif') await convertVideoToGif();
        else await processVideo();
      } else if (isAudio) {
        if (!ffmpegLoaded) {
          toast.error('Audio processor still loading. Please wait...');
          setProcessing(false);
          setProcessingStartTime(null);
          return;
        }
        await processAudio();
      } else if (isGif) {
        if (!ffmpegLoaded && format === 'mp4') {
          toast.error('Video processor still loading. Please wait...');
          setProcessing(false);
          setProcessingStartTime(null);
          return;
        }
        if (format === 'mp4') await convertGifToMp4();
        else await processGif();
      } else if (isImage) await processStaticImage();
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

  const processVideo = async () => {
    try {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) throw new Error('FFmpeg not loaded');
      const inputData = new Uint8Array(await image.arrayBuffer());
      const inputExt = image.name.split('.').pop() || 'mp4';
      await ffmpeg.writeFile(`input.${inputExt}`, inputData);
      
      // Build optimized FFmpeg command
      const args = [
        '-i', `input.${inputExt}`,
        '-c:v', 'libx264',
        '-preset', videoPreset || 'medium',
        '-crf', String(Math.min(51, Math.max(0, Math.round((100 - quality) / 3.5)))),
      ];
      
      if (videoBitrate && videoBitrate > 0) {
        args.push('-b:v', `${videoBitrate}k`, '-maxrate', `${Math.round(videoBitrate * 1.5)}k`, '-bufsize', `${videoBitrate * 2}k`);
      }
      
      if (frameRate && frameRate > 0) {
        args.push('-r', String(Math.min(60, frameRate)));
      }
      
      // Resolution scaling
      if (videoResolution && videoResolution !== 'original') {
        const resMap = { '1080p': '1920:-2', '720p': '1280:-2', '480p': '854:-2' };
        if (resMap[videoResolution]) {
          args.push('-vf', `scale=${resMap[videoResolution]}`);
        }
      }
      
      // Audio encoding
      args.push('-c:a', 'aac', '-b:a', `${audioBitrate || 128}k`, '-movflags', '+faststart', 'output.mp4');
      
      await ffmpeg.exec(args);
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      
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

  const processAudio = async () => {
    try {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) throw new Error('FFmpeg not loaded');
      const inputExt = image.name.split('.').pop() || 'mp3';
      await ffmpeg.writeFile(`input.${inputExt}`, new Uint8Array(await image.arrayBuffer()));
      const outputExt = format || 'mp3';
      const args = ['-i', `input.${inputExt}`];
      
      if (outputExt === 'mp3') {
        const bitrateVal = audioBitrate || 128;
        const qualityMap = { high: 0, standard: 2, low: 4 };
        args.push(
          '-codec:a', 'libmp3lame',
          '-b:a', `${bitrateVal}k`,
          '-q:a', String(qualityMap[audioQuality] || 2)
        );
      } else if (outputExt === 'wav') {
        args.push('-codec:a', 'pcm_s16le', '-ar', '44100');
      } else {
        // Fallback for other formats
        args.push('-codec:a', 'aac', '-b:a', `${audioBitrate || 128}k`);
      }
      
      args.push(`output.${outputExt}`);
      await ffmpeg.exec(args);
      const data = await ffmpeg.readFile(`output.${outputExt}`);
      const mimeType = outputExt === 'mp3' ? 'audio/mpeg' : outputExt === 'wav' ? 'audio/wav' : `audio/${outputExt}`;
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
        format: outputExt,
        filename: getOutputFilename(outputExt),
        mediaType: 'audio',
        fileFormat: outputExt
      });
      const savings = ((1 - blob.size / image.size) * 100).toFixed(1);
      toast.success(`Audio compressed! Saved ${savings}%`);
    } catch (error) {
      console.error('Audio processing failed:', error);
      throw error;
    }
  };

  const convertVideoToGif = async () => {
    try {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) throw new Error('FFmpeg not loaded');
      const inputExt = image.name.split('.').pop();
      await ffmpeg.writeFile(`input.${inputExt}`, new Uint8Array(await image.arrayBuffer()));
      const fps = Math.max(5, Math.round(frameRate / 2));
      const scale = maxWidth || 480;
      await ffmpeg.exec(['-i', `input.${inputExt}`, '-vf', `fps=${fps},scale=${scale}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`, '-loop', '0', 'output.gif']);
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

  const convertGifToMp4 = async () => {
    try {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) throw new Error('FFmpeg not loaded');
      const response = await fetch(preview);
      const gifBlob = await response.blob();
      await ffmpeg.writeFile('input.gif', new Uint8Array(await gifBlob.arrayBuffer()));
      await ffmpeg.exec(['-i', 'input.gif', '-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', 'output.mp4']);
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
      if (!gifJsLoaded || !window.GIF || !workerBlobUrl) {
        toast.error('GIF processor still loading. Please wait...');
        return;
      }
      const response = await fetch(preview);
      const originalBlob = await response.blob();
      if (!gifSettings.frames || gifSettings.frames.length === 0) {
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
          compressedUrl: compressedUrl,
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
      const targetWidth = gifSettings.width;
      const targetHeight = gifSettings.height;
      const framesToProcess = gifSettings.frames;
      const maxFrames = Math.min(framesToProcess.length, 500);
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
          if (i > 0) {
            const prevFrame = framesToProcess[i - 1];
            if (prevFrame && prevFrame.disposalType === 2) {
              backgroundCtx.clearRect(prevFrame.dims.left || 0, prevFrame.dims.top || 0, prevFrame.dims.width, prevFrame.dims.height);
            }
          }
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = frame.dims.width;
          tempCanvas.height = frame.dims.height;
          const tempCtx = tempCanvas.getContext('2d', { alpha: true });
          if (!tempCtx) continue;
          const imageData = new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height);
          tempCtx.putImageData(imageData, 0, 0);
          backgroundCtx.imageSmoothingEnabled = true;
          backgroundCtx.imageSmoothingQuality = 'high';
          backgroundCtx.drawImage(tempCanvas, frame.dims.left || 0, frame.dims.top || 0);
          const outputCanvas = document.createElement('canvas');
          outputCanvas.width = targetWidth;
          outputCanvas.height = targetHeight;
          const outputCtx = outputCanvas.getContext('2d', { alpha: true });
          outputCtx.drawImage(backgroundCanvas, 0, 0);
          const originalDelay = frame.delay || 10;
          const delayMs = originalDelay * 10;
          processedFrames.push({ canvas: outputCanvas, delay: delayMs });
        } catch (err) {
          console.error(`Frame ${i} error:`, err);
        }
      }
      if (processedFrames.length === 0) throw new Error('No frames processed');
      const GIF = window.GIF;
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
        gif.addFrame(canvas, { delay: delay, copy: true, dispose: 2 });
      }
      const gifBlob = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 300000);
        gif.on('finished', (blob) => { clearTimeout(timeout); resolve(blob); });
        gif.on('error', (error) => { clearTimeout(timeout); reject(error); });
        gif.render();
      });
      if (!gifBlob || gifBlob.size === 0) throw new Error('Encoding failed');
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
        compressedUrl: compressedUrl,
        originalSize: image.size,
        compressedSize: gifBlob.size,
        format: 'gif',
        filename: getOutputFilename('gif'),
        mediaType: 'image',
        fileFormat: 'gif'
      });
      const savings = ((1 - gifBlob.size / image.size) * 100).toFixed(1);
      if (gifBlob.size < image.size) toast.success(`✨ GIF optimized! ${processedFrames.length} frames • Saved ${savings}%`);
      else toast.warning(`GIF processed. May already be optimized.`);
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
          compressedUrl: compressedUrl,
          originalSize: originalSize,
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
    await new Promise((resolve) => { img.onload = resolve; });
    const canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;

    if (enableUpscale && upscaleMultiplier) {
      width = Math.round(img.width * (upscaleMultiplier / 100));
      height = Math.round(img.height * (upscaleMultiplier / 100));
    } else if (maxWidth || maxHeight || enableUpscale) {
      const aspectRatio = width / height;
      if (maxWidth && maxHeight) {
        const widthRatio = maxWidth / img.width;
        const heightRatio = maxHeight / img.height;
        const ratio = enableUpscale ? Math.max(widthRatio, heightRatio) : Math.min(widthRatio, heightRatio);
        width = Math.round(img.width * ratio);
        height = Math.round(img.height * ratio);
      } else if (maxWidth) {
        if (enableUpscale || maxWidth < width) {
          width = maxWidth;
          height = Math.round(maxWidth / aspectRatio);
        }
      } else if (maxHeight) {
        if (enableUpscale || maxHeight < height) {
          height = maxHeight;
          width = Math.round(maxHeight * aspectRatio);
        }
      }
    }

    // Cap at 8K resolution
    const maxRes = 7680;
    if (width > maxRes) {
      height = Math.round(height * (maxRes / width));
      width = maxRes;
    }
    if (height > maxRes) {
      width = Math.round(width * (maxRes / height));
      height = maxRes;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (noiseReduction || enableUpscale) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
    ctx.drawImage(img, 0, 0, width, height);

    // Use browser-image-compression for better PNG handling
    if (format === 'png') {
      try {
        console.log('🎨 Compressing PNG with browser-image-compression...');

        // Load browser-image-compression library
        if (!window.imageCompression) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js';
            script.onload = () => {
              setTimeout(() => {
                if (window.imageCompression) resolve();
                else reject(new Error('Library not loaded'));
              }, 100);
            };
            script.onerror = () => reject(new Error('Failed to load library'));
            document.head.appendChild(script);
          });
        }

        // Convert canvas to blob first
        const canvasBlob = await new Promise((resolve) => {
          canvas.toBlob(resolve, 'image/png');
        });

        // Compress with browser-image-compression
        const options = {
          maxSizeMB: Math.max(0.1, (canvasBlob.size / 1024 / 1024) * (quality / 100)),
          maxWidthOrHeight: Math.max(width, height),
          useWebWorker: true,
          fileType: 'image/png',
          initialQuality: quality / 100
        };

        const compressedFile = await window.imageCompression(canvasBlob, options);

        if (!enableUpscale && compressedFile.size >= image.size) {
          console.log('⚠️ Using original (compressed is larger)');
          const compressedUrl = URL.createObjectURL(image);
          setCompressedPreview(compressedUrl);
          setCompressedSize(image.size);
          setCompressedBlob(image);
          setProcessed(true);
          setOutputFormat(format);
          onProcessed({
            id: image.name,
            originalFile: image,
            compressedBlob: image,
            compressedUrl: compressedUrl,
            originalSize: image.size,
            compressedSize: image.size,
            format,
            filename: getOutputFilename(format),
            mediaType: 'image',
            fileFormat: format
          });
          toast.info(`PNG already optimized - 0% savings`);
          return;
        }

        const compressedUrl = URL.createObjectURL(compressedFile);
        setCompressedPreview(compressedUrl);
        setCompressedSize(compressedFile.size);
        setCompressedBlob(compressedFile);
        setProcessed(true);
        setOutputFormat(format);
        onProcessed({
          id: image.name,
          originalFile: image,
          compressedBlob: compressedFile,
          compressedUrl,
          originalSize: image.size,
          compressedSize: compressedFile.size,
          format,
          filename: getOutputFilename(format),
          mediaType: 'image',
          fileFormat: format
        });
        const savings = ((1 - compressedFile.size / image.size) * 100).toFixed(1);
        toast.success(`PNG compressed! Saved ${savings}%`);
        return;
      } catch (error) {
        console.error('❌ browser-image-compression failed:', error);
        toast.warning('Using standard PNG compression');
        // Fall through to standard method
      }
    }

    // Standard compression for other formats
    const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
    let baseQuality = quality / 100;
    if (compressionMode === 'aggressive') baseQuality = Math.max(0.5, baseQuality - 0.15);
    else if (compressionMode === 'maximum') baseQuality = Math.max(0.3, baseQuality - 0.3);
    let qualityValue = baseQuality;
    let blob = null;
    let attempts = 0;
    const maxAttempts = compressionMode === 'aggressive' || compressionMode === 'maximum' ? 8 : 5;
    while (attempts < maxAttempts) {
      blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), mimeType, qualityValue));
      if (enableUpscale || (blob && blob.size < image.size) || attempts === maxAttempts - 1) break;
      qualityValue -= compressionMode === 'maximum' ? 0.2 : 0.15;
      attempts++;
    }
    if (!enableUpscale && blob && blob.size >= image.size) {
      const compressedUrl = URL.createObjectURL(image);
      setCompressedPreview(compressedUrl);
      setCompressedSize(image.size);
      setCompressedBlob(image);
      setProcessed(true);
      setOutputFormat(format);
      onProcessed({
        id: image.name,
        originalFile: image,
        compressedBlob: image,
        compressedUrl: compressedUrl,
        originalSize: image.size,
        compressedSize: image.size,
        format,
        filename: getOutputFilename(format),
        mediaType: 'image',
        fileFormat: format
      });
      toast.info(`File already optimized as ${format.toUpperCase()} - 0% savings`);
      return;
    }
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
      mediaType: 'image',
      fileFormat: format
    });
  };

  const processImageToAnimation = async () => {
    if (!gifJsLoaded || !window.GIF || !workerBlobUrl) {
      toast.error('Animation library not ready. Please wait...');
      return;
    }
    try {
      toast.info('Creating animation from your image...', { duration: Infinity, id: 'anim-gen' });
      const img = new Image();
      img.src = preview;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
      });
      let width = Math.min(img.width, 800);
      let height = Math.min(img.height, 800);
      if (img.width > width || img.height > height) {
        const ratio = Math.min(width / img.width, height / img.height);
        width = Math.round(img.width * ratio);
        height = Math.round(img.height * ratio);
      }
      width = width % 2 === 0 ? width : width - 1;
      height = height % 2 === 0 ? height : height - 1;
      const totalFrames = 120;
      const frames = [];
      for (let i = 0; i < totalFrames; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        const rawProgress = i < totalFrames / 2 ? i / (totalFrames / 2) : 2 - (i / (totalFrames / 2));
        const progress = rawProgress < 0.5 ? 4 * rawProgress * rawProgress * rawProgress : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;
        switch (animationType) {
          case 'zoom':
            const scale = 1 + (progress * 0.1);
            ctx.translate(width / 2, height / 2);
            ctx.scale(scale, scale);
            ctx.translate(-width / 2, -height / 2);
            break;
          case 'glow':
            const glowIntensity = progress * 0.3;
            ctx.globalAlpha = 1;
            ctx.drawImage(img, 0, 0, width, height);
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = glowIntensity;
            ctx.filter = 'blur(8px)';
            ctx.drawImage(img, -4, -4, width + 8, height + 8);
            ctx.restore();
            frames.push(canvas);
            continue;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();
        frames.push(canvas);
      }
      toast.info('Rendering GIF...', { id: 'anim-gen' });
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
          if (p % 0.2 < 0.01) toast.info(`Rendering: ${(p * 100).toFixed(0)}%...`, { id: 'anim-gen' });
        });
        gif.render();
      });
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

  const savingsPercent = processed ? ((1 - compressedSize / originalSize) * 100).toFixed(1) : 0;
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
  if (isImage && !isGif) availableFormats = enableAnimation ? ['gif'] : ['jpg', 'png', 'webp', 'avif'];
  else if (isGif) availableFormats = ffmpegLoaded ? ['gif', 'mp4'] : ['gif'];
  else if (isVideo) availableFormats = ffmpegLoaded ? ['mp4', 'gif'] : ['mp4'];
  else if (isAudio) availableFormats = ['mp3', 'wav'];

  const performSingleMediaDownload = async (blobToDownload, targetFormat, mediaType, filename) => {
    if (!blobToDownload) {
      toast.error("No file data available to download.");
      return;
    }
    let finalBlob = blobToDownload;
    if (mediaType === 'image' && targetFormat && blobToDownload.type !== (targetFormat === 'jpg' ? 'image/jpeg' : `image/${targetFormat}`)) {
      try {
        toast.info(`Converting to ${targetFormat.toUpperCase()} for download...`);
        const img = new Image();
        img.src = URL.createObjectURL(blobToDownload);
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
        if (!canvas.toDataURL(mimeType).startsWith(`data:${mimeType}`)) {
          throw new Error(`Browser does not support converting to ${targetFormat.toUpperCase()}.`);
        }
        const convertedBlob = await new Promise((resolve) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else resolve(blobToDownload);
          }, mimeType, quality / 100);
        });
        finalBlob = convertedBlob;
      } catch (error) {
        console.error("Error during on-the-fly image conversion:", error);
        toast.error(`Failed to convert image. Downloading original format.`);
        finalBlob = blobToDownload;
      }
    }
    try {
      const url = URL.createObjectURL(finalBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`'${filename}' downloaded!`);
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
      img.src = compressedPreview;
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
            resolve(null);
          }
        });
        if (blob) zip.file(`${baseName}.${f.ext}`, blob);
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
    performSingleMediaDownload(compressedBlob, formatOverride || currentCompressedFormat, mediaType, getOutputFilename(formatOverride || currentCompressedFormat));
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

  const handleEditImage = () => setShowEditor(true);

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
    setGifSettings(prev => ({ ...prev, frames: [], width: 0, height: 0 }));
    parseGif(newUrl);
    setProcessed(false);
    setCompressedPreview(null);
    setCompressedSize(0);
    setError(null);
    setShowGifEditor(false);
    toast.success("GIF edited successfully. Re-compress to finalize.");
  };

  const convertFormat = async (newFormat) => {
    if (!compressedPreview || processing) return;
    if (newFormat === (outputFormat || format)) {
      toast.info(`Already in ${newFormat.toUpperCase()} format.`);
      return;
    }
    if (enableAnimation && newFormat !== 'gif') {
      toast.error('Cannot convert format while animation is enabled.');
      return;
    }
    if (isVideo || isAudio || (isGif && newFormat === 'mp4')) {
      if (!ffmpegLoaded) {
        toast.error('Video/audio processor still loading. Please wait...');
        return;
      }
      setFormat(newFormat);
      await processMedia();
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const img = new Image();
      img.src = compressedPreview;
      await new Promise((resolve) => { img.onload = resolve; });
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const mimeType = newFormat === 'jpg' ? 'image/jpeg' : `image/${newFormat}`;
      let blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), mimeType, quality / 100));
      const originalFileFormat = image.name.split('.').pop().toLowerCase();
      const isConvertingBackToOriginal = newFormat === originalFileFormat || (newFormat === 'jpg' && (originalFileFormat === 'jpeg' || originalFileFormat === 'jpg'));
      if (isConvertingBackToOriginal && blob.size > originalSize) {
        const originalUrl = URL.createObjectURL(image);
        setCompressedPreview(originalUrl);
        setCompressedSize(image.size);
        setCompressedBlob(image);
        setOutputFormat(newFormat);
        setFormat(newFormat);
        onProcessed({
          id: image.name,
          originalFile: image,
          compressedBlob: image,
          compressedUrl: originalUrl,
          originalSize: originalSize,
          compressedSize: image.size,
          format: newFormat,
          filename: getOutputFilename(newFormat),
          mediaType: 'image',
          fileFormat: newFormat
        });
        toast.info(`Converted to ${newFormat.toUpperCase()} - using original file (0% change)`);
        setProcessing(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      setCompressedPreview(url);
      setCompressedSize(blob.size);
      setCompressedBlob(blob);
      setOutputFormat(newFormat);
      setFormat(newFormat);
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
      const savings = ((1 - blob.size / originalSize) * 100).toFixed(1);
      if (blob.size < originalSize) toast.success(`Converted to ${newFormat.toUpperCase()} (${savings}% savings)`);
      else if (blob.size === originalSize) toast.success(`Converted to ${newFormat.toUpperCase()} (0% change)`);
      else toast.success(`Converted to ${newFormat.toUpperCase()}`);
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
            <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 cursor-pointer group" onClick={(isImage || isGif) && processed ? handleCompare : undefined}>
              {isGif && gifFrameCount > 0 && (
                <Badge className="absolute -top-8 left-0 bg-slate-900/90 text-white text-xs px-3 py-1.5 font-bold flex items-center gap-1 shadow-lg z-10 rounded-md">
                  <Film className="w-3 h-3" />
                  {gifFrameCount} frames
                </Badge>
              )}
              {isImage ? <LazyImage src={preview} alt="Original" className="w-full h-full object-cover transition-transform group-hover:scale-105" /> : isVideo ? <video src={preview} controls muted loop className="w-full h-full object-cover" /> : isAudio ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <Music className="w-16 h-16 text-slate-400 mb-2" />
                  <audio src={preview} controls className="w-full" />
                </div>
              ) : null}
              <Badge className="absolute top-2 left-2 bg-slate-900/80 text-white">Original</Badge>
              <Badge className="absolute bottom-2 right-2 bg-slate-900/95 backdrop-blur-sm text-white border border-slate-700 text-xs px-2 py-1 font-bold shadow-lg">{originalExt}</Badge>
              {isImage && !isGif && (
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditImage(); }} className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 h-7 w-7 rounded-lg">
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}
              {isGif && (
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setShowGifEditor(true); }} className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 h-7 w-7 rounded-lg">
                  <Wand2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
          {compressedPreview ? (
            <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 cursor-pointer group" onClick={(isImage || isGif) ? handleCompare : undefined}>
              {isGif && outputGifFrameCount > 0 && (
                <Badge className="absolute -top-8 left-0 bg-slate-900/90 text-white text-xs px-3 py-1.5 font-bold flex items-center gap-1 shadow-lg z-10 rounded-md">
                  <Film className="w-3 h-3" />
                  {outputGifFrameCount} frames
                </Badge>
              )}
              {isImage ? <LazyImage src={compressedPreview} alt="Compressed" className="w-full h-full object-cover transition-transform group-hover:scale-105" /> : isVideo ? <video src={compressedPreview} controls muted loop className="w-full h-full object-cover" /> : isAudio ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <Music className="w-16 h-16 text-emerald-500 mb-2" />
                  <audio src={compressedPreview} controls className="w-full" />
                </div>
              ) : null}
              <Badge className="absolute top-2 left-2 bg-emerald-600 text-white">Compressed</Badge>
              <Badge className="absolute bottom-2 right-2 bg-emerald-600/95 backdrop-blur-sm text-white border border-emerald-500 text-xs px-2 py-1 font-bold shadow-lg">{displayCompressedExt}</Badge>
            </div>
          ) : (
            <div className="aspect-square rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <p className="text-sm text-slate-400 text-center px-2">Preview after compression</p>
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} className="absolute top-0 right-2 bg-slate-900/90 dark:bg-slate-900/90 hover:bg-red-600 dark:hover:bg-red-600 text-white rounded-lg transition-colors z-20 shadow-lg">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <TooltipProvider>
          <div>
            {isEditingFilename ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  value={editableFilename}
                  onChange={(e) => setEditableFilename(e.target.value)}
                  className="flex-1 text-sm font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  onBlur={() => setIsEditingFilename(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingFilename(false);
                      toast.success('Filename updated!');
                    }
                    if (e.key === 'Escape') {
                      setEditableFilename(image.name);
                      setIsEditingFilename(false);
                    }
                  }}
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={() => { setIsEditingFilename(false); toast.success('Filename updated!'); }} className="h-7 w-7 p-0 flex-shrink-0">
                  <Check className="w-4 h-4 text-emerald-600" />
                </Button>
              </div>
            ) : (
              <div className="group flex items-center gap-2 mb-1 cursor-pointer bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 rounded px-3 py-2 transition-all" onClick={() => setIsEditingFilename(true)}>
                <p className="flex-1 font-medium text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate transition-colors" title={editableFilename}>{editableFilename}</p>
                <Edit2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex-shrink-0 transition-colors" />
              </div>
            )}
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span>{formatFileSize(originalSize)}</span>
              {processed && (
                <>
                  <ArrowRight className="w-3 h-3" />
                  <span className={cn("font-medium", sizeIncreased ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")}>{formatFileSize(compressedSize)}</span>
                  <Badge variant="secondary" className={cn(sizeIncreased ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400")}>
                    {sizeIncreased ? '+' : ''}{Math.abs(parseFloat(savingsPercent))}%
                  </Badge>
                </>
              )}
              {processing && estimatedTimeForFile !== null && (
                <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400 ml-auto">~{estimatedTimeForFile}s</Badge>
              )}
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={extractMetadata} className="w-full justify-center mt-3 text-xs">
            <Info className="w-3 h-3 mr-1" /> View Metadata
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs">{error}</span>
            </div>
          )}

          {processed && availableFormats.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Convert Format</label>
                <Tooltip>
                  <TooltipTrigger asChild><Info className="w-3 h-3 text-slate-400 cursor-help" /></TooltipTrigger>
                  <TooltipContent className="max-w-xs"><p className="text-xs">Change to a different format after compression</p></TooltipContent>
                </Tooltip>
              </div>
              <div className={cn("grid gap-2", availableFormats.length === 1 ? "grid-cols-1" : availableFormats.length === 2 ? "grid-cols-2" : "grid-cols-4")}>
                {availableFormats.map((fmt) => (
                  <Button key={fmt} size="sm" variant={displayFormat === fmt ? "default" : "outline"} onClick={() => convertFormat(fmt)} disabled={displayFormat === fmt || processing || (ffmpegLoading && (isVideo || isAudio || (isGif && fmt === 'mp4')))} className={cn("relative text-xs h-9", format === fmt && "bg-emerald-600 hover:bg-emerald-700")}>
                    {fmt.toUpperCase()}
                    {displayFormat === fmt && processing && <Loader2 className="ml-1 h-3 w-3 animate-spin" />}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {!processed && availableFormats.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Output Format</label>
                <Tooltip>
                  <TooltipTrigger asChild><Info className="w-3 h-3 text-slate-400 cursor-help" /></TooltipTrigger>
                  <TooltipContent className="max-w-xs"><p className="text-xs">Choose output format before compression</p></TooltipContent>
                </Tooltip>
              </div>
              <div className={cn("grid gap-2", availableFormats.length === 1 ? "grid-cols-1" : availableFormats.length === 2 ? "grid-cols-2" : "grid-cols-4")}>
                {availableFormats.map((fmt) => (
                  <Button key={fmt} size="sm" variant={format === fmt ? "default" : "outline"} onClick={() => setFormat(fmt)} disabled={processing || (ffmpegLoading && (isVideo || isAudio || (isGif && fmt === 'mp4')))} className={cn("relative text-xs h-9", format === fmt && "bg-emerald-600 hover:bg-emerald-700")}>
                    {fmt.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between" size="sm">
                <span className="flex items-center gap-2"><Settings2 className="w-4 h-4" />Compression Settings</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", settingsOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              {!(isAudio || isVideo || enableAnimation || (isGif && format === 'gif')) && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Quality: {quality}%</label>
                      <Tooltip>
                        <TooltipTrigger asChild><Info className="w-3 h-3 text-slate-400 cursor-help" /></TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">{format === 'png' ? "For PNG: Lower quality = smaller file size, potentially fewer colors. 70-85% recommended." : "Lower quality = smaller file size. 70-85% optimal."}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Slider value={[quality]} onValueChange={(value) => setQuality(value[0])} min={1} max={100} step={1} className="w-full" disabled={processing} />
                  </div>
                  {format === 'png' && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-xs text-blue-700 dark:text-blue-400">
                        <strong>💡 PNG Tip:</strong> Using an advanced compression library. Lower quality means a smaller file size, potentially with some visual degradation.
                      </p>
                    </div>
                  )}
                  {isImage && !isGif && (
                    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Strip Metadata</label>
                          <Tooltip>
                            <TooltipTrigger asChild><Info className="w-3 h-3 text-slate-400 cursor-help" /></TooltipTrigger>
                            <TooltipContent className="max-w-xs"><p className="text-xs">Removes EXIF data to reduce file size and improve privacy.</p></TooltipContent>
                          </Tooltip>
                        </div>
                        <Switch checked={stripMetadata} onCheckedChange={setStripMetadata} disabled={processing} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Noise Reduction</label>
                          <Tooltip>
                            <TooltipTrigger asChild><Info className="w-3 h-3 text-slate-400 cursor-help" /></TooltipTrigger>
                            <TooltipContent className="max-w-xs"><p className="text-xs">Applies high-quality smoothing to reduce noise and grain.</p></TooltipContent>
                          </Tooltip>
                        </div>
                        <Switch checked={noiseReduction} onCheckedChange={setNoiseReduction} disabled={processing} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </CollapsibleContent>
          </Collapsible>

          {isImage && !isGif && (
            <Collapsible open={upscaleSettingsOpen} onOpenChange={setUpscaleSettingsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between" size="sm">
                  <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" />Upscale Settings</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", upscaleSettingsOpen && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Enable Upscaling</label>
                    <Tooltip>
                      <TooltipTrigger asChild><Info className="w-3 h-3 text-slate-400 cursor-help" /></TooltipTrigger>
                      <TooltipContent className="max-w-xs"><p className="text-xs">Allow increasing image dimensions beyond original size.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Switch checked={enableUpscale} onCheckedChange={(checked) => { setEnableUpscale(checked); if (!checked) { setUpscaleMultiplier(null); setMaxWidth(null); setMaxHeight(null); }}} disabled={processing} />
                </div>
                {enableUpscale && (
                  <>
                    {originalImageDimensions.width > 0 && originalImageDimensions.height > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400">Current Resolution:</span>
                          <span className="font-medium text-slate-900 dark:text-white">{originalImageDimensions.width} × {originalImageDimensions.height}</span>
                        </div>
                        {(upscaleMultiplier || maxWidth || maxHeight) && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">After Upscale:</span>
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                              {upscaleMultiplier ? (
                                `${Math.round(originalImageDimensions.width * (upscaleMultiplier / 100))} × ${Math.round(originalImageDimensions.height * (upscaleMultiplier / 100))}`
                              ) : (
                                (() => {
                                  const aspectRatio = originalImageDimensions.width / originalImageDimensions.height;
                                  let newWidth = maxWidth || originalImageDimensions.width;
                                  let newHeight = maxHeight || originalImageDimensions.height;
                                  if (maxWidth && maxHeight) {
                                    const widthRatio = maxWidth / originalImageDimensions.width;
                                    const heightRatio = maxHeight / originalImageDimensions.height;
                                    const ratio = Math.max(widthRatio, heightRatio);
                                    newWidth = Math.round(originalImageDimensions.width * ratio);
                                    newHeight = Math.round(originalImageDimensions.height * ratio);
                                  } else if (maxWidth) {
                                    newWidth = maxWidth;
                                    newHeight = Math.round(maxWidth / aspectRatio);
                                  } else if (maxHeight) {
                                    newHeight = maxHeight;
                                    newWidth = Math.round(maxHeight * aspectRatio);
                                  }
                                  return `${newWidth} × ${newHeight}`;
                                })()
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Upscale Multiplier</label>
                        <Tooltip>
                          <TooltipTrigger asChild><Info className="w-3 h-3 text-slate-400 cursor-help" /></TooltipTrigger>
                          <TooltipContent className="max-w-xs"><p className="text-xs">Quick preset multipliers. 100% = original, 200% = double size.</p></TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[100, 150, 200, 300, 400, 500].map((multiplier) => (
                          <Button key={multiplier} size="sm" variant={upscaleMultiplier === multiplier ? "default" : "outline"} onClick={() => { setUpscaleMultiplier(multiplier); setMaxWidth(null); setMaxHeight(null); }} disabled={processing} className={cn("text-xs h-9", upscaleMultiplier === multiplier && "bg-emerald-600 hover:bg-emerald-700")}>
                            {multiplier}%
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2 mb-2">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Or Set Custom Dimensions</label>
                        <Tooltip>
                          <TooltipTrigger asChild><Info className="w-3 h-3 text-slate-400 cursor-help" /></TooltipTrigger>
                          <TooltipContent className="max-w-xs"><p className="text-xs">Manually specify target width/height in pixels. Aspect ratio maintained automatically.</p></TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">Max Width (px)</label>
                          <input type="number" placeholder="Auto" value={maxWidth || ''} onChange={(e) => { setMaxWidth(e.target.value ? parseInt(e.target.value) : null); if (e.target.value) setUpscaleMultiplier(null); }} className="w-full h-9 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm" disabled={processing} />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 block">Max Height (px)</label>
                          <input type="number" placeholder="Auto" value={maxHeight || ''} onChange={(e) => { setMaxHeight(e.target.value ? parseInt(e.target.value) : null); if (e.target.value) setUpscaleMultiplier(null); }} className="w-full h-9 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm" disabled={processing} />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {isImage && !isGif && (
            <Collapsible open={animationSettingsOpen} onOpenChange={setAnimationSettingsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between" size="sm">
                  <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" />Simple Animation {!gifJsLoaded && enableAnimation && <span className="text-xs text-slate-500">(Loading...)</span>}</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", animationSettingsOpen && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Enable Animation</label>
                    <Tooltip>
                      <TooltipTrigger asChild><Info className="w-3 h-3 text-slate-400 cursor-help" /></TooltipTrigger>
                      <TooltipContent className="max-w-xs"><p className="text-xs">Transform static image into animated GIF with smooth effects.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Switch checked={enableAnimation} onCheckedChange={(checked) => { setEnableAnimation(checked); if (checked) { setFormat('gif'); setGeneratedAnimations([]); setOutputGifFrameCount(0); toast.info('Format set to GIF!'); } else { setFormat('jpg'); setGeneratedAnimations([]); setOutputGifFrameCount(0); }}} disabled={processing} />
                </div>
                {enableAnimation && (
                  <>
                    {!gifJsLoaded && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                        <p className="text-xs text-emerald-700 dark:text-emerald-400"><strong>⚡ Loading animation engine...</strong></p>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Animation Type</label>
                        <Tooltip>
                          <TooltipTrigger asChild><Info className="w-3 h-3 text-slate-400 cursor-help" /></TooltipTrigger>
                          <TooltipContent className="max-w-xs"><p className="text-xs"><strong>Free:</strong> Smooth Zoom, Glow Pulse</p></TooltipContent>
                        </Tooltip>
                      </div>
                      <Select value={animationType} onValueChange={setAnimationType} disabled={processing}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zoom">Smooth Zoom</SelectItem>
                          <SelectItem value="glow">Glow Pulse</SelectItem>
                          {isPro && (
                            <>
                              <SelectItem value="pan">Pan (Pro)</SelectItem>
                              <SelectItem value="rotate">Rotate (Pro)</SelectItem>
                              <SelectItem value="slide">Slide (Pro)</SelectItem>
                              <SelectItem value="bounce">Bounce (Pro)</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Animation Duration: {animationDuration}s</label>
                        <Tooltip>
                          <TooltipTrigger asChild><Info className="w-3 h-3 text-slate-400 cursor-help" /></TooltipTrigger>
                          <TooltipContent className="max-w-xs"><p className="text-xs">Total length of the animation loop. 3-5s recommended.</p></TooltipContent>
                        </Tooltip>
                      </div>
                      <Slider value={[animationDuration]} onValueChange={(value) => setAnimationDuration(value[0])} min={3} max={10} step={1} className="w-full" disabled={processing} />
                    </div>
                  </>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          <div className="flex gap-2">
            {!processed ? (
              <Button onClick={processMedia} disabled={processing || (isVideo && !ffmpegLoaded) || (isAudio && !ffmpegLoaded) || (isGif && format === 'mp4' && !ffmpegLoaded) || (((isGif && format === 'gif') || (isImage && !isGif && enableAnimation)) && !gifJsLoaded)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white relative overflow-hidden">
                {processing && <div className="absolute inset-0 bg-emerald-500 transition-all duration-300 ease-linear" style={{ width: `${processingProgress}%`, left: 0 }} />}
                <span className="relative z-10 flex items-center justify-center">
                  {processing ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Optimizing... {Math.round(processingProgress)}%</>) : (<>{MediaIcon && <MediaIcon className="w-4 h-4 mr-2" />}{enableAnimation ? 'Create Animation' : 'Optimize Asset'}</>)}
                </span>
              </Button>
            ) : (
              <>
                <Button onClick={processMedia} variant="outline" className="flex-1" disabled={processing || (isVideo && !ffmpegLoaded) || (isAudio && !ffmpegLoaded) || (isGif && format === 'mp4' && !ffmpegLoaded) || (((isGif && format === 'gif') || (isImage && !isGif && enableAnimation)) && !gifJsLoaded)}>
                  <RefreshCcw className="w-4 h-4 mr-2" />Reprocess
                </Button>
                <Button onClick={() => downloadMedia()} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={processing}>
                  <Download className="w-4 h-4 mr-2" />Download
                </Button>
              </>
            )}
          </div>

          {processed && !error && (
            <div className={cn("flex items-center gap-2 text-sm p-3 rounded-lg", compressedSize < originalSize ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30")}>
              <CheckCircle2 className="w-4 h-4" />
              <span>{compressedSize < originalSize ? `Saved ${formatFileSize(originalSize - compressedSize)}` : `Added (+${formatFileSize(compressedSize - originalSize)})`}</span>
            </div>
          )}
        </TooltipProvider>
      </div>

      {showEditor && isImage && !isGif && <ImageEditor isOpen={showEditor} onClose={() => setShowEditor(false)} imageData={preview} onSave={handleSaveEdit} />}
      {showGifEditor && isGif && <GifEditor isOpen={showGifEditor} onClose={() => setShowGifEditor(false)} gifData={preview} onSave={handleSaveGifEdit} />}
      {showDownloadModal && compressedBlob && <DownloadModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} blob={compressedBlob} originalFilename={getOutputFilename()} format={outputFormat || format} generatedAnimations={generatedAnimations.length > 0 ? generatedAnimations : null} />}
      {showMetadataViewer && fileMetadata && (
        <Dialog open={showMetadataViewer} onOpenChange={setShowMetadataViewer}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>File Metadata</DialogTitle>
              <DialogDescription>Detailed information about your file.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {Object.entries(fileMetadata).map(([key, value]) => (
                <div key={key} className="contents">
                  <span className="font-medium text-slate-600 dark:text-slate-400">{key.replace(/([A-Z])/g, ' $1').trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:</span>
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