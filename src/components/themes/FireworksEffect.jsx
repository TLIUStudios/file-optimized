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
        color: ['#ff0844', '#ffb199', '#ffd23f', '#00d9ff', '#b337ff', '#00ff88', '#ff3d9e', '#4dffdf'][Math.floor(Math.random() * 8)],
        particleCount: 30 + Math.floor(Math.random() * 25),
        size: 1 + Math.random() * 0.5,
      };
      
      setFireworks(prev => [...prev, firework]);
      
      setTimeout(() => {
        setFireworks(prev => prev.filter(f => f.id !== id));
      }, 3000);
    };

    const interval = setInterval(createFirework, 600);
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
          {/* Launch trail with glow */}
          <div 
            className="absolute w-2 h-16 animate-launch"
            style={{
              left: '-4px',
              bottom: '-60px',
              background: `linear-gradient(to top, ${fw.color}, transparent)`,
              boxShadow: `0 0 20px ${fw.color}, 0 0 40px ${fw.color}`,
              filter: 'blur(2px)',
            }}
          />
          
          {/* Explosion particles with 3D effect */}
          {Array.from({ length: fw.particleCount }).map((_, i) => {
            const angle = (360 / fw.particleCount) * i;
            return (
              <div
                key={i}
                className="absolute rounded-full animate-explode"
                style={{
                  width: '6px',
                  height: '6px',
                  background: `radial-gradient(circle, ${fw.color}, transparent)`,
                  boxShadow: `0 0 10px ${fw.color}, 0 0 20px ${fw.color}, inset 0 0 5px white`,
                  transform: `rotate(${angle}deg)`,
                  animationDelay: '0.1s',
                  '--angle': `${angle}deg`,
                  '--size': fw.size,
                }}
              />
            );
          })}
          
          {/* Center bright flash with glow */}
          <div
            className="absolute rounded-full animate-flash"
            style={{
              width: '20px',
              height: '20px',
              background: `radial-gradient(circle, white, ${fw.color})`,
              boxShadow: `0 0 40px ${fw.color}, 0 0 80px ${fw.color}, 0 0 120px ${fw.color}`,
              left: '-10px',
              top: '-10px',
            }}
          />
        </div>
      ))}
      <style jsx>{`
        @keyframes launch {
          0% {
            transform: translateY(60px) scaleY(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(0) scaleY(1);
            opacity: 0;
          }
        }
        @keyframes explode {
          0% {
            transform: translateX(0) translateY(0) scale(1) rotate(var(--angle));
            opacity: 1;
          }
          100% {
            transform: translateX(calc(150px * var(--size))) translateY(calc(-150px * var(--size))) scale(0) rotate(var(--angle));
            opacity: 0;
          }
        }
        @keyframes flash {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          30% {
            transform: scale(3);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        .animate-launch {
          animation: launch 0.8s ease-out forwards;
        }
        .animate-explode {
          animation: explode 2s ease-out forwards;
        }
        .animate-flash {
          animation: flash 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}