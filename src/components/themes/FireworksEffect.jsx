import { useEffect, useState } from "react";

export default function FireworksEffect() {
  const [fireworks, setFireworks] = useState([]);

  useEffect(() => {
    const launchFirework = (x, y) => {
      const colors = ['#ff0844', '#ffd700', '#00d9ff', '#b337ff', '#00ff88', '#ff3d9e'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const id = Date.now() + Math.random();
      
      const particles = Array.from({ length: 40 }, (_, i) => ({
        angle: (360 / 40) * i,
        distance: 0,
      }));

      setFireworks(prev => [...prev, { id, x, y, color, particles, time: 0 }]);

      let frame = 0;
      const animate = () => {
        if (frame > 25) {
          setTimeout(() => setFireworks(prev => prev.filter(fw => fw.id !== id)), 300);
          return;
        }
        frame++;
        setFireworks(prev => prev.map(fw => {
          if (fw.id !== id) return fw;
          return {
            ...fw,
            particles: fw.particles.map(p => ({ ...p, distance: p.distance + 2.2 })),
            time: frame,
          };
        }));
        requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    };

    const handleClick = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = 100 - (e.clientY / window.innerHeight) * 100;
      launchFirework(x, y);
    };

    const interval = setInterval(() => {
      const x = 30 + Math.random() * 40;
      const y = 50 + Math.random() * 30;
      launchFirework(x, y);
    }, 2500);

    window.addEventListener('click', handleClick);
    return () => {
      clearInterval(interval);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {fireworks.map(fw => (
        <div key={fw.id} className="absolute" style={{ left: `${fw.x}%`, bottom: `${fw.y}%` }}>
          {fw.time < 5 && (
            <div
              className="absolute w-1 rounded-full"
              style={{
                left: '-2px',
                bottom: '-50px',
                height: '50px',
                background: `linear-gradient(to top, ${fw.color}, transparent)`,
                boxShadow: `0 0 15px ${fw.color}`,
                opacity: 1 - fw.time / 5,
              }}
            />
          )}
          {fw.particles.map((p, i) => {
            const rad = (p.angle * Math.PI) / 180;
            const x = Math.cos(rad) * p.distance;
            const y = Math.sin(rad) * p.distance;
            const opacity = Math.max(0, 1 - p.distance / 100);
            return (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  transform: `translate(${x}px, ${-y}px)`,
                  background: fw.color,
                  boxShadow: `0 0 8px ${fw.color}`,
                  opacity,
                  willChange: 'transform',
                }}
              />
            );
          })}
          {fw.time < 8 && (
            <div
              className="absolute rounded-full"
              style={{
                left: '-15px',
                top: '-15px',
                width: '30px',
                height: '30px',
                background: `radial-gradient(circle, white, ${fw.color})`,
                boxShadow: `0 0 50px ${fw.color}`,
                opacity: 1 - fw.time / 8,
                transform: `scale(${1 + fw.time / 4})`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}