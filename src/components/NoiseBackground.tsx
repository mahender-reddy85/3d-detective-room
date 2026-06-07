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
      canvas.width = window.innerWidth / 3;
      canvas.height = window.innerHeight / 3;
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      const imgData = ctx.createImageData(canvas.width, canvas.height);
      const data = imgData.data;
      const len = data.length;

      for (let i = 0; i < len; i += 4) {
        const val = Math.random() * 255;
        const colorBias = Math.random();

        if (colorBias > 0.98) {
          data[i] = 0;
          data[i + 1] = 240;
          data[i + 2] = 255;
          data[i + 3] = 25;
        } else if (colorBias < 0.02) {
          data[i] = 255;
          data[i + 1] = 0;
          data[i + 2] = 127;
          data[i + 3] = 25;
        } else {
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
          data[i + 3] = 14;
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
      <canvas
        ref={canvasRef}
        id="glitch-noise-canvas"
        className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.22] z-[90] mix-blend-overlay"
      />

      <div
        id="crt-scanline-vignette"
        className="fixed inset-0 pointer-events-none z-[98] scanlines opacity-[0.45]"
      />

      <div
        id="crt-glass-specular"
        className="fixed inset-0 pointer-events-none z-[99] bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.45)_95%)]"
      />
    </>
  );
}
