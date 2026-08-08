import React from "react";
import { Sparkles, Users, Zap, Shield, Flame } from "lucide-react";
import { BadgeData } from "../types";
import { SAMPLE_AVATAR, SAMPLE_AVATAR_2, SAMPLE_AVATAR_3 } from "../lib/constants";

interface PresetGalleryProps {
  onSelectPreset: (preset: Partial<BadgeData>) => void;
}

export const PresetGallery: React.FC<PresetGalleryProps> = ({ onSelectPreset }) => {
  const presets = [
    {
      id: "ai-alchemist",
      name: "AI Agent Alchemist",
      role: "AI Lead & LLM Engineer",
      stack: "Gemini API • Python • PyTorch • React",
      builderTitle: "Autonomous Agent Alchemist & Beach Hacker",
      motto: "Shipping 2:47 AM multichain AI agents on Goa sand.",
      theme: "sunset" as const,
      format: "badge" as const,
      photoUrl: SAMPLE_AVATAR,
      icon: <Sparkles className="w-4 h-4 text-orange-400" />,
    },
    {
      id: "solana-dev",
      name: "Solana DeGEN",
      role: "Protocol Wizard",
      stack: "Rust • Solana • Anchor • Web3",
      builderTitle: "Solana Protocol Wizard & Coconut Drinker",
      motto: "High frequency sub-second commits under Goa palm trees.",
      theme: "cyber" as const,
      format: "badge" as const,
      photoUrl: SAMPLE_AVATAR_2,
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: "pfp-gold",
      name: "247 VIP PFP",
      role: "Creative UI Director",
      stack: "Figma • Motion • Tailwind • React",
      builderTitle: "Cyberpunk Pixel Architect",
      motto: "Design so clean it passes WCAG in dark mode.",
      theme: "gold" as const,
      format: "pfp" as const,
      photoUrl: SAMPLE_AVATAR_3,
      icon: <Shield className="w-4 h-4 text-amber-400" />,
    },
    {
      id: "squad-pass",
      name: "Squad Pass (2 Builders)",
      role: "Team Neural Surge",
      stack: "AI • Web3 • Full-Stack",
      builderTitle: "Squad Residency Contenders",
      motto: "Combining forces to win the HH Goa $50,000 bounties.",
      theme: "sunset" as const,
      format: "squad" as const,
      photoUrl: SAMPLE_AVATAR,
      icon: <Users className="w-4 h-4 text-pink-400" />,
    },
  ];

  return (
    <div className="border-y border-brand-accent/30 py-4 my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-offwhite flex items-center gap-2">
          <span className="w-2 h-2 bg-brand-accent"></span>
          Quick Start Configurations
        </label>
        <span className="text-[10px] text-brand-offwhite/60 font-mono uppercase tracking-widest">[ Click to load preset ]</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
              onSelectPreset({
                format: p.format,
                theme: p.theme,
                role: p.role,
                stack: p.stack,
                builderTitle: p.builderTitle,
                motto: p.motto,
                rarity: "EPIC"
              });
            }}
            className="flex flex-col gap-3 p-4 border border-brand-accent/30 hover:border-brand-accent bg-brand-primary/90 hover:bg-brand-primary text-left transition cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-mono tracking-widest uppercase text-brand-accent">{p.format} //</span>
              <div className="w-6 h-6 border border-brand-accent/30 flex items-center justify-center group-hover:border-brand-accent transition">
                {p.icon}
              </div>
            </div>
            <div className="min-w-0 w-full pt-2 border-t border-brand-accent/30">
              <p className="text-sm font-black text-brand-offwhite truncate uppercase tracking-tighter group-hover:text-brand-accent transition">
                {p.name}
              </p>
              <p className="text-[10px] text-brand-offwhite/60 truncate font-mono uppercase mt-1">{p.role}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
