import { useCallback, useRef, useState } from 'react';

interface AudioSettings {
  enabled: boolean;
  volume: number;
}

export const useAudio = () => {
  const [settings, setSettings] = useState<AudioSettings>({
    enabled: true,
    volume: 0.7
  });

  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Generate complex synthesized sound effects with unique patterns
  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    if (!settings.enabled) return;

    const audioContext = getAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * settings.volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }, [settings, getAudioContext]);

  // Create frequency sweep effect
  const playSweep = useCallback((startFreq: number, endFreq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    if (!settings.enabled) return;

    const audioContext = getAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + duration);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * settings.volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }, [settings, getAudioContext]);

  // Tier-specific opening sounds with distinctly different characteristics
  const playOpenCommon = useCallback(() => {
    if (!settings.enabled) return;
    
    // Wooden percussion-like sound with quick decay
    setTimeout(() => playTone(800, 0.05, 'square', 0.4), 0);
    setTimeout(() => playTone(400, 0.08, 'triangle', 0.3), 20);
    setTimeout(() => playTone(200, 0.12, 'sine', 0.2), 60);
  }, [playTone, settings.enabled]);

  const playOpenRare = useCallback(() => {
    if (!settings.enabled) return;
    
    // Electronic synth sequence with distinct rhythm
    setTimeout(() => playTone(110, 0.15, 'sawtooth', 0.5), 0);     // Deep bass
    setTimeout(() => playTone(220, 0.1, 'square', 0.4), 100);      // Octave up
    setTimeout(() => playTone(330, 0.08, 'triangle', 0.3), 150);   
    setTimeout(() => playTone(440, 0.06, 'sine', 0.35), 180);      
    setTimeout(() => playSweep(550, 1100, 0.2, 'sawtooth', 0.3), 220);
    setTimeout(() => playTone(1760, 0.15, 'triangle', 0.2), 300);  // High ping
  }, [playTone, playSweep, settings.enabled]);

  const playOpenEpic = useCallback(() => {
    if (!settings.enabled) return;
    
    // Massive cinematic sound with multiple layers
    setTimeout(() => playTone(65, 0.3, 'sawtooth', 0.6), 0);       // Sub bass
    setTimeout(() => playTone(130, 0.25, 'square', 0.5), 50);      // Bass
    setTimeout(() => playTone(196, 0.2, 'triangle', 0.4), 100);    
    setTimeout(() => playTone(392, 0.18, 'sine', 0.4), 150);       
    setTimeout(() => playTone(784, 0.15, 'triangle', 0.35), 200);  
    setTimeout(() => playSweep(1568, 3136, 0.4, 'sine', 0.3), 250); // Dramatic sweep
    setTimeout(() => playTone(2093, 0.3, 'triangle', 0.25), 400);  
    setTimeout(() => playTone(4186, 0.2, 'sine', 0.15), 500);      // Ultra high sparkle
  }, [playTone, playSweep, settings.enabled]);

  // Unified capsule opening that chooses tier-specific sound
  const playOpenCapsule = useCallback((tier?: string) => {
    switch(tier) {
      case 'common':
        playOpenCommon();
        break;
      case 'rare':
        playOpenRare();
        break;
      case 'epic':
        playOpenEpic();
        break;
      default:
        playOpenEpic(); // Default to epic for backwards compatibility
    }
  }, [playOpenCommon, playOpenRare, playOpenEpic]);

  const playRevealRare = useCallback(() => {
    if (!settings.enabled) return;
    
    // Rapid metallic ringing like wind chimes
    setTimeout(() => playTone(1397, 0.08, 'triangle', 0.5), 0);   // High metallic
    setTimeout(() => playTone(1760, 0.06, 'sine', 0.4), 30);      
    setTimeout(() => playTone(2217, 0.05, 'triangle', 0.35), 50); 
    setTimeout(() => playTone(2794, 0.04, 'sine', 0.3), 65);      
    setTimeout(() => playTone(3520, 0.12, 'triangle', 0.25), 80); // Bright shimmer
  }, [playTone, settings.enabled]);

  const playRevealCommon = useCallback(() => {
    if (!settings.enabled) return;
    
    // Simple bubble pop sound
    setTimeout(() => playTone(1200, 0.03, 'sine', 0.3), 0);       
    setTimeout(() => playTone(800, 0.04, 'triangle', 0.25), 15);  
    setTimeout(() => playTone(400, 0.06, 'sine', 0.15), 35);      
  }, [playTone, settings.enabled]);

  const playRevealEpic = useCallback(() => {
    if (!settings.enabled) return;
    
    // Explosive orchestral burst with dramatic timing
    setTimeout(() => playTone(82, 0.4, 'sawtooth', 0.7), 0);      // Massive sub bass
    setTimeout(() => playTone(164, 0.35, 'square', 0.6), 0);      
    setTimeout(() => playTone(330, 0.3, 'triangle', 0.5), 0);     
    setTimeout(() => playTone(659, 0.25, 'sine', 0.45), 50);      
    setTimeout(() => playTone(1318, 0.2, 'triangle', 0.4), 100);  
    setTimeout(() => playSweep(2637, 5274, 0.5, 'sine', 0.35), 150); // Massive sweep
    setTimeout(() => playTone(4186, 0.3, 'triangle', 0.2), 300);  
    setTimeout(() => playTone(8372, 0.15, 'sine', 0.1), 400);     // Ultra high sparkle
  }, [playTone, playSweep, settings.enabled]);

  const playButtonClick = useCallback(() => {
    if (!settings.enabled) return;
    // Crisp mechanical click sound
    playTone(2000, 0.02, 'square', 0.2);
    setTimeout(() => playTone(1000, 0.015, 'triangle', 0.15), 10);
  }, [playTone, settings.enabled]);

  const playButtonHover = useCallback(() => {
    if (!settings.enabled) return;
    // Soft whistle-like sweep
    playSweep(1200, 1400, 0.06, 'triangle', 0.06);
  }, [playSweep, settings.enabled]);

  const playSuccess = useCallback(() => {
    if (!settings.enabled) return;
    
    // Cheerful ascending melody 
    setTimeout(() => playTone(440, 0.1, 'sine', 0.4), 0);         // A4
    setTimeout(() => playTone(523, 0.1, 'triangle', 0.35), 60);   // C5
    setTimeout(() => playTone(659, 0.1, 'sine', 0.3), 120);       // E5
    setTimeout(() => playTone(880, 0.15, 'triangle', 0.35), 180); // A5
    setTimeout(() => playTone(1047, 0.2, 'sine', 0.3), 240);      // C6
  }, [playTone, settings.enabled]);

  const playError = useCallback(() => {
    if (!settings.enabled) return;
    
    // Harsh buzzer-like warning
    setTimeout(() => playTone(150, 0.1, 'sawtooth', 0.4), 0);
    setTimeout(() => playTone(120, 0.1, 'square', 0.35), 50);
    setTimeout(() => playTone(100, 0.15, 'sawtooth', 0.3), 100);
  }, [playTone, settings.enabled]);

  const toggleAudio = useCallback(() => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  return {
    settings,
    playOpenCapsule,
    playRevealRare,
    playRevealCommon,
    playRevealEpic,
    playButtonClick,
    playButtonHover,
    playSuccess,
    playError,
    toggleAudio,
    setVolume
  };
};