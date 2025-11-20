import { useEffect, useState } from "react";

export default function AutumnEffect() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    const leafElements = Array.from({ length: 45 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 8 + Math.random() * 12,
      opacity: 0.6 + Math.random() * 0.4,
      size: 16 + Math.random() * 14,
      delay: Math.random() * 6,
      leaf: ['🍂', '🍁', '🍃'][Math.floor(Math.random() * 3)],
    }));
    setLeaves(leafElements);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute animate-leaf-fall"
          style={{
            left: `${leaf.left}%`,
            top: "-40px",
            fontSize: `${leaf.size}px`,
            opacity: leaf.opacity,
            animationDuration: `${leaf.animationDuration}s`,
            animationDelay: `${leaf.delay}s`,
            filter: 'drop-shadow(0 0 4px rgba(139, 69, 19, 0.4)) drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3))',
          }}
        >
          {leaf.leaf}
        </div>
      ))}
      <style jsx>{`
        @keyframes leaf-fall {
          0% {
            transform: translateY(0) translateX(0) rotateZ(0deg) rotateX(0deg) scale(1);
          }
          20% {
            transform: translateY(20vh) translateX(-60px) rotateZ(144deg) rotateX(180deg) scale(1.1);
          }
          40% {
            transform: translateY(40vh) translateX(50px) rotateZ(288deg) rotateX(360deg) scale(0.9);
          }
          60% {
            transform: translateY(60vh) translateX(-45px) rotateZ(432deg) rotateX(540deg) scale(1.05);
          }
          80% {
            transform: translateY(80vh) translateX(55px) rotateZ(576deg) rotateX(720deg) scale(0.95);
          }
          100% {
            transform: translateY(100vh) translateX(-30px) rotateZ(720deg) rotateX(900deg) scale(1);
          }
        }
        .animate-leaf-fall {
          animation: leaf-fall ease-in-out infinite;
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}