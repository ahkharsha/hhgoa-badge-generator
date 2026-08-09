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
    let bgSrc = "/assets/images/ai_pfp_bg.png";
    if (badgeData.format === "badge") bgSrc = "/assets/images/ai_badge_bg.png";
    if (badgeData.format === "squad") bgSrc = "/assets/images/ai_squad_bg.png";
    if (badgeData.format === "header") bgSrc = "/assets/images/ai_header_bg.png";
    if (badgeData.format === "story") bgSrc = "/assets/images/ai_story_bg.png";

    const bgImg = await loadImageFromUrl(bgSrc);
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1.0;
    
    const imgAspect = bgImg.width / bgImg.height;
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
    ctx.drawImage(bgImg, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
    ctx.restore();
  } catch (e) {
    console.log("Failed to load background image", e);
  }
}

async function drawPfpFormat(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  badgeData: BadgeData,
  photo: PhotoConfig,
  theme: typeof THEMES.sunset
) {
  const cx = width / 2;
  const cy = height / 2 - 20;
  const radius = width * 0.38;

  // Draw Photo
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (photo.url) {
    await drawUserImage(ctx, photo, cx, cy, radius * 2, radius * 2);
  } else {
    drawPlaceholderPhoto(ctx, cx, cy, radius * 2);
  }
  ctx.restore();

  // Draw Glowing Outer Ring
  ctx.save();
  ctx.lineWidth = 20;
  const ringGradient = ctx.createLinearGradient(0, cy - radius, width, cy + radius);
  ringGradient.addColorStop(0, theme.primary);
  ringGradient.addColorStop(0.5, theme.secondary);
  ringGradient.addColorStop(1, theme.accent);

  ctx.strokeStyle = ringGradient;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 30;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Draw Corner Cyber Brackets
  drawCornerBrackets(ctx, cx - radius - 30, cy - radius - 30, (radius + 30) * 2, (radius + 30) * 2, theme.accent);

  // HH GOA 2026 Header Badge
  await drawHeaderPill(ctx, cx, 80, "HACKER HOUSE GOA 2026", theme);

  // Bottom Banner Text Box
  ctx.save();
  const bannerY = height - 190;
  const bannerH = 140;

  // Banner Background
  ctx.fillStyle = hexToRgba("#0A0E17", 0.92);
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 20;
  roundRect(ctx, 60, bannerY, width - 120, bannerH, 24, true, false);

  // Banner Border
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 3;
  roundRect(ctx, 60, bannerY, width - 120, bannerH, 24, false, true);

  // Text inside banner
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#FFFFFF";
ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 36px 'Imbue', serif";
  ctx.textAlign = "center";
  ctx.fillText((badgeData.name || "GOA BUILDER").toUpperCase(), cx, bannerY + 50);

  ctx.fillStyle = theme.accent;
  ctx.font = "700 22px 'Victor Mono', monospace";
  ctx.fillText(truncateText(ctx, badgeData.builderTitle || "2:47 AM BUILDER", 480), cx, bannerY + 86);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "600 18px 'Imbue', serif";
  ctx.fillText(`OCT 28-31, 2026 • ${badgeData.customWatermark || "#FrameInGoa"}`, cx, bannerY + 116);
  ctx.restore();
}

async function drawBadgeFormat(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  badgeData: BadgeData,
  photo: PhotoConfig,
  theme: typeof THEMES.sunset
) {
  // Lanyard Hole & Metallic Clip
  if (badgeData.showLanyard) {
    ctx.save();
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.arc(width / 2, 40, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(width / 2, 40, 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#64748B";
    roundRect(ctx, width / 2 - 25, 10, 50, 16, 4, true, false);
    ctx.restore();
  }

  // Outer Card Frame Border
  ctx.save();
  const margin = 50;
  const cardW = width - margin * 2;
  const cardH = height - margin * 2 - 20;
  const cardY = margin + 20;

  // Sleek glassmorphism border to frame the AI art
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 2;
  roundRect(ctx, margin, cardY, cardW, cardH, 32, false, true);
  
  ctx.strokeStyle = "rgba(255, 213, 0, 0.3)";
  ctx.lineWidth = 1;
  roundRect(ctx, margin + 12, cardY + 12, cardW - 24, cardH - 24, 20, false, true);
  ctx.restore();

  // Hacker House Typography Header
  ctx.save();
  try {
    const hhImg = new Image();
    hhImg.crossOrigin = "anonymous";
    hhImg.src = "/assets/images/Hacker%20house.png";
    await new Promise((resolve, reject) => {
      hhImg.onload = resolve;
      hhImg.onerror = reject;
    });
    const hhW = cardW - 140;
    const hhRatio = hhImg.width / hhImg.height;
    const hhH = hhW / hhRatio;
    ctx.drawImage(hhImg, width / 2 - hhW / 2, cardY + 40, hhW, hhH);
  } catch (e) {
    ctx.fillStyle = "#015B28";
    ctx.font = "800 64px 'Imbue', serif";
    ctx.textAlign = "center";
    ctx.fillText("HACKER HOUSE", width / 2, cardY + 100);
  }
  ctx.restore();

  // Photo Container (Circular with Yellow Border)
  const photoSize = 340;
  const photoX = margin + 40 + photoSize/2;
  const photoY = cardY + 220 + photoSize/2;

  ctx.save();
  // Draw yellow border around photo
  ctx.beginPath();
  ctx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#015B28";
  ctx.fill();
  
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#FFD500";
  ctx.stroke();

  // Clip Photo
  ctx.beginPath();
  ctx.arc(photoX, photoY, (photoSize - 10) / 2, 0, Math.PI * 2);
  ctx.clip();

  if (photo.url) {
    await drawUserImage(ctx, photo, photoX, photoY, photoSize, photoSize);
  } else {
    // Fill with solid color for placeholder
    ctx.fillStyle = "#FDF7ED";
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
      ctx.roundRect(margin + 40, cardY + cardH - 160, 120, 120, 10);
      ctx.fill();
    }
    await drawCanvasQrCode(ctx, margin + 50, cardY + cardH - 150, 100, theme, badgeData);
    ctx.restore();
  }
  
  // Hashtag and Studio Logo
  ctx.save();
  try {
    const studioImg = new Image();
    studioImg.crossOrigin = "anonymous";
    studioImg.src = "/assets/images/2-47.svg";
    await new Promise((resolve, reject) => {
      studioImg.onload = resolve;
      studioImg.onerror = reject;
    });
    // Draw above hashtag
    ctx.drawImage(studioImg, margin + cardW - 140, cardY + cardH - 120, 100, 30);
  } catch (e) {
    console.error("Failed to load 2-47 logo", e);
  }

  ctx.fillStyle = "#EA2B58";
  ctx.font = "800 32px 'Imbue', serif";
  ctx.textAlign = "right";
  ctx.fillText("#FrameInGoa", margin + cardW - 40, cardY + cardH - 50);
  
  ctx.fillStyle = "#015B28";
  ctx.font = "600 16px 'Victor Mono', monospace";
  ctx.fillText("OCT 28-31, 2026", margin + cardW - 40, cardY + cardH - 25);
  ctx.restore();
}

async function drawSquadFormat(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  badgeData: BadgeData,
  theme: typeof THEMES.sunset
) {
  // Outer Border
  const margin = 40;
  const cardW = width - margin * 2;
  const cardH = height - margin * 2;

  ctx.save();

  // Sleek glassmorphism border to frame the AI art
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 2;
  roundRect(ctx, margin, margin, cardW, cardH, 28, false, true);
  
  ctx.strokeStyle = "rgba(255, 213, 0, 0.3)";
  ctx.lineWidth = 1;
  roundRect(ctx, margin + 12, margin + 12, cardW - 24, cardH - 24, 20, false, true);
  ctx.restore();

  // Header Banner
  ctx.fillStyle = theme.primary;
  ctx.font = "800 32px 'Imbue', serif";
  ctx.fillText("HH GOA 2026 • SQUAD PASS", margin + 40, margin + 55);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "700 18px 'Victor Mono', monospace";
  ctx.textAlign = "right";
  ctx.fillText(badgeData.teamName || "TEAM HH GOA", width - margin - 40, margin + 55);
  ctx.textAlign = "left";

  // Teammates Grid
  const teammates = badgeData.teammates || [];
  const count = Math.min(Math.max(teammates.length, 1), 4);

  const slotW = (cardW - 80 - (count - 1) * 20) / count;
  const slotH = 340;
  const slotY = margin + 85;

  for (let i = 0; i < count; i++) {
    const tm = teammates[i];
    const slotX = margin + 40 + i * (slotW + 20);

    ctx.save();
    // Slot Box
    ctx.fillStyle = "#0B0F17";
    roundRect(ctx, slotX, slotY, slotW, slotH, 20, true, false);

    ctx.strokeStyle = hexToRgba(theme.secondary, 0.4);
    ctx.lineWidth = 2;
    roundRect(ctx, slotX, slotY, slotW, slotH, 20, false, true);

    // Photo Box inside Slot
    const imgSize = Math.min(slotW - 30, 200);
    const imgX = slotX + (slotW - imgSize) / 2;
    const imgY = slotY + 20;

    ctx.save();
    ctx.beginPath();
    roundRectPath(ctx, imgX, imgY, imgSize, imgSize, 16);
    ctx.clip();

    if (tm.photo && tm.photo.url) {
      await drawUserImage(ctx, tm.photo, imgX + imgSize / 2, imgY + imgSize / 2, imgSize, imgSize);
    } else {
      drawPlaceholderPhoto(ctx, imgX + imgSize / 2, imgY + imgSize / 2, imgSize);
    }
    ctx.restore();

    // Name & Role
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 20px 'Imbue', serif";
    ctx.fillText(truncateText(ctx, tm.name || `Builder ${i + 1}`, slotW - 20), slotX + slotW / 2, imgY + imgSize + 35);

    ctx.fillStyle = theme.accent;
    ctx.font = "700 14px 'Victor Mono', monospace";
    ctx.fillText(truncateText(ctx, tm.role || "Developer", slotW - 20), slotX + slotW / 2, imgY + imgSize + 60);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "600 12px 'Imbue', serif";
    ctx.fillText(truncateText(ctx, tm.stack || "Full-Stack", slotW - 20), slotX + slotW / 2, imgY + imgSize + 80);

    ctx.restore();
  }

  // Footer Watermark and Logo
  try {
    const studioImg = new Image();
    studioImg.crossOrigin = "anonymous";
    studioImg.src = "/assets/images/2-47.svg";
    await new Promise((resolve, reject) => {
      studioImg.onload = resolve;
      studioImg.onerror = reject;
    });
    ctx.drawImage(studioImg, margin + 40, height - margin - 60, 80, 24);
  } catch (e) {
    console.error("Failed to load 2-47 logo", e);
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 26px 'Imbue', serif";
  ctx.fillText("#FrameInGoa", margin + 40, height - margin - 25);

  ctx.fillStyle = "#64748B";
  ctx.font = "600 16px 'Victor Mono', monospace";
  ctx.textAlign = "right";
  ctx.fillText("OCT 28-31, 2026 • GOA, INDIA", width - margin - 40, height - margin - 25);
  ctx.restore();
}

async function drawHeaderFormat(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  badgeData: BadgeData,
  theme: typeof THEMES.sunset
) {
  ctx.save();
  const margin = 40;

  // Background hackers image on the right
  try {
    const hackersImg = await loadImageFromUrl("/assets/images/hackers.png");
    const hAspect = hackersImg.width / hackersImg.height;
    const hHeight = height - margin * 2;
    const hWidth = hHeight * hAspect;
    ctx.globalAlpha = 0.6;
    ctx.drawImage(hackersImg, width - hWidth - margin, margin, hWidth, hHeight);
    ctx.globalAlpha = 1.0;
  } catch (e) {
    // fallback
  }
  
  try {
    const logoImg = await loadImageFromUrl("/assets/images/Hacker%20house.png");
    const logoAspect = logoImg.width / logoImg.height;
    const logoH = 30;
    const logoW = logoH * logoAspect;
    ctx.drawImage(logoImg, margin, margin + 15, logoW, logoH);
  } catch (e) {
    ctx.fillStyle = theme.accent;
    ctx.font = "800 24px 'Victor Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("HACKER HOUSE GOA // 2026", margin, margin + 40);
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 90px 'Imbue', serif";
  ctx.fillText(truncateText(ctx, badgeData.name || "BUILDER", width - 400), margin, height / 2 + 10);
  
  ctx.fillStyle = theme.accent;
  ctx.font = "700 28px 'Victor Mono', monospace";
  ctx.fillText(truncateText(ctx, badgeData.builderTitle || "AI Agent Summoner", width - 400), margin, height / 2 + 60);

  // Stats blocks on right side
  if (badgeData.showStats && badgeData.stats?.length) {
    const startX = width - margin - 350;
    const startY = height / 2 - 40;
    badgeData.stats.forEach((stat, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = startX + col * 160;
      const y = startY + row * 80;
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      roundRect(ctx, x, y, 140, 60, 8, true, false);
      
      ctx.fillStyle = "#94A3B8";
      ctx.font = "600 12px 'Victor Mono', monospace";
      ctx.fillText(stat.label.toUpperCase(), x + 15, y + 25);
      
      ctx.fillStyle = theme.accent;
      ctx.font = "800 24px 'Imbue', serif";
      ctx.fillText(stat.value.toString(), x + 15, y + 45);
    });
  }
  
  ctx.restore();
}

async function drawStoryFormat(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  badgeData: BadgeData,
  activePhoto: PhotoConfig,
  theme: typeof THEMES.sunset
) {
  ctx.save();
  const margin = 60;
  
  // Big Photo Top Half
  const photoHeight = height * 0.55;
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, margin, margin, width - margin * 2, photoHeight, 30, false, false);
  ctx.clip();
  await drawUserImage(ctx, activePhoto, width / 2, margin + photoHeight / 2, width, photoHeight);
  ctx.restore();

  // Story styling
  const textY = margin + photoHeight + 80;
  
  ctx.textAlign = "center";
  ctx.fillStyle = theme.accent;
  ctx.font = "800 24px 'Victor Mono', monospace";
  ctx.fillText(`✦ ${badgeData.rarity || "EPIC"} BUILDER ✦`, width / 2, textY);
  
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 100px 'Imbue', serif";
  ctx.fillText(truncateText(ctx, badgeData.name || "BUILDER", width - margin * 2), width / 2, textY + 100);
  
  ctx.fillStyle = "#94A3B8";
  ctx.font = "600 36px 'Imbue', serif";
  ctx.fillText(truncateText(ctx, badgeData.builderTitle || "AI Agent Summoner", width - margin * 2), width / 2, textY + 160);

  if (badgeData.showStats && badgeData.stats?.length) {
    let statX = margin;
    const statY = textY + 240;
    const statW = (width - margin * 2 - (badgeData.stats.length - 1) * 20) / badgeData.stats.length;
    
    badgeData.stats.forEach((stat) => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      roundRect(ctx, statX, statY, statW, 100, 16, true, true);
      
      ctx.textAlign = "center";
      ctx.fillStyle = "#94A3B8";
      ctx.font = "600 18px 'Victor Mono', monospace";
      ctx.fillText(stat.label.substring(0,4), statX + statW / 2, statY + 40);
      
      ctx.fillStyle = theme.accent;
      ctx.font = "800 36px 'Imbue', serif";
      ctx.fillText(stat.value.toString(), statX + statW / 2, statY + 80);
      statX += statW + 20;
    });
  }

  // Footer
  try {
    const logoImg = await loadImageFromUrl("/assets/images/Hacker%20house.png");
    const logoAspect = logoImg.width / logoImg.height;
    const logoH = 40;
    const logoW = logoH * logoAspect;
    ctx.drawImage(logoImg, width / 2 - logoW / 2, height - margin - logoH, logoW, logoH);
  } catch (e) {
    ctx.textAlign = "center";
    ctx.fillStyle = "#64748B";
    ctx.font = "600 24px 'Victor Mono', monospace";
    ctx.fillText("HACKER HOUSE GOA // OCT 28-31", width / 2, height - margin);
  }

  ctx.restore();
}

/* ==================== UTILITY CANVAS UTILS ==================== */

const imageCache = new Map<string, HTMLImageElement>();
const loadImageFromUrl = (src: string): Promise<HTMLImageElement> => {
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src)!);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
};

function drawUserImage(
  ctx: CanvasRenderingContext2D,
  photo: PhotoConfig,
  cx: number,
  cy: number,
  targetW: number,
  targetH: number
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.save();
      ctx.translate(cx + photo.offsetX, cy + photo.offsetY);
      ctx.rotate((photo.rotation * Math.PI) / 180);
      ctx.scale(photo.zoom, photo.zoom);

      // Filter settings
      ctx.filter = `brightness(${photo.brightness}%) contrast(${photo.contrast}%)`;

      // Aspect fill math
      const aspect = img.width / img.height;
      let drawW = targetW;
      let drawH = targetH;

      if (aspect > 1) {
        drawW = targetH * aspect;
      } else {
        drawH = targetW / aspect;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
      resolve();
    };
    img.onerror = () => {
      drawPlaceholderPhoto(ctx, cx, cy, targetW);
      resolve();
    };
    img.src = photo.url || "";
  });
}

function drawPlaceholderPhoto(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number
) {
  ctx.save();
  ctx.fillStyle = "#1E293B";
  ctx.fillRect(cx - size / 2, cy - size / 2, size, size);

  ctx.fillStyle = "#475569";
  ctx.textAlign = "center";
  ctx.font = "800 24px 'Imbue', serif";
  ctx.fillText("UPLOAD PHOTO", cx, cy);
  ctx.restore();
}

async function drawHeaderPill(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  text: string,
  theme: typeof THEMES.sunset
) {
  ctx.save();
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 15;

  const width = 420;
  const height = 50;

  ctx.fillStyle = "#090D16";
  roundRect(ctx, cx - width / 2, cy - height / 2, width, height, 25, true, false);

  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 2;
  roundRect(ctx, cx - width / 2, cy - height / 2, width, height, 25, false, true);

  try {
    const logoImg = await loadImageFromUrl("/assets/images/Hacker%20house.png");
    const logoAspect = logoImg.width / logoImg.height;
    const logoH = 26;
    const logoW = logoH * logoAspect;
    ctx.drawImage(logoImg, cx - logoW / 2, cy - logoH / 2, logoW, logoH);
  } catch (e) {
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 20px 'Imbue', serif";
    ctx.textAlign = "center";
    ctx.fillText(text, cx, cy + 7);
  }
  ctx.restore();
}

function drawCornerBrackets(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  const len = 30;

  // Top Left
  ctx.beginPath();
  ctx.moveTo(x, y + len);
  ctx.lineTo(x, y);
  ctx.lineTo(x + len, y);
  ctx.stroke();

  // Top Right
  ctx.beginPath();
  ctx.moveTo(x + w - len, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + len);
  ctx.stroke();

  // Bottom Left
  ctx.beginPath();
  ctx.moveTo(x, y + h - len);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + len, y + h);
  ctx.stroke();

  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(x + w - len, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - len);
  ctx.stroke();

  ctx.restore();
}

async function drawCanvasQrCode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  theme: typeof THEMES.sunset,
  badgeData: BadgeData
) {
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, x, y, size, size, 12, true, false);

  try {
    const cleanHandle = (badgeData.xHandle || "").trim().replace(/^@/, "");
    const url = cleanHandle ? `https://x.com/${cleanHandle}` : "https://x.com/HHGoa2026";
    const qrDataUrl = await QRCode.toDataURL(url, {
      margin: 1,
      color: {
        dark: "#090D16",
        light: "#FFFFFF"
      }
    });

    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    
    await new Promise((resolve) => {
      qrImg.onload = resolve;
    });

    // Draw the QR code inside the white rounded rect
    // Leave a small padding inside
    const padding = 8;
    ctx.drawImage(qrImg, x + padding, y + padding, size - padding * 2, size - padding * 2);
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    // Fallback block if generation fails
    ctx.fillStyle = "#090D16";
    ctx.fillRect(x + 8, y + 8, size - 16, size - 16);
  }

  ctx.restore();
}

function drawQrFinder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number
) {
  ctx.fillRect(x, y, s, s);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(x + 3, y + 3, s - 6, s - 6);
  ctx.fillStyle = "#090D16";
  ctx.fillRect(x + 6, y + 6, s - 12, s - 12);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill = true,
  stroke = false
) {
  ctx.beginPath();
  roundRectPath(ctx, x, y, width, height, radius);
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function roundRectTop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  const num = parseInt(c, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

async function drawHolographicStamp(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  stampText: string,
  theme: typeof THEMES.sunset
) {
  ctx.save();
  const stampX = width - 220;
  const stampY = height - 200;

  ctx.translate(stampX, stampY);
  ctx.rotate((-12 * Math.PI) / 180);

  // Border
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 5;
  ctx.beginPath();
  roundRectPath(ctx, -140, -40, 280, 80, 16);
  ctx.stroke();

  // Inner dashed border
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 2;
  ctx.strokeRect(-132, -32, 264, 64);
  ctx.setLineDash([]);
  
  try {
    let imgPath = null;
    if (stampText.includes("2:47")) imgPath = "/assets/images/2-47.svg";
    if (stampText.includes("GOA VIP")) imgPath = "/assets/images/goa_hindi.svg";
    
    if (imgPath) {
      const stampImg = await loadImageFromUrl(imgPath);
      const imgAspect = stampImg.width / stampImg.height;
      const drawH = 50;
      const drawW = drawH * imgAspect;
      ctx.drawImage(stampImg, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      // Text fallback
      ctx.fillStyle = theme.primary;
      ctx.font = "800 24px 'Victor Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = theme.primary;
      ctx.shadowBlur = 15;
      ctx.fillText(stampText, 0, 0);
    }
  } catch (e) {
    // Text fallback
    ctx.fillStyle = theme.primary;
    ctx.font = "800 24px 'Victor Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 15;
    ctx.fillText(stampText, 0, 0);
  }

  ctx.restore();
}

function drawScanlines(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 2);
  }
  ctx.restore();
}

function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let str = text;
  while (str.length > 0 && ctx.measureText(str + "...").width > maxWidth) {
    str = str.slice(0, -1);
  }
  return str + "...";
}

function drawHolographicFoil(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  
  // Rainbow gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(255, 0, 128, 0.35)");
  gradient.addColorStop(0.25, "rgba(255, 255, 0, 0.25)");
  gradient.addColorStop(0.5, "rgba(0, 255, 255, 0.35)");
  gradient.addColorStop(0.75, "rgba(0, 255, 0, 0.25)");
  gradient.addColorStop(1, "rgba(128, 0, 255, 0.35)");
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Diagonal foil light reflections
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = Math.min(width, height) * 0.15;
  
  ctx.beginPath();
  ctx.moveTo(0, height * 1.2);
  ctx.lineTo(width * 1.2, 0);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(-width * 0.2, height);
  ctx.lineTo(width, -height * 0.2);
  ctx.stroke();
  
  ctx.restore();
}
