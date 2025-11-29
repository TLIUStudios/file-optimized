import { useEffect, useRef, useCallback } from "react";

export default function SnowEffect() {
  const containerRef = useRef(null);
  const snowflakesRef = useRef([]);
  const frameRef = useRef(0);

  useEffect(() => {
    // Reduced particle count for performance
    const particleCount = window.innerWidth < 768 ? 15 : 25;
    
    snowflakesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100 - 100,
      size: 3 + Math.random() * 4,
      speed: 0.15 + Math.random() * 0.25,
      drift: (Math.random() - 0.5) * 0.15,
      opacity: 0.5 + Math.random() * 0.4,
    }));

    let lastTime = 0;
    const targetFPS = 30; // Cap at 30fps for smooth performance
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= frameInterval) {
        lastTime = currentTime - (deltaTime % frameInterval);
        
        snowflakesRef.current.forEach(flake => {
          flake.y += flake.speed;
          flake.x += flake.drift + Math.sin(currentTime * 0.001 + flake.id) * 0.05;

          if (flake.y > 105) {
            flake.x = Math.random() * 100;
            flake.y = -5;
          }
          if (flake.x < -5) flake.x = 105;
          if (flake.x > 105) flake.x = -5;
        });

        if (containerRef.current) {
          containerRef.current.innerHTML = snowflakesRef.current.map(f => 
            `<div style="position:absolute;left:${f.x}%;top:${f.y}%;width:${f.size}px;height:${f.size}px;background:#fff;border-radius:50%;opacity:${f.opacity};box-shadow:0 0 6px rgba(255,255,255,0.8);will-change:transform"></div>`
          ).join('');
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      style={{ contain: 'strict' }}
    />
  );
}