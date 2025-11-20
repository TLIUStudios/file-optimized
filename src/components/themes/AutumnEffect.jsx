import { useEffect, useState } from "react";

export default function AutumnEffect() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    const leafElements = Array.from({ length: 35 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 6 + Math.random() * 10,
      opacity: 0.5 + Math.random() * 0.5,
      size: 12 + Math.random() * 10,
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
            top: "-30px",
            opacity: leaf.opacity,
            fontSize: `${leaf.size}px`,
            animationDuration: `${leaf.animationDuration}s`,
            animationDelay: `${leaf.delay}s`,
          }}
        >
          {leaf.leaf}
        </div>
      ))}
      <style jsx>{`
        @keyframes leaf-fall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          20% {
            transform: translateY(20vh) translateX(-40px) rotate(120deg);
          }
          40% {
            transform: translateY(40vh) translateX(30px) rotate(240deg);
          }
          60% {
            transform: translateY(60vh) translateX(-25px) rotate(360deg);
          }
          80% {
            transform: translateY(80vh) translateX(35px) rotate(480deg);
          }
          100% {
            transform: translateY(100vh) translateX(-15px) rotate(600deg);
          }
        }
        .animate-leaf-fall {
          animation: leaf-fall ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}