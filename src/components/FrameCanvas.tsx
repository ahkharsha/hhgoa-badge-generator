import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { BadgeData, PhotoConfig } from "../types";
import { THEMES } from "../lib/constants";

interface FrameCanvasProps {
  badgeData: BadgeData;
  activePhoto: PhotoConfig;
  onCanvasReady?: (dataUrl: string) => void;
  className?: string;
}

export const FrameCanvas: React.FC<FrameCanvasProps> = ({
  badgeData,
  activePhoto,
  onCanvasReady,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions based on format
    let width = 1080;
    let height = 1080;

    if (badgeData.format === "badge") {
      width = 1080;
      height = 1440; // 3:4 aspect ratio badge
    } else if (badgeData.format === "squad") {
      width = 1200;
      height = 675; // 16:9 aspect ratio squad card
    } else if (badgeData.format === "header") {
      width = 1500;
      height = 500; // 3:1 X header
    } else if (badgeData.format === "story") {
      width = 1080;
      height = 1920; // 9:16 IG story
    }

    canvas.width = width;
    canvas.height = height;

    const theme = THEMES[badgeData.theme] || THEMES.sunset;

    // Render loop
    const drawCanvas = async () => {
      // Clear
      ctx.clearRect(0, 0, width, height);

      // 1. Background
      await drawBackground(ctx, width, height, theme, badgeData);

      // 2. Format specific drawing
      if (badgeData.format === "pfp") {
        await drawPfpFormat(ctx, width, height, badgeData, activePhoto, theme);
      } else if (badgeData.format === "badge") {
        await drawBadgeFormat(ctx, width, height, badgeData, activePhoto, theme);
      } else if (badgeData.format === "squad") {
        await drawSquadFormat(ctx, width, height, badgeData, theme);
      } else if (badgeData.format === "header") {
        await drawHeaderFormat(ctx, width, height, badgeData, theme);
      } else if (badgeData.format === "story") {
        await drawStoryFormat(ctx, width, height, badgeData, activePhoto, theme);
      }

      // 3. Stamp Overlay
      if (badgeData.stamp && badgeData.stamp !== "NONE") {
        await drawHolographicStamp(ctx, width, height, badgeData.stamp, theme);
      }

      // 3.5 Holographic Foil for MYTHIC rarity
      if (badgeData.rarity === "MYTHIC") {
        drawHolographicFoil(ctx, width, height);
      }

      // 4. CRT Scanlines Effect
      if (badgeData.scanlines) {
        drawScanlines(ctx, width, height);
      }

      // Notify parent with generated data URL
      const dataUrl = canvas.toDataURL("image/png");
      if (onCanvasReady) {
        onCanvasReady(dataUrl);
      }
    };

    drawCanvas();
  }, [badgeData, activePhoto, onCanvasReady]);

  return (
    <div className={`relative flex flex-col w-full ${className}`}>
      <div className="relative w-full bg-brand-primary border-[1px] border-brand-accent shadow-[0_0_50px_rgba(254,225,1,0.15)] flex flex-col overflow-hidden items-center justify-center p-2 sm:p-4">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto object-contain transition-all"
          style={{
            maxHeight: badgeData.format === "badge" ? "600px" : badgeData.format === "squad" ? "350px" : "450px",
          }}
        />
        <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-brand-accent writing-vertical transform rotate-180 hidden sm:block">
          VERIFIED BUILDER // 2026
        </div>
      </div>
      <div className="h-2 sm:h-4 bg-brand-accent flex w-full">
        <div className="w-1/4 h-full bg-black"></div>
        <div className="w-1/4 h-full bg-black/20"></div>
        <div className="w-1/4 h-full"></div>
      </div>
    </div>
  );
};

/* ==================== HELPER DRAWING FUNCTIONS ==================== */

async function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: typeof THEMES.sunset,
  badgeData: BadgeData
) {
  // Fill with Cream Background
  ctx.fillStyle = "#F9F4DF";
  ctx.fillRect(0, 0, width, height);

  try {
    const sunriseImg = await loadImageFromUrl("/assets/images/Sun%20rise.png");
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1.0;
    
    const imgAspect = sunriseImg.width / sunriseImg.height;
    const canvasAspect = width / height;
    let drawW = width;
    let drawH = height;
    if (canvasAspect > imgAspect) {
      drawW = width;
      drawH = width / imgAspect;
    } else {
      drawH = height;
      drawW = height * imgAspect;
    }
    // Center it
    ctx.drawImage(sunriseImg, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
    ctx.restore();
  } catch (e) {
    console.log("Failed to load sunrise bg", e);
  }
}

import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { BadgeData, PhotoConfig } from "../types";
import { THEMES } from "../lib/constants";

interface FrameCanvasProps {
  badgeData: BadgeData;
  activePhoto: PhotoConfig;
  onCanvasReady?: (dataUrl: string) => void;
  className?: string;
}

export const FrameCanvas: React.FC<FrameCanvasProps> = ({
  badgeData,
  activePhoto,
  onCanvasReady,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions based on format
    let width = 1080;
    let height = 1080;

    if (badgeData.format === "badge") {
      width = 1080;
      height = 1440; // 3:4 aspect ratio badge
    } else if (badgeData.format === "squad") {
      width = 1200;
      height = 675; // 16:9 aspect ratio squad card
    } else if (badgeData.format === "header") {
      width = 1500;
      height = 500; // 3:1 X header
    } else if (badgeData.format === "story") {
      width = 1080;
      height = 1920; // 9:16 IG story
    }

    canvas.width = width;
    canvas.height = height;

    const theme = THEMES[badgeData.theme] || THEMES.sunset;

    // Render loop
    const drawCanvas = async () => {
      // Clear
      ctx.clearRect(0, 0, width, height);

      // 1. Background
      await drawBackground(ctx, width, height, theme, badgeData);

      // 2. Format specific drawing
      if (badgeData.format === "pfp") {
        await drawPfpFormat(ctx, width, height, badgeData, activePhoto, theme);
      } else if (badgeData.format === "badge") {
        await drawBadgeFormat(ctx, width, height, badgeData, activePhoto, theme);
      } else if (badgeData.format === "squad") {
        await drawSquadFormat(ctx, width, height, badgeData, theme);
      } else if (badgeData.format === "header") {
        await drawHeaderFormat(ctx, width, height, badgeData, theme);
      } else if (badgeData.format === "story") {
        await drawStoryFormat(ctx, width, height, badgeData, activePhoto, theme);
      }

      // 3. Stamp Overlay
      if (badgeData.stamp && badgeData.stamp !== "NONE") {
        await drawHolographicStamp(ctx, width, height, badgeData.stamp, theme);
      }

      // 3.5 Holographic Foil for MYTHIC rarity
      if (badgeData.rarity === "MYTHIC") {
        drawHolographicFoil(ctx, width, height);
      }

      // 4. CRT Scanlines Effect
      if (badgeData.scanlines) {
        drawScanlines(ctx, width, height);
      }

      // Notify parent with generated data URL
      const dataUrl = canvas.toDataURL("image/png");
      if (onCanvasReady) {
        onCanvasReady(dataUrl);
      }
    };

    drawCanvas();
  }, [badgeData, activePhoto, onCanvasReady]);

  return (
    <div className={`relative flex flex-col w-full ${className}`}>
      <div className="relative w-full bg-brand-primary border-[1px] border-brand-accent shadow-[0_0_50px_rgba(254,225,1,0.15)] flex flex-col overflow-hidden items-center justify-center p-2 sm:p-4">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto object-contain transition-all"
          style={{
            maxHeight: badgeData.format === "badge" ? "600px" : badgeData.format === "squad" ? "350px" : "450px",
          }}
        />
        <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-brand-accent writing-vertical transform rotate-180 hidden sm:block">
          VERIFIED BUILDER // 2026
        </div>
      </div>
      <div className="h-2 sm:h-4 bg-brand-accent flex w-full">
        <div className="w-1/4 h-full bg-black"></div>
        <div className="w-1/4 h-full bg-black/20"></div>
        <div className="w-1/4 h-full"></div>
      </div>
    </div>
  );
};

/* ==================== HELPER DRAWING FUNCTIONS ==================== */

async function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: typeof THEMES.sunset,
  badgeData: BadgeData
) {
  // Fill with Cream Background
  ctx.fillStyle = "#FDF7ED";
  ctx.fillRect(0, 0, width, height);

  try {
    const sunriseImg = await loadImageFromUrl("/assets/images/Sun%20rise.png");
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1.0;
    
    const imgAspect = sunriseImg.width / sunriseImg.height;
    const canvasAspect = width / height;
    let drawW = width;
    let drawH = height;
    if (canvasAspect > imgAspect) {
      drawW = width;
      drawH = width / imgAspect;
    } else {
      drawH = height;
      drawW = height * imgAspect;
    }
    // Center it
    ctx.drawImage(sunriseImg, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
    ctx.restore();
  } catch (e) {
    console.log("Failed to load sunrise bg", e);
  }
}

async function drawBadgeFormat(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  badgeData: BadgeData,
  photo: PhotoConfig,
  theme: typeof THEMES.sunset
) {
  const margin = 30;
  const cardW = width - margin * 2;
  const cardH = height - margin * 2;
  const cardX = margin;
  const cardY = margin;
  
  // Outer Cream Background
  ctx.save();
  ctx.fillStyle = "#F9F4DF";
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 30);
    ctx.fill();
  } else {
    ctx.fillRect(cardX, cardY, cardW, cardH);
  }
  
  // Inner Dark Green Border
  ctx.strokeStyle = "#015B28";
  ctx.lineWidth = 6;
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(cardX + 15, cardY + 15, cardW - 30, cardH - 30, 20);
    ctx.stroke();
  } else {
    ctx.strokeRect(cardX + 15, cardY + 15, cardW - 30, cardH - 30);
  }
  
  // Load official assets
  let sunriseImg, hackerHouseImg, hindiImg;
  try {
    sunriseImg = await loadImageFromUrl("/assets/images/Sun%20rise.png");
    hackerHouseImg = await loadImageFromUrl("/assets/images/Hacker%20house.png");
    hindiImg = await loadImageFromUrl("/assets/images/goa_hindi.svg");
  } catch (e) {
    console.error("Failed to load official assets", e);
  }

  // Draw Sunrise at the bottom inside the inner border
  if (sunriseImg) {
    ctx.save();
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(cardX + 18, cardY + 18, cardW - 36, cardH - 36, 18);
      ctx.clip();
    }
    
    const drawW = cardW - 36;
    const imgRatio = sunriseImg.width / sunriseImg.height;
    const drawH = drawW / imgRatio;
    
    // Draw it aligned to the bottom but offset slightly down so the huge green sky covers the top
    ctx.drawImage(sunriseImg, cardX + 18, cardY + cardH - 18 - drawH + 180, drawW, drawH);
    ctx.restore();
  }
  
  // Draw Hacker House Header
  if (hackerHouseImg) {
    const hhW = cardW - 140;
    const hhRatio = hackerHouseImg.width / hackerHouseImg.height;
    const hhH = hhW / hhRatio;
    ctx.drawImage(hackerHouseImg, width / 2 - hhW / 2, cardY + 40, hhW, hhH);
  } else {
    ctx.fillStyle = "#015B28";
    ctx.font = "800 64px 'Imbue', serif";
    ctx.textAlign = "center";
    ctx.fillText("HACKER HOUSE", width / 2, cardY + 100);
  }
  
  // Circular Photo
  const photoSize = 340;
  const photoX = width / 2;
  const photoY = cardY + 340;
  
  ctx.save();
  ctx.beginPath();
  ctx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#015B28";
  ctx.fill();
  
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#FFD500";
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(photoX, photoY, (photoSize - 10) / 2, 0, Math.PI * 2);
  ctx.clip();
  
  if (photo.url) {
    await drawUserImage(ctx, photo, photoX - photoSize/2, photoY - photoSize/2, photoSize, photoSize);
  } else {
    // Draw placeholder
    ctx.fillStyle = "#1E293B";
    ctx.fill();
  }
  ctx.restore();
  
  // Name Banner
  ctx.save();
  const bannerW = 460;
  const bannerH = 70;
  ctx.fillStyle = "#015B28";
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(width / 2 - bannerW / 2, photoY + photoSize/2 + 30, bannerW, bannerH, 15);
    ctx.fill();
  }
  
  ctx.fillStyle = "#FFD500"; 
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("✦", width / 2 - bannerW / 2 + 35, photoY + photoSize/2 + 75);
  ctx.fillText("✦", width / 2 + bannerW / 2 - 35, photoY + photoSize/2 + 75);
  
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 42px 'Victor Mono', monospace";
  ctx.fillText(truncateText(ctx, (badgeData.name || "BUILDER").toUpperCase(), bannerW - 120), width / 2, photoY + photoSize/2 + 80);
  ctx.restore();
  
  // Role / Builder Title Banner
  ctx.save();
  const roleW = 400;
  const roleH = 50;
  ctx.fillStyle = "#FFD500";
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(width / 2 - roleW / 2, photoY + photoSize/2 + 120, roleW, roleH, 10);
    ctx.fill();
  }
  
  ctx.fillStyle = "#015B28";
  ctx.font = "800 24px 'Victor Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(`⚡ ${truncateText(ctx, badgeData.role || "WEB3 DEVELOPER", roleW - 60)} ⚡`, width / 2, photoY + photoSize/2 + 155);
  ctx.restore();
  
  // Stats / Badges area
  ctx.save();
  ctx.fillStyle = "#EA2B58";
  ctx.font = "800 22px 'Victor Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(`✦ ${badgeData.archetype || "VIP BUILDER CLASS"} ✦`, width / 2, photoY + photoSize/2 + 210);
  
  ctx.fillStyle = "#015B28";
  ctx.font = "700 20px 'Imbue', serif";
  ctx.fillText(`ID: ${badgeData.badgeId || "HH26-2470-GOA"}`, width / 2, photoY + photoSize/2 + 245);
  ctx.restore();
  
  // QR Code
  if (badgeData.showQrCode) {
    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(cardX + 40, cardY + cardH - 160, 120, 120, 10);
      ctx.fill();
    }
    await drawCanvasQrCode(ctx, cardX + 50, cardY + cardH - 150, 100, theme, badgeData);
    ctx.restore();
  }
  
  // Hashtag
  ctx.fillStyle = "#EA2B58";
  ctx.font = "800 32px 'Imbue', serif";
  ctx.textAlign = "right";
  ctx.fillText("#FrameInGoa", cardX + cardW - 40, cardY + cardH - 80);
  
  ctx.fillStyle = "#015B28";
  ctx.font = "600 16px 'Victor Mono', monospace";
  ctx.fillText("OCT 28-31, 2026", cardX + cardW - 40, cardY + cardH - 50);

  // Lanyard Hole
  if (badgeData.showLanyard) {
    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(width / 2, margin + 20, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#015B28";
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.fillStyle = "#333333";
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(width / 2 - 30, margin - 30, 60, 25, 5);
      ctx.fill();
    }
    ctx.restore();
  }
}

async function drawSquadFormat(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  badgeData: BadgeData,
  theme: typeof THEMES.sunset
) {
  const margin = 30;
  const cardW = width - margin * 2;
  const cardH = height - margin * 2;
  const cardX = margin;
  const cardY = margin;
  
  ctx.save();
  ctx.fillStyle = "#F9F4DF";
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 30);
    ctx.fill();
  }
  
  ctx.strokeStyle = "#015B28";
  ctx.lineWidth = 6;
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(cardX + 15, cardY + 15, cardW - 30, cardH - 30, 20);
    ctx.stroke();
  }
  
  let hackersImg;
  try {
    hackersImg = await loadImageFromUrl("/assets/images/hackers.png");
  } catch(e) {}
  
  if (hackersImg) {
    ctx.save();
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(cardX + 18, cardY + 18, cardW - 36, cardH - 36, 18);
      ctx.clip();
    }
    
    const drawW = cardW - 36;
    const imgRatio = hackersImg.width / hackersImg.height;
    const drawH = drawW / imgRatio;
    
    ctx.drawImage(hackersImg, cardX + 18, cardY + cardH - 18 - drawH, drawW, drawH);
    ctx.restore();
  }
  
  ctx.fillStyle = "#015B28";
  ctx.font = "800 48px 'Imbue', serif";
  ctx.textAlign = "center";
  ctx.fillText("HH GOA 2026 • SQUAD PASS", width / 2, cardY + 80);
  
  ctx.fillStyle = "#EA2B58";
  ctx.font = "700 24px 'Victor Mono', monospace";
  ctx.fillText(badgeData.teamName || "TEAM HH GOA", width / 2, cardY + 130);
  
  const teammates = badgeData.teammates || [];
  const count = Math.min(Math.max(teammates.length, 1), 4);
  const slotW = (cardW - 80 - (count - 1) * 20) / count;
  const slotH = 360;
  const slotY = cardY + 180;
  
  for (let i = 0; i < count; i++) {
    const tm = teammates[i];
    const slotX = cardX + 40 + i * (slotW + 20);
    
    ctx.save();
    ctx.fillStyle = "#F9F4DF";
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(slotX, slotY, slotW, slotH, 20);
      ctx.fill();
    }
    
    ctx.strokeStyle = "#015B28";
    ctx.lineWidth = 3;
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(slotX, slotY, slotW, slotH, 20);
      ctx.stroke();
    }
    
    const imgSize = Math.min(slotW - 30, 200);
    const imgX = slotX + (slotW - imgSize) / 2;
    const imgY = slotY + 20;
    
    ctx.beginPath();
    ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
    ctx.clip();
    
    if (tm.photo && tm.photo.url) {
      await drawUserImage(ctx, tm.photo, imgX, imgY, imgSize, imgSize);
    } else {
      ctx.fillStyle = "#1E293B";
      ctx.fill();
    }
    ctx.restore();
    
    ctx.textAlign = "center";
    ctx.fillStyle = "#015B28";
    ctx.font = "800 24px 'Imbue', serif";
    ctx.fillText(truncateText(ctx, tm.name || `Builder ${i + 1}`, slotW - 20), slotX + slotW / 2, imgY + imgSize + 40);
    
    ctx.fillStyle = "#EA2B58";
    ctx.font = "700 16px 'Victor Mono', monospace";
    ctx.fillText(truncateText(ctx, tm.role || "Developer", slotW - 20), slotX + slotW / 2, imgY + imgSize + 70);
    ctx.restore();
  }
}
