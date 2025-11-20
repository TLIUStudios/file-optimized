import { useEffect, useState } from "react";

export default function HeartsEffect() {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const heartElements = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 8 + Math.random() * 10,
      opacity: 0.5 + Math.random() * 0.5,
      size: 1.2 + Math.random() * 1.2,
      delay: Math.random() * 6,
      rotation: Math.random() * 360,
      color: ['#ff69b4', '#ff1493', '#ff6b9d', '#ff4d6d', '#ff85a2'][Math.floor(Math.random() * 5)],
    }));
    setHearts(heartElements);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute animate-float-hearts"
          style={{
            left: `${heart.left}%`,
            bottom: "-30px",
            fontSize: `${heart.size}rem`,
            opacity: heart.opacity,
            animationDuration: `${heart.animationDuration}s`,
            animationDelay: `${heart.delay}s`,
            filter: `drop-shadow(0 0 8px ${heart.color}) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))`,
            color: heart.color,
          }}
        >
          💕
        </div>
      ))}
      <style jsx>{`
        @keyframes float-hearts {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          25% {
            transform: translateY(-25vh) translateX(50px) rotate(90deg) scale(1.2);
          }
          50% {
            transform: translateY(-50vh) translateX(-40px) rotate(180deg) scale(1);
          }
          75% {
            transform: translateY(-75vh) translateX(60px) rotate(270deg) scale(1.1);
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(-30px) rotate(360deg) scale(0.8);
            opacity: 0;
          }
        }
        .animate-float-hearts {
          animation: float-hearts ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}