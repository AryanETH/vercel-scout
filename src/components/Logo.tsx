import { useImagePreloader } from "@/hooks/useImagePreloader";

export function Logo() {
  const { isLoaded, cachedSrc } = useImagePreloader('/yourel-logo.png');

  const handleClick = () => {
    window.location.href = '/';
  };

  return (
    <button 
      onClick={handleClick}
      className="flex items-center gap-2 animate-fade-up hover:scale-105 transition-transform duration-300"
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: "50px", height: "50px" }}
      >
        {isLoaded && cachedSrc ? (
          <img
            src={cachedSrc}
            alt="Yourel Logo"
            className="w-full h-full object-contain rounded-lg"
            style={{ imageRendering: 'crisp-edges' }}
          />
        ) : (
          // Fallback while loading
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg flex items-center justify-center">
            <svg 
              width="32" 
              height="24" 
              viewBox="0 0 32 24" 
              fill="none" 
              className="text-white"
            >
              <path 
                d="M4 4L16 16L28 4" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          YOUREL
        </h1>
      </div>
    </button>
  );
}
