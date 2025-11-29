import { useEffect, useRef } from "react";

export default function BubblesEffect() {
  const containerRef = useRef(null);
  const bubblesRef = useRef([]);
  const frameRef = useRef(0);

  useEffect(() => {
    let lastTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;
    let time = 0;

    const createBubble = (x) => {
      bubblesRef.current.push({
        x: x ?? Math.random() * 100,
        y: 105,
        size: 25 + Math.random() * 25,
        speed: 0.4 + Math.random() * 0.3,
        wobbleOffset: Math.random() * Math.PI * 2,
      });
    };

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= frameInterval) {
        lastTime = currentTime - (deltaTime % frameInterval);
        time += 0.03;

        bubblesRef.current = bubblesRef.current.filter(b => {
          b.y -= b.speed;
          b.x += Math.sin(time + b.wobbleOffset) * 0.15;
          return b.y > -15;
        });

        // Keep max 20 bubbles for performance
        if (bubblesRef.current.length > 20) {
          bubblesRef.current = bubblesRef.current.slice(-20);
        }

        if (containerRef.current) {
          containerRef.current.innerHTML = bubblesRef.current.map(b =>
            `<div style="position:absolute;left:${b.x}%;top:${b.y}%;width:${b.size}px;height:${b.size}px;border-radius:50%;background:radial-gradient(circle at 30% 30%,rgba(255,255,255,0.85),rgba(173,216,230,0.5),rgba(100,180,255,0.2));border:1.5px solid rgba(255,255,255,0.5);box-shadow:inset -4px -4px 8px rgba(255,255,255,0.4),0 6px 16px rgba(135,206,250,0.25)"></div>`
          ).join('');
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    // Auto spawn bubbles
    const autoBubble = setInterval(() => createBubble(), 2500);

    // Click to create bubble
    const handleClick = (e) => {
      createBubble((e.clientX / window.innerWidth) * 100);
    };

    // Initial bubbles
    for (let i = 0; i < 3; i++) {
      setTimeout(() => createBubble(), i * 400);
    }

    window.addEventListener('click', handleClick, { passive: true });
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(autoBubble);
      window.removeEventListener('click', handleClick);
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