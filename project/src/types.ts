import { create } from "zustand";

export interface Post {
  id: string;
  text: string;
  imageUrl: string;
  scheduledDate: string;
  platforms: ("facebook" | "instagram" | "x" | "linkedin")[];
  businessLogo: string;
  status: "generated" | "draft" | "scheduled" | "published";
}

export interface Website {
  id: string;
  name: string;
  logo: string;
}

export interface BusinessData {
  // Business Category
  name: string;
  description: string;
  industry: string;
  niche: string;
  website: string;
  language: string;
  country: string;
  region: string;

  // Brand Category
  logo: string;
  logoBackground: string;
  headshot: string;
  brandColor: string;
  backgroundColor: string;
  textColor: string;

  // Marketing Strategy Category
  marketingStrategy: {
    audience: string[];
    audiencePains: string[];
    coreValues: string[];
  };
}

export interface ThemeState {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  toggle: () => void;
}
export interface AuthState {
  isLoginPopup: boolean;
  isSignupPopup: boolean;
  setIsLoginPopup: (isLoginPopup: boolean) => void;
  setIsSignupPopup: (isSignupPopup: boolean) => void;
}

export interface CanvasElement {
  id: string;
  type: "text" | "image" | "shape";
  content: string;
  style: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    borderRadius?: number;
    opacity?: number;
    fontSize?: number;
    fontFamily?: string;
    textAlign?: "left" | "center" | "right";
    zIndex: number;
  };
}

export interface CanvasData {
  width: number;
  height: number;
  background: string;
  elements: CanvasElement[];
}

export type SocialPlatform = "facebook" | "instagram" | "x" | "linkedin";

export interface PlatformDimensions {
  width: number;
  height: number;
  label: string;
}

export const PLATFORM_DIMENSIONS: Record<SocialPlatform, PlatformDimensions> = {
  facebook: {
    width: 1200,
    height: 630,
    label: "Facebook Post",
  },
  instagram: {
    width: 1080,
    height: 1080,
    label: "Instagram Square",
  },
  x: {
    width: 1600,
    height: 900,
    label: "X Post",
  },
  linkedin: {
    width: 1200,
    height: 627,
    label: "LinkedIn Post",
  },
};
