export class AudioManager {
  private static instance: AudioManager | null = null;
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private backgroundMusic: AudioBuffer | null = null;
  private backgroundSource: AudioBufferSourceNode | null = null;
  private isMuted: boolean = false;

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private constructor() {
    if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3;
    }
  }

  // Initialize background music - load from external file
  async initializeBackgroundMusic() {
    if (!this.audioContext || !this.masterGain || this.backgroundMusic) return;

    try {
      const response = await fetch('/assets/music/background-music.mp3');
      if (!response.ok) throw new Error('Network response was not ok');
      const arrayBuffer = await response.arrayBuffer();
      this.backgroundMusic = await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.error('Failed to load background music:', e);
      // Fallback: Generate a simple synth patterns if file fails
      const audioBuffer = this.audioContext.createBuffer(
        2,
        this.audioContext.sampleRate * 2,
        this.audioContext.sampleRate
      );
      this.backgroundMusic = audioBuffer;
    }
  }

  // Start background music loop
  playBackgroundMusic() {
    if (!this.audioContext || !this.masterGain || !this.backgroundMusic) return;

    // Stop if already playing
    if (this.backgroundSource) {
      this.backgroundSource.stop();
    }

    this.backgroundSource = this.audioContext.createBufferSource();
    this.backgroundSource.buffer = this.backgroundMusic;
    this.backgroundSource.loop = true;
    this.backgroundSource.connect(this.masterGain);
    this.backgroundSource.start(0);
  }

  // Stop background music
  stopBackgroundMusic() {
    if (this.backgroundSource) {
      try {
        this.backgroundSource.stop();
      } catch (e) {
        // Already stopped
      }
      this.backgroundSource = null;
    }
  }

  // Play sound effect
  playSoundEffect(type: 'hit' | 'powerup' | 'shield' | 'wave' | 'gameover') {
    if (!this.audioContext || !this.masterGain || this.isMuted) return;

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    const duration = 0.2;
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    switch (type) {
      case 'hit':
        // Low frequency beep for collision
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + duration);
        osc.type = 'square';
        break;

      case 'powerup':
        // High pitch ascending for powerup
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + duration);
        osc.type = 'sine';
        break;

      case 'shield':
        // Resonant frequency for shield
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + duration);
        osc.type = 'sine';
        break;

      case 'wave':
        // Rising tone for wave progression
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + duration);
        osc.type = 'sine';
        break;

      case 'gameover':
        // Descending tone for game over
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + duration * 2);
        osc.type = 'square';
        duration;
        break;
    }

    osc.start(now);
    osc.stop(now + duration);
  }

  // Toggle mute
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 0.3;
    }
    return this.isMuted;
  }

  // Set volume
  setVolume(value: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, value));
    }
  }

  // Get audio context
  getAudioContext() {
    return this.audioContext;
  }
}
