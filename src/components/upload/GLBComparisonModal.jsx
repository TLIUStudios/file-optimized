import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download as DownloadIcon, Box, RefreshCw, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";
import GLBViewer from './GLBViewer';

export default function GLBComparisonModal({ isOpen, onClose, originalFile, compressedFile, originalSize, compressedSize, fileName }) {
  const [aiTitle, setAiTitle] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [aiCategory, setAiCategory] = useState("");
  const [aiMood, setAiMood] = useState("");
  const [aiAltText, setAiAltText] = useState("");
  const [aiTags, setAiTags] = useState("");
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiHashtags, setAiHashtags] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingField, setRegeneratingField] = useState(null);

  const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);
  const savingsAmount = originalSize - compressedSize;
  const hasAnyMetadata = aiTitle || aiDescription || aiCategory || aiMood || aiAltText || aiTags || aiKeywords || aiHashtags;

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const generateMetadata = async () => {
    console.log('🚀 Starting AI metadata generation for 3D model...');
    setIsGenerating(true);
    setAiTitle("");
    setAiDescription("");
    setAiCategory("");
    setAiMood("");
    setAiAltText("");
    setAiTags("");

    try {
      // Use a simple filename/metadata generation since we can't analyze the 3D model visually
      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on the filename "${fileName}", generate SEO metadata for this 3D model: a short title (under 60 chars), brief description (under 160 chars), category (1-2 words), mood (1-2 words), alt text for accessibility (under 125 chars), 10 tags (comma-separated), 10 SEO keywords (comma-separated), and 10 hashtags (#word format).`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            mood: { type: "string" },
            alt_text: { type: "string" },
            tags: { type: "string" },
            keywords: { type: "string" },
            hashtags: { type: "string" }
          }
        }
      });

      console.log('🤖 AI Response:', aiResult);

      setAiTitle(aiResult.title || "3D Model");
      setAiDescription(aiResult.description || "High-quality 3D model");
      setAiCategory(aiResult.category || "3D Model");
      setAiMood(aiResult.mood || "Professional");
      setAiAltText(aiResult.alt_text || "3D model");
      setAiTags(aiResult.tags || "3d, model");
      setAiKeywords(aiResult.keywords || "3d model, 3d asset");
      setAiHashtags(aiResult.hashtags || "#3dmodel #3d");
      
      toast.success('Metadata generated!');

    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Could not generate metadata: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateField = async (fieldName) => {
    console.log(`🔄 Regenerating ${fieldName}...`);
    setRegeneratingField(fieldName);

    try {
      let prompt = "";
      let schemaProperty = "";

      switch (fieldName) {
        case "title":
          prompt = `Based on the filename "${fileName}", provide ONLY a short, catchy title (under 60 chars) for this 3D model.`;
          schemaProperty = "title";
          break;
        case "description":
          prompt = `Based on the filename "${fileName}", provide ONLY a brief description (under 160 chars) for this 3D model.`;
          schemaProperty = "description";
          break;
        case "category":
          prompt = `Based on the filename "${fileName}", provide ONLY a category (1-2 words) for this 3D model.`;
          schemaProperty = "category";
          break;
        case "mood":
          prompt = `Based on the filename "${fileName}", provide ONLY the mood or tone (1-2 words) for this 3D model.`;
          schemaProperty = "mood";
          break;
        case "alt_text":
          prompt = `Based on the filename "${fileName}", provide ONLY alt text (under 125 chars) for accessibility.`;
          schemaProperty = "alt_text";
          break;
        case "tags":
          prompt = `Based on the filename "${fileName}", provide ONLY 10 social media tags (comma-separated) for this 3D model.`;
          schemaProperty = "tags";
          break;
        case "keywords":
          prompt = `Based on the filename "${fileName}", provide ONLY 10 SEO keywords (comma-separated) for this 3D model.`;
          schemaProperty = "keywords";
          break;
        case "hashtags":
          prompt = `Based on the filename "${fileName}", provide ONLY 10 hashtags (#word format) for this 3D model.`;
          schemaProperty = "hashtags";
          break;
        default:
          throw new Error("Invalid field name for regeneration.");
      }

      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            [schemaProperty]: { type: "string" }
          }
        }
      });

      switch (fieldName) {
        case "title":
          setAiTitle(aiResult.title || "3D Model");
          break;
        case "description":
          setAiDescription(aiResult.description || "3D model");
          break;
        case "category":
          setAiCategory(aiResult.category || "3D Model");
          break;
        case "mood":
          setAiMood(aiResult.mood || "Professional");
          break;
        case "alt_text":
          setAiAltText(aiResult.alt_text || "3D model");
          break;
        case "tags":
          setAiTags(aiResult.tags || "3d, model");
          break;
        case "keywords":
          setAiKeywords(aiResult.keywords || "3d model, 3d asset");
          break;
        case "hashtags":
          setAiHashtags(aiResult.hashtags || "#3dmodel");
          break;
      }

      toast.success(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} regenerated!`);
    } catch (error) {
      console.error(`❌ Error regenerating ${fieldName}:`, error);
      toast.error(`Failed to regenerate ${fieldName}: ${error.message}`);
    } finally {
      setRegeneratingField(null);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const downloadCompressed = () => {
    if (!compressedFile) return;
    const url = URL.createObjectURL(compressedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${fileName} downloaded!`);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[98vh] max-h-[98vh] p-0 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 [&>button]:hidden overflow-hidden">
        {/* Top Toolbar */}
        <div className="absolute top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{fileName}</h2>
            <Badge variant="secondary" className="text-xs flex items-center gap-1.5">
              <Box className="w-3 h-3" />
              3D Model
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={downloadCompressed}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 text-xs font-semibold"
            >
              <DownloadIcon className="w-3 h-3 mr-1.5" />
              Download
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 bg-slate-900/90 dark:bg-slate-900/90 hover:bg-red-600 dark:hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-full overflow-hidden pt-[52px]">
          {/* Left Side - 3D Models Comparison */}
          <div className="flex-1 relative overflow-hidden flex flex-col min-h-0">
            <div className="flex-1 grid grid-cols-2 gap-4 p-4 bg-slate-100 dark:bg-slate-900">
              {/* Original Model */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Original</h3>
                  <Badge className="bg-slate-700 dark:bg-slate-800 text-white text-xs">GLB</Badge>
                </div>
                <div className="flex-1 bg-slate-950 rounded-lg overflow-hidden border border-slate-600/50">
                  <GLBViewer file={originalFile} disableInteraction={false} />
                </div>
              </div>

              {/* Compressed Model */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Compressed</h3>
                  <Badge className="bg-emerald-600 text-white text-xs">GLB</Badge>
                </div>
                <div className="flex-1 bg-slate-950 rounded-lg overflow-hidden border border-slate-600/50">
                  <GLBViewer file={compressedFile} disableInteraction={false} />
                </div>
              </div>
            </div>

            {/* Bottom Bar - Stats */}
            <div className="h-auto px-6 py-3 bg-slate-100 dark:bg-slate-900 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold">{savings}%</span> smaller • Optimized with Draco compression
              </div>
            </div>
          </div>

          {/* Right Panel - Stats */}
          <div className="w-full lg:w-80 bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto">
            <div className="p-4 sm:p-5 space-y-4">
              {/* File Info */}
              <div>
                <h2 className="text-slate-900 dark:text-white text-sm font-bold mb-1 break-words line-clamp-2">
                  {fileName}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Compare file sizes and optimization metrics
                </p>
              </div>

              {/* Original Size */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
                  Original Size
                </p>
                <p className="text-slate-900 dark:text-white text-2xl font-bold">
                  {formatFileSize(originalSize)}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">Format: GLB</p>
              </div>

              {/* Compression Result */}
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-4">
                <p className="text-emerald-100 text-[10px] font-semibold uppercase tracking-wider mb-1">
                  Compressed Size
                </p>
                <p className="text-white text-2xl font-bold mb-2">
                  {formatFileSize(compressedSize)}
                </p>
                <Badge className="bg-white/20 text-white text-xs font-bold px-2 py-1">
                  {savings}% smaller
                </Badge>
              </div>

              {/* Space Saved */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
                  Space Saved
                </p>
                <p className="text-emerald-600 dark:text-emerald-400 text-xl font-bold">
                  {formatFileSize(savingsAmount)}
                </p>
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-800" />

              {/* Optimization Details */}
              <div className="space-y-2">
                <h3 className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider">
                  Optimization Details
                </h3>

                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Compression Ratio</span>
                  <span className="text-slate-900 dark:text-white font-bold text-sm">
                    {(compressedSize / originalSize).toFixed(3)}:1
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Method</span>
                  <Badge className="bg-emerald-600 text-white font-semibold text-xs">Draco</Badge>
                </div>

                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Processing</span>
                  <Badge className="bg-blue-600 text-white font-semibold text-xs">Browser-side</Badge>
                </div>
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-800" />

              {/* AI SEO Generation Section */}
              <div>
                <h3 className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider mb-3">
                  AI SEO Generation
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3">Generate AI-powered metadata for this 3D model</p>
                <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400">
                  Coming Soon
                </Badge>
              </div>

              {/* Privacy Notice */}
              <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 mt-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  🔒 All processing happens locally in your browser. Your files never leave your device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}