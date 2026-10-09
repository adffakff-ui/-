import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';
import { ReelSettings } from '../types';
import { startAmbientSound, stopAmbientSound, isAmbientSoundPlaying } from '../utils/audioSynth';
import { GRADIENT_PRESETS } from '../utils/constants';

interface Props {
  settings: ReelSettings;
  onUpdateSettings: (newSettings: Partial<ReelSettings>) => void;
  onOpenAvatarModal: () => void;
  videoUrl?: string | null;
}

export const ReelPreview: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  onOpenAvatarModal,
  videoUrl,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(142850);
  const [audioProgress, setAudioProgress] = useState(45);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setAudioProgress((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlayAudio = () => {
    if (isPlaying) {
      stopAmbientSound();
      setIsPlaying(false);
    } else {
      startAmbientSound(settings.soundCategory || 'calm');
      setIsPlaying(true);
    }
  };

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      setIsLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  const formatLikes = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const isPortrait = settings.aspectRatio === '9:16';
  const isLandscape = settings.aspectRatio === '16:9';

  const computeFilterStyle = () => {
    const intensity = (settings.filterIntensity ?? 100) / 100;
    const b = settings.brightness ?? 100;
    const c = settings.contrast ?? 100;
    const s = settings.saturation ?? 100;

    let base = '';
    if (settings.filter === 'cinematic-gold') {
      base = `sepia(${Math.round(25 * intensity)}%) `;
    } else if (settings.filter === 'dark-noir') {
      base = `grayscale(${Math.round(100 * intensity)}%) `;
    } else if (settings.filter === 'vintage') {
      base = `sepia(${Math.round(40 * intensity)}%) hue-rotate(${Math.round(-10 * intensity)}deg) `;
    } else if (settings.filter === 'teal-orange') {
      base = `hue-rotate(${Math.round(15 * intensity)}deg) `;
    } else if (settings.filter === 'dreamy-glow') {
      base = `blur(${Math.round(0.5 * intensity)}px) `;
    }

    return `${base}brightness(${b}%) contrast(${c}%) saturate(${s}%)`.trim();
  };

  const getMaskStyle = () => {
    if (!settings.photoFadeEnabled) return {};
    const intensity = settings.photoFadeIntensity ?? 65;
    const dir = settings.photoFadeDirection ?? 'bottom';

    let mask = 'none';
    if (dir === 'bottom') {
      const stop = Math.max(10, 100 - intensity);
      mask = `linear-gradient(to bottom, black 0%, black ${stop}%, transparent 100%)`;
    } else if (dir === 'dual') {
      const pad = Math.min(45, intensity * 0.45);
      mask = `linear-gradient(to bottom, transparent 0%, black ${pad}%, black ${100 - pad}%, transparent 100%)`;
    } else if (dir === 'radial') {
      const stop = Math.max(15, 100 - intensity);
      mask = `radial-gradient(ellipse at center, black 0%, black ${stop * 0.75}%, transparent 100%)`;
    } else if (dir === 'sides') {
      const pad = Math.min(40, intensity * 0.4);
      mask = `linear-gradient(to right, transparent 0%, black ${pad}%, black ${100 - pad}%, transparent 100%)`;
    }

    return {
      maskImage: mask,
      WebkitMaskImage: mask,
      mixBlendMode: settings.photoBlendMode || 'normal',
    };
  };

  const activeGradient =
    GRADIENT_PRESETS.find((g) => g.id === settings.backgroundGradient) || GRADIENT_PRESETS[0];

  const getAnimClass = () => {
    switch (settings.textAnimation) {
      case 'fade-in':
        return 'anim-fade-in';
      case 'shake':
        return 'anim-shake';
      case 'pulse':
        return 'anim-pulse';
      case 'slide-up':
        return 'anim-slide-up';
      case 'bounce':
        return 'anim-bounce';
      default:
        return '';
    }
  };

  const fontClass =
    settings.fontFamily === 'amiri'
      ? 'font-amiri'
      : settings.fontFamily === 'tajawal'
      ? 'font-tajawal'
      : 'font-cairo';

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Top Controls: Aspect Ratio Buttons */}
      <div className="flex items-center gap-2 mb-4 bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800 text-xs shadow-lg">
        <button
          type="button"
          onClick={() => onUpdateSettings({ aspectRatio: '9:16' })}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            isPortrait
              ? 'bg-amber-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          📱 ريلز وستوري (9:16)
        </button>
        <button
          type="button"
          onClick={() => onUpdateSettings({ aspectRatio: '16:9' })}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            isLandscape
              ? 'bg-amber-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          🖥️ عرض سينمائي (16:9)
        </button>
        <button
          type="button"
          onClick={() => onUpdateSettings({ aspectRatio: '1:1' })}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            settings.aspectRatio === '1:1'
              ? 'bg-amber-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          ⏹️ منشور مربع (1:1)
        </button>
      </div>

      {/* Mobile/Reel Frame Container */}
      <div
        className={`relative overflow-hidden rounded-3xl border-4 border-zinc-800/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] bg-black transition-all duration-300 ${
          isPortrait
            ? 'w-[340px] sm:w-[380px] h-[670px] sm:h-[720px]'
            : isLandscape
            ? 'w-full max-w-[620px] aspect-video'
            : 'w-[360px] sm:w-[420px] aspect-square'
        }`}
      >
        {/* If Veo generated video is available, show the video, otherwise show the photo */}
        {videoUrl ? (
          <div className="absolute inset-0 z-0">
            <video
              src={videoUrl}
              autoPlay
              loop
              muted={!isPlaying}
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <>
            {/* Ambient Blurred Backdrop */}
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-2xl scale-125 opacity-40 transform"
              style={{ backgroundImage: `url(${settings.mainPhotoUrl})` }}
            />
            {/* Dark Radial Gradient */}
            <div className="absolute inset-0 bg-radial from-transparent via-black/50 to-black/90 pointer-events-none" />

            {/* Main Central Photo Card */}
            <div
              className={`absolute left-4 right-4 ${
                isPortrait ? 'top-5 bottom-28' : isLandscape ? 'top-4 bottom-14' : 'top-5 bottom-20'
              } rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-zinc-950/80 group`}
              style={
                settings.photoFadeEnabled
                  ? { background: activeGradient.css }
                  : undefined
              }
            >
              {/* Image with zoom, lighting filters and fade mask */}
              <div
                className="w-full h-full overflow-hidden relative cursor-pointer"
                onClick={onOpenAvatarModal}
                title="انقر لتغيير صورتك الشخصية"
              >
                <img
                  src={settings.mainPhotoUrl}
                  alt="الصورة الرئيسية"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{
                    transform: `scale(${settings.zoom}) translateY(${settings.panY}px)`,
                    filter: computeFilterStyle(),
                    ...getMaskStyle(),
                  }}
                />

                {/* Subtle gradient inside photo */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                {/* Hover indicator to change photo */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs pointer-events-none">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>انقر لتبديل صورتك الشخصية</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Top Header Row (Inside or Over the Card) */}
        <div className="absolute top-8 right-7 left-7 z-20 flex items-center justify-between pointer-events-auto">
          {/* User profile avatar and username */}
          <div
            onClick={onOpenAvatarModal}
            className="flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 hover:border-amber-400/80 cursor-pointer transition-all shadow-md group"
            title="صورتك الشخصية (الأفاتار) - انقر للتعديل"
          >
            <div className="relative">
              <img
                src={settings.avatarUrl}
                alt="صورتك الشخصية"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400 group-hover:ring-amber-300 transition-all"
              />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-black" />
            </div>
            <div className="flex flex-col text-right">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white leading-none">{settings.creatorName}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
              </div>
              <span className="text-[10px] text-zinc-300 font-mono leading-tight">{settings.creatorHandle}</span>
            </div>
          </div>

          {/* Audio Tag Badge with Animated Equalizer */}
          <div
            onClick={togglePlayAudio}
            className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20 text-xs font-medium text-amber-300 cursor-pointer hover:bg-black/60 transition-all shadow"
          >
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-3.5">
                <span className="w-1 bg-amber-400 rounded-full animate-pulse h-3" />
                <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2" />
                <span className="w-1 bg-amber-400 rounded-full animate-pulse h-3.5" />
              </div>
            ) : (
              <Music2 className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="text-[11px] truncate max-w-[130px] font-semibold">{settings.soundTitle}</span>
          </div>
        </div>

        {/* The Viral Quote & Typography (Centered over lower area of photo) */}
        <div
          className={`absolute z-20 left-7 right-7 ${
            isPortrait ? 'bottom-28' : isLandscape ? 'bottom-16' : 'bottom-24'
          } pointer-events-none text-center`}
        >
          <div className="p-3 rounded-2xl bg-black/35 backdrop-blur-md border border-white/10 shadow-2xl">
            <p
              key={`${settings.textAnimation}-${settings.quoteText}`}
              className={`leading-relaxed tracking-wide ${fontClass} drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] ${getAnimClass()} transition-all`}
              style={{
                fontSize: `${settings.fontSize}px`,
                color: settings.textColor,
                textShadow: settings.glowEffect ? '0 0 20px rgba(245, 158, 11, 0.6), 0 2px 4px #000' : '0 2px 8px #000',
              }}
            >
              {settings.quoteText}
            </p>
          </div>
        </div>

        {/* Right-Side Reels Action Buttons (Like, Comment, Share, Bookmark, Sound Disc) */}
        <div className="absolute right-4 bottom-28 z-30 flex flex-col items-center gap-4 pointer-events-auto">
          {/* Like */}
          <button
            type="button"
            onClick={handleLike}
            className="flex flex-col items-center group transition-transform active:scale-90"
          >
            <div
              className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
                isLiked
                  ? 'bg-red-500/20 border-red-500 text-red-500 shadow-lg'
                  : 'bg-black/50 border-white/20 text-white group-hover:bg-black/80'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
            </div>
            <span className="text-[10px] font-bold text-white mt-1 shadow-black drop-shadow">
              {formatLikes(likeCount)}
            </span>
          </button>

          {/* Comment */}
          <div className="flex flex-col items-center group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center group-hover:bg-black/80 transition-all">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-white mt-1 drop-shadow">
              {settings.commentsCount}
            </span>
          </div>

          {/* Share */}
          <div className="flex flex-col items-center group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center group-hover:bg-black/80 transition-all">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-white mt-1 drop-shadow">
              {settings.sharesCount}
            </span>
          </div>

          {/* Bookmark */}
          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center group-hover:bg-black/80 transition-all"
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          {/* Spinning Audio Vinyl Disc */}
          <div
            onClick={togglePlayAudio}
            className={`w-10 h-10 rounded-full bg-zinc-900 border-2 border-zinc-700 p-1 flex items-center justify-center shadow-lg cursor-pointer ${
              isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
            }`}
          >
            <img
              src={settings.avatarUrl}
              alt="قرص الصوت"
              className="w-full h-full rounded-full object-cover ring-1 ring-amber-400"
            />
          </div>
        </div>

        {/* Bottom Audio Player Bar Widget */}
        <div className="absolute bottom-3 left-4 right-4 z-20 bg-zinc-950/85 backdrop-blur-lg px-3.5 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3 shadow-xl">
          <button
            type="button"
            onClick={togglePlayAudio}
            className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-zinc-950" /> : <Play className="w-4 h-4 fill-zinc-950 ml-0.5" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-[11px] text-zinc-300 font-medium mb-1">
              <span className="truncate">{settings.soundTitle}</span>
              <span className="text-zinc-400 font-mono">0:14 / 0:30</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
                style={{ width: `${audioProgress}%` }}
              />
            </div>
          </div>

          <div className="shrink-0 text-amber-400">
            {isPlaying ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </div>
        </div>
      </div>
    </div>
  );
};
