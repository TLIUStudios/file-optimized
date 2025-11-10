
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
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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

  // AI Enhancement for upscaling
  const [aiEnhancement, setAiEnhancement] = useState(false);
  const [aiUpscaleMode, setAiUpscaleMode] = useState('standard'); // 'standard', 'enhanced', 'maximum'
  const [showVariationsModal, setShowVariationsModal] = useState(false);
  const [generatedVariations, setGeneratedVariations] = useState([]);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(null);

  // New state for editable filename
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
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [videoPreset, setVideoPreset] = useState('medium');
  const [gopSize, setGopSize] = useState(250);
  const [sampleRate, setSampleRate] = useState(44100);
  const [audioQuality, setAudioQuality] = useState('standard');
  const [gifOptimization, setGifOptimization] = useState('balanced');
  
  const processMediaRef = useRef(null);
  const ffmpegRef = useRef(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      setPreview(reader.result);
      setOriginalSize(image.size);
      setEditableFilename(image.name); // Initialize editable filename
      
      // Load image dimensions for static images
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
    
    // Set default formats based on media type
    if (isGif) {
      setFormat('gif');
    } else if (isVideo) {
      setFormat('mp4');
    } else if (isAudio) {
      setFormat('mp3');
    } else if (isImage) {
      setFormat('jpg'); // Default to jpg for images
    }
  }, [image, isGif, isVideo, isAudio, isImage]);

  // Load FFmpeg for video/audio processing - NEW APPROACH
  useEffect(() => {
    if ((isVideo || isAudio || (isGif && format === 'mp4')) && !ffmpegLoaded) {
      loadFFmpegAlternative();
    }
  }, [isVideo, isAudio, isGif, format, ffmpegLoaded]);

  useEffect(() => {
    if (autoProcess && !processed && !processing && processMediaRef.current) {
      processMediaRef.current();
    }
  }, [autoProcess, processed, processing]);

  const loadFFmpegAlternative = async () => {
    try {
      console.log('🚀 Loading FFmpeg with alternative approach...');
      toast.info('Loading media processor...', { id: 'ffmpeg-load', duration: Infinity });
      
      // Use CDN bundle approach - simpler and more reliable
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js';
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load FFmpeg script'));
        document.head.appendChild(script);
      });
      
      console.log('✅ FFmpeg script loaded');
      
      // Load utilities
      const utilScript = document.createElement('script');
      utilScript.src = 'https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/umd/index.js';
      
      await new Promise((resolve, reject) => {
        utilScript.onload = resolve;
        utilScript.onerror = () => reject(new Error('Failed to load FFmpeg utilities'));
        document.head.appendChild(utilScript);
      });
      
      console.log('✅ FFmpeg utilities loaded');
      
      // Access from window object
      const { FFmpeg } = window.FFmpegWASM || window;
      const { toBlobURL } = window.FFmpegUtil || window;
      
      if (!FFmpeg || !toBlobURL) {
        throw new Error('FFmpeg or toBlobURL not available on window object');
      }
      
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;
      
      ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]:', message);
      });
      
      ffmpeg.on('progress', ({ progress }) => {
        const percent = Math.round(progress * 100);
        console.log(`[FFmpeg] Progress: ${percent}%`);
        toast.info(`Processing: ${percent}%`, { id: 'ffmpeg-progress' });
      });
      
      // Use single-threaded core for better compatibility
      const baseURL = 'https://unpkg.com/@ffmpeg/core-st@0.12.6/dist/umd';
      
      console.log('📦 Creating blob URLs...');
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
      
      console.log('🔧 Loading FFmpeg core...');
      await ffmpeg.load({ coreURL, wasmURL });
      
      setFfmpegLoaded(true);
      console.log('✅ FFmpeg ready!');
      toast.success('Media processor ready!', { id: 'ffmpeg-load' });
    } catch (error) {
      console.error('❌ FFmpeg load failed:', error);
      console.error('Details:', error.message, error.stack);
      setError('Media processor failed to load. Try refreshing the page or use a different browser.');
      toast.error('Failed to load media processor: ' + error.message, { id: 'ffmpeg-load' });
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
      setError(`Failed to process ${isVideo ? 'video' : isAudio ? 'audio' : 'image'}. ${error.message}`);
      toast.error('Processing failed: ' + error.message);
    }
    
    setProcessing(false);
  };

  useEffect(() => {
    processMediaRef.current = processMedia;
  });

  const convertGifToMp4 = async () => {
    if (!ffmpegLoaded || !ffmpegRef.current) {
      toast.error('Video processor not ready');
      return;
    }

    try {
      console.log('🎬 Starting GIF to MP4 conversion...');
      toast.info('Converting GIF to MP4...', { duration: Infinity });
      
      const ffmpeg = ffmpegRef.current;
      const { fetchFile } = window.FFmpegUtil || window; // Changed import location
      
      console.log('📥 Fetching GIF data...');
      const gifData = await fetchFile(preview);
      
      console.log('📝 Writing input file...');
      await ffmpeg.writeFile('input.gif', gifData);
      
      console.log('⚙️ Starting conversion...');
      await ffmpeg.exec([
        '-i', 'input.gif',
        '-movflags', 'faststart',
        '-pix_fmt', 'yuv420p',
        '-vf', `fps=${frameRate},scale=trunc(iw/2)*2:trunc(ih/2)*2`,
        '-b:v', `${videoBitrate}k`,
        '-c:v', 'libx264',
        '-preset', 'medium',
        'output.mp4'
      ]);
      
      console.log('📤 Reading output file...');
      const data = await ffmpeg.readFile('output.mp4');
      const outputBlob = new Blob([data.buffer], { type: 'video/mp4' });
      const compressedUrl = URL.createObjectURL(outputBlob);
      
      console.log('🧹 Cleaning up...');
      await ffmpeg.deleteFile('input.gif');
      await ffmpeg.deleteFile('output.mp4');
      
      setCompressedPreview(compressedUrl);
      setCompressedSize(outputBlob.size);
      setCompressedBlob(outputBlob); // ADDED
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
        filename: getOutputFilename('mp4'), // Use new helper
        mediaType: 'video',
        fileFormat: 'mp4'
      });

      toast.dismiss();
      toast.success('GIF converted to MP4!');
      console.log('✅ Conversion complete!');
    } catch (error) {
      console.error('❌ GIF to MP4 failed:', error);
      toast.dismiss();
      toast.error('Conversion failed: ' + error.message);
      throw error;
    }
  };

  const convertMp4ToGif = async () => {
    if (!ffmpegLoaded || !ffmpegRef.current) {
      toast.error('Video processor not ready');
      return;
    }

    try {
      console.log('🎞️ Starting MP4 to GIF conversion...');
      toast.info('Converting video to GIF...', { duration: Infinity });
      
      const ffmpeg = ffmpegRef.current;
      const { fetchFile } = window.FFmpegUtil || window; // Changed import location
      
      console.log('📥 Fetching video data...');
      const videoData = await fetchFile(preview);
      await ffmpeg.writeFile('input.mp4', videoData);
      
      const targetFps = Math.min(frameRate || 15, 15);
      const scale = maxWidth ? `scale=${maxWidth}:-1:flags=lanczos` : 'scale=640:-1:flags=lanczos';
      
      console.log('🎨 Generating palette...');
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', `${scale},fps=${targetFps},palettegen=max_colors=256`,
        '-y',
        'palette.png'
      ]);
      
      console.log('⚙️ Creating GIF...');
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-i', 'palette.png',
        '-lavfi', `${scale},fps=${targetFps}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5`,
        '-loop', '0',
        '-y',
        'output.gif'
      ]);
      
      console.log('📤 Reading output...');
      const data = await ffmpeg.readFile('output.gif');
      const outputBlob = new Blob([data.buffer], { type: 'image/gif' });
      const compressedUrl = URL.createObjectURL(outputBlob);
      
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('palette.png');
      await ffmpeg.deleteFile('output.gif');
      
      setCompressedPreview(compressedUrl);
      setCompressedSize(outputBlob.size);
      setCompressedBlob(outputBlob); // ADDED
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
        filename: getOutputFilename('gif'), // Use new helper
        mediaType: 'image',
        fileFormat: 'gif'
      });

      toast.dismiss();
      toast.success('Video converted to GIF!');
      console.log('✅ Conversion complete!');
    } catch (error) {
      console.error('❌ MP4 to GIF failed:', error);
      toast.dismiss();
      toast.error('Conversion failed: ' + error.message);
      throw error;
    }
  };

  const processVideo = async () => {
    if (!ffmpegLoaded || !ffmpegRef.current) {
      toast.error('Video processor not ready');
      return;
    }

    try {
      console.log('🎥 Starting video compression...');
      toast.info('Compressing video...', { duration: Infinity });
      
      const ffmpeg = ffmpegRef.current;
      const { fetchFile } = window.FFmpegUtil || window; // Changed import location
      
      console.log('📥 Fetching video data...');
      const videoData = await fetchFile(preview);
      await ffmpeg.writeFile('input.mp4', videoData);
      
      const scaleFilter = maxWidth && maxHeight 
        ? `scale='min(${maxWidth},iw)':'min(${maxHeight},ih)':force_original_aspect_ratio=decrease`
        : maxWidth 
        ? `scale=${maxWidth}:-2`
        : maxHeight
        ? `scale=-2:${maxHeight}`
        : null;
      
      const args = [
        '-i', 'input.mp4',
        '-c:v', 'libx264',
        '-preset', videoPreset,
        '-crf', String(Math.round((100 - quality) / 2.5)),
        '-g', String(gopSize),
      ];
      
      if (scaleFilter) {
        args.push('-vf', scaleFilter);
      }
      
      args.push(
        '-r', String(frameRate),
        '-b:v', `${videoBitrate}k`,
        '-maxrate', `${videoBitrate * 1.5}k`,
        '-bufsize', `${videoBitrate * 2}k`,
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-y',
        'output.mp4'
      );
      
      console.log('⚙️ Compressing with args:', args.join(' '));
      await ffmpeg.exec(args);
      
      console.log('📤 Reading output...');
      const data = await ffmpeg.readFile('output.mp4');
      const outputBlob = new Blob([data.buffer], { type: 'video/mp4' });
      const compressedUrl = URL.createObjectURL(outputBlob);
      
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp4');
      
      setCompressedPreview(compressedUrl);
      setCompressedSize(outputBlob.size);
      setCompressedBlob(outputBlob); // ADDED
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
        filename: getOutputFilename('mp4'), // Use new helper
        mediaType: 'video',
        fileFormat: 'mp4'
      });

      const savings = ((1 - outputBlob.size / image.size) * 100).toFixed(1);
      toast.dismiss();
      toast.success(`Video compressed! Saved ${savings}%`);
      console.log('✅ Compression complete!');
    } catch (error) {
      console.error('❌ Video compression failed:', error);
      toast.dismiss();
      toast.error('Compression failed: ' + error.message);
      throw error;
    }
  };

  const processAudio = async () => {
    if (!ffmpegLoaded || !ffmpegRef.current) {
      toast.error('Audio processor not ready');
      return;
    }

    try {
      console.log('🎵 Starting audio compression...');
      toast.info('Compressing audio...', { duration: Infinity });
      
      const ffmpeg = ffmpegRef.current;
      const { fetchFile } = window.FFmpegUtil || window; // Changed import location
      
      console.log('📥 Fetching audio data...');
      const audioData = await fetchFile(preview);
      const inputExt = image.name.split('.').pop().toLowerCase();
      await ffmpeg.writeFile(`input.${inputExt}`, audioData);
      
      const outputExt = format === 'wav' ? 'wav' : 'mp3';
      const codec = format === 'wav' ? 'pcm_s16le' : 'libmp3lame';
      
      let finalBitrate = audioBitrate;
      if (audioQuality === 'high') {
        finalBitrate = Math.max(192, audioBitrate);
      } else if (audioQuality === 'lossless' && format === 'wav') {
        finalBitrate = 1411;
      }
      
      console.log('⚙️ Processing audio...');
      await ffmpeg.exec([
        '-i', `input.${inputExt}`,
        '-c:a', codec,
        '-b:a', `${finalBitrate}k`,
        '-ar', String(sampleRate),
        '-y',
        `output.${outputExt}`
      ]);
      
      console.log('📤 Reading output...');
      const data = await ffmpeg.readFile(`output.${outputExt}`);
      const mimeType = format === 'wav' ? 'audio/wav' : 'audio/mpeg';
      const outputBlob = new Blob([data.buffer], { type: mimeType });
      const compressedUrl = URL.createObjectURL(outputBlob);
      
      await ffmpeg.deleteFile(`input.${inputExt}`);
      await ffmpeg.deleteFile(`output.${outputExt}`);
      
      setCompressedPreview(compressedUrl);
      setCompressedSize(outputBlob.size);
      setCompressedBlob(outputBlob); // ADDED
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
        filename: getOutputFilename(outputExt), // Use new helper
        mediaType: 'audio',
        fileFormat: format
      });

      const savings = ((1 - outputBlob.size / image.size) * 100).toFixed(1);
      toast.dismiss();
      toast.success(`Audio compressed! Saved ${savings}%`);
      console.log('✅ Compression complete!');
    } catch (error) {
      console.error('❌ Audio compression failed:', error);
      toast.dismiss();
      toast.error('Compression failed: ' + error.message);
      throw error;
    }
  };

  const processGif = async () => {
    try {
      console.log('🎞️ Starting GIF compression...');
      
      const response = await fetch(preview);
      const originalBlob = await response.blob();
      
      if (!gifSettings.frames || gifSettings.frames.length === 0) {
        const compressedUrl = URL.createObjectURL(originalBlob);
        setCompressedPreview(compressedUrl);
        setCompressedSize(originalBlob.size);
        setCompressedBlob(originalBlob); // ADDED
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
          filename: getOutputFilename('gif'), // Use new helper
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
          // Changed Math.min to (enableUpscale ? Math.max : Math.min) - NOTE: enableUpscale is for static images, not gifs directly
          // For GIF, we always want to downscale or maintain, not upscale beyond original.
          const widthRatio = maxWidth / gifSettings.width;
          const heightRatio = maxHeight / gifSettings.height;
          const ratio = Math.min(widthRatio, heightRatio); // Always min for GIF resizing
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
      
      let frameSkip = 1;
      if (gifOptimization === 'aggressive') {
        frameSkip = 2;
      } else if (gifOptimization === 'maximum') {
        frameSkip = 3;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      const processedFrames = [];
      const maxFrames = Math.min(gifSettings.frames.length, 400);
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
        
        if (gifOptimization !== 'balanced' && prevImageData) {
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

      const GIF = (await import('https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js')).default;
      
      let gifQuality;
      if (gifOptimization === 'balanced') {
        gifQuality = Math.max(1, Math.min(30, Math.round((100 - quality) / 3.5)));
      } else if (gifOptimization === 'aggressive') {
        gifQuality = Math.max(5, Math.min(30, Math.round((100 - quality) / 3)));
      } else {
        gifQuality = Math.max(10, Math.min(30, Math.round((100 - quality) / 2.5)));
      }
      
      const gif = new GIF({
        workers: 2,
        quality: gifQuality,
        width: targetWidth,
        height: targetHeight,
        workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js',
        dither: gifOptimization === 'maximum' ? 'FloydSteinberg' : false,
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
      setCompressedBlob(gifBlob); // ADDED
      setProcessed(true);
      setOutputFormat('gif');

      onProcessed({
        id: image.name,
        originalFile: image,
        compressedBlob: gifBlob,
        compressedUrl,
        originalSize: image.size,
        compressedSize: gifBlob.size,
        format: 'gif',
        filename: getOutputFilename('gif'), // Use new helper
        mediaType: 'image',
        fileFormat: 'gif'
      });

      const savings = ((1 - gifBlob.size / image.size) * 100).toFixed(1);
      if (gifBlob.size < image.size) {
        toast.success(`GIF compressed! Saved ${savings}%`);
      } else {
        toast.info('GIF processed');
      }
    } catch (error) {
      console.error('GIF compression failed:', error);
      throw error;
    }
  };

  const calculateFrameDifference = (data1, data2) => {
    let diff = 0;
    for (let i = 0; i < data1.length; i += 4) {
      diff += Math.abs(data1[i] - data2[i]) + Math.abs(data1[i+1] - data2[i+1]) + Math.abs(data1[i+2] - data2[i+2]);
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

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Added willReadFrequently

    // Enhanced upscaling with AI-like processing
    if (enableUpscale && aiEnhancement && width > img.width) {
      if (aiUpscaleMode === 'maximum') {
        // Generate multiple variations for user to choose
        toast.info('Generating HD variations...', { id: 'ai-enhance', duration: Infinity });
        
        const variations = [];
        const variationConfigs = [
          { name: 'Balanced', sharpness: 2.0, clarity: 0.3, bilateral: 1.0 },
          { name: 'Sharp Details', sharpness: 2.8, clarity: 0.5, bilateral: 0.7 },
          { name: 'Smooth & Clean', sharpness: 1.5, clarity: 0.2, bilateral: 1.3 },
          { name: 'Ultra Sharp', sharpness: 3.2, clarity: 0.6, bilateral: 0.5 },
        ];
        
        for (let i = 0; i < variationConfigs.length; i++) {
          const config = variationConfigs[i];
          const variationCanvas = document.createElement('canvas');
          variationCanvas.width = width;
          variationCanvas.height = height;
          const variationCtx = variationCanvas.getContext('2d', { willReadFrequently: true });
          
          await applyMaximumQualityUpscale(img, variationCanvas, variationCtx, width, height, config);
          
          const blob = await new Promise((resolve) => {
            variationCanvas.toBlob(resolve, 'image/png', 0.95);
          });
          
          variations.push({
            name: config.name,
            url: URL.createObjectURL(blob),
            blob: blob,
            canvas: variationCanvas
          });
        }
        
        setGeneratedVariations(variations);
        setShowVariationsModal(true);
        toast.dismiss('ai-enhance');
        
        // Wait for user selection - this will be handled by modal
        return; // IMPORTANT: return here to prevent further processing until user selects
      } else if (aiUpscaleMode === 'enhanced') {
        toast.info('Applying Enhanced AI...', { id: 'ai-enhance', duration: Infinity }); // Updated toast
        await applyEnhancedUpscale(img, canvas, ctx, width, height);
        toast.dismiss('ai-enhance');
        toast.success('Enhanced AI applied!', { duration: 2000 });
      } else {
        toast.info('Applying Standard AI...', { id: 'ai-enhance', duration: Infinity }); // Updated toast
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        let imageData = ctx.getImageData(0, 0, width, height);
        imageData = applyUnsharpMask(imageData, width, height, 1.5, 1);
        imageData = enhanceDetails(imageData, width, height);
        ctx.putImageData(imageData, 0, 0);
        
        toast.dismiss('ai-enhance');
        toast.success('Standard AI Enhancement applied!', { duration: 2000 });
      }
    } else if (noiseReduction || enableUpscale) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
    } else {
      ctx.drawImage(img, 0, 0, width, height);
    }

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

    if (!enableUpscale && blob.size >= image.size) {
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

  // Handle variation selection from modal
  const handleVariationSelected = async (variationIndex) => {
    const variation = generatedVariations[variationIndex];
    setSelectedVariationIndex(variationIndex);
    
    // Convert selected variation to final format
    const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
    const finalBlob = await new Promise((resolve) => {
      // Use the canvas from the selected variation, then convert to the desired output format
      variation.canvas.toBlob(resolve, mimeType, quality / 100);
    });
    
    const compressedUrl = URL.createObjectURL(finalBlob);
    setCompressedPreview(compressedUrl);
    setCompressedSize(finalBlob.size);
    setCompressedBlob(finalBlob);
    setProcessed(true);
    setOutputFormat(format); // Use the currently selected output format
    setShowVariationsModal(false);

    onProcessed({
      id: image.name,
      originalFile: image,
      compressedBlob: finalBlob,
      compressedUrl,
      originalSize: image.size, // Original size remains the same
      compressedSize: finalBlob.size,
      format, // Use the currently selected output format
      filename: getOutputFilename(format),
      mediaType: 'image',
      fileFormat: format
    });
    
    toast.success(`Selected: ${variation.name}`, { duration: 2000 });
    
    // Cleanup unused variations. Important to revoke URLs.
    generatedVariations.forEach((v, i) => {
      if (i !== variationIndex) {
        URL.revokeObjectURL(v.url);
      }
    });
    setGeneratedVariations([]); // Clear variations state after selection
    setSelectedVariationIndex(null); // Reset selection
  };

  // Maximum Quality Upscaling - Multi-pass with advanced techniques
  const applyMaximumQualityUpscale = async (img, canvas, ctx, targetWidth, targetHeight, config = { sharpness: 2.0, clarity: 0.3, bilateral: 1.0 }) => {
    // Step 1: Lanczos-like resampling with multiple passes
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    
    let currentIntermediateWidth = img.width;
    let currentIntermediateHeight = img.height;
    
    // Progressive upscaling (multiple passes for better quality)
    const passes = 3;
    const totalScaleFactor = targetWidth / img.width;
    const scaleFactorPerPass = Math.pow(totalScaleFactor, 1 / passes);
    
    tempCanvas.width = currentIntermediateWidth;
    tempCanvas.height = currentIntermediateHeight;
    tempCtx.drawImage(img, 0, 0);
    
    for (let pass = 0; pass < passes; pass++) {
      const nextIntermediateWidth = Math.round(currentIntermediateWidth * scaleFactorPerPass);
      const nextIntermediateHeight = Math.round(currentIntermediateHeight * scaleFactorPerPass);
      
      const newCanvas = document.createElement('canvas');
      const newCtx = newCanvas.getContext('2d', { willReadFrequently: true });
      newCanvas.width = nextIntermediateWidth;
      newCanvas.height = nextIntermediateHeight;
      
      newCtx.imageSmoothingEnabled = true;
      newCtx.imageSmoothingQuality = 'high';
      newCtx.drawImage(tempCanvas, 0, 0, nextIntermediateWidth, nextIntermediateHeight);
      
      // Apply sharpening after each pass
      let imageData = newCtx.getImageData(0, 0, nextIntermediateWidth, nextIntermediateHeight);
      imageData = applyUnsharpMask(imageData, nextIntermediateWidth, nextIntermediateHeight, config.sharpness, 0.5);
      newCtx.putImageData(imageData, 0, 0);
      
      tempCanvas.width = nextIntermediateWidth;
      tempCanvas.height = nextIntermediateHeight;
      tempCtx.clearRect(0, 0, nextIntermediateWidth, nextIntermediateHeight);
      tempCtx.drawImage(newCanvas, 0, 0);

      currentIntermediateWidth = nextIntermediateWidth;
      currentIntermediateHeight = nextIntermediateHeight;
    }
    
    // Step 2: Transfer to main canvas
    ctx.clearRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);
    
    // Step 3: Advanced enhancement pipeline with config
    let imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    
    // De-pixelation: Bilateral filter to smooth while preserving edges
    imageData = applyBilateralFilter(imageData, targetWidth, targetHeight, config.bilateral);
    
    // Super sharpening
    imageData = applyUnsharpMask(imageData, targetWidth, targetHeight, config.sharpness + 0.5, 0.3);
    
    // Edge enhancement
    imageData = enhanceDetails(imageData, targetWidth, targetHeight, 1.5);
    
    // Denoising
    imageData = applySelectiveGaussian(imageData, targetWidth, targetHeight);
    
    // Final clarity boost
    imageData = applyClarity(imageData, targetWidth, targetHeight, config.clarity);
    
    ctx.putImageData(imageData, 0, 0);
  };

  // Enhanced Upscaling - Balanced quality and speed
  const applyEnhancedUpscale = async (img, canvas, ctx, targetWidth, targetHeight) => {
    // Two-pass upscaling
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    
    const midWidth = Math.round((img.width + targetWidth) / 2);
    const midHeight = Math.round((img.height + targetHeight) / 2);
    
    tempCanvas.width = midWidth;
    tempCanvas.height = midHeight;
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    tempCtx.drawImage(img, 0, 0, midWidth, midHeight);
    
    ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);
    
    let imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    
    // Apply enhancements
    imageData = applyUnsharpMask(imageData, targetWidth, targetHeight, 2.0, 0.5);
    imageData = enhanceDetails(imageData, targetWidth, targetHeight, 1.2);
    imageData = applyBilateralFilter(imageData, targetWidth, targetHeight, 0.7);
    
    ctx.putImageData(imageData, 0, 0);
  };

  // Bilateral Filter - Smooths while preserving edges (de-pixelation)
  const applyBilateralFilter = (imageData, width, height, intensity = 1.0) => {
    const data = new Uint8ClampedArray(imageData.data); // Copy original data to modify
    const originalData = imageData.data; // Keep reference to original for calculations
    const radius = 3;
    const sigmaColor = 50 * intensity;
    const sigmaSpace = 50 * intensity;
    
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        for (let c = 0; c < 3; c++) { // Iterate over R, G, B channels
          const centerIdx = (y * width + x) * 4 + c;
          const centerValue = originalData[centerIdx]; // Use original data for center pixel
          
          let sum = 0;
          let weightSum = 0;
          
          for (let ky = -radius; ky <= radius; ky++) {
            for (let kx = -radius; kx <= radius; kx++) {
              const px = x + kx;
              const py = y + ky;

              // Ensure kernel is within bounds
              if (px >= 0 && px < width && py >= 0 && py < height) {
                const idx = (py * width + px) * 4 + c;
                const value = originalData[idx];
                
                const spatialDist = kx * kx + ky * ky;
                const colorDist = (value - centerValue) * (value - centerValue);
                
                const spatialWeight = Math.exp(-spatialDist / (2 * sigmaSpace * sigmaSpace));
                const colorWeight = Math.exp(-colorDist / (2 * sigmaColor * sigmaColor));
                const weight = spatialWeight * colorWeight;
                
                sum += value * weight;
                weightSum += weight;
              }
            }
          }
          
          // Avoid division by zero
          if (weightSum > 0) {
            data[centerIdx] = sum / weightSum;
          } else {
            data[centerIdx] = centerValue; // Fallback to original value
          }
        }
      }
    }
    
    imageData.data.set(data); // Apply modified data back to the ImageData object
    return imageData;
  };

  // Selective Gaussian - Blur non-edge regions
  const applySelectiveGaussian = (imageData, width, height) => {
    // Create a copy of the imageData for blurring to avoid modifying it during edge detection
    const originalImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
    const edges = detectEdges(originalImageData, width, height);
    const blurredData = gaussianBlur(originalImageData, width, height, 0.8);
    
    const outputData = new Uint8ClampedArray(imageData.data.length);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const pixelIndex = i / 4;
      const edgeStrength = edges[pixelIndex]; // Value from 0 (no edge) to 1 (strong edge)
      
      for (let c = 0; c < 3; c++) { // RGB channels
        // Blend between original and blurred based on edge strength
        // Closer to 1 (strong edge), more original pixel. Closer to 0 (no edge), more blurred pixel.
        outputData[i + c] = imageData.data[i + c] * edgeStrength + blurredData[i + c] * (1 - edgeStrength);
      }
      outputData[i + 3] = imageData.data[i + 3]; // Alpha channel unchanged
    }
    
    imageData.data.set(outputData);
    return imageData;
  };

  // Detect edges for selective processing
  const detectEdges = (imageData, width, height) => {
    const edges = new Float32Array(width * height);
    const data = imageData.data;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let c = 0; c < 3; c++) { // Check all RGB channels
          // Simple gradient approximation (e.g., central difference)
          const idx = (y * width + x) * 4 + c;
          const left = data[idx - 4];
          const right = data[idx + 4];
          const top = data[idx - width * 4];
          const bottom = data[idx + width * 4];
          
          gx += (right || 0) - (left || 0); // Handle potential undefined at borders for safety
          gy += (bottom || 0) - (top || 0);
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy) / 3; // Average magnitude over channels
        edges[y * width + x] = Math.min(1, magnitude / 100); // Normalize to 0-1 range
      }
    }
    
    return edges;
  };

  // Clarity enhancement
  const applyClarity = (imageData, width, height, intensity = 0.3) => {
    const data = new Uint8ClampedArray(imageData.data); // Copy original data to modify
    const originalData = imageData.data; // Keep reference to original for calculations
    
    const radius = 2; // Size of local neighborhood
    
    // Increase local contrast
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        for (let c = 0; c < 3; c++) {
          const idx = (y * width + x) * 4 + c;
          
          // Calculate local average
          let sum = 0;
          let count = 0;
          for (let ky = -radius; ky <= radius; ky++) {
            for (let kx = -radius; kx <= radius; kx++) {
              const currentPixelIdx = ((y + ky) * width + (x + kx)) * 4 + c;
              if (y + ky >= 0 && y + ky < height && x + kx >= 0 && x + kx < width) { // Boundary check
                sum += originalData[currentPixelIdx];
                count++;
              }
            }
          }
          const avg = count > 0 ? sum / count : originalData[idx];
          
          // Increase contrast relative to local average
          const diff = originalData[idx] - avg;
          data[idx] = Math.min(255, Math.max(0, originalData[idx] + diff * intensity)); // 0.3 is contrast strength
        }
      }
    }
    imageData.data.set(data);
    return imageData;
  };

  // Unsharp mask for AI-like sharpening
  const applyUnsharpMask = (imageData, width, height, amount, threshold) => {
    const data = imageData.data;
    const blurred = gaussianBlur(imageData, width, height, 1.0);
    const outputData = new Uint8ClampedArray(data); // Create new array for output

    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) { // RGB channels
        const diff = data[i + j] - blurred[i + j];
        if (Math.abs(diff) > threshold) {
          outputData[i + j] = Math.min(255, Math.max(0, data[i + j] + diff * amount));
        } else {
          outputData[i + j] = data[i + j]; // Keep original if diff is below threshold
        }
      }
      outputData[i + 3] = data[i + 3]; // Alpha channel
    }
    imageData.data.set(outputData);
    return imageData;
  };

  // Gaussian blur helper
  const gaussianBlur = (imageData, width, height, sigma) => {
    const data = new Uint8ClampedArray(imageData.data);
    const kernel = generateGaussianKernel(sigma);
    const kernelSize = kernel.length;
    const half = Math.floor(kernelSize / 2);
    
    const tempImageData = new Uint8ClampedArray(imageData.data); // Store results of horizontal pass

    // Horizontal pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          let weightSum = 0;
          
          for (let k = -half; k <= half; k++) {
            const px = Math.min(width - 1, Math.max(0, x + k));
            const idx = (y * width + px) * 4 + c;
            sum += imageData.data[idx] * kernel[k + half];
            weightSum += kernel[k + half];
          }
          
          const idx = (y * width + x) * 4 + c;
          tempImageData[idx] = sum / weightSum;
        }
      }
    }

    // Vertical pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          let weightSum = 0;

          for (let k = -half; k <= half; k++) {
            const py = Math.min(height - 1, Math.max(0, y + k));
            const idx = (py * width + x) * 4 + c;
            sum += tempImageData[idx] * kernel[k + half]; // Use horizontal pass results
            weightSum += kernel[k + half];
          }
          
          const idx = (y * width + x) * 4 + c;
          data[idx] = sum / weightSum;
        }
      }
    }
    
    return data;
  };

  // Generate Gaussian kernel
  const generateGaussianKernel = (sigma) => {
    const size = Math.ceil(sigma * 3) * 2 + 1;
    const kernel = [];
    const mean = Math.floor(size / 2);
    let sum = 0;
    
    for (let i = 0; i < size; i++) {
      const x = i - mean;
      const value = Math.exp(-0.5 * (x * x) / (sigma * sigma));
      kernel.push(value);
      sum += value;
    }
    
    // Normalize
    for (let i = 0; i < size; i++) {
      kernel[i] /= sum;
    }
    
    return kernel;
  };

  // Enhance details with edge detection
  const enhanceDetails = (imageData, width, height, strength = 1.0) => {
    const data = imageData.data;
    const enhanced = new Uint8ClampedArray(data);
    
    // Sobel edge detection for detail enhancement
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let gx = 0;
          let gy = 0;
          
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              const kernelIdx = (ky + 1) * 3 + (kx + 1);
              gx += data[idx] * sobelX[kernelIdx];
              gy += data[idx] * sobelY[kernelIdx];
            }
          }
          
          const magnitude = Math.sqrt(gx * gx + gy * gy);
          const idx = (y * width + x) * 4 + c;
          
          // Add edge enhancement (subtle)
          enhanced[idx] = Math.min(255, Math.max(0, data[idx] + magnitude * 0.3 * strength));
        }
      }
    }
    
    imageData.data.set(enhanced);
    return imageData;
  };

  // Helper function for actual download logic
  const performSingleMediaDownload = async (blob, targetFormat, mediaType, filename) => {
    if (!blob) {
      toast.error("No compressed file available to download.");
      return;
    }

    let finalBlob = blob;
    let finalFilename = filename || getOutputFilename(targetFormat);

    // If it's an image (and not a GIF being treated as video) and the targetFormat is different from the current outputFormat,
    // we need to perform an on-the-fly conversion for download.
    if (isImage && !isGif && targetFormat && targetFormat !== (outputFormat || format)) {
        try {
            const img = new Image();
            img.src = compressedPreview; // Use the currently processed preview as source
            await new Promise((resolve) => { img.onload = resolve; });

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const mimeType = targetFormat === 'jpg' ? 'image/jpeg' : `image/${targetFormat}`;
            
            // Re-use the existing quality setting for this on-the-fly conversion
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
    // The format that the media is currently in (after processing)
    const currentCompressedFormat = outputFormat || format; 

    // Case 1: Image, and no specific format requested (user clicked general "Download")
    if (mediaType === 'image' && formatOverride === null) {
      // For images, if no specific format is selected, open the options modal.
      // NOTE: The prompt implies a modal allowing format selection. Since we cannot modify
      // the external DownloadModal.jsx file, we will open the existing DownloadModal.
      // This means it will proceed to download the image in its `currentCompressedFormat`
      // without offering dynamic choices within the modal itself.
      // If dynamic format selection is desired, the user should use the "Convert Format" buttons first.
      setShowDownloadModal(true);
      return;
    }

    // Case 2: Video, and no specific format requested. Download the currently compressed video.
    // The prompt explicitly refers to 'mp4' for video here, but we should use the actual output format.
    // If the original video was converted to GIF, `currentCompressedFormat` would be 'gif'.
    if (mediaType === 'video' && formatOverride === null) {
      performSingleMediaDownload(compressedBlob, currentCompressedFormat, 'video', getOutputFilename(currentCompressedFormat));
      return;
    }

    // Case 3: Audio, and no specific format requested. Download the currently compressed audio.
    // The prompt refers to `fileFormat` which maps to `currentCompressedFormat`.
    if (mediaType === 'audio' && formatOverride === null) {
      performSingleMediaDownload(compressedBlob, currentCompressedFormat, 'audio', getOutputFilename(currentCompressedFormat));
      return;
    }

    // Case 4: Any media type, if a specific format is provided (e.g., from a convert button or a direct download button from a hypothetical image options modal).
    // The `performSingleMediaDownload` function now handles on-the-fly conversion for images if the `formatOverride` differs.
    performSingleMediaDownload(compressedBlob, formatOverride, mediaType, getOutputFilename(formatOverride));
  };

  // Helper function to get the output filename
  const getOutputFilename = (targetFormat = null) => {
    const nameWithoutExt = editableFilename.split('.').slice(0, -1).join('.') || editableFilename;
    const finalExt = targetFormat || outputFormat || format; // Prioritize targetFormat, then actual output, then configured format
    return `${nameWithoutExt}.${finalExt}`;
  };

  const handleCompare = () => {
    if (processed && compressedPreview && (isImage || isGif)) {
      onCompare({
        original: preview,
        compressed: compressedPreview,
        originalSize,
        compressedSize,
        fileName: getOutputFilename(), // Use new helper for filename
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

  const convertFormat = async (newFormat) => {
    if (!compressedPreview || processing) return;
    
    // For video/audio/gif, just update the format state, actual conversion happens on re-process
    if (isVideo || isAudio || (isGif && newFormat === 'mp4') || (isVideo && newFormat === 'gif')) {
      setFormat(newFormat);
      // If already processed, reset processed state so user can re-process with new format
      if (processed) {
        setProcessed(false);
        setCompressedPreview(null);
        setCompressedSize(0);
        setOutputFormat(null);
      }
      toast.info('Format changed. Click "Compress" or "Reprocess" to apply.');
      return;
    }

    // For static images, convert on the fly if already compressed
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
      setCompressedBlob(blob); // ADDED
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
        filename: getOutputFilename(newFormat), // Use new helper
        mediaType: 'image',
        fileFormat: newFormat
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
                <video src={preview} className="w-full h-full object-cover" controls muted />
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

        {(isVideo || isAudio || (isGif && format === 'mp4')) && !ffmpegLoaded && (
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
            <Loader2 className="w-4 h-4 mr-2 animate-spin flex-shrink-0" />
            <span className="text-xs">Loading {isVideo ? 'video' : isAudio ? 'audio' : 'media'} processor...</span>
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

        {/* Output Format Selector - Show BEFORE compression */}
        {!processed && availableFormats.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Output Format
            </label>
            <div className={cn(
              "grid gap-2",
              availableFormats.length === 2 ? "grid-cols-2" : "grid-cols-4"
            )}>
              {availableFormats.map((fmt) => (
                <Button
                  key={fmt}
                  size="sm"
                  variant={format === fmt ? "default" : "outline"}
                  onClick={() => setFormat(fmt)}
                  disabled={processing}
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
              {/* Compression Mode - Images and GIFs only */}
              {(isImage || isGif) && !isVideo && !isAudio && (
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

              {/* Quality Slider - Images and GIFs */}
              {(isImage || isGif) && !isVideo && !isAudio && (
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
              
              {/* GIF Optimization - GIFs only */}
              {isGif && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      GIF Optimization
                    </label>
                  </div>
                  <Select value={gifOptimization} onValueChange={setGifOptimization} disabled={processing}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced (Best Quality)</SelectItem>
                      <SelectItem value="aggressive">Aggressive (Better Compression)</SelectItem>
                      <SelectItem value="maximum">Maximum (Smallest Size)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Video Settings - Videos only */}
              {isVideo && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Encoding Speed
                      </label>
                    </div>
                    <Select value={videoPreset} onValueChange={setVideoPreset} disabled={processing}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                    </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ultrafast">Ultra Fast (Larger File)</SelectItem>
                        <SelectItem value="superfast">Super Fast</SelectItem>
                        <SelectItem value="veryfast">Very Fast</SelectItem>
                        <SelectItem value="faster">Faster</SelectItem>
                        <SelectItem value="fast">Fast</SelectItem>
                        <SelectItem value="medium">Medium (Balanced)</SelectItem>
                        <SelectItem value="slow">Slow (Better Compression)</SelectItem>
                        <SelectItem value="slower">Slower</SelectItem>
                        <SelectItem value="veryslow">Very Slow (Best Compression)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
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
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Keyframe Interval: {gopSize}
                      </label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">Lower values = better seeking, larger file. Higher values = better compression.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Slider
                      value={[gopSize]}
                      onValueChange={(value) => setGopSize(value[0])}
                      min={30}
                      max={300}
                      step={10}
                      className="w-full"
                      disabled={processing}
                    />
                  </div>
                </>
              )}

              {/* Audio Settings - Audio only */}
              {isAudio && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Audio Quality
                      </label>
                    </div>
                    <Select value={audioQuality} onValueChange={setAudioQuality} disabled={processing}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (Good)</SelectItem>
                        <SelectItem value="high">High (Better)</SelectItem>
                        <SelectItem value="lossless">Lossless (Best)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
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
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Sample Rate: {sampleRate / 1000} kHz
                      </label>
                    </div>
                    <Select 
                      value={String(sampleRate)} 
                      onValueChange={(value) => setSampleRate(parseInt(value))} 
                      disabled={processing}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="22050">22.05 kHz (Low)</SelectItem>
                        <SelectItem value="44100">44.1 kHz (CD Quality)</SelectItem>
                        <SelectItem value="48000">48 kHz (Professional)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Max Width/Height - Videos, GIFs, and Images */}
              {(isVideo || isGif || (isImage && !isGif)) && (
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

              {/* Strip Metadata & Noise Reduction - Static images only (not GIF, not video, not audio) */}
              {isImage && !isGif && !isVideo && !isAudio && (
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

        {/* Upscale Settings - Static images only */}
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
                            
                            if (enableUpscale && upscaleMultiplier) {
                              targetWidth = Math.round(originalImageDimensions.width * (upscaleMultiplier / 100));
                              targetHeight = Math.round(originalImageDimensions.height * (upscaleMultiplier / 100));
                            } else if (enableUpscale && (maxWidth || maxHeight)) {
                              const aspectRatio = originalImageDimensions.width / originalImageDimensions.height;
                              
                              if (maxWidth && maxHeight) {
                                const widthRatio = maxWidth / originalImageDimensions.width;
                                const heightRatio = maxHeight / originalImageDimensions.height;
                                const ratio = Math.max(widthRatio, heightRatio); // Upscale if needed
                                
                                targetWidth = Math.round(originalImageDimensions.width * ratio);
                                targetHeight = Math.round(originalImageDimensions.height * ratio);
                              } else if (maxWidth) {
                                targetWidth = maxWidth;
                                targetHeight = Math.round(maxWidth / aspectRatio);
                              } else if (maxHeight) {
                                targetHeight = maxHeight;
                                targetWidth = Math.round(maxHeight * aspectRatio);
                              }
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
                        setAiEnhancement(false);
                      }
                    }}
                    disabled={processing}
                  />
                </div>

                {enableUpscale && (
                  <>
                    {/* AI Enhancement Toggle */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <label className="text-xs font-bold text-purple-900 dark:text-purple-300">
                            AI Enhancement
                          </label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3 h-3 text-purple-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">
                                <strong>Standard:</strong> Basic sharpening and enhancement
                                <br/><strong>Enhanced:</strong> Multi-pass upscaling with edge preservation
                                <br/><strong>Maximum:</strong> Advanced de-pixelation, super resolution with bilateral filtering
                                <br/><br/>
                                Maximum mode applies sophisticated algorithms to transform low-res pixelated images into HD quality!
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Switch
                          checked={aiEnhancement}
                          onCheckedChange={setAiEnhancement}
                          disabled={processing}
                        />
                      </div>
                      
                      {aiEnhancement && (
                        <div className="space-y-2 mt-3">
                          <label className="text-[10px] font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wide">
                            Enhancement Level
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              size="sm"
                              variant={aiUpscaleMode === 'standard' ? "default" : "outline"}
                              onClick={() => setAiUpscaleMode('standard')}
                              disabled={processing}
                              className={cn(
                                "text-xs h-8",
                                aiUpscaleMode === 'standard' ? "bg-purple-600 hover:bg-purple-700" : "hover:bg-purple-50 dark:hover:bg-purple-950/50"
                              )}
                            >
                              Standard
                            </Button>
                            <Button
                              size="sm"
                              variant={aiUpscaleMode === 'enhanced' ? "default" : "outline"}
                              onClick={() => setAiUpscaleMode('enhanced')}
                              disabled={processing}
                              className={cn(
                                "text-xs h-8",
                                aiUpscaleMode === 'enhanced' ? "bg-purple-600 hover:bg-purple-700" : "hover:bg-purple-50 dark:hover:bg-purple-950/50"
                              )}
                            >
                              Enhanced
                            </Button>
                            <Button
                              size="sm"
                              variant={aiUpscaleMode === 'maximum' ? "default" : "outline"}
                              onClick={() => setAiUpscaleMode('maximum')}
                              disabled={processing}
                              className={cn(
                                "text-xs h-8",
                                aiUpscaleMode === 'maximum' ? "bg-purple-600 hover:bg-purple-700" : "hover:bg-purple-50 dark:hover:bg-purple-950/50"
                              )}
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              Maximum
                            </Button>
                          </div>
                          <p className="text-[10px] text-purple-700 dark:text-purple-400 mt-2">
                            {aiUpscaleMode === 'standard' && '⚡ Fast processing with basic enhancement'}
                            {aiUpscaleMode === 'enhanced' && '✨ Multi-pass upscaling with edge preservation'}
                            {aiUpscaleMode === 'maximum' && '🚀 De-pixelation + Super Resolution (slower but best quality)'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                        Upscale Multiplier
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[150, 200, 250, 300, 400, 500].map((multiplier) => (
                          <Button
                            key={multiplier}
                            size="sm"
                            variant={upscaleMultiplier === multiplier ? "default" : "outline"}
                            onClick={() => {
                              setUpscaleMultiplier(multiplier);
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
                                setUpscaleMultiplier(null);
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
                                setUpscaleMultiplier(null);
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

        <div className="flex gap-2">
          {!processed ? (
            <Button
              onClick={processMedia}
              disabled={processing || ((isVideo || isAudio || (isGif && format === 'mp4')) && !ffmpegLoaded)}
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

      {showVariationsModal && generatedVariations.length > 0 && (
        <Dialog open={showVariationsModal} onOpenChange={(open) => {
          if (!open) {
            // Cleanup on close
            generatedVariations.forEach(v => URL.revokeObjectURL(v.url));
            setGeneratedVariations([]);
            setShowVariationsModal(false);
            setProcessing(false);
            setSelectedVariationIndex(null); // Reset selected index on close
          }
        }}>
          <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] p-0 bg-slate-50 dark:bg-slate-950 overflow-hidden [&>button]:hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    Choose Your HD Version
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    AI generated {generatedVariations.length} variations - select the one that looks best to you
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    generatedVariations.forEach(v => URL.revokeObjectURL(v.url));
                    setGeneratedVariations([]);
                    setShowVariationsModal(false);
                    setProcessing(false);
                    setSelectedVariationIndex(null);
                  }}
                  className="hover:bg-red-100 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {generatedVariations.map((variation, index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all",
                      selectedVariationIndex === index
                        ? "border-emerald-500 ring-4 ring-emerald-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600"
                    )}
                    onClick={() => setSelectedVariationIndex(index)} // Only select, not finalize here
                  >
                    <div className="aspect-square bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
                      <img
                        src={variation.url}
                        alt={variation.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-bold text-lg">{variation.name}</h3>
                          <p className="text-white/80 text-xs">
                            {index === 0 && 'Recommended for most images'}
                            {index === 1 && 'Best for text and fine details'}
                            {index === 2 && 'Best for photos and portraits'}
                            {index === 3 && 'Maximum sharpness and clarity'}
                          </p>
                        </div>
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                          selectedVariationIndex === index
                            ? "bg-emerald-500 scale-110"
                            : "bg-white/20 group-hover:bg-white/30"
                        )}>
                          {selectedVariationIndex === index ? (
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          ) : (
                            <Sparkles className="w-6 h-6 text-white" />
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedVariationIndex === index && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-emerald-500 text-white font-bold shadow-lg">
                          Selected
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => {
                    if (selectedVariationIndex !== null) {
                      handleVariationSelected(selectedVariationIndex);
                    } else {
                      toast.error('Please select a variation');
                    }
                  }}
                  disabled={selectedVariationIndex === null}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Use Selected Version
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

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
          originalFilename={getOutputFilename()} // Use new helper
          format={outputFormat || format}
        />
      )}
    </Card>
  );
}
