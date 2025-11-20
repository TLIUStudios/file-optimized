import { useEffect, useState } from "react";

export default function FireworksEffect() {
  const [fireworks, setFireworks] = useState([]);

  useEffect(() => {
    const createFirework = () => {
      const id = Date.now() + Math.random();
      const firework = {
        id,
        left: 20 + Math.random() * 60,
        bottom: 30 + Math.random() * 50,
        color: ['#ff0844', '#ffb199', '#ffd23f', '#00d9ff', '#b337ff', '#00ff88'][Math.floor(Math.random() * 6)],
        particleCount: 20 + Math.floor(Math.random() * 15),
        size: 0.8 + Math.random() * 0.4,
      };
      
      setFireworks(prev => [...prev, firework]);
      
      setTimeout(() => {
        setFireworks(prev => prev.filter(f => f.id !== id));
      }, 2500);
    };

    const interval = setInterval(createFirework, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {fireworks.map((fw) => (
        <div
          key={fw.id}
          className="absolute"
          style={{
            left: `${fw.left}%`,
            bottom: `${fw.bottom}%`,
          }}
        >
          {/* Launch trail */}
          <div 
            className="absolute w-1 h-12 bg-gradient-to-t from-yellow-300 to-transparent animate-launch"
            style={{
              left: '0',
              bottom: '-50px',
            }}
          />
          
          {/* Explosion particles */}
          {Array.from({ length: fw.particleCount }).map((_, i) => {
            const angle = (360 / fw.particleCount) * i;
            return (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full animate-explode"
                style={{
                  backgroundColor: fw.color,
                  boxShadow: `0 0 4px ${fw.color}, 0 0 8px ${fw.color}`,
                  transform: `rotate(${angle}deg)`,
                  animationDelay: '0s',
                  '--angle': `${angle}deg`,
                  '--size': fw.size,
                }}
              />
            );
          })}
          
          {/* Center bright flash */}
          <div
            className="absolute w-3 h-3 rounded-full animate-flash"
            style={{
              backgroundColor: fw.color,
              boxShadow: `0 0 20px ${fw.color}, 0 0 40px ${fw.color}`,
              left: '-6px',
              top: '-6px',
            }}
          />
        </div>
      ))}
      <style jsx>{`
        @keyframes launch {
          0% {
            transform: translateY(50px);
            opacity: 1;
          }
          100% {
            transform: translateY(0);
            opacity: 0;
          }
        }
        @keyframes explode {
          0% {
            transform: translateX(0) translateY(0) scale(1) rotate(var(--angle));
            opacity: 1;
          }
          100% {
            transform: translateX(calc(120px * var(--size))) translateY(calc(-120px * var(--size))) scale(0) rotate(var(--angle));
            opacity: 0;
          }
        }
        @keyframes flash {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          20% {
            transform: scale(2);
            opacity: 1;
          }
          100% {
            transform: scale(0.5);
            opacity: 0;
          }
        }
        .animate-launch {
          animation: launch 0.6s ease-out forwards;
        }
        .animate-explode {
          animation: explode 1.8s ease-out forwards;
        }
        .animate-flash {
          animation: flash 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}