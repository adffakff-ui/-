import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, GenerateVideosOperation } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. Multi-turn Chat Endpoint with Gemini models and optional High Thinking
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model = 'gemini-3.5-flash', highThinking = false } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const ai = getGeminiClient();

    // Model selection based on requirements:
    // - High thinking MUST use gemini-3.1-pro-preview with thinkingLevel HIGH and no maxOutputTokens
    // - gemini-3.1-pro-preview for complex tasks
    // - gemini-3.5-flash for general tasks
    // - gemini-3.1-flash-lite for fast tasks
    let selectedModel = model;
    if (highThinking) {
      selectedModel = 'gemini-3.1-pro-preview';
    } else if (
      model !== 'gemini-3.1-pro-preview' &&
      model !== 'gemini-3.5-flash' &&
      model !== 'gemini-3.1-flash-lite'
    ) {
      selectedModel = 'gemini-3.5-flash';
    }

    const systemInstruction = `أنت المستشار الإبداعي والكاتب الأدبي ومصمم الريلز المحترف لتطبيقات فيسبوك وإنستغرام وتيك توك وواتساب.
دورك:
1. مساعدة المستخدم في كتابة أروع الكلمات والخواطر الفخمة والاقتباسات السينمائية والشعرية التي تُكتب على الصور والريلز.
2. اقتراح عناوين، صوتيات، وتنسيقات مناسبة لصورة المستخدم وحالته المزاجية.
3. التحدث بلغة عربية راقية وجميلة، والحرص دائماً على تقديم نصوص جاهزة للنسخ أو التطبيق المباشر داخل التصميم.
4. إذا طلب المستخدم اقتباسات، قدم له خيارات مرقمة واضحة وموجزة ومؤثرة.`;

    const contents = messages.map((m: { role: string; content?: string; text?: string; parts?: any[] }) => {
      const text = m.content || m.text || (m.parts && m.parts[0]?.text) || '';
      return {
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text }],
      };
    });

    const config: any = {
      systemInstruction,
    };

    if (highThinking) {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
      // Do NOT set maxOutputTokens when high thinking is enabled!
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config,
    });

    res.json({
      text: response.text || '',
      model: selectedModel,
      highThinking: !!highThinking,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate chat response',
    });
  }
});

// 2. Smart Quote Generator for Reels and Statuses
app.post('/api/generate-quote', async (req, res) => {
  try {
    const { category = 'wisdom', mood = 'luxury', userIdea = '' } = req.body;
    const ai = getGeminiClient();

    const prompt = `اكتب 4 اقتباسات وعبارات عربية قصيرة وفخمة جداً لتصميم ريلز / ستوري فيسبوك.
الفئة: ${category}
المود: ${mood}
${userIdea ? `فكرة المستخدم الخاصة: ${userIdea}` : ''}
المطلوب: عبارات عميقة، رنانة، جاهزة للوضع على صورة شخصية كبوستر أو ريلز.
أعد النتيجة بصيغة JSON فقط كمصفوفة نصوص بدون تنسيقات أخرى.
مثال: ["عبارة 1", "عبارة 2", "عبارة 3", "عبارة 4"]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let quotes: string[] = [];
    try {
      const parsed = JSON.parse(response.text || '[]');
      if (Array.isArray(parsed)) {
        quotes = parsed.map((q: any) => (typeof q === 'string' ? q : q.quote || String(q)));
      }
    } catch {
      quotes = [
        'ما دمتَ تمشي مستقيماً فلا تبالِ بالعقول المائلة.',
        'سلامٌ على من رآنا نميل فأقامنا، ولم يُثقل علينا بحكمٍ ولا ملامة.',
        'كن لنفسك كل شيء.. فالظل يهجرك حين يغيب النور.',
        'نحن لا نتغير.. نحن فقط نضع كل شخص في مكانه الحقيقي.',
      ];
    }

    res.json({ quotes });
  } catch (error: any) {
    console.error('Quote generator error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate quotes',
      fallbackQuotes: [
        'ما دمتَ تمشي مستقيماً فلا تبالِ بالعقول المائلة.',
        'سلامٌ على من رآنا نميل فأقامنا، ولم يُثقل علينا بحكمٍ ولا ملامة.',
        'كن لنفسك كل شيء.. فالظل يهجرك حين يغيب النور.',
        'نحن لا نتغير.. نحن فقط نضع كل شخص في مكانه الحقيقي.',
      ],
    });
  }
});

// 3. Start Veo Video Generation (veo-3.1-fast-generate-preview)
app.post('/api/generate-video', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt, aspectRatio = '9:16' } = req.body;
    const ai = getGeminiClient();

    const cleanedBase64 = imageBase64
      ? imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
      : undefined;

    const chosenAspectRatio = aspectRatio === '16:9' ? '16:9' : '9:16';

    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt:
        prompt ||
        'Cinematic portrait photography animated with subtle natural movement, soft wind moving hair, shallow depth of field, gentle golden hour sunlight, elegant atmospheric social media reel',
      image: cleanedBase64
        ? {
            imageBytes: cleanedBase64,
            mimeType: mimeType || 'image/jpeg',
          }
        : undefined,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: chosenAspectRatio,
      },
    });

    res.json({ operationName: operation.name });
  } catch (error: any) {
    console.error('Video generation start error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to initiate video generation',
    });
  }
});

// 4. Poll Veo Video Operation Status
app.post('/api/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const ai = getGeminiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    res.json({
      done: updated.done,
      error: updated.error,
    });
  } catch (error: any) {
    console.error('Video status polling error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to poll video status',
    });
  }
});

// 5. Download Completed Veo Video
app.post('/api/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const ai = getGeminiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(404).json({ error: 'Video URI not available yet or generation failed' });
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    const videoRes = await fetch(uri, {
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).json({ error: 'Failed to fetch video stream from server' });
    }

    res.setHeader('Content-Type', 'video/mp4');
    const arrayBuffer = await videoRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error: any) {
    console.error('Video download error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to download video',
    });
  }
});

// 6. Text-to-Speech Voiceover (gemini-3.8-flash-lite-tts)
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style: 'Clear, deeply poetic, calm and expressive Arabic narration for social media reels',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio data received from Gemini TTS');
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('TTS generation error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate voiceover',
    });
  }
});

// Vite middleware or static serving
const startServer = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT) || 3000;

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${port}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
