import { useEffect, useRef, memo } from "react";

const Snowflake = memo(({ flake }) => (
  <div
    className="absolute rounded-full bg-white will-change-transform"
    style={{
      transform: `translate3d(${flake.x}vw, ${flake.y}vh, 0)`,
      width: `${flake.size}px`,
      height: `${flake.size}px`,
      opacity: flake.opacity,
      boxShadow: '0 0 8px rgba(255,255,255,0.8)',
      contain: 'layout style paint',
    }}
  />
));

const GroundPile = memo(({ pile }) => (
  <div
    className="absolute bottom-0"
    style={{
      transform: `translate3d(${pile.x}vw, 0, 0)`,
      width: `${pile.size}px`,
      height: `${pile.size * 0.3}px`,
      background: 'radial-gradient(ellipse, rgba(255,255,255,0.9), transparent)',
      borderRadius: '50% 50% 0 0',
      opacity: pile.opacity,
      contain: 'layout style paint',
    }}
  />
));

export default function SnowEffect() {
  const snowflakesRef = useRef([]);
  const groundRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null });
  const containerRef = useRef(null);

  useEffect(() => {
    snowflakesRef.current = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * -100,
      size: 4 + Math.random() * 5,
      speed: 0.25 + Math.random() * 0.35,
      drift: (Math.random() - 0.5) * 0.25,
      opacity: 0.6 + Math.random() * 0.4,
    }));

    let frameId;
    const animate = () => {
      const { x: mouseX, y: mouseY } = mouseRef.current;
      
      snowflakesRef.current.forEach(flake => {
        flake.y += flake.speed;
        flake.x += flake.drift;

        if (mouseX !== null && mouseY !== null) {
          const dx = flake.x - mouseX;
          const dy = flake.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 10) {
            const force = (10 - dist) / 10;
            flake.x += (dx / dist) * force * 1.2;
            flake.y += (dy / dist) * force * 0.6;
          }
        }

        if (flake.y > 110) {
          if (Math.random() < 0.03) {
            const pileId = Date.now() + Math.random();
            groundRef.current.push({ id: pileId, x: flake.x, size: flake.size * 4, opacity: 1 });
            setTimeout(() => {
              const pile = groundRef.current.find(p => p.id === pileId);
              if (pile) {
                const interval = setInterval(() => {
                  const currentPile = groundRef.current.find(p => p.id === pileId);
                  if (currentPile) {
                    currentPile.opacity -= 0.02;
                    if (currentPile.opacity <= 0) {
                      clearInterval(interval);
                      groundRef.current = groundRef.current.filter(p => p.id !== pileId);
                    }
                  } else {
                    clearInterval(interval);
                  }
                }, 100);
              }
            }, 5000);
          }
          flake.x = Math.random() * 100;
          flake.y = Math.random() * -20;
        }
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = snowflakesRef.current.map(f => 
          `<div class="absolute rounded-full bg-white" style="transform:translate3d(${f.x}vw,${f.y}vh,0);width:${f.size}px;height:${f.size}px;opacity:${f.opacity};box-shadow:0 0 8px rgba(255,255,255,0.8);will-change:transform;contain:layout style paint"></div>`
        ).join('') + groundRef.current.map(p =>
          `<div class="absolute bottom-0" style="transform:translate3d(${p.x}vw,0,0);width:${p.size}px;height:${p.size * 0.3}px;background:radial-gradient(ellipse,rgba(255,255,255,0.9),transparent);border-radius:50% 50% 0 0;opacity:${p.opacity};contain:layout style paint"></div>`
        ).join('');
      }

      frameId = requestAnimationFrame(animate);
    };

    const handleMouse = (e) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      };
    };

    window.addEventListener('mousemove', handleMouse, { passive: true });
    frameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50" style={{ contain: 'layout style paint' }} />;
}