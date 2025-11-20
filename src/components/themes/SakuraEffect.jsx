import { useEffect, useState } from "react";

export default function SakuraEffect() {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    const petalElements = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 8 + Math.random() * 12,
      opacity: 0.4 + Math.random() * 0.5,
      size: 8 + Math.random() * 8,
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
            top: "-20px",
            opacity: petal.opacity,
            fontSize: `${petal.size}px`,
            animationDuration: `${petal.animationDuration}s`,
            animationDelay: `${petal.delay}s`,
            '--rotation': `${petal.rotation}deg`,
          }}
        >
          🌸
        </div>
      ))}
      <style jsx>{`
        @keyframes sakura-fall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(25vh) translateX(50px) rotate(90deg);
          }
          50% {
            transform: translateY(50vh) translateX(-30px) rotate(180deg);
          }
          75% {
            transform: translateY(75vh) translateX(40px) rotate(270deg);
          }
          100% {
            transform: translateY(100vh) translateX(-20px) rotate(360deg);
          }
        }
        .animate-sakura-fall {
          animation: sakura-fall ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}