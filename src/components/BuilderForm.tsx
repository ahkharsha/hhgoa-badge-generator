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
}

export const BuilderForm: React.FC<BuilderFormProps> = ({
  badgeData,
  onChange,
  onGenerateAiTitle,
  isGeneratingAi,
}) => {
  const [activeTab, setActiveTab] = useState<"info" | "appearance" | "squad">("info");

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
      {/* Format Selector Tabs */}
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

      {/* Primary Input Fields */}
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-brand-accent mb-2 font-bold">
            Step 02 / Identity
          </label>
          <input
            type="text"
            value={badgeData.name}
            onChange={(e) => onChange({ ...badgeData, name: e.target.value })}
            placeholder="ALEX RIVERA"
            className="w-full bg-transparent border-b-2 border-brand-accent/30 py-2 sm:py-3 text-xl sm:text-2xl font-bold focus:outline-none focus:border-brand-accent placeholder:opacity-20 transition-colors uppercase"
          />
          <p className="text-[10px] text-brand-offwhite/60 mt-2 uppercase tracking-widest font-mono">Enter your builder name as it will appear on the ID</p>
        </div>

        {/* X (Twitter) Handle */}
        <div>
          <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-brand-accent mb-2 font-bold flex items-center gap-2">
            X (Twitter) Handle <span className="bg-brand-accent text-brand-primary px-1.5 py-0.5 rounded text-[8px]">NETWORKING</span>
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
          <p className="text-[10px] text-brand-offwhite/60 mt-2 uppercase tracking-widest font-mono">Generates a dynamic QR code for IRL networking</p>
        </div>

        {/* Role & Stack */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-brand-accent mb-2 font-bold">
              Specialization
            </label>
            <input
              type="text"
              value={badgeData.role}
              onChange={(e) => onChange({ ...badgeData, role: e.target.value })}
              placeholder="RUST / SOLANA"
              className="w-full bg-transparent border-b-2 border-brand-accent/30 py-2 sm:py-3 text-lg sm:text-xl font-bold focus:outline-none focus:border-brand-accent placeholder:opacity-20 transition-colors uppercase"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-brand-accent mb-2 font-bold">
              Tech Stack
            </label>
            <input
              type="text"
              value={badgeData.stack}
              onChange={(e) => onChange({ ...badgeData, stack: e.target.value })}
              placeholder="REACT / TYPESCRIPT"
              className="w-full bg-transparent border-b-2 border-brand-accent/30 py-2 sm:py-3 text-lg sm:text-xl font-bold focus:outline-none focus:border-brand-accent placeholder:opacity-20 transition-colors uppercase"
            />
          </div>
        </div>

        {/* Quick Stack Presets */}
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-brand-offwhite/60 block mb-2">
            Quick Stack Presets //
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_STACKS.map((st, i) => (
              <button
                key={i}
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
                  applyPreset(st);
                }}
                className="px-3 py-1.5 border border-brand-accent/30 hover:border-brand-accent text-brand-offwhite/60 hover:text-brand-offwhite text-[10px] font-mono tracking-widest uppercase transition cursor-pointer"
              >
                {st.split("•")[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* AI Builder Title Section */}
        <div className="pt-6 border-t border-brand-accent/30 space-y-6 overflow-hidden">
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
              className="text-[10px] font-mono tracking-widest uppercase border border-brand-accent text-brand-accent px-4 py-2 hover:bg-brand-accent hover:text-brand-primary transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isGeneratingAi ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3 h-3" />
                  <span>Auto-Generate</span>
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
              className="space-y-6"
            >
              <div>
                <input
                  type="text"
                  value={badgeData.builderTitle}
                  onChange={(e) => onChange({ ...badgeData, builderTitle: e.target.value })}
                  placeholder="AUTONOMOUS AGENT ALCHEMIST"
                  className="w-full bg-transparent border-b-2 border-brand-accent/30 py-3 text-lg sm:text-xl font-bold focus:outline-none focus:border-brand-accent placeholder:opacity-20 transition-colors uppercase text-brand-offwhite"
                />
                <p className="text-[10px] text-brand-offwhite/60 mt-2 uppercase tracking-widest font-mono">Title designation</p>
              </div>

              <div>
                <input
                  type="text"
                  value={badgeData.motto}
                  onChange={(e) => onChange({ ...badgeData, motto: e.target.value })}
                  placeholder="SHIPPING CODE AT 2:47 AM"
                  className="w-full bg-transparent border-b-2 border-brand-accent/30 py-3 text-sm sm:text-base italic font-bold focus:outline-none focus:border-brand-accent placeholder:opacity-20 transition-colors uppercase text-brand-offwhite/80"
                />
                <p className="text-[10px] text-brand-offwhite/60 mt-2 uppercase tracking-widest font-mono">Terminal motto</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Theme Picker */}
        <div className="pt-6 border-t border-brand-accent/30">
          <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-brand-accent mb-4 font-bold">
            Step 04 / Colorway
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(Object.keys(THEMES) as ThemeStyle[]).map((key) => {
              const th = THEMES[key];
              const isSelected = badgeData.theme === key;
              return (
                <button
                  key={key}
                  onClick={() => handleThemeChange(key)}
                  className={`flex flex-col items-center justify-center p-4 border transition cursor-pointer ${
                    isSelected
                      ? "border-brand-accent bg-brand-primary/90"
                      : "border-brand-accent/30 hover:border-[#666] bg-transparent"
                  }`}
                >
                  <div className="flex gap-2 mb-3">
                    <span
                      className="w-4 h-4 rounded-full border border-black"
                      style={{ backgroundColor: th.primary }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black"
                      style={{ backgroundColor: th.secondary }}
                    />
                  </div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-brand-offwhite">
                    {th.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cyberpunk Stamps & Effects */}
        <div className="pt-6 border-t border-brand-accent/30 space-y-4">
          <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-brand-accent mb-2 font-bold">
            Step 05 / Cyberpunk FX & Stamps
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
                  className={`px-3 py-1.5 border text-[10px] font-mono tracking-widest uppercase transition cursor-pointer ${
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
              className={`px-4 py-1.5 border text-[10px] font-mono tracking-widest uppercase transition cursor-pointer ${
                badgeData.scanlines
                  ? "border-brand-accent bg-brand-accent text-brand-primary font-bold"
                  : "border-brand-accent/30 text-[#888] hover:border-[#666]"
              }`}
            >
              {badgeData.scanlines ? "SCANLINES: ACTIVE" : "SCANLINES: OFF"}
            </button>
          </div>
        </div>

        {/* Squad Settings if format is squad */}
        {badgeData.format === "squad" && (
          <div className="pt-6 border-t border-brand-accent/30 space-y-4">
            <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-brand-accent mb-2 font-bold">
              Squad Parameters
            </label>
            <div>
              <input
                type="text"
                value={badgeData.teamName}
                onChange={(e) => onChange({ ...badgeData, teamName: e.target.value })}
                placeholder="TEAM NEURAL SURGE"
                className="w-full bg-transparent border-b-2 border-brand-accent/30 py-2 sm:py-3 text-xl font-bold focus:outline-none focus:border-brand-accent placeholder:opacity-20 transition-colors uppercase"
              />
              <p className="text-[10px] text-brand-offwhite/60 mt-2 uppercase tracking-widest font-mono">Enter squad designation</p>
            </div>
            
            {/* Dynamic Teammates Fields */}
            <div className="space-y-4 pt-4 border-t border-brand-accent/10">
              <span className="text-[10px] uppercase font-mono tracking-widest text-brand-offwhite/60 block">
                Teammate Roster //
              </span>
              {badgeData.teammates?.map((tm, idx) => (
                <div key={tm.id} className="p-4 border border-brand-accent/20 bg-black/20 rounded space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase tracking-widest text-brand-accent font-bold">Teammate {idx + 1}</span>
                    {idx > 0 && (
                       <button onClick={() => {
                          const newTms = badgeData.teammates.filter((_, i) => i !== idx);
                          onChange({ ...badgeData, teammates: newTms });
                       }} className="text-[10px] text-red-400 hover:text-red-300 uppercase tracking-widest transition cursor-pointer">[ Remove ]</button>
                    )}
                  </div>
                  <input type="text" placeholder="Name" value={tm.name} onChange={e => {
                     const newTms = [...badgeData.teammates];
                     newTms[idx] = { ...newTms[idx], name: e.target.value };
                     onChange({ ...badgeData, teammates: newTms });
                  }} className="w-full bg-transparent border-b border-brand-accent/30 py-1 text-sm uppercase focus:outline-none focus:border-brand-accent transition-colors" />
                  
                  <input type="text" placeholder="Role" value={tm.role} onChange={e => {
                     const newTms = [...badgeData.teammates];
                     newTms[idx] = { ...newTms[idx], role: e.target.value };
                     onChange({ ...badgeData, teammates: newTms });
                  }} className="w-full bg-transparent border-b border-brand-accent/30 py-1 text-sm uppercase focus:outline-none focus:border-brand-accent transition-colors" />
                </div>
              ))}
              {(badgeData.teammates?.length || 0) < 4 && (
                 <button onClick={() => {
                    const newTms = [...(badgeData.teammates || [])];
                    newTms.push({
                       id: `t${Date.now()}`,
                       name: `Teammate ${newTms.length + 1}`,
                       role: "Builder",
                       stack: "Web3",
                       photo: { id: `p${Date.now()}`, url: "", zoom: 1, offsetX: 0, offsetY: 0, rotation: 0, brightness: 100, contrast: 100 }
                    });
                    onChange({ ...badgeData, teammates: newTms });
                 }} className="w-full py-3 border border-dashed border-brand-accent/30 text-[10px] font-bold uppercase tracking-widest text-brand-offwhite/60 hover:text-brand-accent hover:border-brand-accent transition cursor-pointer mt-2 bg-brand-accent/5 hover:bg-brand-accent/10 rounded">
                   + Add Teammate
                 </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
