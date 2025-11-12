import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Play, Pause, RotateCw, Crop, Type, Zap, Download, Scissors, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function VideoEditor({ isOpen, onClose, videoUrl, ffmpeg, onSave }) {
  const [currentTab, setCurrentTab] = useState("trim");
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [processing, setProcessing] = useState(false);
  
  // Trim settings
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  
  // Crop settings
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);
  
  // Rotation
  const [rotation, setRotation] = useState(0);
  
  // Speed
  const [speed, setSpeed] = useState(1);
  
  // Text overlay
  const [textOverlay, setTextOverlay] = useState("");
  const [textPosition, setTextPosition] = useState("center");
  const [textSize, setTextSize] = useState(24);
  const [textColor, setTextColor] = useState("#FFFFFF");
  
  // Blur settings
  const [blurStrength, setBlurStrength] = useState(5);
  
  const videoRef = useRef(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.src = videoUrl;
      videoRef.current.onloadedmetadata = () => {
        const dur = videoRef.current.duration;
        setDuration(dur);
        setTrimEnd(dur);
        setCropWidth(videoRef.current.videoWidth);
        setCropHeight(videoRef.current.videoHeight);
      };
    }
  }, [isOpen, videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    video.addEventListener('timeupdate', updateTime);
    return () => video.removeEventListener('timeupdate', updateTime);
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const applyEdits = async () => {
    if (!ffmpeg) {
      toast.error('Video processor not available');
      return;
    }

    setProcessing(true);
    toast.info('Processing video...', { duration: Infinity, id: 'video-edit' });

    try {
      // Fetch video data
      const response = await fetch(videoUrl);
      const videoData = await response.arrayBuffer();
      const inputName = 'input.mp4';
      const outputName = 'output.mp4';

      await ffmpeg.writeFile(inputName, new Uint8Array(videoData));

      // Build FFmpeg filter chain
      let filters = [];
      
      // Crop
      if (currentTab === 'crop' && cropWidth > 0 && cropHeight > 0) {
        filters.push(`crop=${cropWidth}:${cropHeight}:${cropX}:${cropY}`);
      }
      
      // Rotation
      if (rotation > 0) {
        const rotations = {
          90: 'transpose=1',
          180: 'transpose=1,transpose=1',
          270: 'transpose=2'
        };
        if (rotations[rotation]) {
          filters.push(rotations[rotation]);
        }
      }
      
      // Blur (full frame only)
      if (currentTab === 'blur' && blurStrength > 0) {
        filters.push(`boxblur=${blurStrength}:${blurStrength}`);
      }
      
      // Text overlay
      if (currentTab === 'text' && textOverlay) {
        const positions = {
          'top-left': 'x=10:y=10',
          'top-center': 'x=(w-text_w)/2:y=10',
          'top-right': 'x=w-text_w-10:y=10',
          'center': 'x=(w-text_w)/2:y=(h-text_h)/2',
          'bottom-left': 'x=10:y=h-text_h-10',
          'bottom-center': 'x=(w-text_w)/2:y=h-text_h-10',
          'bottom-right': 'x=w-text_w-10:y=h-text_h-10'
        };
        
        filters.push(`drawtext=text='${textOverlay}':fontcolor=${textColor}:fontsize=${textSize}:${positions[textPosition] || positions.center}`);
      }

      // Build command
      const args = ['-i', inputName];
      
      // Trim
      if (trimStart > 0) {
        args.push('-ss', trimStart.toString());
      }
      if (trimEnd < duration) {
        args.push('-to', trimEnd.toString());
      }
      
      // Apply filters
      if (filters.length > 0) {
        args.push('-vf', filters.join(','));
      }
      
      // Speed adjustment
      if (speed !== 1) {
        const videoSpeed = 1 / speed;
        const audioSpeed = speed;
        if (!args.includes('-vf')) {
          args.push('-vf', `setpts=${videoSpeed}*PTS`);
        } else {
          const vfIndex = args.indexOf('-vf');
          args[vfIndex + 1] += `,setpts=${videoSpeed}*PTS`;
        }
        args.push('-af', `atempo=${audioSpeed}`);
      }
      
      args.push('-codec:v', 'libx264', '-crf', '23', '-preset', 'medium');
      args.push('-codec:a', 'aac', '-b:a', '128k');
      args.push(outputName);

      console.log('FFmpeg command:', args.join(' '));
      
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      // Cleanup
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      toast.dismiss('video-edit');
      toast.success('Video edited successfully!');
      
      onSave(url, blob);
      onClose();
      
    } catch (error) {
      console.error('Video editing error:', error);
      toast.dismiss('video-edit');
      toast.error('Failed to edit video: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[98vw] h-[98vh] p-0 overflow-hidden [&>button]:hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Video Editor</h2>
            <div className="flex items-center gap-2">
              <Button 
                onClick={applyEdits} 
                disabled={processing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {processing ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Apply & Save
                  </>
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Video Preview */}
            <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900">
              <div className="flex-1 flex items-center justify-center p-4">
                <video
                  ref={videoRef}
                  className="max-w-full max-h-full bg-black rounded-lg shadow-lg"
                  controls={false}
                />
              </div>

              {/* Playback Controls */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4 mb-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  
                  <div className="flex-1">
                    <Slider
                      value={[currentTime]}
                      onValueChange={([value]) => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = value;
                          setCurrentTime(value);
                        }
                      }}
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  
                  <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[80px] text-right">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tools Sidebar */}
            <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="w-full grid grid-cols-3 gap-1 p-2">
                  <TabsTrigger value="trim" className="text-xs">
                    <Scissors className="w-3 h-3 mr-1" />
                    Trim
                  </TabsTrigger>
                  <TabsTrigger value="crop" className="text-xs">
                    <Crop className="w-3 h-3 mr-1" />
                    Crop
                  </TabsTrigger>
                  <TabsTrigger value="rotate" className="text-xs">
                    <RotateCw className="w-3 h-3 mr-1" />
                    Rotate
                  </TabsTrigger>
                </TabsList>
                
                <TabsList className="w-full grid grid-cols-3 gap-1 p-2">
                  <TabsTrigger value="speed" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Speed
                  </TabsTrigger>
                  <TabsTrigger value="text" className="text-xs">
                    <Type className="w-3 h-3 mr-1" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="blur" className="text-xs">
                    <Circle className="w-3 h-3 mr-1" />
                    Blur
                  </TabsTrigger>
                </TabsList>

                <div className="p-4">
                  <TabsContent value="trim" className="space-y-4 mt-0">
                    <div>
                      <Label className="text-xs">Start Time: {formatTime(trimStart)}</Label>
                      <Slider
                        value={[trimStart]}
                        onValueChange={([value]) => setTrimStart(Math.min(value, trimEnd - 0.1))}
                        min={0}
                        max={duration}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End Time: {formatTime(trimEnd)}</Label>
                      <Slider
                        value={[trimEnd]}
                        onValueChange={([value]) => setTrimEnd(Math.max(value, trimStart + 0.1))}
                        min={0}
                        max={duration}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Duration: {formatTime(trimEnd - trimStart)}
                    </p>
                  </TabsContent>

                  <TabsContent value="crop" className="space-y-4 mt-0">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">X Position</Label>
                        <Input
                          type="number"
                          value={cropX}
                          onChange={(e) => setCropX(parseInt(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Y Position</Label>
                        <Input
                          type="number"
                          value={cropY}
                          onChange={(e) => setCropY(parseInt(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Width</Label>
                        <Input
                          type="number"
                          value={cropWidth}
                          onChange={(e) => setCropWidth(parseInt(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Height</Label>
                        <Input
                          type="number"
                          value={cropHeight}
                          onChange={(e) => setCropHeight(parseInt(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="rotate" className="space-y-4 mt-0">
                    <Label className="text-xs">Rotation Angle</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {[0, 90, 180, 270].map((angle) => (
                        <Button
                          key={angle}
                          variant={rotation === angle ? "default" : "outline"}
                          onClick={() => setRotation(angle)}
                          className="text-xs"
                        >
                          {angle}°
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="speed" className="space-y-4 mt-0">
                    <Label className="text-xs">Playback Speed: {speed}x</Label>
                    <Slider
                      value={[speed]}
                      onValueChange={([value]) => setSpeed(value)}
                      min={0.25}
                      max={4}
                      step={0.25}
                      className="mt-2"
                    />
                    <div className="grid grid-cols-4 gap-2">
                      {[0.5, 1, 1.5, 2].map((s) => (
                        <Button
                          key={s}
                          variant={speed === s ? "default" : "outline"}
                          onClick={() => setSpeed(s)}
                          size="sm"
                          className="text-xs"
                        >
                          {s}x
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="text" className="space-y-4 mt-0">
                    <div>
                      <Label className="text-xs">Text</Label>
                      <Input
                        value={textOverlay}
                        onChange={(e) => setTextOverlay(e.target.value)}
                        placeholder="Enter text..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Position</Label>
                      <Select value={textPosition} onValueChange={setTextPosition}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top-left">Top Left</SelectItem>
                          <SelectItem value="top-center">Top Center</SelectItem>
                          <SelectItem value="top-right">Top Right</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          <SelectItem value="bottom-center">Bottom Center</SelectItem>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Size: {textSize}px</Label>
                      <Slider
                        value={[textSize]}
                        onValueChange={([value]) => setTextSize(value)}
                        min={12}
                        max={72}
                        step={2}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Color</Label>
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="blur" className="space-y-4 mt-0">
                    <div>
                      <Label className="text-xs">Blur Strength: {blurStrength}</Label>
                      <Slider
                        value={[blurStrength]}
                        onValueChange={([value]) => setBlurStrength(value)}
                        min={1}
                        max={20}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <p className="text-xs text-slate-500">Note: Blur applies to entire video</p>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}