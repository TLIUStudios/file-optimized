import { useEffect, useRef } from "react";

export default function HalloweenEffect() {
  const containerRef = useRef(null);
  const batsRef = useRef([]);
  const ghostsRef = useRef([
    { x: 25, y: 40, wobble: 0 },
    { x: 50, y: 35, wobble: 1 },
    { x: 75, y: 38, wobble: 2 },
  ]);

  useEffect(() => {
    let frameId;

    const render = () => {
      batsRef.current.forEach(bat => {
        bat.x -= 0.8;
        bat.y += Math.sin(Date.now() / 300 + bat.id) * 0.2;
      });
      batsRef.current = batsRef.current.filter(b => b.x > -50);

      ghostsRef.current.forEach(ghost => {
        ghost.wobble = Math.sin(Date.now() / 800) * 3;
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = 
          `<div style="position:absolute;top:10px;left:30%;width:60px;height:60px;background:radial-gradient(circle,rgba(255,140,0,0.3),transparent);border-radius:50%"></div>` +
          `<div style="position:absolute;top:10px;right:30%;width:60px;height:60px;background:radial-gradient(circle,rgba(255,140,0,0.3),transparent);border-radius:50%"></div>` +
          batsRef.current.map(b =>
            `<div style="position:absolute;left:${b.x}vw;top:${b.y}vh;font-size:24px;filter:drop-shadow(0 0 4px rgba(0,0,0,0.5))">🦇</div>`
          ).join('') +
          ghostsRef.current.map(g =>
            `<div style="position:absolute;left:${g.x}%;top:${g.y}%;transform:translateX(${g.wobble}px);font-size:40px;filter:drop-shadow(0 0 12px rgba(138,43,226,0.6))">👻</div>`
          ).join('');
      }

      frameId = requestAnimationFrame(render);
    };

    const batInterval = setInterval(() => {
      batsRef.current.push({
        x: 105,
        y: 20 + Math.random() * 40,
        id: Math.random(),
      });
    }, 4000);

    frameId = requestAnimationFrame(render);

    return () => {
      clearInterval(batInterval);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50" />;
}