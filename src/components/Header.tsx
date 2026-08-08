import React from "react";
import { HelpCircle, Share2, Sparkles, ShieldCheck } from "lucide-react";

interface HeaderProps {
  onOpenHowTo: () => void;
  onQuickShare: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHowTo,
  onQuickShare,
}) => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 border-b border-[var(--color-brand-accent)] pb-4 transition-all w-full bg-transparent z-40">
      <div className="flex flex-col mb-4 sm:mb-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[var(--color-brand-accent)] font-mono text-[10px] sm:text-xs tracking-widest uppercase bg-[var(--color-brand-accent)]/10 border border-[var(--color-brand-accent)]/30 px-2 py-0.5 rounded">
            HH GOA // 28-31 OCT 2026
          </span>
          <span className="text-[var(--color-brand-pink)] font-mono text-[10px] sm:text-xs tracking-widest uppercase bg-[var(--color-brand-pink)]/10 border border-[var(--color-brand-pink)]/30 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
            <ShieldCheck className="w-3 h-3" /> ID GENERATOR
          </span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-heading font-bold leading-none uppercase flex items-center gap-3">
          HH GOA <span className="text-[var(--color-brand-accent)]">2026</span>
          <span className="text-xl sm:text-2xl font-bold text-[var(--color-brand-pink)] bg-[var(--color-brand-pink)]/10 px-3 py-1 rounded-full border border-[var(--color-brand-pink)]/30 font-sans tracking-normal hidden md:inline-block">
            गोवा
          </span>
        </h1>
      </div>

      <div className="flex flex-col items-start sm:items-end gap-2 sm:text-right">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={onOpenHowTo}
            className="text-[11px] font-mono uppercase text-[var(--color-brand-offwhite)] hover:text-[var(--color-brand-accent)] transition flex items-center gap-1.5 cursor-pointer bg-black/20 hover:bg-brand-primary/40 px-3 py-1.5 border border-[var(--color-brand-accent)]/30 rounded-lg"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[var(--color-brand-accent)]" />
            <span>Guide & Features</span>
          </button>
        </div>
        
        <button
          onClick={onQuickShare}
          className="text-[11px] sm:text-xs font-bold tracking-widest uppercase flex items-center gap-2 bg-[var(--color-brand-accent)] text-[var(--color-brand-primary)] px-4 py-2 rounded-lg hover:opacity-90 transition cursor-pointer font-mono"
        >
          <Sparkles className="w-4 h-4 fill-[var(--color-brand-primary)]" />
          <span>Generate & Export</span>
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

