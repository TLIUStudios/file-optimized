import { useEffect, useState } from "react";

export default function FireworksEffect() {
  const [fireworks, setFireworks] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = 100 - (e.clientY / window.innerHeight) * 100;
      launchFirework(x, y);
    };

    // Auto fireworks
    const interval = setInterval(() => {
      const x = 30 + Math.random() * 40;
      const y = 50 + Math.random() * 30;
      launchFirework(x, y);
    }, 2000);

    window.addEventListener('click', handleClick);
    return () => {
      clearInterval(interval);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  const launchFirework = (x, y) => {
    const colors = ['#ff0844', '#ffd700', '#00d9ff', '#b337ff', '#00ff88', '#ff3d9e'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const id = Date.now() + Math.random();
    
    const particles = Array.from({ length: 50 }, (_, i) => ({
      angle: (360 / 50) * i,
      distance: 0,
    }));

    setFireworks(prev => [...prev, { id, x, y, color, particles, time: 0 }]);

    // Animate
    let frame = 0;
    const animate = setInterval(() => {
      frame++;
      setFireworks(prev => prev.map(fw => {
        if (fw.id !== id) return fw;
        return {
          ...fw,
          particles: fw.particles.map(p => ({
            ...p,
            distance: p.distance + 2.5,
          })),
          time: frame,
        };
      }));

      if (frame > 30) {
        clearInterval(animate);
        setTimeout(() => {
          setFireworks(prev => prev.filter(fw => fw.id !== id));
        }, 500);
      }
    }, 30);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {fireworks.map(fw => (
        <div key={fw.id} className="absolute" style={{ left: `${fw.x}%`, bottom: `${fw.y}%` }}>
          {/* Launch trail */}
          {fw.time < 5 && (
            <div
              className="absolute w-1 rounded-full"
              style={{
                left: '-2px',
                bottom: '-60px',
                height: '60px',
                background: `linear-gradient(to top, ${fw.color}, transparent)`,
                boxShadow: `0 0 20px ${fw.color}`,
                opacity: 1 - fw.time / 5,
              }}
            />
          )}

          {/* Particles */}
          {fw.particles.map((p, i) => {
            const rad = (p.angle * Math.PI) / 180;
            const x = Math.cos(rad) * p.distance;
            const y = Math.sin(rad) * p.distance;
            const opacity = Math.max(0, 1 - p.distance / 120);

            return (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  transform: `translate(${x}px, ${-y}px)`,
                  background: fw.color,
                  boxShadow: `0 0 10px ${fw.color}`,
                  opacity,
                }}
              />
            );
          })}

          {/* Flash */}
          {fw.time < 10 && (
            <div
              className="absolute rounded-full"
              style={{
                left: '-20px',
                top: '-20px',
                width: '40px',
                height: '40px',
                background: `radial-gradient(circle, white, ${fw.color})`,
                boxShadow: `0 0 60px ${fw.color}`,
                opacity: 1 - fw.time / 10,
                transform: `scale(${1 + fw.time / 5})`,
              }}
            />
          )}
        </div>
      ))}

      <div className="fixed bottom-6 right-6 bg-black/60 text-white px-3 py-2 rounded-lg text-xs backdrop-blur pointer-events-none">
        Click anywhere! 🎆
      </div>
    </div>
  );
}