import { useEffect } from "react";
import { toast } from "sonner";

export default function KeyboardShortcuts({ 
  onProcessAll, 
  onDownloadAll, 
  onClearAll,
  hasImages,
  hasProcessed 
}) {
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only trigger if not typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Cmd/Ctrl + P: Process all
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        if (hasImages) {
          onProcessAll();
          toast.info('⌨️ Keyboard shortcut: Process all');
        }
      }

      // Cmd/Ctrl + D: Download all
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        if (hasProcessed) {
          onDownloadAll();
          toast.info('⌨️ Keyboard shortcut: Download all');
        }
      }

      // Cmd/Ctrl + Delete: Clear all
      if ((e.metaKey || e.ctrlKey) && e.key === 'Backspace') {
        e.preventDefault();
        if (hasImages) {
          onClearAll();
          toast.info('⌨️ Keyboard shortcut: Clear all');
        }
      }

      // Show shortcuts help
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        toast.info(
          <div className="text-xs space-y-1">
            <div><strong>⌘/Ctrl + P</strong> - Process all</div>
            <div><strong>⌘/Ctrl + D</strong> - Download all</div>
            <div><strong>⌘/Ctrl + ⌫</strong> - Clear all</div>
            <div><strong>⌘/Ctrl + /</strong> - Show shortcuts</div>
          </div>,
          { duration: 5000 }
        );
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onProcessAll, onDownloadAll, onClearAll, hasImages, hasProcessed]);

  return null;
}