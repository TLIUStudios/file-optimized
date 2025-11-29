import { useEffect, useRef } from "react";

export default function SakuraEffect() {
  const containerRef = useRef(null);
  const petalsRef = useRef([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const particleCount = window.innerWidth < 768 ? 12 : 18;
    
    petalsRef.current = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100 - 100,
      rotation: Math.random() * 360,
      wobbleOffset: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.2,
      size: 16 + Math.random() * 8,
    }));

    let lastTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;
    let time = 0;

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= frameInterval) {
        lastTime = currentTime - (deltaTime % frameInterval);
        time += 0.03;

        petalsRef.current.forEach(p => {
          p.x += Math.sin(time + p.wobbleOffset) * 0.2;
          p.y += p.speed;
          p.rotation += 1.5;

          if (p.y > 105) {
            p.y = -10;
            p.x = Math.random() * 100;
          }
          if (p.x < -5) p.x = 105;
          if (p.x > 105) p.x = -5;
        });

        if (containerRef.current) {
          containerRef.current.innerHTML = petalsRef.current.map(p =>
            `<div style="position:absolute;left:${p.x}%;top:${p.y}%;transform:rotate(${p.rotation}deg);font-size:${p.size}px;opacity:0.75;filter:drop-shadow(0 0 4px rgba(255,182,193,0.4))">🌸</div>`
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