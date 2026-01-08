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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm sm:text-base">
              File Optimized is being developed. Found a bug or have feedback? <a href="https://support.tliu.co/" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-100 transition-colors">Let us know!</a>
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8 flex-shrink-0 bg-amber-600/50 hover:bg-amber-700/50 text-white rounded-lg transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}