import { useState, useEffect, lazy, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, X, Loader2, CheckCircle2, ArrowRight, Settings2, AlertCircle, Info, Edit2, RefreshCcw, Sparkles, Film, Music, Video, ChevronDown, Check, Wand2, ImageIcon, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LazyImage from "./LazyImage";
import SocialShareModal from "../SocialShareModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

// Lazy load the editor
const ImageEditor = lazy(() => import("./ImageEditor"));
const GifEditor = lazy(() => import("./GifEditor"));
const VideoEditor = lazy(() => import("./VideoEditor"));

export default function MediaCard({ image, onRemove, onProcessed, onCompare, autoProcess, isPro, onFilenameUpdate }) {
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
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [outputFormat, setOutputFormat] = useState(null);
  const [compressedBlob, setCompressedBlob] = useState(null);
  const [enableUpscale, setEnableUpscale] = useState(false);
  const [upscaleSettingsOpen, setUpscaleSettingsOpen] = useState(false);
  const [upscaleMultiplier, setUpscaleMultiplier] = useState(null);
  const [originalImageDimensions, setOriginalImageDimensions] = useState({ width: 0, height: 0 });
  const [useStandardResolutions, setUseStandardResolutions] = useState(true);
  const [lastPresetSelected, setLastPresetSelected] = useState(null);
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
  const [showSocialShare, setShowSocialShare] = useState(false);
  const isImage = image?.type?.startsWith('image/') || false;
  const isVideo = image?.type?.startsWith('video/') || false;
  const isAudio = image?.type?.startsWith('audio/') || false;
  const isGif = image?.type === 'image/gif';
  const originalExt = image?.name?.split('.').pop()?.toUpperCase() || 'FILE';
  const originalFormat = image?.name?.split('.').pop()?.toLowerCase() || 'unknown';
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
  const [settingsChanged, setSettingsChanged] = useState(false);
  const mediaIcon = isVideo ? Video : isAudio ? Music : isGif ? Film : isImage ? ImageIcon : null;
  const MediaIcon = mediaIcon;

  // No FFmpeg loading needed - using browser native APIs

  // No longer needed - using browser native APIs

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
    if (((enableAnimation && isImage && !isGif) || isGif || (isVideo && format === 'gif')) && !gifJsLoaded) {
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
  }, [enableAnimation, isGif, gifJsLoaded, workerBlobUrl, isImage, isVideo, format]);

  useEffect(() => {
    return () => {
      if (workerBlobUrl) URL.revokeObjectURL(workerBlobUrl);
    };
  }, [workerBlobUrl]);

  // Re-apply last preset when Standard Resolutions toggle changes
  useEffect(() => {
    if (lastPresetSelected && originalImageDimensions.width > 0 && originalImageDimensions.height > 0) {
      const preset = lastPresetSelected;
      if (useStandardResolutions) {
        const aspectRatio = originalImageDimensions.width / originalImageDimensions.height;
        let resolution;
        if (Math.abs(aspectRatio - 1) < 0.1) resolution = preset.standardRes['1:1'];
        else if (Math.abs(aspectRatio - 16/9) < 0.1) resolution = preset.standardRes['16:9'];
        else if (Math.abs(aspectRatio - 9/16) < 0.1) resolution = preset.standardRes['9:16'];
        else if (Math.abs(aspectRatio - 4/3) < 0.1) resolution = preset.standardRes['4:3'];
        else resolution = preset.standardRes['16:9'];
        setMaxWidth(resolution[0]);
        setMaxHeight(resolution[1]);
      } else {
        const aspectRatio = originalImageDimensions.width / originalImageDimensions.height;
        const newHeight = preset.height;
        const newWidth = Math.round(newHeight * aspectRatio);
        setMaxWidth(newWidth);
        setMaxHeight(newHeight);
      }
    }
  }, [useStandardResolutions]);

  // Track settings changes after processing
  useEffect(() => {
    if (processed) {
      setSettingsChanged(true);
    }
  }, [quality, format, maxWidth, maxHeight, compressionMode, stripMetadata, noiseReduction, 
      enableUpscale, upscaleMultiplier, useStandardResolutions, enableAnimation, animationType, 
      animationDuration, videoBitrate, audioBitrate, frameRate, videoPreset, videoResolution, audioQuality, 
      editableFilename]);

  // Calculate time remaining based on actual progress
  useEffect(() => {
    if (processing && processingStartTime && processingProgress > 0 && processingProgress < 100) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - processingStartTime;
        const progressFraction = processingProgress / 100;
        const estimatedTotal = elapsed / progressFraction;
        const remaining = Math.max(0, estimatedTotal - elapsed);
        setEstimatedTimeForFile(Math.ceil(remaining / 1000));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setEstimatedTimeForFile(null);
    }
  }, [processing, processingStartTime, processingProgress]);

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
      } else if (isGif) {
        metadata.frames = gifFrameCount;
        metadata.width = gifSettings.width;
        metadata.height = gifSettings.height;
        metadata.format = 'GIF';
      } else if (isVideo) {
        const video = document.createElement('video');
        video.src = preview;
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = resolve;
          video.onerror = () => reject(new Error('Failed to load video for metadata.'));
        });
        metadata.duration = formatDuration(video.duration);
        metadata.width = video.videoWidth;
        metadata.height = video.videoHeight;
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
    setProcessingProgress(0);
    setError(null);
    setOutputFormat(null);
    setOutputGifFrameCount(0);
    setSettingsChanged(false);
    try {
      if (isImage && !isGif && enableAnimation) await processImageToAnimation();
      else if (isVideo) await processVideo();
      else if (isAudio) await processAudio();
      else if (isGif) {
        if (format === 'mp4') await convertGifToMp4();
        else await processGif();
      }
      else if (isImage) await processStaticImage();
    } catch (error) {
      console.error('Error processing media:', error);
      setError(`Failed to process. ${error.message}`);
      toast.error('Processing failed: ' + error.message);
    }
    setProcessing(false);
    setProcessingStartTime(null);
    setProcessingProgress(0);
    setEstimatedTimeForFile(null);
  };

  useEffect(() => {
    processMediaRef.current = processMedia;
  });

  const processVideo = async () => {
    try {
      if (format === 'gif') {
        await convertVideoToGif();
        return;
      }
      
      setProcessingProgress(5);
      
      // Load video
      const video = document.createElement('video');
      video.src = preview;
      video.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = () => reject(new Error('Failed to load video'));
        setTimeout(() => reject(new Error('Video loading timeout')), 10000);
      });
      
      const hasAudio = video.mozHasAudio || Boolean(video.webkitAudioDecodedByteCount) || Boolean(video.audioTracks && video.audioTracks.length);
      
      // Determine target resolution
      let targetWidth = video.videoWidth;
      let targetHeight = video.videoHeight;
      
      if (videoResolution !== 'original') {
        const resMap = { '480p': 854, '720p': 1280, '1080p': 1920 };
        const targetWidthFromRes = resMap[videoResolution];
        if (targetWidthFromRes && targetWidth > targetWidthFromRes) {
          targetHeight = Math.round((targetWidthFromRes / targetWidth) * targetHeight);
          targetWidth = targetWidthFromRes;
        }
      }
      
      // Ensure dimensions are even (required for H.264)
      targetWidth = Math.floor(targetWidth / 2) * 2;
      targetHeight = Math.floor(targetHeight / 2) * 2;
      
      // Determine appropriate AVC codec level based on resolution
      const pixelCount = targetWidth * targetHeight;
      let codecString;
      
      if (pixelCount <= 921600) { // Up to 1280x720 (HD)
        codecString = 'avc1.42E01F'; // Level 3.1
      } else if (pixelCount <= 2097152) { // Up to 2048x1024
        codecString = 'avc1.640028'; // High Profile, Level 4.0
      } else if (pixelCount <= 8847360) { // Up to 4096x2160 (4K)
        codecString = 'avc1.640033'; // High Profile, Level 5.1
      } else {
        codecString = 'avc1.640034'; // High Profile, Level 5.2 (8K)
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
      
      // Import mp4-muxer
      const { Muxer, ArrayBufferTarget } = await import('https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/+esm');
      
      const target = new ArrayBufferTarget();
      const muxerConfig = {
        target,
        video: {
          codec: 'avc',
          width: targetWidth,
          height: targetHeight,
          frameRate: frameRate || 30,
        },
        fastStart: 'in-memory',
      };
      
      // Add audio track if video has audio
      if (hasAudio) {
        muxerConfig.audio = {
          codec: 'aac',
          sampleRate: 48000,
          numberOfChannels: 2,
        };
      }
      
      const muxer = new Muxer(muxerConfig);
      
      // Setup video encoder
      const videoEncoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => {
          console.error('Video encoder error:', e);
          throw new Error(`Video encoding failed: ${e.message}`);
        },
      });
      
      if (!('VideoEncoder' in window)) {
        throw new Error('VideoEncoder not supported in this browser');
      }
      
      videoEncoder.configure({
        codec: codecString,
        width: targetWidth,
        height: targetHeight,
        bitrate: (videoBitrate || 1000) * 1000,
        framerate: frameRate || 30,
      });
      
      // Setup audio encoder if video has audio
      let audioEncoder = null;
      let audioProcessingPromise = null;
      if (hasAudio && 'AudioEncoder' in window) {
        audioEncoder = new AudioEncoder({
          output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
          error: (e) => console.error('Audio encoder error:', e),
        });
        
        audioEncoder.configure({
          codec: 'mp4a.40.2',
          sampleRate: 48000,
          numberOfChannels: 2,
          bitrate: (audioBitrate || 128) * 1000,
        });
        
        // Setup audio processing
        video.muted = false;
        const audioContext = new AudioContext({ sampleRate: 48000 });
        const source = audioContext.createMediaElementSource(video);
        const dest = audioContext.createMediaStreamDestination();
        source.connect(dest);
        
        if (dest.stream.getAudioTracks().length > 0) {
          const audioTrack = dest.stream.getAudioTracks()[0];
          const reader = new MediaStreamTrackProcessor({ track: audioTrack }).readable.getReader();
          
          // Process audio frames - wait for completion
          audioProcessingPromise = (async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (audioEncoder && audioEncoder.state === 'configured') {
                  audioEncoder.encode(value);
                }
                value.close();
              }
            } catch (e) {
              console.warn('Audio processing stopped:', e);
            }
          })();
        }
      } else {
        video.muted = true;
      }
      
      const duration = Math.min(video.duration, 60); // Max 60 seconds
      const fps = frameRate || 30;
      const frameInterval = 1 / fps;
      let frameCount = 0;
      
      // Process frames
      const totalFrames = Math.ceil(duration * fps);
      try {
        for (let time = 0; time < duration; time += frameInterval) {
          // Check encoder state before encoding
          if (videoEncoder.state === 'closed') {
            throw new Error('Encoder was closed unexpectedly');
          }

          video.currentTime = time;

          await new Promise((resolve, reject) => {
            const seekTimeout = setTimeout(() => reject(new Error('Seek timeout')), 2000);
            video.onseeked = () => {
              clearTimeout(seekTimeout);
              resolve();
            };
            video.onerror = () => {
              clearTimeout(seekTimeout);
              reject(new Error('Video seek error'));
            };
          });

          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

          const frame = new VideoFrame(canvas, {
            timestamp: frameCount * (1_000_000 / fps),
          });

          if (videoEncoder.state === 'configured') {
            videoEncoder.encode(frame, { keyFrame: frameCount % 30 === 0 });
          }

          frame.close();
          frameCount++;

          // Update progress based on actual frames processed
          const progress = Math.min(90, 5 + (frameCount / totalFrames) * 85);
          setProcessingProgress(progress);
        }
        
        // Ensure all frames are encoded before flushing
        if (videoEncoder.state === 'configured') {
          await videoEncoder.flush();
        }
        
        // Wait for audio processing to complete and flush
        if (audioProcessingPromise) {
          await audioProcessingPromise;
        }
        if (audioEncoder && audioEncoder.state === 'configured') {
          await audioEncoder.flush();
        }
      } finally {
        // Always close encoders
        if (videoEncoder.state !== 'closed') {
          videoEncoder.close();
        }
        if (audioEncoder && audioEncoder.state !== 'closed') {
          audioEncoder.close();
        }
      }
      
      muxer.finalize();
      
      const mp4Buffer = target.buffer;
      const blob = new Blob([mp4Buffer], { type: 'video/mp4' });
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
        fileFormat: 'mp4',
        originalFileFormat: originalFormat
      });
      
      const savings = image.size > blob.size ? ((1 - blob.size / image.size) * 100).toFixed(1) : 0;
      toast.success(`Video processed to MP4! ${savings > 0 ? `Saved ${savings}%` : ''}`);
      
    } catch (error) {
      console.error('Video processing failed:', error);
      toast.error(`Video processing failed: ${error.message || 'Unknown error'}`);
      setProcessing(false);
      throw error;
    }
  };

  const processAudio = async () => {
    try {
      setProcessingProgress(10);
      
      // Decode audio
      const audioContext = new AudioContext();
      const arrayBuffer = await image.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      setProcessingProgress(30);
      
      // Target sample rate and bitrate
      const targetSampleRate = 44100;
      const targetBitrate = audioBitrate || 128;
      
      // Resample if needed
      let processedBuffer = audioBuffer;
      if (audioBuffer.sampleRate !== targetSampleRate) {
        const offlineContext = new OfflineAudioContext(
          audioBuffer.numberOfChannels,
          audioBuffer.duration * targetSampleRate,
          targetSampleRate
        );
        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineContext.destination);
        source.start();
        processedBuffer = await offlineContext.startRendering();
      }
      
      setProcessingProgress(50);
      
      let blob, mimeType, outputExt;
      
      if (format === 'mp3') {
        // Load lamejs for MP3 encoding
        if (!window.lamejs) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load MP3 encoder'));
            document.head.appendChild(script);
          });
        }
        
        const mp3encoder = new window.lamejs.Mp3Encoder(processedBuffer.numberOfChannels, targetSampleRate, targetBitrate);
        const mp3Data = [];
        const sampleBlockSize = 1152;
        
        // Convert audio buffer to the format lamejs expects
        const left = processedBuffer.getChannelData(0);
        const right = processedBuffer.numberOfChannels > 1 ? processedBuffer.getChannelData(1) : null;
        
        // Convert float samples to int16
        const leftInt16 = new Int16Array(left.length);
        const rightInt16 = right ? new Int16Array(right.length) : null;
        
        for (let i = 0; i < left.length; i++) {
          leftInt16[i] = left[i] * 0x7FFF;
          if (right) rightInt16[i] = right[i] * 0x7FFF;
        }
        
        // Encode in blocks
        for (let i = 0; i < leftInt16.length; i += sampleBlockSize) {
          const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
          const rightChunk = rightInt16 ? rightInt16.subarray(i, i + sampleBlockSize) : null;
          const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
          if (mp3buf.length > 0) mp3Data.push(mp3buf);
        }
        
        const mp3buf = mp3encoder.flush();
        if (mp3buf.length > 0) mp3Data.push(mp3buf);
        
        blob = new Blob(mp3Data, { type: 'audio/mpeg' });
        mimeType = 'audio/mpeg';
        outputExt = 'mp3';
      } else {
        // Convert to WAV format
        const numberOfChannels = processedBuffer.numberOfChannels;
        const length = processedBuffer.length * numberOfChannels * 2;
        const buffer = new ArrayBuffer(44 + length);
        const view = new DataView(buffer);
        
        // WAV header
        const writeString = (offset, string) => {
          for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
          }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, targetSampleRate, true);
        view.setUint32(28, targetSampleRate * numberOfChannels * 2, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length, true);
        
        // Write audio data
        let offset = 44;
        for (let i = 0; i < processedBuffer.length; i++) {
          for (let channel = 0; channel < numberOfChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, processedBuffer.getChannelData(channel)[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
          }
        }
        
        blob = new Blob([buffer], { type: 'audio/wav' });
        mimeType = 'audio/wav';
        outputExt = 'wav';
      }
      
      setProcessingProgress(100);
      
      const compressedUrl = URL.createObjectURL(blob);
      
      setCompressedPreview(compressedUrl);
      setCompressedSize(blob.size);
      setCompressedBlob(blob);
      setProcessed(true);
      setOutputFormat(outputExt);
      
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
        fileFormat: outputExt,
        originalFileFormat: originalFormat
      });
      
      const savings = ((1 - blob.size / image.size) * 100).toFixed(1);
      if (blob.size < image.size) {
        toast.success(`Audio ${outputExt.toUpperCase()} processed! Saved ${savings}%`);
      } else {
        toast.success(`Audio converted to ${outputExt.toUpperCase()} format`);
      }
      
      audioContext.close();
    } catch (error) {
      console.error('Audio processing failed:', error);
      throw error;
    }
  };

  const convertVideoToGif = async () => {
    try {
      if (!gifJsLoaded || !window.GIF || !workerBlobUrl) {
        toast.error('GIF processor loading...');
        return;
      }
      
      setProcessingProgress(5);
      
      const video = document.createElement('video');
      video.src = preview;
      video.muted = true; // Keep muted for GIF conversion (no audio in GIF)
      
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
      });
      
      const targetWidth = maxWidth || Math.min(480, video.videoWidth);
      const targetHeight = Math.round((targetWidth / video.videoWidth) * video.videoHeight);
      // Use higher FPS for smoother GIF (15 fps is good balance between quality and size)
      const fps = 15;
      const duration = Math.min(video.duration, 10); // Limit to 10 seconds for reasonable file size
      const frameInterval = 1 / fps;
      
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      
      const frames = [];
      const maxFrames = Math.min(100, Math.ceil(duration * fps));
      
      for (let time = 0; time < duration; time += frameInterval) {
        video.currentTime = time;
        await new Promise(resolve => {
          video.onseeked = resolve;
        });
        
        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = targetWidth;
        frameCanvas.height = targetHeight;
        const frameCtx = frameCanvas.getContext('2d');
        frameCtx.drawImage(canvas, 0, 0);
        frames.push(frameCanvas);
        
        setProcessingProgress(5 + (frames.length / maxFrames) * 45);
        
        if (frames.length >= 100) break; // Limit frames
      }
      
      const GIF = window.GIF;
      const gif = new GIF({
        workers: 4,
        quality: 5, // Better quality for smoother appearance
        width: targetWidth,
        height: targetHeight,
        workerScript: workerBlobUrl,
        repeat: 0,
        dither: false,
      });
      
      for (const frame of frames) {
        gif.addFrame(frame, { delay: Math.round(frameInterval * 1000), copy: true });
      }
      
      setProcessingProgress(60);
      
      const gifBlob = await new Promise((resolve, reject) => {
        gif.on('finished', resolve);
        gif.on('error', reject);
        gif.on('progress', (p) => setProcessingProgress(60 + p * 35));
        gif.render();
      });
      
      setProcessingProgress(100);
      
      const compressedUrl = URL.createObjectURL(gifBlob);
      setCompressedPreview(compressedUrl);
      setCompressedSize(gifBlob.size);
      setCompressedBlob(gifBlob);
      setProcessed(true);
      setOutputFormat('gif');
      
      // Update filename extension to .gif
      const nameWithoutExt = editableFilename.split('.').slice(0, -1).join('.') || editableFilename;
      setEditableFilename(`${nameWithoutExt}.gif`);
      
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
        fileFormat: 'gif',
        originalFileFormat: originalFormat
      });
      
      toast.success('Video converted to GIF!');
    } catch (error) {
      console.error('Video to GIF conversion failed:', error);
      throw error;
    }
  };

  const convertGifToMp4 = async () => {
    try {
      setProcessingProgress(5);
      
      // Parse GIF frames
      const response = await fetch(preview);
      const arrayBuffer = await response.arrayBuffer();
      const { parseGIF, decompressFrames } = await import('https://cdn.jsdelivr.net/npm/gifuct-js@2.1.2/+esm');
      const gif = parseGIF(arrayBuffer);
      const frames = decompressFrames(gif, true);
      
      if (!frames || frames.length === 0) {
        throw new Error('Failed to parse GIF frames');
      }
      
      // Ensure dimensions are even
      let width = Math.floor(frames[0].dims.width / 2) * 2;
      let height = Math.floor(frames[0].dims.height / 2) * 2;
      
      // Determine appropriate AVC codec level based on resolution
      const pixelCount = width * height;
      let codecString;
      
      if (pixelCount <= 921600) { // Up to 1280x720 (HD)
        codecString = 'avc1.42E01F'; // Level 3.1
      } else if (pixelCount <= 2097152) { // Up to 2048x1024
        codecString = 'avc1.640028'; // High Profile, Level 4.0
      } else if (pixelCount <= 8847360) { // Up to 4096x2160 (4K)
        codecString = 'avc1.640033'; // High Profile, Level 5.1
      } else {
        codecString = 'avc1.640034'; // High Profile, Level 5.2 (8K)
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false });
      
      // Import mp4-muxer
      const { Muxer, ArrayBufferTarget } = await import('https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/+esm');
      
      const target = new ArrayBufferTarget();
      
      // Calculate average FPS from GIF frame delays for smooth playback
      const avgDelay = frames.reduce((sum, f) => sum + (f.delay || 100), 0) / frames.length;
      const fps = Math.round(1000 / avgDelay); // Convert delay (ms) to FPS
      
      const muxer = new Muxer({
        target,
        video: {
          codec: 'avc',
          width,
          height,
          frameRate: fps,
        },
        fastStart: 'in-memory',
      });
      
      const videoEncoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => {
          console.error('Encoder error:', e);
          throw new Error(`GIF encoding failed: ${e.message}`);
        },
      });
      
      if (!('VideoEncoder' in window)) {
        throw new Error('VideoEncoder not supported in this browser');
      }
      
      videoEncoder.configure({
        codec: codecString,
        width,
        height,
        bitrate: 1_000_000,
        framerate: fps,
      });
      
      // Encode frames
      try {
        let timestamp = 0;
        for (let i = 0; i < frames.length; i++) {
          // Check encoder state
          if (videoEncoder.state === 'closed') {
            throw new Error('Encoder was closed unexpectedly');
          }

          const frame = frames[i];

          // Create image data from frame
          const imageData = ctx.createImageData(frame.dims.width, frame.dims.height);
          imageData.data.set(frame.patch);

          // Clear canvas and draw frame
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, width, height);
          ctx.putImageData(imageData, frame.dims.left || 0, frame.dims.top || 0);

          const videoFrame = new VideoFrame(canvas, {
            timestamp: timestamp,
          });

          if (videoEncoder.state === 'configured') {
            videoEncoder.encode(videoFrame, { keyFrame: i % 30 === 0 });
          }

          videoFrame.close();

          timestamp += (frame.delay || 100) * 1000; // Convert ms to microseconds

          // Update progress based on frames processed
          const progress = Math.min(90, 5 + (i / frames.length) * 85);
          setProcessingProgress(progress);
        }
        
        // Ensure all frames are encoded
        if (videoEncoder.state === 'configured') {
          await videoEncoder.flush();
        }
      } finally {
        // Always close encoder
        if (videoEncoder.state !== 'closed') {
          videoEncoder.close();
        }
      }
      
      muxer.finalize();
      
      const mp4Buffer = target.buffer;
      const blob = new Blob([mp4Buffer], { type: 'video/mp4' });
      const compressedUrl = URL.createObjectURL(blob);
      
      setCompressedPreview(compressedUrl);
      setCompressedSize(blob.size);
      setCompressedBlob(blob);
      setProcessed(true);
      setOutputFormat('mp4');

      // Update filename extension to .mp4
      const nameWithoutExt = editableFilename.split('.').slice(0, -1).join('.') || editableFilename;
      setEditableFilename(`${nameWithoutExt}.mp4`);

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
        fileFormat: 'mp4',
        originalFileFormat: originalFormat
      });

      toast.success('GIF converted to MP4!');
    } catch (error) {
      console.error('GIF to MP4 conversion failed:', error);
      toast.error(`GIF conversion failed: ${error.message || 'Unknown error'}`);
      setProcessing(false);
      throw error;
    }
  };

  const processGif = async () => {
    try {
      if (!gifJsLoaded || !window.GIF || !workerBlobUrl) {
        toast.error('GIF processor still loading. Please wait...');
        return;
      }
      setProcessingProgress(5);
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
          fileFormat: 'gif',
          originalFileFormat: originalFormat
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
        
        setProcessingProgress(5 + (i / maxFrames) * 45);
        
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
          // Preserve original frame timing exactly
          const originalDelay = frame.delay || 10;
          const delayMs = Math.max(20, originalDelay * 10); // Minimum 20ms for smooth playback
          processedFrames.push({ canvas: outputCanvas, delay: delayMs });
        } catch (err) {
          console.error(`Frame ${i} error:`, err);
        }
      }
      if (processedFrames.length === 0) throw new Error('No frames processed');
      const GIF = window.GIF;
      // Map user quality to gif.js quality (1=best/largest, 10=worst/smallest)
      // Default 85% -> gif.js 7 for good compression
      // Lower user quality = higher gif.js number = more compression
      const gifQuality = Math.max(1, Math.min(10, Math.round((100 - quality) / 10)));

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
      
      setProcessingProgress(60);
      
      const gifBlob = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 300000);
        gif.on('finished', (blob) => { clearTimeout(timeout); resolve(blob); });
        gif.on('error', (error) => { clearTimeout(timeout); reject(error); });
        gif.on('progress', (p) => setProcessingProgress(60 + p * 35));
        gif.render();
      });
      
      setProcessingProgress(100);
      if (!gifBlob || gifBlob.size === 0) throw new Error('Encoding failed');

      // If compressed is larger than original, use original instead
      if (gifBlob.size >= originalBlob.size) {
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
          fileFormat: 'gif',
          originalFileFormat: originalFormat
        });
        toast.info('GIF already optimized - using original');
        return;
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
        compressedUrl: compressedUrl,
        originalSize: image.size,
        compressedSize: gifBlob.size,
        format: 'gif',
        filename: getOutputFilename('gif'),
        mediaType: 'image',
        fileFormat: 'gif',
        originalFileFormat: originalFormat
      });
      const savings = ((1 - gifBlob.size / image.size) * 100).toFixed(1);
      toast.success(`✨ GIF optimized! ${processedFrames.length} frames • Saved ${savings}%`);
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
        setOutputGifFrameCount(gifFrameCount);
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
          fileFormat: 'gif',
          originalFileFormat: originalFormat
        });
        toast.warning('Using original GIF');
      } catch (fallbackError) {
        throw error;
      }
    }
  };

  const processStaticImage = async () => {
    setProcessingProgress(10);
    const img = new Image();
    img.src = preview;
    await new Promise((resolve) => { img.onload = resolve; });
    setProcessingProgress(20);
    const canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;

    // Apply user-selected dimension settings
    if (enableUpscale && upscaleMultiplier) {
      // Using multiplier percentage
      width = Math.round(img.width * (upscaleMultiplier / 100));
      height = Math.round(img.height * (upscaleMultiplier / 100));
    } else if ((maxWidth && maxHeight) && useStandardResolutions) {
      // EXACT dimensions when Standard Resolutions is enabled
      width = maxWidth;
      height = maxHeight;
    } else if (maxWidth && maxHeight) {
      // Both dimensions set but maintaining aspect ratio
      const aspectRatio = width / height;
      const widthRatio = maxWidth / img.width;
      const heightRatio = maxHeight / img.height;
      const ratio = enableUpscale ? Math.max(widthRatio, heightRatio) : Math.min(widthRatio, heightRatio);
      width = Math.round(img.width * ratio);
      height = Math.round(img.height * ratio);
    } else if (maxWidth) {
      // Only width specified - maintain aspect ratio
      const aspectRatio = width / height;
      if (enableUpscale || maxWidth < width) {
        width = maxWidth;
        height = Math.round(maxWidth / aspectRatio);
      }
    } else if (maxHeight) {
      // Only height specified - maintain aspect ratio
      const aspectRatio = width / height;
      if (enableUpscale || maxHeight < height) {
        height = maxHeight;
        width = Math.round(maxHeight * aspectRatio);
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
    
    setProcessingProgress(40);

    // Use browser-image-compression for better PNG handling
    if (format === 'png') {
      try {
        setProcessingProgress(50);

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
        
        setProcessingProgress(100);

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
            fileFormat: format,
            originalFileFormat: originalFormat
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
          fileFormat: format,
          originalFileFormat: originalFormat
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
      setProcessingProgress(40 + ((attempts + 1) / maxAttempts) * 55);
      if (enableUpscale || (blob && blob.size < image.size) || attempts === maxAttempts - 1) break;
      qualityValue -= compressionMode === 'maximum' ? 0.2 : 0.15;
      attempts++;
    }
    
    setProcessingProgress(100);
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
        fileFormat: format,
        originalFileFormat: originalFormat
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
      fileFormat: format,
      originalFileFormat: originalFormat
    });
  };

  const processImageToAnimation = async () => {
    if (!gifJsLoaded || !window.GIF || !workerBlobUrl) {
      toast.error('Animation library not ready. Please wait...');
      return;
    }
    try {
      setProcessingProgress(5);
      const img = new Image();
      img.src = preview;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
      });
      
      // Apply user's dimension settings (upscale/resize)
      let width = img.width;
      let height = img.height;

      if (enableUpscale && upscaleMultiplier) {
        // Using multiplier percentage
        width = Math.round(img.width * (upscaleMultiplier / 100));
        height = Math.round(img.height * (upscaleMultiplier / 100));
      } else if ((maxWidth && maxHeight) && useStandardResolutions) {
        // EXACT dimensions when Standard Resolutions is enabled
        width = maxWidth;
        height = maxHeight;
      } else if (maxWidth && maxHeight) {
        // Both dimensions set but maintaining aspect ratio
        const aspectRatio = width / height;
        const widthRatio = maxWidth / img.width;
        const heightRatio = maxHeight / img.height;
        const ratio = enableUpscale ? Math.max(widthRatio, heightRatio) : Math.min(widthRatio, heightRatio);
        width = Math.round(img.width * ratio);
        height = Math.round(img.height * ratio);
      } else if (maxWidth) {
        // Only width specified - maintain aspect ratio
        const aspectRatio = width / height;
        if (enableUpscale || maxWidth < width) {
          width = maxWidth;
          height = Math.round(maxWidth / aspectRatio);
        }
      } else if (maxHeight) {
        // Only height specified - maintain aspect ratio
        const aspectRatio = width / height;
        if (enableUpscale || maxHeight < height) {
          height = maxHeight;
          width = Math.round(maxHeight * aspectRatio);
        }
      } else {
        // Default: cap at 800px for reasonable file size
        if (img.width > 800 || img.height > 800) {
          const ratio = Math.min(800 / img.width, 800 / img.height);
          width = Math.round(img.width * ratio);
          height = Math.round(img.height * ratio);
        }
      }
      
      // Ensure even dimensions for GIF encoding
      width = width % 2 === 0 ? width : width - 1;
      height = height % 2 === 0 ? height : height - 1;
      const totalFrames = 120;
      const frames = [];
      for (let i = 0; i < totalFrames; i++) {
        setProcessingProgress(5 + (i / totalFrames) * 45);
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
      
      // Apply user's quality setting (1-10 scale for GIF, lower is better quality but larger file)
      const gifQuality = Math.round((100 - quality) / 10); // Convert 0-100 to 10-0 scale
      
      const gif = new GIF({
        workers: 4,
        quality: Math.max(1, Math.min(10, gifQuality)), // Clamp between 1-10
        width,
        height,
        workerScript: workerBlobUrl,
        repeat: 0,
        dither: false
      });
      const frameDelay = Math.round((animationDuration * 1000) / totalFrames);
      setProcessingProgress(55);
      for (const canvas of frames) {
        gif.addFrame(canvas, { delay: frameDelay, copy: true, dispose: 2 });
      }
      const gifBlob = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 180000);
        gif.on('finished', (blob) => { clearTimeout(timeout); resolve(blob); });
        gif.on('error', (err) => { clearTimeout(timeout); reject(err); });
        gif.on('progress', (p) => setProcessingProgress(55 + p * 40));
        gif.render();
      });
      
      setProcessingProgress(100);
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
        originalFileFormat: originalFormat,
        animations: [animationData]
      });
      toast.success(`Animation created! (${totalFrames} frames)`);
    } catch (error) {
      console.error('❌ Animation failed:', error);
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
  const displayFormat = outputFormat || format;
  const displayCompressedExt = displayFormat.toUpperCase();
  let availableFormats = [];
  if (isImage && !isGif) availableFormats = enableAnimation ? ['gif'] : ['jpg', 'png', 'webp', 'avif'];
  else if (isGif) availableFormats = ['gif', 'mp4'];
  else if (isVideo) availableFormats = ['mp4', 'gif'];
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

  const downloadMedia = async () => {
    if (!compressedBlob && generatedAnimations.length === 0) {
      toast.error("No processed file available for download.");
      return;
    }
    
    // If we have generated animations, download them all as ZIP
    if (generatedAnimations.length > 0) {
      await downloadAllAnimationsAsZip();
      return;
    }
    
    // Otherwise, download the compressed file with current settings
    const mediaType = isVideo ? 'video' : isAudio ? 'audio' : 'image';
    const currentCompressedFormat = outputFormat || format;
    performSingleMediaDownload(compressedBlob, currentCompressedFormat, mediaType, getOutputFilename(currentCompressedFormat));
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
        fileFormat: outputFormat || format,
        originalFileFormat: originalFormat
      });
    }
  };

  const handleEditImage = () => setShowEditor(true);
  
  const handleEditVideo = () => setShowVideoEditor(true);
  
  const handleSaveVideoEdit = (newBlob) => {
    const newUrl = URL.createObjectURL(newBlob);
    setPreview(newUrl);
    setOriginalSize(newBlob.size);
    setProcessed(false);
    setCompressedPreview(null);
    setCompressedSize(0);
    setError(null);
    setShowVideoEditor(false);
    toast.success("Video edited successfully. Re-process to apply compression.");
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
    
    if (enableAnimation && newFormat !== 'gif') {
      toast.error('Cannot convert format while animation is enabled.');
      return;
    }
    
    // Video/audio/GIF just change format selection - user must click Reprocess
    if (isVideo || isAudio || isGif) {
      setFormat(newFormat);
      return;
    }
    
    // For images, check if already in format
    if (newFormat === (outputFormat || format)) {
      toast.info(`Already in ${newFormat.toUpperCase()} format.`);
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      // ALWAYS load from original preview for consistent compression
      const img = new Image();
      img.src = preview; // Use original, not compressed
      await new Promise((resolve) => { img.onload = resolve; });
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      // Apply noise reduction if enabled
      if (noiseReduction) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
      ctx.drawImage(img, 0, 0);
      
      // Use advanced PNG compression for PNG format
      if (newFormat === 'png') {
        try {
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

          const canvasBlob = await new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/png');
          });

          const options = {
            maxSizeMB: Math.max(0.1, (canvasBlob.size / 1024 / 1024) * (quality / 100)),
            maxWidthOrHeight: Math.max(canvas.width, canvas.height),
            useWebWorker: true,
            fileType: 'image/png',
            initialQuality: quality / 100
          };

          const compressedFile = await window.imageCompression(canvasBlob, options);
          
          const url = URL.createObjectURL(compressedFile);
          setCompressedPreview(url);
          setCompressedSize(compressedFile.size);
          setCompressedBlob(compressedFile);
          setOutputFormat(newFormat);
          setFormat(newFormat);
          onProcessed({
            id: image.name,
            originalFile: image,
            compressedBlob: compressedFile,
            compressedUrl: url,
            originalSize: originalSize,
            compressedSize: compressedFile.size,
            format: newFormat,
            filename: getOutputFilename(newFormat),
            mediaType: 'image',
            fileFormat: newFormat,
            originalFileFormat: originalFormat
          });
          
          const savings = ((1 - compressedFile.size / originalSize) * 100).toFixed(1);
          toast.success(`Converted to PNG (${savings}% savings)`);
          setProcessing(false);
          return;
        } catch (error) {
          console.warn('PNG advanced compression failed, using standard:', error);
          // Fall through to standard compression
        }
      }
      
      // Standard compression with aggressive quality for other formats
      const mimeType = newFormat === 'jpg' ? 'image/jpeg' : `image/${newFormat}`;
      let baseQuality = quality / 100;
      
      // Apply compression mode adjustments
      if (compressionMode === 'aggressive') baseQuality = Math.max(0.5, baseQuality - 0.15);
      else if (compressionMode === 'maximum') baseQuality = Math.max(0.3, baseQuality - 0.3);
      
      let qualityValue = baseQuality;
      let blob = null;
      let attempts = 0;
      const maxAttempts = compressionMode === 'aggressive' || compressionMode === 'maximum' ? 8 : 5;
      
      // Try multiple quality levels to get best compression
      while (attempts < maxAttempts) {
        blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), mimeType, qualityValue));
        if ((blob && blob.size < originalSize) || attempts === maxAttempts - 1) break;
        qualityValue -= compressionMode === 'maximum' ? 0.2 : 0.15;
        attempts++;
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
        fileFormat: newFormat,
        originalFileFormat: originalFormat
      });
      
      const savings = ((1 - blob.size / originalSize) * 100).toFixed(1);
      if (blob.size < originalSize) toast.success(`Converted to ${newFormat.toUpperCase()} (${savings}% savings)`);
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
    <Card className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow relative">
      {/* Header with close button and media type */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-start gap-2">
          {MediaIcon && <MediaIcon className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />}
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {isVideo ? 'Video' : isAudio ? 'Audio' : isGif ? 'GIF' : isImage ? 'Image' : 'File'}
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

      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 sm:p-4 bg-slate-50 dark:bg-slate-950">
          {preview && (
            <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 cursor-pointer group" onClick={(isImage || isGif) && processed ? handleCompare : undefined}>
              {isImage ? <LazyImage src={preview} alt="Original" className="w-full h-full object-cover transition-transform group-hover:scale-105" /> : isVideo ? (
                <>
                  <video src={preview} controls loop className="w-full h-full object-cover" />
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditVideo(); }} className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 h-7 w-7 rounded-lg">
                    <Edit2 className="w-3 h-3" />
                  </Button>
                </>
              ) : isAudio ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <Music className="w-16 h-16 text-slate-400 mb-2" />
                  <audio src={preview} controls className="w-full" />
                </div>
              ) : null}
              <Badge className="absolute top-2 left-2 bg-slate-900/80 text-white">Original</Badge>
              <Badge className="absolute bottom-2 right-2 bg-slate-900/95 backdrop-blur-sm text-white border border-slate-700 text-xs px-2 py-1 font-bold shadow-lg">{originalExt}</Badge>
              {isGif && gifFrameCount > 0 && (
                <Badge className="absolute bottom-2 left-2 bg-slate-900/95 backdrop-blur-sm text-white border border-slate-700 text-xs px-2 py-1 font-bold shadow-lg">{gifFrameCount} frames</Badge>
              )}
              {isImage && !isGif && (
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditImage(); }} className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 h-7 w-7 rounded-lg">
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}
              {isGif && (
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setShowGifEditor(true); }} className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 h-7 w-7 rounded-lg">
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
          {compressedPreview ? (
            <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 cursor-pointer group" onClick={(isImage || isGif || outputFormat === 'gif') ? handleCompare : undefined}>
              {(isImage || outputFormat === 'gif') ? <LazyImage src={compressedPreview} alt="Compressed" className="w-full h-full object-cover transition-transform group-hover:scale-105" /> : (isVideo && outputFormat !== 'gif') ? <video src={compressedPreview} controls loop className="w-full h-full object-cover" /> : isAudio ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <Music className="w-16 h-16 text-emerald-500 mb-2" />
                  <audio src={compressedPreview} controls className="w-full" />
                </div>
              ) : null}
              <Badge className="absolute top-2 left-2 bg-emerald-600 text-white">Optimized</Badge>
              <Badge className="absolute bottom-2 right-2 bg-emerald-600/95 backdrop-blur-sm text-white border border-emerald-500 text-xs px-2 py-1 font-bold shadow-lg">{displayCompressedExt}</Badge>
              {isGif && outputGifFrameCount > 0 && (
                <Badge className="absolute bottom-2 left-2 bg-emerald-600/95 backdrop-blur-sm text-white border border-emerald-500 text-xs px-2 py-1 font-bold shadow-lg">{outputGifFrameCount} frames</Badge>
              )}
            </div>
          ) : (
            <div className="aspect-square rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <p className="text-sm text-slate-400 text-center px-2">Preview after Optimizing Asset</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
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

          <div className="grid grid-cols-2 gap-2 mt-2 sm:mt-3">
            <Button variant="outline" size="sm" onClick={extractMetadata} className="justify-center text-xs">
              <Info className="w-3 h-3 mr-1" /> <span className="hidden sm:inline">Metadata</span><span className="sm:hidden">Info</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSocialShare(true)}
              className="justify-center text-xs"
            >
              <Share2 className="w-3 h-3 mr-1" /> <span className="hidden sm:inline">Share</span>
            </Button>
          </div>

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
              <div className={cn("grid gap-2", availableFormats.length === 1 ? "grid-cols-1" : availableFormats.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4")}>
                {availableFormats.map((fmt) => (
                  <Button key={fmt} size="sm" variant={format === fmt ? "default" : "outline"} onClick={() => convertFormat(fmt)} disabled={processing} className={cn("relative text-xs h-8 sm:h-9", format === fmt && "bg-emerald-600 hover:bg-emerald-700")}>
                    {fmt.toUpperCase()}
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
              <div className={cn("grid gap-2", availableFormats.length === 1 ? "grid-cols-1" : availableFormats.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4")}>
                {availableFormats.map((fmt) => (
                  <Button key={fmt} size="sm" variant={format === fmt ? "default" : "outline"} onClick={() => setFormat(fmt)} disabled={processing} className={cn("relative text-xs h-8 sm:h-9", format === fmt && "bg-emerald-600 hover:bg-emerald-700")}>
                    {fmt.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {isImage && !isGif && !enableAnimation && (
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
          )}

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
                      <div className="bg-slate-100 border border-slate-200 dark:border-transparent dark:bg-slate-950 rounded-lg p-3 space-y-2">
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
                                  // If Standard Resolutions is enabled and both dimensions are set, use exact values
                                  if (useStandardResolutions && maxWidth && maxHeight) {
                                    return `${maxWidth} × ${maxHeight}`;
                                  }
                                  
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
                          <Button key={multiplier} size="sm" variant={upscaleMultiplier === multiplier ? "default" : "outline"} onClick={() => { 
                            if (upscaleMultiplier === multiplier) {
                              // Deselect if clicking the same option
                              setUpscaleMultiplier(null);
                            } else {
                              setUpscaleMultiplier(multiplier); 
                              setMaxWidth(null); 
                              setMaxHeight(null);
                            }
                          }} disabled={processing} className={cn("text-xs h-9", upscaleMultiplier === multiplier && "bg-emerald-600 hover:bg-emerald-700")}>
                            {multiplier}%
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Resolution Presets</label>
                          <Tooltip>
                            <TooltipTrigger asChild><Info className="w-3 h-3 text-slate-400 cursor-help" /></TooltipTrigger>
                            <TooltipContent className="max-w-xs"><p className="text-xs">Quick resolution presets. Maintains your image's aspect ratio.</p></TooltipContent>
                          </Tooltip>
                        </div>
                        {originalImageDimensions.width > 0 && originalImageDimensions.height > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {getAspectRatio(originalImageDimensions.width, originalImageDimensions.height)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Standard Resolutions</label>
                          <Tooltip>
                            <TooltipTrigger asChild><Info className="w-3 h-3 text-slate-400 cursor-help" /></TooltipTrigger>
                            <TooltipContent className="max-w-xs"><p className="text-xs">Enable to use exact standard resolutions (e.g., 3840x2160 for 4K 16:9). Disable to maintain your image's exact aspect ratio.</p></TooltipContent>
                          </Tooltip>
                        </div>
                        <Switch 
                          checked={useStandardResolutions} 
                          onCheckedChange={setUseStandardResolutions}
                          disabled={processing}
                        />
                      </div>
                      <div className="grid grid-cols-5 gap-2 mb-3">
                        {[
                          { label: '480p', height: 480, standardRes: { '16:9': [854, 480], '9:16': [480, 854], '4:3': [640, 480], '1:1': [480, 480] } },
                          { label: '720p', height: 720, standardRes: { '16:9': [1280, 720], '9:16': [720, 1280], '4:3': [960, 720], '1:1': [720, 720] } },
                          { label: '1080p', height: 1080, standardRes: { '16:9': [1920, 1080], '9:16': [1080, 1920], '4:3': [1440, 1080], '1:1': [1080, 1080] } },
                          { label: '4K', height: 2160, standardRes: { '16:9': [3840, 2160], '9:16': [2160, 3840], '4:3': [2880, 2160], '1:1': [2160, 2160] } },
                          { label: '8K', height: 4320, standardRes: { '16:9': [7680, 4320], '9:16': [4320, 7680], '4:3': [5760, 4320], '1:1': [4320, 4320] } }
                        ].map((preset) => (
                          <Button
                            key={preset.label}
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (originalImageDimensions.width > 0 && originalImageDimensions.height > 0) {
                                // Calculate what dimensions this preset would set
                                let targetWidth, targetHeight;
                                if (useStandardResolutions) {
                                  const aspectRatio = originalImageDimensions.width / originalImageDimensions.height;
                                  let resolution;
                                  if (Math.abs(aspectRatio - 1) < 0.1) resolution = preset.standardRes['1:1'];
                                  else if (Math.abs(aspectRatio - 16/9) < 0.1) resolution = preset.standardRes['16:9'];
                                  else if (Math.abs(aspectRatio - 9/16) < 0.1) resolution = preset.standardRes['9:16'];
                                  else if (Math.abs(aspectRatio - 4/3) < 0.1) resolution = preset.standardRes['4:3'];
                                  else resolution = preset.standardRes['16:9'];
                                  targetWidth = resolution[0];
                                  targetHeight = resolution[1];
                                } else {
                                  const aspectRatio = originalImageDimensions.width / originalImageDimensions.height;
                                  targetHeight = preset.height;
                                  targetWidth = Math.round(targetHeight * aspectRatio);
                                }
                                
                                // Check if this preset is already selected
                                if (maxWidth === targetWidth && maxHeight === targetHeight) {
                                  // Deselect - clear dimensions
                                  setMaxWidth(null);
                                  setMaxHeight(null);
                                  setLastPresetSelected(null);
                                } else {
                                  // Select this preset
                                  setLastPresetSelected(preset);
                                  setMaxWidth(targetWidth);
                                  setMaxHeight(targetHeight);
                                  setUpscaleMultiplier(null);
                                }
                              }
                            }}
                            disabled={processing}
                            className="text-xs h-9"
                          >
                            {preset.label}
                          </Button>
                        ))}
                      </div>
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
                  <span className="flex items-center gap-2"><Wand2 className="w-4 h-4" />Animate Settings {!gifJsLoaded && enableAnimation && <span className="text-xs text-slate-500">(Loading...)</span>}</span>
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

          <div className="flex flex-col sm:flex-row gap-2">
            {!processed ? (
              <Button onClick={processMedia} disabled={processing || (((isGif && format === 'gif') || (isImage && !isGif && enableAnimation)) && !gifJsLoaded)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white relative overflow-hidden text-sm">
                {processing && <div className="absolute inset-0 bg-emerald-500 transition-all duration-300 ease-linear" style={{ width: `${processingProgress}%`, left: 0 }} />}
                <span className="relative z-10 flex items-center justify-center">
                  {processing ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /><span className="hidden sm:inline">Optimizing... {Math.round(processingProgress)}%</span><span className="sm:hidden">{Math.round(processingProgress)}%</span></>) : (<>{MediaIcon && <MediaIcon className="w-4 h-4 mr-2" />}<span className="hidden sm:inline">{enableAnimation ? 'Create Animation' : 'Optimize Asset'}</span><span className="sm:hidden">Optimize</span></>)}
                </span>
              </Button>
            ) : (
              <>
                <Button 
                  onClick={processMedia} 
                  variant={settingsChanged ? "default" : "outline"} 
                  className={cn(
                    "flex-1 text-sm relative overflow-hidden transition-all duration-300",
                    settingsChanged && "bg-red-600 hover:bg-red-700 text-white"
                  )} 
                  disabled={processing || (((isGif && format === 'gif') || (isImage && !isGif && enableAnimation)) && !gifJsLoaded)}
                >
                  {processing && <div className="absolute inset-0 bg-emerald-500 transition-all duration-300 ease-linear" style={{ width: `${processingProgress}%`, left: 0 }} />}
                  <span className="relative z-10 flex items-center justify-center">
                    <RefreshCcw className={cn("w-4 h-4 mr-2 transition-all duration-700", processing && "animate-spin", settingsChanged && !processing && "animate-[spin_15s_ease-in-out_infinite]")} />
                    <span className="hidden sm:inline">{processing ? `${Math.round(processingProgress)}%` : 'Reprocess'}</span>
                    <span className="sm:hidden">{processing ? `${Math.round(processingProgress)}%` : 'Reprocess'}</span>
                  </span>
                </Button>
                <Button onClick={() => downloadMedia()} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm" disabled={processing}>
                  <Download className="w-4 h-4 mr-2" /><span className="hidden sm:inline">Download</span>
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
      {showVideoEditor && isVideo && <VideoEditor isOpen={showVideoEditor} onClose={() => setShowVideoEditor(false)} videoData={preview} onSave={handleSaveVideoEdit} />}
      <SocialShareModal
        isOpen={showSocialShare}
        onClose={() => setShowSocialShare(false)}
        imageUrl={compressedPreview}
        fileName={getOutputFilename()}
      />
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