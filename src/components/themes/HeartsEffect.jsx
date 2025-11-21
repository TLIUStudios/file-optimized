import { useEffect, useRef } from "react";

export default function HeartsEffect() {
  const containerRef = useRef(null);
  const heartsRef = useRef([]);

  useEffect(() => {
    let frameId;

    const handleClick = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const colors = [
        { main: '#ff1493', glow: 'rgba(255,20,147,0.6)' },
        { main: '#ff69b4', glow: 'rgba(255,105,180,0.6)' },
        { main: '#ffc0cb', glow: 'rgba(255,192,203,0.6)' },
        { main: '#ff6b9d', glow: 'rgba(255,107,157,0.6)' }
      ];
      
      for (let i = 0; i < 5; i++) {
        const id = Date.now() + Math.random() + i;
        const color = colors[Math.floor(Math.random() * colors.length)];
        heartsRef.current.push({
          id, 
          x: x + (Math.random() - 0.5) * 10, 
          y: 100,
          color,
          size: 1.5 + Math.random() * 1,
          vx: (Math.random() - 0.5) * 1.8,
          vy: -3 - Math.random() * 2,
          rotation: (Math.random() - 0.5) * 40,
          rv: (Math.random() - 0.5) * 3,
        });
        setTimeout(() => {
          const idx = heartsRef.current.findIndex(h => h.id === id);
          if (idx !== -1) heartsRef.current.splice(idx, 1);
        }, 3000);
      }
    };

    const autoInterval = setInterval(() => {
      const id = Date.now() + Math.random();
      const colors = [
        { main: '#ff1493', glow: 'rgba(255,20,147,0.6)' },
        { main: '#ff69b4', glow: 'rgba(255,105,180,0.6)' },
        { main: '#ffc0cb', glow: 'rgba(255,192,203,0.6)' },
        { main: '#ff6b9d', glow: 'rgba(255,107,157,0.6)' }
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      heartsRef.current.push({
        id, 
        x: Math.random() * 100, 
        y: 105,
        color,
        size: 1.2 + Math.random() * 0.8,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -1.5 - Math.random() * 1,
        rotation: (Math.random() - 0.5) * 30,
        rv: (Math.random() - 0.5) * 2,
      });
      setTimeout(() => {
        const idx = heartsRef.current.findIndex(h => h.id === id);
        if (idx !== -1) heartsRef.current.splice(idx, 1);
      }, 6000);
    }, 1200);

    const render = () => {
      heartsRef.current.forEach(heart => {
        heart.x += heart.vx * 0.08;
        heart.y += heart.vy * 0.08;
        heart.rotation += heart.rv;
        heart.vx += (Math.random() - 0.5) * 0.02;
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = heartsRef.current.map(h => {
          const opacity = Math.max(0, Math.min(1, (110 - h.y) / 18));
          return `<div class="absolute" style="transform:translate3d(${h.x}vw,${h.y}vh,0) rotate(${h.rotation}deg);font-size:${h.size}rem;filter:drop-shadow(0 0 ${h.size * 8}px ${h.color.glow}) drop-shadow(0 0 ${h.size * 4}px ${h.color.glow});opacity:${opacity};will-change:transform;contain:layout style paint"><span style="color:${h.color.main}">💕</span></div>`;
        }).join('');
      }

      frameId = requestAnimationFrame(render);
    };

    window.addEventListener('click', handleClick, { passive: true });
    frameId = requestAnimationFrame(render);

    return () => {
      clearInterval(autoInterval);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50" style={{ contain: 'layout style paint' }} />;
}