import React, { useState, useCallback } from "react";
import { Header } from "./components/Header";
import { FrameCanvas } from "./components/FrameCanvas";
import { PhotoUploader } from "./components/PhotoUploader";
import { BuilderForm } from "./components/BuilderForm";
import { PresetGallery } from "./components/PresetGallery";
import { ShareModal } from "./components/ShareModal";
import { HowToGuide } from "./components/HowToGuide";

import { BadgeData, PhotoConfig } from "./types";
import { DEFAULT_BADGE_DATA } from "./lib/constants";
import { playSound } from "./lib/sound";
import { Download, Share2, Sparkles, HelpCircle, Flame } from "lucide-react";

export default function App() {
  const [badgeData, setBadgeData] = useState<BadgeData>(DEFAULT_BADGE_DATA);
  
  // Single Builder Photo state
  const [singlePhoto, setSinglePhoto] = useState<PhotoConfig>({
    id: "p0",
    url: DEFAULT_BADGE_DATA.teammates[0].photo.url,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    brightness: 100,
    contrast: 100,
  });

  const [canvasDataUrl, setCanvasDataUrl] = useState<string>("");
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [showSparkle, setShowSparkle] = useState<boolean>(false);
  
  // Ultra 3D Tilt state
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false, px: 50, py: 50 });

  // Modals state
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isHowToOpen, setIsHowToOpen] = useState<boolean>(false);

  // Canvas Ready callback
  const handleCanvasReady = useCallback((dataUrl: string) => {
    setCanvasDataUrl(dataUrl);
    setShowSparkle(true);
    setTimeout(() => setShowSparkle(false), 800);
  }, []);

  // AI Builder Title Generation Handler
  const handleGenerateAiTitle = async () => {
    try {
      setIsGeneratingAi(true);
      playSound("generate");
      const res = await fetch("/api/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: badgeData.name,
          role: badgeData.role,
          stack: badgeData.stack,
        }),
      });

      const data = await res.json();
      if (data) {
        playSound("success");
        setBadgeData((prev) => ({
          ...prev,
          builderTitle: data.title || prev.builderTitle,
          motto: data.motto || prev.motto,
          archetype: data.archetype || prev.archetype,
          stats: data.stats || prev.stats,
        }));
      }
    } catch (err) {
      console.error("AI Generation error:", err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Preset Selection Handler
  const handleSelectPreset = (preset: Partial<BadgeData>) => {
    playSound("click");
    setBadgeData((prev) => ({
      ...prev,
      ...preset,
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--color-brand-primary)] text-[var(--color-brand-offwhite)] flex flex-col font-mono selection:bg-[var(--color-brand-accent)] selection:text-brand-primary p-4 lg:p-8 overflow-x-hidden">
      {/* Top Header Navigation */}
      <Header
        onOpenHowTo={() => setIsHowToOpen(true)}
        onQuickShare={() => setIsShareOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto space-y-12">
        {/* 1-Tap Presets Bar */}
        <PresetGallery onSelectPreset={handleSelectPreset} />

        {/* Top Row Grid: Step 1 (Photo Upload & Format) vs Pass Preview Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Step 01 / Photo Upload & Format Selector */}
          <div className="space-y-6">
            {badgeData.format === "squad" ? (
              <div className="space-y-6">
                {badgeData.teammates && badgeData.teammates.map((teammate, index) => (
                  <div key={teammate.id || index} className="space-y-2">
                    <h3 className="text-[10px] font-bold text-brand-accent uppercase tracking-[0.2em] mb-2">
                      {teammate.name || `Teammate ${index + 1}`} Photo
                    </h3>
                    <PhotoUploader
                      photo={teammate.photo}
                      onPhotoChange={(newPhoto) => {
                        const updatedTms = [...badgeData.teammates];
                        updatedTms[index] = { ...updatedTms[index], photo: newPhoto };
                        setBadgeData({ ...badgeData, teammates: updatedTms });
                        if (index === 0) setSinglePhoto(newPhoto);
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <PhotoUploader
                photo={singlePhoto}
                onPhotoChange={(newPhoto) => {
                  setSinglePhoto(newPhoto);
                  if (badgeData.teammates && badgeData.teammates[0]) {
                    const updatedTms = [...badgeData.teammates];
                    updatedTms[0] = { ...updatedTms[0], photo: newPhoto };
                    setBadgeData({ ...badgeData, teammates: updatedTms });
                  }
                }}
              />
            )}
          </div>

          {/* Right: Pass Preview Card & Action Bar */}
          <div className="space-y-6 flex flex-col justify-start items-center w-full">
            {/* Real-time HTML5 Canvas with Clean 3D Tilt */}
            <div 
              className="relative w-full transition-transform duration-150 ease-out perspective-1000 cursor-grab active:cursor-grabbing group"
              style={{
                transform: tilt.active 
                  ? `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale3d(1.02, 1.02, 1.02)` 
                  : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
                transformStyle: 'preserve-3d',
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -16;
                const rotateY = ((x - centerX) / centerX) * 16;
                
                setTilt({
                  x: rotateY,
                  y: rotateX,
                  active: true,
                  px: Math.round((x / rect.width) * 100),
                  py: Math.round((y / rect.height) * 100)
                });
              }}
              onMouseLeave={() => setTilt({ x: 0, y: 0, active: false, px: 50, py: 50 })}
            >
              <div 
                className={`relative w-full overflow-hidden rounded-2xl transition-all duration-300 ${
                  badgeData.rarity === 'MYTHIC' ? 'shimmer-foil' : ''
                }`}
                style={{
                  boxShadow: tilt.active
                    ? `${-tilt.x * 2}px ${tilt.y * 2}px 35px rgba(0,0,0,0.7), 0 0 25px rgba(254, 225, 1, 0.3)`
                    : '0 15px 40px rgba(0,0,0,0.6)',
                }}
              >
                <FrameCanvas
                  badgeData={badgeData}
                  activePhoto={singlePhoto}
                  onCanvasReady={handleCanvasReady}
                />
              </div>
              
              {/* Clean Glossy Sheen Reflection */}
              {tilt.active && (
                <div 
                  className="absolute inset-0 z-40 pointer-events-none rounded-2xl transition-opacity duration-200"
                  style={{
                    background: `linear-gradient(115deg, transparent 35%, rgba(255, 255, 255, 0.22) 50%, transparent 65%)`,
                    transform: `translateX(${(tilt.px - 50) * 0.3}%) translateY(${(tilt.py - 50) * 0.3}%)`,
                  }}
                />
              )}
              
              {/* Sparkle Overlay Effect */}
              <div 
                className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-500 ease-out flex items-center justify-center rounded-2xl ${showSparkle ? 'opacity-30 mix-blend-overlay' : 'opacity-0'}`}
              >
                <div className={`transition-all duration-700 ease-out transform ${showSparkle ? 'scale-150 rotate-12 opacity-100' : 'scale-50 -rotate-12 opacity-0'}`}>
                  <Sparkles className="w-32 h-32 text-brand-accent drop-shadow-[0_0_20px_rgba(254,225,1,1)]" />
                </div>
              </div>
            </div>

            {/* Primary Download & Share Bar */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <button
                onClick={() => {
                  try {
                    const link = document.createElement("a");
                    link.download = `HH-Goa-2026-${(badgeData.name || "Builder").replace(/\s+/g, "-")}.png`;
                    link.href = canvasDataUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } catch (e) {
                    console.error("Export failed:", e);
                    alert("Failed to export image. Please try again.");
                  }
                }}
                className="bg-brand-accent text-brand-primary font-black py-4 px-4 sm:px-6 uppercase tracking-tighter text-sm sm:text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PNG
              </button>

              <button
                onClick={() => setIsShareOpen(true)}
                className="bg-white text-brand-primary font-black py-4 px-4 sm:px-6 uppercase tracking-tighter text-sm sm:text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform cursor-pointer rounded-xl shadow-lg"
              >
                Share to X
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Full Width Steps 2, 3, 4, 5 Grid Below Top Row */}
        <div className="pt-8 border-t border-brand-accent/20">
          <BuilderForm
            badgeData={badgeData}
            onChange={setBadgeData}
            onGenerateAiTitle={handleGenerateAiTitle}
            isGeneratingAi={isGeneratingAi}
          />
        </div>
      </main>

      {/* Modals */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        canvasDataUrl={canvasDataUrl}
        badgeData={badgeData}
      />

      <HowToGuide
        isOpen={isHowToOpen}
        onClose={() => setIsHowToOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-12 flex flex-col sm:flex-row justify-between items-center text-brand-offwhite/60 font-mono text-[10px] uppercase tracking-widest gap-6">
        <div className="flex items-center gap-4">
          <img src="/assets/images/2-47.svg" alt="2:47 pm Studio" className="h-6 opacity-80 hover:opacity-100 transition-opacity" style={{ filter: 'brightness(0) invert(1)' }} />
          <span>#FRAMEINGOA // JOIN THE RADAR</span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
          <span>LAT: 15.2993° N</span>
          <span>LONG: 74.1240° E</span>
          <span className="text-brand-accent">STATUS: CONNECTED</span>
        </div>
      </footer>
    </div>
  );
}
