import { useEffect, useState } from "react";

export default function BubblesEffect() {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    const bubbleElements = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 6 + Math.random() * 10,
      delay: Math.random() * 5,
      size: 20 + Math.random() * 50,
      wobble: Math.random() * 60 - 30,
    }));
    setBubbles(bubbleElements);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute animate-bubble-rise"
          style={{
            left: `${bubble.left}%`,
            bottom: "-100px",
            animationDuration: `${bubble.animationDuration}s`,
            animationDelay: `${bubble.delay}s`,
            '--wobble': `${bubble.wobble}px`,
          }}
        >
          <div
            className="rounded-full relative"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(173, 216, 230, 0.4) 50%, rgba(135, 206, 250, 0.6))',
              boxShadow: `
                inset 0 0 ${bubble.size * 0.3}px rgba(255, 255, 255, 0.6),
                inset ${bubble.size * 0.15}px ${bubble.size * 0.15}px ${bubble.size * 0.2}px rgba(255, 255, 255, 0.4),
                0 0 ${bubble.size * 0.4}px rgba(135, 206, 250, 0.4),
                0 ${bubble.size * 0.1}px ${bubble.size * 0.3}px rgba(0, 0, 0, 0.2)
              `,
              border: '2px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            {/* Shine effect */}
            <div
              className="absolute rounded-full"
              style={{
                top: '15%',
                left: '20%',
                width: '30%',
                height: '30%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9), transparent 70%)',
              }}
            />
            {/* Secondary shine */}
            <div
              className="absolute rounded-full"
              style={{
                bottom: '20%',
                right: '25%',
                width: '20%',
                height: '20%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.5), transparent 60%)',
              }}
            />
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes bubble-rise {
          0% {
            transform: translateY(0) translateX(0) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          25% {
            transform: translateY(-25vh) translateX(var(--wobble)) scale(1);
          }
          50% {
            transform: translateY(-50vh) translateX(calc(var(--wobble) * -0.8)) scale(1.1);
          }
          75% {
            transform: translateY(-75vh) translateX(calc(var(--wobble) * 0.6)) scale(0.95);
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-110vh) translateX(calc(var(--wobble) * -0.4)) scale(0.7);
            opacity: 0;
          }
        }
        .animate-bubble-rise {
          animation: bubble-rise ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}