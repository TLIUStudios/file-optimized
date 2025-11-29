import { useEffect, useRef } from "react";

export default function HeartsEffect() {
  const containerRef = useRef(null);
  const heartsRef = useRef([]);
  const frameRef = useRef(0);

  useEffect(() => {
    let lastTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;

    const createHeart = (x, y, burst = false) => {
      const count = burst ? 4 : 1;
      const hearts = ['💕', '💗', '💖', '❤️'];
      
      for (let i = 0; i < count; i++) {
        heartsRef.current.push({
          x, y,
          vx: burst ? (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 0.3,
          vy: burst ? -2 - Math.random() * 1.5 : -1 - Math.random() * 0.5,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 3,
          life: 1,
          heart: hearts[Math.floor(Math.random() * hearts.length)],
          size: 16 + Math.random() * 10,
        });
      }
    };

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= frameInterval) {
        lastTime = currentTime - (deltaTime % frameInterval);

        heartsRef.current = heartsRef.current.filter(h => {
          h.x += h.vx;
          h.y += h.vy;
          h.vy += 0.02; // light gravity
          h.rotation += h.rotationSpeed;
          h.life -= 0.008;
          return h.life > 0;
        });

        // Keep max 50 hearts for performance
        if (heartsRef.current.length > 50) {
          heartsRef.current = heartsRef.current.slice(-50);
        }

        if (containerRef.current) {
          containerRef.current.innerHTML = heartsRef.current.map(h =>
            `<div style="position:absolute;left:${h.x}px;top:${h.y}px;transform:rotate(${h.rotation}deg);font-size:${h.size}px;opacity:${h.life};filter:drop-shadow(0 0 6px #ff69b4)">${h.heart}</div>`
          ).join('');
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    const handleClick = (e) => createHeart(e.clientX, e.clientY, true);
    
    // Auto spawn hearts
    const autoHeart = setInterval(() => {
      createHeart(Math.random() * window.innerWidth, window.innerHeight + 20);
    }, 1500);

    window.addEventListener('click', handleClick, { passive: true });
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(autoHeart);
      window.removeEventListener('click', handleClick);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
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