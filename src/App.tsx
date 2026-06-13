import ThreeScene from './components/ThreeScene';

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
          <ThreeScene
            isNight={isNight}
          />
        </div>
      </div>
    </div>
  );
}
