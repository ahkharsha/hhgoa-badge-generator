import React from "react";
import { HelpCircle, X, CheckCircle2, Flame, Trophy, ExternalLink } from "lucide-react";

interface HowToGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToGuide: React.FC<HowToGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-brand-offwhite transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-xl text-brand-offwhite">
              HH Goa 2026 Builder Pass Guide
            </h3>
            <p className="text-xs text-slate-400">
              How to create, customize, and publish your HH Goa 2026 builder pass.
            </p>
          </div>
        </div>

        {/* Step-by-Step Flow */}
        <div className="space-y-3">
          {/* Step 1 */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 font-extrabold text-sm flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <p className="text-sm font-bold text-brand-offwhite">Upload Your Photo & Teammates</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload a portrait, landscape, or iPhone photo. Use our live pan & zoom tools to adjust position instantly.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-pink-500/20 text-pink-400 font-extrabold text-sm flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <p className="text-sm font-bold text-brand-offwhite">Generate AI Builder Class & Title</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Input your stack (React, Solana, Gemini API, etc.) and click <strong className="text-cyan-400">Generate AI Title</strong> to generate an epic personalized title and motto.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 font-extrabold text-sm flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <p className="text-sm font-bold text-brand-offwhite">Post on X with #FrameInGoa</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Click <strong className="text-orange-400">Share to X</strong> to open a pre-filled tweet with caption and image attached.
              </p>
            </div>
          </div>
        </div>

        {/* Hashtag Warning */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-amber-400">
            <Flame className="w-4 h-4" />
            Maximizing Your Reach:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            <li>Include the hashtag <span className="font-bold text-amber-300">#FrameInGoa</span> in your tweet</li>
            <li>Attach your generated high-res PNG badge or squad card</li>
            <li>Tag your builder peers or co-founders so they can generate theirs</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-brand-offwhite font-bold transition cursor-pointer"
        >
          Got It, Let's Build!
        </button>
      </div>
    </div>
  );
};
