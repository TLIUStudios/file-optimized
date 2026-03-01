import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

export default function GLBViewerSettings({ isOpen, onClose, settings, onSettingsChange }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pointer-events-none" onClick={onClose}>
      <div 
        className="absolute inset-0 pointer-events-auto" 
        onClick={onClose} 
      />
      <div 
        className="relative pointer-events-auto m-3 w-60 max-h-96 overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-black/72 backdrop-blur-xl border border-white/12 rounded-2xl p-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-white">Settings</h2>
            <button 
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Background Color */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/85">Background Color:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onSettingsChange('backgroundColor', 'light')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    settings.backgroundColor === 'light'
                      ? 'bg-white/16 border border-white/18 text-white opacity-100'
                      : 'bg-white/6 border border-white/12 text-white/92 opacity-92 hover:bg-white/14'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => onSettingsChange('backgroundColor', 'dark')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    settings.backgroundColor === 'dark'
                      ? 'bg-white/16 border border-white/18 text-white opacity-100'
                      : 'bg-white/6 border border-white/12 text-white/92 opacity-92 hover:bg-white/14'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>

            {/* Auto-Rotate */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/85">Auto-Rotate:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onSettingsChange('autoRotate', true)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    settings.autoRotate
                      ? 'bg-white/16 border border-white/18 text-white opacity-100'
                      : 'bg-white/6 border border-white/12 text-white/92 opacity-92 hover:bg-white/14'
                  }`}
                >
                  On
                </button>
                <button
                  onClick={() => onSettingsChange('autoRotate', false)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    !settings.autoRotate
                      ? 'bg-white/16 border border-white/18 text-white opacity-100'
                      : 'bg-white/6 border border-white/12 text-white/92 opacity-92 hover:bg-white/14'
                  }`}
                >
                  Off
                </button>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3 mt-3 text-center text-xs text-white/90 font-medium cursor-pointer hover:text-yellow-300 hover:drop-shadow-lg transition-all" 
              onClick={() => window.open('https://www.tliu.co/', '_blank', 'noopener,noreferrer')}
            >
              Created by TLIU Studios
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}