/**
 * STUDY LAB Procedural Web Audio Engine
 * Zero-dependency audio synthesizer for tactile clicks, completion chimes,
 * binaural focus frequencies, and RPG progression fanfare.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private muted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (muted && this.ambientOsc) {
      this.stopAmbientFocus();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  /**
   * Tactile gentle click for UI interactions
   */
  public playClick() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // AudioContext unavailable or blocked
    }
  }

  /**
   * Harmonic 528Hz bell chime for Focus Timer session completion
   */
  public playTimerComplete() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const freqs = [528, 792, 1056];
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        const volume = 0.15 / (idx + 1);
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.06);
        osc.stop(this.ctx.currentTime + 1.8);
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Ascending two-tone chime for correct puzzle or task completed
   */
  public playSuccess() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const notes = [587.33, 880]; // D5 -> A5
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.1);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.1);
        osc.stop(this.ctx.currentTime + i * 0.1 + 0.35);
      });
    } catch {
      // Fallback
    }
  }

  /**
   * Gentle low buzz for incorrect puzzle choice
   */
  public playError() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(130, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {
      // Fallback
    }
  }

  /**
   * Multi-oscillator triumphant arpeggio for Level-Up or Rank Achievement
   */
  public playLevelUp() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      // C5 - E5 - G5 - C6 arpeggiated fanfare
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const start = this.ctx.currentTime + idx * 0.12;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.8);
      });
    } catch {
      // Fallback
    }
  }

  /**
   * Binaural 40Hz / soft brown noise focus ambiance
   */
  public startAmbientFocus() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx || this.ambientOsc) return;

      this.ambientOsc = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();

      this.ambientOsc.type = 'sine';
      this.ambientOsc.frequency.setValueAtTime(196, this.ctx.currentTime); // G3 warm frequency

      this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.ambientGain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 1.5);

      this.ambientOsc.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientOsc.start();
    } catch {
      // Fallback
    }
  }

  public stopAmbientFocus() {
    try {
      if (this.ambientOsc && this.ambientGain && this.ctx) {
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
        setTimeout(() => {
          try {
            this.ambientOsc?.stop();
            this.ambientOsc?.disconnect();
            this.ambientOsc = null;
            this.ambientGain = null;
          } catch {
            // Ignore cleanup errors
          }
        }, 550);
      }
    } catch {
      // Ignore
    }
  }
}

export const soundEngine = new SoundEngine();
