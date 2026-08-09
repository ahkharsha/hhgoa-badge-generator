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
  // Base dark fill
  ctx.fillStyle = theme.bgGradient[2];
  ctx.fillRect(0, 0, width, height);

  // Premium AI Cyberpunk Background Layer
  try {
    const cyberImg = await loadImageFromUrl("/assets/images/cyber-bg.png");
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.7; // Brightened so it pops
    
    // Scale and crop to fit exactly covering the canvas
    const imgAspect = cyberImg.width / cyberImg.height;
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
    ctx.drawImage(cyberImg, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
    ctx.restore();
  } catch (e) {
    // If the image fails to load, gracefully degrade to normal background
    console.log("Failed to load cyber bg", e);
  }
  
  if (theme.name === "Sunset" || theme.name === "Gold") {
    try {
      const sunriseImg = await loadImageFromUrl("/assets/images/Sun%20rise.png");
      const imgAspect = sunriseImg.width / sunriseImg.height;
      const drawHeight = width / imgAspect;
      ctx.globalAlpha = 0.8;
      ctx.drawImage(sunriseImg, 0, height - drawHeight, width, drawHeight);
      ctx.globalAlpha = 1.0;
    } catch (e) {
      // fallback
    }
  }

  // Radial glow gradient at center top
  const radial = ctx.createRadialGradient(
    width / 2,
    0,
    50,
    width / 2,
    height / 2,
    width * 0.85
  );
  radial.addColorStop(0, hexToRgba(theme.primary, 0.45));
  radial.addColorStop(0.5, hexToRgba(theme.secondary, 0.25));
  radial.addColorStop(1, "transparent");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);

  // Cyber grid lines
  ctx.strokeStyle = hexToRgba(theme.primary, 0.15);
  ctx.lineWidth = 1.5;
  const gridSize = 40;

  ctx.beginPath();
  for (let x = 0; x < width; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  // Procedural Premium Typography (Hex Data)
  ctx.fillStyle = hexToRgba(theme.accent, 0.5);
  ctx.font = "500 10px 'Victor Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText(`SYS.INIT // ${Math.random().toString(16).substr(2, 8).toUpperCase()}`, 15, 20);
  ctx.textAlign = "right";
  ctx.fillText(`SEQ: ${Date.now().toString().slice(-6)}`, width - 15, 20);

  // Subtle Beach Wave Curves at bottom
  ctx.save();
  ctx.fillStyle = hexToRgba(theme.secondary, 0.15);
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.quadraticCurveTo(width * 0.25, height - 80, width * 0.5, height - 40);
  ctx.quadraticCurveTo(width * 0.75, height, width, height - 60);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
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

  // Card Body Background
  ctx.fillStyle = hexToRgba(theme.cardBg, 0.95);
  roundRect(ctx, margin, cardY, cardW, cardH, 32, true, false);

  // Designer Overlay (hackers.png)
  try {
    const designerImg = new Image();
    designerImg.crossOrigin = "anonymous";
    designerImg.src = "/assets/images/hackers.png";
    await new Promise((resolve, reject) => {
      designerImg.onload = resolve;
      designerImg.onerror = reject;
    });
    ctx.save();
    // Create clipping path for the card body
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(margin, cardY, cardW, cardH, 32);
      ctx.clip();
    }
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.15;
    
    // Draw it scaled to fit the card width
    const imgRatio = designerImg.width / designerImg.height;
    const drawH = cardW / imgRatio;
    ctx.drawImage(designerImg, margin, cardY + cardH - drawH, cardW, drawH);
    ctx.restore();
  } catch (e) {
    console.error("Failed to load designer overlay", e);
  }

  // Gradient Border
  const cardBorder = ctx.createLinearGradient(margin, cardY, width - margin, cardY + cardH);
  cardBorder.addColorStop(0, theme.primary);
  cardBorder.addColorStop(0.5, theme.secondary);
  cardBorder.addColorStop(1, theme.accent);

  ctx.strokeStyle = cardBorder;
  ctx.lineWidth = 5;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 25;
  roundRect(ctx, margin, cardY, cardW, cardH, 32, false, true);
  ctx.shadowBlur = 0;
  ctx.restore();

  // Holographic Header Banner inside card
  ctx.save();
  const headerH = 130;
  const headerGrad = ctx.createLinearGradient(margin, cardY, width - margin, cardY + headerH);
  headerGrad.addColorStop(0, theme.primary);
  headerGrad.addColorStop(1, theme.secondary);

  ctx.fillStyle = headerGrad;
  roundRectTop(ctx, margin + 2, cardY + 2, cardW - 4, headerH, 30);

  // Event Header Text
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 38px 'Imbue', serif";
  ctx.textAlign = "left";
  ctx.fillText("HH GOA 2026", margin + 40, cardY + 58);

  ctx.font = "700 18px 'Victor Mono', monospace";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText("HACKER HOUSE • 247 BUILDER SHORTLIST", margin + 40, cardY + 90);

  // VIP Archetype Tag (Top Right)
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  roundRect(ctx, width - margin - 220, cardY + 32, 180, 42, 21, true, false);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 16px 'Victor Mono', monospace";
  ctx.fillText(badgeData.archetype || "VIP BUILDER", width - margin - 40, cardY + 58);

  ctx.font = "600 14px 'Imbue', serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillText("GOA, INDIA • OCT 28-31", width - margin - 40, cardY + 90);
  ctx.restore();

  // Photo Container
  const photoW = 340;
  const photoH = 340;
  const photoX = margin + 40;
  const photoY = cardY + headerH + 40;

  ctx.save();
  // Photo Border
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 4;
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 15;
  roundRect(ctx, photoX, photoY, photoW, photoH, 24, false, true);
  ctx.shadowBlur = 0;

  // Clip Photo
  ctx.beginPath();
  roundRectPath(ctx, photoX + 2, photoY + 2, photoW - 4, photoH - 4, 22);
  ctx.clip();

  if (photo.url) {
    await drawUserImage(ctx, photo, photoX + photoW / 2, photoY + photoH / 2, photoW, photoH);
  } else {
    drawPlaceholderPhoto(ctx, photoX + photoW / 2, photoY + photoH / 2, photoW);
  }
  ctx.restore();

  // Info Block (Right side of photo)
  const infoX = photoX + photoW + 50;
  const infoY = photoY + 20;

  ctx.save();
  ctx.textAlign = "left";

  // Name
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 48px 'Imbue', serif";
  const nameStr = truncateText(ctx, (badgeData.name || "Anonymous").toUpperCase(), 480);
  ctx.fillText(nameStr, infoX, infoY + 40);

  // Role
  ctx.fillStyle = theme.primary;
  ctx.font = "700 26px 'Victor Mono', monospace";
  ctx.fillText(truncateText(ctx, badgeData.role || "Builder", 480), infoX, infoY + 90);

  // Badge Serial ID
  ctx.fillStyle = "#64748B";
  ctx.font = "600 20px 'Victor Mono', monospace";
  ctx.fillText(`ID: ${badgeData.badgeId || "HH26-2470-GOA"}`, infoX, infoY + 135);

  // Stack Tags
  const stackItems = (badgeData.stack || "AI • Web3 • Full-Stack").split(/•|,|\|/).slice(0, 3);
  let tagY = infoY + 180;
  stackItems.forEach((item) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    ctx.fillStyle = hexToRgba(theme.primary, 0.15);
    roundRect(ctx, infoX, tagY, 340, 42, 14, true, false);
    ctx.strokeStyle = hexToRgba(theme.primary, 0.4);
    ctx.lineWidth = 1;
    roundRect(ctx, infoX, tagY, 340, 42, 14, false, true);

    ctx.fillStyle = "#F8FAFC";
    ctx.font = "700 18px 'Imbue', serif";
    ctx.fillText(`⚡ ${trimmed}`, infoX + 20, tagY + 28);
    tagY += 54;
  });
  ctx.restore();

  // Builder Title Banner Section
  const titleY = photoY + photoH + 50;
  ctx.save();
  ctx.fillStyle = hexToRgba("#030712", 0.85);
  roundRect(ctx, margin + 40, titleY, cardW - 80, 110, 20, true, false);
  ctx.strokeStyle = hexToRgba(theme.secondary, 0.5);
  ctx.lineWidth = 2;
  roundRect(ctx, margin + 40, titleY, cardW - 80, 110, 20, false, true);

  ctx.textAlign = "left"; // FIX: Ensure text alignment doesn't leak from Stack tags or VIP Archetype!
  ctx.fillStyle = theme.accent;
  ctx.font = "800 16px 'Victor Mono', monospace";
  const rarityLevel = badgeData.rarity || "EPIC";
  let rarityColor = theme.accent;
  if (rarityLevel === "LEGENDARY") rarityColor = "#FBBF24";
  if (rarityLevel === "MYTHIC") rarityColor = "#A855F7";
  ctx.fillStyle = rarityColor;
  ctx.fillText(`✦ ${rarityLevel} BUILDER CLASS ✦`, margin + 65, titleY + 40);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 28px 'Imbue', serif";
  // FIX: Properly truncate based on the actual bounding box width (cardW - 80 - 25 padding * 2 = cardW - 130)
  ctx.fillText(truncateText(ctx, badgeData.builderTitle || "Autonomous Agent Alchemist", cardW - 130), margin + 65, titleY + 80);
  ctx.restore();

  // Motto Quote
  const mottoY = titleY + 150;
  ctx.save();
  ctx.textAlign = "left"; // FIX: Reset from VIP Archetype
  ctx.fillStyle = "#CBD5E1";
  ctx.font = "italic 24px 'Imbue', serif";
  ctx.fillText(`"${truncateText(ctx, badgeData.motto || "Building at 2:47 AM in Goa.", 440)}"`, margin + 40, mottoY);
  ctx.restore();

  // Stats Progress Bars
  let lastY = mottoY + 10;
  if (badgeData.showStats && badgeData.stats && badgeData.stats.length > 0) {
    const statsY = mottoY + 45;
    const statW = (cardW - 80 - 30) / 2;

    badgeData.stats.forEach((st, idx) => {
      const sx = margin + 40 + (idx % 2) * (statW + 30);
      const sy = statsY + Math.floor(idx / 2) * 50;

      ctx.save();
      ctx.textAlign = "left"; // FIX: Ensure left alignment for stats text
      ctx.fillStyle = "#94A3B8";
      ctx.font = "700 16px 'Victor Mono', monospace";
      ctx.fillText(`${st.label}: ${st.value}%`, sx, sy + 16);

      // Track
      ctx.fillStyle = "#1E293B";
      roundRect(ctx, sx + 140, sy, statW - 140, 22, 11, true, false);

      // Fill
      const fillW = Math.max(10, ((statW - 140) * st.value) / 100);
      ctx.fillStyle = idx % 2 === 0 ? theme.primary : theme.secondary;
      roundRect(ctx, sx + 140, sy, fillW, 22, 11, true, false);
      ctx.restore();
      
      lastY = sy + 50;
    });
  }

  // Draw Access Granted Block to fill vertical space
  ctx.save();
  const accessY = lastY + 30; // Closer spacing
  ctx.fillStyle = hexToRgba(theme.primary, 0.1);
  roundRect(ctx, margin + 40, accessY, cardW - 80, 50, 8, true, false);
  ctx.fillStyle = theme.primary;
  ctx.font = "800 20px 'Victor Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("/// ACCESS LEVEL: TIER 1 [GOA VIP] ///", width / 2, accessY + 32);
  ctx.restore();

  // Footer: QR Code + Hashtag Watermark
  const footerY = height - margin - 120;
  ctx.save();
  if (badgeData.showQrCode) {
    await drawCanvasQrCode(ctx, margin + 40, footerY, 90, theme, badgeData);
  }

  ctx.textAlign = "left";
  ctx.fillStyle = theme.text || theme.primary;
  ctx.font = "800 28px 'Imbue', serif";
  ctx.fillText("#FrameInGoa", margin + 150, footerY + 40);

  ctx.fillStyle = "#64748B";
  ctx.font = "600 16px 'Victor Mono', monospace";
  ctx.fillText("VERIFIED BY 2:47PM STUDIO • HHGOA.COM", margin + 150, footerY + 70);
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
  ctx.fillStyle = hexToRgba(theme.cardBg, 0.95);
  roundRect(ctx, margin, margin, cardW, cardH, 28, true, false);

  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 4;
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 20;
  roundRect(ctx, margin, margin, cardW, cardH, 28, false, true);
  ctx.shadowBlur = 0;

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

  // Footer Watermark
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
