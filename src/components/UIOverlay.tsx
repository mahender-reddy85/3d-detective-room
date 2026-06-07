/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SceneSection } from '../types';

interface UIOverlayProps {
  currentSection: SceneSection;
  onSelectSection: (section: SceneSection) => void;
  isNight: boolean;
  onToggleNight: () => void;
}

export default function UIOverlay({
  currentSection,
  onSelectSection,
}: UIOverlayProps) {

  const playHoverSound = () => {
    if (window.playGlitchBeep) window.playGlitchBeep('beep');
  };

  // If in standard room preview orbit, render no headers or text overlays.
  if (currentSection === 'ROOM') {
    return null;
  }

  return (
    <div id="hud-root-layer" className="absolute inset-0 pointer-events-none z-10 flex flex-col p-4 md:p-6">
      <header className="w-full pointer-events-auto z-20">
        <button 
          id="exit-zoom-btn"
          onClick={() => onSelectSection('ROOM')}
          onMouseEnter={playHoverSound}
          className="w-12 h-12 bg-[#050510]/95 border border-[#00f0ff]/40 hover:border-[#00f0ff] text-[#00f0ff] hover:text-white flex items-center justify-center cursor-pointer select-none backdrop-blur-md transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
          title="Return to Orbit"
        >
          <span className="font-sans text-2xl font-black">&lt;</span>
        </button>
      </header>
    </div>
  );
}
