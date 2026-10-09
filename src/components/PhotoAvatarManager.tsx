import React, { useRef, useState } from 'react';
import { Upload, Camera, Image as ImageIcon, Sparkles, Sliders, CheckCircle2, User, RefreshCw } from 'lucide-react';
import { ReelSettings, FilterType } from '../types';
import { PRESET_PHOTOS } from '../utils/constants';

interface Props {
  settings: ReelSettings;
  onUpdateSettings: (newSettings: Partial<ReelSettings>) => void;
  onClose?: () => void;
}

export const PhotoAvatarManager: React.FC<Props> = ({ settings, onUpdateSettings, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'adjust'>('upload');
  const [applyAs, setApplyAs] = useState<'both' | 'photo' | 'avatar'>('both');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        if (applyAs === 'both') {
          onUpdateSettings({ mainPhotoUrl: result, avatarUrl: result });
        } else if (applyAs === 'photo') {
          onUpdateSettings({ mainPhotoUrl: result });
        } else {
          onUpdateSettings({ avatarUrl: result });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      alert('تعذر فتح الكاميرا، يرجى التحقق من الصلاحيات أو رفع صورة من جهازك.');
      setCameraActive(false);
    }
  };

  const captureCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      if (applyAs === 'both') {
        onUpdateSettings({ mainPhotoUrl: dataUrl, avatarUrl: dataUrl });
      } else if (applyAs === 'photo') {
        onUpdateSettings({ mainPhotoUrl: dataUrl });
      } else {
        onUpdateSettings({ avatarUrl: dataUrl });
      }
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const filters: { id: FilterType; label: string; class: string }[] = [
    { id: 'normal', label: 'طبيعي', class: '' },
    { id: 'cinematic-gold', label: 'ذهبي سينمائي', class: 'sepia contrast-110' },
    { id: 'dark-noir', label: 'دارك فخم / أبيض وأسود', class: 'grayscale contrast-125 brightness-90' },
    { id: 'vintage', label: 'نوستالجيا كلاسيك', class: 'sepia-50 hue-rotate-[-10deg]' },
    { id: 'teal-orange', label: 'تيل & أورانج تريند', class: 'contrast-125 saturate-125' },
    { id: 'dreamy-glow', label: 'توهج ناعم', class: 'brightness-110 contrast-95' },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100">تبديل صورتي والأفاتار الشخصي</h2>
            <p className="text-xs text-zinc-400">نفس تصميم الريلز والكلام مع وضع صورتك الشخصية بدلاً من الصورة الافتراضية</p>
          </div>
        </div>

        {/* Current Avatar live pill */}
        <div className="flex items-center gap-2 bg-zinc-800/60 px-3 py-1.5 rounded-full border border-zinc-700/50">
          <img
            src={settings.avatarUrl}
            alt="الأفاتار الحالي"
            className="w-7 h-7 rounded-full object-cover border border-amber-500"
          />
          <span className="text-xs text-amber-300 font-medium">أفاتار الحساب النشط</span>
        </div>
      </div>

      {/* Target Application mode selector */}
      <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 space-y-2">
        <span className="text-xs font-semibold text-zinc-300 block">عند اختيار صورة جديدة، أين تريد تطبيقها؟</span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setApplyAs('both')}
            className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all text-center ${
              applyAs === 'both'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            كلاهما (الصورة + الأفاتار)
          </button>
          <button
            type="button"
            onClick={() => setApplyAs('photo')}
            className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all text-center ${
              applyAs === 'photo'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            صورة الريلز الرئيسية فقط
          </button>
          <button
            type="button"
            onClick={() => setApplyAs('avatar')}
            className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all text-center ${
              applyAs === 'avatar'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            أفاتار الحساب والبروفايل فقط
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-zinc-800 text-xs font-semibold">
        <button
          onClick={() => {
            stopCamera();
            setActiveTab('upload');
          }}
          className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'upload'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          رفع صورتي / سيلفي
        </button>
        <button
          onClick={() => {
            stopCamera();
            setActiveTab('presets');
          }}
          className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'presets'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          نماذج فخمة جاهزة
        </button>
        <button
          onClick={() => {
            stopCamera();
            setActiveTab('adjust');
          }}
          className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'adjust'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          الفلاتر والزوم
        </button>
      </div>

      {/* Tab 1: Upload & Camera */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {!cameraActive ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* File upload box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-700 hover:border-amber-500/80 bg-zinc-950/40 hover:bg-zinc-950/80 transition-all rounded-xl p-6 text-center cursor-pointer group flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-zinc-200 block">اختر صورتك من الجهاز</span>
                  <span className="text-xs text-zinc-500">JPG, PNG, WebP (أي حجم وجودة)</span>
                </div>
              </div>

              {/* Camera selfie box */}
              <div
                onClick={startCamera}
                className="border-2 border-dashed border-zinc-700 hover:border-amber-500/80 bg-zinc-950/40 hover:bg-zinc-950/80 transition-all rounded-xl p-6 text-center cursor-pointer group flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-800 group-hover:bg-amber-500/20 text-zinc-300 group-hover:text-amber-400 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-zinc-200 block">التقط صورة سيلفي مباشرة</span>
                  <span className="text-xs text-zinc-500">باستخدام كاميرا الهاتف أو اللابتوب</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 space-y-3 text-center">
              <div className="relative mx-auto max-w-sm rounded-lg overflow-hidden border border-zinc-700 bg-black aspect-[3/4]">
                <video ref={videoRef} className="w-full h-full object-cover -scale-x-100" />
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={captureCamera}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  التقاط وتطبيق صورتي
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl text-xs"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* Quick tips */}
          <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/80 flex items-start gap-2.5 text-xs text-zinc-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              نصيحة لتصميم ريلز فخم: اختر صورة بورتريه شخصية واضحة الملامح بنظرة عميقة أو جانبية لتبدو مثل ريلز المشاهير على فيسبوك وتيك توك.
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Curated Presets */}
      {activeTab === 'presets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PRESET_PHOTOS.map((preset) => {
              const isSelected = settings.mainPhotoUrl === preset.url;
              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    if (applyAs === 'both') {
                      onUpdateSettings({ mainPhotoUrl: preset.url, avatarUrl: preset.url });
                    } else if (applyAs === 'photo') {
                      onUpdateSettings({ mainPhotoUrl: preset.url });
                    } else {
                      onUpdateSettings({ avatarUrl: preset.url });
                    }
                  }}
                  className={`group relative rounded-xl overflow-hidden cursor-pointer border transition-all ${
                    isSelected ? 'border-amber-500 ring-2 ring-amber-500/40 scale-[1.02]' : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="aspect-[3/4] w-full bg-zinc-950">
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                    <span className="text-xs font-bold text-white leading-tight">{preset.title}</span>
                    <span className="text-[10px] text-amber-300 font-medium">{preset.tag}</span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow">
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Adjustments & Filters */}
      {activeTab === 'adjust' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">فلتر الصورة السينمائي:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onUpdateSettings({ filter: f.id })}
                  className={`py-2 px-2.5 text-xs rounded-lg border text-center transition-all ${
                    settings.filter === f.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-zinc-300">
              <span>تقريب الصورة (Zoom):</span>
              <span className="text-amber-400 font-mono">{Math.round(settings.zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.0"
              step="0.05"
              value={settings.zoom}
              onChange={(e) => onUpdateSettings({ zoom: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Pan Y slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-zinc-300">
              <span>إزاحة عمودية (محاذاة الرأس):</span>
              <span className="text-amber-400 font-mono">{settings.panY}px</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              step="5"
              value={settings.panY}
              onChange={(e) => onUpdateSettings({ panY: parseInt(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Reset button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => onUpdateSettings({ zoom: 1, panY: 0, filter: 'normal' })}
              className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              إعادة ضبط المقاسات الافتراضية
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
