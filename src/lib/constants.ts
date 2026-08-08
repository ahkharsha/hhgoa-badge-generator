import { BadgeData, ThemeStyle } from "../types";

export const SAMPLE_AVATAR = "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80"; // Cyber/Tech Money/Code theme or person
export const SAMPLE_AVATAR_2 = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"; // Abstract tech
export const SAMPLE_AVATAR_3 = "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80"; // Coding screen

export const DEFAULT_BADGE_DATA: BadgeData = {
  format: "badge",
  theme: "sunset",
  name: "",
  xHandle: "",
  role: "AI & Web3 Full-Stack Developer",
  stack: "TypeScript • Solana • Gemini • Python",
  builderTitle: "Autonomous Agent Alchemist & Beach Hacker",
  motto: "Shipping LATE NIGHT multichain AI agents on the beaches of Goa.",
  archetype: "AI ALCHEMIST",
  badgeId: Math.floor(10000 + Math.random() * 90000).toString(),
  stats: [
    { label: "SPEED", value: 96 },
    { label: "HACK", value: 98 },
    { label: "HYPE", value: 94 },
    { label: "CAFFEINE", value: 99 },
  ],
  teamName: "Team Neural Surge",
  teammates: [
    {
      id: "1",
      name: "",
      role: "AI Lead",
      stack: "Gemini • Python • LangChain",
      photo: {
        id: "p1",
        url: SAMPLE_AVATAR,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        brightness: 100,
        contrast: 100,
      },
    },
    {
      id: "2",
      name: "",
      role: "Protocol Eng",
      stack: "Rust • Solana • Anchor",
      photo: {
        id: "p2",
        url: SAMPLE_AVATAR_2,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        brightness: 100,
        contrast: 100,
      },
    },
  ],
  frameOverlay: "classic",
  showQrCode: true,
  showLanyard: true,
  showStats: true,
  customWatermark: "#FrameInGoa",
  stamp: "VERIFIED BUILDER",
  scanlines: false,
};

export const THEMES: Record<ThemeStyle, {
  name: string;
  bgGradient: string[];
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  cardBg: string;
  border: string;
}> = {
  sunset: {
    name: "HH Goa Core Green",
    bgGradient: ["#005C31", "#004B28", "#003A1F"],
    primary: "#CCFF00",
    secondary: "#FFFFFF",
    accent: "#FF007A",
    text: "#003A1F",
    cardBg: "#FFFEEA",
    border: "#CCFF00",
  },
  cyber: {
    name: "Editorial Yellow & Black",
    bgGradient: ["#0A0A0A", "#111111", "#050505"],
    primary: "#E1FF00",
    secondary: "#FFFFFF",
    accent: "#FF007A",
    text: "#FFFFFF",
    cardBg: "#111111",
    border: "#E1FF00",
  },
  gold: {
    name: "Brutalist Neon Orange",
    bgGradient: ["#0A0A0A", "#0A0A0A", "#000000"],
    primary: "#FF3300",
    secondary: "#FFFFFF",
    accent: "#E1FF00",
    text: "#FFFFFF",
    cardBg: "#151515",
    border: "#FF3300",
  },
  monochrome: {
    name: "Cyberpunk Blueprint",
    bgGradient: ["#0A0A0A", "#050505", "#111111"],
    primary: "#00F0FF",
    secondary: "#FFFFFF",
    accent: "#FF007A",
    text: "#FFFFFF",
    cardBg: "#0A0A0A",
    border: "#00F0FF",
  },
  parchment: {
    name: "Vintage Beach Sand",
    bgGradient: ["#2C3E35", "#1A2822", "#0F1A15"],
    primary: "#D4A373",
    secondary: "#FEFAE0",
    accent: "#E76F51",
    text: "#2C3E35",
    cardBg: "#F4F1DE",
    border: "#D4A373",
  },
  solana: {
    name: "Solana Degen Purple",
    bgGradient: ["#14002B", "#0A0018", "#030009"],
    primary: "#9945FF",
    secondary: "#14F195",
    accent: "#00F0FF",
    text: "#FFFFFF",
    cardBg: "#130A2A",
    border: "#14F195",
  },
  emerald: {
    name: "Goa Palms Emerald",
    bgGradient: ["#022C22", "#064E3B", "#022C22"],
    primary: "#10B981",
    secondary: "#34D399",
    accent: "#F59E0B",
    text: "#ECFDF5",
    cardBg: "#064E3B",
    border: "#34D399",
  },
  vaporwave: {
    name: "80s Neon Sunset",
    bgGradient: ["#2A0845", "#1B003A", "#0F0022"],
    primary: "#FF007A",
    secondary: "#00F0FF",
    accent: "#FFE600",
    text: "#FFFFFF",
    cardBg: "#1F0433",
    border: "#FF007A",
  },
};

export const PRESET_STACKS = [
  "Full-Stack AI • React • TypeScript",
  "Solana • Rust • Anchor • Web3",
  "Gemini API • LangChain • Python",
  "UI/UX Design • Motion • Figma",
  "Growth • Tokenomics • Community",
  "Zero-Knowledge • Ethereum • Cairo",
];
