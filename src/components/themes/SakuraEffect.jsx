import { useEffect, useRef } from "react";

export default function SakuraEffect() {
  const containerRef = useRef(null);
  const petalsRef = useRef([]);

  useEffect(() => {
    for (let i = 0; i < 20; i++) {
      petalsRef.current.push({
        x: Math.random() * 100,
        y: Math.random() * -100,
        rotation: Math.random() * 360,
        wobble: Math.random() * Math.PI * 2,
      });
    }

    let frameId;

    const render = () => {
      petalsRef.current.forEach(p => {
        p.x += Math.sin(p.wobble) * 0.3;
        p.y += 0.5;
        p.rotation += 2;
        p.wobble += 0.03;

        if (p.y > 110) {
          p.y = -10;
          p.x = Math.random() * 100;
        }
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = petalsRef.current.map(p =>
          `<div style="position:absolute;left:${p.x}%;top:${p.y}%;transform:rotate(${p.rotation}deg);font-size:20px;opacity:0.8;filter:drop-shadow(0 0 6px rgba(255,182,193,0.5))">🌸</div>`
        ).join('');
      }

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(frameId);
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50" />;
}