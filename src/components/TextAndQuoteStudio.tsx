import React, { useState } from 'react';
import { Type, Sparkles, Wand2, RefreshCw, Check, BookOpen, Music, UserCheck, SlidersHorizontal, Palette } from 'lucide-react';
import { ReelSettings, FontFamilyType } from '../types';
import { PRESET_QUOTES } from '../utils/constants';
import { LightingAndFilterPanel } from './LightingAndFilterPanel';

interface Props {
  settings: ReelSettings;
  onUpdateSettings: (newSettings: Partial<ReelSettings>) => void;
}

export const TextAndQuoteStudio: React.FC<Props> = ({ settings, onUpdateSettings }) => {
  const [activeSubTab, setActiveSubTab] = useState<'lighting' | 'typography'>('lighting');
  const [selectedCategory, setSelectedCategory] = useState<string>('هيبة وكبرياء');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiCustomTopic, setAiCustomTopic] = useState('');
  const [generatedAiQuotes, setGeneratedAiQuotes] = useState<string[]>([]);

  const categories = ['هيبة وكبرياء', 'خواطر وعتاب', 'أدعية وطمأنينة', 'نجاح وشغف', 'حب وشعر'];

  const handleGenerateAiQuotes = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          userIdea: aiCustomTopic,
        }),
      });
      const data = await res.json();
      if (data.quotes && Array.isArray(data.quotes)) {
        setGeneratedAiQuotes(data.quotes);
      } else if (data.fallbackQuotes) {
        setGeneratedAiQuotes(data.fallbackQuotes);
      }
    } catch (err) {
      console.error('Failed to generate quotes:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const colors = [
    { label: 'أبيض ناصع', value: '#ffffff' },
    { label: 'ذهبي ملكي', value: '#fbbf24' },
    { label: 'برونزي دافئ', value: '#f97316' },
    { label: 'سماوي هادئ', value: '#38bdf8' },
    { label: 'زمردي راقي', value: '#34d399' },
  ];

  return (
    <div className="space-y-4">
      {/* Sub-tab Navigation */}
      <div className="grid grid-cols-2 gap-2 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 shadow-md">
        <button
          type="button"
          onClick={() => setActiveSubTab('lighting')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'lighting'
              ? 'bg-amber-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 shrink-0" />
          <span>لوحة الإضاءة والفلاتر</span>
          <span className="bg-amber-600/30 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            جديد
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('typography')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'typography'
              ? 'bg-amber-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Type className="w-4 h-4 shrink-0" />
          <span>الكلام والاقتباسات والخطوط</span>
        </button>
      </div>

      {/* Sub-tab 1: Lighting & Filter Control Panel */}
      {activeSubTab === 'lighting' && (
        <LightingAndFilterPanel settings={settings} onUpdateSettings={onUpdateSettings} />
      )}

      {/* Sub-tab 2: Typography & Quotes */}
      {activeSubTab === 'typography' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-800/80">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">الكلام والاقتباسات وتنسيق النصوص</h2>
              <p className="text-xs text-zinc-400">تحكم بكلمات الريلز، الخط العربي، الألوان، واسم صاحب الحساب</p>
            </div>
          </div>

      {/* Main Quote Input */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold text-zinc-300">الكلام المكتوب على الريلز (نص التصميم):</label>
          <span className="text-zinc-500">{settings.quoteText.length} حرف</span>
        </div>
        <textarea
          rows={3}
          value={settings.quoteText}
          onChange={(e) => onUpdateSettings({ quoteText: e.target.value })}
          placeholder="اكتب الكلام أو الاقتباس هنا..."
          className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-sm text-zinc-100 leading-relaxed outline-none transition-all resize-none shadow-inner"
        />
      </div>

      {/* AI Quote Generator Widget */}
      <div className="bg-gradient-to-r from-amber-500/10 via-zinc-950 to-zinc-950 p-4 rounded-xl border border-amber-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>توليد كلام واقتباسات بالذكاء الاصطناعي (Gemini)</span>
          </div>
          <button
            type="button"
            onClick={handleGenerateAiQuotes}
            disabled={isGeneratingAI}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all disabled:opacity-60 shadow"
          >
            {isGeneratingAI ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            {isGeneratingAI ? 'جاري الصياغة...' : 'توليد عبارات فخمة'}
          </button>
        </div>

        <input
          type="text"
          value={aiCustomTopic}
          onChange={(e) => setAiCustomTopic(e.target.value)}
          placeholder="أدخل فكرة محددة (اختياري: مثلاً: عن الصبر، أو النجاح بعد تعب...)"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500"
        />

        {/* Generated quotes list */}
        {generatedAiQuotes.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-zinc-800/60">
            <span className="text-[11px] text-zinc-400 block">انقر على أي عبارة لتطبيقها فوراً على التصميم:</span>
            <div className="grid grid-cols-1 gap-1.5">
              {generatedAiQuotes.map((q, idx) => (
                <div
                  key={idx}
                  onClick={() => onUpdateSettings({ quoteText: q })}
                  className="p-2.5 bg-zinc-900/80 hover:bg-amber-500/15 border border-zinc-800 hover:border-amber-500/50 rounded-lg text-xs text-zinc-200 cursor-pointer flex items-center justify-between transition-all group"
                >
                  <span className="leading-snug">{q}</span>
                  <span className="text-[10px] text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    تطبيق ↗
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preset Viral Quotes Categories */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-400" />
            اقتباسات تريند فيسبوك الجاهزة:
          </span>
        </div>

        {/* Categories chips */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quotes list for selected category */}
        <div className="space-y-2">
          {PRESET_QUOTES.filter((item) => item.category === selectedCategory).map((item, idx) => (
            <div
              key={idx}
              onClick={() => onUpdateSettings({ quoteText: item.quote })}
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                settings.quoteText === item.quote
                  ? 'bg-amber-500/15 border-amber-500 text-amber-200 font-semibold ring-1 ring-amber-500/30'
                  : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-950'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="leading-relaxed">{item.quote}</span>
                <span className="text-[10px] text-zinc-500">{item.authorOrVibe}</span>
              </div>
              {settings.quoteText === item.quote && <Check className="w-4 h-4 text-amber-400 shrink-0 mr-2" />}
            </div>
          ))}
        </div>
      </div>

      {/* Typography and Styling Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-800">
        {/* Font Family */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300">نوع الخط العربي:</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cairo', label: 'كايرو عصري', class: 'font-cairo' },
              { id: 'amiri', label: 'أميري كلاسيك', class: 'font-amiri' },
              { id: 'tajawal', label: 'تجوال هادئ', class: 'font-tajawal' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onUpdateSettings({ fontFamily: f.id as FontFamilyType })}
                className={`py-2 px-1 text-xs rounded-lg border text-center transition-all ${f.class} ${
                  settings.fontFamily === f.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Color */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300">لون النص:</label>
          <div className="flex items-center gap-2">
            {colors.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => onUpdateSettings({ textColor: c.value })}
                title={c.label}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                  settings.textColor === c.value ? 'scale-110 border-white shadow-md' : 'border-zinc-700 hover:scale-105'
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
            {/* Glow toggle */}
            <button
              type="button"
              onClick={() => onUpdateSettings({ glowEffect: !settings.glowEffect })}
              className={`mr-auto px-2.5 py-1 text-[11px] rounded-lg border transition-all ${
                settings.glowEffect
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              ✨ توهج ذهبي
            </button>
          </div>
        </div>

        {/* Font size */}
        <div className="space-y-1.5 sm:col-span-2">
          <div className="flex justify-between text-xs text-zinc-300">
            <span>حجم الخط:</span>
            <span className="text-amber-400 font-mono">{settings.fontSize}px</span>
          </div>
          <input
            type="range"
            min="16"
            max="36"
            step="1"
            value={settings.fontSize}
            onChange={(e) => onUpdateSettings({ fontSize: parseInt(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Text Animation Selection Section */}
      <div className="space-y-3 pt-3 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>حركة النص ومؤثرات الظهور (Text Animation):</span>
          </label>
          <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
            ميزة تفاعلية جديدة
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { id: 'fade-in', label: 'ظهور تدريجي', desc: 'تلاشي سينمائي ناعم', icon: '✨' },
            { id: 'shake', label: 'اهتزاز حماسي', desc: 'حركة كينتيك وتردد قوي', icon: '⚡' },
            { id: 'pulse', label: 'نبض وتوهج', desc: 'تضخيم ونور ذهبي دوري', icon: '💫' },
            { id: 'slide-up', label: 'صعود لأعلى', desc: 'ارتقاء انسيابي من الأسفل', icon: '⬆️' },
            { id: 'bounce', label: 'قفزة إيقاعية', desc: 'ارتداد متناغم مع الصوت', icon: '🤾' },
            { id: 'none', label: 'ثابت', desc: 'نص هادئ بدون حركة', icon: '⏹️' },
          ].map((anim) => {
            const isSelected = settings.textAnimation === anim.id;
            return (
              <button
                key={anim.id}
                type="button"
                onClick={() => onUpdateSettings({ textAnimation: anim.id as any })}
                className={`p-2.5 rounded-xl border text-right transition-all flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md ring-1 ring-amber-500/30'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{anim.icon}</span>
                  <span className="text-xs font-semibold">{anim.label}</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-normal">{anim.desc}</span>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
          💡 يتم تطبيق تأثير الحركة المختار مباشرة فوق معاينة الريلز، ويُحفظ التأثير الحركي عند تصدير الفيديو والصورة.
        </p>
      </div>

      {/* Account Info: Creator name & Audio Title */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-800">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            اسم الحساب المعروض:
          </label>
          <input
            type="text"
            value={settings.creatorName}
            onChange={(e) => onUpdateSettings({ creatorName: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-amber-400" />
            عنوان الصوت / الأغنية:
          </label>
          <input
            type="text"
            value={settings.soundTitle}
            onChange={(e) => onUpdateSettings({ soundTitle: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500"
          />
        </div>
      </div>
        </div>
      )}
    </div>
  );
};
