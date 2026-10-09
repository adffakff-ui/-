import { ReelSettings } from '../types';
import { GRADIENT_PRESETS } from './constants';

export const exportReelAsImage = async (settings: ReelSettings): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const isLandscape = settings.aspectRatio === '16:9';
      const isSquare = settings.aspectRatio === '1:1';

      const width = isLandscape ? 1920 : 1080;
      const height = isLandscape ? 1080 : isSquare ? 1080 : 1920;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context could not be created');
      }

      const mainImg = new Image();
      mainImg.crossOrigin = 'anonymous';

      mainImg.onload = () => {
        // 1. Draw dark background
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, width, height);

        // 2. Draw blurred ambient backdrop
        ctx.save();
        ctx.filter = 'blur(40px) brightness(0.35)';
        const hRatio = width / mainImg.width;
        const vRatio = height / mainImg.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShiftX = (width - mainImg.width * ratio) / 2;
        const centerShiftY = (height - mainImg.height * ratio) / 2;
        ctx.drawImage(
          mainImg,
          0,
          0,
          mainImg.width,
          mainImg.height,
          centerShiftX,
          centerShiftY,
          mainImg.width * ratio,
          mainImg.height * ratio
        );
        ctx.restore();

        // 3. Dark vignette overlay
        const grad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          Math.min(width, height) * 0.3,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.75
        );
        grad.addColorStop(0, 'rgba(0,0,0,0.2)');
        grad.addColorStop(1, 'rgba(0,0,0,0.85)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // 4. Draw Main Card Photo
        const cardMarginX = isLandscape ? width * 0.25 : width * 0.08;
        const cardMarginY = isLandscape ? height * 0.1 : height * 0.08;
        const cardW = width - cardMarginX * 2;
        const cardH = isLandscape ? height * 0.8 : height * 0.58;
        const cardRadius = 36;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(cardMarginX, cardMarginY, cardW, cardH, cardRadius);
        ctx.clip();

        if (settings.photoFadeEnabled) {
          const activeG = GRADIENT_PRESETS.find((g) => g.id === settings.backgroundGradient) || GRADIENT_PRESETS[0];
          const bgGrad = ctx.createLinearGradient(cardMarginX, cardMarginY, cardMarginX + cardW, cardMarginY + cardH);
          bgGrad.addColorStop(0, activeG.colors[0]);
          bgGrad.addColorStop(0.5, activeG.colors[1]);
          bgGrad.addColorStop(1, activeG.colors[2]);
          ctx.fillStyle = bgGrad;
          ctx.fillRect(cardMarginX, cardMarginY, cardW, cardH);
        }

        // Apply photo filters with custom brightness, contrast, saturation, and intensity
        const intensity = (settings.filterIntensity ?? 100) / 100;
        const b = settings.brightness ?? 100;
        const c = settings.contrast ?? 100;
        const s = settings.saturation ?? 100;

        let filterStr = '';
        if (settings.filter === 'dark-noir') filterStr = `grayscale(${Math.round(100 * intensity)}%) `;
        else if (settings.filter === 'cinematic-gold') filterStr = `sepia(${Math.round(25 * intensity)}%) `;
        else if (settings.filter === 'vintage') filterStr = `sepia(${Math.round(40 * intensity)}%) hue-rotate(${Math.round(-10 * intensity)}deg) `;
        else if (settings.filter === 'teal-orange') filterStr = `hue-rotate(${Math.round(15 * intensity)}deg) `;
        else if (settings.filter === 'dreamy-glow') filterStr = `blur(${Math.round(0.5 * intensity)}px) `;

        ctx.filter = `${filterStr}brightness(${b}%) contrast(${c}%) saturate(${s}%)`.trim();

        // Draw main photo with zoom
        const zoom = settings.zoom || 1;
        const pRatio = Math.max(cardW / mainImg.width, cardH / mainImg.height) * zoom;
        const pShiftX = cardMarginX + (cardW - mainImg.width * pRatio) / 2;
        const pShiftY = cardMarginY + (cardH - mainImg.height * pRatio) / 2 + (settings.panY || 0);

        ctx.drawImage(
          mainImg,
          0,
          0,
          mainImg.width,
          mainImg.height,
          pShiftX,
          pShiftY,
          mainImg.width * pRatio,
          mainImg.height * pRatio
        );
        ctx.restore();

        if (settings.photoFadeEnabled) {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(cardMarginX, cardMarginY, cardW, cardH, cardRadius);
          ctx.clip();
          const fadeInt = (settings.photoFadeIntensity ?? 65) / 100;
          const dir = settings.photoFadeDirection ?? 'bottom';
          const activeG = GRADIENT_PRESETS.find((g) => g.id === settings.backgroundGradient) || GRADIENT_PRESETS[0];

          if (dir === 'bottom') {
            const fGrad = ctx.createLinearGradient(0, cardMarginY + cardH * (1 - fadeInt), 0, cardMarginY + cardH);
            fGrad.addColorStop(0, 'rgba(0,0,0,0)');
            fGrad.addColorStop(1, activeG.colors[0]);
            ctx.fillStyle = fGrad;
            ctx.fillRect(cardMarginX, cardMarginY, cardW, cardH);
          } else if (dir === 'dual') {
            const topGrad = ctx.createLinearGradient(0, cardMarginY, 0, cardMarginY + cardH * fadeInt * 0.45);
            topGrad.addColorStop(0, activeG.colors[0]);
            topGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = topGrad;
            ctx.fillRect(cardMarginX, cardMarginY, cardW, cardH);

            const btmGrad = ctx.createLinearGradient(0, cardMarginY + cardH * (1 - fadeInt * 0.45), 0, cardMarginY + cardH);
            btmGrad.addColorStop(0, 'rgba(0,0,0,0)');
            btmGrad.addColorStop(1, activeG.colors[1]);
            ctx.fillStyle = btmGrad;
            ctx.fillRect(cardMarginX, cardMarginY, cardW, cardH);
          }
          ctx.restore();
        }

        // Draw card subtle border and bottom gradient inside card
        ctx.save();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.beginPath();
        ctx.roundRect(cardMarginX, cardMarginY, cardW, cardH, cardRadius);
        ctx.stroke();

        const cardBottomGrad = ctx.createLinearGradient(0, cardMarginY + cardH * 0.5, 0, cardMarginY + cardH);
        cardBottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
        cardBottomGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = cardBottomGrad;
        ctx.beginPath();
        ctx.roundRect(cardMarginX, cardMarginY, cardW, cardH, cardRadius);
        ctx.fill();
        ctx.restore();

        // 5. Draw Top Header inside Card
        const headerY = cardMarginY + 40;
        const headerX = width - cardMarginX - 40;

        const avatarImg = new Image();
        avatarImg.crossOrigin = 'anonymous';

        const drawRest = () => {
          // Draw text quote below photo
          ctx.save();
          ctx.direction = 'rtl';
          ctx.textAlign = 'center';

          let fontName = 'Cairo, sans-serif';
          if (settings.fontFamily === 'amiri') fontName = 'Amiri, serif';
          if (settings.fontFamily === 'tajawal') fontName = 'Tajawal, sans-serif';

          const quoteY = isLandscape ? cardMarginY + cardH * 0.75 : cardMarginY + cardH + 100;
          const fontSize = isLandscape ? settings.fontSize * 0.8 : settings.fontSize * 1.3;
          ctx.font = `700 ${fontSize}px ${fontName}`;
          ctx.fillStyle = settings.textColor || '#ffffff';
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = settings.glowEffect ? 24 : 16;

          // Word wrap Arabic quote
          const maxTextW = isLandscape ? width * 0.7 : width * 0.84;
          const words = settings.quoteText.split(' ');
          const lines: string[] = [];
          let currentLine = '';

          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxTextW && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);

          const lineHeight = fontSize * 1.45;

          // Static stylistic treatment for animation on still image
          if (settings.textAnimation === 'shake') {
            // Chromatic aberration glitch shadow
            ctx.save();
            ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
            lines.forEach((line, index) => {
              ctx.fillText(line, width / 2 - 4, quoteY + index * lineHeight);
            });
            ctx.fillStyle = 'rgba(6, 182, 212, 0.5)';
            lines.forEach((line, index) => {
              ctx.fillText(line, width / 2 + 4, quoteY + index * lineHeight);
            });
            ctx.restore();
          } else if (settings.textAnimation === 'pulse') {
            // Radiant golden halo
            ctx.save();
            ctx.shadowColor = 'rgba(245, 158, 11, 0.85)';
            ctx.shadowBlur = 36;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            lines.forEach((line, index) => {
              ctx.fillText(line, width / 2, quoteY + index * lineHeight);
            });
            ctx.restore();
          }

          lines.forEach((line, index) => {
            ctx.fillText(line, width / 2, quoteY + index * lineHeight);
          });
          ctx.restore();

          // Draw Audio & Equalizer Bar at bottom
          ctx.save();
          const footerY = height - (isLandscape ? 80 : 160);
          const soundText = `🎵 ${settings.soundTitle || 'صوت أصلي • تريند فيسبوك'}`;
          ctx.font = '600 24px Cairo, sans-serif';
          const textMetrics = ctx.measureText(soundText);
          const pillWidth = Math.max(520, Math.min(width * 0.85, textMetrics.width + 80));

          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.beginPath();
          ctx.roundRect(width / 2 - pillWidth / 2, footerY - 35, pillWidth, 65, 35);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.stroke();

          ctx.direction = 'rtl';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#f4f4f5';
          ctx.fillText(soundText, width / 2, footerY + 8);
          ctx.restore();

          // Export as PNG
          const dataUrl = canvas.toDataURL('image/png', 1.0);
          const link = document.createElement('a');
          link.download = `reel-${Date.now()}.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          resolve();
        };

        avatarImg.onload = () => {
          const avatarSize = 64;
          ctx.save();
          ctx.beginPath();
          ctx.arc(headerX - avatarSize / 2, headerY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(avatarImg, headerX - avatarSize, headerY, avatarSize, avatarSize);
          ctx.restore();

          ctx.save();
          ctx.beginPath();
          ctx.arc(headerX - avatarSize / 2, headerY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#eab308';
          ctx.stroke();

          ctx.direction = 'rtl';
          ctx.textAlign = 'right';
          ctx.fillStyle = '#ffffff';
          ctx.font = '700 28px Cairo, sans-serif';
          ctx.fillText(settings.creatorName, headerX - avatarSize - 16, headerY + 28);

          ctx.fillStyle = '#a1a1aa';
          ctx.font = '500 20px Cairo, sans-serif';
          ctx.fillText(settings.creatorHandle, headerX - avatarSize - 16, headerY + 54);
          ctx.restore();

          drawRest();
        };

        avatarImg.onerror = () => {
          drawRest();
        };

        avatarImg.src = settings.avatarUrl || settings.mainPhotoUrl;
      };

      mainImg.onerror = () => {
        reject(new Error('Failed to load image for canvas export'));
      };

      mainImg.src = settings.mainPhotoUrl;
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Exports animated Reel video clip recording the live motion of text and UI elements
 */
export const exportReelAsVideo = async (
  settings: ReelSettings,
  onProgress?: (progress: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const isLandscape = settings.aspectRatio === '16:9';
      const isSquare = settings.aspectRatio === '1:1';

      const width = isLandscape ? 1280 : 720;
      const height = isLandscape ? 720 : isSquare ? 720 : 1280;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const mainImg = new Image();
      mainImg.crossOrigin = 'anonymous';

      const avatarImg = new Image();
      avatarImg.crossOrigin = 'anonymous';

      let readyCount = 0;
      const onImageLoaded = () => {
        readyCount++;
        if (readyCount >= 2) startVideoRecording();
      };

      mainImg.onload = onImageLoaded;
      mainImg.onerror = () => reject(new Error('Failed to load main image for video export'));

      avatarImg.onload = onImageLoaded;
      avatarImg.onerror = onImageLoaded;

      mainImg.src = settings.mainPhotoUrl;
      avatarImg.src = settings.avatarUrl || settings.mainPhotoUrl;

      const startVideoRecording = () => {
        const stream = canvas.captureStream(30);
        let mimeType = 'video/webm;codecs=vp9';
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('video/mp4')) {
            mimeType = 'video/mp4';
          } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
            mimeType = 'video/webm;codecs=vp8';
          } else if (MediaRecorder.isTypeSupported('video/webm')) {
            mimeType = 'video/webm';
          }
        }

        const chunks: Blob[] = [];
        const recorder = new MediaRecorder(stream, { mimeType });

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
          a.download = `reel-animation-${Date.now()}.${ext}`;
          a.href = url;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          resolve();
        };

        recorder.start();

        const totalFrames = 120; // 4 seconds at 30fps
        let currentFrame = 0;

        const drawFrame = () => {
          if (currentFrame >= totalFrames) {
            recorder.stop();
            return;
          }

          const t = currentFrame / 30; // seconds
          const progress = Math.round((currentFrame / totalFrames) * 100);
          if (onProgress) onProgress(progress);

          // 1. Clear background
          ctx.fillStyle = '#09090b';
          ctx.fillRect(0, 0, width, height);

          // 2. Blurred backdrop
          ctx.save();
          ctx.filter = 'blur(30px) brightness(0.35)';
          const hRatio = width / mainImg.width;
          const vRatio = height / mainImg.height;
          const ratio = Math.max(hRatio, vRatio);
          const cX = (width - mainImg.width * ratio) / 2;
          const cY = (height - mainImg.height * ratio) / 2;
          ctx.drawImage(mainImg, 0, 0, mainImg.width, mainImg.height, cX, cY, mainImg.width * ratio, mainImg.height * ratio);
          ctx.restore();

          // 3. Radial vignette
          const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.25, width / 2, height / 2, width * 0.75);
          grad.addColorStop(0, 'rgba(0,0,0,0.2)');
          grad.addColorStop(1, 'rgba(0,0,0,0.85)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // 4. Main Photo Card
          const cardMarginX = isLandscape ? width * 0.25 : width * 0.08;
          const cardMarginY = isLandscape ? height * 0.1 : height * 0.08;
          const cardW = width - cardMarginX * 2;
          const cardH = isLandscape ? height * 0.8 : height * 0.58;
          const cardRadius = 24;

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(cardMarginX, cardMarginY, cardW, cardH, cardRadius);
          ctx.clip();

          // Photo filters
          const intensity = (settings.filterIntensity ?? 100) / 100;
          const b = settings.brightness ?? 100;
          const c = settings.contrast ?? 100;
          const s = settings.saturation ?? 100;
          let filterStr = '';
          if (settings.filter === 'dark-noir') filterStr = `grayscale(${Math.round(100 * intensity)}%) `;
          else if (settings.filter === 'cinematic-gold') filterStr = `sepia(${Math.round(25 * intensity)}%) `;
          else if (settings.filter === 'vintage') filterStr = `sepia(${Math.round(40 * intensity)}%) hue-rotate(${Math.round(-10 * intensity)}deg) `;
          else if (settings.filter === 'teal-orange') filterStr = `hue-rotate(${Math.round(15 * intensity)}deg) `;
          else if (settings.filter === 'dreamy-glow') filterStr = `blur(${Math.round(0.5 * intensity)}px) `;
          ctx.filter = `${filterStr}brightness(${b}%) contrast(${c}%) saturate(${s}%)`.trim();

          const zoom = settings.zoom || 1;
          const pRatio = Math.max(cardW / mainImg.width, cardH / mainImg.height) * zoom;
          const pShiftX = cardMarginX + (cardW - mainImg.width * pRatio) / 2;
          const pShiftY = cardMarginY + (cardH - mainImg.height * pRatio) / 2 + (settings.panY || 0);

          ctx.drawImage(mainImg, 0, 0, mainImg.width, mainImg.height, pShiftX, pShiftY, mainImg.width * pRatio, mainImg.height * pRatio);
          ctx.restore();

          // Border & card shade
          ctx.save();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.beginPath();
          ctx.roundRect(cardMarginX, cardMarginY, cardW, cardH, cardRadius);
          ctx.stroke();

          const cardBottomGrad = ctx.createLinearGradient(0, cardMarginY + cardH * 0.5, 0, cardMarginY + cardH);
          cardBottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
          cardBottomGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
          ctx.fillStyle = cardBottomGrad;
          ctx.beginPath();
          ctx.roundRect(cardMarginX, cardMarginY, cardW, cardH, cardRadius);
          ctx.fill();
          ctx.restore();

          // 5. Header: Avatar & Name
          const headerY = cardMarginY + 28;
          const headerX = width - cardMarginX - 28;
          const avatarSize = 48;

          ctx.save();
          ctx.beginPath();
          ctx.arc(headerX - avatarSize / 2, headerY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(avatarImg, headerX - avatarSize, headerY, avatarSize, avatarSize);
          ctx.restore();

          ctx.save();
          ctx.beginPath();
          ctx.arc(headerX - avatarSize / 2, headerY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#eab308';
          ctx.stroke();

          ctx.direction = 'rtl';
          ctx.textAlign = 'right';
          ctx.fillStyle = '#ffffff';
          ctx.font = '700 20px Cairo, sans-serif';
          ctx.fillText(settings.creatorName, headerX - avatarSize - 12, headerY + 22);

          ctx.fillStyle = '#a1a1aa';
          ctx.font = '500 14px Cairo, sans-serif';
          ctx.fillText(settings.creatorHandle, headerX - avatarSize - 12, headerY + 42);
          ctx.restore();

          // 6. ANIMATED TEXT RENDERING
          ctx.save();
          ctx.direction = 'rtl';
          ctx.textAlign = 'center';

          let fontName = 'Cairo, sans-serif';
          if (settings.fontFamily === 'amiri') fontName = 'Amiri, serif';
          if (settings.fontFamily === 'tajawal') fontName = 'Tajawal, sans-serif';

          const quoteY = isLandscape ? cardMarginY + cardH * 0.75 : cardMarginY + cardH + 70;
          const fontSize = isLandscape ? settings.fontSize * 0.6 : settings.fontSize * 0.9;
          ctx.font = `700 ${fontSize}px ${fontName}`;
          ctx.fillStyle = settings.textColor || '#ffffff';

          const maxTextW = isLandscape ? width * 0.7 : width * 0.84;
          const words = settings.quoteText.split(' ');
          const lines: string[] = [];
          let currentLine = '';

          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxTextW && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);

          const lineHeight = fontSize * 1.45;

          // Compute Text Animation transforms based on time t
          let animAlpha = 1;
          let animOffsetY = 0;
          let animOffsetX = 0;
          let animScale = 1;
          let animRotate = 0;
          let animGlowBlur = settings.glowEffect ? 20 : 10;

          if (settings.textAnimation === 'fade-in') {
            const fT = Math.min(1, t / 1.2);
            animAlpha = fT;
            animOffsetY = 16 * (1 - fT);
            animScale = 0.96 + 0.04 * fT;
          } else if (settings.textAnimation === 'shake') {
            animOffsetX = Math.sin(t * 26) * 4;
            animRotate = Math.sin(t * 20) * 0.01;
          } else if (settings.textAnimation === 'pulse') {
            const pSin = Math.sin(t * 3.5);
            animScale = 1 + pSin * 0.04;
            animGlowBlur = 16 + pSin * 14;
          } else if (settings.textAnimation === 'slide-up') {
            const sT = Math.min(1, t / 0.9);
            animAlpha = sT;
            animOffsetY = 28 * (1 - sT);
          } else if (settings.textAnimation === 'bounce') {
            animOffsetY = -Math.abs(Math.sin(t * 4)) * 9;
          }

          ctx.globalAlpha = animAlpha;
          ctx.shadowColor = settings.glowEffect ? 'rgba(245, 158, 11, 0.7)' : 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = animGlowBlur;

          ctx.translate(width / 2 + animOffsetX, quoteY + animOffsetY);
          ctx.scale(animScale, animScale);
          ctx.rotate(animRotate);

          // Draw chromatic aberration shadow on shake
          if (settings.textAnimation === 'shake') {
            ctx.save();
            ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
            lines.forEach((line, index) => {
              ctx.fillText(line, -3, index * lineHeight);
            });
            ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
            lines.forEach((line, index) => {
              ctx.fillText(line, 3, index * lineHeight);
            });
            ctx.restore();
          }

          lines.forEach((line, index) => {
            ctx.fillText(line, 0, index * lineHeight);
          });
          ctx.restore();

          // 7. Bottom Audio Pill with Animated Equalizer Wave
          ctx.save();
          const footerY = height - (isLandscape ? 60 : 110);
          const soundText = `🎵 ${settings.soundTitle || 'صوت أصلي • تريند فيسبوك'}`;
          ctx.font = '600 16px Cairo, sans-serif';
          const textMetrics = ctx.measureText(soundText);
          const pillWidth = Math.max(340, Math.min(width * 0.85, textMetrics.width + 80));

          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.beginPath();
          ctx.roundRect(width / 2 - pillWidth / 2, footerY - 25, pillWidth, 50, 25);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.stroke();

          ctx.direction = 'rtl';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#f4f4f5';
          ctx.fillText(soundText, width / 2, footerY + 6);
          ctx.restore();

          currentFrame++;
          requestAnimationFrame(drawFrame);
        };

        requestAnimationFrame(drawFrame);
      };
    } catch (err) {
      reject(err);
    }
  });
};
