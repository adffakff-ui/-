import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Brain,
  Zap,
  Check,
  Copy,
  ArrowRight,
  Bot,
  User,
  Wand2,
  Trash2,
} from 'lucide-react';
import { ChatMessage, GeminiModelType } from '../types';

interface Props {
  onApplyQuoteToReel: (quote: string) => void;
  userAvatarUrl: string;
}

export const GeminiChatDrawer: React.FC<Props> = ({ onApplyQuoteToReel, userAvatarUrl }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'مرحباً بك! أنا مستشارك الذكي لتصميم ريلز وحالات الفيسبوك والإنستغرام. يمكنني مساعدتك في صياغة خواطر فخمة، تحليل المشهد، كتابة كابشنات تجذب التفاعل، أو تحويل أفكارك إلى اقتباسات جاهزة للتطبيق على تصميمك مباشرة. كيف تود أن نبدأ؟',
      timestamp: 'الآن',
      modelUsed: 'gemini-3.5-flash',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState<GeminiModelType>('gemini-3.5-flash');
  const [highThinking, setHighThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const activeModel = highThinking ? 'gemini-3.1-pro-preview' : selectedModel;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          model: activeModel,
          highThinking,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const botMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.text || 'عذراً، لم أتمكن من استخراج إجابة مناسبة.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.model || activeModel,
        isHighThinking: data.highThinking,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'model',
        text: 'حدث خطأ في الاتصال بنموذج Gemini. يرجى المحاولة مرة أخرى.',
        timestamp: 'الآن',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    'اكتب لي 3 خواطر فخمة وكبرياء تناسب صورتي في الاستوديو مع الدخان',
    'اقترح كابشن فيسبوك تريند وهاشتاغات تزيد المشاهدات والتفاعل',
    'اقترح أسماء مقاطع صوتية أو شيلات هادئة تليق بهذا التصميم',
    'اكتب حكمة قصيرة وعميقة من سطر واحد فقط تناسب الريلز',
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-[650px] shadow-2xl overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                مساعد الريلز ومصمم المحتوى (Gemini)
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-zinc-400">شات ذكي متعدد الجولات لتأليف الكلام وتطوير أفكار الفيديو</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMessages([messages[0]])}
            title="مسح المحادثة"
            className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Model Switcher and High Thinking Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
          {/* Models */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-[11px]">
            <button
              type="button"
              disabled={highThinking}
              onClick={() => setSelectedModel('gemini-3.5-flash')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedModel === 'gemini-3.5-flash' && !highThinking
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              3.5 Flash (عام)
            </button>
            <button
              type="button"
              disabled={highThinking}
              onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedModel === 'gemini-3.1-pro-preview' && !highThinking
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              3.1 Pro (معقد)
            </button>
            <button
              type="button"
              disabled={highThinking}
              onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedModel === 'gemini-3.1-flash-lite' && !highThinking
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              3.1 Lite (سريع)
            </button>
          </div>

          {/* High Thinking Mode Toggle */}
          <button
            type="button"
            onClick={() => setHighThinking(!highThinking)}
            className={`px-3 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
              highThinking
                ? 'bg-purple-600 border-purple-500 text-white shadow-md ring-2 ring-purple-500/30'
                : 'bg-zinc-900 border-zinc-800 text-purple-400 hover:border-purple-600/50'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>تفكير عميق (High Thinking)</span>
          </button>
        </div>
      </div>

      {/* Messages Thread (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className="shrink-0 mt-0.5">
                {isUser ? (
                  <img
                    src={userAvatarUrl}
                    alt="أنت"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400 shadow"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 text-xs leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-amber-500 text-zinc-950 font-medium rounded-tr-none'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Bottom meta & actions */}
                <div
                  className={`flex items-center justify-between pt-1 border-t text-[10px] ${
                    isUser ? 'border-zinc-950/20 text-zinc-900' : 'border-zinc-800/80 text-zinc-500'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{msg.timestamp}</span>
                    {msg.isHighThinking && (
                      <span className="bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded text-[9px] font-bold">
                        تفكير عميق
                      </span>
                    )}
                    {msg.modelUsed && !isUser && (
                      <span className="text-zinc-500 font-mono text-[9px]">{msg.modelUsed}</span>
                    )}
                  </div>

                  {!isUser && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-zinc-200 p-1 transition-colors"
                        title="نسخ النص"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => onApplyQuoteToReel(msg.text)}
                        className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 font-bold rounded transition-colors flex items-center gap-1"
                        title="تطبيق هذا الكلام على تصميم الريلز فوراً"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>تطبيق على الريلز</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 rounded-tl-none flex items-center gap-2 text-xs text-amber-400">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>{highThinking ? 'الذكاء الاصطناعي يفكر بعمق فلسفي...' : 'جاري كتابة الرد...'}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="p-2.5 bg-zinc-950/60 border-t border-zinc-800 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(qp)}
            className="whitespace-nowrap px-2.5 py-1 bg-zinc-900 hover:bg-amber-500/15 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 rounded-lg text-[11px] transition-all shrink-0"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={
            highThinking
              ? 'اطرح سؤالاً معقداً أو اطلب تحليلاً أدبياً (وضع التفكير العالي نشط)...'
              : 'اكتب رسالتك للمساعد الذكي...'
          }
          className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none transition-all"
        />
        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
          className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0 transition-all disabled:opacity-50 active:scale-95 shadow"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
