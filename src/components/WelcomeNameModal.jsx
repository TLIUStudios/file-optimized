import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function WelcomeNameModal({ isOpen, onComplete, userEmail }) {
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setSaving(true);
    try {
      await base44.auth.updateMe({ display_name: displayName.trim() });
      toast.success('Welcome aboard! 🎉');
      onComplete(displayName.trim());
    } catch (error) {
      console.error('Error saving name:', error);
      toast.error('Failed to save name');
      setSaving(false);
    }
  };

  const handleSkip = () => {
    onComplete(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <div className="text-center space-y-4 py-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome to File Optimized! 🎉
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              What should we call you?
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-left">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                Display Name
              </label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="text-center"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && displayName.trim()) {
                    handleSave();
                  }
                }}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 text-center">
                You can always change this later in your profile
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSkip}
                variant="outline"
                className="flex-1"
                disabled={saving}
              >
                Skip for now
              </Button>
              <Button
                onClick={handleSave}
                disabled={!displayName.trim() || saving}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Continue
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}