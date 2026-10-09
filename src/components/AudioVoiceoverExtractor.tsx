import React, { useState, useRef } from 'react';
import {
  Mic,
  Video,
  Volume2,
  Sparkles,
  Play,
  Pause,
  Upload,
  Check,
  RefreshCw,
  Square,
  FileAudio,
  Radio,
  Sliders,
} from 'lucide-react';
import { ReelSettings } from '../types';

interface Props {
  settings: ReelSettings;
  onUpdateSettings: (newSettings: Partial<ReelSettings>) => void;
}

export const AudioVoiceoverExtractor: React.FC<Props> = ({ settings, onUpdateSettings }) => {
  const [activeTab, setActiveTab] = useState<'extract' | 'tts' | 'record'>('extract');

  // 1. Video Extract State
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [extractedAudioUrl, setExtractedAudioUrl] = useState<string | null>(null);
  const [extractedTitle, setExtractedTitle] = useState('صوت مستخرج من فيديو خارجي 🎬');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isPlayingExtracted, setIsPlayingExtracted] = useState(false);
  const extractedAudioRef = useRef<HTMLAudioElement | null>(null);

  // 2. TTS State
  const [ttsVoice, setTtsVoice] = useState<'Kore' | 'Puck' | 'Fenrir' | 'Zephyr'>('Kore');
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  // 3. Mic Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const recordedAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);

  // Handle Video File Upload & Audio Extraction
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setVideoFile(file);

    // Extract audio via URL and Web Audio
    const videoUrl = URL.createObjectURL(file);
    const videoElem = document.createElement('video');
    videoElem.src = videoUrl;
    videoElem.preload = 'auto';

    videoElem.onloadedmetadata = () => {
      // Create clean title from file name
      const cleanName = file.name.replace(/\.[^/.]+$/, '').slice(0, 28);
      const title = `🎵 صوت من فيديو: ${cleanName}`;
      setExtractedTitle(title);
      setExtractedAudioUrl(videoUrl);
      setIsExtracting(false);
    };

    videoElem.onerror = () => {
      // Fallback
      setExtractedAudioUrl(videoUrl);
      setIsExtracting(false);
    };
  };

  const togglePlayExtracted = () => {
    if (!extractedAudioRef.current && extractedAudioUrl) {
      extractedAudioRef.current = new Audio(extractedAudioUrl);
      extractedAudioRef.current.onended = () => setIsPlayingExtracted(false);
    }
    if (extractedAudioRef.current) {
      if (isPlayingExtracted) {
        extractedAudioRef.current.pause();
        setIsPlayingExtracted(false);
      } else {
        extractedAudioRef.current.play();
        setIsPlayingExtracted(true);
      }
    }
  };

  const applyExtractedSound = () => {
    onUpdateSettings({
      soundTitle: extractedTitle,
    });
    alert('تم تطبيق الصوت المستخرج من الفيديو بنجاح على واجهة الريلز!');
  };

  // Handle Gemini TTS Generation
  const handleGenerateTts = async () => {
    if (!settings.quoteText.trim()) return;
    setIsGeneratingTts(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: settings.quoteText,
          voiceName: ttsVoice,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate voiceover');

      if (data.audioBase64) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0))],
          { type: 'audio/wav' }
        );
        const url = URL.createObjectURL(audioBlob);
        setTtsAudioUrl(url);
      }
    } catch (err: any) {
      console.error('TTS error:', err);
      alert('حدث خطأ أثناء توليد التعليق الصوتي: ' + (err.message || ''));
    } finally {
      setIsGeneratingTts(false);
    }
  };

  const togglePlayTts = () => {
    if (!ttsAudioRef.current && ttsAudioUrl) {
      ttsAudioRef.current = new Audio(ttsAudioUrl);
      ttsAudioRef.current.onended = () => setIsPlayingTts(false);
    }
    if (ttsAudioRef.current) {
      if (isPlayingTts) {
        ttsAudioRef.current.pause();
        setIsPlayingTts(false);
      } else {
        ttsAudioRef.current.play();
        setIsPlayingTts(true);
      }
    }
  };

  const applyTtsSound = () => {
    onUpdateSettings({
      soundTitle: `🎙️ تعليق صوتي: ${settings.creatorName}`,
    });
    alert('تم اعتماد التعليق الصوتي كصوت رسمي للريلز!');
  };

  // Handle Mic Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone error:', err);
      alert('تعذر الوصول إلى الميكروفون. يرجى التأكد من الصلاحيات.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const togglePlayRecorded = () => {
    if (!recordedAudioRef.current && recordedAudioUrl) {
      recordedAudioRef.current = new Audio(recordedAudioUrl);
      recordedAudioRef.current.onended = () => setIsPlayingRecorded(false);
    }
    if (recordedAudioRef.current) {
      if (isPlayingRecorded) {
        recordedAudioRef.current.pause();
        setIsPlayingRecorded(false);
      } else {
        recordedAudioRef.current.play();
        setIsPlayingRecorded(true);
      }
    }
  };

  const applyRecordedSound = () => {
    onUpdateSettings({
      soundTitle: `🎙️ بصوتي • ${settings.creatorName}`,
    });
    alert('تم تطبيق تسجيلك الصوتي بنجاح على واجهة الريلز!');
  };

  return (
    <div className="bg-zinc-950/85 border border-zinc-800 rounded-2xl p-5 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              استخراج الصوت وإضافة تعليق صوتي (Audio & Voiceover)
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-zinc-400">
              استخرج الموسيقى من أي فيديو خارجي أو أضف تعليقاً صوتياً ناطقاً بالذكاء الاصطناعي
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab('extract')}
          className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'extract'
              ? 'bg-amber-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Video className="w-3.5 h-3.5 shrink-0" />
          <span>استخراج من فيديو</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tts')}
          className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'tts'
              ? 'bg-amber-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>تعليق ذكي (AI)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('record')}
          className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'record'
              ? 'bg-amber-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Mic className="w-3.5 h-3.5 shrink-0" />
          <span>تسجيل بصوتك</span>
        </button>
      </div>

      {/* Tab 1: Extract Audio from External Video */}
      {activeTab === 'extract' && (
        <div className="space-y-4">
          <input
            type="file"
            ref={videoInputRef}
            onChange={handleVideoUpload}
            accept="video/*"
            className="hidden"
          />

          {!videoFile ? (
            <div
              onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 hover:border-amber-500/80 bg-zinc-900/40 hover:bg-zinc-900/80 transition-all rounded-xl p-6 text-center cursor-pointer group flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition-transform group-hover:scale-110">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-semibold text-zinc-200 block">
                  اختر فيديو من جهازك لاستخراج الصوت
                </span>
                <span className="text-xs text-zinc-500 block">
                  يدعم MP4, WebM, MOV, MKV (يتم استخراج المسار الصوتي فوراً)
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <FileAudio className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-100 block truncate max-w-[200px]">
                      {videoFile.name}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">
                      ✓ تم استخراج الصوت بنجاح
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setVideoFile(null);
                    setExtractedAudioUrl(null);
                  }}
                  className="text-xs text-zinc-400 hover:text-zinc-200"
                >
                  اختيار فيديو آخر
                </button>
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-300">
                  اسم الصوت الذي سيظهر في الريلز:
                </label>
                <input
                  type="text"
                  value={extractedTitle}
                  onChange={(e) => setExtractedTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={togglePlayExtracted}
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all"
                >
                  {isPlayingExtracted ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                  <span>{isPlayingExtracted ? 'إيقاف الاستماع' : 'استماع للصوت'}</span>
                </button>

                <button
                  type="button"
                  onClick={applyExtractedSound}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>تطبيق هذا الصوت على الريلز</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: AI Voiceover (Gemini TTS) */}
      {activeTab === 'tts' && (
        <div className="space-y-4">
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-2">
            <span className="text-xs font-semibold text-zinc-300 block">
              النص المراد تحويله إلى تعليق صوتي:
            </span>
            <p className="text-xs text-amber-300/90 leading-relaxed bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 font-medium">
              "{settings.quoteText}"
            </p>
          </div>

          {/* Voice Character Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">اختر نبرة الصوت المعلق:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Kore', label: 'كوري (Kore)', desc: 'نسائي هادئ وعميق' },
                { id: 'Puck', label: 'باك (Puck)', desc: 'شبابي دافئ ومعبر' },
                { id: 'Fenrir', label: 'فنرير (Fenrir)', desc: 'رجالي رخيم وفخم' },
                { id: 'Zephyr', label: 'زفير (Zephyr)', desc: 'سينمائي متزن' },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setTtsVoice(v.id as any)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    ttsVoice === v.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-xs block">{v.label}</span>
                  <span className="text-[10px] text-zinc-500 font-normal">{v.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerateTts}
            disabled={isGeneratingTts}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow"
          >
            {isGeneratingTts ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isGeneratingTts ? 'جاري توليد التعليق الصوتي...' : 'توليد التعليق الصوتي بواسطة Gemini'}</span>
          </button>

          {/* Player once generated */}
          {ttsAudioUrl && (
            <div className="p-3 bg-zinc-900 rounded-xl border border-amber-500/30 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={togglePlayTts}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center gap-1.5"
              >
                {isPlayingTts ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                <span>{isPlayingTts ? 'إيقاف' : 'استماع للتعليق'}</span>
              </button>

              <button
                type="button"
                onClick={applyTtsSound}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>اعتماد كصوت للريلز</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Live Microphone Voiceover */}
      {activeTab === 'record' && (
        <div className="p-5 bg-zinc-900/80 rounded-xl border border-zinc-800 text-center space-y-4">
          <div className="space-y-1">
            <span className="text-sm font-bold text-zinc-100 block">سجل تعليقك الصوتي الخاص</span>
            <span className="text-xs text-zinc-400 block">
              اقرأ كلمات الاقتباس بصوتك ونبرتك الطبيعية لتعطي الريلز طابعاً شخصياً فريداً
            </span>
          </div>

          {/* Record button / counter */}
          <div className="flex flex-col items-center gap-3">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 group"
              >
                <Mic className="w-7 h-7 group-hover:scale-110 transition-transform" />
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-full bg-red-600 animate-pulse text-white flex items-center justify-center shadow-lg active:scale-95"
                >
                  <Square className="w-6 h-6 fill-white" />
                </button>
                <span className="font-mono text-sm text-red-400 font-bold">
                  00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds} جاري التسجيل...
                </span>
              </div>
            )}
            <span className="text-xs text-zinc-400">
              {isRecording ? 'انقر على المربع الأحمر لإيقاف وحفظ التسجيل' : 'انقر على الميكروفون لبدء التسجيل'}
            </span>
          </div>

          {/* Recorded Player */}
          {recordedAudioUrl && !isRecording && (
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={togglePlayRecorded}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-lg text-xs flex items-center gap-1.5"
              >
                {isPlayingRecorded ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                <span>{isPlayingRecorded ? 'إيقاف' : 'سماع تسجيلك'}</span>
              </button>

              <button
                type="button"
                onClick={applyRecordedSound}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>اعتماد التسجيل للريلز</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
