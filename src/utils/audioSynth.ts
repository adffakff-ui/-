/**
 * Web Audio API ambient reel synthesizer
 * Plays relaxing, energetic, or dramatic audio themes tailored for Reels
 */

import { MusicCategory } from '../types';

let audioCtx: AudioContext | null = null;
let isPlaying = false;
let loopInterval: any = null;
let currentCategory: MusicCategory = 'calm';

export const startAmbientSound = (category: MusicCategory = 'calm') => {
  if (isPlaying && currentCategory === category) return;
  stopAmbientSound();

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isPlaying = true;
    currentCategory = category;

    // Chord progressions in Hz based on category
    const calmChords = [
      [220, 261.63, 329.63, 392], // Am7
      [174.61, 220, 261.63, 329.63], // Fmaj7
      [261.63, 329.63, 392, 493.88], // Cmaj7
      [196, 246.94, 293.66, 392], // G
    ];

    const energeticChords = [
      [146.83, 220, 293.66, 440], // Dm punch
      [116.54, 174.61, 233.08, 349.23], // Bb power
      [164.81, 246.94, 329.63, 493.88], // Em lift
      [130.81, 196, 261.63, 392], // C build
    ];

    const dramaticChords = [
      [110, 146.83, 174.61, 261.63], // Dm deep drone
      [98, 146.83, 196, 293.66], // Gm suspense
      [87.31, 130.81, 174.61, 261.63], // Bb cinematic tension
      [110, 138.59, 164.81, 220], // A mysterious resolve
    ];

    const chords =
      category === 'energetic'
        ? energeticChords
        : category === 'dramatic'
        ? dramaticChords
        : calmChords;

    const intervalTime = category === 'energetic' ? 1800 : category === 'dramatic' ? 3600 : 3000;
    let chordIdx = 0;

    const playStep = () => {
      if (!isPlaying || !audioCtx) return;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      const now = audioCtx.currentTime;

      // Play chord voices
      currentChord.forEach((freq, idx) => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        if (category === 'energetic') {
          osc.type = idx === 0 ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.05 / (idx + 1), now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
        } else if (category === 'dramatic') {
          osc.type = idx === 0 ? 'sawtooth' : idx === 1 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.045 / (idx + 1), now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);
        } else {
          // calm
          osc.type = idx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.04 / (idx + 1), now + 0.8);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.9);
        }

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + (category === 'energetic' ? 1.8 : 3.5));
      });
    };

    playStep();
    loopInterval = setInterval(playStep, intervalTime);
  } catch (err) {
    console.warn('Web Audio synthesis error:', err);
  }
};

export const stopAmbientSound = () => {
  isPlaying = false;
  if (loopInterval) {
    clearInterval(loopInterval);
    loopInterval = null;
  }
};

export const isAmbientSoundPlaying = () => isPlaying;

export const getCurrentMusicCategory = () => currentCategory;
