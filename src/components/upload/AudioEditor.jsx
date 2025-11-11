import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Play, Pause, Scissors, Download, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AudioEditor({ isOpen, onClose, audioUrl, ffmpeg, onSave }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [processing, setProcessing] = useState(false);
  
  // Trim settings
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  
  // Format conversion
  const [outputFormat, setOutputFormat] = useState('mp3');
  const [bitrate, setBitrate] = useState(128);
  
  // Volume
  const [volume, setVolume] = useState(1);
  
  // Fade
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  
  const audioRef = useRef(null);

  useEffect(() => {
    if (isOpen && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.onloadedmetadata = () => {
        const dur = audioRef.current.duration;
        setDuration(dur);
        setTrimEnd(dur);
      };
    }
  }, [isOpen, audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    audio.addEventListener('timeupdate', updateTime);
    return () => audio.removeEventListener('timeupdate', updateTime);
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
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
      toast.error('Audio processor not available');
      return;
    }

    setProcessing(true);
    toast.info('Processing audio...', { duration: Infinity, id: 'audio-edit' });

    try {
      // Fetch audio data
      const response = await fetch(audioUrl);
      const audioData = await response.arrayBuffer();
      const inputName = 'input.mp3';
      const outputName = `output.${outputFormat}`;

      await ffmpeg.writeFile(inputName, new Uint8Array(audioData));

      // Build FFmpeg command
      const args = ['-i', inputName];
      
      // Trim
      if (trimStart > 0) {
        args.push('-ss', trimStart.toString());
      }
      if (trimEnd < duration) {
        args.push('-to', trimEnd.toString());
      }
      
      // Build audio filter
      let filters = [];
      
      // Volume
      if (volume !== 1) {
        filters.push(`volume=${volume}`);
      }
      
      // Fade in
      if (fadeIn > 0) {
        filters.push(`afade=t=in:st=0:d=${fadeIn}`);
      }
      
      // Fade out
      if (fadeOut > 0) {
        const fadeStart = (trimEnd - trimStart) - fadeOut;
        filters.push(`afade=t=out:st=${fadeStart}:d=${fadeOut}`);
      }
      
      if (filters.length > 0) {
        args.push('-af', filters.join(','));
      }
      
      // Format and bitrate
      if (outputFormat === 'mp3') {
        args.push('-codec:a', 'libmp3lame', '-b:a', `${bitrate}k`);
      } else if (outputFormat === 'wav') {
        args.push('-codec:a', 'pcm_s16le', '-ar', '44100');
      } else if (outputFormat === 'ogg') {
        args.push('-codec:a', 'libvorbis', '-q:a', '5');
      } else if (outputFormat === 'aac') {
        args.push('-codec:a', 'aac', '-b:a', `${bitrate}k`);
      }
      
      args.push(outputName);

      console.log('FFmpeg command:', args.join(' '));
      
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      const mimeTypes = {
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        ogg: 'audio/ogg',
        aac: 'audio/aac'
      };
      const blob = new Blob([data.buffer], { type: mimeTypes[outputFormat] });
      const url = URL.createObjectURL(blob);

      // Cleanup
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      toast.dismiss('audio-edit');
      toast.success('Audio edited successfully!');
      
      onSave(url, blob);
      onClose();
      
    } catch (error) {
      console.error('Audio editing error:', error);
      toast.dismiss('audio-edit');
      toast.error('Failed to edit audio: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[98vw] max-h-[90vh] p-0 overflow-hidden [&>button]:hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Audio Editor</h2>
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

          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Waveform / Player */}
            <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-6">
              <audio ref={audioRef} className="hidden" />
              
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlayPause}
                  className="h-12 w-12"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                
                <div className="flex-1">
                  <Slider
                    value={[currentTime]}
                    onValueChange={([value]) => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = value;
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

            {/* Trim Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-slate-600" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Trim Audio</h3>
              </div>
              
              <div className="space-y-3">
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
              </div>
            </div>

            {/* Format & Quality */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Format & Quality</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Output Format</Label>
                  <Select value={outputFormat} onValueChange={setOutputFormat}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mp3">MP3</SelectItem>
                      <SelectItem value="wav">WAV (Lossless)</SelectItem>
                      <SelectItem value="ogg">OGG</SelectItem>
                      <SelectItem value="aac">AAC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {(outputFormat === 'mp3' || outputFormat === 'aac') && (
                  <div>
                    <Label className="text-xs">Bitrate: {bitrate}kbps</Label>
                    <Slider
                      value={[bitrate]}
                      onValueChange={([value]) => setBitrate(value)}
                      min={64}
                      max={320}
                      step={16}
                      className="mt-3"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Volume & Effects */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Volume & Effects</h3>
              
              <div>
                <Label className="text-xs">Volume: {(volume * 100).toFixed(0)}%</Label>
                <Slider
                  value={[volume]}
                  onValueChange={([value]) => setVolume(value)}
                  min={0}
                  max={2}
                  step={0.1}
                  className="mt-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Fade In: {fadeIn.toFixed(1)}s</Label>
                  <Slider
                    value={[fadeIn]}
                    onValueChange={([value]) => setFadeIn(value)}
                    min={0}
                    max={5}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Fade Out: {fadeOut.toFixed(1)}s</Label>
                  <Slider
                    value={[fadeOut]}
                    onValueChange={([value]) => setFadeOut(value)}
                    min={0}
                    max={5}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}