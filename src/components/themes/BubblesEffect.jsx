import { useEffect, useRef } from "react";

export default function BubblesEffect() {
  const containerRef = useRef(null);
  const bubblesRef = useRef([]);

  useEffect(() => {
    let frameId;

    const createBubble = (x) => {
      bubblesRef.current.push({
        x: x || Math.random() * 100,
        y: 105,
        size: 30 + Math.random() * 30,
        speed: 0.6 + Math.random() * 0.4,
        wobble: Math.random() * Math.PI * 2,
      });
    };

    const render = () => {
      bubblesRef.current = bubblesRef.current.filter(b => {
        b.y -= b.speed;
        b.x += Math.sin(b.wobble) * 0.2;
        b.wobble += 0.05;
        return b.y > -10;
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = bubblesRef.current.map(b =>
          `<div style="position:absolute;left:${b.x}%;top:${b.y}%;width:${b.size}px;height:${b.size}px;border-radius:50%;background:radial-gradient(circle at 30% 30%,rgba(255,255,255,0.9),rgba(173,216,230,0.6),rgba(100,180,255,0.3));border:2px solid rgba(255,255,255,0.6);box-shadow:inset -5px -5px 10px rgba(255,255,255,0.5),0 8px 20px rgba(135,206,250,0.3)"></div>`
        ).join('');
      }

      frameId = requestAnimationFrame(render);
    };

    const handleClick = (e) => createBubble((e.clientX / window.innerWidth) * 100);
    const autoBubble = setInterval(() => createBubble(), 2000);

    window.addEventListener('click', handleClick);
    frameId = requestAnimationFrame(render);

    return () => {
      clearInterval(autoBubble);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50" />;
}