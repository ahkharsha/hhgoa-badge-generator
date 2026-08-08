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
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-[var(--color-brand-accent)] pb-4 transition-all w-full bg-transparent z-40 gap-4">
      <div className="flex items-center gap-4">
        <img src="/assets/images/Hacker house.png" alt="HH Goa Logo" className="h-10 sm:h-14 object-contain" />
        <span className="hidden md:flex items-center justify-center bg-[var(--color-brand-pink)]/10 px-3 py-1.5 rounded-full border border-[var(--color-brand-pink)]/30">
          <img src="/assets/images/goa_hindi.svg" alt="Goa Hindi" className="h-4 sm:h-6" style={{ filter: 'brightness(0) saturate(100%) invert(32%) sepia(85%) saturate(3065%) hue-rotate(317deg) brightness(98%) contrast(97%)' }} />
        </span>
      </div>

      <div className="flex items-center gap-6">
        <img src="/assets/images/2-47.svg" alt="2:47 pm Studio" className="h-4 sm:h-5 opacity-80" style={{ filter: 'brightness(0) invert(1)' }} />
        
        <div className="flex flex-col items-end gap-2 text-right">
          <div className="flex gap-2">
            <button
              onClick={onOpenHowTo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-brand-offwhite uppercase tracking-wider transition cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-brand-accent" />
              Guide & Features
            </button>
            <button
              onClick={onQuickShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-brand-accent)] hover:bg-yellow-300 text-brand-primary text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate & Export <Share2 className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
