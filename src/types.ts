export type FrameFormat = "pfp" | "badge" | "squad" | "header" | "story";

export type ThemeStyle = "sunset" | "cyber" | "gold" | "monochrome" | "parchment" | "solana" | "emerald" | "vaporwave";

export interface PhotoConfig {
  id: string;
  url: string | null;
  zoom: number; // 0.5 to 3
  offsetX: number; // -200 to 200
  offsetY: number; // -200 to 200
  rotation: number; // -180 to 180
  brightness: number; // 80 to 120
  contrast: number; // 80 to 120
}

export interface TeammateInfo {
  id: string;
  name: string;
  role: string;
  stack: string;
  photo: PhotoConfig;
}

export interface BadgeData {
  format: FrameFormat;
  theme: ThemeStyle;
  // Single Builder Info
  name: string;
  xHandle?: string; // e.g. "HackerHouseGoa"
  role: string; // e.g. "AI & Crypto Builder"
  stack: string; // e.g. "React • Solana • Gemini API • Rust"
  builderTitle: string; // e.g. "Autonomous AI Agent Whisperer & Beach Hacker"
  motto: string; // e.g. "Shipping code directly from a lounge chair at 2:47 AM."
  archetype: string;
  rarity?: "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";
  badgeId: string; // e.g. "HH26-8942-GOA"
  stats: { label: string; value: number }[];
  
  // Squad / Team Info
  teamName: string;
  teammates: TeammateInfo[];
  
  // Customization Options
  frameOverlay: "classic" | "neon-ring" | "matrix-brackets" | "beach-sunset" | "gold-foil";
  showQrCode: boolean;
  showLanyard: boolean;
  showStats: boolean;
  customWatermark: string; // #FrameInGoa
  stamp: "VERIFIED BUILDER" | "2:47 AM APPROVED" | "GOA VIP" | "AI ALCHEMIST" | "SOLANA DEGEN" | "NONE";
  scanlines: boolean;
}

export interface ScoreMetrics {
  likes: number;
  replies: number;
  bookmarks: number;
  retweets: number;
  quotes: number;
  views: number;
}
