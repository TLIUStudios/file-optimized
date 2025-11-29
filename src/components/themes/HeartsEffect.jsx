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
      const count = burst ? 5 : 1;
      const hearts = ['💕', '💗', '💖', '❤️', '💝', '💓'];
      
      for (let i = 0; i < count; i++) {
        heartsRef.current.push({
          x: x + (burst ? (Math.random() - 0.5) * 40 : 0),
          y: y,
          vx: burst ? (Math.random() - 0.5) * 3 : (Math.random() - 0.5) * 0.5,
          vy: burst ? -3 - Math.random() * 2 : -0.8 - Math.random() * 0.4,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 4,
          life: 1,
          heart: hearts[Math.floor(Math.random() * hearts.length)],
          size: 18 + Math.random() * 14,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.05 + Math.random() * 0.05,
        });
      }
    };

    // Create initial hearts
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        createHeart(Math.random() * window.innerWidth, window.innerHeight * Math.random());
      }, i * 200);
    }

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= frameInterval) {
        lastTime = currentTime - (deltaTime % frameInterval);

        heartsRef.current = heartsRef.current.filter(h => {
          h.wobble += h.wobbleSpeed;
          h.x += h.vx + Math.sin(h.wobble) * 0.5;
          h.y += h.vy;
          h.vy += 0.015; // lighter gravity so they float up more
          h.rotation += h.rotationSpeed;
          h.life -= 0.006;
          return h.life > 0 && h.y > -50;
        });

        // Keep max 60 hearts for performance
        if (heartsRef.current.length > 60) {
          heartsRef.current = heartsRef.current.slice(-60);
        }

        if (containerRef.current) {
          containerRef.current.innerHTML = heartsRef.current.map(h =>
            `<div style="position:absolute;left:${h.x}px;top:${h.y}px;transform:rotate(${h.rotation}deg) scale(${0.8 + h.life * 0.2});font-size:${h.size}px;opacity:${h.life};filter:drop-shadow(0 0 8px rgba(255,105,180,0.7));will-change:transform">${h.heart}</div>`
          ).join('');
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    const handleClick = (e) => createHeart(e.clientX, e.clientY, true);
    
    // Auto spawn hearts from bottom - more frequent
    const autoHeart = setInterval(() => {
      const x = Math.random() * window.innerWidth;
      createHeart(x, window.innerHeight + 30);
    }, 800);

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