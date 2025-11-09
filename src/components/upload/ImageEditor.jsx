
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, RotateCw, Crop, ZoomIn, ZoomOut, Sun, Contrast, Droplet, Sparkles, Undo, Redo, Scissors } from "lucide-react";
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
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);

  // History management for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (imageData && isOpen) {
      setIsImageLoaded(false);
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        console.log('Image loaded successfully:', img.width, 'x', img.height);
        setOriginalImage(img);
        setImageDimensions({ width: img.width, height: img.height });
        
        // Draw initial canvas
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            setIsImageLoaded(true);
            console.log('Canvas drawn successfully');
          }
        }
        
        // Initialize history
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
      
      img.onerror = (error) => {
        console.error('Error loading image:', error);
        toast.error('Failed to load image for editing');
      };
      
      // Handle data URLs properly
      if (imageData.startsWith('data:')) {
        img.src = imageData;
      } else if (imageData.startsWith('blob:')) {
        img.src = imageData;
      } else {
        // If it's a regular URL, try to load it
        img.src = imageData;
      }
    }
  }, [imageData, isOpen]);

  useEffect(() => {
    if (originalImage && isImageLoaded) {
      drawCanvas(originalImage);
    }
  }, [rotation, scale, brightness, contrast, saturation, blur, isImageLoaded, originalImage]); // Added originalImage to dependencies

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
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

  const removeBackground = async () => {
    setIsRemovingBackground(true);
    toast.info('Removing background...', { duration: Infinity, id: 'bg-remove' });

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const imageData = canvas.toDataURL('image/png');
      
      // Simple color-based background removal
      // For better results, you'd use a library like @imgly/background-removal
      const img = new Image();
      img.src = imageData;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const ctx = tempCanvas.getContext('2d');
      
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const pixels = imgData.data;
      
      // Sample corner pixels to determine background color
      const cornerSamples = [
        { r: pixels[0], g: pixels[1], b: pixels[2] }, // Top-left
        { r: pixels[(tempCanvas.width - 1) * 4], g: pixels[(tempCanvas.width - 1) * 4 + 1], b: pixels[(tempCanvas.width - 1) * 4 + 2] }, // Top-right
        { r: pixels[(tempCanvas.height - 1) * tempCanvas.width * 4], g: pixels[(tempCanvas.height - 1) * tempCanvas.width * 4 + 1], b: pixels[(tempCanvas.height - 1) * tempCanvas.width * 4 + 2] }, // Bottom-left
        { r: pixels[((tempCanvas.height - 1) * tempCanvas.width + (tempCanvas.width - 1)) * 4], g: pixels[((tempCanvas.height - 1) * tempCanvas.width + (tempCanvas.width - 1)) * 4 + 1], b: pixels[((tempCanvas.height - 1) * tempCanvas.width + (tempCanvas.width - 1)) * 4 + 2] } // Bottom-right
      ];
      
      // Average the corner colors
      const bgColor = {
        r: Math.round(cornerSamples.reduce((sum, c) => sum + c.r, 0) / cornerSamples.length),
        g: Math.round(cornerSamples.reduce((sum, c) => sum + c.g, 0) / cornerSamples.length),
        b: Math.round(cornerSamples.reduce((sum, c) => sum + c.b, 0) / cornerSamples.length)
      };
      
      const threshold = 30; // Color similarity threshold
      
      // Make similar pixels transparent
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        const colorDiff = Math.sqrt(
          Math.pow(r - bgColor.r, 2) +
          Math.pow(g - bgColor.g, 2) +
          Math.pow(b - bgColor.b, 2)
        );
        
        if (colorDiff < threshold) {
          pixels[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }
      
      ctx.putImageData(imgData, 0, 0);
      
      // Update the original image with the transparent version
      const newImg = new Image();
      newImg.onload = () => {
        setOriginalImage(newImg);
        // drawCanvas will be triggered by originalImage dependency in useEffect
        toast.dismiss('bg-remove');
        toast.success('Background removed!');
      };
      newImg.src = tempCanvas.toDataURL('image/png');
      
    } catch (error) {
      console.error('Error removing background:', error);
      toast.dismiss('bg-remove');
      toast.error('Failed to remove background');
    } finally {
      setIsRemovingBackground(false);
    }
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
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-0 bg-slate-50 dark:bg-slate-950 overflow-hidden [&>button]:hidden">
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
          {/* Canvas Preview */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-900 p-4 flex items-center justify-center overflow-auto">
            {!isImageLoaded && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-sm text-slate-500">Loading image...</p>
              </div>
            )}
            <div className="relative" style={{ display: isImageLoaded ? 'block' : 'none' }}>
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

                  <Button 
                    onClick={removeBackground} 
                    variant="outline" 
                    className="w-full gap-2"
                    disabled={isRemovingBackground}
                  >
                    {isRemovingBackground ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <Scissors className="w-4 h-4" />
                        Remove Background
                      </>
                    )}
                  </Button>

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
