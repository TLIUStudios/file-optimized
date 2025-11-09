
import { useState, useEffect, lazy, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, X, Loader2, CheckCircle2, ArrowRight, Settings2, AlertCircle, Info, Edit2, RefreshCcw, Sparkles, Film, Music, Video } from "lucide-react";
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

  // Media type detection
  const isImage = image.type.startsWith('image/');
  const isVideo = image.type.startsWith('video/');
  const isAudio = image.type.startsWith('audio/');
  const isGif = image.type === 'image/gif';

  // GIF-specific states
  const [gifFrameCount, setGifFrameCount] = useState(0);
  const [gifSettings, setGifSettings] = useState({ width: 0, height: 0, frames: [] });
  
  // Video/Audio specific states
  const [videoBitrate, setVideoBitrate] = useState(1000); // kbps
  const [audioBitrate, setAudioBitrate] = useState(128); // kbps
  const [frameRate, setFrameRate] = useState(30);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  
  const processMediaRef = useRef(null);
  const ffmpegRef = useRef(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      setPreview(reader.result);
      setOriginalSize(image.size);
      
      if (isGif) {
        try {
          await parseGif(reader.result);
        } catch (error) {
          console.error('Error parsing GIF:', error);
        }
      }
    };
    reader.readAsDataURL(image);
    
    // Set default format based on file type
    if (isGif) {
      setFormat('gif');
    } else if (isVideo) {
      setFormat('mp4');
    } else if (isAudio) {
      setFormat(image.type.includes('wav') ? 'wav' : 'mp3');
    }
  }, [image, isGif, isVideo, isAudio]);

  // Load FFmpeg for video/audio processing
  useEffect(() => {
    if ((isVideo || isAudio) && !ffmpegLoaded) {
      loadFFmpeg();
    }
  }, [isVideo, isAudio, ffmpegLoaded]);

  // Auto-process when autoProcess is triggered
  useEffect(() => {
    if (autoProcess && !processed && !processing && processMediaRef.current) {
      processMediaRef.current();
    }
  }, [autoProcess, processed, processing]);

  const loadFFmpeg = async () => {
    try {
      const { FFmpeg } = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.6/dist/esm/index.js');
      const { toBlobURL } = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/esm/index.js');
      
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;
      
      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm';
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      setFfmpegLoaded(true);
      console.log('FFmpeg loaded successfully');
    } catch (error) {
      console.error('Error loading FFmpeg:', error);
      setError('Failed to load video/audio processor');
    }
  };

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
      toast.error('Failed to parse GIF animation');
    }
  };

  const processMedia = async () => {
    setProcessing(true);
    setError(null);
    setOutputFormat(null);
    
    try {
      if (isGif && format === 'mp4') {
        await convertGifToMp4();
      } else if (isGif) {
        await processGif();
      } else if (isVideo && format === 'gif') {
        await convertMp4ToGif();
      } else if (isVideo) {
        await processVideo();
      } else if (isAudio) {
        await processAudio();
      } else if (isImage) {
        await processStaticImage();
      }
    } catch (error) {
      console.error('Error processing media:', error);
      setError(`Failed to process ${isVideo ? 'video' : isAudio ? 'audio' : 'image'}. Please try again.`);
    }
    
    setProcessing(false);
  };

  // Store reference to processMedia
  useEffect(() => {
    processMediaRef.current = processMedia;
  });

  const convertGifToMp4 = async () => {
    if (!ffmpegLoaded || !ffmpegRef.current) {
      toast.error('Video processor not ready');
      return;
    }

    try {
      const ffmpeg = ffmpegRef.current;
      
      // Convert blob to File
      const response = await fetch(preview);
      const blob = await response.blob();
      const file = new File([blob], 'input.gif', { type: 'image/gif' });
      
      await ffmpeg.writeFile('input.gif', new Uint8Array(await file.arrayBuffer()));
      
      const targetFps = frameRate || 30;
      await ffmpeg.exec([
        '-i', 'input.gif',
        '-movflags', 'faststart',
        '-pix_fmt', 'yuv420p',
        '-vf', `fps=${targetFps},scale=trunc(iw/2)*2:trunc(ih/2)*2`,
        '-b:v', `${videoBitrate}k`,
        'output.mp4'
      ]);
      
      const data = await ffmpeg.readFile('output.mp4');
      const outputBlob = new Blob([data.buffer], { type: 'video/mp4' });
      const compressedUrl = URL.createObjectURL(outputBlob);
      
      setCompressedPreview(compressedUrl);
      setCompressedSize(outputBlob.size);
      setProcessed(true);
      setOutputFormat('mp4');

      onProcessed({
        id: image.name,
        originalFile: image,
        compressedBlob: outputBlob,
        compressedUrl,
        originalSize: image.size,
        compressedSize: outputBlob.size,
        format: 'mp4',
        filename: `${image.name.split('.')[0]}.mp4`
      });

      toast.success('GIF converted to MP4!');
    } catch (error) {
      console.error('GIF to MP4 conversion failed:', error);
      throw error;
    }
  };

  const convertMp4ToGif = async () => {
    if (!ffmpegLoaded || !ffmpegRef.current) {
      toast.error('Video processor not ready');
      return;
    }

    try {
      const ffmpeg = ffmpegRef.current;
      
      const response = await fetch(preview);
      const blob = await response.blob();
      const file = new File([blob], 'input.mp4', { type: 'video/mp4' });
      
      await ffmpeg.writeFile('input.mp4', new Uint8Array(await file.arrayBuffer()));
      
      const targetFps = Math.min(frameRate || 15, 15); // Limit GIF to 15fps
      const scale = maxWidth ? `scale=${maxWidth}:-1:flags=lanczos` : 'scale=640:-1:flags=lanczos';
      
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', `${scale},fps=${targetFps},split[s0][s1];[s0]palettegen=max_colors=256[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5`,
        '-loop', '0',
        'output.gif'
      ]);
      
      const data = await ffmpeg.readFile('output.gif');
      const outputBlob = new Blob([data.buffer], { type: 'image/gif' });
      const compressedUrl = URL.createObjectURL(outputBlob);
      
      setCompressedPreview(compressedUrl);
      setCompressedSize(outputBlob.size);
      setProcessed(true);
      setOutputFormat('gif');

      onProcessed({
        id: image.name,
        originalFile: image,
        compressedBlob: outputBlob,
        compressedUrl,
        originalSize: image.size,
        compressedSize: outputBlob.size,
        format: 'gif',
        filename: `${image.name.split('.')[0]}.gif`
      });

      toast.success('Video converted to GIF!');
    } catch (error) {
      console.error('MP4 to GIF conversion failed:', error);
      throw error;
    }
  };

  const processVideo = async () => {
    if (!ffmpegLoaded || !ffmpegRef.current) {
      toast.error('Video processor not ready');
      return;
    }

    try {
      const ffmpeg = ffmpegRef.current;
      
      const response = await fetch(preview);
      const blob = await response.blob();
      const file = new File([blob], 'input.mp4', { type: 'video/mp4' });
      
      await ffmpeg.writeFile('input.mp4', new Uint8Array(await file.arrayBuffer()));
      
      const scaleFilter = maxWidth && maxHeight 
        ? `scale='min(${maxWidth},iw)':'min(${maxHeight},ih)':force_original_aspect_ratio=decrease`
        : maxWidth 
        ? `scale=${maxWidth}:-2`
        : maxHeight
        ? `scale=-2:${maxHeight}`
        : 'scale=iw:ih';
      
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-c:v', 'libx264',
        '-preset', compressionMode === 'maximum' ? 'slow' : compressionMode === 'aggressive' ? 'medium' : 'fast',
        '-crf', String(Math.round((100 - quality) / 2.5)), // Map quality to CRF (lower = better quality)
        '-vf', scaleFilter,
        '-r', String(frameRate),
        '-b:v', `${videoBitrate}k`,
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        'output.mp4'
      ]);
      
      const data = await ffmpeg.readFile('output.mp4');
      const outputBlob = new Blob([data.buffer], { type: 'video/mp4' });
      const compressedUrl = URL.createObjectURL(outputBlob);
      
      setCompressedPreview(compressedUrl);
      setCompressedSize(outputBlob.size);
      setProcessed(true);
      setOutputFormat('mp4');

      onProcessed({
        id: image.name,
        originalFile: image,
        compressedBlob: outputBlob,
        compressedUrl,
        originalSize: image.size,
        compressedSize: outputBlob.size,
        format: 'mp4',
        filename: `${image.name.split('.')[0]}_compressed.mp4`
      });

      const savings = ((1 - outputBlob.size / image.size) * 100).toFixed(1);
      toast.success(`Video compressed! Saved ${savings}%`);
    } catch (error) {
      console.error('Video compression failed:', error);
      throw error;
    }
  };

  const processAudio = async () => {
    if (!ffmpegLoaded || !ffmpegRef.current) {
      toast.error('Audio processor not ready');
      return;
    }

    try {
      const ffmpeg = ffmpegRef.current;
      
      const response = await fetch(preview);
      const blob = await response.blob();
      const inputExt = image.name.split('.').pop().toLowerCase();
      const file = new File([blob], `input.${inputExt}`, { type: image.type });
      
      await ffmpeg.writeFile(`input.${inputExt}`, new Uint8Array(await file.arrayBuffer()));
      
      const outputExt = format === 'wav' ? 'wav' : 'mp3';
      const codec = format === 'wav' ? 'pcm_s16le' : 'libmp3lame';
      
      await ffmpeg.exec([
        '-i', `input.${inputExt}`,
        '-c:a', codec,
        '-b:a', `${audioBitrate}k`,
        '-ar', '44100',
        `output.${outputExt}`
      ]);
      
      const data = await ffmpeg.readFile(`output.${outputExt}`);
      const mimeType = format === 'wav' ? 'audio/wav' : 'audio/mpeg';
      const outputBlob = new Blob([data.buffer], { type: mimeType });
      const compressedUrl = URL.createObjectURL(outputBlob);
      
      setCompressedPreview(compressedUrl);
      setCompressedSize(outputBlob.size);
      setProcessed(true);
      setOutputFormat(format);

      onProcessed({
        id: image.name,
        originalFile: image,
        compressedBlob: outputBlob,
        compressedUrl,
        originalSize: image.size,
        compressedSize: outputBlob.size,
        format: format,
        filename: `${image.name.split('.')[0]}_compressed.${outputExt}`
      });

      const savings = ((1 - outputBlob.size / image.size) * 100).toFixed(1);
      toast.success(`Audio compressed! Saved ${savings}%`);
    } catch (error) {
      console.error('Audio compression failed:', error);
      throw error;
    }
  };

  const processGif = async () => {
    try {
      console.log('Starting GIF compression...');
      
      const response = await fetch(preview);
      const originalBlob = await response.blob();
      
      if (!gifSettings.frames || gifSettings.frames.length === 0) {
        console.warn('No GIF frames available, using passthrough');
        const compressedUrl = URL.createObjectURL(originalBlob);
        setCompressedPreview(compressedUrl);
        setCompressedSize(originalBlob.size);
        setProcessed(true);
        setOutputFormat('gif');
        setError(null);

        onProcessed({
          id: image.name,
          originalFile: image,
          compressedBlob: originalBlob,
          compressedUrl,
          originalSize: image.size,
          compressedSize: originalBlob.size,
          format: 'gif',
          filename: `${image.name.split('.')[0]}_compressed.gif`
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
      
      console.log(`Target: ${targetWidth}x${targetHeight}, Original: ${gifSettings.width}x${gifSettings.height}`);
      console.log(`Processing ${gifSettings.frames.length} frames with quality: ${quality}`);
      
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Failed to get canvas context');

      const processedFrames = [];
      const maxFrames = Math.min(gifSettings.frames.length, 300);
      
      for (let i = 0; i < maxFrames; i++) {
        const frame = gifSettings.frames[i];
        try {
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
          
          const delay = frame.delay ? Math.max(20, frame.delay * 10) : 100;
          
          const frameImageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
          processedFrames.push({ 
            data: new Uint8ClampedArray(frameImageData.data),
            delay,
            width: targetWidth,
            height: targetHeight
          });
        } catch (frameError) {
          console.warn(`Error processing frame ${i}:`, frameError);
          continue;
        }
      }

      if (processedFrames.length === 0) throw new Error('No frames could be processed');

      console.log(`Successfully processed ${processedFrames.length} frames`);

      const GIF = (await import('https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js')).default;
      const gifQuality = Math.max(1, Math.min(30, Math.round((100 - quality) / 3.5)));
      
      console.log(`Using gif.js quality: ${gifQuality} (from slider: ${quality})`);
      
      const gif = new GIF({
        workers: 2,
        quality: gifQuality,
        width: targetWidth,
        height: targetHeight,
        workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js',
        dither: false,
        transparent: null
      });

      for (let i = 0; i < processedFrames.length; i++) {
        const frameData = processedFrames[i];
        try {
          const frameCanvas = document.createElement('canvas');
          frameCanvas.width = frameData.width;
          frameCanvas.height = frameData.height;
          const frameCtx = frameCanvas.getContext('2d');
          if (!frameCtx) continue;
          
          const imgData = new ImageData(frameData.data, frameData.width, frameData.height);
          frameCtx.putImageData(imgData, 0, 0);
          
          gif.addFrame(frameCanvas, { 
            delay: frameData.delay, 
            copy: true,
            dispose: 2
          });
        } catch (addError) {
          console.warn(`Error adding frame ${i} to GIF:`, addError);
        }
      }

      console.log('Starting GIF encoding...');

      const gifBlob = await Promise.race([
        new Promise((resolve, reject) => {
          gif.on('finished', (blob) => {
            console.log('GIF encoding finished, blob size:', blob.size);
            resolve(blob);
          });
          gif.on('progress', (p) => {
            console.log(`Encoding progress: ${(p * 100).toFixed(1)}%`);
          });
          gif.on('error', reject);
          gif.render();
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('GIF encoding timeout')), 90000)
        )
      ]);
      
      const compressedUrl = URL.createObjectURL(gifBlob);
      setCompressedPreview(compressedUrl);
      setCompressedSize(gifBlob.size);
      setProcessed(true);
      setOutputFormat('gif');
      setError(null);

      onProcessed({
        id: image.name,
        originalFile: image,
        compressedBlob: gifBlob,
        compressedUrl,
        originalSize: image.size,
        compressedSize: gifBlob.size,
        format: 'gif',
        filename: `${image.name.split('.')[0]}_compressed.gif`
      });

      const savings = ((1 - gifBlob.size / image.size) * 100).toFixed(1);
      const savedBytes = image.size - gifBlob.size;
      
      if (savedBytes > 0) {
        toast.success(`GIF compressed! Saved ${savings}%`);
      } else {
        toast.info('GIF processed');
      }
      
    } catch (error) {
      console.error('GIF compression failed:', error);
      
      try {
        const response = await fetch(preview);
        const blob = await response.blob();
        const compressedUrl = URL.createObjectURL(blob);
        setCompressedPreview(compressedUrl);
        setCompressedSize(blob.size);
        setProcessed(true);
        setOutputFormat('gif');
        setError(null);

        onProcessed({
          id: image.name,
          originalFile: image,
          compressedBlob: blob,
          compressedUrl,
          originalSize: image.size,
          compressedSize: blob.size,
          format: 'gif',
          filename: `${image.name.split('.')[0]}_compressed.gif`
        });
        
        toast.info('GIF processed (original preserved)');
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError);
        setError('Failed to process GIF');
        toast.error('Failed to process GIF');
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

    if (maxWidth || maxHeight) {
      const aspectRatio = width / height;
      
      if (maxWidth && maxHeight) {
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const ratio = Math.min(widthRatio, heightRatio);
        
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      } else if (maxWidth) {
        width = maxWidth;
        height = Math.round(width / aspectRatio);
      } else if (maxHeight) {
        height = maxHeight;
        width = Math.round(height * aspectRatio);
      }
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    
    if (noiseReduction) {
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

      if (blob.size < image.size || attempts === maxAttempts - 1) {
        break;
      }

      qualityValue -= compressionMode === 'maximum' ? 0.2 : 0.15;
      attempts++;
    }

    if (blob.size >= image.size) {
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
      filename: `${image.name.split('.')[0]}.${format}`
    });
  };

  const downloadMedia = () => {
    const link = document.createElement('a');
    link.href = compressedPreview;
    link.download = `${image.name.split('.')[0]}_compressed.${outputFormat || format}`;
    link.click();
  };

  const handleCompare = () => {
    if (processed && compressedPreview && (isImage || isGif)) {
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
    
    // Handle video/audio format conversion
    if (isVideo || isAudio || isGif) {
      setFormat(newFormat);
      toast.info('Format changed. Click "Reprocess" to convert.');
      return;
    }

    // Handle image format conversion
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
      setOutputFormat(newFormat);
      
      onProcessed({
        id: image.name,
        originalFile: image,
        compressedBlob: blob,
        compressedUrl: url,
        originalSize: originalSize,
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

  const originalExt = image.name.split('.').pop().toUpperCase();
  const displayFormat = outputFormat || format;
  const displayCompressedExt = displayFormat.toUpperCase();

  // Define available formats based on media type
  let availableFormats = [];
  if (isImage && !isGif) {
    availableFormats = ['jpg', 'png', 'webp', 'avif'];
  } else if (isGif) {
    availableFormats = ['gif', 'mp4'];
  } else if (isVideo) {
    availableFormats = ['mp4', 'gif'];
  } else if (isAudio) {
    availableFormats = ['mp3', 'wav'];
  }

  const mediaIcon = isVideo ? Video : isAudio ? Music : isGif ? Film : null;
  const MediaIcon = mediaIcon;

  return (
    <Card className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow">
      <div className="relative">
        <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 dark:bg-slate-950">
          {preview && (
            <div 
              className="relative aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 cursor-pointer group"
              onClick={(isImage || isGif) && processed ? handleCompare : undefined}
            >
              {/* Frame Count Badge - Above Original Preview */}
              {(isGif || isVideo) && gifFrameCount > 0 && (
                <Badge className="absolute -top-8 left-0 bg-slate-900/90 text-white text-xs px-3 py-1.5 font-bold flex items-center gap-1 shadow-lg z-10 rounded-md">
                  <Film className="w-3 h-3" />
                  {gifFrameCount} frames
                </Badge>
              )}
              
              {(isImage || isGif) ? (
                <LazyImage 
                  src={preview} 
                  alt="Original" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                />
              ) : isVideo ? (
                <video src={preview} className="w-full h-full object-cover" muted />
              ) : isAudio ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-16 h-16 text-slate-400" />
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
              {/* Frame Count Badge - Above Compressed Preview */}
              {(isGif || isVideo) && gifFrameCount > 0 && (
                <Badge className="absolute -top-8 left-0 bg-slate-900/90 text-white text-xs px-3 py-1.5 font-bold flex items-center gap-1 shadow-lg z-10 rounded-md">
                  <Film className="w-3 h-3" />
                  {gifFrameCount} frames
                </Badge>
              )}
              
              {(isImage || isGif) ? (
                <LazyImage 
                  src={compressedPreview} 
                  alt="Compressed" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                />
              ) : isVideo ? (
                <video src={compressedPreview} className="w-full h-full object-cover" controls muted />
              ) : isAudio ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-16 h-16 text-emerald-500" />
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

        {(isVideo || isAudio) && !ffmpegLoaded && (
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            <span className="text-xs">Loading {isVideo ? 'video' : 'audio'} processor...</span>
          </div>
        )}

        {processed && availableFormats.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Convert Format
            </label>
            <div className={cn(
              "grid gap-2",
              availableFormats.length === 2 ? "grid-cols-2" : "grid-cols-4"
            )}>
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
              {!isAudio && (
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
              )}

              {(isImage && !isGif) && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Output Format
                    </label>
                  </div>
                  <Select value={format} onValueChange={setFormat} disabled={processing}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jpg">JPG (Universal)</SelectItem>
                      <SelectItem value="png">PNG (Lossless)</SelectItem>
                      <SelectItem value="webp">WebP (Best compression)</SelectItem>
                      <SelectItem value="avif">AVIF (Next-gen)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(isGif || isVideo) && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Output Format
                    </label>
                  </div>
                  <Select value={format} onValueChange={setFormat} disabled={processing}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {isGif && <SelectItem value="gif">GIF (Animation)</SelectItem>}
                      {isGif && <SelectItem value="mp4">MP4 (Video)</SelectItem>}
                      {isVideo && <SelectItem value="mp4">MP4 (Video)</SelectItem>}
                      {isVideo && <SelectItem value="gif">GIF (Animation)</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isAudio && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Output Format
                    </label>
                  </div>
                  <Select value={format} onValueChange={setFormat} disabled={processing}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mp3">MP3 (Compressed)</SelectItem>
                      <SelectItem value="wav">WAV (Uncompressed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(isImage || isGif) && (
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
              )}

              {isVideo && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Video Bitrate: {videoBitrate} kbps
                      </label>
                    </div>
                    <Slider
                      value={[videoBitrate]}
                      onValueChange={(value) => setVideoBitrate(value[0])}
                      min={500}
                      max={8000}
                      step={100}
                      className="w-full"
                      disabled={processing}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Frame Rate: {frameRate} fps
                      </label>
                    </div>
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
                </>
              )}

              {isAudio && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Audio Bitrate: {audioBitrate} kbps
                    </label>
                  </div>
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
              )}

              {(isImage || isVideo || isGif) && (
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
            </TooltipProvider>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex gap-2">
          {!processed ? (
            <Button
              onClick={processMedia}
              disabled={processing || ((isVideo || isAudio) && !ffmpegLoaded)}
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
                  Compress {isVideo ? 'Video' : isAudio ? 'Audio' : isGif ? 'GIF' : 'Image'}
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={processMedia}
                variant="outline"
                className="flex-1"
                disabled={processing}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Reprocess
              </Button>
              <Button
                onClick={downloadMedia}
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

        {isAudio && compressedPreview && (
          <audio src={compressedPreview} controls className="w-full" />
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
    </Card>
  );
}
