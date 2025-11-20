import { useEffect, useState, useRef } from "react";

export default function SnowEffect() {
  const [snowflakes, setSnowflakes] = useState([]);
  const [groundSnow, setGroundSnow] = useState([]);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const mouseTimeoutRef = useRef(null);

  useEffect(() => {
    const flakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 10 + Math.random() * 15,
      opacity: 0.5 + Math.random() * 0.5,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 10,
      blur: Math.random() * 1,
    }));
    setSnowflakes(flakes);

    const interval = setInterval(() => {
      const newSnowPile = {
        id: Date.now() + Math.random(),
        left: Math.random() * 100,
        size: 25 + Math.random() * 35,
        opacity: 0.6 + Math.random() * 0.3,
      };
      setGroundSnow(prev => [...prev, newSnowPile]);
      setTimeout(() => {
        setGroundSnow(prev => prev.filter(s => s.id !== newSnowPile.id));
      }, 10000);
    }, 400);

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      clearTimeout(mouseTimeoutRef.current);
      mouseTimeoutRef.current = setTimeout(() => {
        setMousePos({ x: -1000, y: -1000 });
      }, 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {snowflakes.map((flake) => {
          const flakeX = (flake.left / 100) * window.innerWidth;
          const flakeY = 0;
          const dx = mousePos.x - flakeX;
          const dy = mousePos.y - flakeY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const repelRadius = 150;
          const repelForce = distance < repelRadius ? (1 - distance / repelRadius) * 100 : 0;
          const angle = Math.atan2(dy, dx);
          const offsetX = repelForce > 0 ? -Math.cos(angle) * repelForce : 0;
          const offsetY = repelForce > 0 ? -Math.sin(angle) * repelForce : 0;

          return (
            <div
              key={flake.id}
              className="absolute rounded-full bg-gradient-to-br from-white via-blue-50 to-white animate-fall-snow transition-transform duration-300"
              style={{
                left: `${flake.left}%`,
                top: "-20px",
                width: `${flake.size}px`,
                height: `${flake.size}px`,
                opacity: flake.opacity,
                animationDuration: `${flake.animationDuration}s`,
                animationDelay: `${flake.delay}s`,
                filter: `blur(${flake.blur}px)`,
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.95), inset 0 0 8px rgba(255, 255, 255, 0.7)',
                transform: `translate(${offsetX}px, ${offsetY}px)`,
              }}
            />
          );
        })}
      </div>

      <div className="fixed bottom-0 inset-x-0 pointer-events-none z-50 h-32 overflow-hidden">
        {groundSnow.map((pile) => (
          <div
            key={pile.id}
            className="absolute animate-snow-accumulate"
            style={{
              left: `${pile.left}%`,
              bottom: '0',
              width: `${pile.size}px`,
              height: `${pile.size * 0.4}px`,
              background: 'radial-gradient(ellipse at center top, rgba(255, 255, 255, 0.95), rgba(245, 250, 255, 0.85))',
              borderRadius: '50% 50% 0 0',
              opacity: pile.opacity,
              boxShadow: `0 -2px 12px rgba(255, 255, 255, 0.7), inset 0 2px 10px rgba(255, 255, 255, 0.5)`,
              filter: 'blur(1.5px)',
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes fall-snow {
          0% { transform: translateY(0) translateX(0) rotate(0deg); }
          25% { transform: translateY(25vh) translateX(80px) rotate(90deg); }
          50% { transform: translateY(50vh) translateX(-40px) rotate(180deg); }
          75% { transform: translateY(75vh) translateX(60px) rotate(270deg); }
          100% { transform: translateY(110vh) translateX(-20px) rotate(360deg); }
        }
        @keyframes snow-accumulate {
          0% { transform: translateY(-15px) scale(0); opacity: 0; }
          15% { opacity: 1; }
          70% { transform: translateY(0) scale(1); opacity: 0.9; }
          100% { transform: translateY(0) scale(1.3); opacity: 0; }
        }
        .animate-fall-snow { animation: fall-snow linear infinite; }
        .animate-snow-accumulate { animation: snow-accumulate 10s ease-out forwards; }
      `}</style>
    </>
  );
}