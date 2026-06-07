/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { SceneSection } from './types';
import NoiseBackground from './components/NoiseBackground';
import ThreeScene from './components/ThreeScene';
import UIOverlay from './components/UIOverlay';
import AudioPlayer from './components/AudioPlayer';

export default function App() {
  const [currentSection, setCurrentSection] = useState<SceneSection>('ROOM');
  const [isNight, setIsNight] = useState(false);

  const handleSelectSection = (section: SceneSection) => {
    setCurrentSection(section);
  };

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
      } select-none selection:bg-neon-magenta selection:text-white`}
    >
      {/* The fully interactive 3D simulation cockpit */}
      <div id="simulation-viewport-stack" className="relative w-full h-full flex flex-col justify-between">
        
        {/* Animated general background CRT scanlines/static */}
        <NoiseBackground />

        {/* Core Procedural WebGL Canvas Frame */}
        <div id="canvas-wrapper-layer" className="absolute inset-0 z-0">
          <ThreeScene
            currentSection={currentSection}
            onSelectSection={handleSelectSection}
            isNight={isNight}
          />
        </div>

        {/* Interactive Glass Glassmorphism HUD Dashboard Controls overlays */}
        <UIOverlay
          currentSection={currentSection}
          onSelectSection={handleSelectSection}
          isNight={isNight}
          onToggleNight={handleToggleNight}
        />

        {/* Procedural Ambient Synthesizer & Click Audio Beeps */}
        <AudioPlayer />
      </div>
    </div>
  );
}
