import { useEffect, useRef } from "react";

export default function FireworksEffect() {
  const containerRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    let frameId;
    
    const createFirework = (x, y) => {
      const colors = ['#ff0844', '#ffd23f', '#00d9ff', '#b337ff', '#00ff88'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 * i) / 30;
        const speed = 2 + Math.random() * 2;
        particlesRef.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color,
        });
      }
    };

    const render = () => {
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= 0.02;
        return p.life > 0;
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = particlesRef.current.map(p =>
          `<div style="position:absolute;left:${p.x}px;top:${p.y}px;width:3px;height:3px;border-radius:50%;background:${p.color};opacity:${p.life};box-shadow:0 0 4px ${p.color}"></div>`
        ).join('');
      }

      frameId = requestAnimationFrame(render);
    };

    const handleClick = (e) => createFirework(e.clientX, e.clientY);

    const autoFirework = setInterval(() => {
      createFirework(
        window.innerWidth * (0.3 + Math.random() * 0.4),
        window.innerHeight * (0.2 + Math.random() * 0.3)
      );
    }, 2000);

    window.addEventListener('click', handleClick);
    frameId = requestAnimationFrame(render);

    return () => {
      clearInterval(autoFirework);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50" />;
}