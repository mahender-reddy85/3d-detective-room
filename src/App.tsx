import { lazy, Suspense } from 'react';

const ThreeScene = lazy(() => import('./components/ThreeScene'));

export default function App() {
  const isNight = false;

  return (
    <div
      id="portfolio-main-viewport-housing"
      className={`relative w-screen h-screen overflow-hidden transition-colors duration-500 ${
        isNight ? 'bg-[#05050c] text-neutral-200' : 'bg-[#f1f5f9] text-zinc-800'
      } select-none`}
    >
      <div id="simulation-viewport-stack" className="relative w-full h-full">

        <div id="canvas-wrapper-layer" className="absolute inset-0 z-0">
          <Suspense fallback={
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-colors duration-500 ${
              isNight ? 'bg-[#05050c] text-neutral-200' : 'bg-[#f1f5f9] text-zinc-800'
            }`}>
              <div className="w-10 h-10 border-4 border-t-indigo-500 border-indigo-200 rounded-full animate-spin mb-4"></div>
              <div className="text-lg font-medium tracking-wide animate-pulse">Loading Workspace...</div>
            </div>
          }>
            <ThreeScene
              isNight={isNight}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
