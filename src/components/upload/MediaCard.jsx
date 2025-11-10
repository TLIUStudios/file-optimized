
import { useState, useEffect, lazy, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, X, Loader2, CheckCircle2, ArrowRight, Settings2, AlertCircle, Info, Edit2, RefreshCcw, Sparkles, Film, Music, Video, ChevronDown, Check } from "lucide-react";
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
import { base44 } from "@/api/base44Client";

// Lazy load the editor and download modal
const ImageEditor = lazy(() => import("./ImageEditor"));
const DownloadModal = lazy(() => import("./DownloadModal"));

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

  // Animation states
  const [animationSettingsOpen, setAnimationSettingsOpen] = useState(false);
  const [enableAnimation, setEnableAnimation] = useState(false);
  const [animationDuration, setAnimationDuration] = useState(3);
  const [generatedAnimations, setGeneratedAnimations] = useState([]);
  const [gifJsLoaded, setGifJsLoaded] = useState(false);
  const [workerBlobUrl, setWorkerBlobUrl] = useState(null);
  const [outputGifFrameCount, setOutputGifFrameCount] = useState(0);

  // Editable filename
  const [editableFilename, setEditableFilename] = useState('');
  const [isEditingFilename, setIsEditingFilename] = useState(false);

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

  // Load FFmpeg when video/audio is uploaded
  useEffect(() => {
    if ((isVideo || isAudio) && !ffmpegLoaded && !ffmpegLoading && !ffmpegLoadError) {
      loadFFmpeg();
    }
  }, [isVideo, isAudio, ffmpegLoaded, ffmpegLoading, ffmpegLoadError]);

  const loadFFmpeg = async () => {
    if (ffmpegLoading || ffmpegLoaded) return;

    setFfmpegLoading(true);
    const toastId = toast.info('Loading video/audio processor (10-20 seconds)...', { duration: Infinity });

    try {
      // Use unpkg.com for better CORS support
      const { FFmpeg } = await import('https://unpkg.com/@ffmpeg/ffmpeg@0.12.6/dist/esm/index.js');
      const { fetchFile } = await import('https://unpkg.com/@ffmpeg/util@0.12.1/dist/esm/index.js');

      const ffmpeg = new FFmpeg();

      // Log for debugging
      ffmpeg.on('log', ({ message }) => {
        console.log('FFmpeg:', message);
      });

      ffmpeg.on('progress', ({ progress, time }) => {
        console.log(`FFmpeg Progress: ${(progress * 100).toFixed(2)}%`);
      });

      // Load FFmpeg with proper CORS handling
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';

      await ffmpeg.load({
        coreURL: `${baseURL}/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg-core.wasm`,
      });

      ffmpegRef.current = ffmpeg;
      setFfmpegLoaded(true);
      setFfmpegLoading(false);
      toast.dismiss(toastId);
      toast.success('Video/audio processor ready! ✅');
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      toast.dismiss(toastId);
      setFfmpegLoading(false);
      setFfmpegLoadError(error.message);

      // Show ONE clear error message
      toast.error('Failed to load video/audio processor. Please refresh the page and try again.', { duration: 5000 });
      setError('Video/audio processing unavailable. Please refresh the page.');
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
    if ((enableAnimation || isGif) && !gifJsLoaded) {
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

          // Only show success toast for animations, not regular GIF compression
          if (enableAnimation) {
            toast.success('AI animation engine ready!');
          }
        } catch (error) {
          console.error('Failed to load GIF.js:', error);
          toast.error('Failed to load GIF processor: ' + error.message);
        }
      };

      loadGifJs();
    }
  }, [enableAnimation, isGif, gifJsLoaded, workerBlobUrl]);

  useEffect(() => {
    return () => {
      if (workerBlobUrl) {
        URL.revokeObjectURL(workerBlobUrl);
      }
    };
  }, [workerBlobUrl]);

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

  const processMedia = async () => {
    setProcessing(true);
    setError(null);
    setOutputFormat(null);
    setGeneratedAnimations([]);
    setOutputGifFrameCount(0);

    try {
      if (isImage && enableAnimation) {
        if (!gifJsLoaded || !workerBlobUrl) {
          toast.error('AI animation engine still loading. Please wait a moment...');
          setProcessing(false);
          return;
        }
        await processImageToAnimation();
      } else if (isVideo) {
        if (!ffmpegLoaded) {
          toast.error('Video processor still loading. Please wait...');
          setProcessing(false);
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
          return;
        }
        await processAudio();
      } else if (isGif) {
        if (!ffmpegLoaded && format === 'mp4') { // Only block if MP4 conversion is requested
          toast.error('Video processor still loading (needed for GIF to MP4 conversion). Please wait...');
          setProcessing(false);
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
      console.log('🎞️ Starting GIF compression...');

      // Check if GIF.js is loaded
      if (!gifJsLoaded || !window.GIF || !workerBlobUrl) {
        toast.error('GIF processor still loading. Please wait a moment...');
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
          compressedUrl,
          originalSize: image.size,
          compressedSize: originalBlob.size,
          format: 'gif',
          filename: getOutputFilename('gif'),
          mediaType: 'image',
          fileFormat: 'gif'
        });

        toast.info('GIF processed (animation preserved)');
        return;
      }

      let targetWidth = gifSettings.width;
      let targetHeight = gifSettings.height;

      if (maxWidth || maxHeight) {
        const aspectRatio = gifSettings.width / gifSettings.height;

        if (maxWidth && maxHeight) {
          const widthRatio = maxWidth / gifSettings.width;
          const heightRatio = maxHeight / gifSettings.height;
          const ratio = Math.min(widthRatio, heightRatio);
          targetWidth = Math.round(gifSettings.width * ratio);
          targetHeight = Math.round(gifSettings.height * ratio);
        } else if (maxWidth && maxWidth < gifSettings.width) {
          targetWidth = maxWidth;
          targetHeight = Math.round(maxWidth / aspectRatio);
        } else if (maxHeight && maxHeight < gifSettings.height) {
          targetHeight = maxHeight;
          targetWidth = Math.round(maxHeight * aspectRatio);
        }
      }

      // Improved frame skipping based on quality vs size preference
      let frameSkip = 1;
      if (gifOptimization === 'balanced') {
        frameSkip = 2;
      } else if (gifOptimization === 'size') {
        frameSkip = 3;
      }
      // 'quality' mode: frameSkip = 1 (no skipping)

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      const processedFrames = [];
      const maxFrames = Math.min(gifSettings.frames.length, gifOptimization === 'quality' ? 600 : 400);
      let prevImageData = null;

      for (let i = 0; i < maxFrames; i += frameSkip) {
        const frame = gifSettings.frames[i];
        if (!frame || !frame.patch || !frame.dims) continue;

        const imageData = new ImageData(
          new Uint8ClampedArray(frame.patch),
          frame.dims.width,
          frame.dims.height
        );

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = frame.dims.width;
        tempCanvas.height = frame.dims.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) continue;

        tempCtx.putImageData(imageData, 0, 0);
        ctx.clearRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);

        let delay = frame.delay ? Math.max(20, frame.delay * 10 * frameSkip) : 100 * frameSkip;
        const frameImageData = ctx.getImageData(0, 0, targetWidth, targetHeight);

        // Only skip duplicate frames in 'size' mode
        if (gifOptimization === 'size' && prevImageData) {
          const diff = calculateFrameDifference(prevImageData.data, frameImageData.data);
          if (diff < 0.05) continue;
        }

        prevImageData = frameImageData;
        processedFrames.push({
          data: new Uint8ClampedArray(frameImageData.data),
          delay,
          width: targetWidth,
          height: targetHeight
        });
      }

      if (processedFrames.length === 0) throw new Error('No frames processed');

      const GIF = window.GIF;

      // IMPROVED QUALITY SETTINGS
      let gifQuality;
      if (gifOptimization === 'quality') {
        // Quality mode: 1-5 (lower is better in gif.js)
        gifQuality = Math.max(1, Math.min(5, Math.round((100 - quality) / 20)));
      } else if (gifOptimization === 'balanced') {
        gifQuality = Math.max(5, Math.min(15, Math.round((100 - quality) / 7)));
      } else {
        // Size mode
        gifQuality = Math.max(10, Math.min(20, Math.round((100 - quality) / 5)));
      }

      const gif = new GIF({
        workers: 4, // More workers for faster processing
        quality: gifQuality,
        width: targetWidth,
        height: targetHeight,
        workerScript: workerBlobUrl,
        dither: false, // No dithering for better quality
        transparent: null,
        repeat: 0
      });

      for (const frameData of processedFrames) {
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = frameData.width;
        frameCanvas.height = frameData.height;
        const frameCtx = frameCanvas.getContext('2d');
        if (!frameCtx) continue;

        const imgData = new ImageData(frameData.data, frameData.width, frameData.height);
        frameCtx.putImageData(imgData, 0, 0);

        gif.addFrame(frameCanvas, { delay: frameData.delay, copy: true, dispose: 2 });
      }

      const gifBlob = await new Promise((resolve, reject) => {
        gif.on('finished', resolve);
        gif.on('error', reject);
        gif.render();
      });

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
        toast.success(`GIF compressed! Saved ${savings}% • ${processedFrames.length} frames kept`);
      } else {
        toast.info(`GIF processed • ${processedFrames.length} frames`);
      }
    } catch (error) {
      console.error('GIF compression failed:', error);
      throw error;
    }
  };

  const calculateFrameDifference = (data1, data2) => {
    let diff = 0;
    for (let i = 0; i < data1.length; i += 4) {
      diff += Math.abs(data1[i] - data2[i]) + Math.abs(data1[i + 1] - data2[i + 1]) + Math.abs(data1[i + 2] - data2[i + 2]);
    }
    return diff / (data1.length * 255);
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

      // Changed condition: now it's `enableUpscale || blob.size < image.size`
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

  // Generate REAL AI-powered animation variations - IMPROVED for Midjourney-style
  const processImageToAnimation = async () => {
    if (!gifJsLoaded || !window.GIF || !workerBlobUrl) {
      toast.error('Animation library not ready yet. Please wait...');
      return;
    }

    try {
      console.log('🎬 Starting Midjourney-style AI animation...');

      // Step 1: Upload image
      toast.info('Step 1/3: Uploading your image...', { duration: Infinity, id: 'anim-gen' });
      const response = await fetch(preview);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: blob.type });

      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      if (!uploadResult || !uploadResult.file_url) {
        throw new Error('Failed to upload image');
      }
      const imageUrl = uploadResult.file_url;
      console.log('✅ Image uploaded');

      // Step 2: AI analyzes and creates animation concepts
      toast.info('Step 2/3: AI analyzing your image...', { id: 'anim-gen' });

      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are analyzing this EXACT image to create smooth, natural animations that bring it to life.

CRITICAL: This is like Midjourney's animation feature - you must preserve the EXACT subject, style, composition, and quality of the uploaded image.

Task:
1. Analyze what's in this image (subject, pose, background, style, colors, lighting)
2. Create 2-3 creative animation concepts that would work for THIS specific image
3. Each animation should be subtle and loop seamlessly

Animation types that work well:
- Gentle camera movements (slow zoom, pan, or rotate)
- Subject movements (breathing, blinking, hair flowing, clothes swaying)
- Environmental effects (particles, lighting changes, atmosphere)
- Subtle transformations

For EACH animation concept, provide:
- Name: Short descriptive name (e.g., "Gentle Breeze", "Slow Zoom")
- Concept: Brief description of the motion
- Keyframes: 6 detailed descriptions for frames at 0%, 20%, 40%, 60%, 80%, 100%
  * Frame 0% = EXACT uploaded image
  * Frames 20-80% = Progressive motion
  * Frame 100% = Returns to EXACT original state for perfect loop

CRITICAL RULES:
- Maintain EXACT same subject, features, pose, colors, lighting, and quality
- Describe subtle changes only (like "subject's hair moves slightly left" not "completely different hair")
- Focus on smooth, natural motion that enhances the image
- NO radical changes, new objects, or style shifts
- Each frame should be recognizably the same image with minor variations`,
        file_urls: [imageUrl],
        response_json_schema: {
          type: "object",
          properties: {
            image_description: { type: "string" },
            style: { type: "string" },
            animations: {
              type: "array",
              minItems: 2,
              maxItems: 3,
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  concept: { type: "string" },
                  keyframes: {
                    type: "array",
                    minItems: 6,
                    maxItems: 6,
                    items: { type: "string" }
                  }
                },
                required: ["name", "concept", "keyframes"]
              }
            }
          },
          required: ["animations"]
        }
      });

      console.log('✅ AI Analysis:', analysisResult);

      if (!analysisResult?.animations || analysisResult.animations.length === 0) {
        throw new Error('AI could not create animations for this image');
      }

      const animations = Array.isArray(analysisResult.animations)
        ? analysisResult.animations
        : Object.values(analysisResult.animations);

      console.log(`✅ Creating ${animations.length} animations`);

      // Step 3: Generate each animation
      const generatedGifs = [];

      for (let animIndex = 0; animIndex < animations.length; animIndex++) {
        const anim = animations[animIndex];

        if (!anim?.name || !anim?.keyframes || anim.keyframes.length < 6) {
          console.warn(`Skipping invalid animation ${animIndex + 1}`);
          continue;
        }

        try {
          console.log(`\n🎨 Creating: ${anim.name}`);
          toast.info(`Step 3/3: ${anim.name} (${animIndex + 1}/${animations.length})...`, { id: 'anim-gen' });

          const frames = [];

          // Generate 12 frames total (interpolating between keyframes)
          const totalFrames = 12;
          const keyframeIndices = [0, 2, 5, 7, 10, 11]; // Map 6 keyframes to 12 frames

          for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
            // Frame 0 and 11 always use original image
            if (frameIndex === 0 || frameIndex === 11) {
              frames.push({ url: imageUrl, index: frameIndex, isOriginal: true });
              console.log(`✅ Frame ${frameIndex + 1}: Original image`);
              continue;
            }

            try {
              // Find closest keyframe
              const keyframeIdx = keyframeIndices.findIndex(k => k >= frameIndex);
              const keyframeDesc = anim.keyframes[keyframeIdx] || anim.keyframes[Math.floor(frameIndex / 2)];

              console.log(`Generating frame ${frameIndex + 1}/${totalFrames}...`);
              toast.info(`${anim.name}: Frame ${frameIndex + 1}/${totalFrames}...`, { id: 'anim-gen' });

              // CRITICAL: Include original image as reference for ALL frames
              const framePrompt = `EXACT SAME IMAGE with subtle change: ${keyframeDesc}.
Style: ${analysisResult.style || 'match original exactly'}.
CRITICAL: Keep exact same subject, pose, composition, colors, lighting, and quality. Only apply the subtle motion described.`;

              const frameResult = await base44.integrations.Core.GenerateImage({
                prompt: framePrompt,
                file_urls: [imageUrl]
              });

              if (frameResult?.url) {
                frames.push({ url: frameResult.url, index: frameIndex, isOriginal: false });
                console.log(`✅ Frame ${frameIndex + 1} generated`);
              }
            } catch (frameError) {
              console.error(`Failed frame ${frameIndex + 1}:`, frameError);
            }
          }

          if (frames.length < 6) {
            console.warn(`Only ${frames.length} frames for ${anim.name}, skipping`);
            continue;
          }

          console.log(`✅ Loading ${frames.length} images...`);
          toast.info(`${anim.name}: Loading images...`, { id: 'anim-gen' });

          // Load images
          const loadedFrames = [];
          for (const frame of frames) {
            try {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Timeout')), 30000);
                img.onload = () => { clearTimeout(timeout); resolve(); };
                img.onerror = () => { clearTimeout(timeout); reject(); };
                img.src = frame.url;
              });
              loadedFrames.push({ img, index: frame.index });
            } catch {}
          }

          if (loadedFrames.length < 4) {
            console.warn(`Only ${loadedFrames.length} images loaded, skipping`);
            continue;
          }

          loadedFrames.sort((a, b) => a.index - b.index);
          console.log(`✅ ${loadedFrames.length} frames ready`);

          // Create GIF with HIGH QUALITY settings
          toast.info(`${anim.name}: Creating high-quality GIF...`, { id: 'anim-gen' });

          const firstImg = loadedFrames[0].img;
          let width = Math.min(firstImg.width, 800);
          let height = Math.min(firstImg.height, 800);
          width = width % 2 === 0 ? width : width - 1;
          height = height % 2 === 0 ? height : height - 1;

          const GIF = window.GIF;
          const gif = new GIF({
            workers: 4,
            quality: 5, // High quality (1-10 scale, lower = better)
            width,
            height,
            workerScript: workerBlobUrl,
            repeat: 0,
            dither: false
          });

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          const frameDelay = Math.round((animationDuration * 1000) / loadedFrames.length);

          for (const { img } of loadedFrames) {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            gif.addFrame(ctx, { delay: frameDelay, copy: true, dispose: 2 });
          }

          const gifBlob = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Rendering timeout')), 120000);
            gif.on('finished', (blob) => { clearTimeout(timeout); resolve(blob); });
            gif.on('error', (err) => { clearTimeout(timeout); reject(err); });
            gif.on('progress', (p) => {
              if (p % 0.25 < 0.01) toast.info(`${anim.name}: ${(p * 100).toFixed(0)}%...`, { id: 'anim-gen' });
            });
            gif.render();
          });

          const gifUrl = URL.createObjectURL(gifBlob);
          generatedGifs.push({
            name: anim.name,
            blob: gifBlob,
            url: gifUrl,
            size: gifBlob.size,
            description: anim.concept,
            frameCount: loadedFrames.length
          });

          console.log(`✅ ${anim.name} complete! (${(gifBlob.size / 1024).toFixed(1)}KB)\n`);
        } catch (animError) {
          console.error(`Failed ${anim.name}:`, animError);
        }
      }

      if (generatedGifs.length === 0) {
        throw new Error('Could not create animations. Try a different image or check your connection.');
      }

      setGeneratedAnimations(generatedGifs);
      toast.dismiss('anim-gen');
      toast.success(`${generatedGifs.length} AI animation${generatedGifs.length > 1 ? 's' : ''} created! 🎬`);

      setCompressedPreview(generatedGifs[0].url);
      setCompressedSize(generatedGifs[0].size);
      setCompressedBlob(generatedGifs[0].blob);
      setProcessed(true);
      setOutputFormat('gif');
      setOutputGifFrameCount(generatedGifs[0].frameCount);

      onProcessed({
        id: image.name,
        originalFile: image,
        compressedBlob: generatedGifs[0].blob,
        compressedUrl: generatedGifs[0].url,
        originalSize: image.size,
        compressedSize: generatedGifs[0].size,
        format: 'gif',
        filename: getOutputFilename('gif'),
        mediaType: 'image',
        fileFormat: 'gif',
        animations: generatedGifs
      });

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

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const originalExt = image.name.split('.').pop().toUpperCase();
  const displayFormat = outputFormat || format;
  const displayCompressedExt = displayFormat.toUpperCase();

  let availableFormats = [];
  if (isImage && !isGif && enableAnimation) {
    availableFormats = ['gif'];
  } else if (isImage && !isGif) {
    availableFormats = ['jpg', 'png', 'webp', 'avif'];
  } else if (isGif) {
    availableFormats = ffmpegLoaded ? ['gif', 'mp4'] : ['gif'];
  } else if (isVideo) {
    availableFormats = ffmpegLoaded ? ['mp4', 'gif'] : ['mp4'];
  } else if (isAudio) {
    availableFormats = ['mp3', 'wav'];
  }

  const mediaIcon = isVideo ? Video : isAudio ? Music : isGif || (isImage && enableAnimation) ? Film : null;
  const MediaIcon = mediaIcon;

  const performSingleMediaDownload = async (blob, targetFormat, mediaType, filename) => {
    if (!blob) {
      toast.error("No compressed file available to download.");
      return;
    }

    let finalBlob = blob;
    let finalFilename = filename || getOutputFilename(targetFormat);

    if (isImage && !isGif && !enableAnimation && targetFormat && targetFormat !== (outputFormat || format)) {
      try {
        const img = new Image();
        img.src = compressedPreview;
        await new Promise((resolve) => { img.onload = resolve; });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const mimeType = targetFormat === 'jpg' ? 'image/jpeg' : `image/${targetFormat}`;
        const qualityValue = quality / 100;

        const convertedBlob = await new Promise((resolve) => {
          canvas.toBlob((b) => resolve(b), mimeType, qualityValue);
        });
        finalBlob = convertedBlob;
      } catch (error) {
        console.error("Error during on-the-fly image conversion for download:", error);
        toast.error(`Failed to convert image to ${targetFormat} for download.`);
        return;
      }
    }

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

  const downloadMedia = async (formatOverride = null) => {
    if (!compressedBlob) {
      toast.error("No processed media available for download.");
      return;
    }

    const mediaType = isVideo ? 'video' : isAudio ? 'audio' : 'image';
    const currentCompressedFormat = outputFormat || format;

    if (isImage && enableAnimation) {
      setShowDownloadModal(true);
      return;
    }

    if (mediaType === 'image' && formatOverride === null) {
      setShowDownloadModal(true);
      return;
    }

    if (mediaType === 'video' && formatOverride === null) {
      performSingleMediaDownload(compressedBlob, currentCompressedFormat, 'video', getOutputFilename(currentCompressedFormat));
      return;
    }

    if (mediaType === 'audio' && formatOverride === null) {
      performSingleMediaDownload(compressedBlob, currentCompressedFormat, 'audio', getOutputFilename(currentCompressedFormat));
      return;
    }

    performSingleMediaDownload(compressedBlob, formatOverride, mediaType, getOutputFilename(formatOverride));
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
        mediaType: isImage && enableAnimation ? 'image' : isVideo ? 'video' : isAudio ? 'audio' : 'image',
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

  const convertFormat = async (newFormat) => {
    if (!compressedPreview || processing) return;

    // If already in the target format, do nothing
    if (newFormat === (outputFormat || format)) {
      toast.info(`Already in ${newFormat.toUpperCase()} format.`);
      return;
    }

    // For image animations, only GIF is supported as output
    if (isImage && enableAnimation) {
      if (newFormat !== 'gif') {
        toast.error('Animations can only be exported as GIF.');
        return;
      }
      return; // If format is already gif and animation enabled, nothing else to do.
    }

    // For video/audio/GIF conversions that require FFmpeg, we trigger a full re-process.
    // This handles: isVideo to gif, isGif to mp4, isAudio to mp3/wav, or (re)processing video/audio
    if (isVideo || isAudio || (isGif && newFormat === 'mp4')) {
      if (!ffmpegLoaded) {
        toast.error('Video/audio processor still loading. Please wait...');
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

  const downloadAnimation = (animIndex) => {
    if (!generatedAnimations[animIndex]) return;

    const anim = generatedAnimations[animIndex];
    const link = document.createElement('a');
    link.href = anim.url;
    const baseName = editableFilename.split('.').slice(0, -1).join('.') || editableFilename;
    link.download = `${baseName}_${anim.name.toLowerCase().replace(/\s+/g, '_')}.gif`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast.success(`${anim.name} downloaded!`);
  };

  const downloadAllAnimations = async () => {
    if (generatedAnimations.length === 0) return;

    toast.info('Creating zip with all animations...');
    const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
    const zip = new JSZip();

    const baseName = editableFilename.split('.').slice(0, -1).join('.') || editableFilename;
    generatedAnimations.forEach((anim) => {
      const filename = `${baseName}_${anim.name.toLowerCase().replace(/\s+/g, '_')}.gif`;
      zip.file(filename, anim.blob);
    });

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${baseName}-animations.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast.success('All animations downloaded!');
    } catch (error) {
      console.error('Error zipping animations:', error);
      toast.error('Failed to create ZIP file for animations.');
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
              {(isGif && gifFrameCount > 0) || (isImage && enableAnimation && outputGifFrameCount > 0) ? (
                <Badge className="absolute -top-8 left-0 bg-slate-900/90 text-white text-xs px-3 py-1.5 font-bold flex items-center gap-1 shadow-lg z-10 rounded-md">
                  <Film className="w-3 h-3" />
                  {isImage && enableAnimation ? outputGifFrameCount : gifFrameCount} frames
                </Badge>
              ) : null}

              {(isImage && !enableAnimation) ? (
                <LazyImage
                  src={preview}
                  alt="Original"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : isVideo || (isImage && enableAnimation) ? ( // Render img tag for animations (as they are GIFs)
                <img src={preview} alt="Original" className="w-full h-full object-cover" />
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
            </div>
          )}
          {compressedPreview ? (
            <div
              className="relative aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 cursor-pointer group"
              onClick={(isImage || isGif) ? handleCompare : undefined}
            >
              {(isGif && outputGifFrameCount > 0) || (isImage && enableAnimation && outputGifFrameCount > 0) ? (
                <Badge className="absolute -top-8 left-0 bg-slate-900/90 text-white text-xs px-3 py-1.5 font-bold flex items-center gap-1 shadow-lg z-10 rounded-md">
                  <Film className="w-3 h-3" />
                  {outputGifFrameCount} frames
                </Badge>
              ) : null}

              {(isImage && !enableAnimation) ? (
                <LazyImage
                  src={compressedPreview}
                  alt="Compressed"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : isVideo || (isImage && enableAnimation) ? ( // Render img tag for animations (as they are GIFs)
                <img src={compressedPreview} alt="Compressed" className="w-full h-full object-cover" />
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
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsEditingFilename(false);
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
              onClick={() => setIsEditingFilename(true)}
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
                    displayFormat === fmt && "bg-emerald-600 hover:bg-emerald-700"
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
              {/* Loading state for FFmpeg */}
              {(isVideo || isAudio || (isGif && format === 'mp4')) && ffmpegLoading && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      <strong>⚡ Loading video/audio processor...</strong>
                    </p>
                  </div>
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

              {/* Image/GIF Specific Settings (when not video, audio, or AI animation) */}
              {!(isAudio || isVideo || (isImage && enableAnimation)) && (
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

                  {isGif && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          GIF Optimization
                        </label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3 h-3 text-slate-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-xs">
                              <strong>Quality:</strong> Best quality, all frames preserved<br/>
                              <strong>Balanced:</strong> Good quality, some frames skipped<br/>
                              <strong>Size:</strong> Smallest file, more compression
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select value={gifOptimization} onValueChange={setGifOptimization} disabled={processing}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quality">Quality (Best Quality)</SelectItem>
                          <SelectItem value="balanced">Balanced (Good Quality)</SelectItem>
                          <SelectItem value="size">Size (Smallest File)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {(isImage && !isGif && !enableAnimation) && (
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

                  {(isImage && !isGif && !enableAnimation) && (
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

        {(isImage && !isGif && !enableAnimation) && ( // Upscale settings only for static images, not for animations
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
                  AI Animation {!gifJsLoaded && enableAnimation && <span className="text-xs text-slate-500">(Loading...)</span>}
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
                      Enable AI Animation
                    </label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-slate-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">AI analyzes your image and generates 4 unique animated GIF variations with REAL motion - subjects actually move and perform actions!</p>
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
                        setOutputGifFrameCount(0); // Clear output frame count
                        toast.info('Format set to GIF for animation. Loading AI library...');
                      } else {
                        setFormat('jpg');
                        setGeneratedAnimations([]);
                        setOutputGifFrameCount(0); // Clear output frame count
                        toast.info('Animation disabled. Format reset to JPG.');
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
                          <strong>⚡ Loading AI animation engine...</strong>
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                          Please wait a moment before processing.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                        Animation Duration: {animationDuration}s
                      </label>
                      <Slider
                        value={[animationDuration]}
                        onValueChange={(value) => setAnimationDuration(value[0])}
                        min={2}
                        max={5}
                        step={1}
                        className="w-full"
                        disabled={processing}
                      />
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <p className="text-xs text-purple-700 dark:text-purple-400 mb-3 font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <strong>Real AI-Generated Motion (Like Midjourney!)</strong>
                      </p>
                      <ul className="text-xs text-purple-600 dark:text-purple-400 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-0.5">🎯</span>
                          <span><strong>Starts with YOUR image:</strong> Frame 1 is your exact uploaded image (not AI-generated)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-0.5">🎬</span>
                          <span><strong>Context-aware motion:</strong> AI understands your image and creates matching animations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-0.5">✨</span>
                          <span><strong>Real movement:</strong> Characters swing swords, wave, change expressions - actual motion!</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-0.5">🔄</span>
                          <span><strong>Perfect loops:</strong> AI generates frames 2-9, then returns to your original image for seamless loop</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-0.5">🎨</span>
                          <span><strong>Style matching:</strong> Generated frames match your image's style perfectly</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-0.5">⏱️</span>
                          <span><strong>Processing time:</strong> 2-3 minutes (generates 36 unique frames - 9 per animation)</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        <strong>⚠️ Note:</strong> Frame 1 uses your actual image, then AI generates frames 2-10 showing motion and returning to the original pose. Like Midjourney's animation - starts with YOUR image, not a recreation!
                      </p>
                    </div>

                    {generatedAnimations.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Generated AI Animations ({generatedAnimations.length})
                          </label>
                          <Button
                            onClick={downloadAllAnimations}
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            All as ZIP
                          </Button>
                        </div>
                        {generatedAnimations.map((anim, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-3 border border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-colors cursor-pointer"
                            onClick={() => downloadAnimation(index)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img src={anim.url} alt={anim.name} className="w-16 h-16 rounded-lg object-cover border-2 border-purple-300 dark:border-purple-700" />
                                <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                  {anim.frameCount}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{anim.name}</p>
                                <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">{anim.description}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{anim.frameCount} AI frames • {formatFileSize(anim.size)}</p>
                              </div>
                            </div>
                            <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                        ))}
                      </div>
                    )}
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
              disabled={processing || (isVideo && !ffmpegLoaded) || (isAudio && !ffmpegLoaded) || (isGif && format === 'mp4' && !ffmpegLoaded) || (enableAnimation && !gifJsLoaded)}
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
                  Compress {isVideo ? 'Video' : isAudio ? 'Audio' : isGif ? 'GIF' : (isImage && enableAnimation) ? 'Animation' : 'Image'}
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={processMedia}
                variant="outline"
                className="flex-1"
                disabled={processing || (isVideo && !ffmpegLoaded) || (isAudio && !ffmpegLoaded) || (isGif && format === 'mp4' && !ffmpegLoaded) || (enableAnimation && !gifJsLoaded)}
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
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            <span>Saved {formatFileSize(originalSize - compressedSize)}</span>
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

      {showDownloadModal && compressedBlob && (
        <DownloadModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          blob={compressedBlob}
          originalFilename={getOutputFilename()}
          format={outputFormat || format}
          generatedAnimations={isImage && enableAnimation ? generatedAnimations : null} // Pass animations if enabled
          onDownloadAnimation={downloadAnimation}
          onDownloadAllAnimations={downloadAllAnimations}
        />
      )}
    </Card>
  );
}
