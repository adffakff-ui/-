export type AspectRatioType = '9:16' | '16:9' | '1:1';

export type FontFamilyType = 'cairo' | 'amiri' | 'tajawal';

export type FilterType = 'normal' | 'cinematic-gold' | 'dark-noir' | 'vintage' | 'teal-orange' | 'dreamy-glow';

export type TextAnimationType = 'fade-in' | 'shake' | 'typewriter' | 'pulse' | 'slide-up' | 'bounce' | 'none';

export type PhotoFadeDirection = 'bottom' | 'radial' | 'dual' | 'sides' | 'none';

export type PhotoBlendMode = 'normal' | 'soft-light' | 'overlay' | 'luminosity';

export type MusicCategory = 'calm' | 'energetic' | 'dramatic';

export interface MusicTrack {
  id: string;
  title: string;
  artistOrVibe: string;
  category: MusicCategory;
  categoryLabel: string;
  badge: string;
  icon: string;
  duration: string;
  description: string;
}

export interface ReelSettings {
  quoteText: string;
  creatorName: string;
  creatorHandle: string;
  avatarUrl: string; // The user's uploaded personal avatar
  mainPhotoUrl: string; // The main portrait photo
  aspectRatio: AspectRatioType;
  filter: FilterType;
  fontFamily: FontFamilyType;
  textColor: string;
  fontSize: number;
  showEqualizer: boolean;
  soundTitle: string;
  soundCategory?: MusicCategory;
  soundTrackId?: string;
  likesCount: string;
  commentsCount: string;
  sharesCount: string;
  vignette: number;
  zoom: number;
  panY: number;
  glowEffect: boolean;
  brightness: number; // 50 to 180%
  contrast: number; // 50 to 200%
  saturation: number; // 0 to 200%
  filterIntensity: number; // 0 to 100%
  textAnimation: TextAnimationType;
  animationSpeed: number; // in seconds, e.g. 1.2
  photoFadeEnabled: boolean;
  photoFadeDirection: PhotoFadeDirection;
  photoFadeIntensity: number; // 0 to 100%
  photoBlendMode: PhotoBlendMode;
  backgroundGradient: string; // gradient ID
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  isHighThinking?: boolean;
}

export type GeminiModelType = 'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite';
