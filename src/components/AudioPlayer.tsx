import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    playGlitchBeep: (type?: 'beep' | 'laser' | 'static' | 'chord') => void;
  }
}

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{
    lfo?: OscillatorNode;
    filter?: BiquadFilterNode;
    gainNode?: GainNode;
    oscs?: OscillatorNode[];
  }>({});

  const initAudio = () => {
    if (audioCtxRef.current) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, ctx.currentTime);
    filter.Q.setValueAtTime(6, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.15, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(60, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.04, ctx.currentTime);

    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    const freqs = [55.0, 82.41, 110.0, 130.81];
    const oscs: OscillatorNode[] = [];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 0.4, ctx.currentTime);
      osc.connect(filter);
      osc.start();
      oscs.push(osc);
    });

    synthNodesRef.current = { lfo, filter, gainNode, oscs };

    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  };

  const handleToggle = async () => {
    if (!audioCtxRef.current) {
      initAudio();
    }

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (isPlaying) {
      const gain = synthNodesRef.current.gainNode;
      if (gain) {
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      }
      setTimeout(() => {
        if (ctx.state === 'running') {
          ctx.suspend();
        }
      }, 350);
      setIsPlaying(false);
    } else {
      await ctx.resume();
      const gain = synthNodesRef.current.gainNode;
      if (gain) {
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 1.2);
      }
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    window.playGlitchBeep = (type = 'beep') => {
      let ctx = audioCtxRef.current;
      if (!ctx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        ctx = new AudioContextClass();
        audioCtxRef.current = ctx;
      }

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.28);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.28);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.32);
      } else if (type === 'static') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.setValueAtTime(120, now + 0.05);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(500, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'chord') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.04);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    };

    return () => {
      const nodes = synthNodesRef.current;
      if (nodes.oscs) nodes.oscs.forEach(o => { try { o.stop(); } catch(e){} });
      if (nodes.lfo) { try { nodes.lfo.stop(); } catch(e){} }
    };
  }, []);

  return null;
}
