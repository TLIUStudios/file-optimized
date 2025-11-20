import { useEffect, useState } from "react";

export default function SnowEffect() {
  const [snowflakes, setSnowflakes] = useState([]);
  const [groundSnow, setGroundSnow] = useState([]);

  useEffect(() => {
    const initial = Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * -100,
      size: 4 + Math.random() * 5,
      speed: 0.3 + Math.random() * 0.4,
      drift: (Math.random() - 0.5) * 0.3,
      opacity: 0.6 + Math.random() * 0.4,
    }));
    setSnowflakes(initial);

    let mouseX = null;
    let mouseY = null;
    let animationFrame;

    const animate = () => {
      setSnowflakes(prev => prev.map(flake => {
        let newY = flake.y + flake.speed;
        let newX = flake.x + flake.drift;

        if (mouseX !== null && mouseY !== null) {
          const dx = flake.x - mouseX;
          const dy = newY - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 12) {
            const force = (12 - dist) / 12;
            newX += (dx / dist) * force * 1.5;
            newY += (dy / dist) * force * 0.8;
          }
        }

        if (newY > 110) {
          if (Math.random() < 0.04) {
            const pileId = Date.now() + Math.random();
            setGroundSnow(g => [...g, { id: pileId, x: newX, size: flake.size * 4 }]);
            setTimeout(() => setGroundSnow(g => g.filter(p => p.id !== pileId)), 7000);
          }
          return { ...flake, x: Math.random() * 100, y: Math.random() * -20 };
        }

        return { ...flake, x: newX, y: newY };
      }));
      animationFrame = requestAnimationFrame(animate);
    };

    const handleMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 100;
      mouseY = (e.clientY / window.innerHeight) * 100;
    };

    window.addEventListener('mousemove', handleMouse);
    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50">
        {snowflakes.map(flake => (
          <div
            key={flake.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${flake.x}%`,
              top: `${flake.y}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: flake.opacity,
              boxShadow: '0 0 8px rgba(255,255,255,0.8)',
              willChange: 'transform',
            }}
          />
        ))}
      </div>
      <div className="fixed bottom-0 inset-x-0 pointer-events-none z-50 h-20">
        {groundSnow.map(pile => (
          <div
            key={pile.id}
            className="absolute bottom-0 animate-fade-pile"
            style={{
              left: `${pile.x}%`,
              width: `${pile.size}px`,
              height: `${pile.size * 0.3}px`,
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.9), transparent)',
              borderRadius: '50% 50% 0 0',
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes fade-pile {
          0% { opacity: 0; transform: scale(0.5); }
          20% { opacity: 1; }
          80% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.2); }
        }
        .animate-fade-pile { animation: fade-pile 7s ease-out; }
      `}</style>
    </>
  );
}