import { useEffect, useState } from "react";

export default function SakuraEffect() {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    const petalElements = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 10 + Math.random() * 14,
      opacity: 0.5 + Math.random() * 0.5,
      size: 12 + Math.random() * 12,
      delay: Math.random() * 8,
      rotation: Math.random() * 360,
    }));
    setPetals(petalElements);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute animate-sakura-fall"
          style={{
            left: `${petal.left}%`,
            top: "-30px",
            fontSize: `${petal.size}px`,
            opacity: petal.opacity,
            animationDuration: `${petal.animationDuration}s`,
            animationDelay: `${petal.delay}s`,
            filter: 'drop-shadow(0 0 6px rgba(255, 192, 203, 0.6)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
          }}
        >
          🌸
        </div>
      ))}
      <style jsx>{`
        @keyframes sakura-fall {
          0% {
            transform: translateY(0) translateX(0) rotateZ(0deg) rotateY(0deg) scale(1);
          }
          25% {
            transform: translateY(25vh) translateX(80px) rotateZ(90deg) rotateY(180deg) scale(1.15);
          }
          50% {
            transform: translateY(50vh) translateX(-60px) rotateZ(180deg) rotateY(360deg) scale(0.95);
          }
          75% {
            transform: translateY(75vh) translateX(70px) rotateZ(270deg) rotateY(540deg) scale(1.1);
          }
          100% {
            transform: translateY(100vh) translateX(-40px) rotateZ(360deg) rotateY(720deg) scale(1);
          }
        }
        .animate-sakura-fall {
          animation: sakura-fall ease-in-out infinite;
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}