import { useEffect, useRef } from "react";

export default function HeartsEffect() {
  const containerRef = useRef(null);
  const heartsRef = useRef([]);

  useEffect(() => {
    let frameId;

    const createHeart = (x, y, burst = false) => {
      const count = burst ? 5 : 1;
      for (let i = 0; i < count; i++) {
        heartsRef.current.push({
          x, y,
          vx: burst ? (Math.random() - 0.5) * 3 : (Math.random() - 0.5) * 0.5,
          vy: burst ? -3 - Math.random() * 2 : -1.5 - Math.random(),
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 4,
          life: 1,
        });
      }
    };

    const render = () => {
      heartsRef.current = heartsRef.current.filter(h => {
        h.x += h.vx;
        h.y += h.vy;
        h.vy += 0.03;
        h.rotation += h.rotationSpeed;
        h.life -= 0.01;
        return h.life > 0;
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = heartsRef.current.map(h =>
          `<div style="position:absolute;left:${h.x}px;top:${h.y}px;transform:rotate(${h.rotation}deg);font-size:26px;opacity:${h.life};filter:drop-shadow(0 0 8px #ff1493)">💕</div>`
        ).join('');
      }

      frameId = requestAnimationFrame(render);
    };

    const handleClick = (e) => createHeart(e.clientX, e.clientY, true);
    const autoHeart = setInterval(() => {
      createHeart(Math.random() * window.innerWidth, window.innerHeight + 20);
    }, 1200);

    window.addEventListener('click', handleClick);
    frameId = requestAnimationFrame(render);

    return () => {
      clearInterval(autoHeart);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50" />;
}