import { useEffect, useRef } from "react";

export default function BubblesEffect() {
  const containerRef = useRef(null);
  const bubblesRef = useRef([]);

  useEffect(() => {
    let frameId;

    const createBubble = (x, y) => {
      const id = Date.now() + Math.random();
      bubblesRef.current.push({
        id, x, y,
        size: 28 + Math.random() * 32,
        vy: 0.6 + Math.random() * 0.4,
        wobble: (Math.random() - 0.5) * 0.2,
        phase: Math.random() * Math.PI * 2,
      });
      setTimeout(() => {
        const idx = bubblesRef.current.findIndex(b => b.id === id);
        if (idx !== -1) bubblesRef.current.splice(idx, 1);
      }, 6500);
    };

    const handleClick = (e) => {
      const target = e.target.closest('[data-bubble-id]');
      if (target) {
        const id = parseFloat(target.dataset.bubbleId);
        const idx = bubblesRef.current.findIndex(b => b.id === id);
        if (idx !== -1) bubblesRef.current.splice(idx, 1);
        e.stopPropagation();
      } else {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = 100 - (e.clientY / window.innerHeight) * 100;
        createBubble(x, y);
      }
    };

    const autoInterval = setInterval(() => {
      createBubble(Math.random() * 100, -5);
    }, 2200);

    const render = () => {
      bubblesRef.current.forEach(bubble => {
        bubble.y += bubble.vy;
        bubble.x += Math.sin(bubble.phase) * bubble.wobble;
        bubble.phase += 0.035;
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = bubblesRef.current.map(b => `
          <div class="absolute cursor-pointer hover:scale-105 transition-transform duration-150" data-bubble-id="${b.id}" style="transform:translate3d(${b.x}vw,${-b.y}vh,0);width:${b.size}px;height:${b.size}px;will-change:transform;contain:layout style paint;pointer-events:auto">
            <div class="w-full h-full rounded-full" style="background:radial-gradient(circle at 30% 30%,rgba(255,255,255,0.9),rgba(173,216,230,0.5) 50%,rgba(135,206,250,0.7));box-shadow:inset 0 0 ${b.size * 0.3}px rgba(255,255,255,0.8),inset ${b.size * 0.15}px ${b.size * 0.15}px ${b.size * 0.2}px rgba(255,255,255,0.6),0 0 ${b.size * 0.4}px rgba(135,206,250,0.6);border:2px solid rgba(255,255,255,0.5)">
              <div class="absolute rounded-full" style="top:20%;left:25%;width:30%;height:30%;background:radial-gradient(circle,rgba(255,255,255,0.95),transparent 70%)"></div>
              <div class="absolute rounded-full" style="bottom:25%;right:30%;width:20%;height:20%;background:radial-gradient(circle,rgba(255,255,255,0.7),transparent 65%)"></div>
            </div>
          </div>
        `).join('');
      }

      frameId = requestAnimationFrame(render);
    };

    window.addEventListener('click', handleClick);
    frameId = requestAnimationFrame(render);

    return () => {
      clearInterval(autoInterval);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50" style={{ contain: 'layout style paint' }} />;
}