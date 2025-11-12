import { useState, useEffect, Suspense } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Copy, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function MetadataViewer({ isOpen, onClose, file, preview }) {
  const [basicMetadata, setBasicMetadata] = useState(null);
  const [advancedMetadata, setAdvancedMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    if (isOpen && file) {
      extractBasicMetadata();
    }
  }, [isOpen, file]);

  const extractBasicMetadata = async () => {
    try {
      const metadata = {
        fileName: file.name,
        fileType: file.type,
        fileSize: formatFileSize(file.size),
        lastModified: new Date(file.lastModified).toLocaleString(),
      };

      const isImage = file.type.startsWith('image/');
      const isGif = file.type === 'image/gif';

      if (isImage && !isGif && preview) {
        const img = new Image();
        img.src = preview;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        metadata.width = `${img.width} px`;
        metadata.height = `${img.height} px`;
        metadata.aspectRatio = getAspectRatio(img.width, img.height);
        metadata.megapixels = ((img.width * img.height) / 1000000).toFixed(2) + ' MP';
      }

      setBasicMetadata(metadata);
    } catch (error) {
      console.error('Error extracting basic metadata:', error);
      toast.error('Failed to extract basic metadata');
    }
  };

  const extractAdvancedMetadata = async () => {
    if (advancedMetadata || loading) return;

    setLoading(true);
    toast.info('Extracting advanced metadata...', { id: 'metadata-extract' });

    try {
      // Dynamically import exifr for EXIF, IPTC, GPS, XMP data
      const exifr = await import('https://cdn.jsdelivr.net/npm/exifr@7.1.3/+esm');
      
      const extracted = await exifr.parse(file, {
        tiff: true,
        exif: true,
        gps: true,
        iptc: true,
        ifd0: true,
        ifd1: true,
        interop: true,
        xmp: true,
        icc: true,
        jfif: true,
        ihdr: true,
      });

      if (!extracted || Object.keys(extracted).length === 0) {
        setAdvancedMetadata({ message: 'No EXIF/metadata found in this file' });
        toast.dismiss('metadata-extract');
        toast.info('No EXIF data found');
        return;
      }

      // Organize metadata into categories
      const organized = {
        camera: {},
        lens: {},
        settings: {},
        datetime: {},
        gps: {},
        iptc: {},
        xmp: {},
        other: {}
      };

      // Camera info
      if (extracted.Make) organized.camera.make = extracted.Make;
      if (extracted.Model) organized.camera.model = extracted.Model;
      if (extracted.LensModel) organized.lens.model = extracted.LensModel;
      if (extracted.LensMake) organized.lens.make = extracted.LensMake;

      // Settings
      if (extracted.ISO) organized.settings.iso = extracted.ISO;
      if (extracted.FNumber) organized.settings.aperture = `f/${extracted.FNumber}`;
      if (extracted.ExposureTime) organized.settings.shutterSpeed = `${extracted.ExposureTime}s`;
      if (extracted.FocalLength) organized.settings.focalLength = `${extracted.FocalLength}mm`;
      if (extracted.WhiteBalance) organized.settings.whiteBalance = extracted.WhiteBalance;
      if (extracted.Flash) organized.settings.flash = extracted.Flash;
      if (extracted.MeteringMode) organized.settings.meteringMode = extracted.MeteringMode;
      if (extracted.ExposureProgram) organized.settings.exposureProgram = extracted.ExposureProgram;

      // Date/Time
      if (extracted.DateTimeOriginal) organized.datetime.original = new Date(extracted.DateTimeOriginal).toLocaleString();
      if (extracted.DateTime) organized.datetime.modified = new Date(extracted.DateTime).toLocaleString();
      if (extracted.CreateDate) organized.datetime.created = new Date(extracted.CreateDate).toLocaleString();

      // GPS
      if (extracted.latitude) organized.gps.latitude = extracted.latitude.toFixed(6);
      if (extracted.longitude) organized.gps.longitude = extracted.longitude.toFixed(6);
      if (extracted.GPSAltitude) organized.gps.altitude = `${extracted.GPSAltitude} m`;
      if (extracted.latitude && extracted.longitude) {
        organized.gps.googleMapsLink = `https://www.google.com/maps?q=${extracted.latitude},${extracted.longitude}`;
      }

      // IPTC
      if (extracted.Headline) organized.iptc.headline = extracted.Headline;
      if (extracted.Caption) organized.iptc.caption = extracted.Caption;
      if (extracted.Keywords) organized.iptc.keywords = Array.isArray(extracted.Keywords) ? extracted.Keywords.join(', ') : extracted.Keywords;
      if (extracted.Creator) organized.iptc.creator = extracted.Creator;
      if (extracted.Copyright) organized.iptc.copyright = extracted.Copyright;
      if (extracted.Credit) organized.iptc.credit = extracted.Credit;

      // XMP
      if (extracted.Rating) organized.xmp.rating = extracted.Rating;
      if (extracted.Label) organized.xmp.label = extracted.Label;
      if (extracted.Title) organized.xmp.title = extracted.Title;
      if (extracted.Description) organized.xmp.description = extracted.Description;
      if (extracted.Subject) organized.xmp.subject = Array.isArray(extracted.Subject) ? extracted.Subject.join(', ') : extracted.Subject;

      // Other useful fields
      if (extracted.Software) organized.other.software = extracted.Software;
      if (extracted.Orientation) organized.other.orientation = extracted.Orientation;
      if (extracted.ColorSpace) organized.other.colorSpace = extracted.ColorSpace;
      if (extracted.PixelXDimension) organized.other.pixelWidth = extracted.PixelXDimension;
      if (extracted.PixelYDimension) organized.other.pixelHeight = extracted.PixelYDimension;

      // Store all raw data as well
      organized.raw = extracted;

      setAdvancedMetadata(organized);
      toast.dismiss('metadata-extract');
      toast.success('Advanced metadata extracted!');
    } catch (error) {
      console.error('Error extracting advanced metadata:', error);
      toast.dismiss('metadata-extract');
      setAdvancedMetadata({ message: 'Failed to extract advanced metadata: ' + error.message });
      toast.error('Failed to extract EXIF data');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getAspectRatio = (width, height) => {
    if (!width || !height) return "N/A";
    const ratio = width / height;
    if (Math.abs(ratio - 1) < 0.01) return "1:1 (Square)";
    if (Math.abs(ratio - 16/9) < 0.01) return "16:9 (Widescreen)";
    if (Math.abs(ratio - 4/3) < 0.01) return "4:3 (Standard)";
    if (Math.abs(ratio - 3/2) < 0.01) return "3:2";
    if (Math.abs(ratio - 21/9) < 0.01) return "21:9 (Ultrawide)";
    if (Math.abs(ratio - 9/16) < 0.01) return "9:16 (Vertical)";
    return `${ratio.toFixed(2)}:1`;
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(String(text));
    toast.success(`${label} copied!`);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderMetadataSection = (title, data, sectionKey) => {
    if (!data || Object.keys(data).length === 0) return null;

    const isExpanded = expandedSections[sectionKey];

    return (
      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{title}</h4>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {Object.keys(data).length} fields
            </Badge>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </button>
        
        {isExpanded && (
          <div className="p-3 space-y-2 bg-white dark:bg-slate-950">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="flex items-start justify-between gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded group">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-sm text-slate-900 dark:text-white break-words mt-0.5">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(value, key)}
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>File Metadata</DialogTitle>
          <DialogDescription>
            Complete information about your file including EXIF, IPTC, GPS, and XMP data
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="advanced" onClick={extractAdvancedMetadata}>
              Advanced EXIF
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="basic" className="mt-0 space-y-3">
              {basicMetadata && (
                <div className="space-y-2">
                  {Object.entries(basicMetadata).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {key.replace(/([A-Z])/g, ' $1').trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                          {String(value)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(value, key)}
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="mt-0 space-y-3">
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Extracting EXIF, IPTC, GPS, XMP data...
                  </p>
                </div>
              )}

              {!loading && advancedMetadata && advancedMetadata.message && (
                <div className="p-6 text-center bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {advancedMetadata.message}
                  </p>
                </div>
              )}

              {!loading && advancedMetadata && !advancedMetadata.message && (
                <div className="space-y-3">
                  {renderMetadataSection('📷 Camera', advancedMetadata.camera, 'camera')}
                  {renderMetadataSection('🔍 Lens', advancedMetadata.lens, 'lens')}
                  {renderMetadataSection('⚙️ Camera Settings', advancedMetadata.settings, 'settings')}
                  {renderMetadataSection('📅 Date & Time', advancedMetadata.datetime, 'datetime')}
                  {renderMetadataSection('📍 GPS Location', advancedMetadata.gps, 'gps')}
                  {renderMetadataSection('📝 IPTC Metadata', advancedMetadata.iptc, 'iptc')}
                  {renderMetadataSection('🏷️ XMP Data', advancedMetadata.xmp, 'xmp')}
                  {renderMetadataSection('🔧 Other', advancedMetadata.other, 'other')}
                  
                  {/* Raw data collapsible */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('raw')}
                      className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">🗂️ All Raw Data (JSON)</h4>
                      {expandedSections.raw ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {expandedSections.raw && (
                      <div className="p-3 bg-white dark:bg-slate-950">
                        <pre className="text-xs bg-slate-900 dark:bg-slate-950 text-slate-100 p-3 rounded overflow-x-auto max-h-64">
                          {JSON.stringify(advancedMetadata.raw, null, 2)}
                        </pre>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify(advancedMetadata.raw, null, 2), 'All metadata')}
                          className="mt-2 w-full"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy All JSON
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!loading && !advancedMetadata && (
                <div className="p-6 text-center bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Click here or switch to this tab to extract advanced metadata
                  </p>
                  <Button
                    onClick={extractAdvancedMetadata}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Extract EXIF Data
                  </Button>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          {advancedMetadata && advancedMetadata.gps && advancedMetadata.gps.googleMapsLink && (
            <Button
              variant="outline"
              onClick={() => window.open(advancedMetadata.gps.googleMapsLink, '_blank')}
            >
              View on Google Maps
            </Button>
          )}
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}