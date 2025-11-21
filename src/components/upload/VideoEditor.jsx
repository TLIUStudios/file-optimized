import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scissors, Type, Palette, Save, X, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
  });
  const [processing, setProcessing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && videoData) {
      videoRef.current.src = videoData;
      videoRef.current.onloadedmetadata = () => {
        setDuration(videoRef.current.duration);
        setTrimEnd(videoRef.current.duration);
      };
      videoRef.current.ontimeupdate = () => {
        setCurrentTime(videoRef.current.currentTime);
      };
    }
  }, [videoData]);

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

      // Import mp4-muxer
      const { Muxer, ArrayBufferTarget } = await import('https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/+esm');

      const target = new ArrayBufferTarget();
      const fps = 30;
      
      // Determine codec based on resolution
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
        ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px)`;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b">
          <DialogTitle className="text-base sm:text-lg">Video Editor</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Video Preview */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                onEnded={() => setIsPlaying(false)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={togglePlayPause}
              >
                {isPlaying ? <Pause className="w-8 h-8 sm:w-10 sm:h-10" /> : <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1" />}
              </Button>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400">
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

            {/* Editing Tools */}
            <Tabs defaultValue="trim" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="trim" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                  <Scissors className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Trim</span>
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                  <Type className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Text</span>
                </TabsTrigger>
                <TabsTrigger value="filters" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                  <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Filters</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trim" className="space-y-3 sm:space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Start Time: {formatTime(trimStart)}</Label>
                  <Slider
                    value={[trimStart]}
                    onValueChange={(v) => setTrimStart(Math.min(v[0], trimEnd - 0.1))}
                    max={duration}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">End Time: {formatTime(trimEnd)}</Label>
                  <Slider
                    value={[trimEnd]}
                    onValueChange={(v) => setTrimEnd(Math.max(v[0], trimStart + 0.1))}
                    max={duration}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Duration: {formatTime(trimEnd - trimStart)}
                </p>
              </TabsContent>

              <TabsContent value="text" className="space-y-3 sm:space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="text-overlay" className="text-xs sm:text-sm">Text Overlay</Label>
                  <Input
                    id="text-overlay"
                    value={textOverlay}
                    onChange={(e) => setTextOverlay(e.target.value)}
                    placeholder="Enter text..."
                    className="text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="text-color" className="text-xs sm:text-sm">Text Color</Label>
                    <Input
                      id="text-color"
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-10 sm:h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Text Size: {textSize}px</Label>
                    <Slider
                      value={[textSize]}
                      onValueChange={(v) => setTextSize(v[0])}
                      min={16}
                      max={72}
                      step={2}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Horizontal Position: {textPosition.x}%</Label>
                    <Slider
                      value={[textPosition.x]}
                      onValueChange={(v) => setTextPosition({ ...textPosition, x: v[0] })}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Vertical Position: {textPosition.y}%</Label>
                    <Slider
                      value={[textPosition.y]}
                      onValueChange={(v) => setTextPosition({ ...textPosition, y: v[0] })}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="filters" className="space-y-3 sm:space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Brightness: {filters.brightness}%</Label>
                  <Slider
                    value={[filters.brightness]}
                    onValueChange={(v) => setFilters({ ...filters, brightness: v[0] })}
                    min={0}
                    max={200}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Contrast: {filters.contrast}%</Label>
                  <Slider
                    value={[filters.contrast]}
                    onValueChange={(v) => setFilters({ ...filters, contrast: v[0] })}
                    min={0}
                    max={200}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Saturation: {filters.saturation}%</Label>
                  <Slider
                    value={[filters.saturation]}
                    onValueChange={(v) => setFilters({ ...filters, saturation: v[0] })}
                    min={0}
                    max={200}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Blur: {filters.blur}px</Label>
                  <Slider
                    value={[filters.blur]}
                    onValueChange={(v) => setFilters({ ...filters, blur: v[0] })}
                    min={0}
                    max={20}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button onClick={onClose} variant="outline" disabled={processing} className="flex-1 sm:flex-none text-sm">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={applyEdits} disabled={processing} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-sm">
            <Save className="w-4 h-4 mr-2" />
            {processing ? "Processing..." : "Apply Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}