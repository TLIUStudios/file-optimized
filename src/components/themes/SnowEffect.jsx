import { useEffect, useState } from "react";

export default function SnowEffect() {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const flakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 5 + Math.random() * 10,
      opacity: 0.3 + Math.random() * 0.7,
      size: 2 + Math.random() * 4,
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute text-white animate-fall"
          style={{
            left: `${flake.left}%`,
            top: "-10px",
            opacity: flake.opacity,
            fontSize: `${flake.size}px`,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        >
          ❄
        </div>
      ))}
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) translateX(50px);
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  );
}