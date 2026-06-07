import { useState } from 'react';
import NoiseBackground from './components/NoiseBackground';
import ThreeScene from './components/ThreeScene';
import AudioPlayer from './components/AudioPlayer';

export default function App() {
  const [isNight, setIsNight] = useState(false);

  const handleToggleNight = () => {
    setIsNight((prev) => !prev);
    if (window.playGlitchBeep) {
      window.playGlitchBeep('static');
    }
  };

  return (
    <div
      id="portfolio-main-viewport-housing"
      className={`relative w-screen h-screen overflow-hidden transition-colors duration-500 ${
        isNight ? 'bg-[#05050c] text-neutral-200' : 'bg-[#f1f5f9] text-zinc-800'
      } select-none`}
    >
      <div id="simulation-viewport-stack" className="relative w-full h-full">
        <NoiseBackground />

        <div id="canvas-wrapper-layer" className="absolute inset-0 z-0">
          <ThreeScene
            isNight={isNight}
            onToggleNight={handleToggleNight}
          />
        </div>

        <AudioPlayer />
      </div>
    </div>
  );
}
