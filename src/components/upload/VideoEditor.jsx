import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Play, Pause, RotateCw, Scissors, Type, Maximize2, Zap, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VideoEditor({ isOpen, onClose, videoData, onSave, ffmpegRef }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isCropping, setIsCropping] = useState(false);
  const [textOverlays, setTextOverlays] = useState([]);
  const [blurAreas, setBlurAreas] = useState([]);
  const [processing, setProcessing] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.src = videoData;
      videoRef.current.onloadedmetadata = () => {
        const dur = videoRef.current.duration;
        setDuration(dur);
        setTrimEnd(dur);
        
        // Set crop area to full video size
        setCropArea({
          x: 0,
          y: 0,
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight
        });
      };
    }
  }, [isOpen, videoData]);

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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (value) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const addTextOverlay = () => {
    setTextOverlays([...textOverlays, {
      id: Date.now(),
      text: 'Sample Text',
      x: 50,
      y: 50,
      fontSize: 32,
      color: '#FFFFFF',
      startTime: currentTime,
      endTime: currentTime + 5
    }]);
  };

  const addBlurArea = () => {
    setBlurAreas([...blurAreas, {
      id: Date.now(),
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      startTime: currentTime,
      endTime: currentTime + 5
    }]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const applyEdits = async () => {
    if (!ffmpegRef.current) {
      toast.error('FFmpeg not loaded. Please wait...');
      return;
    }

    setProcessing(true);
    toast.info('Processing video...', { duration: Infinity, id: 'video-edit' });

    try {
      const ffmpeg = ffmpegRef.current;
      
      // Fetch video data
      const response = await fetch(videoData);
      const videoBlob = await response.blob();
      const videoArray = new Uint8Array(await videoBlob.arrayBuffer());
      
      await ffmpeg.writeFile('input.mp4', videoArray);

      // Build FFmpeg command
      let filterComplex = [];
      let inputArgs = ['-i', 'input.mp4'];
      
      // Trim
      if (trimStart > 0 || trimEnd < duration) {
        inputArgs.push('-ss', trimStart.toString());
        inputArgs.push('-to', trimEnd.toString());
      }

      // Speed
      if (speed !== 1) {
        filterComplex.push(`setpts=${(1/speed).toFixed(2)}*PTS`);
      }

      // Rotation
      if (rotation !== 0) {
        const rotations = { 90: 'transpose=1', 180: 'transpose=1,transpose=1', 270: 'transpose=2' };
        if (rotations[rotation]) {
          filterComplex.push(rotations[rotation]);
        }
      }

      // Crop
      if (isCropping && cropArea.width > 0 && cropArea.height > 0) {
        filterComplex.push(`crop=${cropArea.width}:${cropArea.height}:${cropArea.x}:${cropArea.y}`);
      }

      // Text overlays
      textOverlays.forEach((overlay, idx) => {
        const text = overlay.text.replace(/'/g, "\\'");
        filterComplex.push(
          `drawtext=text='${text}':x=${overlay.x}:y=${overlay.y}:fontsize=${overlay.fontSize}:fontcolor=${overlay.color}:enable='between(t,${overlay.startTime},${overlay.endTime})'`
        );
      });

      // Blur areas
      blurAreas.forEach((area) => {
        filterComplex.push(
          `boxblur=enable='between(t,${area.startTime},${area.endTime})':luma_radius=10:luma_power=1`
        );
      });

      const outputArgs = [...inputArgs];
      
      if (filterComplex.length > 0) {
        outputArgs.push('-vf', filterComplex.join(','));
      }
      
      outputArgs.push('-c:a', 'copy');
      outputArgs.push('output.mp4');

      console.log('FFmpeg command:', outputArgs.join(' '));
      await ffmpeg.exec(outputArgs);

      const data = await ffmpeg.readFile('output.mp4');
      const editedBlob = new Blob([data.buffer], { type: 'video/mp4' });

      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp4');

      toast.dismiss('video-edit');
      toast.success('Video edited successfully!');
      
      onSave(URL.createObjectURL(editedBlob), editedBlob);
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
      <DialogContent className="max-w-7xl w-[98vw] h-[98vh] p-0 overflow-hidden [&>button]:hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Video Editor</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Edit your video before compression</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={applyEdits} disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {processing ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Apply Edits
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
            <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 overflow-auto">
              <div className="flex-1 flex items-center justify-center p-4">
                <video
                  ref={videoRef}
                  onTimeUpdate={handleTimeUpdate}
                  className="max-w-full max-h-full rounded-lg shadow-lg"
                  style={{ transform: `rotate(${rotation}deg)` }}
                />
              </div>

              {/* Playback Controls */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4 mb-4">
                  <Button variant="outline" size="icon" onClick={handlePlayPause}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  
                  <div className="flex-1">
                    <Slider
                      value={[currentTime]}
                      onValueChange={handleSeek}
                      min={0}
                      max={duration}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Tools */}
            <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
              <Tabs defaultValue="trim" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="trim">Trim</TabsTrigger>
                  <TabsTrigger value="adjust">Adjust</TabsTrigger>
                  <TabsTrigger value="effects">Effects</TabsTrigger>
                </TabsList>

                <div className="p-4 space-y-6">
                  <TabsContent value="trim" className="space-y-4">
                    <div>
                      <Label className="text-xs">Trim Start: {formatTime(trimStart)}</Label>
                      <Slider
                        value={[trimStart]}
                        onValueChange={(v) => setTrimStart(v[0])}
                        min={0}
                        max={duration}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Trim End: {formatTime(trimEnd)}</Label>
                      <Slider
                        value={[trimEnd]}
                        onValueChange={(v) => setTrimEnd(v[0])}
                        min={0}
                        max={duration}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Duration: {formatTime(trimEnd - trimStart)}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="adjust" className="space-y-4">
                    <div>
                      <Label className="text-xs">Rotation</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {[0, 90, 180, 270].map((rot) => (
                          <Button
                            key={rot}
                            size="sm"
                            variant={rotation === rot ? "default" : "outline"}
                            onClick={() => setRotation(rot)}
                            className={cn(rotation === rot && "bg-emerald-600")}
                          >
                            {rot}°
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Speed: {speed}x</Label>
                      <Slider
                        value={[speed]}
                        onValueChange={(v) => setSpeed(v[0])}
                        min={0.25}
                        max={4}
                        step={0.25}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>0.25x</span>
                        <span>4x</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs mb-2 block">Crop</Label>
                      <Button
                        size="sm"
                        variant={isCropping ? "default" : "outline"}
                        onClick={() => setIsCropping(!isCropping)}
                        className="w-full"
                      >
                        <Scissors className="w-3 h-3 mr-2" />
                        {isCropping ? 'Disable Crop' : 'Enable Crop'}
                      </Button>
                      
                      {isCropping && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <Label className="text-[10px]">X</Label>
                            <Input
                              type="number"
                              value={cropArea.x}
                              onChange={(e) => setCropArea({...cropArea, x: parseInt(e.target.value) || 0})}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px]">Y</Label>
                            <Input
                              type="number"
                              value={cropArea.y}
                              onChange={(e) => setCropArea({...cropArea, y: parseInt(e.target.value) || 0})}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px]">Width</Label>
                            <Input
                              type="number"
                              value={cropArea.width}
                              onChange={(e) => setCropArea({...cropArea, width: parseInt(e.target.value) || 0})}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px]">Height</Label>
                            <Input
                              type="number"
                              value={cropArea.height}
                              onChange={(e) => setCropArea({...cropArea, height: parseInt(e.target.value) || 0})}
                              className="h-8"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="effects" className="space-y-4">
                    <div>
                      <Label className="text-xs mb-2 block">Text Overlays</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={addTextOverlay}
                        className="w-full"
                      >
                        <Type className="w-3 h-3 mr-2" />
                        Add Text
                      </Button>
                      
                      {textOverlays.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {textOverlays.map((overlay, idx) => (
                            <div key={overlay.id} className="p-2 bg-slate-50 dark:bg-slate-950 rounded text-xs">
                              <Input
                                placeholder="Text"
                                value={overlay.text}
                                onChange={(e) => {
                                  const updated = [...textOverlays];
                                  updated[idx].text = e.target.value;
                                  setTextOverlays(updated);
                                }}
                                className="h-7 text-xs mb-1"
                              />
                              <div className="flex gap-1">
                                <Input
                                  type="number"
                                  placeholder="X"
                                  value={overlay.x}
                                  onChange={(e) => {
                                    const updated = [...textOverlays];
                                    updated[idx].x = parseInt(e.target.value) || 0;
                                    setTextOverlays(updated);
                                  }}
                                  className="h-6 text-xs"
                                />
                                <Input
                                  type="number"
                                  placeholder="Y"
                                  value={overlay.y}
                                  onChange={(e) => {
                                    const updated = [...textOverlays];
                                    updated[idx].y = parseInt(e.target.value) || 0;
                                    setTextOverlays(updated);
                                  }}
                                  className="h-6 text-xs"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setTextOverlays(textOverlays.filter((_, i) => i !== idx))}
                                  className="h-6 w-6"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs mb-2 block">Blur Areas</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={addBlurArea}
                        className="w-full"
                      >
                        <Maximize2 className="w-3 h-3 mr-2" />
                        Add Blur Area
                      </Button>
                      
                      {blurAreas.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {blurAreas.map((area, idx) => (
                            <div key={area.id} className="p-2 bg-slate-50 dark:bg-slate-950 rounded flex items-center justify-between text-xs">
                              <span>Area {idx + 1}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setBlurAreas(blurAreas.filter((_, i) => i !== idx))}
                                className="h-6 w-6"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
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