import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings2, Image, Globe, Printer, Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const presets = {
  web: {
    name: "Web Optimized",
    icon: Globe,
    quality: 75,
    format: "webp",
    description: "Fast loading for websites"
  },
  social: {
    name: "Social Media",
    icon: Share2,
    quality: 80,
    format: "jpg",
    description: "Perfect for Instagram, Facebook"
  },
  print: {
    name: "Print Quality",
    icon: Printer,
    quality: 95,
    format: "jpg",
    description: "High quality for printing"
  },
  balanced: {
    name: "Balanced",
    icon: Image,
    quality: 85,
    format: "jpg",
    description: "Good balance of size & quality"
  }
};

export default function QuickSettings({ onPresetApply }) {
  const [currentPreset, setCurrentPreset] = useState(() => {
    return localStorage.getItem('compressionPreset') || 'balanced';
  });

  useEffect(() => {
    localStorage.setItem('compressionPreset', currentPreset);
  }, [currentPreset]);

  const handlePresetSelect = (presetKey) => {
    const preset = presets[presetKey];
    setCurrentPreset(presetKey);
    onPresetApply(preset);
    toast.success(`Applied ${preset.name} preset`);
  };

  const current = presets[currentPreset];
  const Icon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{current.name}</span>
          <Settings2 className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Presets</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(presets).map(([key, preset]) => {
          const PresetIcon = preset.icon;
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => handlePresetSelect(key)}
              className="cursor-pointer"
            >
              <div className="flex items-start gap-3 w-full">
                <PresetIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{preset.name}</div>
                  <div className="text-xs text-slate-500">{preset.description}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Quality: {preset.quality}% • Format: {preset.format.toUpperCase()}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}