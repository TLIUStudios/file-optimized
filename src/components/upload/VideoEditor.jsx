import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scissors, Type, Sun, Contrast, Droplet, X, Play, Pause, Undo, Redo, Subtitles, Wand2, Volume2, Music, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function VideoEditor({ isOpen, onClose, videoData, onSave }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [textOverlay, setTextOverlay] = useState("");
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [textColor, setTextColor] = useState("#ffffff");
  const [textSize, setTextSize] = useState(32);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [captions, setCaptions] = useState([]);
  const [captionStyle, setCaptionStyle] = useState("modern");
  const [showCaptions, setShowCaptions] = useState(false);
  const [generatingCaptions, setGeneratingCaptions] = useState(false);
  const [volume, setVolume] = useState(100);
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [musicVolume, setMusicVolume] = useState(50);
  const [noiseReduction, setNoiseReduction] = useState(false);
  const [audioNormalization, setAudioNormalization] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [thumbnails, setThumbnails] = useState([]);
  const [generatingThumbnails, setGeneratingThumbnails] = useState(false);
  const [cutRanges, setCutRanges] = useState([]);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);

  // History management
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyTimeoutRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current || !videoData || !isOpen) return;
    
    const video = videoRef.current;
    
    video.src = videoData;
    video.load();
    
    const handleMetadataLoaded = () => {
      console.log('Video loaded:', video.duration, 'seconds');
      setDuration(video.duration);
      setTrimEnd(video.duration);
      generateThumbnails(video);
      
      // Save initial state immediately (no debounce)
      const initialState = {
        trimStart: 0,
        trimEnd: video.duration,
        textOverlay: "",
        textPosition: { x: 50, y: 50 },
        textColor: "#ffffff",
        textSize: 32,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        captions: [],
        captionStyle: "modern",
        showCaptions: false,
        volume: 100,
        backgroundMusic: null,
        musicVolume: 50,
        noiseReduction: false,
        audioNormalization: false,
        cutRanges: [],
        fadeIn: 0,
        fadeOut: 0,
      };
      setHistory([initialState]);
      setHistoryIndex(0);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleError = (e) => {
      console.error('Video load error:', e);
      toast.error('Failed to load video');
    };
    
    video.addEventListener('loadedmetadata', handleMetadataLoaded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleError);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleMetadataLoaded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleError);
    };
  }, [videoData, isOpen]);

  const addCaption = () => {
    const newCaption = {
      text: "New caption",
      startTime: currentTime,
      endTime: currentTime + 3,
    };
    setCaptions([...captions, newCaption]);
    setShowCaptions(true);
    saveToHistory();
    toast.success("Caption added!");
  };

  const deleteCaption = (index) => {
    const newCaptions = captions.filter((_, i) => i !== index);
    setCaptions(newCaptions);
    saveToHistory();
    toast.success("Caption deleted!");
  };

  const generateCaptions = async () => {
    setGeneratingCaptions(true);
    setTranscriptionProgress(0);
    
    try {
      const response = await fetch(videoData);
      const videoBlob = await response.blob();
      
      // Use the actual blob type from the video
      const file = new File([videoBlob], 'video.mp4', { 
        type: videoBlob.type || 'video/mp4' 
      });
      
      setTranscriptionProgress(10);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setTranscriptionProgress(30);
      
      // Simulate progress during AI processing
      const progressInterval = setInterval(() => {
        setTranscriptionProgress(prev => Math.min(prev + 5, 90));
      }, 2000);
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Transcribe this video's spoken audio into captions with timestamps.

Output format (JSON only, no markdown):
{
  "captions": [
    {"text": "words spoken here", "startTime": 0, "endTime": 2.5}
  ]
}

Rules:
- Short captions (4-8 words each)
- Natural speaking pace (~2.5 words/second)
- Start from 0 seconds
- Empty array if no speech`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            captions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  startTime: { type: "number" },
                  endTime: { type: "number" }
                }
              }
            }
          }
        }
      });
      
      clearInterval(progressInterval);
      setTranscriptionProgress(100);
      
      console.log("Transcription result:", result);
      
      if (!result?.captions || result.captions.length === 0) {
        toast.error("No speech detected in video");
        setTranscriptionProgress(null);
        return;
      }
      
      setCaptions(result.captions);
      setShowCaptions(true);
      saveToHistory();
      
      toast.success(`Generated ${result.captions.length} captions!`);
      setTimeout(() => setTranscriptionProgress(null), 1000);
      
    } catch (error) {
      console.error("Transcription error:", error);
      toast.error(`Transcription failed: ${error.message || 'Unknown error'}`);
      setTranscriptionProgress(null);
    } finally {
      setGeneratingCaptions(false);
    }
  };

  const handleMusicUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload an audio file');
      return;
    }
    
    const url = URL.createObjectURL(file);
    setBackgroundMusic(url);
    toast.success('Background music added!');
  };

  const captionTemplates = {
    modern: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 42,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      borderRadius: 8,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    minimal: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 36,
      fontWeight: 'normal',
      color: '#ffffff',
      backgroundColor: 'transparent',
      padding: 8,
      borderRadius: 0,
      textTransform: 'none',
      letterSpacing: 0,
      textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9)',
    },
    bold: {
      fontFamily: 'Impact, sans-serif',
      fontSize: 48,
      fontWeight: 'bold',
      color: '#ffff00',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      padding: 16,
      borderRadius: 12,
      textTransform: 'uppercase',
      letterSpacing: 2,
      border: '3px solid #ffffff',
    },
    elegant: {
      fontFamily: 'Georgia, serif',
      fontSize: 38,
      fontWeight: 'normal',
      color: '#f0f0f0',
      backgroundColor: 'rgba(20, 20, 20, 0.85)',
      padding: 14,
      borderRadius: 6,
      textTransform: 'capitalize',
      letterSpacing: 0.5,
      fontStyle: 'italic',
    },
    neon: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: 44,
      fontWeight: 'bold',
      color: '#00ffff',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: 12,
      borderRadius: 10,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff',
    },
  };

  const saveToHistory = () => {
    // Clear any pending timeout
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }

    // Debounce to avoid excessive history entries
    historyTimeoutRef.current = setTimeout(() => {
      const newState = {
        trimStart,
        trimEnd,
        textOverlay,
        textPosition: { ...textPosition },
        textColor,
        textSize,
        brightness,
        contrast,
        saturation,
        blur,
        captions: [...captions],
        captionStyle,
        showCaptions,
        volume,
        backgroundMusic,
        musicVolume,
        noiseReduction,
        audioNormalization,
        cutRanges: [...cutRanges],
        fadeIn,
        fadeOut,
      };

      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newState);
        return newHistory;
      });
      setHistoryIndex(prev => prev + 1);
    }, 300);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      
      // Batch all state updates together
      setTrimStart(state.trimStart);
      setTrimEnd(state.trimEnd);
      setTextOverlay(state.textOverlay);
      setTextPosition(state.textPosition);
      setTextColor(state.textColor);
      setTextSize(state.textSize);
      setBrightness(state.brightness);
      setContrast(state.contrast);
      setSaturation(state.saturation);
      setBlur(state.blur);
      setCaptions(state.captions || []);
      setCaptionStyle(state.captionStyle || "modern");
      setShowCaptions(state.showCaptions || false);
      setVolume(state.volume || 100);
      setBackgroundMusic(state.backgroundMusic || null);
      setMusicVolume(state.musicVolume || 50);
      setNoiseReduction(state.noiseReduction || false);
      setAudioNormalization(state.audioNormalization || false);
      setCutRanges(state.cutRanges || []);
      setFadeIn(state.fadeIn || 0);
      setFadeOut(state.fadeOut || 0);
      setHistoryIndex(newIndex);
      
      toast.success('Undo applied');
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      
      setTrimStart(state.trimStart);
      setTrimEnd(state.trimEnd);
      setTextOverlay(state.textOverlay);
      setTextPosition(state.textPosition);
      setTextColor(state.textColor);
      setTextSize(state.textSize);
      setBrightness(state.brightness);
      setContrast(state.contrast);
      setSaturation(state.saturation);
      setBlur(state.blur);
      setCaptions(state.captions || []);
      setCaptionStyle(state.captionStyle || "modern");
      setShowCaptions(state.showCaptions || false);
      setVolume(state.volume || 100);
      setBackgroundMusic(state.backgroundMusic || null);
      setMusicVolume(state.musicVolume || 50);
      setNoiseReduction(state.noiseReduction || false);
      setAudioNormalization(state.audioNormalization || false);
      setCutRanges(state.cutRanges || []);
      setFadeIn(state.fadeIn || 0);
      setFadeOut(state.fadeOut || 0);
      setHistoryIndex(newIndex);
      
      toast.success('Redo applied');
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (value) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateThumbnails = async (video) => {
    setGeneratingThumbnails(true);
    const thumbCount = 20;
    const interval = video.duration / thumbCount;
    const thumbs = [];
    
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 90;
    const ctx = canvas.getContext('2d');
    
    for (let i = 0; i < thumbCount; i++) {
      const time = i * interval;
      video.currentTime = time;
      
      await new Promise(resolve => {
        video.onseeked = resolve;
      });
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
      thumbs.push({ time, dataUrl });
    }
    
    setThumbnails(thumbs);
    setGeneratingThumbnails(false);
    video.currentTime = 0;
  };

  const applyEdits = async () => {
    setProcessing(true);
    toast.info("Processing video...", { id: "video-edit" });

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      const { Muxer, ArrayBufferTarget } = await import('https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/+esm');

      const target = new ArrayBufferTarget();
      const fps = 30;
      
      const pixelCount = canvas.width * canvas.height;
      let codecString;
      if (pixelCount <= 921600) codecString = 'avc1.42E01F';
      else if (pixelCount <= 2097152) codecString = 'avc1.640028';
      else if (pixelCount <= 8847360) codecString = 'avc1.640033';
      else codecString = 'avc1.640034';

      const muxer = new Muxer({
        target,
        video: {
          codec: 'avc',
          width: canvas.width,
          height: canvas.height,
          frameRate: fps,
        },
        fastStart: 'in-memory',
      });

      const videoEncoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => {
          console.error('Encoder error:', e);
          throw new Error(`Video encoding failed: ${e.message}`);
        },
      });

      videoEncoder.configure({
        codec: codecString,
        width: canvas.width,
        height: canvas.height,
        bitrate: 2_000_000,
        framerate: fps,
      });

      video.currentTime = trimStart;
      await new Promise(resolve => { video.onseeked = resolve; });

      const frameInterval = 1 / fps;
      let frameCount = 0;

      for (let time = trimStart; time < trimEnd; time += frameInterval) {
        video.currentTime = time;
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Seek timeout')), 2000);
          video.onseeked = () => {
            clearTimeout(timeout);
            resolve();
          };
        });

        // Apply filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Add captions
        if (showCaptions && captions.length > 0) {
          ctx.filter = 'none';
          const currentCaption = captions.find(cap => time >= cap.startTime && time <= cap.endTime);
          if (currentCaption) {
            const style = captionTemplates[captionStyle];
            ctx.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const x = canvas.width / 2;
            const y = canvas.height * 0.85;
            const text = style.textTransform === 'uppercase' ? currentCaption.text.toUpperCase() : 
                         style.textTransform === 'capitalize' ? currentCaption.text.charAt(0).toUpperCase() + currentCaption.text.slice(1) :
                         currentCaption.text;
            
            // Measure text
            const metrics = ctx.measureText(text);
            const textWidth = metrics.width;
            const textHeight = style.fontSize;
            
            // Draw background
            if (style.backgroundColor !== 'transparent') {
              ctx.fillStyle = style.backgroundColor;
              ctx.beginPath();
              ctx.roundRect(
                x - textWidth / 2 - style.padding,
                y - textHeight / 2 - style.padding,
                textWidth + style.padding * 2,
                textHeight + style.padding * 2,
                style.borderRadius
              );
              ctx.fill();
              
              if (style.border) {
                ctx.strokeStyle = style.border.split(' ')[2];
                ctx.lineWidth = parseInt(style.border.split(' ')[0]);
                ctx.stroke();
              }
            }
            
            // Draw text
            if (style.textShadow) {
              ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
              ctx.shadowBlur = 6;
              ctx.shadowOffsetX = 3;
              ctx.shadowOffsetY = 3;
            }
            
            ctx.fillStyle = style.color;
            ctx.fillText(text, x, y);
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }
        }

        // Add text overlay
        if (textOverlay) {
          ctx.filter = 'none';
          ctx.font = `bold ${textSize}px Arial`;
          ctx.fillStyle = textColor;
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          const x = (canvas.width * textPosition.x) / 100;
          const y = (canvas.height * textPosition.y) / 100;
          ctx.strokeText(textOverlay, x, y);
          ctx.fillText(textOverlay, x, y);
        }

        const frame = new VideoFrame(canvas, {
          timestamp: frameCount * (1_000_000 / fps),
        });

        if (videoEncoder.state === 'configured') {
          videoEncoder.encode(frame, { keyFrame: frameCount % 30 === 0 });
        }

        frame.close();
        frameCount++;

        if (frameCount % 10 === 0) {
          const progress = ((time - trimStart) / (trimEnd - trimStart)) * 100;
          toast.info(`Processing: ${Math.round(progress)}%`, { id: "video-edit" });
        }
      }

      if (videoEncoder.state === 'configured') {
        await videoEncoder.flush();
      }
      videoEncoder.close();

      muxer.finalize();
      const buffer = target.buffer;
      const blob = new Blob([buffer], { type: 'video/mp4' });

      toast.dismiss("video-edit");
      toast.success("Video edited successfully!");
      onSave(blob);
      onClose();
    } catch (error) {
      console.error("Video editing error:", error);
      toast.dismiss("video-edit");
      toast.error("Failed to edit video: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setTrimStart(0);
    setTrimEnd(duration);
    setTextOverlay("");
    setTextPosition({ x: 50, y: 50 });
    setTextColor("#ffffff");
    setTextSize(32);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    saveToHistory();
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[98vw] h-[98vh] p-0 bg-slate-950 overflow-hidden [&>button]:hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Edit Video</h2>
            <div className="flex items-center gap-1 ml-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={undo}
                disabled={!canUndo}
                className="h-8 w-8 border-slate-700 hover:bg-slate-800"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={redo}
                disabled={!canRedo}
                className="h-8 w-8 border-slate-700 hover:bg-slate-800"
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="hover:bg-red-900/30 hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex h-[calc(98vh-65px)]">
          {/* Main Content - Video + Timeline */}
          <div className="flex-1 flex flex-col bg-slate-900 min-w-0">
            {/* Video Preview Area */}
            <div className="flex items-center justify-center p-4 h-[45vh]">
              <div className="relative max-w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
                  onEnded={() => setIsPlaying(false)}
                  preload="auto"
                  playsInline
                  crossOrigin="anonymous"
                  volume={volume / 100}
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`,
                    imageRendering: 'high-quality'
                  }}
                >
                  <source src={videoData} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Caption Preview */}
                {showCaptions && captions.length > 0 && (() => {
                  const currentCaption = captions.find(cap => currentTime >= cap.startTime && currentTime <= cap.endTime);
                  if (!currentCaption) return null;
                  const style = captionTemplates[captionStyle];
                  const displayText = style.textTransform === 'uppercase' ? currentCaption.text.toUpperCase() : 
                                      style.textTransform === 'capitalize' ? currentCaption.text.charAt(0).toUpperCase() + currentCaption.text.slice(1) :
                                      currentCaption.text;
                  return (
                    <div
                      className="absolute bottom-[15%] left-1/2 -translate-x-1/2 pointer-events-none text-center max-w-[80%]"
                      style={{
                        fontFamily: style.fontFamily,
                        fontSize: `${style.fontSize * 0.5}px`,
                        fontWeight: style.fontWeight,
                        color: style.color,
                        backgroundColor: style.backgroundColor,
                        padding: `${style.padding * 0.5}px`,
                        borderRadius: `${style.borderRadius}px`,
                        textTransform: style.textTransform,
                        letterSpacing: `${style.letterSpacing}px`,
                        textShadow: style.textShadow,
                        border: style.border,
                        fontStyle: style.fontStyle,
                      }}
                    >
                      {displayText}
                    </div>
                  );
                })()}
                
                {/* Text Overlay Preview */}
                {textOverlay && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${textPosition.x}%`,
                      top: `${textPosition.y}%`,
                      transform: 'translate(-50%, -50%)',
                      color: textColor,
                      fontSize: `${textSize}px`,
                      fontWeight: 'bold',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    }}
                  >
                    {textOverlay}
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Section */}
            <div className="border-t border-slate-800 bg-slate-950 p-4 flex-shrink-0">
              <div className="space-y-2.5 min-w-0">
                {/* Playback Controls */}
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = Math.max(0, currentTime - 0.1);
                      }
                    }}
                    disabled={!duration}
                    className="h-9 w-9 border-slate-700 hover:bg-slate-800"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePlayPause}
                    disabled={!duration}
                    className="h-10 w-10 border-slate-700 hover:bg-slate-800"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = Math.min(duration, currentTime + 0.1);
                      }
                    }}
                    disabled={!duration}
                    className="h-9 w-9 border-slate-700 hover:bg-slate-800"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>

                  <div className="flex items-center gap-2 ml-2 text-sm font-medium text-slate-300">
                    <span>{formatTime(currentTime)}</span>
                    <span className="text-slate-600">/</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
                
                {/* Visual Timeline */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Trim: {formatTime(trimStart)} - {formatTime(trimEnd)}</span>
                    </div>
                    <span className="text-emerald-400 font-semibold">
                      Final: {formatTime(trimEnd - trimStart - cutRanges.reduce((sum, r) => sum + (r.end - r.start), 0))}
                    </span>
                  </div>
                  
                  <div className="relative h-20 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 w-full">
                    {/* Thumbnail strip */}
                    {thumbnails.length > 0 ? (
                      <div className="absolute inset-0 flex">
                        {thumbnails.map((thumb, idx) => (
                          <div
                            key={idx}
                            className="flex-1 h-full border-r border-slate-700/50"
                            style={{ 
                              backgroundImage: `url(${thumb.dataUrl})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              opacity: 0.8
                            }}
                          />
                        ))}
                      </div>
                    ) : generatingThumbnails ? (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
                        Generating preview...
                      </div>
                    ) : null}
                    
                    {/* Dimmed regions (trimmed out) */}
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-slate-950/95 backdrop-blur-sm"
                      style={{
                        width: `${(trimStart / duration) * 100}%`,
                      }}
                    />
                    <div
                      className="absolute top-0 bottom-0 right-0 bg-slate-950/95 backdrop-blur-sm"
                      style={{
                        width: `${((duration - trimEnd) / duration) * 100}%`,
                      }}
                    />
                    
                    {/* Cut ranges (removed sections) */}
                    {cutRanges.map((range, idx) => (
                      <div
                        key={idx}
                        className="absolute top-0 bottom-0 bg-red-900/70 border-x border-red-500 group cursor-pointer hover:bg-red-900/90"
                        style={{
                          left: `${(range.start / duration) * 100}%`,
                          width: `${((range.end - range.start) / duration) * 100}%`,
                        }}
                        onClick={() => {
                          setCutRanges(prev => prev.filter((_, i) => i !== idx));
                          saveToHistory();
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ))}
                    
                    {/* Fade indicators */}
                    {fadeIn > 0 && (
                      <div
                        className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-500/30 to-transparent pointer-events-none"
                        style={{
                          left: `${(trimStart / duration) * 100}%`,
                          width: `${(fadeIn / duration) * 100}%`,
                        }}
                      />
                    )}
                    {fadeOut > 0 && (
                      <div
                        className="absolute top-0 bottom-0 bg-gradient-to-l from-blue-500/30 to-transparent pointer-events-none"
                        style={{
                          right: `${((duration - trimEnd) / duration) * 100}%`,
                          width: `${(fadeOut / duration) * 100}%`,
                        }}
                      />
                    )}
                    
                    {/* Active region highlight */}
                    <div
                      className="absolute top-0 bottom-0 border-x-2 border-emerald-500 bg-emerald-500/5 pointer-events-none"
                      style={{
                        left: `${(trimStart / duration) * 100}%`,
                        width: `${((trimEnd - trimStart) / duration) * 100}%`,
                      }}
                    />
                    
                    {/* Start handle */}
                    <div
                      className="absolute top-0 bottom-0 w-3 bg-emerald-600 cursor-ew-resize hover:bg-emerald-500 transition-all z-10 flex items-center justify-center group"
                      style={{ left: `${(trimStart / duration) * 100}%` }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const startX = e.clientX;
                        const startTrim = trimStart;
                        const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
                        if (!parentRect) return;
                        
                        const handleMouseMove = (moveEvent) => {
                          const deltaX = moveEvent.clientX - startX;
                          const deltaTime = (deltaX / parentRect.width) * duration;
                          const newTrimStart = Math.max(0, Math.min(trimEnd - 0.1, startTrim + deltaTime));
                          setTrimStart(newTrimStart);
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                          saveToHistory();
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <div className="w-0.5 h-8 bg-white rounded-full opacity-80 group-hover:opacity-100" />
                    </div>
                    
                    {/* End handle */}
                    <div
                      className="absolute top-0 bottom-0 w-3 bg-emerald-600 cursor-ew-resize hover:bg-emerald-500 transition-all z-10 flex items-center justify-center group"
                      style={{ left: `calc(${(trimEnd / duration) * 100}% - 12px)` }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const startX = e.clientX;
                        const startTrim = trimEnd;
                        const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
                        if (!parentRect) return;
                        
                        const handleMouseMove = (moveEvent) => {
                          const deltaX = moveEvent.clientX - startX;
                          const deltaTime = (deltaX / parentRect.width) * duration;
                          const newTrimEnd = Math.max(trimStart + 0.1, Math.min(duration, startTrim + deltaTime));
                          setTrimEnd(newTrimEnd);
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                          saveToHistory();
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <div className="w-0.5 h-8 bg-white rounded-full opacity-80 group-hover:opacity-100" />
                    </div>
                    
                    {/* Playhead */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none z-20"
                      style={{ left: `${(currentTime / duration) * 100}%` }}
                    >
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                    </div>
                  </div>
                  
                  {/* Fade Controls and Timeline Actions */}
                  <div className="grid grid-cols-4 gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const start = currentTime;
                        const end = Math.min(currentTime + 1, trimEnd);
                        setCutRanges(prev => [...prev, { start, end }].sort((a, b) => a.start - b.start));
                        saveToHistory();
                        toast.success('Section marked for removal');
                      }}
                      className="text-xs border-slate-700 hover:bg-slate-800 h-8"
                    >
                      <Scissors className="w-3 h-3 mr-1" />
                      Cut
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCutRanges([]);
                        saveToHistory();
                        toast.success('Cleared all cuts');
                      }}
                      disabled={cutRanges.length === 0}
                      className="text-xs border-slate-700 hover:bg-slate-800 h-8"
                    >
                      Clear
                    </Button>
                    <div className="space-y-0.5 min-w-0">
                      <label className="text-[10px] font-medium text-slate-400 block">
                        Fade In: {fadeIn.toFixed(1)}s
                      </label>
                      <Slider
                        value={[fadeIn]}
                        onValueChange={(v) => setFadeIn(v[0])}
                        onValueCommit={saveToHistory}
                        max={Math.min(3, (trimEnd - trimStart) / 2)}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <label className="text-[10px] font-medium text-slate-400 block">
                        Fade Out: {fadeOut.toFixed(1)}s
                      </label>
                      <Slider
                        value={[fadeOut]}
                        onValueChange={(v) => setFadeOut(v[0])}
                        onValueCommit={saveToHistory}
                        max={Math.min(3, (trimEnd - trimStart) / 2)}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  </div>
                  </div>
                  </div>
                  </div>
                  </div>

                  {/* Right Sidebar - Controls */}
                  <div className="w-80 border-l border-slate-800 bg-slate-950 overflow-y-auto flex-shrink-0">
                  <Tabs defaultValue="adjust" className="w-full h-full flex flex-col">
                  <TabsList className="w-full grid grid-cols-3 bg-slate-900 border-b border-slate-800">
                  <TabsTrigger value="adjust" className="data-[state=active]:bg-slate-800">Adjust</TabsTrigger>
                  <TabsTrigger value="audio" className="data-[state=active]:bg-slate-800">Audio</TabsTrigger>
                  <TabsTrigger value="captions" className="data-[state=active]:bg-slate-800">
                  <Subtitles className="w-3.5 h-3.5" />
                  </TabsTrigger>
                  </TabsList>

                  <div className="p-4 space-y-4 flex-1 overflow-y-auto">

                <TabsContent value="adjust" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-emerald-400" />
                      <label className="text-sm font-medium text-slate-200">
                        Brightness: {brightness}%
                      </label>
                    </div>
                    <Slider
                      value={[brightness]}
                      onValueChange={(value) => setBrightness(value[0])}
                      onValueCommit={saveToHistory}
                      min={0}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Contrast className="w-4 h-4 text-emerald-400" />
                      <label className="text-sm font-medium text-slate-200">
                        Contrast: {contrast}%
                      </label>
                    </div>
                    <Slider
                      value={[contrast]}
                      onValueChange={(value) => setContrast(value[0])}
                      onValueCommit={saveToHistory}
                      min={0}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-emerald-400" />
                      <label className="text-sm font-medium text-slate-200">
                        Saturation: {saturation}%
                      </label>
                    </div>
                    <Slider
                      value={[saturation]}
                      onValueChange={(value) => setSaturation(value[0])}
                      onValueCommit={saveToHistory}
                      min={0}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Blur: {blur}px
                    </label>
                    <Slider
                      value={[blur]}
                      onValueChange={(value) => setBlur(value[0])}
                      onValueCommit={saveToHistory}
                      min={0}
                      max={20}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="audio" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-slate-500" />
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Volume: {volume}%
                      </label>
                    </div>
                    <Slider
                      value={[volume]}
                      onValueChange={(value) => {
                        setVolume(value[0]);
                        if (videoRef.current) {
                          videoRef.current.volume = value[0] / 100;
                        }
                      }}
                      onValueCommit={saveToHistory}
                      min={0}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Noise Reduction
                      </label>
                      <input
                        type="checkbox"
                        checked={noiseReduction}
                        onChange={(e) => {
                          setNoiseReduction(e.target.checked);
                          saveToHistory();
                        }}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Reduces background noise and hiss
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Audio Normalization
                      </label>
                      <input
                        type="checkbox"
                        checked={audioNormalization}
                        onChange={(e) => {
                          setAudioNormalization(e.target.checked);
                          saveToHistory();
                        }}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Balances audio levels for consistent volume
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-slate-500" />
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Background Music
                      </label>
                    </div>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleMusicUpload}
                      className="hidden"
                      id="music-upload"
                    />
                    <label
                      htmlFor="music-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">
                        {backgroundMusic ? 'Change Music' : 'Upload Music'}
                      </span>
                    </label>
                    {backgroundMusic && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Music Volume: {musicVolume}%
                          </label>
                          <Slider
                            value={[musicVolume]}
                            onValueChange={(value) => setMusicVolume(value[0])}
                            onValueCommit={saveToHistory}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setBackgroundMusic(null);
                            saveToHistory();
                            toast.success('Background music removed');
                          }}
                          className="w-full"
                        >
                          Remove Music
                        </Button>
                      </>
                    )}
                  </div>
                </TabsContent>



                <TabsContent value="captions" className="space-y-4 mt-0">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Caption Style
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(captionTemplates).map((styleName) => (
                          <Button
                            key={styleName}
                            variant={captionStyle === styleName ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setCaptionStyle(styleName);
                              saveToHistory();
                            }}
                            className="capitalize"
                          >
                            {styleName}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button
                          onClick={generateCaptions}
                          disabled={generatingCaptions}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {generatingCaptions ? (
                            <>Transcribing...</>
                          ) : (
                            <>
                              <Wand2 className="w-4 h-4 mr-2" />
                              Auto Transcribe
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={addCaption}
                          variant="outline"
                          className="flex-1"
                        >
                          Add at {formatTime(currentTime)}
                        </Button>
                      </div>

                      {transcriptionProgress !== null && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                              Processing...
                            </span>
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                              {transcriptionProgress}%
                            </span>
                          </div>
                          <div className="h-2 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${transcriptionProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {captions.length > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Show Captions
                          </label>
                          <input
                            type="checkbox"
                            checked={showCaptions}
                            onChange={(e) => {
                              setShowCaptions(e.target.checked);
                              saveToHistory();
                            }}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Caption Style
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.keys(captionTemplates).map((styleName) => (
                              <Button
                                key={styleName}
                                variant={captionStyle === styleName ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  setCaptionStyle(styleName);
                                  saveToHistory();
                                }}
                                className="capitalize"
                              >
                                {styleName}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <p className="text-xs text-emerald-700 dark:text-emerald-400">
                            {captions.length} caption{captions.length !== 1 ? 's' : ''} generated
                          </p>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                              Edit Captions
                            </label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCaptions([]);
                                setShowCaptions(false);
                                saveToHistory();
                              }}
                              className="h-6 text-xs text-red-600 hover:text-red-700"
                            >
                              Clear All
                            </Button>
                          </div>
                          {captions.map((caption, index) => (
                            <div key={index} className="space-y-1 p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                              <div className="flex items-start gap-2">
                                <Input
                                  value={caption.text}
                                  onChange={(e) => {
                                    const newCaptions = [...captions];
                                    newCaptions[index].text = e.target.value;
                                    setCaptions(newCaptions);
                                  }}
                                  onBlur={saveToHistory}
                                  className="text-xs flex-1"
                                  placeholder="Caption text..."
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteCaption(index)}
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  value={caption.startTime.toFixed(1)}
                                  onChange={(e) => {
                                    const newCaptions = [...captions];
                                    newCaptions[index].startTime = parseFloat(e.target.value);
                                    setCaptions(newCaptions);
                                  }}
                                  onBlur={saveToHistory}
                                  step={0.1}
                                  className="text-xs"
                                  placeholder="Start"
                                />
                                <Input
                                  type="number"
                                  value={caption.endTime.toFixed(1)}
                                  onChange={(e) => {
                                    const newCaptions = [...captions];
                                    newCaptions[index].endTime = parseFloat(e.target.value);
                                    setCaptions(newCaptions);
                                  }}
                                  onBlur={saveToHistory}
                                  step={0.1}
                                  className="text-xs"
                                  placeholder="End"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {captions.length === 0 && (
                      <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                          <strong>Auto Transcribe:</strong> Automatically generates captions from video audio
                          <br/><br/>
                          <strong>Add Manually:</strong> Add caption at current timestamp
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 mt-auto border-t border-slate-800">
                  <Button onClick={onClose} variant="outline" className="flex-1 border-slate-700 hover:bg-slate-800" disabled={processing}>
                    Cancel
                  </Button>
                  <Button onClick={applyEdits} disabled={processing} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                    {processing ? "Processing..." : "Apply Changes"}
                  </Button>
                </div>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}