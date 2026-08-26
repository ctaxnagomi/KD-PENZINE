
export interface VolumeLayout {
  autoFit?: boolean;
  columns?: number;
  newspaperMode?: boolean;
}

export type ThemeVariant = 'neon' | 'editorial' | 'amber' | 'teal' | 'terra' | 'bronze' | 'violet' | 'ocean';

export interface VolumeTheme {
  variant: ThemeVariant;
  accent: string;
}

export interface Volume {
  id: string;
  volume: number;
  title: string;
  date: string;
  status: 'draft' | 'review' | 'published';
  pages: string[]; // Markdown contents
  coverArt?: string; // Base64 or URL
  layout?: VolumeLayout;
  themeColor?: string; // Optional custom color theme
  theme?: VolumeTheme; // Optional per-volume theme (variant + accent)
}

export const DEFAULT_THEME: VolumeTheme = { variant: 'editorial', accent: '#cc785c' };

// Per-index defaults so each VOL gets its own accent + background animation
const INDEX_THEMES: VolumeTheme[] = [
  { variant: 'neon', accent: '#39ff14' },
  { variant: 'amber', accent: '#e8a55a' },
  { variant: 'teal', accent: '#5db8a6' },
  { variant: 'terra', accent: '#a9583e' },
  { variant: 'bronze', accent: '#9c7c52' },
  { variant: 'violet', accent: '#8a7bd8' },
  { variant: 'ocean', accent: '#3d7ea6' },
];

export function resolveTheme(volume: Partial<Volume> | null | undefined, index = 0): VolumeTheme {
  if (volume?.theme?.accent) {
    return { variant: volume.theme.variant || 'editorial', accent: volume.theme.accent };
  }
  if (volume?.themeColor) {
    return { variant: 'editorial', accent: volume.themeColor };
  }
  return INDEX_THEMES[index % INDEX_THEMES.length] || DEFAULT_THEME;
}

export const VOLUME_COLORS = [
  '#cc785c', // Coral (Vol 1)
  '#e8a55a', // Amber (Vol 2)
  '#5db8a6', // Teal (Vol 3)
  '#a9583e', // Terracotta (Vol 4)
  '#9c7c52'  // Bronze (Vol 5)
];