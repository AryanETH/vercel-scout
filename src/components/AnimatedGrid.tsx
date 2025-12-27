import { useEffect, useRef } from 'react';

export function AnimatedGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to full page
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Grid properties
    const gridSize = 40;
    
    // Comet properties
    const comets: Array<{
      x: number;
      y: number;
      dx: number;
      dy: number;
      trail: Array<{ x: number; y: number; opacity: number }>;
      isVertical: boolean;
      speed: number;
      gridLine: number;
    }> = [];

    // Track used grid lines separately for vertical and horizontal
    const usedVerticalLines: Set<number> = new Set();
    const usedHorizontalLines: Set<number> = new Set();

    const getUniqueGridLine = (isVertical: boolean): number => {
      const maxLines = isVertical 
        ? Math.floor(canvas.width / gridSize)
        : Math.floor(canvas.height / gridSize);
      const usedLines = isVertical ? usedVerticalLines : usedHorizontalLines;
      
      let gridLine: number;
      let attempts = 0;
      
      do {
        gridLine = Math.floor(Math.random() * maxLines) * gridSize;
        attempts++;
      } while (usedLines.has(gridLine) && attempts < 50);
      
      usedLines.add(gridLine);
      return gridLine;
    };

    const removeGridLine = (gridLine: number, isVertical: boolean) => {
      if (isVertical) {
        usedVerticalLines.delete(gridLine);
      } else {
        usedHorizontalLines.delete(gridLine);
      }
    };

    // Initialize comets
    const initComets = () => {
      comets.length = 0;
      usedVerticalLines.clear();
      usedHorizontalLines.clear();
      
      for (let i = 0; i < 2; i++) {
        const speedVariations = [
          0.3 + Math.random() * 0.4,
          0.8 + Math.random() * 0.6,
          1.5 + Math.random() * 1.0,
          2.5 + Math.random() * 1.5
        ];
        
        const speed = speedVariations[Math.floor(Math.random() * speedVariations.length)];
        const isVertical = Math.random() > 0.5;
        const gridLine = getUniqueGridLine(isVertical);
        
        if (isVertical) {
          comets.push({
            x: gridLine,
            y: Math.random() * canvas.height,
            dx: 0,
            dy: speed,
            trail: [],
            isVertical: true,
            speed: speed,
            gridLine
          });
        } else {
          comets.push({
            x: Math.random() * canvas.width,
            y: gridLine,
            dx: speed,
            dy: 0,
            trail: [],
            isVertical: false,
            speed: speed,
            gridLine
          });
        }
      }
    };

    initComets();

    // Animation function
    const animate = () => {
      // Clear canvas completely each frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Get theme colors
      const isDark = document.documentElement.classList.contains('dark');
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
      
      // Draw full-page grid
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      
      // Vertical lines - full height
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      
      // Horizontal lines - full width
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      
      ctx.stroke();

      // Update and draw comets
      comets.forEach((comet, index) => {
        // Add current position to trail
        comet.trail.push({
          x: comet.x,
          y: comet.y,
          opacity: 1
        });
        
        // Limit trail length and fade - made longer
        if (comet.trail.length > 60) {
          comet.trail.shift();
        }
        
        // Update trail opacity
        comet.trail.forEach((point, i) => {
          point.opacity = (i / comet.trail.length) * 0.8;
        });
        
        // Draw trail (very slim) with 50% opacity
        if (comet.trail.length > 1) {
          for (let i = 1; i < comet.trail.length; i++) {
            const current = comet.trail[i];
            const previous = comet.trail[i - 1];
            
            ctx.strokeStyle = `rgba(139, 92, 246, ${current.opacity * 0.3})`; // Reduced from 0.6 to 0.3 (50% of original)
            ctx.lineWidth = 0.5 + (current.opacity * 1.5); // Very slim, max 2px
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(previous.x, previous.y);
            ctx.lineTo(current.x, current.y);
            ctx.stroke();
          }
        }
        
        // Draw comet head (bright point) with 50% opacity
        ctx.fillStyle = `rgba(139, 92, 246, 0.45)`; // Reduced from 0.9 to 0.45 (50%)
        ctx.shadowColor = 'rgba(139, 92, 246, 0.25)'; // Reduced from 0.5 to 0.25 (50%)
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Update position (vertical or horizontal movement)
        if (comet.isVertical) {
          comet.y += comet.dy;
          
          // Reset when off screen - get a NEW unique grid line
          if (comet.y > canvas.height + 50) {
            removeGridLine(comet.gridLine, true);
            const newGridLine = getUniqueGridLine(true);
            comet.gridLine = newGridLine;
            comet.x = newGridLine;
            comet.y = -50;
            comet.trail = [];
          }
        } else {
          comet.x += comet.dx;
          
          // Reset when off screen - get a NEW unique grid line
          if (comet.x > canvas.width + 50) {
            removeGridLine(comet.gridLine, false);
            const newGridLine = getUniqueGridLine(false);
            comet.gridLine = newGridLine;
            comet.y = newGridLine;
            comet.x = -50;
            comet.trail = [];
          }
        }
      });

      // Spawn new comets when needed to maintain at least 2 on screen
      if (comets.length < 2 && Math.random() < 0.02) {
        const speedVariations = [
          0.3 + Math.random() * 0.4,
          0.8 + Math.random() * 0.6,
          1.5 + Math.random() * 1.0,
          2.5 + Math.random() * 1.5
        ];
        
        const speed = speedVariations[Math.floor(Math.random() * speedVariations.length)];
        const isVertical = Math.random() > 0.5;
        const gridLine = getUniqueGridLine(isVertical);
        
        if (isVertical) {
          comets.push({
            x: gridLine,
            y: -50,
            dx: 0,
            dy: speed,
            trail: [],
            isVertical: true,
            speed: speed,
            gridLine
          });
        } else {
          comets.push({
            x: -50,
            y: gridLine,
            dx: speed,
            dy: 0,
            trail: [],
            isVertical: false,
            speed: speed,
            gridLine
          });
        }
        
        // Allow up to 3 comets maximum
        if (comets.length > 3) {
          const removed = comets.splice(0, comets.length - 3);
          removed.forEach(c => removeGridLine(c.gridLine, c.isVertical));
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        background: 'transparent'
      }}
    />
  );
}