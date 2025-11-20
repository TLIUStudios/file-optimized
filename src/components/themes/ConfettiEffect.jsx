import { useEffect, useState } from "react";

export default function ConfettiEffect() {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      const colors = ['#ff0844', '#ffb199', '#ffd23f', '#00d9ff', '#b337ff', '#00ff88', '#ff3d9e', '#4dffdf'];
      const x = (e.clientX / window.innerWidth) * 100;
      
      // Create burst of confetti at click location
      const burstPieces = Array.from({ length: 25 }, (_, i) => ({
        id: Date.now() + Math.random() + i,
        left: x,
        top: (e.clientY / window.innerHeight) * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: ['rect', 'circle', 'triangle'][Math.floor(Math.random() * 3)],
        size: 8 + Math.random() * 10,
        velocity: {
          x: (Math.random() - 0.5) * 100,
          y: -50 - Math.random() * 80,
        },
      }));

      setConfetti(prev => [...prev, ...burstPieces]);
      
      setTimeout(() => {
        setConfetti(prev => prev.filter(p => !burstPieces.find(bp => bp.id === p.id)));
      }, 3000);
    };

    // Auto confetti
    const autoInterval = setInterval(() => {
      const colors = ['#ff0844', '#ffb199', '#ffd23f', '#00d9ff', '#b337ff', '#00ff88', '#ff3d9e', '#4dffdf'];
      const x = 20 + Math.random() * 60;
      const autoPieces = Array.from({ length: 15 }, (_, i) => ({
        id: Date.now() + Math.random() + i,
        left: x,
        top: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: ['rect', 'circle', 'triangle'][Math.floor(Math.random() * 3)],
        size: 7 + Math.random() * 9,
        velocity: {
          x: (Math.random() - 0.5) * 60,
          y: Math.random() * 30,
        },
      }));

      setConfetti(prev => [...prev, ...autoPieces]);
      setTimeout(() => {
        setConfetti(prev => prev.filter(p => !autoPieces.find(ap => ap.id === p.id)));
      }, 3500);
    }, 2500);

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
      clearInterval(autoInterval);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className="absolute animate-confetti-burst"
            style={{
              left: `${piece.left}%`,
              top: `${piece.top}%`,
              '--vel-x': `${piece.velocity.x}px`,
              '--vel-y': `${piece.velocity.y}px`,
            }}
          >
            {piece.shape === 'rect' && (
              <div style={{
                width: `${piece.size}px`,
                height: `${piece.size * 0.6}px`,
                backgroundColor: piece.color,
                boxShadow: `0 0 12px ${piece.color}, inset 0 0 4px rgba(255, 255, 255, 0.6)`,
                filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.3))',
              }} />
            )}
            {piece.shape === 'circle' && (
              <div style={{
                width: `${piece.size}px`,
                height: `${piece.size}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, white, ${piece.color})`,
                boxShadow: `0 0 10px ${piece.color}, inset 0 0 5px rgba(255, 255, 255, 0.7)`,
                filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.3))',
              }} />
            )}
            {piece.shape === 'triangle' && (
              <div style={{
                width: 0,
                height: 0,
                borderLeft: `${piece.size * 0.5}px solid transparent`,
                borderRight: `${piece.size * 0.5}px solid transparent`,
                borderBottom: `${piece.size * 0.866}px solid ${piece.color}`,
                filter: `drop-shadow(0 0 8px ${piece.color}) drop-shadow(0 2px 5px rgba(0, 0, 0, 0.3))`,
              }} />
            )}
          </div>
        ))}
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto z-50">
        <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs">
          Click to celebrate! 🎉
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti-burst {
          0% {
            transform: translate(0, 0) rotateZ(0deg) rotateX(0deg) rotateY(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--vel-x), calc(100vh + var(--vel-y))) 
                       rotateZ(${720 + Math.random() * 720}deg) 
                       rotateX(${360 + Math.random() * 360}deg) 
                       rotateY(${360 + Math.random() * 360}deg) 
                       scale(0.7);
            opacity: 0;
          }
        }
        .animate-confetti-burst {
          animation: confetti-burst 3s ease-in forwards;
          transform-style: preserve-3d;
        }
      `}</style>
    </>
  );
}