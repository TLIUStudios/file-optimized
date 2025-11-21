import { useEffect, useRef } from "react";

export default function SakuraEffect() {
  const containerRef = useRef(null);
  const petalsRef = useRef([]);
  const mouseXRef = useRef(50);

  useEffect(() => {
    petalsRef.current = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * -50,
      rotation: Math.random() * 360,
      size: 14 + Math.random() * 8,
      vy: 0.65 + Math.random() * 0.45,
      vx: (Math.random() - 0.5) * 0.2,
    }));

    let frameId;

    const render = () => {
      petalsRef.current.forEach(petal => {
        petal.x += petal.vx;
        petal.y += petal.vy;
        petal.rotation += 1.5;
        
        const distToMouse = Math.abs(petal.x - mouseXRef.current);
        if (distToMouse < 10) {
          const direction = petal.x > mouseXRef.current ? 1 : -1;
          petal.x += direction * (10 - distToMouse) * 0.1;
        }

        if (petal.y > 110) {
          petal.x = Math.random() * 100;
          petal.y = Math.random() * -30;
          petal.rotation = Math.random() * 360;
        }
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = petalsRef.current.map(p =>
          `<div class="absolute" style="transform:translate3d(${p.x}vw,${p.y}vh,0) rotate(${p.rotation}deg);font-size:${p.size}px;filter:drop-shadow(0 2px 3px rgba(255,192,203,0.4));will-change:transform;contain:layout style paint">🌸</div>`
        ).join('');
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