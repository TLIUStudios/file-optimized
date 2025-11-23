import { useState, useRef, useEffect, useCallback } from "react";
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
      console.log('🎨 GIF Editor opened');
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

  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    const frame = frames[frameIndex];
    
    if (!canvas) {
      console.error('Canvas ref not available');
      return;
    }
    
    if (!frame) {
      console.error('Frame not found:', frameIndex);
      return;
    }

    if (!frame.canvas) {
      console.error('Frame canvas not available:', frameIndex);
      return;
    }
    
    try {
      // Only set dimensions if they changed
      if (canvas.width !== frame.width || canvas.height !== frame.height) {
        canvas.width = frame.width;
        canvas.height = frame.height;
      }
      
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) {
        console.error('Failed to get canvas context');
        return;
      }
      
      // Draw frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(frame.canvas, 0, 0);

      // Draw text overlays for this frame
      textOverlays.filter(t => t.frameIndex === frameIndex).forEach(overlay => {
        ctx.font = `${overlay.fontSize}px ${overlay.fontFamily}`;
        ctx.fillStyle = overlay.color;
        ctx.textAlign = overlay.align;
        ctx.fillText(overlay.text, overlay.x, overlay.y);
      });
    } catch (error) {
      console.error('Error drawing frame:', error);
    }
  }, [frames, textOverlays]);

  useEffect(() => {
    console.log('Draw effect triggered:', { framesCount: frames.length, currentFrame, hasCanvas: !!canvasRef.current });
    if (frames.length > 0 && canvasRef.current) {
      drawFrame(currentFrame);
    }
  }, [currentFrame, frames, textOverlays, drawFrame]);

  const loadGifFrames = async () => {
    try {
      console.log('📦 Loading GIF frames...');
      const response = await fetch(gifData);
      const arrayBuffer = await response.arrayBuffer();

      const { parseGIF, decompressFrames } = await import('https://cdn.jsdelivr.net/npm/gifuct-js@2.1.2/+esm');
      const gif = parseGIF(arrayBuffer);
      const decompressed = decompressFrames(gif, true);

      console.log(`✅ ${decompressed.length} frames loaded`);

      if (decompressed.length === 0) {
        throw new Error('No frames found in GIF');
      }

      // Get canvas dimensions from first frame
      const canvasWidth = decompressed[0].dims.width;
      const canvasHeight = decompressed[0].dims.height;

      // Background canvas for accumulation
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = canvasWidth;
      bgCanvas.height = canvasHeight;
      const bgCtx = bgCanvas.getContext('2d', { alpha: true });

      const loadedFrames = [];

      for (let i = 0; i < decompressed.length; i++) {
        const frame = decompressed[i];
        
        // Handle disposal
        if (i > 0) {
          const prevFrame = decompressed[i - 1];
          if (prevFrame.disposalType === 2) {
            bgCtx.clearRect(
              prevFrame.dims.left || 0,
              prevFrame.dims.top || 0,
              prevFrame.dims.width,
              prevFrame.dims.height
            );
          }
        }

        // Draw frame patch
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = frame.dims.width;
        tempCanvas.height = frame.dims.height;
        const tempCtx = tempCanvas.getContext('2d', { alpha: true });
        
        const imageData = new ImageData(
          new Uint8ClampedArray(frame.patch),
          frame.dims.width,
          frame.dims.height
        );
        tempCtx.putImageData(imageData, 0, 0);

        bgCtx.drawImage(
          tempCanvas,
          frame.dims.left || 0,
          frame.dims.top || 0
        );

        // Copy to final canvas
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = canvasWidth;
        frameCanvas.height = canvasHeight;
        const frameCtx = frameCanvas.getContext('2d', { alpha: true });
        frameCtx.drawImage(bgCanvas, 0, 0);

        // Cache data URL for thumbnails to avoid blocking renders
        const dataUrl = frameCanvas.toDataURL('image/png');
        
        loadedFrames.push({
          id: i,
          canvas: frameCanvas,
          dataUrl: dataUrl,
          delay: frame.delay * 10 || 100,
          width: canvasWidth,
          height: canvasHeight
        });

        if (i % 10 === 0) {
          console.log(`Loaded frame ${i + 1}/${decompressed.length}`);
        }
      }

      console.log('Setting frames state with', loadedFrames.length, 'frames');
      setFrames(loadedFrames);
      setGlobalDelay(loadedFrames[0]?.delay || 100);
      setCurrentFrame(0);
      
      toast.success(`Loaded ${loadedFrames.length} frames`);
    } catch (error) {
      console.error('❌ Failed to load GIF:', error);
      toast.error('Failed to load GIF: ' + error.message);
    }
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
    // Create a new canvas for the duplicated frame to avoid reference issues
    const newCanvas = document.createElement('canvas');
    newCanvas.width = frame.canvas.width;
    newCanvas.height = frame.canvas.height;
    const newCtx = newCanvas.getContext('2d');
    newCtx.drawImage(frame.canvas, 0, 0);

    const newFrame = { ...frame, id: Date.now(), canvas: newCanvas }; // Assign a new unique ID and new canvas
    setFrames(prev => [
      ...prev.slice(0, frameIndex + 1),
      newFrame,
      ...prev.slice(frameIndex + 1)
    ]);
    toast.success('Frame duplicated');
  };

  const addTextOverlay = () => {
    if (!frames.length) {
      toast.error("No frames to add text to.");
      return;
    }
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
    setEditingText(prev => prev && prev.id === id ? { ...prev, ...updates } : prev);
  };

  const deleteTextOverlay = (id) => {
    setTextOverlays(prev => prev.filter(t => t.id !== id));
    if (editingText?.id === id) {
      setEditingText(null);
      setShowTextEditor(false);
    }
  };

  const applyEffect = async (effect) => {
    if (!frames.length) {
      toast.error("No frames to apply effects to.");
      return;
    }
    toast.info('Applying effect...', { duration: Infinity, id: 'effect-apply' });
    
    const newFrames = await Promise.all(frames.map(async (frame) => {
      // Create a new canvas for the modified frame to avoid altering the original
      const newFrameCanvas = document.createElement('canvas');
      newFrameCanvas.width = frame.width;
      newFrameCanvas.height = frame.height;
      const ctx = newFrameCanvas.getContext('2d');
      
      // Draw the original frame's content to the new canvas
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
          ctx.clearRect(0, 0, frame.width, frame.height);
          ctx.drawImage(frame.canvas, 0, 0);
          ctx.filter = 'none';
          break;
        case 'contrast':
          ctx.filter = 'contrast(1.3)';
          ctx.clearRect(0, 0, frame.width, frame.height);
          ctx.drawImage(frame.canvas, 0, 0);
          ctx.filter = 'none';
          break;
        case 'blur':
          ctx.filter = 'blur(2px)';
          ctx.clearRect(0, 0, frame.width, frame.height);
          ctx.drawImage(frame.canvas, 0, 0);
          ctx.filter = 'none';
          break;
        default:
          // No effect or unknown effect, just return original canvas (already copied)
          break;
      }
      
      return { ...frame, canvas: newFrameCanvas }; // Return frame with new canvas
    }));
    
    setFrames(newFrames);
    toast.dismiss('effect-apply');
    toast.success('Effect applied to all frames');
  };

  const saveGif = async () => {
    if (!frames.length) {
      toast.error("No frames to save.");
      return;
    }

    try {
      toast.info('Creating GIF...', { duration: Infinity, id: 'gif-save' });
      
      const workerResponse = await fetch('https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js');
      const workerText = await workerResponse.text();
      const workerBlob = new Blob([workerText], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(workerBlob);

      // Dynamically load gif.js library
      // gif.js is globally available as `window.GIF` after loading
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      const GIF = window.GIF;
      const gif = new GIF({
        workers: 4,
        quality: 5,
        width: frames[0].width,
        height: frames[0].height,
        workerScript: workerUrl,
        repeat: 0 // Loop indefinitely
      });

      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const canvas = document.createElement('canvas');
        canvas.width = frame.width;
        canvas.height = frame.height;
        const ctx = canvas.getContext('2d');
        
        // Draw the frame's pre-rendered canvas content
        ctx.drawImage(frame.canvas, 0, 0);
        
        // Draw text overlays that apply to this specific frame
        textOverlays.filter(t => t.frameIndex === i).forEach(overlay => { // Filter by frame index
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

      const blob = await new Promise((resolve, reject) => {
        gif.on('finished', resolve);
        gif.on('error', reject); // Handle potential errors during rendering
        gif.render();
      });

      URL.revokeObjectURL(workerUrl); // Clean up the worker URL
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
                {frames.length > 0 ? (
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-full bg-white dark:bg-slate-800 rounded-lg shadow-lg"
                    style={{ 
                      imageRendering: 'auto',
                      minWidth: '100px',
                      minHeight: '100px'
                    }}
                  />
                ) : (
                  <div className="text-slate-400 text-sm">Loading frames...</div>
                )}
              </div>

              {/* Playback Controls */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentFrame(prev => Math.max(0, prev - 1))}
                    disabled={frames.length === 0 || currentFrame === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={frames.length === 0}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentFrame(prev => Math.min(frames.length - 1, prev + 1))}
                    disabled={frames.length === 0 || currentFrame === frames.length - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Frame {frames.length > 0 ? currentFrame + 1 : 0} / {frames.length}
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
                      <img
                        src={frame.dataUrl}
                        alt={`Frame ${index + 1}`}
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
                      disabled={frames.length === 0}
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
                      disabled={frames.length === 0}
                    />
                    <Button
                      onClick={applyGlobalDelay}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      disabled={frames.length === 0}
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
                      disabled={frames.length === 0}
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
                            onChange={(e) => updateTextOverlay(editingText.id, { fontSize: parseInt(e.target.value) || 0 })}
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
                            onChange={(e) => updateTextOverlay(editingText.id, { x: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Y Position</Label>
                          <Input
                            type="number"
                            value={editingText.y}
                            onChange={(e) => updateTextOverlay(editingText.id, { y: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      
                      <Select value={editingText.align} onValueChange={(value) => updateTextOverlay(editingText.id, { align: value })}>
                          <SelectTrigger className="w-full">
                              <SelectValue placeholder="Text Alignment" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                          </SelectContent>
                      </Select>

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
                        "{overlay.text}" (Frame {overlay.frameIndex + 1})
                      </div>
                    ))}
                    {textOverlays.filter(t => t.frameIndex !== currentFrame).length > 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        ({textOverlays.filter(t => t.frameIndex !== currentFrame).length} other text overlays on different frames)
                      </p>
                    )}
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
                      disabled={frames.length === 0}
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      Grayscale
                    </Button>
                    <Button
                      onClick={() => applyEffect('brightness')}
                      variant="outline"
                      size="sm"
                      disabled={frames.length === 0}
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      Brightness
                    </Button>
                    <Button
                      onClick={() => applyEffect('contrast')}
                      variant="outline"
                      size="sm"
                      disabled={frames.length === 0}
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      Contrast
                    </Button>
                    <Button
                      onClick={() => applyEffect('blur')}
                      variant="outline"
                      size="sm"
                      disabled={frames.length === 0}
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
                      disabled={frames.length === 0}
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