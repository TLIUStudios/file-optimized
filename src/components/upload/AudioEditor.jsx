import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Play, Pause, Scissors, Volume2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AudioEditor({ isOpen, onClose, audioData, onSave, ffmpeg }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [volume, setVolume] = useState(100);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [processing, setProcessing] = useState(false);
  
  const audioRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && audioRef.current) {
      audioRef.current.addEventListener('loadedmetadata', () => {
        const d = audioRef.current.duration;
        setDuration(d);
        setTrimEnd(d);
      });
      
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current.currentTime);
        drawWaveform();
      });
    }
  }, [isOpen]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, width, height);

    // Draw trim area
    const trimStartX = (trimStart / duration) * width;
    const trimEndX = (trimEnd / duration) * width;
    ctx.fillStyle = '#10b981';
    ctx.globalAlpha = 0.2;
    ctx.fillRect(trimStartX, 0, trimEndX - trimStartX, height);
    ctx.globalAlpha = 1;

    // Draw current position
    const currentX = (currentTime / duration) * width;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(currentX, 0);
    ctx.lineTo(currentX, height);
    ctx.stroke();

    // Draw fade markers
    if (fadeIn > 0) {
      const fadeInEnd = (fadeIn / duration) * width;
      ctx.fillStyle = '#3b82f6';
      ctx.globalAlpha = 0.3;
      ctx.fillRect(trimStartX, 0, fadeInEnd - trimStartX, height);
      ctx.globalAlpha = 1;
    }

    if (fadeOut > 0) {
      const fadeOutStart = ((duration - fadeOut) / duration) * width;
      ctx.fillStyle = '#3b82f6';
      ctx.globalAlpha = 0.3;
      ctx.fillRect(fadeOutStart, 0, trimEndX - fadeOutStart, height);
      ctx.globalAlpha = 1;
    }
  };

  useEffect(() => {
    drawWaveform();
  }, [trimStart, trimEnd, currentTime, fadeIn, fadeOut, duration]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const applyEdits = async () => {
    if (!ffmpeg) {
      toast.error('Audio processor not loaded');
      return;
    }

    setProcessing(true);
    toast.info('Processing audio edits...', { duration: Infinity, id: 'audio-process' });

    try {
      const audioBlob = await fetch(audioData).then(r => r.blob());
      await ffmpeg.writeFile('input.mp3', new Uint8Array(await audioBlob.arrayBuffer()));

      let filterComplex = [];
      let inputArgs = ['-i', 'input.mp3'];
      
      // Trim
      if (trimStart > 0 || trimEnd < duration) {
        inputArgs.push('-ss', trimStart.toString(), '-to', trimEnd.toString());
      }

      // Volume
      if (volume !== 100) {
        filterComplex.push(`volume=${volume/100}`);
      }

      // Speed
      if (speed !== 1) {
        filterComplex.push(`atempo=${speed}`);
      }

      // Fade in
      if (fadeIn > 0) {
        filterComplex.push(`afade=t=in:st=0:d=${fadeIn}`);
      }

      // Fade out
      if (fadeOut > 0) {
        const fadeStartTime = (trimEnd - trimStart) - fadeOut;
        filterComplex.push(`afade=t=out:st=${fadeStartTime}:d=${fadeOut}`);
      }

      const args = [...inputArgs];
      
      if (filterComplex.length > 0) {
        args.push('-af', filterComplex.join(','));
      }

      args.push('-c:a', 'libmp3lame', '-b:a', '192k', 'output.mp3');

      console.log('FFmpeg args:', args.join(' '));
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile('output.mp3');
      const blob = new Blob([data.buffer], { type: 'audio/mpeg' });

      await ffmpeg.deleteFile('input.mp3');
      await ffmpeg.deleteFile('output.mp3');

      toast.dismiss('audio-process');
      onSave(blob);
      onClose();
      toast.success('Audio edited successfully!');
    } catch (error) {
      console.error('Error editing audio:', error);
      toast.dismiss('audio-process');
      toast.error('Failed to edit audio: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden [&>button]:hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Audio Editor</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Edit and enhance your audio</p>
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

          <div className="p-6 space-y-6">
            {/* Waveform Display */}
            <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4">
              <canvas
                ref={canvasRef}
                width={800}
                height={150}
                className="w-full rounded cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percentage = x / rect.width;
                  handleSeek(percentage * duration);
                }}
              />
              
              {/* Playback Controls */}
              <div className="mt-4">
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
              </div>
            </div>

            <audio ref={audioRef} src={audioData} className="hidden" />

            {/* Editing Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trim */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Trim Audio</h3>
                <div>
                  <Label className="text-xs">Start: {formatTime(trimStart)}</Label>
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
                  <Label className="text-xs">End: {formatTime(trimEnd)}</Label>
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

              {/* Volume */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Volume Control</h3>
                <div>
                  <Label className="text-xs">Volume: {volume}%</Label>
                  <Slider
                    value={[volume]}
                    onValueChange={([value]) => setVolume(value)}
                    min={0}
                    max={200}
                    step={5}
                    className="mt-1"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Mute</span>
                    <span>200%</span>
                  </div>
                </div>
              </div>

              {/* Fade Effects */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Fade Effects</h3>
                <div>
                  <Label className="text-xs">Fade In: {fadeIn.toFixed(1)}s</Label>
                  <Slider
                    value={[fadeIn]}
                    onValueChange={([value]) => setFadeIn(value)}
                    min={0}
                    max={Math.min(5, duration / 2)}
                    step={0.1}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Fade Out: {fadeOut.toFixed(1)}s</Label>
                  <Slider
                    value={[fadeOut]}
                    onValueChange={([value]) => setFadeOut(value)}
                    min={0}
                    max={Math.min(5, duration / 2)}
                    step={0.1}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Speed */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Playback Speed</h3>
                <div>
                  <Label className="text-xs">Speed: {speed}x</Label>
                  <Slider
                    value={[speed]}
                    onValueChange={([value]) => setSpeed(value)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="mt-1"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0.5x</span>
                    <span>2x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}