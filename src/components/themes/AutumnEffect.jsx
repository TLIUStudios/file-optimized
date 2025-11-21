import { useEffect, useRef } from "react";

export default function AutumnEffect() {
  const containerRef = useRef(null);
  const leavesRef = useRef([]);
  const mouseRef = useRef({ x: 50, y: 50 });

  useEffect(() => {
    leavesRef.current = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * -50,
      rotation: Math.random() * 360,
      type: ['🍂', '🍁', '🍃'][Math.floor(Math.random() * 3)],
      size: 18 + Math.random() * 9,
      vy: 0.45 + Math.random() * 0.35,
      vx: (Math.random() - 0.5) * 0.25,
    }));

    let frameId;

    const render = () => {
      leavesRef.current.forEach(leaf => {
        leaf.x += leaf.vx;
        leaf.y += leaf.vy;
        leaf.rotation += 2.2;
        
        const dx = leaf.x - mouseRef.current.x;
        const dy = leaf.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 12) {
          const force = (12 - dist) / 12;
          leaf.x += (dx / dist) * force * 1;
          leaf.y += (dy / dist) * force * 0.5;
        }

        if (leaf.y > 110 || leaf.x < -5 || leaf.x > 105) {
          leaf.x = Math.random() * 100;
          leaf.y = Math.random() * -30;
          leaf.rotation = Math.random() * 360;
        }
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = leavesRef.current.map(l =>
          `<div class="absolute" style="transform:translate3d(${l.x}vw,${l.y}vh,0) rotate(${l.rotation}deg);font-size:${l.size}px;filter:drop-shadow(0 2px 4px rgba(139,69,19,0.3));will-change:transform;contain:layout style paint">${l.type}</div>`
        ).join('');
      }

      frameId = requestAnimationFrame(render);
    };

    const handleMouse = (e) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      };
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