import { useEffect, useRef } from "react";

export default function ConfettiEffect() {
  const containerRef = useRef(null);
  const piecesRef = useRef([]);

  useEffect(() => {
    let frameId;

    const handleClick = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      const colors = ['#ff0844', '#ffd23f', '#00d9ff', '#b337ff', '#00ff88', '#ff3d9e'];
      
      for (let i = 0; i < 22; i++) {
        const id = Date.now() + Math.random() + i;
        piecesRef.current.push({
          id, x, y,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: Math.random() > 0.5 ? 'circle' : 'rect',
          size: 6 + Math.random() * 6,
          vx: (Math.random() - 0.5) * 3,
          vy: -1.5 - Math.random() * 3,
          rotation: Math.random() * 360,
          rv: (Math.random() - 0.5) * 15,
        });
        setTimeout(() => {
          const idx = piecesRef.current.findIndex(p => p.id === id);
          if (idx !== -1) piecesRef.current.splice(idx, 1);
        }, 2600);
      }
    };

    const autoInterval = setInterval(() => {
      const colors = ['#ff0844', '#ffd23f', '#00d9ff', '#b337ff', '#00ff88', '#ff3d9e'];
      for (let i = 0; i < 14; i++) {
        const id = Date.now() + Math.random() + i;
        piecesRef.current.push({
          id, x: 40 + Math.random() * 20, y: -5,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: Math.random() > 0.5 ? 'circle' : 'rect',
          size: 6 + Math.random() * 5,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 0.7 + Math.random() * 1.5,
          rotation: Math.random() * 360,
          rv: (Math.random() - 0.5) * 12,
        });
        setTimeout(() => {
          const idx = piecesRef.current.findIndex(p => p.id === id);
          if (idx !== -1) piecesRef.current.splice(idx, 1);
        }, 3200);
      }
    }, 2500);

    const render = () => {
      piecesRef.current.forEach(piece => {
        piece.x += piece.vx * 0.07;
        piece.y += piece.vy * 0.07;
        piece.vy += 0.035;
        piece.rotation += piece.rv;
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = piecesRef.current.map(p => {
          const shapeHTML = p.shape === 'circle' 
            ? `<div style="width:${p.size}px;height:${p.size}px;border-radius:50%;background:${p.color};box-shadow:0 0 6px ${p.color}"></div>`
            : `<div style="width:${p.size}px;height:${p.size * 0.6}px;background:${p.color};box-shadow:0 0 5px ${p.color}"></div>`;
          
          return `<div class="absolute" style="transform:translate3d(${p.x}vw,${p.y}vh,0) rotate(${p.rotation}deg);opacity:${Math.max(0, 1 - p.y / 100)};will-change:transform;contain:layout style paint">${shapeHTML}</div>`;
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