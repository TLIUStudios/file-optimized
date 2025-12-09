import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Cloud, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useState } from "react";

export default function CloudSaveModal({ isOpen, onClose, blob, filename, mimeType }) {
  const [saving, setSaving] = useState(false);
  const [savedTo, setSavedTo] = useState(null);

  const handleSaveToGoogleDrive = async () => {
    setSaving(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      await new Promise((resolve) => { reader.onloadend = resolve; });
      const base64Data = reader.result;

      const { data } = await base44.functions.invoke('uploadToGoogleDrive', {
        fileName: filename,
        fileData: base64Data,
        mimeType: mimeType
      });

      if (data.error) {
        throw new Error(data.error);
      }

      setSavedTo('googledrive');
      toast.success('File saved to Google Drive!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save to Google Drive');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Save to Cloud
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-3">
          {/* Google Drive */}
          <div className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"/>
                  <path fill="#34A853" d="M12.545 22c2.753 0 5.155-.896 6.874-2.428l-3.208-2.615c-.893.612-2.026.977-3.666.977-2.798 0-5.165-1.883-6.014-4.415l-3.29 2.539C4.984 19.447 8.458 22 12.545 22z"/>
                  <path fill="#FBBC04" d="M5.531 14.519A6.067 6.067 0 015 12c0-.88.152-1.726.431-2.519L2.141 6.942A9.969 9.969 0 002.543 12c0 1.799.478 3.487 1.308 4.943l3.29-2.539.39.115z"/>
                  <path fill="#EA4335" d="M12.545 5.932c1.62 0 3.058.558 4.194 1.655l3.155-3.155C18.165 2.806 15.465 2 12.545 2 8.458 2 4.984 4.553 3.241 8.058l3.29 2.539c.849-2.532 3.216-4.415 6.014-4.415z"/>
                </svg>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Google Drive</p>
                  {savedTo === 'googledrive' ? (
                    <Badge className="bg-emerald-600 text-white text-xs mt-1">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Saved
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-600 text-white text-xs mt-1">Active</Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={handleSaveToGoogleDrive}
              disabled={saving || savedTo === 'googledrive'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? 'Saving...' : savedTo === 'googledrive' ? 'Saved ✓' : 'Save to Google Drive'}
            </Button>
          </div>

          {/* Dropbox - Coming Soon */}
          <div className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg opacity-60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#0061FF">
                  <path d="M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.452 0 13.274zM18 9.452l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.371l6.001 3.822 6-3.822-6-3.822L6 18.371z"/>
                </svg>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Dropbox</p>
                  <Badge variant="outline" className="text-xs mt-1">Soon</Badge>
                </div>
              </div>
            </div>
            <Button disabled className="w-full">
              Coming Soon
            </Button>
          </div>

          {/* OneDrive - Coming Soon */}
          <div className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg opacity-60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#0078D4">
                  <path d="M13.977 5.998c2.382 0 4.438 1.382 5.414 3.386a4.746 4.746 0 013.608 4.599c0 2.626-2.131 4.756-4.757 4.756H5.758C2.579 18.739 0 16.16 0 12.98c0-2.812 2.018-5.157 4.688-5.659a6.99 6.99 0 016.289-1.323z"/>
                </svg>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">OneDrive</p>
                  <Badge variant="outline" className="text-xs mt-1">Soon</Badge>
                </div>
              </div>
            </div>
            <Button disabled className="w-full">
              Coming Soon
            </Button>
          </div>
        </div>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
          🔒 Files are uploaded directly from your browser
        </p>
      </DialogContent>
    </Dialog>
  );
}