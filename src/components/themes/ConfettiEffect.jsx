import { useEffect, useState } from "react";

export default function ConfettiEffect() {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    const confettiPieces = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
      color: ['#ff0844', '#ffb199', '#ffd23f', '#00d9ff', '#b337ff', '#00ff88', '#ff3d9e', '#4dffdf'][Math.floor(Math.random() * 8)],
      shape: ['rect', 'circle', 'triangle'][Math.floor(Math.random() * 3)],
      size: 6 + Math.random() * 10,
      rotation: Math.random() * 360,
    }));
    setConfetti(confettiPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            top: "-30px",
            animationDuration: `${piece.animationDuration}s`,
            animationDelay: `${piece.delay}s`,
          }}
        >
          {piece.shape === 'rect' && (
            <div
              style={{
                width: `${piece.size}px`,
                height: `${piece.size * 0.6}px`,
                backgroundColor: piece.color,
                boxShadow: `0 0 10px ${piece.color}, inset 0 0 3px rgba(255, 255, 255, 0.5)`,
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
              }}
            />
          )}
          {piece.shape === 'circle' && (
            <div
              style={{
                width: `${piece.size}px`,
                height: `${piece.size}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, white, ${piece.color})`,
                boxShadow: `0 0 8px ${piece.color}, inset 0 0 4px rgba(255, 255, 255, 0.6)`,
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
              }}
            />
          )}
          {piece.shape === 'triangle' && (
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: `${piece.size * 0.5}px solid transparent`,
                borderRight: `${piece.size * 0.5}px solid transparent`,
                borderBottom: `${piece.size * 0.866}px solid ${piece.color}`,
                filter: `drop-shadow(0 0 6px ${piece.color}) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))`,
              }}
            />
          )}
        </div>
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) translateX(0) rotateZ(0deg) rotateX(0deg) rotateY(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(${Math.random() > 0.5 ? '' : '-'}${50 + Math.random() * 100}px) 
                       rotateZ(${720 + Math.random() * 720}deg) 
                       rotateX(${360 + Math.random() * 360}deg) 
                       rotateY(${360 + Math.random() * 360}deg) 
                       scale(${0.5 + Math.random() * 0.5});
            opacity: 0.7;
          }
        }
        .animate-confetti-fall {
          animation: confetti-fall ease-in infinite;
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}