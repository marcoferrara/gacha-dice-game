import { HeroGrade } from './types';

export class AudioSynth {
  private static audioCtx: AudioContext | null = null;
  private static isMuted = true;
  private static bgmInterval: number | null = null;
  private static bgmStep = 0;
  private static currentBgmMode: 'relaxing' | 'intense' = 'relaxing';

  private static init() {
    if (this.audioCtx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      this.audioCtx = new AudioContextClass();
    }
  }

  public static toggleMute(): boolean {
    this.init();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.isMuted = !this.isMuted;
    if (this.isMuted) this.stopBgm();
    else this.startBgm();
    return this.isMuted;
  }

  public static setMuted(muted: boolean) {
    this.init();
    if (this.audioCtx && this.audioCtx.state === 'suspended' && !muted) {
      this.audioCtx.resume();
    }
    this.isMuted = muted;
    if (this.isMuted) this.stopBgm();
    else this.startBgm();
  }

  public static getMuteState(): boolean {
    return this.isMuted;
  }

  public static setBgmMode(mode: 'relaxing' | 'intense') {
    if (this.currentBgmMode === mode) return;
    this.currentBgmMode = mode;
    if (!this.isMuted) {
      this.stopBgm();
      this.startBgm();
    }
  }

  private static startBgm() {
    this.init();
    if (!this.audioCtx || this.isMuted) return;
    if (this.bgmInterval) clearInterval(this.bgmInterval);

    const tempo = this.currentBgmMode === 'relaxing' ? 320 : 200;
    const notesRelaxing = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33];
    const notesIntense = [110, 130.81, 146.83, 164.81, 196.00, 220, 261.63, 293.66];

    this.bgmStep = 0;
    this.bgmInterval = window.setInterval(() => {
      if (!this.audioCtx || this.isMuted) return;
      const step = this.bgmStep;
      this.bgmStep = (this.bgmStep + 1) % 16;

      if (step === 0 || step === 8) {
        const bassFreq = this.currentBgmMode === 'relaxing' ? 110 : 55;
        this.playTone(bassFreq, 'triangle', 0.8, 0.12);
      }

      if (this.currentBgmMode === 'intense') {
        if (step % 2 === 0) {
          if (step % 4 === 0) this.playDrumKick();
          else this.playDrumSnare();
        }
      } else {
        if (step === 4 || step === 12) this.playTone(165, 'sine', 0.3, 0.04);
      }

      if (this.currentBgmMode === 'relaxing') {
        if (step % 4 === 0 || (step % 4 === 2 && Math.random() < 0.6)) {
          const randNote = notesRelaxing[Math.floor(Math.random() * notesRelaxing.length)];
          this.playTone(randNote, 'sine', 0.6, 0.06);
        }
      } else {
        if (step % 2 === 0) {
          const patternIndex = [0, 2, 3, 4, 3, 2, 5, 4, 3, 2, 0, 1, 0, 2, 4, 5][step];
          const noteFreq = notesIntense[patternIndex % notesIntense.length];
          this.playTone(noteFreq, 'sawtooth', 0.6, 0.08, true);
        }
      }
    }, tempo);
  }

  private static stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  private static playTone(freq: number, type: OscillatorType, duration: number, volume: number, useLowpass = false) {
    if (!this.audioCtx || this.isMuted) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      if (useLowpass) {
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + duration);
        osc.connect(filter);
        filter.connect(gain);
      } else {
        osc.connect(gain);
      }
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  }

  private static playDrumKick() {
    if (!this.audioCtx || this.isMuted) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.frequency.setValueAtTime(120, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.15);
    } catch (e) {}
  }

  private static playDrumSnare() {
    if (!this.audioCtx || this.isMuted) return;
    try {
      const bufferSize = this.audioCtx.sampleRate * 0.1;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, this.audioCtx.currentTime);
      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);
      noise.start();
      noise.stop(this.audioCtx.currentTime + 0.1);
    } catch (e) {}
  }

  public static playDiceRoll() {
    this.init();
    if (!this.audioCtx || this.isMuted) return;
    const now = this.audioCtx.currentTime;
    for (let i = 0; i < 6; i++) this.playTickAtTime(now + i * 0.12);
  }

  private static playTickAtTime(time: number) {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.frequency.setValueAtTime(800 + Math.random() * 400, time);
      osc.frequency.exponentialRampToValueAtTime(100, time + 0.04);
      gain.gain.setValueAtTime(0.06, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(time);
      osc.stop(time + 0.04);
    } catch (e) {}
  }

  public static playCritHit() {
    this.init();
    if (!this.audioCtx || this.isMuted) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.audioCtx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.25);
      this.playTone(1200, 'sine', 0.08, 0.06);
    } catch (e) {}
  }

  public static playGachaReveal(grade: HeroGrade) {
    this.init();
    if (!this.audioCtx || this.isMuted) return;
    if (grade === 'C') {
      this.playToneAtTime(261.63, 0, 0.3, 'sine', 0.15);
      this.playToneAtTime(329.63, 0.1, 0.3, 'sine', 0.15);
      this.playToneAtTime(392, 0.2, 0.4, 'sine', 0.15);
    } else if (grade === 'R') {
      this.playToneAtTime(220, 0, 0.3, 'sine', 0.2);
      this.playToneAtTime(277.18, 0.1, 0.3, 'sine', 0.2);
      this.playToneAtTime(329.63, 0.2, 0.5, 'sine', 0.2);
    } else if (grade === 'S') {
      const notes = [293.66, 349.23, 440, 523.25, 587.33];
      notes.forEach((freq, idx) => this.playToneAtTime(freq, idx * 0.08, 0.4, 'triangle', 0.12));
    } else {
      const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => this.playToneAtTime(freq, idx * 0.06, 0.6, 'sine', 0.1));
      this.playToneAtTime(130.81, 0, 0.8, 'triangle', 0.25);
    }
  }

  private static playToneAtTime(freq: number, delay: number, duration: number, type: OscillatorType, volume: number) {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const time = this.audioCtx.currentTime + delay;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(time);
      osc.stop(time + duration);
    } catch (e) {}
  }

  public static playLevelUp() {
    this.init();
    if (!this.audioCtx || this.isMuted) return;
    this.playToneAtTime(523.25, 0, 0.25, 'sine', 0.2);
    this.playToneAtTime(659.25, 0.08, 0.25, 'sine', 0.2);
    this.playToneAtTime(783.99, 0.16, 0.4, 'sine', 0.2);
  }

  public static playAscension() {
    this.init();
    if (!this.audioCtx || this.isMuted) return;
    const now = this.audioCtx.currentTime;
    try {
      const notes = [130.81, 261.63, 392, 523.25];
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx!.createOscillator();
        const filter = this.audioCtx!.createBiquadFilter();
        const gain = this.audioCtx!.createGain();
        const time = now + idx * 0.12;
        const duration = 0.8 - idx * 0.1;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, time);
        filter.frequency.exponentialRampToValueAtTime(200, time + duration);
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx!.destination);
        osc.start(time);
        osc.stop(time + duration);
      });
    } catch (e) {}
  }
}

export default AudioSynth;
