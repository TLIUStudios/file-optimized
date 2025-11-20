import { useEffect, useState } from "react";

export default function FireworksEffect() {
  const [fireworks, setFireworks] = useState([]);
  const [autoMode, setAutoMode] = useState(true);

  useEffect(() => {
    const handleClick = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((rect.height - (e.clientY - rect.top)) / rect.height) * 100;
      createFirework(x, y);
    };

    window.addEventListener('click', handleClick);

    let interval;
    if (autoMode) {
      interval = setInterval(() => {
        const x = 25 + Math.random() * 50;
        const y = 40 + Math.random() * 40;
        createFirework(x, y);
      }, 1500);
    }

    return () => {
      window.removeEventListener('click', handleClick);
      if (interval) clearInterval(interval);
    };
  }, [autoMode]);

  const createFirework = (x, y) => {
    const colors = [
      { primary: '#ff0844', secondary: '#ff69b4' },
      { primary: '#ffd700', secondary: '#ffed4e' },
      { primary: '#00d9ff', secondary: '#7df9ff' },
      { primary: '#b337ff', secondary: '#da70d6' },
      { primary: '#00ff88', secondary: '#7fffd4' },
      { primary: '#ff3d9e', secondary: '#ff1493' },
    ];
    const colorSet = colors[Math.floor(Math.random() * colors.length)];
    const id = Date.now() + Math.random();

    const firework = {
      id,
      left: x,
      bottom: y,
      color: colorSet,
      particleCount: 40 + Math.floor(Math.random() * 20),
      size: 1 + Math.random() * 0.5,
      type: Math.random() > 0.5 ? 'burst' : 'ring',
    };

    setFireworks(prev => [...prev, firework]);
    setTimeout(() => {
      setFireworks(prev => prev.filter(f => f.id !== id));
    }, 3000);
  };

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
          <div 
            className="absolute w-3 h-24 animate-launch"
            style={{
              left: '-6px',
              bottom: '-90px',
              background: `linear-gradient(to top, ${fw.color.primary}, transparent)`,
              boxShadow: `0 0 30px ${fw.color.primary}, 0 0 60px ${fw.color.secondary}`,
              filter: 'blur(3px)',
            }}
          />
          
          {Array.from({ length: fw.particleCount }).map((_, i) => {
            const angle = fw.type === 'ring' 
              ? (360 / fw.particleCount) * i 
              : (360 / fw.particleCount) * i + Math.random() * 20;
            const distance = fw.type === 'ring' ? 1 : 0.7 + Math.random() * 0.5;
            
            return (
              <div
                key={i}
                className="absolute animate-explode-particle"
                style={{
                  width: '9px',
                  height: '9px',
                  background: `radial-gradient(circle, ${fw.color.secondary}, ${fw.color.primary})`,
                  borderRadius: '50%',
                  boxShadow: `0 0 15px ${fw.color.primary}, 0 0 30px ${fw.color.secondary}, inset 0 0 8px white`,
                  transform: `rotate(${angle}deg)`,
                  animationDelay: '0.2s',
                  '--angle': `${angle}deg`,
                  '--distance': distance,
                  '--size': fw.size,
                }}
              />
            );
          })}
          
          <div
            className="absolute rounded-full animate-flash-burst"
            style={{
              width: '40px',
              height: '40px',
              background: `radial-gradient(circle, white, ${fw.color.secondary}, ${fw.color.primary})`,
              boxShadow: `0 0 60px ${fw.color.primary}, 0 0 120px ${fw.color.secondary}, 0 0 180px white`,
              left: '-20px',
              top: '-20px',
            }}
          />
        </div>
      ))}

      <div className="fixed bottom-4 right-4 pointer-events-auto z-50">
        <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs">
          Click anywhere to launch! 🎆
        </div>
      </div>

      <style jsx>{`
        @keyframes launch {
          0% { transform: translateY(90px) scaleY(0); opacity: 0; }
          60% { opacity: 1; }
          100% { transform: translateY(0) scaleY(1); opacity: 0; }
        }
        @keyframes explode-particle {
          0% { transform: translateX(0) translateY(0) scale(1) rotate(var(--angle)); opacity: 1; }
          100% {
            transform: translateX(calc(200px * var(--distance) * var(--size))) 
                       translateY(calc(-200px * var(--distance) * var(--size))) 
                       scale(0.2) rotate(var(--angle));
            opacity: 0;
          }
        }
        @keyframes flash-burst {
          0% { transform: scale(0); opacity: 1; }
          50% { transform: scale(5); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .animate-launch { animation: launch 1s ease-out forwards; }
        .animate-explode-particle { animation: explode-particle 2s ease-out forwards; }
        .animate-flash-burst { animation: flash-burst 1.5s ease-out forwards; }
      `}</style>
    </div>
  );
}