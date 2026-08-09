import React, { useState } from "react";
import { Sparkles, Users, User, Palette, Layers, RefreshCw, Wand2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BadgeData, FrameFormat, ThemeStyle } from "../types";
import { THEMES, PRESET_STACKS } from "../lib/constants";

interface BuilderFormProps {
  badgeData: BadgeData;
  onChange: (updated: BadgeData) => void;
  onGenerateAiTitle: () => Promise<void>;
  isGeneratingAi: boolean;
  isProMode: boolean;
}

export const BuilderForm: React.FC<BuilderFormProps> = ({
  badgeData,
  onChange,
  onGenerateAiTitle,
  isGeneratingAi,
  isProMode,
}) => {
  const handleFormatChange = (format: FrameFormat) => {
    onChange({ ...badgeData, format });
  };

  const handleThemeChange = (theme: ThemeStyle) => {
    onChange({ ...badgeData, theme });
  };

  const applyPreset = (presetStack: string) => {
    onChange({
      ...badgeData,
      stack: presetStack,
    });
  };

  return (
    <div className="space-y-8">
      {/* Step 01: Format Selector Tabs */}
      <div>
        <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-brand-accent mb-3 font-bold">
          Step 01 / Output Format
        </label>
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          <button
            onClick={() => handleFormatChange("pfp")}
            className={`py-2 px-1 border-2 transition font-black uppercase tracking-tighter text-xs flex flex-col items-center gap-1 cursor-pointer ${
              badgeData.format === "pfp"
                ? "bg-brand-accent text-brand-primary border-brand-accent"
                : "bg-transparent text-brand-offwhite/60 border-brand-accent/30 hover:border-brand-accent hover:text-brand-offwhite"
            }`}
          >
            <span>PFP</span>
          </button>

          <button
            onClick={() => handleFormatChange("badge")}
            className={`py-2 px-1 border-2 transition font-black uppercase tracking-tighter text-xs flex flex-col items-center gap-1 cursor-pointer ${
              badgeData.format === "badge"
                ? "bg-brand-accent text-brand-primary border-brand-accent"
                : "bg-transparent text-brand-offwhite/60 border-brand-accent/30 hover:border-brand-accent hover:text-brand-offwhite"
            }`}
          >
            <span>Card</span>
          </button>

          <button
            onClick={() => handleFormatChange("squad")}
            className={`py-2 px-1 border-2 transition font-black uppercase tracking-tighter text-xs flex flex-col items-center gap-1 cursor-pointer ${
              badgeData.format === "squad"
                ? "bg-brand-accent text-brand-primary border-brand-accent"
                : "bg-transparent text-brand-offwhite/60 border-brand-accent/30 hover:border-brand-accent hover:text-brand-offwhite"
            }`}
          >
            <span>Squad</span>
          </button>
          
          <button
            onClick={() => handleFormatChange("header")}
            className={`py-2 px-1 border-2 transition font-black uppercase tracking-tighter text-xs flex flex-col items-center gap-1 cursor-pointer ${
              badgeData.format === "header"
                ? "bg-brand-accent text-brand-primary border-brand-accent"
                : "bg-transparent text-brand-offwhite/60 border-brand-accent/30 hover:border-brand-accent hover:text-brand-offwhite"
            }`}
          >
            <span>Header</span>
          </button>
          
          <button
            onClick={() => handleFormatChange("story")}
            className={`py-2 px-1 border-2 transition font-black uppercase tracking-tighter text-xs flex flex-col items-center gap-1 cursor-pointer ${
              badgeData.format === "story"
                ? "bg-brand-accent text-brand-primary border-brand-accent"
                : "bg-transparent text-brand-offwhite/60 border-brand-accent/30 hover:border-brand-accent hover:text-brand-offwhite"
            }`}
          >
            <span>Story</span>
          </button>
        </div>
      </div>

      {/* Two-Column Side-by-Side Layout for Step 02 & Step 03 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-4 border-t border-brand-accent/20">
        {/* Step 02: Identity & Details */}
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-brand-accent mb-2 font-bold">
              Step 02 / Identity
            </label>
            <input
              type="text"
              value={badgeData.name}
              onChange={(e) => onChange({ ...badgeData, name: e.target.value })}
              placeholder="JANE DOE"
              className="w-full bg-transparent border-b-2 border-brand-accent/30 py-2 sm:py-3 text-xl sm:text-2xl font-bold focus:outline-none focus:border-brand-accent placeholder:opacity-20 transition-colors uppercase"
            />
            <p className="text-[10px] text-brand-offwhite/60 mt-2 uppercase tracking-widest font-mono">Builder name on ID</p>
          </div>

          <AnimatePresence>
            {isProMode && (
              <motion.div 
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }} 
                animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              >
                <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-brand-accent mb-2 font-bold flex items-center gap-2">
                  X Handle (Optional) <span className="bg-brand-accent text-brand-primary px-1.5 py-0.5 rounded text-[8px]">IRL QR CODE</span>
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-accent/50 text-xl font-bold">@</span>
                  <input
                    type="text"
                    value={badgeData.xHandle || ""}
                    onChange={(e) => {
                      let val = e.target.value.trim();
                      if (val.startsWith("@")) val = val.substring(1);
                      onChange({ ...badgeData, xHandle: val });
                    }}
                    placeholder="HackerHouseGoa"
                    className="w-full bg-transparent border-b-2 border-brand-accent/30 py-2 sm:py-3 pl-8 text-xl sm:text-2xl font-bold focus:outline-none focus:border-brand-accent placeholder:opacity-20 transition-colors"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-brand-accent mb-2 font-bold">
                Specialization & Stack
              </label>
              <input
                type="text"
                value={badgeData.role}
                onChange={(e) => onChange({ ...badgeData, role: e.target.value })}
                placeholder="RUST / SOLANA"
                className="w-full bg-transparent border-b-2 border-brand-accent/30 py-2 sm:py-3 text-base sm:text-lg font-bold focus:outline-none focus:border-brand-accent placeholder:opacity-20 transition-colors uppercase"
              />
            </div>
            
            {/* Quick Stack Presets */}
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-brand-offwhite/60 block mb-2">
                Quick Presets //
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_STACKS.map((st, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
                      applyPreset(st);
                    }}
                    className="px-2.5 py-1 border border-brand-accent/30 hover:border-brand-accent text-brand-offwhite/60 hover:text-brand-offwhite text-[9px] font-mono tracking-widest uppercase transition cursor-pointer"
                  >
                    {st.split("•")[0].trim()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 03: Generated Class & AI Title (Right of Step 02) */}
        <AnimatePresence>
          {isProMode && (
            <motion.div 
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }} 
              animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              className="space-y-6 bg-black/20 p-5 rounded-xl border border-brand-accent/20 h-full"
            >
              <div className="flex items-center justify-between">
                <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-brand-accent font-bold flex items-center">
                  Step 03 / Generated Class
                  <AnimatePresence mode="wait">
                    {badgeData.rarity && (
                      <motion.span
                        key={badgeData.rarity}
                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        className="ml-2 px-2 py-1 bg-brand-accent/20 text-brand-accent rounded text-[9px] font-mono tracking-widest inline-block"
                      >
                        {badgeData.rarity}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </label>
                <button
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
                    onGenerateAiTitle();
                  }}
                  disabled={isGeneratingAi}
                  className="text-[10px] font-mono tracking-widest uppercase border border-brand-accent text-brand-accent px-3 py-1.5 hover:bg-brand-accent hover:text-brand-primary transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isGeneratingAi ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3 h-3" />
                      <span>AI Generate</span>
                    </>
                  )}
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={badgeData.builderTitle + badgeData.motto}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-[10px] text-brand-offwhite/60 uppercase tracking-widest font-mono block mb-1">Title Designation</label>
                    <input
                      type="text"
                      value={badgeData.builderTitle}
                      onChange={(e) => onChange({ ...badgeData, builderTitle: e.target.value })}
                      placeholder="AUTONOMOUS AGENT ALCHEMIST"
                      className="w-full bg-transparent border-b-2 border-brand-accent/30 py-2 text-base font-bold focus:outline-none focus:border-brand-accent placeholder:opacity-20 transition-colors uppercase text-brand-offwhite"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-brand-offwhite/60 uppercase tracking-widest font-mono block mb-1">Terminal Motto</label>
                    <input
                      type="text"
                      value={badgeData.motto}
                      onChange={(e) => onChange({ ...badgeData, motto: e.target.value })}
                      placeholder="SHIPPING CODE AT 2:47 AM"
                      className="w-full bg-transparent border-b-2 border-brand-accent/30 py-2 text-sm italic font-bold focus:outline-none focus:border-brand-accent placeholder:opacity-20 transition-colors uppercase text-brand-offwhite/80"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step 04 & Step 05: Colorway & Cyberpunk FX */}
      <AnimatePresence>
        {isProMode && (
          <motion.div 
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }} 
            animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-6 border-t border-brand-accent/30"
          >
            {/* Step 04: Theme Picker */}
            <div>
              <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-brand-accent mb-4 font-bold">
                Step 04 / Colorway & Theme Vibe
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {(Object.keys(THEMES) as ThemeStyle[]).map((key) => {
                  const th = THEMES[key];
                  const isSelected = badgeData.theme === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleThemeChange(key)}
                      className={`flex flex-col items-center justify-center p-3 border transition cursor-pointer rounded ${
                        isSelected
                          ? "border-brand-accent bg-brand-primary/90 shadow-[0_0_15px_rgba(254,225,1,0.3)]"
                          : "border-brand-accent/30 hover:border-[#666] bg-transparent"
                      }`}
                    >
                      <div className="flex gap-1.5 mb-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black"
                          style={{ backgroundColor: th.primary }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black"
                          style={{ backgroundColor: th.secondary }}
                        />
                      </div>
                      <span className="text-[9px] font-mono tracking-widest uppercase text-brand-offwhite">
                        {th.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 05: Cyberpunk Stamps & FX */}
            <div className="space-y-4">
              <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-brand-accent mb-2 font-bold">
                Step 05 / Cyberpunk Stamps & FX
              </label>

              {/* Stamps */}
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-brand-offwhite/60 block mb-2">
                  Holographic Stamp Seal //
                </span>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      "VERIFIED BUILDER",
                      "HHG VIP APPROVED",
                      "GOA VIP",
                      "AI ALCHEMIST",
                      "SOLANA DEGEN",
                      "NONE",
                    ] as const
                  ).map((st) => (
                    <button
                      key={st}
                      onClick={() => onChange({ ...badgeData, stamp: st })}
                      className={`px-2.5 py-1 border text-[9px] font-mono tracking-widest uppercase transition cursor-pointer rounded ${
                        badgeData.stamp === st
                          ? "border-brand-accent bg-brand-accent text-brand-primary font-bold"
                          : "border-brand-accent/30 text-[#888] hover:border-[#666] hover:text-brand-offwhite"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* CRT Scanlines Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-brand-offwhite/60">
                  CRT Scanlines Overlay
                </span>
                <button
                  onClick={() => onChange({ ...badgeData, scanlines: !badgeData.scanlines })}
                  className={`px-3 py-1 border text-[9px] font-mono tracking-widest uppercase transition cursor-pointer rounded ${
                    badgeData.scanlines
                      ? "border-brand-accent bg-brand-accent text-brand-primary font-bold"
                      : "border-brand-accent/30 text-[#888] hover:border-[#666]"
                  }`}
                >
                  {badgeData.scanlines ? "SCANLINES: ON" : "SCANLINES: OFF"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


