import ThreeScene from './components/ThreeScene';

export default function App() {
  return (
    <div
      id="portfolio-main-viewport-housing"
      className="relative w-screen h-screen overflow-hidden transition-colors select-none"
      style={{ backgroundColor: '#cbd5e1', color: '#27272a' }}
    >
      <div id="simulation-viewport-stack" className="relative w-full h-full">
        <div id="canvas-wrapper-layer" className="absolute inset-0 z-0">
          <ThreeScene />
        </div>
      </div>
    </div>
  );
}
