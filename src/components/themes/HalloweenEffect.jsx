import { useEffect, useState } from "react";

export default function HalloweenEffect() {
  const [bats, setBats] = useState([]);
  const [spiders, setSpiders] = useState([]);
  const [ghosts, setGhosts] = useState([]);
  const [mouseY, setMouseY] = useState(50);

  useEffect(() => {
    // Bats
    const batInterval = setInterval(() => {
      const id = Date.now() + Math.random();
      const bat = {
        id,
        y: 20 + Math.random() * 50,
        x: 110,
        wave: Math.random() > 0.5,
      };
      setBats(prev => [...prev, bat]);
      setTimeout(() => setBats(prev => prev.filter(b => b.id !== id)), 8000);
    }, 2500);

    // Spiders
    const spiderInterval = setInterval(() => {
      const id = Date.now() + Math.random();
      const spider = { id, x: 20 + Math.random() * 60, y: -10 };
      setSpiders(prev => [...prev, spider]);
      setTimeout(() => setSpiders(prev => prev.filter(s => s.id !== id)), 12000);
    }, 4000);

    // Ghosts
    const ghostPositions = [25, 50, 75];
    setGhosts(ghostPositions.map((x, i) => ({ id: i, x, baseY: 40 })));

    // Mouse tracking
    const handleMouse = (e) => {
      setMouseY((e.clientY / window.innerHeight) * 100);
    };

    window.addEventListener('mousemove', handleMouse);

    return () => {
      clearInterval(batInterval);
      clearInterval(spiderInterval);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  // Animate bats
  useEffect(() => {
    const interval = setInterval(() => {
      setBats(prev => prev.map(bat => ({
        ...bat,
        x: bat.x - 1.2,
        y: bat.y + (bat.wave ? Math.sin(Date.now() / 200) * 0.3 : 0),
      })));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Animate spiders
  useEffect(() => {
    const interval = setInterval(() => {
      setSpiders(prev => prev.map(spider => ({
        ...spider,
        y: spider.y + 0.5,
      })));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Spiderwebs */}
      <svg className="absolute top-0 w-full h-40 opacity-80">
        {[15, 35, 55, 75].map(x => (
          <g key={x}>
            <circle cx={`${x}%`} cy="20" r="4" fill="#ddd" />
            {[-3, -1, 1, 3].map(offset => (
              <line
                key={offset}
                x1={`${x}%`}
                y1="20"
                x2={`${x + offset * 5}%`}
                y2="100"
                stroke="#ccc"
                strokeWidth="1.5"
              />
            ))}
          </g>
        ))}
      </svg>

      {/* Bats */}
      {bats.map(bat => (
        <div
          key={bat.id}
          className="absolute text-3xl transition-all duration-100"
          style={{
            left: `${bat.x}%`,
            top: `${bat.y}%`,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
          }}
        >
          🦇
        </div>
      ))}

      {/* Spiders */}
      {spiders.map(spider => (
        <div key={spider.id} className="absolute" style={{ left: `${spider.x}%`, top: `${spider.y}%` }}>
          <div
            className="absolute w-0.5 bg-gradient-to-b from-gray-300 to-transparent"
            style={{ height: '100vh', left: '10px' }}
          />
          <div className="text-2xl" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))' }}>
            🕷️
          </div>
        </div>
      ))}

      {/* Ghosts - follow mouse vertically */}
      {ghosts.map(ghost => {
        const targetY = ghost.baseY + (mouseY - 50) * 0.3;
        return (
          <div
            key={ghost.id}
            className="absolute text-4xl transition-all duration-700 ease-out"
            style={{
              left: `${ghost.x}%`,
              top: `${targetY}%`,
              filter: 'drop-shadow(0 0 20px rgba(138,43,226,0.6))',
              opacity: 0.85,
            }}
          >
            👻
          </div>
        );
      })}

      {/* Fog */}
      <div className="absolute bottom-0 w-full h-48">
        {[0, 25, 50, 75].map(x => (
          <div
            key={x}
            className="absolute animate-fog-drift"
            style={{
              left: `${x}%`,
              bottom: '-20px',
              width: '300px',
              height: '120px',
              background: 'radial-gradient(ellipse, rgba(138,43,226,0.2), transparent)',
              filter: 'blur(25px)',
              animation: `fog-drift ${15 + Math.random() * 10}s linear infinite`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes fog-drift {
          0% { transform: translateX(0); }
          100% { transform: translateX(150px); }
        }
        .animate-fog-drift { animation: fog-drift 20s linear infinite; }
      `}</style>
    </div>
  );
}