import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scissors, Type, Sun, Contrast, Droplet, X, Play, Pause, Undo, Redo } from "lucide-react";
import { toast } from "sonner";

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

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // History management
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (videoRef.current && videoData) {
      videoRef.current.src = videoData;
      videoRef.current.onloadedmetadata = () => {
        setDuration(videoRef.current.duration);
        setTrimEnd(videoRef.current.duration);
        
        // Initialize history
        const initialState = {
          trimStart: 0,
          trimEnd: videoRef.current.duration,
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
      videoRef.current.ontimeupdate = () => {
        setCurrentTime(videoRef.current.currentTime);
      };
    }
  }, [videoData]);

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
      blur
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
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`,
                    imageRendering: 'high-quality'
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute inset-0 m-auto w-16 h-16 bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </Button>
                
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
                  max={duration}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="w-full lg:w-80 border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
            <Tabs defaultValue="trim" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="trim">Trim</TabsTrigger>
                <TabsTrigger value="adjust">Adjust</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
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
                      onValueChange={(v) => setTrimStart(Math.min(v[0], trimEnd - 0.1))}
                      onValueCommit={saveToHistory}
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
                      onValueChange={(v) => setTrimEnd(Math.max(v[0], trimStart + 0.1))}
                      onValueCommit={saveToHistory}
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
                      <Contrast className="w-4 h-4 text-slate-500" />
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
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
                      <Droplet className="w-4 h-4 text-slate-500" />
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
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
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
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

                <TabsContent value="text" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Text Overlay
                    </label>
                    <Input
                      value={textOverlay}
                      onChange={(e) => setTextOverlay(e.target.value)}
                      onBlur={saveToHistory}
                      placeholder="Enter text..."
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-slate-500" />
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Text Size: {textSize}px
                      </label>
                    </div>
                    <Slider
                      value={[textSize]}
                      onValueChange={(v) => setTextSize(v[0])}
                      onValueCommit={saveToHistory}
                      min={16}
                      max={72}
                      step={2}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Text Color
                    </label>
                    <Input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      onBlur={saveToHistory}
                      className="h-10 w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Horizontal Position: {textPosition.x}%
                    </label>
                    <Slider
                      value={[textPosition.x]}
                      onValueChange={(v) => setTextPosition({ ...textPosition, x: v[0] })}
                      onValueCommit={saveToHistory}
                      min={0}
                      max={100}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Vertical Position: {textPosition.y}%
                    </label>
                    <Slider
                      value={[textPosition.y]}
                      onValueChange={(v) => setTextPosition({ ...textPosition, y: v[0] })}
                      onValueCommit={saveToHistory}
                      min={0}
                      max={100}
                      className="w-full"
                    />
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