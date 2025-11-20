import { useEffect, useState } from "react";

export default function SnowEffect() {
  const [snowflakes, setSnowflakes] = useState([]);
  const [groundSnow, setGroundSnow] = useState([]);
  const [mouseX, setMouseX] = useState(null);
  const [mouseY, setMouseY] = useState(null);

  useEffect(() => {
    // Create initial snowflakes
    const initial = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * -100,
      size: 4 + Math.random() * 6,
      speed: 1 + Math.random() * 2,
      drift: (Math.random() - 0.5) * 0.5,
      opacity: 0.6 + Math.random() * 0.4,
    }));
    setSnowflakes(initial);

    // Animation loop
    const animate = () => {
      setSnowflakes(prev => prev.map(flake => {
        let newY = flake.y + flake.speed * 0.5;
        let newX = flake.x + flake.drift;

        // Mouse repulsion
        if (mouseX !== null && mouseY !== null) {
          const dx = (flake.x - mouseX) / 100 * window.innerWidth;
          const dy = (newY - mouseY) / 100 * window.innerHeight;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120;
            newX += (dx / dist) * force * 2;
            newY += (dy / dist) * force * 1;
          }
        }

        // Reset when off screen
        if (newY > 110) {
          return {
            ...flake,
            x: Math.random() * 100,
            y: Math.random() * -20,
          };
        }

        // Add to ground when near bottom
        if (newY > 95 && Math.random() < 0.05) {
          const pileId = Date.now() + Math.random();
          setGroundSnow(g => [...g, { id: pileId, x: newX, size: flake.size * 5 }]);
          setTimeout(() => {
            setGroundSnow(g => g.filter(p => p.id !== pileId));
          }, 8000);
        }

        return { ...flake, x: newX, y: newY };
      }));
    };

    const interval = setInterval(animate, 50);

    // Mouse tracking
    const handleMouse = (e) => {
      setMouseX((e.clientX / window.innerWidth) * 100);
      setMouseY((e.clientY / window.innerHeight) * 100);
    };

    window.addEventListener('mousemove', handleMouse);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Falling snow */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {snowflakes.map(flake => (
          <div
            key={flake.id}
            className="absolute rounded-full bg-white transition-all duration-100"
            style={{
              left: `${flake.x}%`,
              top: `${flake.y}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: flake.opacity,
              boxShadow: '0 0 10px rgba(255,255,255,0.8)',
              filter: 'blur(0.5px)',
            }}
          />
        ))}
      </div>

      {/* Ground accumulation */}
      <div className="fixed bottom-0 inset-x-0 pointer-events-none z-50 h-24">
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
        .animate-fade-pile { animation: fade-pile 8s ease-out; }
      `}</style>
    </>
  );
}