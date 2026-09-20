class QuizAudioService {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.isMuted = false;
    this.volume = 0.35;
    this.isPlayingMusic = false;
    this.loopTimer = null;
    this.tempo = 124;
    this.step = 0;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    } catch {
      // AudioContext unavailable or blocked
    }
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  setVolume(newVolume) {
    this.volume = Math.max(0, Math.min(1, newVolume));
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  startQuestionMusic() {
    this.ensureContext();
    if (!this.ctx || this.isPlayingMusic) return;

    this.isPlayingMusic = true;
    this.step = 0;

    const secondsPerBeat = 60 / this.tempo;
    const stepDuration = (secondsPerBeat / 2) * 1000;

    const bassNotes = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83];
    const leadNotes = [440, 523.25, 659.25, 587.33, 659.25, 783.99, 659.25, 523.25];

    this.loopTimer = setInterval(() => {
      if (!this.isPlayingMusic || !this.ctx) return;

      const now = this.ctx.currentTime;
      const currentStep = this.step % 8;

      try {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = "triangle";
        bassOsc.frequency.setValueAtTime(bassNotes[currentStep], now);

        bassGain.gain.setValueAtTime(0.35, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);

        bassOsc.start(now);
        bassOsc.stop(now + 0.24);
      } catch {}

      if (currentStep % 2 === 1) {
        try {
          const leadOsc = this.ctx.createOscillator();
          const leadGain = this.ctx.createGain();
          leadOsc.type = "sine";
          leadOsc.frequency.setValueAtTime(leadNotes[currentStep], now);

          leadGain.gain.setValueAtTime(0.12, now);
          leadGain.gain.exponentialRampToValueAtTime(0.005, now + 0.16);

          leadOsc.connect(leadGain);
          leadGain.connect(this.musicGain);

          leadOsc.start(now);
          leadOsc.stop(now + 0.18);
        } catch {}
      }

      if (currentStep % 4 === 0) {
        try {
          const clickOsc = this.ctx.createOscillator();
          const clickGain = this.ctx.createGain();
          clickOsc.type = "sine";
          clickOsc.frequency.setValueAtTime(180, now);
          clickOsc.frequency.exponentialRampToValueAtTime(40, now + 0.06);

          clickGain.gain.setValueAtTime(0.25, now);
          clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

          clickOsc.connect(clickGain);
          clickGain.connect(this.musicGain);

          clickOsc.start(now);
          clickOsc.stop(now + 0.07);
        } catch {}
      }

      this.step++;
    }, stepDuration);
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
  }

  playTick() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  playTimeUp() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [440, 370, 311, 220];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.3, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.32);
      });
    } catch {}
  }

  playReveal() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.28, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.8);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.85);
      });
    } catch {}
  }

  
  playTear() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.16);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2200, now);
      filter.frequency.exponentialRampToValueAtTime(500, now + 0.15);
      filter.Q.value = 2.5;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(now);
      noise.stop(now + 0.16);
    } catch {}
  }

  playSuction() {
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.38);

      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.39);
    } catch {}
  }

  cleanup() {
    this.stopMusic();
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
    }
  }
}

export const audioService = new QuizAudioService();
