import { useEffect, useRef } from 'react';

export function AnimatedGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Grid configuration - larger grid, fewer lines
    const gridSize = 120; // Doubled from 60
    const comets: Array<{
      x: number;
      y: number;
      direction: 'horizontal' | 'vertical';
      progress: number;
      speed: number;
      intensity: number;
      length: number;
    }> = [];

    // Detect theme
    const isDarkTheme = () => {
      return document.documentElement.classList.contains('dark');
    };

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      // Theme changed, no need to restart animation as it checks theme each frame
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Create initial comets - fewer comets
    const createComet = () => {
      const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
      const speed = 0.001 + Math.random() * 0.004; // Even slower
      const intensity = 0.2 + Math.random() * 0.5; // Lower intensity
      const length = 80 + Math.random() * 120; // Shorter trails

      if (direction === 'horizontal') {
        const row = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
        return {
          x: -length,
          y: row,
          direction,
          progress: 0,
          speed,
          intensity,
          length
        };
      } else {
        const col = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
        return {
          x: col,
          y: -length,
          direction,
          progress: 0,
          speed,
          intensity,
          length
        };
      }
    };

    // Add fewer initial comets
    for (let i = 0; i < 2; i++) {
      comets.push(createComet());
    }

    const animate = () => {
      // Clear canvas completely
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dark = isDarkTheme();
      
      // Draw static grid - thinner lines, theme-aware
      ctx.strokeStyle = dark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 0.5; // Much thinner
      
      // Vertical lines - fewer lines
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal lines - fewer lines
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Update and draw comets
      comets.forEach((comet, index) => {
        // Update position
        comet.progress += comet.speed;
        
        if (comet.direction === 'horizontal') {
          comet.x = -comet.length + (canvas.width + comet.length * 2) * comet.progress;
        } else {
          comet.y = -comet.length + (canvas.height + comet.length * 2) * comet.progress;
        }

        // Draw comet trail - theme-aware colors
        const gradient = ctx.createLinearGradient(
          comet.direction === 'horizontal' ? comet.x - comet.length : comet.x,
          comet.direction === 'horizontal' ? comet.y : comet.y - comet.length,
          comet.x,
          comet.y
        );
        
        const baseColor = dark ? '59, 130, 246' : '37, 99, 235'; // Blue for dark, darker blue for light
        
        gradient.addColorStop(0, `rgba(${baseColor}, 0)`);
        gradient.addColorStop(0.5, `rgba(${baseColor}, ${comet.intensity * 0.2})`);
        gradient.addColorStop(1, `rgba(${baseColor}, ${comet.intensity * 0.6})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1; // Thinner comet trail
        ctx.shadowColor = dark ? '#3B82F6' : '#2563EB';
        ctx.shadowBlur = 6; // Less blur
        
        ctx.beginPath();
        if (comet.direction === 'horizontal') {
          ctx.moveTo(comet.x - comet.length, comet.y);
          ctx.lineTo(comet.x, comet.y);
        } else {
          ctx.moveTo(comet.x, comet.y - comet.length);
          ctx.lineTo(comet.x, comet.y);
        }
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowBlur = 0;

        // Remove comet if it's off screen and create a new one
        if (comet.progress >= 1) {
          comets[index] = createComet();
        }
      });

      // Rarely add new comets - much less frequent
      if (Math.random() < 0.002 && comets.length < 3) {
        comets.push(createComet());
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
}