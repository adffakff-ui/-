import React, { useState } from 'react';
import {
  Music,
  Play,
  Pause,
  Check,
  Sparkles,
  Volume2,
  Headphones,
  Flame,
  Coffee,
  Film,
  Disc,
} from 'lucide-react';
import { MusicCategory, MusicTrack, ReelSettings } from '../types';
import { MUSIC_LIBRARY } from '../utils/constants';
import { startAmbientSound, stopAmbientSound, isAmbientSoundPlaying } from '../utils/audioSynth';

interface Props {
  settings: ReelSettings;
  onUpdateSettings: (newSettings: Partial<ReelSettings>) => void;
}

export const MusicLibraryPicker: React.FC<Props> = ({ settings, onUpdateSettings }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | MusicCategory>('all');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const filteredTracks =
    selectedFilter === 'all'
      ? MUSIC_LIBRARY
      : MUSIC_LIBRARY.filter((track) => track.category === selectedFilter);

  const handleTogglePlay = (track: MusicTrack) => {
    if (playingTrackId === track.id) {
      stopAmbientSound();
      setPlayingTrackId(null);
    } else {
      startAmbientSound(track.category);
      setPlayingTrackId(track.id);
    }
  };

  const handleSelectTrack = (track: MusicTrack) => {
    onUpdateSettings({
      soundTitle: track.title,
      soundCategory: track.category,
      soundTrackId: track.id,
    });
    // Also preview track
    startAmbientSound(track.category);
    setPlayingTrackId(track.id);
  };

  const getCategoryTheme = (cat: MusicCategory) => {
    switch (cat) {
      case 'calm':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: <Coffee className="w-3.5 h-3.5" />,
          label: 'هادئة',
        };
      case 'energetic':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: <Flame className="w-3.5 h-3.5" />,
          label: 'حماسية',
        };
      case 'dramatic':
        return {
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          icon: <Film className="w-3.5 h-3.5" />,
          label: 'درامية',
        };
    }
  };

  return (
    <div className="bg-zinc-950/85 border border-zinc-800 rounded-2xl p-5 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              مكتبة الخلفيات الموسيقية للريلز والفيديو
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-zinc-400">
              اختر المقطع الموسيقي ليتم اعتماده وتحديث معلومات الصوت في واجهة الريلز فوراً
            </p>
          </div>
        </div>

        {/* Active Track indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800 text-xs">
          <Disc className="w-3.5 h-3.5 text-purple-400 animate-[spin_5s_linear_infinite]" />
          <span className="text-zinc-300 font-medium truncate max-w-[140px]">
            {settings.soundTitle}
          </span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedFilter === 'all'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          🎵 جميع المقاطع ({MUSIC_LIBRARY.length})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('calm')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedFilter === 'calm'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>هادئة واستكنان (4)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('energetic')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedFilter === 'energetic'
              ? 'bg-amber-500 text-zinc-950 shadow-md'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-400'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>حماسية وفخامة (4)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('dramatic')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedFilter === 'dramatic'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-indigo-400'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>درامية وعميقة (4)</span>
        </button>
      </div>

      {/* Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {filteredTracks.map((track) => {
          const isSelected = settings.soundTitle === track.title;
          const isPlayingThis = playingTrackId === track.id;
          const theme = getCategoryTheme(track.category);

          return (
            <div
              key={track.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                isSelected
                  ? 'bg-purple-950/30 border-purple-500/80 shadow-md ring-1 ring-purple-500/30'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {/* Category icon */}
                  <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-lg shrink-0">
                    {track.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100 leading-snug">{track.title}</h4>
                    <p className="text-[11px] text-zinc-400">{track.artistOrVibe}</p>
                  </div>
                </div>

                {/* Category badge */}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 shrink-0 ${theme.bg}`}
                >
                  {theme.icon}
                  <span>{theme.label}</span>
                </span>
              </div>

              {/* Description */}
              <p className="text-[10px] text-zinc-400 leading-relaxed bg-zinc-950/40 p-2 rounded-lg border border-zinc-800/40">
                {track.description}
              </p>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
                {/* Preview audio playback */}
                <button
                  type="button"
                  onClick={() => handleTogglePlay(track)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isPlayingThis
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300'
                  }`}
                  title="استماع فوري للمقطع"
                >
                  {isPlayingThis ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>إيقاف</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 ml-0.5" />
                      <span>استماع</span>
                    </>
                  )}
                </button>

                {/* Select track button */}
                <button
                  type="button"
                  onClick={() => handleSelectTrack(track)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                      : 'bg-zinc-800 hover:bg-purple-600 hover:text-white text-zinc-200'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>الصوت النشط</span>
                    </>
                  ) : (
                    <span>تطبيق على الريلز</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Title Manual Edit */}
      <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-zinc-200 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            <span>نص اسم الصوت المعروض على واجهة الريلز (قابل للتعديل):</span>
          </label>
        </div>
        <input
          type="text"
          value={settings.soundTitle}
          onChange={(e) => onUpdateSettings({ soundTitle: e.target.value })}
          placeholder="مثال: صوت أصلي • ريمكس هادئ 🎵"
          className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none transition-all"
        />
        <p className="text-[10px] text-zinc-500">
          💡 يتم تحديث هذا الاسم فوراً في شارة الصوت أعلى يسار الريلز وفي مشغل الموسيقى أسفل بطاقة الفيديو.
        </p>
      </div>
    </div>
  );
};
