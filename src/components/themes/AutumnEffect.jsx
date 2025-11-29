import { useEffect, useRef } from "react";

export default function AutumnEffect() {
  const containerRef = useRef(null);
  const leavesRef = useRef([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const particleCount = window.innerWidth < 768 ? 10 : 14;
    const leafTypes = ['🍂', '🍁', '🍃'];
    
    leavesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100 - 50,
      rotation: Math.random() * 360,
      type: leafTypes[Math.floor(Math.random() * leafTypes.length)],
      size: 16 + Math.random() * 8,
      speed: 0.3 + Math.random() * 0.25,
      wobbleOffset: Math.random() * Math.PI * 2,
    }));

    let lastTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;
    let time = 0;

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= frameInterval) {
        lastTime = currentTime - (deltaTime % frameInterval);
        time += 0.025;

        leavesRef.current.forEach(leaf => {
          leaf.x += Math.sin(time + leaf.wobbleOffset) * 0.15;
          leaf.y += leaf.speed;
          leaf.rotation += 1.8;

          if (leaf.y > 105 || leaf.x < -5 || leaf.x > 105) {
            leaf.x = Math.random() * 100;
            leaf.y = -10;
            leaf.rotation = Math.random() * 360;
          }
        });

        if (containerRef.current) {
          containerRef.current.innerHTML = leavesRef.current.map(l =>
            `<div style="position:absolute;left:${l.x}%;top:${l.y}%;transform:rotate(${l.rotation}deg);font-size:${l.size}px;opacity:0.8;filter:drop-shadow(0 2px 3px rgba(139,69,19,0.25))">${l.type}</div>`
          ).join('');
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      style={{ contain: 'strict' }}
    />
  );
}