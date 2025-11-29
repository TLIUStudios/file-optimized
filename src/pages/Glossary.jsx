import { useState, useMemo } from "react";
import { Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SEOHead from "../components/SEOHead";

const glossaryTerms = [
  {
    term: "AAC",
    definition: "Advanced Audio Coding - A lossy audio compression format that offers better sound quality than MP3 at similar bitrates. Commonly used in iTunes, YouTube, and mobile devices."
  },
  {
    term: "Aliasing",
    definition: "Visual artifacts that appear as jagged or stair-stepped edges on diagonal lines in digital images. Anti-aliasing techniques smooth these edges for a cleaner appearance."
  },
  {
    term: "Alpha Channel",
    definition: "A component of an image that stores transparency information. Each pixel can have varying levels of transparency (0-255), allowing for smooth edges and partial transparency effects."
  },
  {
    term: "Artifact",
    definition: "Unintended visual distortions in compressed images or videos, such as blocky areas, color banding, or mosquito noise. More aggressive compression typically produces more artifacts."
  },
  {
    term: "Aspect Ratio",
    definition: "The proportional relationship between width and height of an image or video. Common ratios include 16:9 (widescreen), 4:3 (standard), 1:1 (square), and 9:16 (vertical/mobile)."
  },
  {
    term: "AVIF",
    definition: "AV1 Image File Format - A modern image format that offers superior compression compared to JPEG and WebP. Developed by the Alliance for Open Media, AVIF supports both lossy and lossless compression, transparency, and HDR."
  },
  {
    term: "Batch Processing",
    definition: "The technique of processing multiple files simultaneously or in sequence using the same settings, saving time compared to handling files individually."
  },
  {
    term: "Bit Depth",
    definition: "The number of bits used to represent each color channel in an image. 8-bit provides 256 levels per channel (16.7 million colors), while 16-bit offers 65,536 levels for smoother gradients."
  },
  {
    term: "Bitrate",
    definition: "The amount of data processed per unit of time in a video or audio file, typically measured in kilobits per second (kbps) or megabits per second (Mbps). Higher bitrate generally means better quality but larger file size."
  },
  {
    term: "BMP",
    definition: "Bitmap Image File - An uncompressed raster image format that preserves exact pixel data. Rarely used on the web due to large file sizes but useful for archival purposes."
  },
  {
    term: "Chroma Subsampling",
    definition: "A compression technique that reduces color information while preserving luminance detail. Expressed as ratios like 4:2:0 (used in most video) or 4:4:4 (full color detail)."
  },
  {
    term: "Client-Side Processing",
    definition: "File processing that occurs in the user's web browser rather than on a remote server. Offers privacy benefits and eliminates upload times but depends on device capabilities."
  },
  {
    term: "Codec",
    definition: "Short for 'compressor-decompressor' - software that encodes and decodes digital media. Examples include H.264 for video and AAC for audio. The codec determines how data is compressed and the resulting quality."
  },
  {
    term: "Color Profile",
    definition: "A set of data describing how colors should be interpreted and displayed. Common profiles include sRGB (web standard), Adobe RGB (print), and Display P3 (modern displays)."
  },
  {
    term: "Color Space",
    definition: "A model that defines the range of colors that can be represented. RGB is used for screens, CMYK for print, and specialized spaces like LAB for color-accurate editing."
  },
  {
    term: "Compression",
    definition: "The process of reducing file size by encoding data more efficiently. Can be lossy (permanently removes some data) or lossless (preserves all original data). Essential for web optimization and storage efficiency."
  },
  {
    term: "Compression Ratio",
    definition: "The ratio between the original and compressed file sizes. A 10:1 ratio means the compressed file is one-tenth the size of the original."
  },
  {
    term: "Container Format",
    definition: "A file format that can hold multiple types of data (video, audio, subtitles, metadata) together. Examples include MP4, MKV, WebM, and AVI."
  },
  {
    term: "Core Web Vitals",
    definition: "Google's metrics for measuring user experience: Largest Contentful Paint (LCP), First Input Delay (FID), and Cumulative Layout Shift (CLS). Image optimization directly impacts LCP scores."
  },
  {
    term: "Cropping",
    definition: "Removing unwanted portions of an image by selecting a specific rectangular area to keep. Does not reduce image resolution within the cropped area."
  },
  {
    term: "DCT",
    definition: "Discrete Cosine Transform - A mathematical technique used in JPEG compression to convert spatial pixel data into frequency components, enabling efficient compression."
  },
  {
    term: "Dithering",
    definition: "A technique that simulates missing colors by arranging available colors in patterns. Used when reducing color depth or converting to formats with limited color palettes like GIF."
  },
  {
    term: "DPI/PPI",
    definition: "Dots Per Inch / Pixels Per Inch - Measures the resolution of an image. Higher DPI means more detail. 72 DPI is standard for web, while 300 DPI is typical for print."
  },
  {
    term: "Encoding",
    definition: "The process of converting raw media data into a compressed format using a specific codec. Quality settings during encoding determine the balance between file size and quality."
  },
  {
    term: "EXIF",
    definition: "Exchangeable Image File Format - Metadata embedded in images containing camera settings, date/time, GPS location, and other information. Can be stripped for privacy and smaller file sizes."
  },
  {
    term: "FLAC",
    definition: "Free Lossless Audio Codec - An audio format that compresses without any quality loss. Files are larger than MP3 but preserve original audio fidelity perfectly."
  },
  {
    term: "Frame",
    definition: "A single still image within a video sequence. Standard video displays 24-60 frames per second to create the illusion of motion."
  },
  {
    term: "Frame Rate",
    definition: "The number of individual frames displayed per second in a video, measured in fps (frames per second). Common rates include 24fps (cinematic), 30fps (standard video), and 60fps (smooth motion)."
  },
  {
    term: "GIF",
    definition: "Graphics Interchange Format - A bitmap image format that supports animation and limited transparency. Uses lossless compression but is limited to 256 colors, making it suitable for simple graphics and short animations."
  },
  {
    term: "GOP",
    definition: "Group of Pictures - In video compression, a sequence of frames consisting of I-frames (keyframes), P-frames (predicted), and B-frames (bidirectional). Longer GOPs improve compression but reduce seek accuracy."
  },
  {
    term: "H.264 (AVC)",
    definition: "Advanced Video Coding - The most widely used video compression standard. Offers excellent compression efficiency and is supported by virtually all devices and platforms. Used in MP4 containers."
  },
  {
    term: "H.265 (HEVC)",
    definition: "High Efficiency Video Coding - A newer video compression standard offering 50% better compression than H.264 at the same quality. Requires more processing power and has licensing considerations."
  },
  {
    term: "HDR",
    definition: "High Dynamic Range - Technology that captures and displays a wider range of brightness levels and colors than standard images, resulting in more realistic and vibrant visuals."
  },
  {
    term: "Histogram",
    definition: "A graph showing the distribution of tones in an image from shadows (left) to highlights (right). Useful for understanding exposure and optimizing image quality."
  },
  {
    term: "I-Frame",
    definition: "Intra-frame or keyframe - A complete image in a video sequence that doesn't reference other frames. Seeking in video typically jumps to I-frames."
  },
  {
    term: "ICC Profile",
    definition: "International Color Consortium Profile - Data that describes how colors should be interpreted to ensure consistent appearance across different devices and software."
  },
  {
    term: "Interpolation",
    definition: "The process of estimating new pixel values when resizing images. Methods include nearest-neighbor (fast, blocky), bilinear (smooth), and bicubic (higher quality)."
  },
  {
    term: "JPEG",
    definition: "Joint Photographic Experts Group - The most common image format for photographs. Uses lossy compression, making it ideal for photos but not for graphics with sharp edges or text."
  },
  {
    term: "JPEG 2000",
    definition: "An improved JPEG standard offering better compression and quality, plus support for lossless compression and transparency. Limited browser support prevents widespread web use."
  },
  {
    term: "JPEG XL",
    definition: "A next-generation image format designed to eventually replace JPEG. Offers superior compression, lossless capability, and can transcode existing JPEGs without quality loss."
  },
  {
    term: "Keyframe",
    definition: "A complete reference frame in video that other frames are built from. More keyframes improve seeking but increase file size."
  },
  {
    term: "Latency",
    definition: "The delay between initiating an action and seeing the result. In file processing, this includes time for encoding, decoding, and data transfer."
  },
  {
    term: "Lazy Loading",
    definition: "A technique that delays loading images until they're about to enter the viewport, improving initial page load time and reducing bandwidth for images never viewed."
  },
  {
    term: "LCH",
    definition: "A color space using Lightness, Chroma (saturation), and Hue. More intuitive for color adjustments than RGB because changes to one value don't unexpectedly affect others."
  },
  {
    term: "Lossless Compression",
    definition: "A compression method that reduces file size without losing any data. The original file can be perfectly reconstructed. Examples include PNG for images and FLAC for audio."
  },
  {
    term: "Lossy Compression",
    definition: "A compression method that achieves smaller file sizes by permanently removing some data. The removed data is typically imperceptible to humans. Examples include JPEG for images and MP3 for audio."
  },
  {
    term: "Luminance",
    definition: "The brightness component of an image, separate from color (chrominance). Human vision is more sensitive to luminance than color, which compression algorithms exploit."
  },
  {
    term: "Metadata",
    definition: "Information embedded in a file that describes its properties, such as creation date, camera settings (EXIF), copyright info, and GPS coordinates. Can be stripped to reduce file size and protect privacy."
  },
  {
    term: "MKV",
    definition: "Matroska Video - An open-source container format supporting virtually unlimited video, audio, and subtitle tracks. Popular for high-quality video archival."
  },
  {
    term: "Moire Pattern",
    definition: "An interference pattern that appears when fine details in images interact with display pixels, common in photos of screens, fabrics, or fine lines."
  },
  {
    term: "MP3",
    definition: "MPEG Audio Layer III - The most widely used audio format. Uses lossy compression to significantly reduce file size while maintaining acceptable quality for most listening purposes."
  },
  {
    term: "MP4",
    definition: "MPEG-4 Part 14 - A digital multimedia container format that can store video, audio, subtitles, and metadata. The most common video format for web and mobile, typically using H.264 video codec."
  },
  {
    term: "Muxing",
    definition: "The process of combining separate video, audio, and subtitle streams into a single container file. Demuxing is the reverse process."
  },
  {
    term: "Noise",
    definition: "Random variations in brightness or color in images, often appearing as grain. Can result from high ISO settings, poor lighting, or compression artifacts."
  },
  {
    term: "Noise Reduction",
    definition: "Processing that reduces visual noise while attempting to preserve image detail. Can be applied during capture, editing, or compression."
  },
  {
    term: "Optimization",
    definition: "The process of adjusting file parameters to achieve the best balance between quality and file size for a specific use case, such as web display or archival."
  },
  {
    term: "Opus",
    definition: "A versatile audio codec excelling at both speech and music. Offers better quality than MP3 at lower bitrates and is royalty-free."
  },
  {
    term: "PNG",
    definition: "Portable Network Graphics - A lossless image format that supports transparency. Ideal for graphics, logos, and screenshots where sharp edges must be preserved. Larger than JPEG for photographs."
  },
  {
    term: "Posterization",
    definition: "A visual artifact where smooth gradients appear as distinct bands of color, caused by insufficient bit depth or aggressive compression."
  },
  {
    term: "Progressive Loading",
    definition: "A technique where images load in increasing quality levels, showing a low-quality preview first that improves as more data arrives. Improves perceived loading speed."
  },
  {
    term: "Quantization",
    definition: "The process of reducing the precision of values during compression, which introduces some loss but significantly reduces file size."
  },
  {
    term: "Raster Image",
    definition: "An image composed of a grid of pixels, as opposed to vector graphics. JPEG, PNG, and GIF are all raster formats."
  },
  {
    term: "Resampling",
    definition: "The process of changing an image's pixel count when resizing. Quality depends on the resampling algorithm used (bilinear, bicubic, Lanczos, etc.)."
  },
  {
    term: "Resolution",
    definition: "The dimensions of an image or video in pixels (width × height). Common resolutions include 1920×1080 (1080p/Full HD), 3840×2160 (4K/UHD), and various mobile sizes."
  },
  {
    term: "RGB",
    definition: "Red, Green, Blue - The color model used by screens where colors are created by combining different intensities of red, green, and blue light."
  },
  {
    term: "Sample Rate",
    definition: "In audio, the number of samples per second used to represent the sound wave. CD quality is 44.1kHz; higher rates like 48kHz or 96kHz capture more detail."
  },
  {
    term: "Sharpening",
    definition: "Processing that increases edge contrast to make images appear more detailed. Should be applied carefully as over-sharpening creates visible halos."
  },
  {
    term: "TIFF",
    definition: "Tagged Image File Format - A flexible format supporting various compression methods and high bit depths. Commonly used in professional photography and printing."
  },
  {
    term: "Transcoding",
    definition: "Converting media from one codec or format to another. May involve re-encoding (with potential quality loss) or remuxing (changing container without re-encoding)."
  },
  {
    term: "Transparency",
    definition: "The property allowing parts of an image to be see-through. Supported by PNG, WebP, AVIF, and GIF formats, but not JPEG."
  },
  {
    term: "Upscaling",
    definition: "The process of increasing an image's resolution beyond its original size. AI-powered upscaling uses machine learning to add detail and maintain sharpness, unlike traditional methods that simply interpolate pixels."
  },
  {
    term: "Variable Bitrate (VBR)",
    definition: "An encoding method that adjusts bitrate based on content complexity. Uses more data for complex scenes and less for simple ones, optimizing quality per file size."
  },
  {
    term: "Vector Graphics",
    definition: "Images defined by mathematical shapes rather than pixels. Can be scaled infinitely without quality loss. Formats include SVG, AI, and EPS."
  },
  {
    term: "VP9",
    definition: "An open-source video codec developed by Google, offering similar compression to HEVC without licensing fees. Widely used on YouTube."
  },
  {
    term: "WAV",
    definition: "Waveform Audio File Format - An uncompressed audio format that preserves full quality. Results in large file sizes but is ideal for audio editing and archival purposes."
  },
  {
    term: "WebAssembly",
    definition: "A binary instruction format enabling near-native code execution in browsers. Used for high-performance tasks like image/video processing in web applications."
  },
  {
    term: "WebM",
    definition: "An open-source video container format using VP8/VP9 video and Vorbis/Opus audio. Optimized for web use with good compression and broad browser support."
  },
  {
    term: "WebP",
    definition: "A modern image format developed by Google that provides superior compression for web images. Supports both lossy and lossless compression, transparency, and animation. 25-35% smaller than JPEG."
  },
  {
    term: "Wide Color Gamut",
    definition: "Color spaces like Display P3 or Adobe RGB that represent more colors than sRGB. Important for HDR content and professional color work."
  },
  {
    term: "XMP",
    definition: "Extensible Metadata Platform - Adobe's standard for embedding metadata in files, including editing history, keywords, and rights information."
  },
  {
    term: "YUV",
    definition: "A color space that separates image luminance (Y) from chrominance (U and V). Used internally in most video codecs because it allows more efficient compression."
  },
  {
    term: "Zero-Copy",
    definition: "A technique where data is transferred without being copied between memory locations, improving performance in file processing operations."
  },
  {
    term: "Aspect Ratio Correction",
    definition: "Adjusting image dimensions to maintain proper proportions when converting between different aspect ratios, preventing stretching or squashing."
  },
  {
    term: "Batch Encoding",
    definition: "Processing multiple files through the same encoding settings sequentially or in parallel, saving time for bulk operations."
  },
  {
    term: "Bicubic Interpolation",
    definition: "A high-quality resampling algorithm that considers 16 surrounding pixels when calculating new pixel values during resizing."
  },
  {
    term: "Chromatic Aberration",
    definition: "Color fringing at the edges of high-contrast areas in images, caused by lens imperfections. Can be reduced through processing."
  },
  {
    term: "Color Gamut",
    definition: "The range of colors that can be represented in a particular color space or displayed by a device. Wider gamuts show more colors."
  },
  {
    term: "Constant Rate Factor (CRF)",
    definition: "A video encoding mode that targets a specific quality level rather than a specific bitrate, allowing variable bitrate to match content complexity."
  },
  {
    term: "Delta Frame",
    definition: "A video frame that only stores differences from a reference frame, enabling significant compression compared to storing complete frames."
  },
  {
    term: "Entropy Coding",
    definition: "A lossless compression technique that assigns shorter codes to more frequent patterns and longer codes to rare ones (e.g., Huffman coding)."
  },
  {
    term: "File Header",
    definition: "The initial portion of a file containing metadata about the file's format, dimensions, compression method, and other technical details."
  },
  {
    term: "Gamma Correction",
    definition: "Adjusting the brightness values in an image to compensate for non-linear display characteristics and human perception."
  },
  {
    term: "Grayscale",
    definition: "An image containing only shades of gray, no color information. Often smaller than color images and used for certain applications."
  },
  {
    term: "Hardware Acceleration",
    definition: "Using specialized hardware (GPU, dedicated encoders) to speed up encoding/decoding operations rather than relying solely on CPU."
  },
  {
    term: "Interlacing",
    definition: "A video technique displaying odd and even lines in alternating frames. Progressive (non-interlaced) is preferred for modern displays."
  },
  {
    term: "Jitter",
    definition: "Variation in delivery timing of video frames or audio samples, which can cause playback issues if not handled properly."
  },
  {
    term: "Lanczos Resampling",
    definition: "A high-quality interpolation algorithm for resizing images that produces sharper results than bicubic, at the cost of more processing."
  },
  {
    term: "Level (Video)",
    definition: "A set of constraints defining maximum resolution, frame rate, and bitrate for a video codec profile, ensuring compatibility."
  },
  {
    term: "Macroblock",
    definition: "A unit of video compression typically 16x16 pixels. Video codecs compress and process video in these blocks."
  },
  {
    term: "Motion Compensation",
    definition: "A video compression technique that describes how pixels move between frames rather than storing each frame completely."
  },
  {
    term: "Motion Estimation",
    definition: "The process of finding matching regions between video frames to enable efficient motion-compensated compression."
  },
  {
    term: "Native Resolution",
    definition: "The actual pixel dimensions of an image or video before any scaling. Displaying at native resolution provides the sharpest image."
  },
  {
    term: "Pixel Aspect Ratio",
    definition: "The shape of individual pixels. Square pixels (1:1) are standard, but some formats use non-square pixels requiring correction."
  },
  {
    term: "Profile (Video)",
    definition: "A subset of codec features defining compatibility. Higher profiles offer more features but require more capable decoders."
  },
  {
    term: "SSIM",
    definition: "Structural Similarity Index - A metric measuring perceived quality by comparing structural information between original and compressed images."
  },
  {
    term: "Subpixel Rendering",
    definition: "A technique using individual RGB subpixels to increase apparent resolution, commonly used for text rendering on LCD displays."
  },
  {
    term: "Two-Pass Encoding",
    definition: "A video encoding method where the first pass analyzes content and the second pass uses that information for optimal quality distribution."
  },
  {
    term: "VBV Buffer",
    definition: "Video Buffering Verifier - A model ensuring encoded video can be decoded smoothly without buffer overflow or underflow."
  },
  {
    term: "Vorbis",
    definition: "An open-source audio codec commonly used in WebM videos and Ogg containers. Royalty-free alternative to MP3 and AAC."
  },
  {
    term: "Wavelet Compression",
    definition: "A compression technique using mathematical wavelets to analyze and compress images. Used in JPEG 2000 and some scientific imaging."
  },
  {
    term: "White Balance",
    definition: "Adjusting color temperature in images to ensure white objects appear truly white under different lighting conditions."
  },
  {
    term: "Aliasing",
    definition: "Visual artifacts appearing as jagged edges or stair-stepping in digital images, especially on diagonal lines. Anti-aliasing techniques smooth these edges."
  },
  {
    term: "Alpha Premultiplication",
    definition: "A technique where RGB values are pre-multiplied by the alpha channel, improving compositing quality and reducing edge artifacts."
  },
  {
    term: "Anisotropic Filtering",
    definition: "A texture filtering method that improves image quality when surfaces are viewed at oblique angles, commonly used in 3D graphics."
  },
  {
    term: "B-Frame",
    definition: "Bidirectional predicted frame in video that references both previous and future frames for maximum compression efficiency."
  },
  {
    term: "Bitplane",
    definition: "A representation of image data where each plane contains one bit of pixel information, used in some compression schemes."
  },
  {
    term: "Block Artifact",
    definition: "Visible grid pattern in compressed images/video caused by DCT processing blocks, especially noticeable at low quality settings."
  },
  {
    term: "Brightness",
    definition: "The overall lightness or darkness of an image. Adjusting brightness affects all pixels uniformly."
  },
  {
    term: "Cache",
    definition: "Temporary storage that speeds up repeated access to data. Browser caches store images to avoid re-downloading."
  },
  {
    term: "Catalog",
    definition: "A database of image metadata and previews, used by photo management software to organize large collections without modifying originals."
  },
  {
    term: "Channel",
    definition: "A single color component of an image. RGB images have three channels (Red, Green, Blue), while CMYK has four."
  },
  {
    term: "Clipping",
    definition: "Loss of detail in the brightest (highlight clipping) or darkest (shadow clipping) areas of an image due to exceeding the dynamic range."
  },
  {
    term: "Color Depth",
    definition: "The number of bits used to represent color. Higher depth means more colors: 8-bit = 16.7 million colors, 10-bit = 1 billion colors."
  },
  {
    term: "Color Space",
    definition: "A defined range of colors that can be represented. Common spaces include sRGB (web), Adobe RGB (print), and Display P3 (wide gamut)."
  },
  {
    term: "Compositing",
    definition: "Combining multiple images or layers into a single image, requiring proper alpha channel handling for transparent elements."
  },
  {
    term: "Compression Ratio",
    definition: "The ratio of original file size to compressed file size. A 10:1 ratio means the compressed file is 10 times smaller."
  },
  {
    term: "Contrast",
    definition: "The difference between the lightest and darkest areas of an image. High contrast images have stark differences; low contrast appears flat."
  },
  {
    term: "Crop Factor",
    definition: "The ratio between a camera sensor size and full-frame format, affecting apparent focal length and field of view."
  },
  {
    term: "Data Rate",
    definition: "The amount of data processed per unit time, typically measured in Mbps for video or kbps for audio."
  },
  {
    term: "Debanding",
    definition: "The process of reducing visible banding in gradients, often caused by insufficient color depth or aggressive compression."
  },
  {
    term: "Decimation",
    definition: "Reducing resolution by removing samples, opposite of interpolation. Used in downscaling images and video."
  },
  {
    term: "Deinterlacing",
    definition: "Converting interlaced video (alternating field lines) to progressive format for modern displays."
  },
  {
    term: "Demosaicing",
    definition: "The process of reconstructing full-color images from raw camera sensor data, which only captures one color per pixel."
  },
  {
    term: "Denoise",
    definition: "Removing unwanted random variations (noise) from images while preserving detail and edges."
  },
  {
    term: "Depth of Field",
    definition: "The range of distance in an image that appears acceptably sharp. Affects which areas are in focus."
  },
  {
    term: "DNG",
    definition: "Digital Negative - Adobe's open RAW image format designed for long-term archival of camera raw data."
  },
  {
    term: "Dithering",
    definition: "Adding noise to simulate colors not in the palette, reducing banding in images with limited color depth."
  },
  {
    term: "Dolby Vision",
    definition: "A proprietary HDR format with dynamic metadata, providing scene-by-scene optimization for compatible displays."
  },
  {
    term: "Downsampling",
    definition: "Reducing image resolution by decreasing the number of pixels, typically using interpolation algorithms."
  },
  {
    term: "Dynamic Metadata",
    definition: "Metadata that can change throughout a video, allowing optimization per scene or frame (used in Dolby Vision, HDR10+)."
  },
  {
    term: "Edge Detection",
    definition: "Algorithms that identify boundaries between different regions in an image, used in compression and image analysis."
  },
  {
    term: "Embedded Profile",
    definition: "Color profile data stored within an image file, ensuring consistent color reproduction across different devices."
  },
  {
    term: "Encode",
    definition: "The process of converting raw data into a compressed format using a specific codec."
  },
  {
    term: "Exposure",
    definition: "The amount of light captured in an image. Overexposure causes blown highlights; underexposure loses shadow detail."
  },
  {
    term: "F-Stop",
    definition: "A measurement of camera aperture affecting depth of field and exposure. Lower f-stops mean wider aperture."
  },
  {
    term: "Feathering",
    definition: "Softening the edges of a selection or mask to create gradual transitions rather than hard edges."
  },
  {
    term: "Film Grain",
    definition: "Random optical texture in photographs, either from film or digitally added for aesthetic effect."
  },
  {
    term: "Filter",
    definition: "An algorithm that modifies image data, from simple adjustments like blur to complex effects like style transfer."
  },
  {
    term: "Fixed Point",
    definition: "A number representation using a fixed number of decimal places, sometimes used in image processing for speed."
  },
  {
    term: "Floating Point",
    definition: "A number representation allowing variable decimal places, enabling high dynamic range image processing."
  },
  {
    term: "Focus Stacking",
    definition: "Combining multiple images with different focus points to achieve greater depth of field than possible in a single shot."
  },
  {
    term: "Fringing",
    definition: "Unwanted color artifacts at high-contrast edges, often caused by chromatic aberration or compression."
  },
  {
    term: "Full Frame",
    definition: "A camera sensor size equivalent to 35mm film (36x24mm), considered the professional standard."
  },
  {
    term: "Gain",
    definition: "Amplification of a signal, increasing brightness in images or volume in audio. High gain introduces noise."
  },
  {
    term: "Gamut Mapping",
    definition: "Converting colors from one color space to another, handling out-of-gamut colors through clipping or compression."
  },
  {
    term: "Gaussian Blur",
    definition: "A smoothing filter that uses a Gaussian function, creating natural-looking blur with minimal artifacts."
  },
  {
    term: "Geotagging",
    definition: "Adding location data (GPS coordinates) to image metadata, useful for organizing photos by location."
  },
  {
    term: "Ghosting",
    definition: "Faint duplicate images appearing in photos, often from lens flare, HDR misalignment, or motion blur."
  },
  {
    term: "Gradient",
    definition: "A smooth transition between two or more colors. Gradients are challenging to compress without banding."
  },
  {
    term: "Grain Synthesis",
    definition: "Artificially generating film grain patterns, often done after compression to restore natural texture."
  },
  {
    term: "Graph",
    definition: "A visual representation of data, such as histograms showing tonal distribution or waveforms showing audio levels."
  },
  {
    term: "Grid",
    definition: "A pattern of horizontal and vertical lines used for alignment, composition, or as a visual element."
  },
  {
    term: "Group of Pictures (GOP)",
    definition: "A sequence of video frames beginning with a keyframe, followed by predicted frames. Shorter GOPs enable faster seeking."
  },
  {
    term: "Halftone",
    definition: "A technique using dots of varying sizes to simulate continuous tones, traditionally used in printing."
  },
  {
    term: "Handles",
    definition: "Extra frames at the beginning and end of video clips providing flexibility for editing transitions."
  },
  {
    term: "Hash",
    definition: "A fixed-size value computed from file data, used to verify file integrity after transfer or compression."
  },
  {
    term: "Haze Removal",
    definition: "Processing to reduce atmospheric haze in images, improving clarity and contrast in outdoor photos."
  },
  {
    term: "HDR10",
    definition: "An open HDR standard using static metadata, supported by most HDR displays and streaming services."
  },
  {
    term: "HDR10+",
    definition: "An enhanced HDR format with dynamic metadata, providing scene-by-scene optimization as a royalty-free alternative to Dolby Vision."
  },
  {
    term: "Headroom",
    definition: "The margin between normal signal levels and the maximum before clipping occurs, important in audio mastering."
  },
  {
    term: "High Pass Filter",
    definition: "A filter that preserves high-frequency detail (edges) while removing low-frequency information (smooth areas)."
  },
  {
    term: "Highlight Recovery",
    definition: "Techniques to restore detail in overexposed areas of an image, most effective with RAW files."
  },
  {
    term: "HLG",
    definition: "Hybrid Log-Gamma - An HDR format compatible with both SDR and HDR displays without metadata."
  },
  {
    term: "Hue",
    definition: "The pure color value on the color wheel (red, blue, green, etc.) independent of saturation and brightness."
  },
  {
    term: "Hybrid Codec",
    definition: "A video codec using both motion compensation and transform coding, like H.264 and H.265."
  },
  {
    term: "ICC Profile",
    definition: "A standardized color profile format ensuring consistent color reproduction across devices and software."
  },
  {
    term: "Image Map",
    definition: "An image with defined clickable regions, each linking to different destinations. Used in web design."
  },
  {
    term: "Image Pyramid",
    definition: "A multi-resolution representation of an image, used for efficient zooming and progressive loading."
  },
  {
    term: "Import",
    definition: "Loading external files into an application, often involving format conversion or metadata extraction."
  },
  {
    term: "Indexed Color",
    definition: "A color mode using a limited palette (typically 256 colors), reducing file size but limiting color range."
  },
  {
    term: "Ingest",
    definition: "The process of importing and organizing media files, often including transcoding and metadata extraction."
  },
  {
    term: "Interpolation Algorithm",
    definition: "A method for calculating new pixel values when resizing images, affecting quality and processing speed."
  },
  {
    term: "ISO",
    definition: "Camera sensitivity setting. Higher ISO allows faster shutter speeds but introduces noise."
  },
  {
    term: "JFIF",
    definition: "JPEG File Interchange Format - The most common JPEG file format, specifying how JPEG data is stored."
  },
  {
    term: "JPEG 2000",
    definition: "An advanced JPEG format using wavelet compression, offering better quality but limited browser support."
  },
  {
    term: "JPEG XL",
    definition: "A next-generation image format offering superior compression, HDR support, and JPEG compatibility."
  },
  {
    term: "Kerning",
    definition: "Adjusting space between specific character pairs in text, affecting readability and aesthetics."
  },
  {
    term: "Key Light",
    definition: "The primary light source in photography or video, establishing the main illumination and shadow direction."
  },
  {
    term: "Knockout",
    definition: "Removing a background or specific color from an image, creating transparency for compositing."
  },
  {
    term: "LAB Color",
    definition: "A color space designed to match human perception, with L for lightness, A for green-red, and B for blue-yellow."
  },
  {
    term: "Latency",
    definition: "Delay between input and output, critical for real-time video processing and streaming."
  },
  {
    term: "Layer",
    definition: "A component of a composite image that can be edited independently, enabling non-destructive editing."
  },
  {
    term: "Leading",
    definition: "The vertical space between lines of text, affecting readability and visual appearance."
  },
  {
    term: "Lens Correction",
    definition: "Compensating for optical distortions like barrel distortion, vignetting, and chromatic aberration."
  },
  {
    term: "Letterboxing",
    definition: "Adding black bars above and below video to fit widescreen content in a different aspect ratio display."
  },
  {
    term: "Levels",
    definition: "An adjustment tool controlling the black point, white point, and gamma of an image's tonal range."
  },
  {
    term: "LFE",
    definition: "Low-Frequency Effects - The '.1' channel in surround sound, dedicated to bass frequencies."
  },
  {
    term: "Lightness",
    definition: "The perceived brightness of a color, independent of hue and saturation. Part of HSL color model."
  },
  {
    term: "Linear Color",
    definition: "Color values with a linear relationship to light intensity, required for accurate compositing and effects."
  },
  {
    term: "Linked File",
    definition: "An external file referenced by a document rather than embedded, keeping file sizes manageable."
  },
  {
    term: "LLM",
    definition: "Large Language Model - AI that can assist with metadata generation, image descriptions, and content analysis."
  },
  {
    term: "Local Adjustment",
    definition: "Edits applied to specific areas of an image rather than globally, using masks or selection tools."
  },
  {
    term: "Log Color",
    definition: "A logarithmic encoding preserving more dynamic range in video, requiring color grading for display."
  },
  {
    term: "Long Exposure",
    definition: "A photograph taken with extended shutter time, capturing motion blur or low-light scenes."
  },
  {
    term: "Lookup Table",
    definition: "A data structure mapping input values to output values, commonly used for color grading (LUTs)."
  },
  {
    term: "Low Pass Filter",
    definition: "A filter removing high-frequency detail, used for blur effects or anti-aliasing before downsampling."
  },
  {
    term: "Luma",
    definition: "The brightness component of a video signal, separate from color (chroma) information."
  },
  {
    term: "Luminance",
    definition: "A measure of light intensity as perceived by the human eye, weighted toward green sensitivity."
  },
  {
    term: "LUT",
    definition: "Look-Up Table - A preset color transformation used for color grading in photo and video editing."
  },
  {
    term: "Macro",
    definition: "Close-up photography of small subjects, or an automated sequence of editing operations."
  },
  {
    term: "Mask",
    definition: "A grayscale image defining which areas of a layer are visible, enabling selective adjustments."
  },
  {
    term: "Master",
    definition: "The final, highest-quality version of a media file, used as the source for all distributions."
  },
  {
    term: "Matte",
    definition: "An image or video channel defining transparency, used for compositing foreground and background."
  },
  {
    term: "Maximum Bitrate",
    definition: "The highest data rate allowed in variable bitrate encoding, preventing quality drops in complex scenes."
  },
  {
    term: "Megapixel",
    definition: "One million pixels. A camera resolution measurement - 12MP means the sensor captures 12 million pixels."
  },
  {
    term: "Midtones",
    definition: "The middle brightness values in an image, between highlights and shadows."
  },
  {
    term: "Mipmapping",
    definition: "Pre-generating smaller versions of textures for efficient rendering at various distances in 3D graphics."
  },
  {
    term: "Moiré",
    definition: "Interference patterns appearing when fine patterns interact with sensor pixels or display grids."
  },
  {
    term: "Monochrome",
    definition: "Images using shades of a single color, commonly black and white photography."
  },
  {
    term: "MXF",
    definition: "Material Exchange Format - A professional video container format used in broadcast and post-production."
  },
  {
    term: "Nearest Neighbor",
    definition: "The simplest interpolation method, copying the nearest pixel value. Fast but produces blocky results."
  },
  {
    term: "Negative Space",
    definition: "Empty or unoccupied areas in a composition, providing visual breathing room and emphasis."
  },
  {
    term: "Noise Floor",
    definition: "The level of background noise in audio or image sensors, setting the lower limit of usable signal."
  },
  {
    term: "Noise Profile",
    definition: "A characterization of noise patterns in a camera or audio device, used for targeted noise reduction."
  },
  {
    term: "Non-Destructive Editing",
    definition: "Editing methods that don't modify original data, allowing changes to be undone or modified later."
  },
  {
    term: "NTSC",
    definition: "National Television System Committee - A legacy video standard with 29.97fps, primarily used in North America."
  },
  {
    term: "Nyquist Frequency",
    definition: "Half the sampling rate, representing the highest frequency that can be accurately captured without aliasing."
  },
  {
    term: "Opacity",
    definition: "The opposite of transparency - 100% opacity is fully opaque, 0% is fully transparent."
  },
  {
    term: "Optical Flow",
    definition: "An algorithm analyzing motion between frames, used for frame interpolation and slow motion."
  },
  {
    term: "Orthographic",
    definition: "A projection showing objects without perspective distortion, useful for technical and architectural images."
  },
  {
    term: "Output Sharpening",
    definition: "Final sharpening applied after resizing, optimized for the specific output medium (web, print, etc.)."
  },
  {
    term: "Oversampling",
    definition: "Sampling at a higher rate than necessary, then filtering down for improved quality."
  },
  {
    term: "P-Frame",
    definition: "Predicted frame in video compression, storing only differences from the previous reference frame."
  },
  {
    term: "PAL",
    definition: "Phase Alternating Line - A legacy video standard with 25fps, used in Europe and other regions."
  },
  {
    term: "Palette",
    definition: "A defined set of colors used in an image, especially important for indexed color formats like GIF."
  },
  {
    term: "Panning",
    definition: "Horizontal camera movement, or audio effect moving sound between left and right channels."
  },
  {
    term: "Panorama",
    definition: "A wide-angle view created by stitching multiple photographs together."
  },
  {
    term: "Parametric EQ",
    definition: "An equalizer with adjustable frequency, gain, and bandwidth for precise audio shaping."
  },
  {
    term: "Peak Signal",
    definition: "The maximum amplitude in audio or video, used to calculate quality metrics like PSNR."
  },
  {
    term: "Perceptual Encoding",
    definition: "Compression optimized for human perception, removing data less likely to be noticed."
  },
  {
    term: "Phase",
    definition: "The timing relationship between audio channels or wave components, affecting stereo imaging and clarity."
  },
  {
    term: "Photo Merge",
    definition: "Combining multiple exposures into HDR, panoramas, or focus-stacked images."
  },
  {
    term: "Pillarboxing",
    definition: "Adding black bars on the sides of video to fit 4:3 content in widescreen displays."
  },
  {
    term: "Pipeline",
    definition: "A sequence of processing steps applied to media, from capture through editing to delivery."
  },
  {
    term: "Pixel Binning",
    definition: "Combining adjacent pixels to increase sensitivity at the cost of resolution, used in low-light photography."
  },
  {
    term: "Posterization",
    definition: "Reducing continuous tones to discrete levels, creating a graphic poster-like effect."
  },
  {
    term: "Pre-Roll",
    definition: "Extra video before the desired start point, ensuring clean cuts and transitions in editing."
  },
  {
    term: "Premultiplied Alpha",
    definition: "Alpha channel where RGB values have been multiplied by alpha, improving compositing quality."
  },
  {
    term: "Preset",
    definition: "Saved settings that can be applied to multiple files for consistent processing."
  },
  {
    term: "Primaries",
    definition: "The fundamental colors defining a color space (typically Red, Green, Blue for additive color)."
  },
  {
    term: "Probe",
    definition: "A tool for analyzing specific points or regions in an image or video, measuring color values or levels."
  },
  {
    term: "ProRes",
    definition: "Apple's professional video codec, offering high quality with efficient editing performance."
  },
  {
    term: "Proxy",
    definition: "A lower-resolution substitute file used during editing, replaced with original quality for final output."
  },
  {
    term: "Psychoacoustic",
    definition: "Relating to perceived sound, used in audio compression to remove inaudible frequencies."
  },
  {
    term: "Pull-Down",
    definition: "Converting frame rates by adding or removing frames, historically used for film-to-video transfer."
  },
  {
    term: "Quantization Matrix",
    definition: "A table defining compression strength for different frequency components in JPEG and video."
  },
  {
    term: "Quarter Resolution",
    definition: "Half the width and height of original, creating 1/4 the pixel count for proxy workflows."
  },
  {
    term: "Queue",
    definition: "A list of files waiting to be processed in batch operations."
  },
  {
    term: "RAW+JPEG",
    definition: "Camera mode capturing both RAW and JPEG simultaneously for flexibility and convenience."
  },
  {
    term: "Rec. 2020",
    definition: "A wide color gamut standard for UHDTV, covering more colors than Rec. 709."
  },
  {
    term: "Rec. 709",
    definition: "The standard color space for HDTV, defining color primaries, white point, and transfer function."
  },
  {
    term: "Reference Frame",
    definition: "A video frame used as a basis for predicting other frames, typically an I-frame."
  },
  {
    term: "Reframe",
    definition: "Adjusting the crop and position of video to change composition or fit different aspect ratios."
  },
  {
    term: "Render",
    definition: "Processing edits and effects to create the final output file."
  },
  {
    term: "Resample",
    definition: "Changing the sampling rate of audio or the resolution of images/video."
  },
  {
    term: "Reverse Telecine",
    definition: "Removing pull-down frames added during film-to-video transfer, restoring original frame rate."
  },
  {
    term: "RGB Parade",
    definition: "A scope showing separate waveforms for red, green, and blue channels, used in color grading."
  },
  {
    term: "Ringing",
    definition: "Artificial echoes or halos around edges, a compression artifact especially visible in JPEG."
  },
  {
    term: "Rolling Shutter",
    definition: "Sensor readout method causing skew in fast motion, as lines are captured at slightly different times."
  },
  {
    term: "Safe Area",
    definition: "The portion of video guaranteed to be visible on all displays, avoiding edge cropping."
  },
  {
    term: "Sample",
    definition: "A single measurement of audio amplitude at a specific moment in time."
  },
  {
    term: "Saturation",
    definition: "The intensity or purity of a color. High saturation is vivid; low saturation approaches gray."
  },
  {
    term: "Scale",
    definition: "Resizing an image or video, either uniformly or with independent horizontal/vertical scaling."
  },
  {
    term: "Scene Detection",
    definition: "Automatically identifying cuts between different scenes in video for editing or encoding."
  },
  {
    term: "Scrubbing",
    definition: "Quickly previewing video or audio by dragging through the timeline."
  },
  {
    term: "Segmented Download",
    definition: "Downloading a file in parts that can be fetched in parallel, improving speed and reliability."
  },
  {
    term: "Selective Color",
    definition: "Adjusting specific color ranges in an image while leaving others unchanged."
  },
  {
    term: "Sequence",
    definition: "A series of images or video clips arranged in order for playback or editing."
  },
  {
    term: "Shadow Recovery",
    definition: "Techniques to reveal detail in underexposed dark areas of an image."
  },
  {
    term: "Sharpen",
    definition: "Increasing edge contrast to make images appear more detailed and crisp."
  },
  {
    term: "Sidecar File",
    definition: "A separate file storing metadata or edits alongside the original, enabling non-destructive workflows."
  },
  {
    term: "Signal-to-Noise Ratio",
    definition: "The relationship between desired signal and unwanted noise, measured in decibels."
  },
  {
    term: "Slice",
    definition: "A portion of an image that can be exported separately, used in web design for optimization."
  },
  {
    term: "Slow Motion",
    definition: "Video played back slower than real-time, requiring high frame rate capture."
  },
  {
    term: "Smart Object",
    definition: "A non-destructive container for image data preserving original quality through transformations."
  },
  {
    term: "Soft Proof",
    definition: "Previewing how an image will appear when printed or displayed on another device."
  },
  {
    term: "Source",
    definition: "The original file or signal before processing, ideally preserved as a master copy."
  },
  {
    term: "Spatial Compression",
    definition: "Compression within a single frame, reducing redundancy in each image."
  },
  {
    term: "Specular Highlight",
    definition: "Bright reflections from shiny surfaces, often requiring careful exposure and editing."
  },
  {
    term: "Split Toning",
    definition: "Applying different color tints to highlights and shadows for creative effect."
  },
  {
    term: "Spot Color",
    definition: "A premixed ink color for printing, ensuring exact color reproduction."
  },
  {
    term: "Sprite Sheet",
    definition: "Multiple images combined into a single file, reducing HTTP requests in web applications."
  },
  {
    term: "SRT",
    definition: "SubRip Text - A common subtitle format containing timed text for video."
  },
  {
    term: "Stabilization",
    definition: "Removing unwanted camera shake from video, either in-camera or in post-processing."
  },
  {
    term: "Stacking",
    definition: "Combining multiple images to reduce noise, extend dynamic range, or increase depth of field."
  },
  {
    term: "Static Metadata",
    definition: "HDR metadata that applies to the entire video, unlike dynamic metadata that varies per scene."
  },
  {
    term: "Stem",
    definition: "A submix of audio elements, like all dialogue or all music, providing flexibility in final mixing."
  },
  {
    term: "Stitching",
    definition: "Combining multiple overlapping images into a panorama or larger composition."
  },
  {
    term: "Stop",
    definition: "A unit of exposure change, where one stop doubles or halves the light."
  },
  {
    term: "Straight Alpha",
    definition: "Alpha channel separate from RGB, as opposed to premultiplied alpha."
  },
  {
    term: "Streaming Protocol",
    definition: "Methods for delivering video over networks, like HLS, DASH, or RTMP."
  },
  {
    term: "Subsampling",
    definition: "Reducing chroma resolution relative to luma, used in video compression (4:2:0, 4:2:2, etc.)."
  },
  {
    term: "Super Resolution",
    definition: "AI-powered upscaling that adds realistic detail beyond what simple interpolation provides."
  },
  {
    term: "Sync",
    definition: "Alignment of audio and video timing, critical for professional media production."
  },
  {
    term: "Target Bitrate",
    definition: "The desired data rate for encoding, balanced against quality requirements."
  },
  {
    term: "Telecine",
    definition: "Converting film frame rate to video frame rate by adding duplicate frames."
  },
  {
    term: "Temporal Compression",
    definition: "Video compression using similarities between frames over time."
  },
  {
    term: "Texture",
    definition: "Surface detail and patterns in images, or image files applied to 3D models."
  },
  {
    term: "Thumbnail",
    definition: "A small preview image representing a larger file, used for navigation and browsing."
  },
  {
    term: "Tiling",
    definition: "Dividing images into smaller sections for processing or repeating patterns."
  },
  {
    term: "Time-lapse",
    definition: "Video created from photos taken at intervals, compressing long periods into short sequences."
  },
  {
    term: "Timeline",
    definition: "A visual representation of media sequence over time, used in video editing."
  },
  {
    term: "Tone Curve",
    definition: "A graph showing the relationship between input and output brightness values for precise adjustment."
  },
  {
    term: "Tone Mapping",
    definition: "Converting HDR content to standard dynamic range while preserving visual appearance."
  },
  {
    term: "Tracking",
    definition: "Following a point or object through video frames, used for effects and stabilization."
  },
  {
    term: "Transcode",
    definition: "Converting media from one codec or format to another."
  },
  {
    term: "Transfer Function",
    definition: "The mathematical relationship between linear light values and encoded signal, like gamma."
  },
  {
    term: "Transparency",
    definition: "The degree to which background shows through an image element, controlled by alpha channel."
  },
  {
    term: "Transport Stream",
    definition: "A container format designed for broadcasting, carrying video, audio, and data."
  },
  {
    term: "Trim",
    definition: "Removing unwanted portions from the beginning or end of media clips."
  },
  {
    term: "True Color",
    definition: "24-bit color depth providing 16.7 million colors, standard for most digital images."
  },
  {
    term: "Uncompressed",
    definition: "Media stored without compression, preserving all original data at maximum file size."
  },
  {
    term: "Underscan",
    definition: "Displaying the full image including areas normally hidden by overscan."
  },
  {
    term: "Upconvert",
    definition: "Increasing resolution or color depth of existing content."
  },
  {
    term: "Variable Frame Rate",
    definition: "Video where frame rate changes during playback, common in screen recordings."
  },
  {
    term: "VBR",
    definition: "Variable Bit Rate - Encoding that adjusts data rate based on content complexity."
  },
  {
    term: "Vector Scope",
    definition: "A circular display showing color saturation and hue, used for color correction."
  },
  {
    term: "Vignette",
    definition: "Darkening of image corners, either an optical effect or intentionally added for style."
  },
  {
    term: "Virtual Reality",
    definition: "Immersive 360° media experiences requiring specialized capture and encoding."
  },
  {
    term: "Waveform Monitor",
    definition: "A display showing luminance levels of video, used for exposure evaluation."
  },
  {
    term: "White Point",
    definition: "The color temperature and brightness level defined as 'white' in a color space."
  },
  {
    term: "Wide Gamut",
    definition: "Color spaces covering more colors than sRGB, like Display P3 or Rec. 2020."
  },
  {
    term: "Workflow",
    definition: "The sequence of steps and tools used to process media from capture to delivery."
  },
  {
    term: "ZIP Compression",
    definition: "A lossless compression algorithm used for archiving files and in some image formats."
  }
];

export default function Glossary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(30);

  const filteredTerms = glossaryTerms.filter(item =>
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedTerms = filteredTerms.slice(0, displayCount);
  const hasMore = filteredTerms.length > displayCount;

  const alphabet = [...new Set(glossaryTerms.map(t => t.term[0].toUpperCase()))].sort();

  return (
    <>
      <SEOHead 
        title="Glossary - File Optimized | Image & Video Terms Explained"
        description="Learn the meaning of common image and video compression terms. Our glossary explains codecs, formats, compression methods, and more in simple language."
      />
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Glossary
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Technical terms explained in simple language
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* Alphabet Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {alphabet.map(letter => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="w-8 h-8 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              {letter}
            </a>
          ))}
        </div>

        {/* Terms List */}
        <div className="space-y-6">
          {alphabet.map(letter => {
            const letterTerms = displayedTerms.filter(t => t.term[0].toUpperCase() === letter);
            if (letterTerms.length === 0) return null;

            return (
              <div key={letter} id={`letter-${letter}`}>
                <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                  {letter}
                </h2>
                <div className="space-y-4">
                  {letterTerms.map((item, index) => (
                    <div 
                      key={index}
                      className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800"
                    >
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {item.term}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && !searchQuery && (
          <div className="text-center mt-10">
            <Button
              onClick={() => setDisplayCount(prev => prev + 30)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
            >
              Load More Terms ({filteredTerms.length - displayCount} remaining)
            </Button>
          </div>
        )}

        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No terms found matching "{searchQuery}"</p>
          </div>
        )}

        {/* Total count */}
        <div className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
          {glossaryTerms.length} terms in glossary
        </div>
      </div>
    </>
  );
}