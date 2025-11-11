import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Play, Pause, Scissors, Crop, RotateCw, Gauge, Type, Blur, Eraser, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function VideoEditor({ isOpen, onClose, videoData, videoFile, onSave, ffmpeg }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [cropArea, setCropArea] = useState(null);
  const [textOverlays, setTextOverlays] = useState([]);
  const [blurAreas, setBlurAreas] = useState([]);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('trim'); // trim, crop, effects, text, blur
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      const video = videoRef.current;
      video.onloadedmetadata = () => {
        setDuration(video.duration);
        setTrimEnd(video.duration);
      };
      video.ontimeupdate = () => {
        setCurrentTime(video.currentTime);
      };
    }
  }, [isOpen]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const addTextOverlay = () => {
    const newText = {
      id: Date.now(),
      text: 'Sample Text',
      x: 50, // percentage
      y: 50, // percentage
      fontSize: 32,
      color: '#FFFFFF',
      fontFamily: 'Arial',
      startTime: currentTime,
      endTime: Math.min(currentTime + 3, duration)
    };
    setTextOverlays(prev => [...prev, newText]);
  };

  const addBlurArea = () => {
    const newBlur = {
      id: Date.now(),
      x: 25, // percentage
      y: 25,
      width: 50,
      height: 50,
      intensity: 10,
      startTime: currentTime,
      endTime: Math.min(currentTime + 3, duration)
    };
    setBlurAreas(prev => [...prev, newBlur]);
  };

  const removeTextOverlay = (id) => {
    setTextOverlays(prev => prev.filter(t => t.id !== id));
  };

  const removeBlurArea = (id) => {
    setBlurAreas(prev => prev.filter(b => b.id !== id));
  };

  const updateTextOverlay = (id, updates) => {
    setTextOverlays(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const updateBlurArea = (id, updates) => {
    setBlurAreas(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const applyEdits = async () => {
    if (!ffmpeg) {
      toast.error('Video processor not loaded. Please wait and try again.');
      return;
    }

    setProcessing(true);
    toast.info('Processing video...', { duration: Infinity, id: 'video-process' });

    try {
      const inputExt = videoFile.name.split('.').pop();
      await ffmpeg.writeFile(`input.${inputExt}`, new Uint8Array(await videoFile.arrayBuffer()));

      const filters = [];
      let complexFilter = '';

      // Trim
      const trimArgs = [];
      if (trimStart > 0) {
        trimArgs.push('-ss', String(trimStart));
      }
      if (trimEnd < duration) {
        trimArgs.push('-to', String(trimEnd));
      }

      // Rotation
      if (rotation !== 0) {
        const rotateMap = {
          90: 'transpose=1',
          180: 'transpose=1,transpose=1',
          270: 'transpose=2'
        };
        if (rotateMap[rotation]) {
          filters.push(rotateMap[rotation]);
        }
      }

      // Speed
      if (speed !== 1) {
        const speedFilter = `setpts=${(1/speed).toFixed(2)}*PTS`;
        const audioSpeedFilter = `atempo=${speed}`;
        filters.push(speedFilter);
        complexFilter += `[0:a]${audioSpeedFilter}[a];`;
      }

      // Crop
      if (cropArea) {
        const { x, y, width, height } = cropArea;
        filters.push(`crop=${width}:${height}:${x}:${y}`);
      }

      // Blur areas
      if (blurAreas.length > 0) {
        blurAreas.forEach((blur, index) => {
          const { x, y, width, height, intensity, startTime, endTime } = blur;
          const blurFilter = `boxblur=${intensity}:enable='between(t,${startTime},${endTime})'`;
          filters.push(blurFilter);
        });
      }

      // Text overlays
      if (textOverlays.length > 0) {
        textOverlays.forEach(text => {
          const { text: content, x, y, fontSize, color, startTime, endTime } = text;
          const textFilter = `drawtext=text='${content}':x=${x}:y=${y}:fontsize=${fontSize}:fontcolor=${color}:enable='between(t,${startTime},${endTime})'`;
          filters.push(textFilter);
        });
      }

      // Build FFmpeg command
      const args = [
        ...trimArgs,
        '-i', `input.${inputExt}`,
      ];

      if (filters.length > 0) {
        const videoFilter = filters.join(',');
        args.push('-vf', videoFilter);
      }

      if (complexFilter) {
        args.push('-filter_complex', complexFilter);
        args.push('-map', '0:v');
        args.push('-map', '[a]');
      }

      args.push(
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        'output.mp4'
      );

      console.log('FFmpeg command:', args.join(' '));
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });

      // Cleanup
      await ffmpeg.deleteFile(`input.${inputExt}`);
      await ffmpeg.deleteFile('output.mp4');

      toast.dismiss('video-process');
      toast.success('Video edited successfully!');
      
      onSave(blob);
      onClose();

    } catch (error) {
      console.error('Video editing failed:', error);
      toast.dismiss('video-process');
      toast.error('Failed to edit video: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[98vw] h-[98vh] p-0 overflow-hidden [&>button]:hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Video Editor</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Edit and enhance your video</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={applyEdits} 
                disabled={processing || !ffmpeg}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                {processing ? 'Processing...' : 'Apply & Save'}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} disabled={processing}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Main Video Area */}
            <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900">
              <div className="flex-1 flex items-center justify-center p-4">
                <video
                  ref={videoRef}
                  src={videoData}
                  className="max-w-full max-h-full rounded-lg shadow-lg"
                  style={{ transform: `rotate(${rotation}deg)` }}
                />
              </div>

              {/* Video Controls */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[80px]">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  <Slider
                    value={[currentTime]}
                    onValueChange={([value]) => handleSeek(value)}
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    className="flex-1"
                  />
                </div>

                {/* Trim Preview */}
                {(trimStart > 0 || trimEnd < duration) && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded">
                    Trim: {formatTime(trimStart)} → {formatTime(trimEnd)} (Duration: {formatTime(trimEnd - trimStart)})
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Tools */}
            <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Trim Tool */}
                <Collapsible open={activeTab === 'trim'} onOpenChange={(open) => setActiveTab(open ? 'trim' : '')}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Scissors className="w-4 h-4" />
                        Trim Video
                      </span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", activeTab === 'trim' && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 mt-3">
                    <div>
                      <Label className="text-xs">Start Time: {formatTime(trimStart)}</Label>
                      <Slider
                        value={[trimStart]}
                        onValueChange={([value]) => setTrimStart(Math.min(value, trimEnd - 0.5))}
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
                        onValueChange={([value]) => setTrimEnd(Math.max(value, trimStart + 0.5))}
                        min={0}
                        max={duration}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                    <Button
                      onClick={() => { setTrimStart(0); setTrimEnd(duration); }}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Reset Trim
                    </Button>
                  </CollapsibleContent>
                </Collapsible>

                {/* Rotate Tool */}
                <Collapsible open={activeTab === 'rotate'} onOpenChange={(open) => setActiveTab(open ? 'rotate' : '')}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <RotateCw className="w-4 h-4" />
                        Rotate
                      </span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", activeTab === 'rotate' && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 mt-3">
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 90, 180, 270].map(deg => (
                        <Button
                          key={deg}
                          onClick={() => setRotation(deg)}
                          variant={rotation === deg ? "default" : "outline"}
                          size="sm"
                          className={rotation === deg ? "bg-emerald-600" : ""}
                        >
                          {deg}°
                        </Button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Speed Tool */}
                <Collapsible open={activeTab === 'speed'} onOpenChange={(open) => setActiveTab(open ? 'speed' : '')}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Gauge className="w-4 h-4" />
                        Speed: {speed}x
                      </span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", activeTab === 'speed' && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 mt-3">
                    <Slider
                      value={[speed]}
                      onValueChange={([value]) => setSpeed(value)}
                      min={0.25}
                      max={4}
                      step={0.25}
                      className="mt-2"
                    />
                    <div className="grid grid-cols-4 gap-2">
                      {[0.5, 1, 1.5, 2].map(s => (
                        <Button
                          key={s}
                          onClick={() => setSpeed(s)}
                          variant={speed === s ? "default" : "outline"}
                          size="sm"
                          className={speed === s ? "bg-emerald-600" : ""}
                        >
                          {s}x
                        </Button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Text Overlays */}
                <Collapsible open={activeTab === 'text'} onOpenChange={(open) => setActiveTab(open ? 'text' : '')}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Text Overlays ({textOverlays.length})
                      </span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", activeTab === 'text' && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 mt-3">
                    <Button onClick={addTextOverlay} variant="outline" size="sm" className="w-full">
                      <Type className="w-3 h-3 mr-1" />
                      Add Text
                    </Button>
                    {textOverlays.map(text => (
                      <div key={text.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded border space-y-2">
                        <Input
                          value={text.text}
                          onChange={(e) => updateTextOverlay(text.id, { text: e.target.value })}
                          placeholder="Text"
                          className="text-xs"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            value={text.fontSize}
                            onChange={(e) => updateTextOverlay(text.id, { fontSize: parseInt(e.target.value) })}
                            placeholder="Size"
                            className="text-xs"
                          />
                          <Input
                            type="color"
                            value={text.color}
                            onChange={(e) => updateTextOverlay(text.id, { color: e.target.value })}
                            className="h-9"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            value={text.startTime}
                            onChange={(e) => updateTextOverlay(text.id, { startTime: parseFloat(e.target.value) })}
                            placeholder="Start"
                            step="0.1"
                            className="text-xs"
                          />
                          <Input
                            type="number"
                            value={text.endTime}
                            onChange={(e) => updateTextOverlay(text.id, { endTime: parseFloat(e.target.value) })}
                            placeholder="End"
                            step="0.1"
                            className="text-xs"
                          />
                        </div>
                        <Button
                          onClick={() => removeTextOverlay(text.id)}
                          variant="destructive"
                          size="sm"
                          className="w-full"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                {/* Blur Areas */}
                <Collapsible open={activeTab === 'blur'} onOpenChange={(open) => setActiveTab(open ? 'blur' : '')}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Blur className="w-4 h-4" />
                        Blur Areas ({blurAreas.length})
                      </span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", activeTab === 'blur' && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 mt-3">
                    <Button onClick={addBlurArea} variant="outline" size="sm" className="w-full">
                      <Blur className="w-3 h-3 mr-1" />
                      Add Blur Area
                    </Button>
                    {blurAreas.map(blur => (
                      <div key={blur.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded border space-y-2">
                        <Label className="text-xs">Intensity: {blur.intensity}</Label>
                        <Slider
                          value={[blur.intensity]}
                          onValueChange={([value]) => updateBlurArea(blur.id, { intensity: value })}
                          min={1}
                          max={50}
                          className="mt-2"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            value={blur.startTime}
                            onChange={(e) => updateBlurArea(blur.id, { startTime: parseFloat(e.target.value) })}
                            placeholder="Start"
                            step="0.1"
                            className="text-xs"
                          />
                          <Input
                            type="number"
                            value={blur.endTime}
                            onChange={(e) => updateBlurArea(blur.id, { endTime: parseFloat(e.target.value) })}
                            placeholder="End"
                            step="0.1"
                            className="text-xs"
                          />
                        </div>
                        <Button
                          onClick={() => removeBlurArea(blur.id)}
                          variant="destructive"
                          size="sm"
                          className="w-full"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}