import { useEffect, useState } from "react";

export default function SnowEffect() {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const flakes = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 8 + Math.random() * 12,
      opacity: 0.4 + Math.random() * 0.6,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 8,
      blur: Math.random() * 2,
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-gradient-to-br from-white to-blue-100 animate-fall-snow shadow-lg"
          style={{
            left: `${flake.left}%`,
            top: "-20px",
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.delay}s`,
            filter: `blur(${flake.blur}px)`,
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.8), inset 0 0 5px rgba(255, 255, 255, 0.5)',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes fall-snow {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(25vh) translateX(100px) rotate(90deg) scale(1.1);
          }
          50% {
            transform: translateY(50vh) translateX(-50px) rotate(180deg) scale(0.9);
          }
          75% {
            transform: translateY(75vh) translateX(80px) rotate(270deg) scale(1.05);
          }
          100% {
            transform: translateY(100vh) translateX(-30px) rotate(360deg) scale(1);
          }
        }
        .animate-fall-snow {
          animation: fall-snow linear infinite;
        }
      `}</style>
    </div>
  );
}