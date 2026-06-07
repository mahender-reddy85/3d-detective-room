/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';

export default function NoiseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth / 3; // Lower res for retro pixel noise and performance
      canvas.height = window.innerHeight / 3;
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      const imgData = ctx.createImageData(canvas.width, canvas.height);
      const data = imgData.data;
      const len = data.length;

      for (let i = 0; i < len; i += 4) {
        // High frequency static noise
        const val = Math.random() * 255;
        // Cyan vs Magenta random tint seeds
        const colorBias = Math.random();

        if (colorBias > 0.98) {
          // Cyan spike
          data[i] = 0;       // R
          data[i + 1] = 240; // G
          data[i + 2] = 255; // B
          data[i + 3] = 25;  // Alpha
        } else if (colorBias < 0.02) {
          // Magenta spike
          data[i] = 255;     // R
          data[i + 1] = 0;   // G
          data[i + 2] = 127; // B
          data[i + 3] = 25;  // Alpha
        } else {
          data[i] = val;     // R
          data[i + 1] = val; // G
          data[i + 2] = val; // B
          data[i + 3] = 14;  // Low transparency static
        }
      }

      ctx.putImageData(imgData, 0, 0);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Dynamic Pixel Noise Canvas */}
      <canvas
        ref={canvasRef}
        id="glitch-noise-canvas"
        className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.22] z-[90] mix-blend-overlay"
      />

      {/* Screen Flickers/Scanlines & Vignette */}
      <div 
        id="crt-scanline-vignette"
        className="fixed inset-0 pointer-events-none z-[98] scanlines opacity-[0.45]" 
      />

      {/* CRT screen curved edge glass reflection */}
      <div 
        id="crt-glass-specular"
        className="fixed inset-0 pointer-events-none z-[99] bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.45)_95%)]"
      />
    </>
  );
}
