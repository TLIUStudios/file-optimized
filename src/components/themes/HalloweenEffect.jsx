import { useEffect, useRef } from "react";

export default function HalloweenEffect() {
  const containerRef = useRef(null);
  const batsRef = useRef([]);
  const spidersRef = useRef([]);
  const ghostsRef = useRef([{ x: 25, y: 40 }, { x: 50, y: 40 }, { x: 75, y: 40 }]);
  const mouseYRef = useRef(50);

  useEffect(() => {
    let frameId;

    const batInterval = setInterval(() => {
      const id = Date.now() + Math.random();
      batsRef.current.push({ id, y: 20 + Math.random() * 50, x: 110, wave: Math.random() > 0.5 });
      setTimeout(() => {
        const idx = batsRef.current.findIndex(b => b.id === id);
        if (idx !== -1) batsRef.current.splice(idx, 1);
      }, 6000);
    }, 3500);

    const spiderInterval = setInterval(() => {
      const id = Date.now() + Math.random();
      spidersRef.current.push({ id, x: 20 + Math.random() * 60, y: -10 });
      setTimeout(() => {
        const idx = spidersRef.current.findIndex(s => s.id === id);
        if (idx !== -1) spidersRef.current.splice(idx, 1);
      }, 9000);
    }, 5000);

    const render = () => {
      batsRef.current.forEach(bat => {
        bat.x -= 0.8;
        if (bat.wave) bat.y += Math.sin(Date.now() / 400) * 0.2;
      });

      spidersRef.current.forEach(spider => spider.y += 0.35);

      ghostsRef.current.forEach(ghost => {
        ghost.y = ghost.y * 0.95 + (40 + (mouseYRef.current - 50) * 0.25) * 0.05;
      });

      if (containerRef.current) {
        const batsHTML = batsRef.current.map(bat => 
          `<div class="absolute text-2xl" style="transform:translate3d(${bat.x}vw,${bat.y}vh,0);filter:drop-shadow(0 3px 6px rgba(0,0,0,0.5));will-change:transform;contain:layout style paint">🦇</div>`
        ).join('');

        const spidersHTML = spidersRef.current.map(spider =>
          `<div class="absolute" style="transform:translate3d(${spider.x}vw,${spider.y}vh,0);contain:layout style paint"><div class="absolute w-0.5 bg-gradient-to-b from-gray-300 to-transparent" style="height:100vh;left:8px"></div><div class="text-xl" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">🕷️</div></div>`
        ).join('');

        const ghostsHTML = ghostsRef.current.map(ghost =>
          `<div class="absolute text-3xl" style="transform:translate3d(${ghost.x}vw,${ghost.y}vh,0);filter:drop-shadow(0 0 15px rgba(138,43,226,0.6));opacity:0.85;will-change:transform;contain:layout style paint;transition:transform 0.3s ease-out">👻</div>`
        ).join('');

        containerRef.current.innerHTML = `
          <svg class="absolute top-0 w-full h-32 opacity-75">
            ${[20, 45, 70].map(x => `<g><circle cx="${x}%" cy="18" r="4" fill="#ddd"/>${[-2, 0, 2].map(offset => `<line x1="${x}%" y1="18" x2="${x + offset * 5}%" y2="90" stroke="#ccc" stroke-width="1.5"/>`).join('')}</g>`).join('')}
          </svg>
          ${batsHTML}${spidersHTML}${ghostsHTML}
        `;
      }

      frameId = requestAnimationFrame(render);
    };

    const handleMouse = (e) => {
      mouseYRef.current = (e.clientY / window.innerHeight) * 100;
    };

    window.addEventListener('mousemove', handleMouse, { passive: true });
    frameId = requestAnimationFrame(render);

    return () => {
      clearInterval(batInterval);
      clearInterval(spiderInterval);
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50" style={{ contain: 'layout style paint' }} />;
}