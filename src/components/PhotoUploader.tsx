import React, { useRef, useState } from "react";
import { Upload, Move, ZoomIn, RotateCw, Sun, RefreshCw, Image as ImageIcon } from "lucide-react";
import heic2any from "heic2any";
import { PhotoConfig } from "../types";

interface PhotoUploaderProps {
  photo: PhotoConfig;
  onPhotoChange: (newPhoto: PhotoConfig) => void;
  label?: string;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photo,
  onPhotoChange,
  label = "Upload Builder Photo",
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const performSmartCrop = async (url: string) => {
    try {
      // Dynamic import to avoid SSR issues if this was SSR, but here it's fine
      const smartcrop = (await import("smartcrop")).default;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Target aspect ratio is typically 1:1 or 9:16. We'll optimize for square here since most profile pics are square.
      const result = await smartcrop.crop(img, { width: 500, height: 500 });
      if (result && result.topCrop) {
        const crop = result.topCrop;
        // Convert crop coordinates to zoom/offset for our standard canvas drawing logic
        // The crop object has x, y, width, height.
        // If the original image is WxH, and we want to fit `crop` into our view.
        
        // Approximate zoom
        const cropAspect = crop.width / crop.height;
        const imgAspect = img.width / img.height;
        
        let zoom = 1;
        if (cropAspect > 1) {
          zoom = img.width / crop.width;
        } else {
          zoom = img.height / crop.height;
        }
        
        // Ensure minimum zoom of 1
        zoom = Math.max(1, zoom);

        // Approximate offset (-50 to 50 range in our UI corresponds to shift)
        // Center of crop relative to center of image
        const cropCenterX = crop.x + crop.width / 2;
        const cropCenterY = crop.y + crop.height / 2;
        
        const imgCenterX = img.width / 2;
        const imgCenterY = img.height / 2;
        
        // Map to -50 to 50 range, roughly 
        const offsetX = ((imgCenterX - cropCenterX) / img.width) * 100 * zoom;
        const offsetY = ((imgCenterY - cropCenterY) / img.height) * 100 * zoom;

        onPhotoChange({
          ...photo,
          url,
          zoom: Math.min(Math.max(zoom, 1), 5), // clamp zoom
          offsetX: Math.min(Math.max(offsetX, -50), 50),
          offsetY: Math.min(Math.max(offsetY, -50), 50),
          rotation: 0,
        });
      }
    } catch (e) {
      console.error("Smart crop failed", e);
      // Fallback
      onPhotoChange({
        ...photo,
        url,
        zoom: 1.6,
        offsetX: 0,
        offsetY: 20,
        rotation: 0,
      });
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      let processableFile: File | Blob = file;
      
      // Convert HEIC to JPEG if needed
      if (file.name.toLowerCase().endsWith(".heic") || file.type === "image/heic") {
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8,
        });
        processableFile = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const url = event.target?.result as string;
        await performSmartCrop(url);
        setIsProcessing(false);
      };
      reader.readAsDataURL(processableFile);
    } catch (err) {
      console.error("Error processing image:", err);
      setIsProcessing(false);
      alert("Failed to process image. If it's a HEIC, try converting it to JPEG first.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const resetTransforms = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
    onPhotoChange({
      ...photo,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      brightness: 100,
      contrast: 100,
    });
  };

  const smartCrop = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
    if (photo.url) {
      performSmartCrop(photo.url);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed border-brand-accent/30 h-48 flex flex-col items-center justify-center bg-brand-primary/90 hover:bg-brand-primary/80 transition-all cursor-pointer rounded-lg relative ${
          photo.url ? "border-brand-accent" : ""
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp, image/heic"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-brand-accent animate-spin" />
            <p className="text-[10px] text-brand-accent font-mono uppercase tracking-widest">Processing Image...</p>
          </div>
        ) : photo.url ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <img
              src={photo.url}
              alt="Selected preview"
              className="w-16 h-16 rounded-full object-cover border-2 border-brand-accent grayscale contrast-125"
              referrerPolicy="no-referrer"
            />
            <p className="text-[10px] text-brand-accent font-mono uppercase tracking-widest">Photo Active / Click to Swap</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 mb-3 bg-brand-accent rounded-full flex items-center justify-center text-brand-primary">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs uppercase font-bold tracking-widest text-brand-offwhite">Drop Photo Here</p>
            <p className="text-[10px] text-brand-offwhite/60 mt-1 font-mono">PNG, JPG, OR HEIC SUPPORTED</p>
          </>
        )}
      </div>

      {!photo.url &&          <div className="flex gap-2 w-full mt-2">
            <button
              onClick={() =>
                onPhotoChange({ ...photo, url: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80", zoom: 1.1, offsetY: 0 })
              }
              className="flex-1 bg-slate-900 border border-slate-700 hover:border-brand-accent hover:bg-slate-800 text-xs text-slate-300 py-1.5 rounded-md transition"
            >
              Sample 1
            </button>
            <button
              onClick={() =>
                onPhotoChange({ ...photo, url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80", zoom: 1.1, offsetY: 0 })
              }
              className="flex-1 bg-slate-900 border border-slate-700 hover:border-brand-accent hover:bg-slate-800 text-xs text-slate-300 py-1.5 rounded-md transition"
            >
              Sample 2
            </button>
        </div>
      }

      {/* Position & Zoom Controls */}
      {photo.url && (
        <div className="space-y-4 pt-4 border-t border-brand-accent/30">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-brand-accent uppercase tracking-[0.2em]">
              Fine-Tune Geometry
            </p>
            <div className="flex gap-2">
              <button
                onClick={smartCrop}
                className="text-[10px] text-brand-offwhite hover:text-brand-accent uppercase font-mono tracking-widest transition cursor-pointer"
              >
                [ Smart Crop ]
              </button>
              <button
                onClick={resetTransforms}
                className="text-[10px] text-brand-offwhite/60 hover:text-brand-accent uppercase font-mono tracking-widest transition cursor-pointer"
              >
                [ Reset ]
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[10px] font-mono tracking-widest uppercase">
            {/* Zoom Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-brand-offwhite/60">
                <span>Zoom</span>
                <span className="text-brand-offwhite">{Math.round(photo.zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={photo.zoom}
                onChange={(e) =>
                  onPhotoChange({ ...photo, zoom: parseFloat(e.target.value) })
                }
                className="w-full accent-brand-accent cursor-pointer"
              />
            </div>

            {/* Rotation Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-brand-offwhite/60">
                <span>Rotation</span>
                <span className="text-brand-offwhite">{photo.rotation}°</span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                step="1"
                value={photo.rotation}
                onChange={(e) =>
                  onPhotoChange({ ...photo, rotation: parseInt(e.target.value) })
                }
                className="w-full accent-brand-accent cursor-pointer"
              />
            </div>

            {/* Pan X Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-brand-offwhite/60">
                <span>Pan X</span>
                <span className="text-brand-offwhite">{photo.offsetX}px</span>
              </div>
              <input
                type="range"
                min="-200"
                max="200"
                step="2"
                value={photo.offsetX}
                onChange={(e) =>
                  onPhotoChange({ ...photo, offsetX: parseInt(e.target.value) })
                }
                className="w-full accent-brand-accent cursor-pointer"
              />
            </div>

            {/* Pan Y Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-brand-offwhite/60">
                <span>Pan Y</span>
                <span className="text-brand-offwhite">{photo.offsetY}px</span>
              </div>
              <input
                type="range"
                min="-200"
                max="200"
                step="2"
                value={photo.offsetY}
                onChange={(e) =>
                  onPhotoChange({ ...photo, offsetY: parseInt(e.target.value) })
                }
                className="w-full accent-brand-accent cursor-pointer"
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onPhotoChange({ ...photo, url: "" })}
              className="text-[10px] text-red-400 hover:text-red-300 uppercase font-mono tracking-widest transition cursor-pointer border-b border-red-400/30 hover:border-red-300 pb-0.5"
            >
              [ Remove Photo ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
