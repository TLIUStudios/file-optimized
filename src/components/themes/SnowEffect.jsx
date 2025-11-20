import { useEffect, useState } from "react";

export default function SnowEffect() {
  const [snowflakes, setSnowflakes] = useState([]);
  const [groundSnow, setGroundSnow] = useState([]);

  useEffect(() => {
    // Falling snowflakes
    const flakes = Array.from({ length: 120 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 8 + Math.random() * 12,
      opacity: 0.4 + Math.random() * 0.6,
      size: 3 + Math.random() * 9,
      delay: Math.random() * 8,
      blur: Math.random() * 1.5,
    }));
    setSnowflakes(flakes);

    // Ground accumulation
    const interval = setInterval(() => {
      const newSnowPile = {
        id: Date.now() + Math.random(),
        left: Math.random() * 100,
        size: 20 + Math.random() * 40,
        opacity: 0.7 + Math.random() * 0.3,
      };
      
      setGroundSnow(prev => [...prev, newSnowPile]);
      
      // Remove after fade animation
      setTimeout(() => {
        setGroundSnow(prev => prev.filter(s => s.id !== newSnowPile.id));
      }, 8000);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Falling snow */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute rounded-full bg-gradient-to-br from-white via-blue-50 to-white animate-fall-snow shadow-lg"
            style={{
              left: `${flake.left}%`,
              top: "-20px",
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: flake.opacity,
              animationDuration: `${flake.animationDuration}s`,
              animationDelay: `${flake.delay}s`,
              filter: `blur(${flake.blur}px)`,
              boxShadow: '0 0 12px rgba(255, 255, 255, 0.9), inset 0 0 6px rgba(255, 255, 255, 0.6)',
            }}
          />
        ))}
      </div>

      {/* Ground accumulation */}
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
              background: 'radial-gradient(ellipse at center top, rgba(255, 255, 255, 0.95), rgba(240, 248, 255, 0.8))',
              borderRadius: '50% 50% 0 0',
              opacity: pile.opacity,
              boxShadow: `
                0 -2px 10px rgba(255, 255, 255, 0.6),
                inset 0 2px 8px rgba(255, 255, 255, 0.4),
                0 0 20px rgba(173, 216, 230, 0.3)
              `,
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes fall-snow {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(25vh) translateX(100px) rotate(90deg) scale(1.15);
          }
          50% {
            transform: translateY(50vh) translateX(-50px) rotate(180deg) scale(0.95);
          }
          75% {
            transform: translateY(75vh) translateX(80px) rotate(270deg) scale(1.08);
          }
          100% {
            transform: translateY(110vh) translateX(-30px) rotate(360deg) scale(1);
          }
        }
        @keyframes snow-accumulate {
          0% {
            transform: translateY(-10px) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          60% {
            transform: translateY(0) scale(1);
            opacity: 0.9;
          }
          100% {
            transform: translateY(0) scale(1.2);
            opacity: 0;
          }
        }
        .animate-fall-snow {
          animation: fall-snow linear infinite;
        }
        .animate-snow-accumulate {
          animation: snow-accumulate 8s ease-out forwards;
        }
      `}</style>
    </>
  );
}