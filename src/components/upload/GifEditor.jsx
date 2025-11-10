import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Play, Pause, Plus, Trash2, Type, Wand2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GifEditor({ isOpen, onClose, gifData, onSave }) {
  const [frames, setFrames] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFrames, setSelectedFrames] = useState([]);
  const [globalDelay, setGlobalDelay] = useState(100);
  const [textOverlays, setTextOverlays] = useState([]);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingText, setEditingText] = useState(null);
  const canvasRef = useRef(null);
  const playIntervalRef = useRef(null);

  useEffect(() => {
    if (isOpen && gifData) {
      loadGifFrames();
    }
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isOpen, gifData]);

  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      playIntervalRef.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % frames.length);
      }, frames[currentFrame]?.delay || globalDelay);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    }
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, frames, currentFrame, globalDelay]);

  useEffect(() => {
    if (frames.length > 0 && canvasRef.current) {
      drawFrame(currentFrame);
    }
  }, [currentFrame, frames, textOverlays]);

  const loadGifFrames = async () => {
    try {
      const response = await fetch(gifData);
      const arrayBuffer = await response.arrayBuffer();

      const { parseGIF, decompressFrames } = await import('https://cdn.jsdelivr.net/npm/gifuct-js@2.1.2/+esm');
      const gif = parseGIF(arrayBuffer);
      const decompressed = decompressFrames(gif, true);

      const loadedFrames = decompressed.map((frame, index) => ({
        id: index,
        canvas: createCanvasFromFrame(frame),
        delay: frame.delay * 10 || 100,
        width: frame.dims.width,
        height: frame.dims.height
      }));

      setFrames(loadedFrames);
      setGlobalDelay(loadedFrames[0]?.delay || 100);
      toast.success(`Loaded ${loadedFrames.length} frames`);
    } catch (error) {
      console.error('Error loading GIF:', error);
      toast.error('Failed to load GIF frames');
    }
  };

  const createCanvasFromFrame = (frame) => {
    const canvas = document.createElement('canvas');
    canvas.width = frame.dims.width;
    canvas.height = frame.dims.height;
    const ctx = canvas.getContext('2d');
    
    const imageData = new ImageData(
      new Uint8ClampedArray(frame.patch),
      frame.dims.width,
      frame.dims.height
    );
    ctx.putImageData(imageData, 0, 0);
    
    return canvas;
  };

  const drawFrame = (frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas || !frames[frameIndex]) return;

    const frame = frames[frameIndex];
    canvas.width = frame.width;
    canvas.height = frame.height;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frame.canvas, 0, 0);

    // Draw text overlays for this frame
    textOverlays.filter(t => t.frameIndex === frameIndex).forEach(overlay => {
      ctx.font = `${overlay.fontSize}px ${overlay.fontFamily}`;
      ctx.fillStyle = overlay.color;
      ctx.textAlign = overlay.align;
      ctx.fillText(overlay.text, overlay.x, overlay.y);
    });
  };

  const updateFrameDelay = (frameIndex, delay) => {
    setFrames(prev => prev.map((f, i) => 
      i === frameIndex ? { ...f, delay } : f
    ));
  };

  const applyGlobalDelay = () => {
    setFrames(prev => prev.map(f => ({ ...f, delay: globalDelay })));
    toast.success('Applied global delay to all frames');
  };

  const deleteSelectedFrames = () => {
    if (selectedFrames.length === 0) {
      toast.error('No frames selected');
      return;
    }
    
    setFrames(prev => prev.filter((_, i) => !selectedFrames.includes(i)));
    setSelectedFrames([]);
    setCurrentFrame(0);
    toast.success(`Deleted ${selectedFrames.length} frame(s)`);
  };

  const duplicateFrame = (frameIndex) => {
    const frame = frames[frameIndex];
    const newFrame = { ...frame, id: Date.now() };
    setFrames(prev => [
      ...prev.slice(0, frameIndex + 1),
      newFrame,
      ...prev.slice(frameIndex + 1)
    ]);
    toast.success('Frame duplicated');
  };

  const addTextOverlay = () => {
    const newOverlay = {
      id: Date.now(),
      frameIndex: currentFrame,
      text: 'Sample Text',
      x: frames[currentFrame].width / 2,
      y: frames[currentFrame].height / 2,
      fontSize: 32,
      fontFamily: 'Arial',
      color: '#FFFFFF',
      align: 'center'
    };
    setTextOverlays(prev => [...prev, newOverlay]);
    setEditingText(newOverlay);
    setShowTextEditor(true);
  };

  const updateTextOverlay = (id, updates) => {
    setTextOverlays(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTextOverlay = (id) => {
    setTextOverlays(prev => prev.filter(t => t.id !== id));
    if (editingText?.id === id) {
      setEditingText(null);
      setShowTextEditor(false);
    }
  };

  const applyEffect = async (effect) => {
    toast.info('Applying effect...');
    
    const newFrames = await Promise.all(frames.map(async (frame) => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = frame.width;
      tempCanvas.height = frame.height;
      const ctx = tempCanvas.getContext('2d');
      
      ctx.drawImage(frame.canvas, 0, 0);
      
      switch (effect) {
        case 'grayscale':
          const imageData = ctx.getImageData(0, 0, frame.width, frame.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = data[i + 1] = data[i + 2] = avg;
          }
          ctx.putImageData(imageData, 0, 0);
          break;
        case 'brightness':
          ctx.filter = 'brightness(1.2)';
          ctx.drawImage(frame.canvas, 0, 0);
          break;
        case 'contrast':
          ctx.filter = 'contrast(1.3)';
          ctx.drawImage(frame.canvas, 0, 0);
          break;
        case 'blur':
          ctx.filter = 'blur(2px)';
          ctx.drawImage(frame.canvas, 0, 0);
          break;
      }
      
      return { ...frame, canvas: tempCanvas };
    }));
    
    setFrames(newFrames);
    toast.success('Effect applied to all frames');
  };

  const saveGif = async () => {
    try {
      toast.info('Creating GIF...', { duration: Infinity, id: 'gif-save' });
      
      const workerResponse = await fetch('https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js');
      const workerText = await workerResponse.text();
      const workerBlob = new Blob([workerText], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(workerBlob);

      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js';
        script.onload = resolve;
        document.head.appendChild(script);
      });

      const GIF = window.GIF;
      const gif = new GIF({
        workers: 4,
        quality: 5,
        width: frames[0].width,
        height: frames[0].height,
        workerScript: workerUrl,
        repeat: 0
      });

      for (const frame of frames) {
        const canvas = document.createElement('canvas');
        canvas.width = frame.width;
        canvas.height = frame.height;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(frame.canvas, 0, 0);
        
        // Draw text overlays
        textOverlays.filter(t => t.frameIndex === frame.id).forEach(overlay => {
          ctx.font = `${overlay.fontSize}px ${overlay.fontFamily}`;
          ctx.fillStyle = overlay.color;
          ctx.textAlign = overlay.align;
          ctx.fillText(overlay.text, overlay.x, overlay.y);
        });
        
        gif.addFrame(canvas, { delay: frame.delay, copy: true });
      }

      gif.on('progress', (p) => {
        toast.info(`Creating GIF: ${(p * 100).toFixed(0)}%...`, { id: 'gif-save' });
      });

      const blob = await new Promise((resolve) => {
        gif.on('finished', resolve);
        gif.render();
      });

      URL.revokeObjectURL(workerUrl);
      toast.dismiss('gif-save');
      
      onSave(blob);
      onClose();
      toast.success('GIF saved successfully!');
    } catch (error) {
      console.error('Error saving GIF:', error);
      toast.dismiss('gif-save');
      toast.error('Failed to save GIF');
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
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">GIF Editor</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{frames.length} frames loaded</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={saveGif} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Save GIF
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 overflow-auto">
              <div className="flex-1 flex items-center justify-center p-4">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-full bg-white dark:bg-slate-800 rounded-lg shadow-lg"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              {/* Playback Controls */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentFrame(prev => Math.max(0, prev - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentFrame(prev => Math.min(frames.length - 1, prev + 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Frame {currentFrame + 1} / {frames.length}
                  </span>
                </div>

                {/* Timeline */}
                <div className="flex gap-1 overflow-x-auto pb-2">
                  {frames.map((frame, index) => (
                    <div
                      key={frame.id}
                      onClick={() => setCurrentFrame(index)}
                      onDoubleClick={() => {
                        if (selectedFrames.includes(index)) {
                          setSelectedFrames(prev => prev.filter(i => i !== index));
                        } else {
                          setSelectedFrames(prev => [...prev, index]);
                        }
                      }}
                      className={cn(
                        "relative flex-shrink-0 w-16 h-16 cursor-pointer border-2 rounded transition-all",
                        currentFrame === index
                          ? "border-emerald-600 scale-110"
                          : selectedFrames.includes(index)
                          ? "border-blue-500"
                          : "border-slate-300 dark:border-slate-700 hover:border-slate-400"
                      )}
                    >
                      <canvas
                        ref={el => {
                          if (el) {
                            el.width = frame.width;
                            el.height = frame.height;
                            const ctx = el.getContext('2d');
                            ctx.drawImage(frame.canvas, 0, 0);
                          }
                        }}
                        className="w-full h-full object-contain rounded"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[8px] text-center py-0.5">
                        {frame.delay}ms
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Tools */}
            <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
              <div className="p-4 space-y-6">
                {/* Frame Timing */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Frame Timing</h3>
                  
                  <div>
                    <Label className="text-xs">Current Frame Delay: {frames[currentFrame]?.delay || 0}ms</Label>
                    <Slider
                      value={[frames[currentFrame]?.delay || 100]}
                      onValueChange={([value]) => updateFrameDelay(currentFrame, value)}
                      min={10}
                      max={1000}
                      step={10}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Global Delay: {globalDelay}ms</Label>
                    <Slider
                      value={[globalDelay]}
                      onValueChange={([value]) => setGlobalDelay(value)}
                      min={10}
                      max={1000}
                      step={10}
                      className="mt-2"
                    />
                    <Button
                      onClick={applyGlobalDelay}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                    >
                      Apply to All Frames
                    </Button>
                  </div>
                </div>

                {/* Text Overlays */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Text Overlays</h3>
                    <Button
                      onClick={addTextOverlay}
                      size="sm"
                      variant="outline"
                    >
                      <Type className="w-3 h-3 mr-1" />
                      Add Text
                    </Button>
                  </div>

                  {showTextEditor && editingText && (
                    <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border">
                      <Input
                        placeholder="Text"
                        value={editingText.text}
                        onChange={(e) => updateTextOverlay(editingText.id, { text: e.target.value })}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Font Size</Label>
                          <Input
                            type="number"
                            value={editingText.fontSize}
                            onChange={(e) => updateTextOverlay(editingText.id, { fontSize: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Color</Label>
                          <Input
                            type="color"
                            value={editingText.color}
                            onChange={(e) => updateTextOverlay(editingText.id, { color: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">X Position</Label>
                          <Input
                            type="number"
                            value={editingText.x}
                            onChange={(e) => updateTextOverlay(editingText.id, { x: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Y Position</Label>
                          <Input
                            type="number"
                            value={editingText.y}
                            onChange={(e) => updateTextOverlay(editingText.id, { y: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      <Button
                        onClick={() => deleteTextOverlay(editingText.id)}
                        variant="destructive"
                        size="sm"
                        className="w-full"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete Text
                      </Button>
                    </div>
                  )}

                  <div className="space-y-1">
                    {textOverlays.filter(t => t.frameIndex === currentFrame).map(overlay => (
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

                {/* Visual Effects */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Visual Effects</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => applyEffect('grayscale')}
                      variant="outline"
                      size="sm"
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      Grayscale
                    </Button>
                    <Button
                      onClick={() => applyEffect('brightness')}
                      variant="outline"
                      size="sm"
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      Brightness
                    </Button>
                    <Button
                      onClick={() => applyEffect('contrast')}
                      variant="outline"
                      size="sm"
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      Contrast
                    </Button>
                    <Button
                      onClick={() => applyEffect('blur')}
                      variant="outline"
                      size="sm"
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      Blur
                    </Button>
                  </div>
                </div>

                {/* Frame Management */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Frame Management</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => duplicateFrame(currentFrame)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Duplicate
                    </Button>
                    <Button
                      onClick={deleteSelectedFrames}
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      disabled={selectedFrames.length === 0}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete ({selectedFrames.length})
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Double-click frames in timeline to select multiple
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}