import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X, Play, Pause, Undo, Redo, Volume2, Music } from "lucide-react";
import { toast } from "sonner";

export default function AudioEditor({ isOpen, onClose, audioData, onSave }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [volume, setVolume] = useState(100);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [processing, setProcessing] = useState(false);

  const audioRef = useRef(null);

  // History management
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyTimeoutRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current || !audioData || !isOpen) return;

    const audio = audioRef.current;
    audio.src = audioData;
    audio.load();

    const handleMetadataLoaded = () => {
      setDuration(audio.duration);
      setTrimEnd(audio.duration);

      // Save initial state
      const initialState = {
        trimStart: 0,
        trimEnd: audio.duration,
        volume: 100,
        fadeIn: 0,
        fadeOut: 0,
      };
      setHistory([initialState]);
      setHistoryIndex(0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('loadedmetadata', handleMetadataLoaded);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [audioData, isOpen]);

  const saveToHistory = () => {
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }

    historyTimeoutRef.current = setTimeout(() => {
      const newState = {
        trimStart,
        trimEnd,
        volume,
        fadeIn,
        fadeOut,
      };

      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newState);
        return newHistory;
      });
      setHistoryIndex(prev => prev + 1);
    }, 300);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];

      setTrimStart(state.trimStart);
      setTrimEnd(state.trimEnd);
      setVolume(state.volume);
      setFadeIn(state.fadeIn);
      setFadeOut(state.fadeOut);
      setHistoryIndex(newIndex);

      toast.success('Undo applied');
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];

      setTrimStart(state.trimStart);
      setTrimEnd(state.trimEnd);
      setVolume(state.volume);
      setFadeIn(state.fadeIn);
      setFadeOut(state.fadeOut);
      setHistoryIndex(newIndex);

      toast.success('Redo applied');
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (value) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const applyEdits = async () => {
    setProcessing(true);
    toast.info("Processing audio...", { id: "audio-edit" });

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Load audio file
      const response = await fetch(audioData);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Calculate trim positions in samples
      const startSample = Math.floor(trimStart * audioBuffer.sampleRate);
      const endSample = Math.floor(trimEnd * audioBuffer.sampleRate);
      const newLength = endSample - startSample;

      // Create new buffer with trimmed length
      const trimmedBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        newLength,
        audioBuffer.sampleRate
      );

      // Copy and process each channel
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const inputData = audioBuffer.getChannelData(channel);
        const outputData = trimmedBuffer.getChannelData(channel);

        // Copy trimmed section
        for (let i = 0; i < newLength; i++) {
          outputData[i] = inputData[startSample + i];
        }

        // Apply volume
        const volumeMultiplier = volume / 100;
        for (let i = 0; i < newLength; i++) {
          outputData[i] *= volumeMultiplier;
        }

        // Apply fade in
        if (fadeIn > 0) {
          const fadeInSamples = Math.floor(fadeIn * audioBuffer.sampleRate);
          for (let i = 0; i < Math.min(fadeInSamples, newLength); i++) {
            outputData[i] *= i / fadeInSamples;
          }
        }

        // Apply fade out
        if (fadeOut > 0) {
          const fadeOutSamples = Math.floor(fadeOut * audioBuffer.sampleRate);
          const fadeOutStart = newLength - fadeOutSamples;
          for (let i = Math.max(0, fadeOutStart); i < newLength; i++) {
            outputData[i] *= (newLength - i) / fadeOutSamples;
          }
        }
      }

      // Convert to WAV
      const wavBlob = bufferToWave(trimmedBuffer, newLength);
      
      toast.dismiss("audio-edit");
      toast.success("Audio edited successfully!");
      onSave(wavBlob);
      onClose();
    } catch (error) {
      console.error("Audio editing error:", error);
      toast.dismiss("audio-edit");
      toast.error("Failed to edit audio: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Convert AudioBuffer to WAV Blob
  const bufferToWave = (abuffer, len) => {
    const numOfChan = abuffer.numberOfChannels;
    const length = len * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let offset = 0;
    let pos = 0;

    // Write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // Write interleaved data
    for (let i = 0; i < abuffer.numberOfChannels; i++) {
      channels.push(abuffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true); // write 16-bit sample
        pos += 2;
      }
      offset++; // next source sample
    }

    return new Blob([buffer], { type: "audio/wav" });

    function setUint16(data) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[95vh] p-0 bg-slate-50 dark:bg-slate-950 overflow-hidden [&>button]:hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Audio</h2>
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

        <div className="p-6 space-y-6">
          {/* Audio Player */}
          <div className="flex flex-col items-center gap-4">
            <audio
              ref={audioRef}
              onEnded={() => setIsPlaying(false)}
              preload="auto"
              volume={volume / 100}
            />

            <div className="flex items-center gap-4">
              <Music className="w-8 h-8 text-slate-400" />
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlayPause}
                disabled={!duration}
                className="w-12 h-12"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </Button>
            </div>

            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <Slider
                value={[currentTime]}
                onValueChange={handleTimeChange}
                max={duration || 1}
                step={0.1}
                className="w-full"
                disabled={!duration}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Trim Controls */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Trim</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Start: {formatTime(trimStart)}
                </label>
                <Slider
                  value={[trimStart]}
                  onValueChange={(v) => setTrimStart(Math.min(v[0], trimEnd - 0.1))}
                  onValueCommit={saveToHistory}
                  max={duration}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  End: {formatTime(trimEnd)}
                </label>
                <Slider
                  value={[trimEnd]}
                  onValueChange={(v) => setTrimEnd(Math.max(v[0], trimStart + 0.1))}
                  onValueCommit={saveToHistory}
                  max={duration}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Duration: {formatTime(trimEnd - trimStart)}
                </p>
              </div>
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-slate-500" />
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Volume: {volume}%
                </label>
              </div>
              <Slider
                value={[volume]}
                onValueChange={(value) => {
                  setVolume(value[0]);
                  if (audioRef.current) {
                    audioRef.current.volume = value[0] / 100;
                  }
                }}
                onValueCommit={saveToHistory}
                min={0}
                max={200}
                step={1}
                className="w-full"
              />
            </div>

            {/* Fade Effects */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Fade Effects</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Fade In: {fadeIn.toFixed(1)}s
                </label>
                <Slider
                  value={[fadeIn]}
                  onValueChange={(value) => setFadeIn(value[0])}
                  onValueCommit={saveToHistory}
                  min={0}
                  max={5}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Fade Out: {fadeOut.toFixed(1)}s
                </label>
                <Slider
                  value={[fadeOut]}
                  onValueChange={(value) => setFadeOut(value[0])}
                  onValueCommit={saveToHistory}
                  min={0}
                  max={5}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button onClick={onClose} variant="outline" className="flex-1" disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={applyEdits}
              disabled={processing}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {processing ? "Processing..." : "Apply Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}