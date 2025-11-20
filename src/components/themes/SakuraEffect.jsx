import { useEffect, useState, useRef } from "react";

export default function SakuraEffect() {
  const [petals, setPetals] = useState([]);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const mouseTimeoutRef = useRef(null);

  useEffect(() => {
    const petalElements = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 12 + Math.random() * 12,
      opacity: 0.6 + Math.random() * 0.4,
      size: 14 + Math.random() * 12,
      delay: Math.random() * 8,
    }));
    setPetals(petalElements);

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      clearTimeout(mouseTimeoutRef.current);
      mouseTimeoutRef.current = setTimeout(() => {
        setMousePos({ x: -1000, y: -1000 });
      }, 150);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(mouseTimeoutRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {petals.map((petal) => {
        const petalX = (petal.left / 100) * window.innerWidth;
        const petalY = 0;
        const dx = mousePos.x - petalX;
        const dy = mousePos.y - petalY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const swayRadius = 180;
        const swayForce = distance < swayRadius ? (1 - distance / swayRadius) * 120 : 0;
        const angle = Math.atan2(dy, dx);
        const offsetX = swayForce > 0 ? Math.cos(angle) * swayForce : 0;
        const offsetY = swayForce > 0 ? Math.sin(angle) * swayForce * 0.3 : 0;

        return (
          <div
            key={petal.id}
            className="absolute animate-sakura-fall transition-transform duration-500 ease-out"
            style={{
              left: `${petal.left}%`,
              top: "-30px",
              fontSize: `${petal.size}px`,
              opacity: petal.opacity,
              animationDuration: `${petal.animationDuration}s`,
              animationDelay: `${petal.delay}s`,
              filter: 'drop-shadow(0 0 8px rgba(255, 192, 203, 0.7)) drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25))',
              transform: `translate(${offsetX}px, ${offsetY}px)`,
            }}
          >
            🌸
          </div>
        );
      })}
      <style jsx>{`
        @keyframes sakura-fall {
          0% { transform: translateY(0) translateX(0) rotateZ(0deg) rotateY(0deg); }
          25% { transform: translateY(25vh) translateX(70px) rotateZ(90deg) rotateY(180deg); }
          50% { transform: translateY(50vh) translateX(-50px) rotateZ(180deg) rotateY(360deg); }
          75% { transform: translateY(75vh) translateX(60px) rotateZ(270deg) rotateY(540deg); }
          100% { transform: translateY(100vh) translateX(-35px) rotateZ(360deg) rotateY(720deg); }
        }
        .animate-sakura-fall {
          animation: sakura-fall ease-in-out infinite;
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}