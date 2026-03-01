import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function GLBViewerSettings({ isOpen, onClose, settings, onSettingsChange }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6 py-4">
          {/* Background Color */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-900 dark:text-white">Background Color:</p>
            <div className="flex gap-3">
              <Button
                onClick={() => onSettingsChange('backgroundColor', 'light')}
                variant={settings.backgroundColor === 'light' ? 'default' : 'outline'}
                className={settings.backgroundColor === 'light' ? 'bg-slate-200 text-slate-900' : ''}
              >
                Light
              </Button>
              <Button
                onClick={() => onSettingsChange('backgroundColor', 'dark')}
                variant={settings.backgroundColor === 'dark' ? 'default' : 'outline'}
                className={settings.backgroundColor === 'dark' ? 'bg-slate-800 text-white' : ''}
              >
                Dark
              </Button>
            </div>
          </div>

          {/* Auto-Rotate */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-900 dark:text-white">Auto-Rotate:</p>
            <div className="flex gap-3">
              <Button
                onClick={() => onSettingsChange('autoRotate', true)}
                variant={settings.autoRotate ? 'default' : 'outline'}
                className={settings.autoRotate ? 'bg-slate-800 text-white' : ''}
              >
                On
              </Button>
              <Button
                onClick={() => onSettingsChange('autoRotate', false)}
                variant={!settings.autoRotate ? 'default' : 'outline'}
                className={!settings.autoRotate ? 'bg-slate-800 text-white' : ''}
              >
                Off
              </Button>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            Created by TLIU Studios
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}