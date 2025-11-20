import { useEffect, useState } from "react";

export default function HalloweenEffect() {
  const [bats, setBats] = useState([]);
  const [spiders, setSpiders] = useState([]);
  const [ghosts, setGhosts] = useState([]);

  useEffect(() => {
    let mouseY = 50;
    let animationFrame;

    const batInterval = setInterval(() => {
      const id = Date.now() + Math.random();
      const bat = { id, y: 20 + Math.random() * 50, x: 110, wave: Math.random() > 0.5 };
      setBats(prev => [...prev, bat]);
      setTimeout(() => setBats(prev => prev.filter(b => b.id !== id)), 7000);
    }, 3000);

    const spiderInterval = setInterval(() => {
      const id = Date.now() + Math.random();
      const spider = { id, x: 20 + Math.random() * 60, y: -10 };
      setSpiders(prev => [...prev, spider]);
      setTimeout(() => setSpiders(prev => prev.filter(s => s.id !== id)), 10000);
    }, 4500);

    setGhosts([25, 50, 75].map((x, i) => ({ id: i, x, baseY: 40 })));

    const animate = () => {
      setBats(prev => prev.map(bat => ({ ...bat, x: bat.x - 1, y: bat.y + (bat.wave ? Math.sin(Date.now() / 300) * 0.25 : 0) })));
      setSpiders(prev => prev.map(spider => ({ ...spider, y: spider.y + 0.4 })));
      animationFrame = requestAnimationFrame(animate);
    };

    const handleMouse = (e) => {
      mouseY = (e.clientY / window.innerHeight) * 100;
      setGhosts(prev => prev.map(ghost => ({ ...ghost, targetY: ghost.baseY + (mouseY - 50) * 0.25 })));
    };

    window.addEventListener('mousemove', handleMouse);
    animationFrame = requestAnimationFrame(animate);

    return () => {
      clearInterval(batInterval);
      clearInterval(spiderInterval);
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <svg className="absolute top-0 w-full h-32 opacity-75">
        {[20, 45, 70].map(x => (
          <g key={x}>
            <circle cx={`${x}%`} cy="18" r="4" fill="#ddd" />
            {[-2, 0, 2].map(offset => (
              <line key={offset} x1={`${x}%`} y1="18" x2={`${x + offset * 5}%`} y2="90" stroke="#ccc" strokeWidth="1.5" />
            ))}
          </g>
        ))}
      </svg>
      {bats.map(bat => (
        <div key={bat.id} className="absolute text-2xl" style={{ left: `${bat.x}%`, top: `${bat.y}%`, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))', willChange: 'transform' }}>🦇</div>
      ))}
      {spiders.map(spider => (
        <div key={spider.id} className="absolute" style={{ left: `${spider.x}%`, top: `${spider.y}%` }}>
          <div className="absolute w-0.5 bg-gradient-to-b from-gray-300 to-transparent" style={{ height: '100vh', left: '8px' }} />
          <div className="text-xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>🕷️</div>
        </div>
      ))}
      {ghosts.map(ghost => (
        <div key={ghost.id} className="absolute text-3xl transition-all duration-500 ease-out" style={{ left: `${ghost.x}%`, top: `${ghost.targetY || ghost.baseY}%`, filter: 'drop-shadow(0 0 15px rgba(138,43,226,0.6))', opacity: 0.85 }}>👻</div>
      ))}
      <div className="absolute bottom-0 w-full h-40">
        {[0, 30, 60].map(x => (
          <div key={x} className="absolute animate-fog" style={{ left: `${x}%`, bottom: '-15px', width: '280px', height: '100px', background: 'radial-gradient(ellipse, rgba(138,43,226,0.18), transparent)', filter: 'blur(20px)' }} />
        ))}
      </div>
      <style jsx>{`
        @keyframes fog { 0% { transform: translateX(0); } 100% { transform: translateX(120px); } }
        .animate-fog { animation: fog 18s linear infinite; }
      `}</style>
    </div>
  );
}