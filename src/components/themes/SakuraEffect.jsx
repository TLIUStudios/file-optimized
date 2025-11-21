import { useEffect, useRef } from "react";

export default function SakuraEffect() {
  const containerRef = useRef(null);
  const petalsRef = useRef([]);
  const mouseXRef = useRef(50);

  useEffect(() => {
    petalsRef.current = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * -50,
      rotation: Math.random() * 360,
      size: 16 + Math.random() * 10,
      vy: 0.5 + Math.random() * 0.4,
      vx: (Math.random() - 0.5) * 0.2,
      wobble: (Math.random() - 0.5) * 0.15,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.7 + Math.random() * 0.3,
    }));

    let frameId;

    const render = () => {
      petalsRef.current.forEach(petal => {
        petal.x += petal.vx + Math.sin(petal.phase) * petal.wobble;
        petal.y += petal.vy;
        petal.rotation += 2;
        petal.phase += 0.05;
        
        const distToMouse = Math.abs(petal.x - mouseXRef.current);
        if (distToMouse < 12) {
          const direction = petal.x > mouseXRef.current ? 1 : -1;
          petal.x += direction * (12 - distToMouse) * 0.15;
          petal.rotation += direction * 5;
        }

        if (petal.y > 110) {
          petal.x = Math.random() * 100;
          petal.y = Math.random() * -30;
          petal.rotation = Math.random() * 360;
          petal.phase = Math.random() * Math.PI * 2;
        }
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = petalsRef.current.map(p => {
          const scale = 1 + Math.sin(p.phase * 2) * 0.1;
          return `<div class="absolute" style="transform:translate3d(${p.x}vw,${p.y}vh,0) rotate(${p.rotation}deg) scale(${scale});font-size:${p.size}px;filter:drop-shadow(0 3px 6px rgba(255,182,193,0.5)) drop-shadow(0 0 10px rgba(255,192,203,0.3));opacity:${p.opacity};will-change:transform;contain:layout style paint">🌸</div>`;
        }).join('');
      }

      frameId = requestAnimationFrame(render);
    };

    const handleMouse = (e) => {
      mouseXRef.current = (e.clientX / window.innerWidth) * 100;
    };

    window.addEventListener('mousemove', handleMouse, { passive: true });
    frameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50" style={{ contain: 'layout style paint' }} />;
}