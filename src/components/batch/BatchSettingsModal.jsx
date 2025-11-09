import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X, Zap, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function BatchSettingsModal({ isOpen, onClose, onApply, fileCount }) {
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState('auto');
  const [compressionMode, setCompressionMode] = useState('balanced');
  const [maxWidth, setMaxWidth] = useState('');
  const [maxHeight, setMaxHeight] = useState('');

  const handleApply = () => {
    onApply({
      quality,
      format,
      compressionMode,
      maxWidth: maxWidth ? parseInt(maxWidth) : null,
      maxHeight: maxHeight ? parseInt(maxHeight) : null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Batch Processing Settings</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Apply these settings to all {fileCount} unprocessed files
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Compression Mode
            </label>
            <Select value={compressionMode} onValueChange={setCompressionMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                <SelectItem value="aggressive">Aggressive (Smaller Files)</SelectItem>
                <SelectItem value="maximum">Maximum (Smallest Files)</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Output Format
            </label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (Keep Original)</SelectItem>
                <SelectItem value="webp">WebP (Best Compression)</SelectItem>
                <SelectItem value="jpg">JPG (Universal)</SelectItem>
                <SelectItem value="png">PNG (Lossless)</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Quality: {quality}%
            </label>
            <Slider
              value={[quality]}
              onValueChange={(value) => setQuality(value[0])}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Resize (Optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Max Width (px)</label>
                <input
                  type="number"
                  placeholder="Auto"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Max Height (px)</label>
                <input
                  type="number"
                  placeholder="Auto"
                  value={maxHeight}
                  onChange={(e) => setMaxHeight(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Batch Processing</h3>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  These settings will be applied to all {fileCount} unprocessed files. 
                  Individual settings will be overridden. Files will process automatically one by one.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleApply} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
            <Zap className="w-4 h-4 mr-2" />
            Apply to {fileCount} Files
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}