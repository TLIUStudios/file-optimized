import { useEffect, useState } from "react";

export default function HeartsEffect() {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const heartElements = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 4 + Math.random() * 6,
      opacity: 0.3 + Math.random() * 0.5,
      size: 12 + Math.random() * 12,
      delay: Math.random() * 5,
    }));
    setHearts(heartElements);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute animate-float-up"
          style={{
            left: `${heart.left}%`,
            bottom: "-30px",
            opacity: heart.opacity,
            fontSize: `${heart.size}px`,
            animationDuration: `${heart.animationDuration}s`,
            animationDelay: `${heart.delay}s`,
          }}
        >
          ❤️
        </div>
      ))}
      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}