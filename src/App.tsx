import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  User,
  Type,
  Film,
  MessageSquare,
  Share2,
  Check,
  Camera,
  Play,
  RotateCcw,
  Palette,
} from 'lucide-react';
import { ReelSettings } from './types';
import { USER_CUSTOM_PHOTO_URL, PRESET_QUOTES } from './utils/constants';
import { ReelPreview } from './components/ReelPreview';
import { PhotoAvatarManager } from './components/PhotoAvatarManager';
import { TextAndQuoteStudio } from './components/TextAndQuoteStudio';
import { VeoVideoStudio } from './components/VeoVideoStudio';
import { GeminiChatDrawer } from './components/GeminiChatDrawer';
import { exportReelAsImage, exportReelAsVideo } from './utils/canvasExport';

export default function App() {
  // Initialize with the user's uploaded portrait photo and avatar
  const [settings, setSettings] = useState<ReelSettings>({
    quoteText: 'ما دمتَ تمشي مستقيماً فلا تبالِ بالعقول المائلة.. عش كما تحب واصنع مجدك بنفسك.',
    creatorName: 'أنا وحكايتي',
    creatorHandle: '@my_story',
    avatarUrl: USER_CUSTOM_PHOTO_URL,
    mainPhotoUrl: USER_CUSTOM_PHOTO_URL,
    aspectRatio: '9:16',
    filter: 'normal',
    fontFamily: 'cairo',
    textColor: '#ffffff',
    fontSize: 22,
    showEqualizer: true,
    soundTitle: 'صوت أصلي • ريمكس هادئ 🎵',
    likesCount: '142.8K',
    commentsCount: '3,210',
    sharesCount: '18.4K',
    vignette: 60,
    zoom: 1,
    panY: 0,
    glowEffect: true,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    filterIntensity: 100,
    textAnimation: 'fade-in',
    animationSpeed: 1.2,
    photoFadeEnabled: false,
    photoFadeDirection: 'bottom',
    photoFadeIntensity: 65,
    photoBlendMode: 'normal',
    backgroundGradient: 'sunset-gold',
  });

  const [activeTab, setActiveTab] = useState<'photo' | 'text' | 'video' | 'chat'>('photo');
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [videoExportProgress, setVideoExportProgress] = useState(0);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  const handleUpdateSettings = (newSettings: Partial<ReelSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportReelAsImage(settings);
      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 3500);
    } catch (err) {
      console.error('Export error:', err);
      alert('حدث خطأ أثناء تصدير الصورة، يرجى المحاولة مجدداً.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportVideo = async () => {
    setIsExportingVideo(true);
    setVideoExportProgress(0);
    try {
      await exportReelAsVideo(settings, (pct) => setVideoExportProgress(pct));
      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 3500);
    } catch (err) {
      console.error('Video export error:', err);
      alert('حدث خطأ أثناء تصدير الفيديو المتحرك، يرجى المحاولة مجدداً.');
    } finally {
      setIsExportingVideo(false);
    }
  };

  const handleApplyQuote = (quote: string) => {
    // If the quote has multiple lines or quotes, take the cleanest string
    const cleaned = quote.replace(/^["'«“]/, '').replace(/["'»”]$/, '').trim();
    handleUpdateSettings({ quoteText: cleaned });
    setActiveTab('text');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-cairo">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Sparkles className="w-5 h-5 fill-zinc-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  ستوديو ريلز وحالات
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-400">
                  Veo & Gemini AI
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                تصميم احترافي وتبديل صورتك الشخصية والأفاتار بلمسة واحدة
              </p>
            </div>
          </div>

          {/* Right Header: User Avatar & Export Button */}
          <div className="flex items-center gap-3">
            {/* User Avatar Badge (Replaces default generic icon) */}
            <div
              onClick={() => setActiveTab('photo')}
              className="flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800/80 px-3 py-1.5 rounded-full border border-zinc-700/60 hover:border-amber-500/80 cursor-pointer transition-all shadow group"
              title="انقر لتعديل صورتك الشخصية أو الأفاتار"
            >
              <div className="relative">
                <img
                  src={settings.avatarUrl}
                  alt="صورتك الشخصية (الأفاتار)"
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-amber-500 group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-black" />
              </div>
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-xs font-bold text-zinc-200 group-hover:text-amber-300 transition-colors">
                  صورتي الشخصية
                </span>
                <span className="text-[10px] text-zinc-500">تم التعيين كأفاتار</span>
              </div>
            </div>

            {/* Export Animated Video Clip Button */}
            <button
              type="button"
              onClick={handleExportVideo}
              disabled={isExportingVideo}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-lg transition-all active:scale-95 disabled:opacity-60"
              title="تصدير فيديو متحرك للريلز مع حركة النص والمؤثرات"
            >
              <Film className="w-4 h-4 stroke-[2.5]" />
              <span>
                {isExportingVideo ? `جاري المعالجة ${videoExportProgress}%` : 'تصدير فيديو متحرك'}
              </span>
            </button>

            {/* Export High-Res Image Button */}
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-lg transition-all active:scale-95 disabled:opacity-60"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isExporting ? 'جاري الحفظ...' : 'حفظ الصورة (PNG)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Export Success Notification Toast */}
      {showExportSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-zinc-950 px-5 py-2.5 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>تم تحميل صورة الريلز بدقة عالية (1080×1920) بنجاح إلى جهازك!</span>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Reel Preview Canvas (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full sticky top-24 space-y-4">
            <ReelPreview
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onOpenAvatarModal={() => setActiveTab('photo')}
              videoUrl={activeVideoUrl}
            />

            {/* Video Active Reset Banner */}
            {activeVideoUrl && (
              <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-500/40 flex items-center justify-between text-xs text-purple-300">
                <span>يتم الآن عرض فيديو Veo المتحرك داخل الريلز</span>
                <button
                  type="button"
                  onClick={() => setActiveVideoUrl(null)}
                  className="px-2.5 py-1 bg-purple-900/60 hover:bg-purple-800 rounded-lg text-white font-semibold transition-colors"
                >
                  الرجوع للصورة الثابتة
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customization Tabs and Tool Panels (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 shadow-lg">
            <button
              type="button"
              onClick={() => setActiveTab('photo')}
              className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
                activeTab === 'photo'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>صورتي والأفاتار</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
                activeTab === 'text'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Palette className="w-4 h-4 shrink-0" />
              <span>التصميم والفلاتر</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
                activeTab === 'video'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Film className="w-4 h-4 shrink-0" />
              <span>الفيديو والموسيقى</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
                activeTab === 'chat'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>مساعد Gemini</span>
            </button>
          </div>

          {/* Active Tab Content View */}
          <div>
            {activeTab === 'photo' && (
              <PhotoAvatarManager
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
              />
            )}

            {activeTab === 'text' && (
              <TextAndQuoteStudio
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
              />
            )}

            {activeTab === 'video' && (
              <VeoVideoStudio
                currentPhotoUrl={settings.mainPhotoUrl}
                onVideoGenerated={(url) => setActiveVideoUrl(url)}
                activeVideoUrl={activeVideoUrl}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
              />
            )}

            {activeTab === 'chat' && (
              <GeminiChatDrawer
                onApplyQuoteToReel={handleApplyQuote}
                userAvatarUrl={settings.avatarUrl}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 px-4 py-4 text-center text-xs text-zinc-500">
        <p>صانع ريلز وتصميم الحالات الشخصية • مدعوم بتقنيات Google Gemini و Veo Video AI</p>
      </footer>
    </div>
  );
}
