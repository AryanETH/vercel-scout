import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface MousePosition {
  x: number;
  y: number;
}

// A collection of high-quality, creepy, human-free Unsplash image IDs for "no-man's land"
const CREEPY_IMAGE_IDS = [
  'photo-1505673542670-a5e3ff5b14a3', // Dark empty road
  'photo-1441974231531-c6227db76b6e', // Dark forest
  'photo-1518709268805-4e9042af9f23', // Abandoned stone room
  'photo-1519074063927-7ad097f72c3b', // Creepy hallway
  'photo-1536550130222-1be877e4281a', // Industrial ruins
  'photo-1470071459604-3b5ec3a7fe05', // Foggy mountains
  'photo-1509248961158-e54f6934749c', // Mist forest
  'photo-1516214104703-d870798883c5', // Dark tunnel
];

const NotFound = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState<MousePosition>({ x: -1000, y: -1000 });
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pick a random scary image on mount
  const imageUrl = useMemo(() => {
    const randomId = CREEPY_IMAGE_IDS[Math.floor(Math.random() * CREEPY_IMAGE_IDS.length)];
    return `https://images.unsplash.com/${randomId}?q=80&w=2560&auto=format&fit=crop`;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleResize = useCallback(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    handleResize();

    // Battery API integration
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleMouseMove, handleResize]);

  const dynamicRadius = useMemo(() => {
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    const dist = Math.sqrt(Math.pow(mousePos.x - cx, 2) + Math.pow(mousePos.y - cy, 2));
    const maxDist = Math.sqrt(Math.pow(cx, 2) + Math.pow(cy, 2));
    const ratio = Math.min(dist / maxDist, 1);

    const baseSize = 800;
    const multiplier = 0.6 - (ratio * 0.5);
    return baseSize * multiplier;
  }, [mousePos, dimensions]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#020202] select-none cursor-none"
    >
      <style>{`
        .ghost-shadow-text {
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.05em;
          font-weight: 900;
          text-transform: uppercase;
          font-style: italic;
          color: rgba(120, 120, 120, 0.4);
          text-shadow: 0 0 40px rgba(0, 0, 0, 0.9), 0 0 10px rgba(255, 255, 255, 0.05);
          mix-blend-mode: exclusion;
        }
        .vhs-noise {
          position: absolute;
          inset: 0;
          background: url('https://www.transparenttextures.com/patterns/stardust.png');
          opacity: 0.04;
          pointer-events: none;
          z-index: 40;
        }
        @keyframes signal-flow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        .signal-bar { animation: signal-flow 1.5s infinite ease-in-out; }
        .signal-bar:nth-child(1) { animation-delay: 0s; }
        .signal-bar:nth-child(2) { animation-delay: 0.3s; }
        .signal-bar:nth-child(3) { animation-delay: 0.6s; }
        .signal-bar:nth-child(4) { animation-delay: 0.9s; }

        @keyframes beep {
          0%, 100% { opacity: 0.2; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .live-beep { animation: beep 1s infinite ease-in-out; }
      `}</style>

      {/* 1. Base Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.03] grayscale"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      />

      {/* 2. Spotlight Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-100 ease-out"
        style={{
          backgroundImage: `url('${imageUrl}')`,
          WebkitMaskImage: `radial-gradient(circle ${dynamicRadius}px at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 100%)`,
          maskImage: `radial-gradient(circle ${dynamicRadius}px at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 100%)`,
          filter: 'brightness(1.1) contrast(1.2) saturate(0.6)'
        }}
      />

      <div className="vhs-noise" />

      {/* HUD UI Elements */}
      <div className="relative z-50 h-full w-full pointer-events-none p-10 font-mono text-[10px] uppercase tracking-[0.3em]">
        {/* Top Left: Signal Lost + Animated Network */}
        <div className="absolute top-10 left-10 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-end gap-[2px] h-3">
              <div className="signal-bar w-1 h-[25%] bg-white/40" />
              <div className="signal-bar w-1 h-[50%] bg-white/40" />
              <div className="signal-bar w-1 h-[75%] bg-white/40" />
              <div className="signal-bar w-1 h-[100%] bg-white/40" />
            </div>
            <span className="text-white/40">SIGNAL_LOST</span>
          </div>
          <span className="text-white/20">404_SEC_01</span>
        </div>

        {/* Top Right: Monitoring + Live Beep */}
        <div className="absolute top-10 right-10 flex items-center gap-3 text-white/40">
          <span>MONITORING</span>
          <div className="live-beep w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
        </div>

        {/* Main Text Content */}
        <div className="flex flex-col items-center justify-center h-full">
          <div className="relative">
            <h1 className="text-7xl md:text-9xl ghost-shadow-text">
              404 NOT FOUND
            </h1>
          </div>
          <p className="mt-8 text-white/20 tracking-[0.8em]">
            SUBJECT_ABSENT_IN_THIS_COORD
          </p>

          <button
            className="mt-16 px-10 py-3 bg-transparent border border-white/10 text-white/40 text-[9px] hover:bg-white hover:text-black hover:border-white transition-all duration-300 pointer-events-auto"
            onClick={() => navigate('/')}
          >
            GO_HOME
          </button>
        </div>

        {/* Bottom Left: Live Coordinates */}
        <div className="absolute bottom-10 left-10 text-white/30 flex flex-col gap-1">
          <div>LAT: {Math.round(mousePos.y * 1.404)}</div>
          <div>LONG: {Math.round(mousePos.x * 0.404)}</div>
        </div>

        {/* Bottom Right: Battery & Wifi */}
        <div className="absolute bottom-10 right-10 flex items-center gap-6 text-white/30">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-3 border border-white/30 rounded-[1px] p-[1px]">
              <div
                className="h-full bg-white/40 transition-all duration-1000"
                style={{ width: `${batteryLevel ?? 0}%` }}
              />
              <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-1 h-1.5 bg-white/30 rounded-r-[1px]" />
            </div>
            <span>{batteryLevel !== null ? `${batteryLevel}%` : '--%'}</span>
          </div>

          <div className="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
            <span>CONNECTED</span>
          </div>
        </div>
      </div>

      {/* Subtle Halo around cursor */}
      <div
        className="fixed pointer-events-none z-40 rounded-full mix-blend-screen transition-all duration-100 ease-out"
        style={{
          left: mousePos.x,
          top: mousePos.y,
          transform: 'translate(-50%, -50%)',
          width: `${dynamicRadius * 1.5}px`,
          height: `${dynamicRadius * 1.5}px`,
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)',
        }}
      />

      {/* Corner Brackets */}
      <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-white/20" />
      <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-white/20" />
      <div className="absolute bottom-6 left-6 w-4 h-4 border-b border-l border-white/20" />
      <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-white/20" />
    </div>
  );
};

export default NotFound;
