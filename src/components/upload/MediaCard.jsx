
import { useState, useEffect, lazy, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, X, Loader2, CheckCircle2, ArrowRight, Settings2, AlertCircle, Info, Edit2, RefreshCcw, Sparkles, Film, Music, Video, Wand2, Check, XCircle } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";

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
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // AI filename suggestion states
  const [suggestedFilename, setSuggestedFilename] = useState('');
  const [generatingFilename, setGeneratingFilename] = useState(false);
  const [showFilenameInput, setShowFilenameInput] = useState(false);
  const [editedFilename, setEditedFilename] = useState('');

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
  const fetchFileRef = useRef(null); // Ref to store fetchFile

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
    if ((isVideo || isAudio || isGif) && !ffmpegLoaded) {
      loadFFmpeg();
    }
  }, [isVideo, isAudio, isGif, ffmpegLoaded]);

  useEffect(() => {
    if (autoProcess && !processed && !processing && processMediaRef.current) {
      processMediaRef.current();
    }
  }, [autoProcess, processed, processing]);

  const loadFFmpeg = async () => {
    if (ffmpegRef.current) {
      console.log('FFmpeg already loaded');
      return;
    }

    try {
      console.log('🚀 Starting FFmpeg load...');
      setLoadingProgress(10);
      toast.info('Loading media processor...', { id: 'ffmpeg-load', duration: Infinity });
      
      setLoadingProgress(20);
      
      // Try Method 1: Direct URLs from jsdelivr (no CORS, no workers issues)
      try {
        console.log('📦 Method 1: Importing from jsdelivr...');
        const { FFmpeg } = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/index.js');
        const { fetchFile } = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/umd/index.js');
        
        console.log('✅ Modules imported successfully');
        setLoadingProgress(40);
        
        const ffmpeg = new FFmpeg();
        window.fetchFile = fetchFile;
        
        ffmpeg.on('log', ({ message }) => {
          console.log('[FFmpeg]:', message);
        });
        
        ffmpeg.on('progress', ({ progress }) => {
          const percent = Math.round(progress * 100);
          console.log(`[FFmpeg] Progress: ${percent}%`);
        });
        
        setLoadingProgress(60);
        
        console.log('🔧 Loading FFmpeg core...');
        const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd';
        
        await ffmpeg.load({
          coreURL: `${baseURL}/ffmpeg-core.js`,
          wasmURL: `${baseURL}/ffmpeg-core.wasm`,
        });
        
        setLoadingProgress(100);
        ffmpegRef.current = ffmpeg;
        setFfmpegLoaded(true);
        
        console.log('✅ FFmpeg loaded successfully (Method 1)!');
        toast.success('Media processor ready!', { id: 'ffmpeg-load' });
        return;
        
      } catch (error1) {
        console.warn('⚠️ Method 1 failed, trying Method 2...', error1);
        setLoadingProgress(30);
        
        // Try Method 2: ESM with single-threaded core
        try {
          console.log('📦 Method 2: Importing ESM with single-threaded core...');
          const { FFmpeg } = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js');
          const { fetchFile } = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/esm/index.js');
          
          console.log('✅ Modules imported successfully');
          setLoadingProgress(50);
          
          const ffmpeg = new FFmpeg();
          window.fetchFile = fetchFile;
          
          ffmpeg.on('log', ({ message }) => console.log('[FFmpeg]:', message));
          ffmpeg.on('progress', ({ progress }) => console.log(`[FFmpeg] Progress: ${Math.round(progress * 100)}%`));
          
          setLoadingProgress(70);
          
          console.log('🔧 Loading single-threaded core...');
          await ffmpeg.load({
            coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-st@0.12.6/dist/esm/ffmpeg-core.js',
            wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-st@0.12.6/dist/esm/ffmpeg-core.wasm',
          });
          
          setLoadingProgress(100);
          ffmpegRef.current = ffmpeg;
          setFfmpegLoaded(true);
          
          console.log('✅ FFmpeg loaded successfully (Method 2)!');
          toast.success('Media processor ready!', { id: 'ffmpeg-load' });
          return;
          
        } catch (error2) {
          console.warn('⚠️ Method 2 failed, trying Method 3...', error2);
          setLoadingProgress(40);
          
          // Try Method 3: Unpkg fallback
          try {
            console.log('📦 Method 3: Importing from unpkg...');
            const { FFmpeg } = await import('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js');
            const { fetchFile } = await import('https://unpkg.com/@ffmpeg/util@0.12.1/dist/esm/index.js');
            
            console.log('✅ Modules imported successfully');
            setLoadingProgress(60);
            
            const ffmpeg = new FFmpeg();
            window.fetchFile = fetchFile;
            
            ffmpeg.on('log', ({ message }) => console.log('[FFmpeg]:', message));
            ffmpeg.on('progress', ({ progress }) => console.log(`[FFmpeg] Progress: ${Math.round(progress * 100)}%`));
            
            setLoadingProgress(80);
            
            console.log('🔧 Loading from unpkg...');
            await ffmpeg.load({
              coreURL: 'https://unpkg.com/@ffmpeg/core-st@0.12.6/dist/esm/ffmpeg-core.js',
              wasmURL: 'https://unpkg.com/@ffmpeg/core-st@0.12.6/dist/esm/ffmpeg-core.wasm',
            });
            
            setLoadingProgress(100);
            ffmpegRef.current = ffmpeg;
            setFfmpegLoaded(true);
            
            console.log('✅ FFmpeg loaded successfully (Method 3)!');
            toast.success('Media processor ready!', { id: 'ffmpeg-load' });
            return;
            
          } catch (error3) {
            console.error('❌ All methods failed');
            throw new Error('Unable to load FFmpeg from any CDN. Please check your internet connection.');
          }
        }
      }
      
    } catch (error) {
      console.error('❌ FFmpeg load error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      setError(`Failed to load media processor. Try refreshing the page. Error: ${error.message}`);
      toast.error('Failed to load media processor. Please refresh the page.', { id: 'ffmpeg-load' });
      setLoadingProgress(0);
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

  const generateAIFilename = async () => {
    setGeneratingFilename(true);
    try {
      const baseName = image.name.split('.')[0];
      const mediaType = isVideo ? 'video' : isAudio ? 'audio' : isGif ? 'GIF animation' : 'image';
      const ext = outputFormat || format;
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a clean, SEO-friendly filename for a compressed ${mediaType}. Original name: "${baseName}". 
Rules:
- Use lowercase with hyphens (kebab-case)
- Be descriptive but concise (max 50 chars)
- Remove special characters
- Don't include file extension
- Make it web-friendly and searchable
- Keep the essence of the original name

Return ONLY the filename without extension, nothing else.`,
        response_json_schema: {
          type: "object",
          properties: {
            filename: { type: "string" }
          }
        }
      });
      
      const suggestedName = result.filename || baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      setSuggestedFilename(`${suggestedName}.${ext}`);
      setEditedFilename(`${suggestedName}.${ext}`);
      setShowFilenameInput(true);
      toast.success('AI filename generated!');
    } catch (error) {
      console.error('Error generating filename:', error);
      toast.error('Failed to generate filename');
    } finally {
      setGeneratingFilename(false);
    }
  };

  const acceptFilename = () => {
    setShowFilenameInput(false);
    downloadMedia(editedFilename);
  };

  const rejectFilename = () => {
    setShowFilenameInput(false);
    setSuggestedFilename('');
    setEditedFilename('');
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
    if (!ffmpegLoaded || !ffmpegRef.current || !window.fetchFile) {
      toast.error('Video processor not ready');
      return;
    }

    try {
      console.log('🎬 Starting GIF to MP4 conversion...');
      toast.info('Converting GIF to MP4...', { id: 'processing', duration: Infinity });
      
      const ffmpeg = ffmpegRef.current;
      const fetchFile = window.fetchFile;
      
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
        filename: `${image.name.split('.')[0]}.mp4`,
        mediaType: 'video',
        fileFormat: 'mp4'
      });

      toast.dismiss('processing');
      toast.success('GIF converted to MP4!');
      console.log('✅ Conversion complete!');
    } catch (error) {
      console.error('❌ GIF to MP4 failed:', error);
      toast.dismiss('processing');
      toast.error('Conversion failed: ' + error.message);
      throw error;
    }
  };

  const convertMp4ToGif = async () => {
    if (!ffmpegLoaded || !ffmpegRef.current || !window.fetchFile) {
      toast.error('Video processor not ready');
      return;
    }

    try {
      console.log('🎞️ Starting MP4 to GIF conversion...');
      toast.info('Converting video to GIF...', { id: 'processing', duration: Infinity });
      
      const ffmpeg = ffmpegRef.current;
      const fetchFile = window.fetchFile;
      
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
        filename: `${image.name.split('.')[0]}.gif`,
        mediaType: 'image',
        fileFormat: 'gif'
      });

      toast.dismiss('processing');
      toast.success('Video converted to GIF!');
      console.log('✅ Conversion complete!');
    } catch (error) {
      console.error('❌ MP4 to GIF failed:', error);
      toast.dismiss('processing');
      toast.error('Conversion failed: ' + error.message);
      throw error;
    }
  };

  const processVideo = async () => {
    if (!ffmpegLoaded || !ffmpegRef.current || !window.fetchFile) {
      toast.error('Video processor not ready');
      return;
    }

    try {
      console.log('🎥 Starting video compression...');
      toast.info('Compressing video...', { id: 'processing', duration: Infinity });
      
      const ffmpeg = ffmpegRef.current;
      const fetchFile = window.fetchFile;
      
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
        filename: `${image.name.split('.')[0]}_compressed.mp4`,
        mediaType: 'video',
        fileFormat: 'mp4'
      });

      const savings = ((1 - outputBlob.size / image.size) * 100).toFixed(1);
      toast.dismiss('processing');
      toast.success(`Video compressed! Saved ${savings}%`);
      console.log('✅ Compression complete!');
    } catch (error) {
      console.error('❌ Video compression failed:', error);
      toast.dismiss('processing');
      toast.error('Compression failed: ' + error.message);
      throw error;
    }
  };

  const processAudio = async () => {
    if (!ffmpegLoaded || !ffmpegRef.current || !window.fetchFile) {
      toast.error('Audio processor not ready');
      return;
    }

    try {
      console.log('🎵 Starting audio compression...');
      toast.info('Compressing audio...', { id: 'processing', duration: Infinity });
      
      const ffmpeg = ffmpegRef.current;
      const fetchFile = window.fetchFile;
      
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
        filename: `${image.name.split('.')[0]}_compressed.${outputExt}`,
        mediaType: 'audio',
        fileFormat: format
      });

      const savings = ((1 - outputBlob.size / image.size) * 100).toFixed(1);
      toast.dismiss('processing');
      toast.success(`Audio compressed! Saved ${savings}%`);
      console.log('✅ Compression complete!');
    } catch (error) {
      console.error('❌ Audio compression failed:', error);
      toast.dismiss('processing');
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
          filename: `${image.name.split('.')[0]}_compressed.gif`,
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
        filename: `${image.name.split('.')[0]}_compressed.gif`,
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
      filename: `${image.name.split('.')[0]}.${format}`,
      mediaType: 'image',
      fileFormat: format
    });
  };

  const downloadMedia = (customFilename = null) => {
    const link = document.createElement('a');
    link.href = compressedPreview;
    link.download = customFilename || `${image.name.split('.')[0]}_compressed.${outputFormat || format}`;
    link.click();
    toast.success('Downloaded!');
    setShowFilenameInput(false);
    setSuggestedFilename('');
    setEditedFilename('');
  };

  const handleCompare = () => {
    if (processed && compressedPreview && (isImage || isGif)) {
      onCompare({
        original: preview,
        compressed: compressedPreview,
        originalSize,
        compressedSize,
        fileName: `${image.name.split('.')[0]}_compressed.${outputFormat || format}`,
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
    
    if (isVideo || isAudio || isGif) {
      setFormat(newFormat);
      if (processed) {
        setProcessed(false);
        setCompressedPreview(null);
        setCompressedSize(0);
        setOutputFormat(null);
      }
      toast.info('Format changed. Click "Compress" or "Reprocess" to apply.');
      return;
    }

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
        filename: `${image.name.split('.')[0]}.${newFormat}`,
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="relative">
          <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 dark:bg-slate-950">
            {preview && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
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
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
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
                  </motion.div>
                )}
              </motion.div>
            )}
            {compressedPreview ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
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
              </motion.div>
            ) : (
              <div className="aspect-square rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                <p className="text-sm text-slate-400 text-center px-2">Preview after compression</p>
              </div>
            )}
          </div>

          <motion.div
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="absolute top-0 right-2 bg-slate-900/90 dark:bg-slate-900/90 hover:bg-red-600 dark:hover:bg-red-600 text-white rounded-lg transition-colors z-20 shadow-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
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

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs">{error}</span>
              </motion.div>
            )}

            {(isVideo || isAudio || isGif) && !ffmpegLoaded && !error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span className="text-xs">Loading {isVideo ? 'video' : isAudio ? 'audio' : 'media'} processor... {loadingProgress}%</span>
                </div>
                {loadingProgress > 0 && (
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${loadingProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {processed && showFilenameInput && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    AI Suggested Filename
                  </label>
                </div>
                <Input
                  value={editedFilename}
                  onChange={(e) => setEditedFilename(e.target.value)}
                  className="text-sm"
                  placeholder="Enter filename..."
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={acceptFilename}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={rejectFilename}
                    className="flex-1"
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {processed && availableFormats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Convert Format
              </label>
              <div className={cn(
                "grid gap-2",
                availableFormats.length === 2 ? "grid-cols-2" : "grid-cols-4"
              )}>
                {availableFormats.map((fmt) => (
                  <motion.div key={fmt} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      variant={displayFormat === fmt ? "default" : "outline"}
                      onClick={() => convertFormat(fmt)}
                      disabled={displayFormat === fmt || processing}
                      className={cn(
                        "relative text-xs h-9 w-full",
                        displayFormat === fmt && "bg-emerald-600 hover:bg-emerald-700"
                      )}
                    >
                      {fmt.toUpperCase()}
                      {displayFormat === fmt && processing && <Loader2 className="ml-1 h-3 w-3 animate-spin" />}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
            <CollapsibleTrigger asChild>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" className="w-full justify-between" size="sm">
                  <span className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4" />
                    Compression Settings
                  </span>
                  <motion.div
                    animate={{ rotate: settingsOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <TooltipProvider>
                {!isAudio && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
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
                  </motion.div>
                )}

                {(isImage && !isGif) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
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
                  </motion.div>
                )}

                {(isGif || isVideo) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
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
                  </motion.div>
                )}

                {isAudio && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
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
                  </motion.div>
                )}

                {(isImage || isGif) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
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
                  </motion.div>
                )}
                
                {isGif && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
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
                  </motion.div>
                )}

                {isVideo && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
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
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                    >
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
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                    >
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
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 }}
                    >
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
                    </motion.div>
                  </>
                )}

                {isAudio && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 }}
                    >
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
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 }}
                    >
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
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3 }}
                    >
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
                    </motion.div>
                  </>
                )}

                {(isImage || isVideo || isGif) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 }}
                  >
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
                  </motion.div>
                )}

                {(isImage && !isGif) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 }}
                  >
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
                  </motion.div>
                )}
              </TooltipProvider>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex gap-2">
            {!processed ? (
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={processMedia}
                  disabled={processing || ((isVideo || isAudio || isGif) && !ffmpegLoaded)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
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
              </motion.div>
            ) : (
              <>
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={processMedia}
                    variant="outline"
                    className="w-full"
                    disabled={processing}
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Reprocess
                  </Button>
                </motion.div>
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => {
                      if (!showFilenameInput) {
                        generateAIFilename();
                      } else {
                        downloadMedia();
                      }
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={processing || generatingFilename}
                  >
                    {generatingFilename ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : showFilenameInput ? (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        AI Download
                      </>
                    )}
                  </Button>
                </motion.div>
              </>
            )}
          </div>

          <AnimatePresence>
            {processed && !error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved {formatFileSize(originalSize - compressedSize)}</span>
              </motion.div>
            )}
          </AnimatePresence>
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
    </motion.div>
  );
}
