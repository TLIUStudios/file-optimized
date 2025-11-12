import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Play, Pause, RotateCw, Crop, Type, Scissors, Gauge, Blur, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function VideoEditor({ isOpen, onClose, videoData, onSave, ffmpeg }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(100);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [textOverlays, setTextOverlays] = useState([]);
  const [blurAreas, setBlurAreas] = useState([]);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingText, setEditingText] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', () => {
        const d = videoRef.current.duration;
        setDuration(d);
        setTrimEnd(d);
      });
      
      videoRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(videoRef.current.currentTime);
      });
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
    const newOverlay = {
      id: Date.now(),
      text: 'Sample Text',
      x: 50,
      y: 50,
      fontSize: 32,
      color: '#FFFFFF',
      startTime: currentTime,
      endTime: duration,
      fontFamily: 'Arial'
    };
    setTextOverlays([...textOverlays, newOverlay]);
    setEditingText(newOverlay);
    setShowTextEditor(true);
  };

  const updateTextOverlay = (id, updates) => {
    setTextOverlays(textOverlays.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTextOverlay = (id) => {
    setTextOverlays(textOverlays.filter(t => t.id !== id));
    if (editingText?.id === id) {
      setEditingText(null);
      setShowTextEditor(false);
    }
  };

  const addBlurArea = () => {
    const newBlur = {
      id: Date.now(),
      x: 25,
      y: 25,
      width: 50,
      height: 50,
      intensity: 10,
      startTime: currentTime,
      endTime: duration
    };
    setBlurAreas([...blurAreas, newBlur]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const applyEdits = async () => {
    if (!ffmpeg) {
      toast.error('Video processor not loaded');
      return;
    }

    setProcessing(true);
    toast.info('Processing video edits...', { duration: Infinity, id: 'video-process' });

    try {
      const videoBlob = await fetch(videoData).then(r => r.blob());
      await ffmpeg.writeFile('input.mp4', new Uint8Array(await videoBlob.arrayBuffer()));

      let filterComplex = [];
      let inputArgs = ['-i', 'input.mp4'];
      
      // Trim
      if (trimStart > 0 || trimEnd < duration) {
        inputArgs.push('-ss', trimStart.toString(), '-to', trimEnd.toString());
      }

      // Rotation
      if (rotation !== 0) {
        const transposeMap = {
          90: '1',
          180: '2,transpose=2',
          270: '2'
        };
        filterComplex.push(`transpose=${transposeMap[rotation] || '0'}`);
      }

      // Crop
      if (cropArea.width < 100 || cropArea.height < 100) {
        const video = videoRef.current;
        const w = Math.floor(video.videoWidth * (cropArea.width / 100));
        const h = Math.floor(video.videoHeight * (cropArea.height / 100));
        const x = Math.floor(video.videoWidth * (cropArea.x / 100));
        const y = Math.floor(video.videoHeight * (cropArea.y / 100));
        filterComplex.push(`crop=${w}:${h}:${x}:${y}`);
      }

      // Speed
      if (speed !== 1) {
        filterComplex.push(`setpts=${1/speed}*PTS`);
      }

      // Text overlays
      textOverlays.forEach(overlay => {
        const textFilter = `drawtext=text='${overlay.text}':x=${overlay.x}:y=${overlay.y}:fontsize=${overlay.fontSize}:fontcolor=${overlay.color}:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:enable='between(t,${overlay.startTime},${overlay.endTime})'`;
        filterComplex.push(textFilter);
      });

      // Blur areas (using boxblur)
      blurAreas.forEach(blur => {
        const video = videoRef.current;
        const w = Math.floor(video.videoWidth * (blur.width / 100));
        const h = Math.floor(video.videoHeight * (blur.height / 100));
        const x = Math.floor(video.videoWidth * (blur.x / 100));
        const y = Math.floor(video.videoHeight * (blur.y / 100));
        filterComplex.push(`boxblur=${blur.intensity}:enable='between(t,${blur.startTime},${blur.endTime})'`);
      });

      const args = [...inputArgs];
      
      if (filterComplex.length > 0) {
        args.push('-vf', filterComplex.join(','));
      }

      // Volume
      if (volume !== 100) {
        args.push('-af', `volume=${volume/100}`);
      }

      args.push('-c:v', 'libx264', '-preset', 'medium', '-c:a', 'aac', 'output.mp4');

      console.log('FFmpeg args:', args.join(' '));
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });

      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp4');

      toast.dismiss('video-process');
      onSave(blob);
      onClose();
      toast.success('Video edited successfully!');
    } catch (error) {
      console.error('Error editing video:', error);
      toast.dismiss('video-process');
      toast.error('Failed to edit video: ' + error.message);
    } finally {
      setProcessing(false);
    }
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
              <Button onClick={applyEdits} disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                {processing ? 'Processing...' : 'Apply & Save'}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
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
                  style={{
                    transform: `rotate(${rotation}deg)`
                  }}
                />
              </div>

              {/* Playback Controls */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4 mb-3">
                  <Button variant="outline" size="icon" onClick={handlePlayPause}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <span className="text-sm font-medium">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                
                <Slider
                  value={[currentTime]}
                  onValueChange={([value]) => handleSeek(value)}
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  className="w-full"
                />

                {/* Trim markers */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Trim Start: {formatTime(trimStart)}</Label>
                    <Slider
                      value={[trimStart]}
                      onValueChange={([value]) => setTrimStart(Math.min(value, trimEnd))}
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Trim End: {formatTime(trimEnd)}</Label>
                    <Slider
                      value={[trimEnd]}
                      onValueChange={([value]) => setTrimEnd(Math.max(value, trimStart))}
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Editing Tools */}
            <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
              <Tabs defaultValue="transform" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="transform">Transform</TabsTrigger>
                  <TabsTrigger value="effects">Effects</TabsTrigger>
                  <TabsTrigger value="audio">Audio</TabsTrigger>
                </TabsList>

                <div className="p-4">
                  <TabsContent value="transform" className="space-y-4 mt-0">
                    {/* Rotation */}
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Rotation</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {[0, 90, 180, 270].map(deg => (
                          <Button
                            key={deg}
                            size="sm"
                            variant={rotation === deg ? "default" : "outline"}
                            onClick={() => setRotation(deg)}
                            className={cn(rotation === deg && "bg-emerald-600")}
                          >
                            {deg}°
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Speed */}
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">
                        Speed: {speed}x
                      </Label>
                      <Slider
                        value={[speed]}
                        onValueChange={([value]) => setSpeed(value)}
                        min={0.25}
                        max={4}
                        step={0.25}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>0.25x</span>
                        <span>4x</span>
                      </div>
                    </div>

                    {/* Crop */}
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Crop Area (%)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">X Position</Label>
                          <Input
                            type="number"
                            value={cropArea.x}
                            onChange={(e) => setCropArea({...cropArea, x: parseFloat(e.target.value) || 0})}
                            min={0}
                            max={100}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Y Position</Label>
                          <Input
                            type="number"
                            value={cropArea.y}
                            onChange={(e) => setCropArea({...cropArea, y: parseFloat(e.target.value) || 0})}
                            min={0}
                            max={100}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Width</Label>
                          <Input
                            type="number"
                            value={cropArea.width}
                            onChange={(e) => setCropArea({...cropArea, width: parseFloat(e.target.value) || 100})}
                            min={1}
                            max={100}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Height</Label>
                          <Input
                            type="number"
                            value={cropArea.height}
                            onChange={(e) => setCropArea({...cropArea, height: parseFloat(e.target.value) || 100})}
                            min={1}
                            max={100}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="effects" className="space-y-4 mt-0">
                    {/* Text Overlays */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-semibold">Text Overlays</Label>
                        <Button size="sm" variant="outline" onClick={addTextOverlay}>
                          <Type className="w-3 h-3 mr-1" />
                          Add Text
                        </Button>
                      </div>
                      
                      {showTextEditor && editingText && (
                        <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border mb-3">
                          <Input
                            placeholder="Text"
                            value={editingText.text}
                            onChange={(e) => updateTextOverlay(editingText.id, { text: e.target.value })}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              placeholder="X"
                              value={editingText.x}
                              onChange={(e) => updateTextOverlay(editingText.id, { x: parseInt(e.target.value) || 0 })}
                            />
                            <Input
                              type="number"
                              placeholder="Y"
                              value={editingText.y}
                              onChange={(e) => updateTextOverlay(editingText.id, { y: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                          <Button
                            onClick={() => deleteTextOverlay(editingText.id)}
                            variant="destructive"
                            size="sm"
                            className="w-full"
                          >
                            Delete Text
                          </Button>
                        </div>
                      )}

                      <div className="space-y-1">
                        {textOverlays.map(overlay => (
                          <div
                            key={overlay.id}
                            onClick={() => {
                              setEditingText(overlay);
                              setShowTextEditor(true);
                            }}
                            className="p-2 bg-slate-100 dark:bg-slate-800 rounded cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-xs"
                          >
                            "{overlay.text}"
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Blur Areas */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-semibold">Blur Areas</Label>
                        <Button size="sm" variant="outline" onClick={addBlurArea}>
                          <Blur className="w-3 h-3 mr-1" />
                          Add Blur
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        {blurAreas.length} blur area(s) added
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="audio" className="space-y-4 mt-0">
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">
                        Volume: {volume}%
                      </Label>
                      <Slider
                        value={[volume]}
                        onValueChange={([value]) => setVolume(value)}
                        min={0}
                        max={200}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Mute</span>
                        <span>200%</span>
                      </div>
                    </div>
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