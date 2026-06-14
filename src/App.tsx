import ThreeScene from './components/ThreeScene';

export default function App() {
  const isNight = false;

  return (
    <div
      id="portfolio-main-viewport-housing"
      className="relative w-screen h-screen overflow-hidden transition-colors select-none"
      style={{ backgroundColor: isNight ? '#05050c' : '#f1f5f9', color: isNight ? '#e5e5e5' : '#27272a' }}
    >
      <div id="simulation-viewport-stack" className="relative w-full h-full">
        <div id="canvas-wrapper-layer" className="absolute inset-0 z-0">
          <ThreeScene isNight={isNight} />
        </div>
      </div>
    </div>
  );
}
