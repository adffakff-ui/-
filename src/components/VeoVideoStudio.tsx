import React, { useState, useEffect } from 'react';
import { Film, Video, Sparkles, RefreshCw, Play, Download, CheckCircle2, AlertCircle, Clock, Music, Mic } from 'lucide-react';
import { AspectRatioType, ReelSettings } from '../types';
import { MusicLibraryPicker } from './MusicLibraryPicker';
import { AudioVoiceoverExtractor } from './AudioVoiceoverExtractor';

interface Props {
  currentPhotoUrl: string;
  onVideoGenerated: (videoUrl: string | null) => void;
  activeVideoUrl: string | null;
  settings: ReelSettings;
  onUpdateSettings: (newSettings: Partial<ReelSettings>) => void;
}

export const VeoVideoStudio: React.FC<Props> = ({
  currentPhotoUrl,
  onVideoGenerated,
  activeVideoUrl,
  settings,
  onUpdateSettings,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'video' | 'music' | 'voice'>('video');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');
  const [prompt, setPrompt] = useState(
    'Cinematic slow motion portrait with soft natural movement, subtle wind moving hair and smoke, dramatic moody studio rim lighting, 4k social media reel'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [operationName, setOperationName] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const presets = [
    {
      title: 'حركة سينمائية واستوديو دخاني',
      prompt:
        'A cinematic atmospheric slow push-in shot of the subject sitting in studio with swirling white smoke, soft volumetric rim lighting, subtle eye movement, 4k film aesthetic',
    },
    {
      title: 'إضاءة شمس ذهبية وهواء هادئ',
      prompt:
        'Slow cinematic camera zoom with warm golden hour sunlight, soft breeze gently moving hair and clothing, high quality shallow depth of field',
    },
    {
      title: 'غموض ونوستالجيا ليلية',
      prompt:
        'Moody dramatic slow motion shot with neon reflections and gentle ambient haze, deep contrast, cinematic shutter angle',
    },
  ];

  const progressSteps = [
    'جاري فحص ملامح الصورة وزوايا الإضاءة...',
    'محرك Veo (veo-3.1-fast-generate-preview) يُنشئ الحركة السينمائية...',
    'معالجة الدخان والظلال والعمق الحركي...',
    'اللمسات الأخيرة وتجهيز ملف الفيديو MP4...',
  ];

  useEffect(() => {
    let interval: any = null;
    if (isGenerating) {
      interval = setInterval(() => {
        setProgressStep((prev) => (prev + 1) % progressSteps.length);
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Poll video status
  useEffect(() => {
    let timer: any = null;
    if (isGenerating && operationName) {
      const poll = async () => {
        try {
          const res = await fetch('/api/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName }),
          });
          const data = await res.json();

          if (data.done) {
            if (data.error) {
              setErrorMessage(data.error.message || 'حدث خطأ أثناء توليد الفيديو.');
              setIsGenerating(false);
            } else {
              // Fetch video download
              setStatusMessage('جاري تنزيل ملف الفيديو المعالج...');
              const downloadRes = await fetch('/api/video-download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operationName }),
              });
              if (downloadRes.ok) {
                const blob = await downloadRes.blob();
                const url = URL.createObjectURL(blob);
                onVideoGenerated(url);
                setIsGenerating(false);
                setStatusMessage('اكتمل توليد الفيديو بنجاح!');
              } else {
                throw new Error('فشل تنزيل ملف الفيديو من السيرفر');
              }
            }
          } else {
            timer = setTimeout(poll, 5000);
          }
        } catch (err: any) {
          console.error('Polling error:', err);
          // If error occurs, keep polling once more or inform
          timer = setTimeout(poll, 6000);
        }
      };

      timer = setTimeout(poll, 5000);
    }
    return () => clearTimeout(timer);
  }, [isGenerating, operationName]);

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setStatusMessage('جاري إرسال الصورة إلى نموذج Veo...');
    setProgressStep(0);

    try {
      // If photo is a data URL, send it directly, or convert to base64
      let imageBase64 = currentPhotoUrl;
      let mimeType = 'image/jpeg';

      if (currentPhotoUrl.startsWith('data:')) {
        const matches = currentPhotoUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          imageBase64 = matches[2];
        }
      } else {
        // Fetch image as blob and convert to base64
        const imgBlob = await fetch(currentPhotoUrl).then((r) => r.blob());
        mimeType = imgBlob.type || 'image/jpeg';
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.replace(/^data:image\/[a-z]+;base64,/, ''));
          };
          reader.onerror = reject;
          reader.readAsDataURL(imgBlob);
        });
      }

      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          prompt,
          aspectRatio: aspectRatio === '16:9' ? '16:9' : '9:16',
        }),
      });

      const data = await res.json();
      if (data.operationName) {
        setOperationName(data.operationName);
        setStatusMessage('بدأ توليد الفيديو، جاري المعالجة...');
      } else {
        throw new Error(data.error || 'تعذر بدء عملية توليد الفيديو');
      }
    } catch (err: any) {
      console.error('Generate video error:', err);
      setErrorMessage(err.message || 'فشل الاتصال بخدمة Veo لتوليد الفيديو.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-tab Navigation */}
      <div className="grid grid-cols-3 gap-2 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 shadow-md">
        <button
          type="button"
          onClick={() => setActiveSubTab('video')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'video'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Film className="w-4 h-4 shrink-0" />
          <span>تحريك بـ Veo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('music')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'music'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Music className="w-4 h-4 shrink-0" />
          <span>مكتبة الموسيقى</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('voice')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'voice'
              ? 'bg-amber-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/60'
          }`}
        >
          <Mic className="w-4 h-4 shrink-0" />
          <span>استخراج وتعليق صوتي</span>
        </button>
      </div>

      {/* Sub-tab 1: Music Library Picker */}
      {activeSubTab === 'music' && (
        <MusicLibraryPicker settings={settings} onUpdateSettings={onUpdateSettings} />
      )}

      {/* Sub-tab 2: Voiceover & Audio Extractor */}
      {activeSubTab === 'voice' && (
        <AudioVoiceoverExtractor settings={settings} onUpdateSettings={onUpdateSettings} />
      )}

      {/* Sub-tab 2: Veo Video Settings */}
      {activeSubTab === 'video' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-100">تحويل صورتك إلى فيديو (Veo AI)</h2>
                <p className="text-xs text-zinc-400">نموذج veo-3.1-fast-generate-preview لتحريك صورتك الشخصية بأسلوب سينمائي</p>
              </div>
            </div>

            {/* Quick Music pill to jump to music library */}
            <button
              type="button"
              onClick={() => setActiveSubTab('music')}
              className="px-2.5 py-1.5 bg-zinc-950 hover:bg-purple-950/40 border border-zinc-800 hover:border-purple-500/50 rounded-xl text-xs text-purple-300 flex items-center gap-1.5 transition-all"
              title="تغيير الخلفية الموسيقية"
            >
              <Music className="w-3.5 h-3.5 text-purple-400" />
              <span className="truncate max-w-[120px]">{settings.soundTitle}</span>
            </button>
          </div>

          {/* Starting Image Preview */}
          <div className="flex items-center gap-4 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-700 bg-black">
              <img src={currentPhotoUrl} alt="صورة البداية" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="text-xs space-y-1">
              <span className="font-bold text-zinc-200 block">الصورة الحالية المراد تحريكها</span>
              <span className="text-zinc-500 block">
                سيقوم نموذج Veo بتحريك الملامح والخلفية والدخان بشكل انسيابي وطبيعي مع الحفاظ على ملامحك.
              </span>
            </div>
          </div>

          {/* Music Quick Banner inside Video Settings */}
          <div
            onClick={() => setActiveSubTab('music')}
            className="p-3 bg-gradient-to-r from-purple-950/40 via-zinc-950 to-zinc-950 rounded-xl border border-purple-500/30 flex items-center justify-between cursor-pointer hover:border-purple-500/60 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Music className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-zinc-200 block">الخلفية الموسيقية المعتمدة للريلز:</span>
                <span className="text-purple-300 font-medium">{settings.soundTitle}</span>
              </div>
            </div>
            <span className="text-xs text-purple-400 font-bold group-hover:underline flex items-center gap-1">
              <span>تغيير المقطع</span>
              <span>←</span>
            </span>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">أبعاد الفيديو المطلوبة:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  aspectRatio === '9:16'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-sm'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>📱 9:16 (ريلز وستوري عمودي)</span>
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  aspectRatio === '16:9'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-sm'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>🖥️ 16:9 (عريض سينمائي)</span>
              </button>
            </div>
          </div>

          {/* Cinematic Prompt Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">أنماط الحركة المقترحة:</label>
            <div className="grid grid-cols-1 gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(preset.prompt)}
                  className="text-right p-2.5 bg-zinc-950/70 hover:bg-purple-500/10 border border-zinc-800/80 hover:border-purple-500/40 rounded-xl text-xs text-zinc-300 transition-all flex items-center justify-between group"
                >
                  <span>{preset.title}</span>
                  <span className="text-[10px] text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    اختيار
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">وصف الحركة (Prompt):</label>
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-xs text-zinc-200 outline-none transition-all resize-none shadow-inner"
            />
          </div>

          {/* Error state */}
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Active Video Player if generated */}
          {activeVideoUrl && !isGenerating && (
            <div className="p-4 bg-zinc-950 rounded-xl border border-purple-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  تم تجهيز الفيديو بنجاح!
                </span>
                <a
                  href={activeVideoUrl}
                  download="my-animated-reel.mp4"
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  تحميل MP4
                </a>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-black aspect-video max-h-48 mx-auto">
                <video src={activeVideoUrl} controls autoPlay loop className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* Generation Loading State */}
          {isGenerating ? (
            <div className="p-5 bg-gradient-to-br from-purple-950/30 to-zinc-950 rounded-xl border border-purple-500/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-purple-200">الذكاء الاصطناعي Veo يعمل على تحريك صورتك...</h4>
                <p className="text-xs text-zinc-400">{progressSteps[progressStep]}</p>
              </div>
              <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-500">
                <Clock className="w-3.5 h-3.5" />
                <span>تستغرق العملية عادة من دقيقة إلى دقيقتين لتقديم أعلى جودة سينمائية.</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartGeneration}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4" />
              توليد الفيديو السينمائي بواسطة Veo AI
            </button>
          )}
        </div>
      )}
    </div>
  );
};
