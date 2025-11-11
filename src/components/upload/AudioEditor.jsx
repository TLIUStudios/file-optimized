import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Play, Pause, Scissors, Download, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AudioEditor({ isOpen, onClose, audioData, onSave, ffmpegRef }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [outputFormat, setOutputFormat] = useState('mp3');
  const [processing, setProcessing] = useState(false);
  
  const audioRef = useRef(null);

  useEffect(() => {
    if (isOpen && audioRef.current) {
      audioRef.current.src = audioData;
      audioRef.current.onloadedmetadata = () => {
        const dur = audioRef.current.duration;
        setDuration(dur);
        setTrimEnd(dur);
      };
    }
  }, [isOpen, audioData]);

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

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
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
    toast.info('Processing audio...', { duration: Infinity, id: 'audio-edit' });

    try {
      const ffmpeg = ffmpegRef.current;
      
      // Fetch audio data
      const response = await fetch(audioData);
      const audioBlob = await response.blob();
      const audioArray = new Uint8Array(await audioBlob.arrayBuffer());
      
      const inputExt = audioData.includes('.mp3') ? 'mp3' : 'wav';
      await ffmpeg.writeFile(`input.${inputExt}`, audioArray);

      // Build FFmpeg command
      const args = ['-i', `input.${inputExt}`];
      
      // Trim
      if (trimStart > 0) {
        args.push('-ss', trimStart.toString());
      }
      if (trimEnd < duration) {
        args.push('-to', trimEnd.toString());
      }

      // Output format
      if (outputFormat === 'mp3') {
        args.push('-codec:a', 'libmp3lame');
        args.push('-b:a', '192k');
      } else if (outputFormat === 'wav') {
        args.push('-codec:a', 'pcm_s16le');
      } else if (outputFormat === 'aac') {
        args.push('-codec:a', 'aac');
        args.push('-b:a', '192k');
      }

      args.push(`output.${outputFormat}`);

      console.log('FFmpeg command:', args.join(' '));
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(`output.${outputFormat}`);
      const mimeTypes = {
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        aac: 'audio/aac'
      };
      const editedBlob = new Blob([data.buffer], { type: mimeTypes[outputFormat] });

      await ffmpeg.deleteFile(`input.${inputExt}`);
      await ffmpeg.deleteFile(`output.${outputFormat}`);

      toast.dismiss('audio-edit');
      toast.success('Audio edited successfully!');
      
      onSave(URL.createObjectURL(editedBlob), editedBlob);
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
      <DialogContent className="max-w-3xl p-0 overflow-hidden [&>button]:hidden">
        <div className="flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Audio Editor</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Edit your audio before compression</p>
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

          {/* Audio Player */}
          <div className="p-8 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePlayPause}
                    className="w-16 h-16 text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </Button>
                </div>
              </div>

              <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                className="hidden"
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">{formatTime(currentTime)}</span>
                  <span className="text-slate-600 dark:text-slate-400">{formatTime(duration)}</span>
                </div>
                <Slider
                  value={[currentTime]}
                  onValueChange={handleSeek}
                  min={0}
                  max={duration}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Editing Tools */}
          <div className="p-6 space-y-6 bg-white dark:bg-slate-900">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                Trim Audio
              </h3>
              
              <div>
                <Label className="text-xs">Start: {formatTime(trimStart)}</Label>
                <Slider
                  value={[trimStart]}
                  onValueChange={(v) => setTrimStart(Math.min(v[0], trimEnd - 0.1))}
                  min={0}
                  max={duration}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-xs">End: {formatTime(trimEnd)}</Label>
                <Slider
                  value={[trimEnd]}
                  onValueChange={(v) => setTrimEnd(Math.max(v[0], trimStart + 0.1))}
                  min={0}
                  max={duration}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg">
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  New Duration: {formatTime(trimEnd - trimStart)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                Output Format
              </h3>
              
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp3">MP3 (Compressed)</SelectItem>
                  <SelectItem value="wav">WAV (Lossless)</SelectItem>
                  <SelectItem value="aac">AAC (High Quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}