import React from 'react';
import {
  Sun,
  Contrast,
  Palette,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  Flame,
  Layers,
  Blend,
  Maximize2,
  Check,
  Eye,
} from 'lucide-react';
import { ReelSettings, FilterType, PhotoFadeDirection, PhotoBlendMode } from '../types';
import { GRADIENT_PRESETS } from '../utils/constants';

interface Props {
  settings: ReelSettings;
  onUpdateSettings: (newSettings: Partial<ReelSettings>) => void;
}

export const LightingAndFilterPanel: React.FC<Props> = ({ settings, onUpdateSettings }) => {
  const brightness = settings.brightness ?? 100;
  const contrast = settings.contrast ?? 100;
  const saturation = settings.saturation ?? 100;
  const filterIntensity = settings.filterIntensity ?? 100;
  const fadeEnabled = settings.photoFadeEnabled ?? false;
  const fadeIntensity = settings.photoFadeIntensity ?? 65;
  const fadeDirection = settings.photoFadeDirection ?? 'bottom';
  const blendMode = settings.photoBlendMode ?? 'normal';
  const activeGradientId = settings.backgroundGradient ?? 'sunset-gold';

  const filters: { id: FilterType; label: string; desc: string; sample: string }[] = [
    { id: 'normal', label: 'طبيعي', desc: 'ألوان نقية بدون فلتر', sample: 'bg-zinc-800' },
    { id: 'cinematic-gold', label: 'ذهبي سينمائي', desc: 'دفء عنبري فاخر', sample: 'bg-amber-600/40' },
    { id: 'dark-noir', label: 'دارك فخم', desc: 'أبيض وأسود ملكي عميق', sample: 'bg-zinc-400/30' },
    { id: 'vintage', label: 'نوستالجيا كلاسيك', desc: 'طابع شريط سينما زمان', sample: 'bg-yellow-700/40' },
    { id: 'teal-orange', label: 'تيل & أورانج', desc: 'ألوان هوليوود المتضاربة', sample: 'bg-teal-500/30' },
    { id: 'dreamy-glow', label: 'توهج ناعم', desc: 'إضاءة حالمة وضبابية رقيقة', sample: 'bg-purple-500/30' },
  ];

  const presets = [
    {
      name: 'استوديو درامي',
      icon: '🌟',
      b: 92,
      c: 135,
      s: 110,
      intensity: 100,
      filter: 'cinematic-gold' as FilterType,
    },
    {
      name: 'إضاءة ناعمة وفاتحة',
      icon: '☀️',
      b: 120,
      c: 95,
      s: 105,
      intensity: 75,
      filter: 'dreamy-glow' as FilterType,
    },
    {
      name: 'سينمائي داكن وفخم',
      icon: '🌑',
      b: 80,
      c: 145,
      s: 85,
      intensity: 100,
      filter: 'normal' as FilterType,
    },
    {
      name: 'ألوان حيوية وفاقعة',
      icon: '🎨',
      b: 105,
      c: 120,
      s: 155,
      intensity: 85,
      filter: 'teal-orange' as FilterType,
    },
    {
      name: 'مونوكروم كلاسيك',
      icon: '🎞️',
      b: 95,
      c: 140,
      s: 0,
      intensity: 100,
      filter: 'dark-noir' as FilterType,
    },
  ];

  const fadeDirections: { id: PhotoFadeDirection; label: string; desc: string; icon: string }[] = [
    { id: 'bottom', label: 'تلاشي سفلي', desc: 'اندماج من الأسفل للأعلى', icon: '⬇️' },
    { id: 'dual', label: 'تلاشي مزدوج', desc: 'تلاشي من الأعلى والأسفل', icon: '↕️' },
    { id: 'radial', label: 'تلاشي دائري', desc: 'توهج من المركز نحو الأطراف', icon: '⭕' },
    { id: 'sides', label: 'تلاشي جانبي', desc: 'اندماج ناعم من اليمين واليسار', icon: '↔️' },
  ];

  const blendModes: { id: PhotoBlendMode; label: string; desc: string }[] = [
    { id: 'normal', label: 'عادي (Normal)', desc: 'دمج ناعم قياسي' },
    { id: 'soft-light', label: 'ضوء ناعم (Soft Light)', desc: 'إضاءة سينمائية متداخلة' },
    { id: 'overlay', label: 'تراكب (Overlay)', desc: 'تباين لوني قوي مع الخلفية' },
    { id: 'luminosity', label: 'إضاءة لونية (Luminosity)', desc: 'تطبيق درجات الخلفية على الصورة' },
  ];

  const handleReset = () => {
    onUpdateSettings({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      filterIntensity: 100,
      filter: 'normal',
      photoFadeEnabled: false,
    });
  };

  return (
    <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-5 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              لوحة التحكم بتأثيرات الإضاءة وشدة الفلاتر
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-zinc-400">
              تحكم تفاعلي مباشر في السطوع، التباين، التشبع، وشدة الفلتر على صورتك الأساسية
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs flex items-center gap-1.5 transition-all"
          title="إعادة ضبط كافة الإعدادات إلى 100%"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة ضبط</span>
        </button>
      </div>

      {/* Live Status Badge */}
      <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-zinc-300">
          <Eye className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold">الحالة المباشرة للصورة الأساسية:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-amber-300">
            سطوع {brightness}%
          </span>
          <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-amber-300">
            تباين {contrast}%
          </span>
          <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-amber-300">
            تشبع {saturation}%
          </span>
          <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-amber-300">
            شدة {filterIntensity}%
          </span>
        </div>
      </div>

      {/* Quick Lighting & Filter Presets */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          أنماط إضاءة سينمائية جاهزة بلمسة واحدة:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {presets.map((p) => {
            const isActive =
              brightness === p.b && contrast === p.c && saturation === p.s && settings.filter === p.filter;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    brightness: p.b,
                    contrast: p.c,
                    saturation: p.s,
                    filterIntensity: p.intensity,
                    filter: p.filter,
                  })
                }
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  isActive
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md font-bold'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <span className="text-base">{p.icon}</span>
                <span className="text-[11px] leading-tight">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Sliders Grid */}
      <div className="space-y-4 pt-2">
        {/* 1. Brightness Slider */}
        <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-zinc-200 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>السطوع والإضاءة (Brightness)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-amber-400 font-bold bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                {brightness}%
              </span>
              <button
                type="button"
                onClick={() => onUpdateSettings({ brightness: 100 })}
                className="text-[10px] text-zinc-500 hover:text-zinc-300"
                title="إعادة ضبط السطوع إلى 100%"
              >
                100%
              </button>
            </div>
          </div>
          <input
            type="range"
            min="50"
            max="180"
            step="1"
            value={brightness}
            onChange={(e) => onUpdateSettings({ brightness: parseInt(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>داكن وسينمائي (50%)</span>
            <span>طبيعي (100%)</span>
            <span>مشرق وفاقع (180%)</span>
          </div>
        </div>

        {/* 2. Contrast Slider */}
        <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-zinc-200 flex items-center gap-2">
              <Contrast className="w-4 h-4 text-amber-400" />
              <span>التباين والعمق (Contrast)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-amber-400 font-bold bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                {contrast}%
              </span>
              <button
                type="button"
                onClick={() => onUpdateSettings({ contrast: 100 })}
                className="text-[10px] text-zinc-500 hover:text-zinc-300"
                title="إعادة ضبط التباين إلى 100%"
              >
                100%
              </button>
            </div>
          </div>
          <input
            type="range"
            min="50"
            max="200"
            step="1"
            value={contrast}
            onChange={(e) => onUpdateSettings({ contrast: parseInt(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>ناعم وخافت (50%)</span>
            <span>طبيعي (100%)</span>
            <span>درامي وعميق (200%)</span>
          </div>
        </div>

        {/* 3. Saturation Slider */}
        <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-zinc-200 flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>التشبع اللوني (Saturation)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-amber-400 font-bold bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                {saturation}%
              </span>
              <button
                type="button"
                onClick={() => onUpdateSettings({ saturation: 100 })}
                className="text-[10px] text-zinc-500 hover:text-zinc-300"
                title="إعادة ضبط التشبع إلى 100%"
              >
                100%
              </button>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            step="1"
            value={saturation}
            onChange={(e) => onUpdateSettings({ saturation: parseInt(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>أبيض وأسود نقي (0%)</span>
            <span>طبيعي (100%)</span>
            <span>ألوان حيوية مركزة (200%)</span>
          </div>
        </div>

        {/* 4. Filter Selection & Intensity Slider */}
        <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-zinc-200 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>الفلتر اللوني وشدة التأثير (Filter & Intensity)</span>
            </label>
            <span className="font-mono text-amber-400 font-bold bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
              {filterIntensity}%
            </span>
          </div>

          {/* Filter options buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onUpdateSettings({ filter: f.id })}
                className={`p-2.5 rounded-xl border text-right transition-all flex flex-col gap-0.5 ${
                  settings.filter === f.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">{f.label}</span>
                  <div className={`w-2.5 h-2.5 rounded-full ${f.sample}`} />
                </div>
                <span className="text-[10px] text-zinc-500 font-normal">{f.desc}</span>
              </button>
            ))}
          </div>

          {/* Filter Intensity Slider */}
          {settings.filter !== 'normal' && (
            <div className="pt-2 border-t border-zinc-800/60 space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-300">
                <span>شدة تأثير الفلتر المختار:</span>
                <span className="text-amber-400 font-mono">{filterIntensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={filterIntensity}
                onChange={(e) => onUpdateSettings({ filterIntensity: parseInt(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>تأثير خفيف جداً (0%)</span>
                <span>تأثير متوسط (50%)</span>
                <span>تأثير كامل ومركز (100%)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Photo Fade (تلاشي الصور) Section */}
      <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 p-4 rounded-xl border border-zinc-800/90 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-100">تأثير تلاشي الصور (Photo Fade)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-300">
                  دمج احترافي
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                دمج صورتك الشخصية بسلاسة مع خلفيات ملونة ومتدرجة سينمائية
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => onUpdateSettings({ photoFadeEnabled: !fadeEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              fadeEnabled ? 'bg-amber-500' : 'bg-zinc-800'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                fadeEnabled ? 'translate-x-1' : 'translate-x-6'
              }`}
            />
          </button>
        </div>

        {fadeEnabled && (
          <div className="space-y-4 pt-2 border-t border-zinc-800/80 animate-in fade-in duration-200">
            {/* Fade Direction */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">اتجاه تلاشي الصورة:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {fadeDirections.map((dir) => (
                  <button
                    key={dir.id}
                    type="button"
                    onClick={() => onUpdateSettings({ photoFadeDirection: dir.id })}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      fadeDirection === dir.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-sm">{dir.icon}</span>
                    <span className="text-[11px]">{dir.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fade Intensity Slider */}
            <div className="space-y-1.5 bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
              <div className="flex justify-between text-xs text-zinc-300">
                <span>شدة ونعومة التلاشي (Fade Intensity):</span>
                <span className="text-amber-400 font-mono font-bold">{fadeIntensity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="95"
                step="5"
                value={fadeIntensity}
                onChange={(e) => onUpdateSettings({ photoFadeIntensity: parseInt(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>تلاشي طفيف (20%)</span>
                <span>تلاشي متوازن (65%)</span>
                <span>تلاشي عميق وواسع (95%)</span>
              </div>
            </div>

            {/* Gradient Preset Backgrounds */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">الخلفية المتدرجة للدمج:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GRADIENT_PRESETS.map((g) => {
                  const isSelected = activeGradientId === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => onUpdateSettings({ backgroundGradient: g.id })}
                      className={`p-2 rounded-xl border text-right transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-amber-500 ring-1 ring-amber-500/40 bg-zinc-900 text-amber-300 font-bold'
                          : 'border-zinc-800 bg-zinc-950/80 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-lg border border-white/20 shrink-0 shadow-sm"
                        style={{ background: g.css }}
                      />
                      <span className="text-xs truncate">{g.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Blend Modes */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Blend className="w-3.5 h-3.5 text-amber-400" />
                <span>نمط مزج الألوان (Blend Mode):</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {blendModes.map((bm) => (
                  <button
                    key={bm.id}
                    type="button"
                    onClick={() => onUpdateSettings({ photoBlendMode: bm.id })}
                    className={`p-2 rounded-xl border text-center transition-all text-xs ${
                      blendMode === bm.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {bm.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
