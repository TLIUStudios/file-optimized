import { useEffect, useRef } from "react";

export default function HeartsEffect() {
  const containerRef = useRef(null);
  const heartsRef = useRef([]);

  useEffect(() => {
    let frameId;

    const handleClick = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const colors = ['#ff69b4', '#ff1493', '#ffc0cb', '#ff6b9d'];
      
      for (let i = 0; i < 3; i++) {
        const id = Date.now() + Math.random() + i;
        heartsRef.current.push({
          id, x: x + (Math.random() - 0.5) * 6, y: 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 1.2 + Math.random() * 0.7,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -2.2 - Math.random() * 1.2,
        });
        setTimeout(() => {
          const idx = heartsRef.current.findIndex(h => h.id === id);
          if (idx !== -1) heartsRef.current.splice(idx, 1);
        }, 3200);
      }
    };

    const autoInterval = setInterval(() => {
      const id = Date.now() + Math.random();
      const colors = ['#ff69b4', '#ff1493', '#ffc0cb', '#ff6b9d'];
      heartsRef.current.push({
        id, x: Math.random() * 100, y: 105,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 1 + Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -1.1 - Math.random() * 0.7,
      });
      setTimeout(() => {
        const idx = heartsRef.current.findIndex(h => h.id === id);
        if (idx !== -1) heartsRef.current.splice(idx, 1);
      }, 6500);
    }, 2000);

    const render = () => {
      heartsRef.current.forEach(heart => {
        heart.x += heart.vx * 0.07;
        heart.y += heart.vy * 0.07;
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = heartsRef.current.map(h =>
          `<div class="absolute" style="transform:translate3d(${h.x}vw,${h.y}vh,0);font-size:${h.size}rem;color:${h.color};filter:drop-shadow(0 0 6px ${h.color});opacity:${Math.max(0, Math.min(1, (110 - h.y) / 16))};will-change:transform;contain:layout style paint">💕</div>`
        ).join('');
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