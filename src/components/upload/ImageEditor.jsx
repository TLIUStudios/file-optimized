import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, RotateCw, Crop, ZoomIn, ZoomOut, Sun, Contrast, Droplet, Sparkles, Undo, Redo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ImageEditor({ isOpen, onClose, imageData, onSave }) {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const canvasRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [originalImage, setOriginalImage] = useState(null);

  // History management for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (imageData && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setImageDimensions({ width: img.width, height: img.height });
        drawCanvas(img);
        
        // Initialize history with default state
        const initialState = {
          rotation: 0,
          scale: 1,
          brightness: 100,
          contrast: 100,
          saturation: 100,
          blur: 0,
          cropArea: { x: 0, y: 0, width: 100, height: 100 }
        };
        setHistory([initialState]);
        setHistoryIndex(0);
      };
      img.src = imageData;
    }
  }, [imageData]);

  useEffect(() => {
    if (originalImage) {
      drawCanvas(originalImage);
    }
  }, [rotation, scale, brightness, contrast, saturation, blur]);

  const saveToHistory = () => {
    const newState = {
      rotation,
      scale,
      brightness,
      contrast,
      saturation,
      blur,
      cropArea: { ...cropArea }
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
      
      setRotation(state.rotation);
      setScale(state.scale);
      setBrightness(state.brightness);
      setContrast(state.contrast);
      setSaturation(state.saturation);
      setBlur(state.blur);
      setCropArea(state.cropArea);
      setHistoryIndex(newIndex);
      
      toast.success('Undo applied');
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      
      setRotation(state.rotation);
      setScale(state.scale);
      setBrightness(state.brightness);
      setContrast(state.contrast);
      setSaturation(state.saturation);
      setBlur(state.blur);
      setCropArea(state.cropArea);
      setHistoryIndex(newIndex);
      
      toast.success('Redo applied');
    }
  };

  const drawCanvas = (img) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    
    // Apply filters
    const filters = [];
    if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
    if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
    if (saturation !== 100) filters.push(`saturate(${saturation}%)`);
    if (blur > 0) filters.push(`blur(${blur}px)`);
    
    ctx.filter = filters.join(' ');
    
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    
    ctx.restore();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let finalCanvas = canvas;

    // Apply crop if in crop mode
    if (cropMode && (cropArea.width !== 100 || cropArea.height !== 100 || cropArea.x !== 0 || cropArea.y !== 0)) {
      const cropCanvas = document.createElement('canvas');
      const ctx = cropCanvas.getContext('2d');
      
      const x = (cropArea.x / 100) * canvas.width;
      const y = (cropArea.y / 100) * canvas.height;
      const width = (cropArea.width / 100) * canvas.width;
      const height = (cropArea.height / 100) * canvas.height;
      
      cropCanvas.width = width;
      cropCanvas.height = height;
      
      ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
      finalCanvas = cropCanvas;
    }

    finalCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      onSave(url, blob);
      toast.success('Changes applied!');
      onClose();
    }, 'image/png');
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    setTimeout(saveToHistory, 100);
  };

  const handleReset = () => {
    setRotation(0);
    setScale(1);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setCropMode(false);
    setCropArea({ x: 0, y: 0, width: 100, height: 100 });
    saveToHistory();
  };

  const applyFilter = (filterName) => {
    switch (filterName) {
      case 'grayscale':
        setSaturation(0);
        break;
      case 'sepia':
        setBrightness(110);
        setContrast(90);
        setSaturation(80);
        break;
      case 'vintage':
        setBrightness(105);
        setContrast(95);
        setSaturation(70);
        break;
      case 'cool':
        setBrightness(105);
        setContrast(110);
        setSaturation(120);
        break;
      default:
        handleReset();
    }
    setTimeout(saveToHistory, 100);
  };

  if (!isOpen) return null;

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-0 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Image</h2>
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
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[calc(95vh-80px)]">
          {/* Canvas Preview */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-900 p-4 flex items-center justify-center overflow-auto">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[60vh] rounded"
                style={{ imageRendering: 'high-quality' }}
              />
              {cropMode && (
                <div 
                  className="absolute border-2 border-emerald-500 bg-emerald-500/10"
                  style={{
                    left: `${cropArea.x}%`,
                    top: `${cropArea.y}%`,
                    width: `${cropArea.width}%`,
                    height: `${cropArea.height}%`,
                  }}
                />
              )}
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="w-full lg:w-80 border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
            <Tabs defaultValue="adjust" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="adjust">Adjust</TabsTrigger>
                <TabsTrigger value="filters">Filters</TabsTrigger>
                <TabsTrigger value="transform">Transform</TabsTrigger>
              </TabsList>

              <div className="p-4 space-y-4">
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
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="filters" className="space-y-2 mt-0">
                  <Button
                    onClick={() => applyFilter('none')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Original
                  </Button>
                  <Button
                    onClick={() => applyFilter('grayscale')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Grayscale
                  </Button>
                  <Button
                    onClick={() => applyFilter('sepia')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Sepia
                  </Button>
                  <Button
                    onClick={() => applyFilter('vintage')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Vintage
                  </Button>
                  <Button
                    onClick={() => applyFilter('cool')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Cool
                  </Button>
                </TabsContent>

                <TabsContent value="transform" className="space-y-4 mt-0">
                  <div className="flex gap-2">
                    <Button onClick={handleRotate} variant="outline" className="flex-1 gap-2">
                      <RotateCw className="w-4 h-4" />
                      Rotate 90°
                    </Button>
                    <Button 
                      onClick={() => {
                        setCropMode(!cropMode);
                        saveToHistory();
                      }} 
                      variant={cropMode ? "default" : "outline"}
                      className="flex-1 gap-2"
                    >
                      <Crop className="w-4 h-4" />
                      {cropMode ? 'Cropping' : 'Crop'}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Scale: {(scale * 100).toFixed(0)}%
                    </label>
                    <Slider
                      value={[scale * 100]}
                      onValueChange={(value) => setScale(value[0] / 100)}
                      onValueCommit={saveToHistory}
                      min={50}
                      max={200}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Rotation: {rotation}°
                    </label>
                    <Slider
                      value={[rotation]}
                      onValueChange={(value) => setRotation(value[0])}
                      onValueCommit={saveToHistory}
                      min={0}
                      max={360}
                      step={15}
                      className="w-full"
                    />
                  </div>

                  {cropMode && (
                    <div className="space-y-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        Crop Area (adjust percentages)
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="X%"
                          value={cropArea.x}
                          onChange={(e) => setCropArea({...cropArea, x: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))})}
                          onBlur={saveToHistory}
                          className="h-8 px-2 rounded text-xs"
                        />
                        <input
                          type="number"
                          placeholder="Y%"
                          value={cropArea.y}
                          onChange={(e) => setCropArea({...cropArea, y: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))})}
                          onBlur={saveToHistory}
                          className="h-8 px-2 rounded text-xs"
                        />
                        <input
                          type="number"
                          placeholder="W%"
                          value={cropArea.width}
                          onChange={(e) => setCropArea({...cropArea, width: Math.max(1, Math.min(100, parseInt(e.target.value) || 100))})}
                          onBlur={saveToHistory}
                          className="h-8 px-2 rounded text-xs"
                        />
                        <input
                          type="number"
                          placeholder="H%"
                          value={cropArea.height}
                          onChange={(e) => setCropArea({...cropArea, height: Math.max(1, Math.min(100, parseInt(e.target.value) || 100))})}
                          onBlur={saveToHistory}
                          className="h-8 px-2 rounded text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <Button onClick={handleReset} variant="outline" className="w-full">
                    Reset All
                  </Button>
                </TabsContent>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Button onClick={onClose} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                    Apply Changes
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