import React, { useState } from "react";
import { Download, Share2, Copy, Check, X, Sparkles, AlertCircle, ExternalLink } from "lucide-react";
import confetti from "canvas-confetti";
import { BadgeData } from "../types";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasDataUrl: string;
  badgeData: BadgeData;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  canvasDataUrl,
  badgeData,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // Pre-filled Tweet Text with hashtag #FrameInGoa
  const defaultTweetText = `Hyped for HH Goa 2026! 🌴⚡
Just generated my Builder Pass: "${badgeData.builderTitle || "AI Builder"}"

Generate your own #FrameInGoa pass in 5 seconds using this generator! 🚀

#FrameInGoa @HHGoa2026 #HHGoa #HackerHouseGoa`;

  const handleDownloadImage = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    if (!canvasDataUrl) return;
    try {
      const link = document.createElement("a");
      link.download = `HH-Goa-2026-${(badgeData.name || "Builder").replace(/\s+/g, "-")}-${badgeData.format}.png`;
      link.href = canvasDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FF5C00", "#FF007A", "#00F0FF", "#FFD700"],
      });
    } catch (e) {
      console.error("Export failed:", e);
      alert("Failed to export image. Please try again.");
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(defaultTweetText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleCopyImageToClipboard = async () => {
    try {
      if (!canvasDataUrl) return;
      const res = await fetch(canvasDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2500);
    } catch (err) {
      console.error("Failed to copy image to clipboard:", err);
      // Fallback: trigger download
      handleDownloadImage();
    }
  };



  const handleCopyShareLink = async () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    setIsSharing(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: canvasDataUrl }),
      });
      const data = await res.json();
      const shareUrl = `${window.location.origin}/share/${data.id}`;
      
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FF5C00", "#FF007A", "#00F0FF", "#FFD700"],
      });
    } catch (err) {
      console.error("Failed to copy share link:", err);
      alert("Failed to generate link");
    } finally {
      setIsSharing(false);
    }
  };

  const handleOpenXIntent = async () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    setIsSharing(true);
    try {
      // 1. Upload to get a shareable URL with OG Tags
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: canvasDataUrl }),
      });
      const data = await res.json();
      const shareUrl = `${window.location.origin}/share/${data.id}`;

      // 2. Pre-fill Tweet Text
      const tweetText = `Hyped for HH Goa 2026! 🌴⚡\nJust generated my Builder Pass: "${badgeData.builderTitle || "AI Builder"}"\n\nGenerate your own #FrameInGoa pass in 5 seconds using this generator! 🚀\n\n${shareUrl}\n\n#FrameInGoa @HHGoa2026 #HHGoa #HackerHouseGoa`;
      
      // 3. Open X Intent
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      window.open(tweetUrl, "_blank", "noopener,noreferrer");
      
      // Trigger confetti and download just in case
      handleDownloadImage();
    } catch (err) {
      console.error("Failed to generate share link:", err);
      // Fallback
      handleDownloadImage();
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(defaultTweetText)}`;
      window.open(tweetUrl, "_blank", "noopener,noreferrer");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-brand-offwhite transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center text-brand-accent">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-brand-offwhite uppercase tracking-tight">
              Share Pass on X (#FrameInGoa)
            </h3>
            <p className="text-xs text-slate-400">
              Share your generated link or image to X with <span className="text-brand-accent font-bold">#FrameInGoa</span> to share your HH Goa 2026 builder pass!
            </p>
          </div>
        </div>

        {/* Generated Graphic Preview */}
        {canvasDataUrl && (
          <div className="relative group bg-slate-950 p-3 rounded-2xl border border-slate-800 flex justify-center">
            <img
              src={canvasDataUrl}
              alt="Generated HH Goa Badge"
              className="max-h-72 w-auto rounded-xl shadow-xl object-contain"
            />
            <div className="absolute top-5 right-5 bg-slate-900/90 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-mono font-bold backdrop-blur-md">
              1080p High Resolution
            </div>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Post to X Button */}
          <button
            onClick={handleOpenXIntent}
            disabled={isSharing}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-cyan-500 hover:opacity-95 text-brand-offwhite font-extrabold text-sm shadow-xl shadow-orange-500/20 transition cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Share2 className="w-5 h-5" />
            <span>{isSharing ? "Generating Link..." : "1-Click Post to X"}</span>
            <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
          </button>

          {/* Download Image Button */}
          <button
            onClick={handleDownloadImage}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-brand-offwhite font-bold text-sm transition cursor-pointer"
          >
            <Download className="w-5 h-5 text-orange-400" />
            <span>Download PNG Image</span>
          </button>

          {/* Copy Share Link Button */}
          <button
            onClick={handleCopyShareLink}
            disabled={isSharing}
            className="sm:col-span-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-brand-offwhite font-bold text-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copiedLink ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-brand-accent" />}
            <span>{copiedLink ? "Link Copied!" : "Copy Share Link"}</span>
          </button>
        </div>

        {/* Pre-written Tweet Caption Box */}
        <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Pre-Written X Tweet Caption
            </span>
            <button
              onClick={handleCopyText}
              className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer font-semibold"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Caption</span>
                </>
              )}
            </button>
          </div>

          <textarea
            readOnly
            value={defaultTweetText}
            rows={4}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono resize-none focus:outline-none"
          />
        </div>

        {/* Required Qualification Warning */}
        <div className="p-3.5 bg-orange-500/10 border border-orange-500/30 rounded-xl text-xs text-orange-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <p>
            <strong>Pro Tip:</strong> Your X post uses the hashtag <span className="font-bold underline">#FrameInGoa</span> so other builders and mentors can easily discover your builder profile!
          </p>
        </div>
      </div>
    </div>
  );
};
