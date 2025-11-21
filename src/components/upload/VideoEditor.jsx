import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scissors, Type, Sun, Contrast, Droplet, X, Play, Pause, Undo, Redo, Subtitles, Wand2, Volume2, Music, Upload } from "lucide-react";
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

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // History management
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (!videoRef.current || !videoData || !isOpen) return;
    
    const video = videoRef.current;
    
    video.src = videoData;
    video.load();
    
    const handleMetadataLoaded = () => {
      console.log('Video loaded:', video.duration, 'seconds');
      setDuration(video.duration);
      setTrimEnd(video.duration);
      
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
        blur: 0
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
    toast.info("Analyzing video audio...", { id: "gen-captions", duration: Infinity });
    
    try {
      const response = await fetch(videoData);
      const videoBlob = await response.blob();
      const file = new File([videoBlob], 'video.mp4', { type: 'video/mp4' });
      
      toast.info("Uploading to AI...", { id: "gen-captions", duration: Infinity });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      toast.info("Transcribing speech (this may take 30-60 seconds)...", { id: "gen-captions", duration: Infinity });
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert video transcription AI. Watch this video carefully and transcribe every word spoken.

YOUR TASK:
1. Listen to ALL audio in the video
2. Write down EXACTLY what is said
3. Break into short captions (4-8 words each) 
4. Provide accurate timestamps

OUTPUT FORMAT (JSON):
{
  "captions": [
    {"text": "Hey everyone welcome back", "startTime": 0, "endTime": 2},
    {"text": "to my channel today", "startTime": 2, "endTime": 4}
  ]
}

RULES:
- Transcribe EVERY word spoken
- Keep captions short for readability
- Use natural speaking pace (~2-3 words/second)
- Start from 0 seconds
- If NO speech: return empty array

Transcribe now:`,
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
      
      console.log("AI Result:", result);
      
      if (!result?.captions || result.captions.length === 0) {
        toast.dismiss("gen-captions");
        toast.error("No speech detected in video. Try adding captions manually.");
        return;
      }
      
      setCaptions(result.captions);
      setShowCaptions(true);
      saveToHistory();
      
      toast.dismiss("gen-captions");
      toast.success(`✨ Generated ${result.captions.length} captions!`);
      
    } catch (error) {
      console.error("Transcription error:", error);
      toast.dismiss("gen-captions");
      toast.error("Transcription failed. Add captions manually instead.");
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
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
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
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-0 bg-slate-50 dark:bg-slate-950 overflow-hidden [&>button]:hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Video</h2>
            <div className="flex items-center gap-1 ml-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={undo}
                disabled={!canUndo}
                className="h-8 w-8"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={redo}
                disabled={!canRedo}
                className="h-8 w-8"
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="hover:bg-red-100 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[calc(95vh-80px)]">
          {/* Video Preview */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-900 p-4 flex items-center justify-center overflow-auto">
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div className="relative max-w-full max-h-[70vh]">
                <video
                  ref={videoRef}
                  className="max-w-full max-h-[70vh] rounded bg-black"
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute inset-0 m-auto w-16 h-16 bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </Button>
                
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

              {/* Timeline */}
              <div className="w-full max-w-3xl mt-4 space-y-2 px-4">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <Slider
                  value={[currentTime]}
                  onValueChange={handleTimeChange}
                  max={duration || 1}
                  step={0.1}
                  className="w-full"
                  disabled={!duration || duration === 0}
                />
              </div>
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="w-full lg:w-80 border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
            <Tabs defaultValue="trim" className="w-full">
              <TabsList className="w-full grid grid-cols-4 text-xs">
                <TabsTrigger value="trim">Trim</TabsTrigger>
                <TabsTrigger value="adjust">Visual</TabsTrigger>
                <TabsTrigger value="audio">Audio</TabsTrigger>
                <TabsTrigger value="captions">
                  <Subtitles className="w-3 h-3" />
                </TabsTrigger>
              </TabsList>

              <div className="p-4 space-y-4">
                <TabsContent value="trim" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-slate-500" />
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Start: {formatTime(trimStart)}
                      </label>
                    </div>
                    <Slider
                      value={[trimStart]}
                      onValueChange={(v) => {
                        setTrimStart(Math.min(v[0], trimEnd - 0.1));
                        saveToHistory();
                      }}
                      max={duration}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      End: {formatTime(trimEnd)}
                    </label>
                    <Slider
                      value={[trimEnd]}
                      onValueChange={(v) => {
                        setTrimEnd(Math.max(v[0], trimStart + 0.1));
                        saveToHistory();
                      }}
                      max={duration}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      Duration: {formatTime(trimEnd - trimStart)}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="adjust" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-slate-500" />
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Brightness: {brightness}%
                      </label>
                    </div>
                    <Slider
                      value={[brightness]}
                      onValueChange={(value) => {
                        setBrightness(value[0]);
                        saveToHistory();
                      }}
                      min={0}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Contrast className="w-4 h-4 text-slate-500" />
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Contrast: {contrast}%
                      </label>
                    </div>
                    <Slider
                      value={[contrast]}
                      onValueChange={(value) => {
                        setContrast(value[0]);
                        saveToHistory();
                      }}
                      min={0}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-slate-500" />
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Saturation: {saturation}%
                      </label>
                    </div>
                    <Slider
                      value={[saturation]}
                      onValueChange={(value) => {
                        setSaturation(value[0]);
                        saveToHistory();
                      }}
                      min={0}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Blur: {blur}px
                    </label>
                    <Slider
                      value={[blur]}
                      onValueChange={(value) => {
                        setBlur(value[0]);
                        saveToHistory();
                      }}
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
                          saveToHistory();
                          }}
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
                            onValueChange={(value) => {
                              setMusicVolume(value[0]);
                              saveToHistory();
                            }}
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
                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Button onClick={onClose} variant="outline" className="flex-1" disabled={processing}>
                    Cancel
                  </Button>
                  <Button onClick={applyEdits} disabled={processing} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
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