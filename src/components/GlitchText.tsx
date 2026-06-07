import { useState, useEffect } from 'react';

interface GlitchTextProps {
  id?: string;
  text: string;
  speed?: number;
  className?: string;
  delay?: number;
  scramble?: boolean;
}

export default function GlitchText({
  id,
  text,
  speed = 50,
  className = '',
  delay = 0,
  scramble = false,
}: GlitchTextProps) {
  const [displayedText, setDisplayedText] = useState(scramble ? '' : text);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (!scramble) {
      setDisplayedText(text);
      return;
    }

    const startTimeout = setTimeout(() => {
      let iterations = 0;
      const chars = '01#$@&%<>_[]{}-=+*!?X█▒░';

      const interval = setInterval(() => {
        setDisplayedText((prev) => {
          return text
            .split('')
            .map((char, index) => {
              if (index < iterations) {
                return text[index];
              }
              if (char === ' ') return ' ';
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');
        });

        if (iterations >= text.length) {
          clearInterval(interval);
          setDisplayedText(text);
        }

        iterations += 1 / 3;
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, scramble, speed, delay]);

  useEffect(() => {
    const glitchTimer = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 250);
    }, Math.random() * 4000 + 3000);

    return () => clearInterval(glitchTimer);
  }, []);

  return (
    <span
      id={id}
      className={`relative inline-block ${className} ${
        isGlitching ? 'scale-y-[1.05] skew-x-3' : ''
      }`}
    >
      <span
        className={`absolute top-0 left-[2px] text-neon-cyan opacity-80 mix-blend-screen select-none pointer-events-none ${
          isGlitching ? 'animate-glitch block' : 'hidden'
        }`}
        style={{ clip: 'rect(0, 900px, 0, 0)' }}
      >
        {displayedText}
      </span>

      <span className="relative z-10">{displayedText}</span>

      <span
        className={`absolute top-0 -left-[2px] text-neon-magenta opacity-80 mix-blend-screen select-none pointer-events-none ${
          isGlitching ? 'animate-glitch block' : 'hidden'
        }`}
        style={{ clip: 'rect(0, 900px, 0, 0)' }}
      >
        {displayedText}
      </span>
    </span>
  );
}
