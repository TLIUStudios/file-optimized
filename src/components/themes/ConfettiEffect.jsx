import { useEffect, useRef } from "react";

export default function ConfettiEffect() {
  const containerRef = useRef(null);
  const piecesRef = useRef([]);
  const frameRef = useRef(0);

  useEffect(() => {
    let lastTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;
    const colors = ['#ff0844', '#ffd23f', '#00d9ff', '#b337ff', '#00ff88', '#ff3d9e'];

    const createConfetti = (x, y, count = 15) => {
      for (let i = 0; i < count; i++) {
        piecesRef.current.push({
          x, y,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: Math.random() > 0.5 ? 'circle' : 'rect',
          size: 5 + Math.random() * 5,
          vx: (Math.random() - 0.5) * 2,
          vy: -1 - Math.random() * 2,
          rotation: Math.random() * 360,
          rv: (Math.random() - 0.5) * 10,
          life: 1,
        });
      }
    };

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= frameInterval) {
        lastTime = currentTime - (deltaTime % frameInterval);

        piecesRef.current = piecesRef.current.filter(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.03; // gravity
          p.rotation += p.rv;
          p.life -= 0.008;
          return p.life > 0 && p.y < 110;
        });

        // Keep max 100 pieces for performance
        if (piecesRef.current.length > 100) {
          piecesRef.current = piecesRef.current.slice(-100);
        }

        if (containerRef.current) {
          containerRef.current.innerHTML = piecesRef.current.map(p => {
            const style = p.shape === 'circle' 
              ? `width:${p.size}px;height:${p.size}px;border-radius:50%`
              : `width:${p.size}px;height:${p.size * 0.6}px`;
            return `<div style="position:absolute;left:${p.x}%;top:${p.y}%;transform:rotate(${p.rotation}deg);${style};background:${p.color};opacity:${p.life};box-shadow:0 0 4px ${p.color}"></div>`;
          }).join('');
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    // Auto confetti bursts
    const autoInterval = setInterval(() => {
      createConfetti(30 + Math.random() * 40, -5, 10);
    }, 3000);

    // Click to create confetti
    const handleClick = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      createConfetti(x, y, 18);
    };

    // Initial burst
    setTimeout(() => createConfetti(50, 10, 12), 300);

    window.addEventListener('click', handleClick, { passive: true });
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(autoInterval);
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