import { useEffect, useState } from "react";

export default function FireworksEffect() {
  const [fireworks, setFireworks] = useState([]);
  const [sparkTrails, setSparkTrails] = useState([]);

  useEffect(() => {
    const createFirework = () => {
      const id = Date.now() + Math.random();
      const colors = [
        { primary: '#ff0844', secondary: '#ff69b4' },
        { primary: '#ffd700', secondary: '#ffed4e' },
        { primary: '#00d9ff', secondary: '#7df9ff' },
        { primary: '#b337ff', secondary: '#da70d6' },
        { primary: '#00ff88', secondary: '#7fffd4' },
        { primary: '#ff3d9e', secondary: '#ff1493' },
      ];
      const colorSet = colors[Math.floor(Math.random() * colors.length)];
      
      const firework = {
        id,
        left: 25 + Math.random() * 50,
        bottom: 35 + Math.random() * 45,
        color: colorSet,
        particleCount: 35 + Math.floor(Math.random() * 30),
        size: 1.2 + Math.random() * 0.6,
        type: Math.random() > 0.3 ? 'burst' : 'ring',
      };
      
      setFireworks(prev => [...prev, firework]);
      
      // Create spark trails during launch
      const trailInterval = setInterval(() => {
        setSparkTrails(prev => [...prev, {
          id: Date.now() + Math.random(),
          left: firework.left,
          bottom: Math.random() * 30,
          color: colorSet.primary,
        }]);
      }, 30);
      
      setTimeout(() => {
        clearInterval(trailInterval);
      }, 800);
      
      setTimeout(() => {
        setFireworks(prev => prev.filter(f => f.id !== id));
      }, 3500);
    };

    const interval = setInterval(createFirework, 700);
    
    // Clean up spark trails
    const trailCleanup = setInterval(() => {
      setSparkTrails(prev => prev.slice(-50));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(trailCleanup);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Spark trails */}
      {sparkTrails.map((spark) => (
        <div
          key={spark.id}
          className="absolute animate-spark-fade"
          style={{
            left: `${spark.left}%`,
            bottom: `${spark.bottom}%`,
            width: '3px',
            height: '3px',
            background: spark.color,
            borderRadius: '50%',
            boxShadow: `0 0 6px ${spark.color}`,
          }}
        />
      ))}

      {/* Fireworks */}
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
            className="absolute w-3 h-20 animate-launch"
            style={{
              left: '-6px',
              bottom: '-80px',
              background: `linear-gradient(to top, ${fw.color.primary}, transparent)`,
              boxShadow: `0 0 25px ${fw.color.primary}, 0 0 50px ${fw.color.secondary}`,
              filter: 'blur(3px)',
            }}
          />
          
          {/* Explosion particles */}
          {Array.from({ length: fw.particleCount }).map((_, i) => {
            const angle = fw.type === 'ring' 
              ? (360 / fw.particleCount) * i 
              : (360 / fw.particleCount) * i + Math.random() * 15;
            const distance = fw.type === 'ring' ? 1 : 0.8 + Math.random() * 0.4;
            
            return (
              <div
                key={i}
                className="absolute animate-explode-particle"
                style={{
                  width: '8px',
                  height: '8px',
                  background: `radial-gradient(circle, ${fw.color.secondary}, ${fw.color.primary})`,
                  borderRadius: '50%',
                  boxShadow: `
                    0 0 12px ${fw.color.primary}, 
                    0 0 24px ${fw.color.secondary},
                    inset 0 0 6px white
                  `,
                  transform: `rotate(${angle}deg)`,
                  animationDelay: '0.15s',
                  '--angle': `${angle}deg`,
                  '--distance': distance,
                  '--size': fw.size,
                }}
              >
                {/* Trailing spark */}
                <div
                  className="absolute w-1 h-1 rounded-full animate-trail-fade"
                  style={{
                    background: fw.color.primary,
                    boxShadow: `0 0 6px ${fw.color.primary}`,
                    left: '50%',
                    top: '50%',
                  }}
                />
              </div>
            );
          })}
          
          {/* Center flash */}
          <div
            className="absolute rounded-full animate-flash-burst"
            style={{
              width: '30px',
              height: '30px',
              background: `radial-gradient(circle, white, ${fw.color.secondary}, ${fw.color.primary})`,
              boxShadow: `
                0 0 50px ${fw.color.primary}, 
                0 0 100px ${fw.color.secondary}, 
                0 0 150px white
              `,
              left: '-15px',
              top: '-15px',
            }}
          />
        </div>
      ))}

      <style jsx>{`
        @keyframes launch {
          0% { transform: translateY(80px) scaleY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(0) scaleY(1); opacity: 0; }
        }
        @keyframes explode-particle {
          0% {
            transform: translateX(0) translateY(0) scale(1) rotate(var(--angle));
            opacity: 1;
          }
          100% {
            transform: 
              translateX(calc(180px * var(--distance) * var(--size))) 
              translateY(calc(-180px * var(--distance) * var(--size))) 
              scale(0.3) 
              rotate(var(--angle));
            opacity: 0;
          }
        }
        @keyframes flash-burst {
          0% { transform: scale(0); opacity: 1; }
          40% { transform: scale(4); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes spark-fade {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.3); }
        }
        @keyframes trail-fade {
          0% { opacity: 1; transform: translateX(-20px); }
          100% { opacity: 0; transform: translateX(-40px); }
        }
        .animate-launch { animation: launch 1s ease-out forwards; }
        .animate-explode-particle { animation: explode-particle 2.2s ease-out forwards; }
        .animate-flash-burst { animation: flash-burst 1.2s ease-out forwards; }
        .animate-spark-fade { animation: spark-fade 0.6s ease-out forwards; }
        .animate-trail-fade { animation: trail-fade 0.8s ease-out infinite; }
      `}</style>
    </div>
  );
}