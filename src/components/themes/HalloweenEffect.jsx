import { useEffect, useRef } from "react";

export default function HalloweenEffect() {
  const containerRef = useRef(null);
  const batsRef = useRef([]);
  const spidersRef = useRef([]);
  const ghostsRef = useRef([{ x: 25, y: 40, phase: 0 }, { x: 50, y: 40, phase: Math.PI }, { x: 75, y: 40, phase: Math.PI / 2 }]);
  const mouseYRef = useRef(50);
  const pumpkinsRef = useRef([
    { x: 15, scale: 1, phase: 0 },
    { x: 85, scale: 1, phase: Math.PI }
  ]);

  useEffect(() => {
    let frameId;

    const batInterval = setInterval(() => {
      const id = Date.now() + Math.random();
      batsRef.current.push({ 
        id, 
        y: 15 + Math.random() * 60, 
        x: 110, 
        wave: Math.random() > 0.5,
        size: 0.8 + Math.random() * 0.5
      });
      setTimeout(() => {
        const idx = batsRef.current.findIndex(b => b.id === id);
        if (idx !== -1) batsRef.current.splice(idx, 1);
      }, 8000);
    }, 2800);

    const spiderInterval = setInterval(() => {
      const id = Date.now() + Math.random();
      spidersRef.current.push({ id, x: 15 + Math.random() * 70, y: -10, swing: 0 });
      setTimeout(() => {
        const idx = spidersRef.current.findIndex(s => s.id === id);
        if (idx !== -1) spidersRef.current.splice(idx, 1);
      }, 12000);
    }, 4000);

    const render = () => {
      const time = Date.now() / 1000;
      
      batsRef.current.forEach(bat => {
        bat.x -= 1.2;
        if (bat.wave) bat.y += Math.sin(time * 3) * 0.3;
      });

      spidersRef.current.forEach(spider => {
        spider.y += 0.3;
        spider.swing = Math.sin(time * 2) * 2;
      });

      ghostsRef.current.forEach(ghost => {
        ghost.y = ghost.y * 0.92 + (40 + (mouseYRef.current - 50) * 0.3 + Math.sin(time + ghost.phase) * 3) * 0.08;
        ghost.phase += 0.02;
      });

      pumpkinsRef.current.forEach(pumpkin => {
        pumpkin.scale = 1 + Math.sin(time * 1.5 + pumpkin.phase) * 0.08;
        pumpkin.phase += 0.01;
      });

      if (containerRef.current) {
        const webHTML = `<svg class="absolute top-0 w-full h-40 opacity-70" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
          ${[18, 48, 78].map(x => `
            <g>
              <circle cx="${x}%" cy="15" r="5" fill="#e0e0e0" opacity="0.8"/>
              ${[-3, -1, 0, 1, 3].map(offset => `
                <line x1="${x}%" y1="15" x2="${x + offset * 6}%" y2="130" 
                  stroke="#d0d0d0" stroke-width="1.8" opacity="0.6"/>
                ${Array.from({length: 3}, (_, i) => `
                  <line x1="${x + offset * 6}%" y1="${45 + i * 30}" 
                    x2="${x + (offset + 1) * 6}%" y2="${45 + i * 30}" 
                    stroke="#d0d0d0" stroke-width="1.5" opacity="0.5"/>
                `).join('')}
              `).join('')}
            </g>
          `).join('')}
        </svg>`;

        const batsHTML = batsRef.current.map(bat => 
          `<div class="absolute" style="transform:translate3d(${bat.x}vw,${bat.y}vh,0) scale(${bat.size});font-size:2rem;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.6));will-change:transform;contain:layout style paint">🦇</div>`
        ).join('');

        const spidersHTML = spidersRef.current.map(spider =>
          `<div class="absolute" style="transform:translate3d(${spider.x + spider.swing}vw,${spider.y}vh,0);contain:layout style paint">
            <div class="absolute w-0.5 bg-gradient-to-b from-gray-400 via-gray-300 to-transparent" style="height:100vh;left:10px;opacity:0.7"></div>
            <div class="text-2xl" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.5))">🕷️</div>
          </div>`
        ).join('');

        const ghostsHTML = ghostsRef.current.map((ghost, i) =>
          `<div class="absolute text-4xl" style="transform:translate3d(${ghost.x}vw,${ghost.y}vh,0);filter:drop-shadow(0 0 20px rgba(138,43,226,0.8)) drop-shadow(0 0 40px rgba(138,43,226,0.4));opacity:0.9;will-change:transform;contain:layout style paint">👻</div>`
        ).join('');

        const pumpkinsHTML = pumpkinsRef.current.map(p =>
          `<div class="absolute text-6xl bottom-8" style="transform:translate3d(${p.x}vw,0,0) scale(${p.scale});filter:drop-shadow(0 8px 16px rgba(255,100,0,0.4)) brightness(1.1);will-change:transform">🎃</div>`
        ).join('');

        const fogHTML = `<div class="absolute bottom-0 w-full h-48 pointer-events-none">
          ${[0, 35, 70].map((x, i) => `
            <div class="absolute" style="left:${x}%;bottom:-20px;width:350px;height:140px;background:radial-gradient(ellipse,rgba(138,43,226,0.22),transparent);filter:blur(25px);animation:fog-drift ${18 + i * 3}s linear infinite;will-change:transform"></div>
          `).join('')}
        </div>`;

        containerRef.current.innerHTML = webHTML + batsHTML + spidersHTML + ghostsHTML + pumpkinsHTML + fogHTML;
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

  return (
    <>
      <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50" style={{ contain: 'layout style paint' }} />
      <style jsx>{`
        @keyframes fog-drift { 0% { transform: translateX(0); } 100% { transform: translateX(150px); } }
      `}</style>
    </>
  );
}