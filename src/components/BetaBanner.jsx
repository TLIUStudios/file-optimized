import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BetaBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('betaBannerDismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('betaBannerDismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-b border-orange-600">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-3 relative">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="text-center text-sm sm:text-base">
            <p className="hidden sm:inline">
              File Optimized is being developed. Found a bug or have feedback? <a href="https://support.tliu.co/" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-100 transition-colors">Let us know!</a>
            </p>
            <div className="sm:hidden space-y-0.5">
              <p>File Optimized is being developed.</p>
              <p>Found a bug or have feedback?</p>
              <p><a href="https://support.tliu.co/" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-100 transition-colors">Let us know!</a></p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="absolute right-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-red-600 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}