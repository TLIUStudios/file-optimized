import { useEffect, useRef } from "react";

export default function FireworksEffect() {
  const containerRef = useRef(null);
  const particlesRef = useRef([]);
  const frameRef = useRef(0);

  useEffect(() => {
    let lastTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;
    
    const colors = ['#ff0844', '#ffd23f', '#00d9ff', '#b337ff', '#00ff88'];
    
    const createFirework = (x, y) => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const particleCount = window.innerWidth < 768 ? 15 : 25;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 1.5 + Math.random() * 1.5;
        particlesRef.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color,
          size: 2 + Math.random() * 2,
        });
      }
    };

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= frameInterval) {
        lastTime = currentTime - (deltaTime % frameInterval);
        
        // Update particles
        particlesRef.current = particlesRef.current.filter(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.04; // gravity
          p.life -= 0.015;
          return p.life > 0;
        });

        // Keep max 150 particles for performance
        if (particlesRef.current.length > 150) {
          particlesRef.current = particlesRef.current.slice(-150);
        }

        if (containerRef.current) {
          containerRef.current.innerHTML = particlesRef.current.map(p =>
            `<div style="position:absolute;left:${p.x}px;top:${p.y}px;width:${p.size}px;height:${p.size}px;border-radius:50%;background:${p.color};opacity:${p.life};box-shadow:0 0 4px ${p.color}"></div>`
          ).join('');
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    // Auto fireworks every 3 seconds
    const autoFirework = setInterval(() => {
      createFirework(
        window.innerWidth * (0.2 + Math.random() * 0.6),
        window.innerHeight * (0.15 + Math.random() * 0.35)
      );
    }, 3000);

    // Click to create firework
    const handleClick = (e) => {
      createFirework(e.clientX, e.clientY);
    };

    // Initial firework
    setTimeout(() => {
      createFirework(window.innerWidth * 0.5, window.innerHeight * 0.3);
    }, 500);

    window.addEventListener('click', handleClick, { passive: true });
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(autoFirework);
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