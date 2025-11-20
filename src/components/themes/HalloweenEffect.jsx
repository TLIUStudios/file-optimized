import { useEffect, useState } from "react";

export default function HalloweenEffect() {
  const [bats, setBats] = useState([]);
  const [spiders, setSpiders] = useState([]);
  const [ghosts, setGhosts] = useState([]);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const batElements = Array.from({ length: 8 }, (_, i) => ({
      id: `bat-${i}`,
      top: 15 + Math.random() * 60,
      animationDuration: 7 + Math.random() * 6,
      delay: Math.random() * 8,
      size: 1.5 + Math.random() * 0.8,
      path: i % 3,
    }));
    setBats(batElements);

    const spiderElements = Array.from({ length: 6 }, (_, i) => ({
      id: `spider-${i}`,
      left: 10 + (i * 15) + Math.random() * 8,
      animationDuration: 16 + Math.random() * 10,
      delay: Math.random() * 6,
      size: 1.2 + Math.random() * 0.6,
    }));
    setSpiders(spiderElements);

    const ghostElements = Array.from({ length: 4 }, (_, i) => ({
      id: `ghost-${i}`,
      left: 20 + i * 20 + Math.random() * 10,
      animationDuration: 14 + Math.random() * 8,
      delay: Math.random() * 5,
      size: 2.2 + Math.random() * 1,
    }));
    setGhosts(ghostElements);

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div className="fixed inset-x-0 top-0 pointer-events-none z-50 h-40">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <filter id="webGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {Array.from({ length: 8 }).map((_, i) => (
            <g key={i} filter="url(#webGlow)">
              <circle cx={`${10 + i * 12}%`} cy="25" r="5" fill="rgba(220, 220, 220, 0.85)" />
              {Array.from({ length: 7 }).map((_, j) => (
                <line
                  key={j}
                  x1={`${10 + i * 12}%`}
                  y1="25"
                  x2={`${10 + i * 12 + (j - 3) * 6}%`}
                  y2="120"
                  stroke="rgba(210, 210, 210, 0.65)"
                  strokeWidth="2"
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {bats.map((bat) => {
          const batX = window.innerWidth + 80;
          const batY = (bat.top / 100) * window.innerHeight;
          const dx = mousePos.x - batX;
          const dy = mousePos.y - batY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const avoidRadius = 200;
          const avoidForce = distance < avoidRadius ? (1 - distance / avoidRadius) * 60 : 0;

          return (
            <div
              key={bat.id}
              className={`absolute ${bat.path === 0 ? 'animate-bat-straight' : bat.path === 1 ? 'animate-bat-wave' : 'animate-bat-swoop'} transition-transform duration-300`}
              style={{
                top: `${bat.top}%`,
                right: "-80px",
                fontSize: `${1.8 + bat.size}rem`,
                animationDuration: `${bat.animationDuration}s`,
                animationDelay: `${bat.delay}s`,
                filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 10px rgba(138, 43, 226, 0.5))',
                transform: `translateY(${avoidForce * -1}px)`,
              }}
            >
              🦇
            </div>
          );
        })}
      </div>

      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {spiders.map((spider) => (
          <div
            key={spider.id}
            className="absolute"
            style={{ left: `${spider.left}%`, top: "0" }}
          >
            <div
              className="absolute animate-thread-descend"
              style={{
                width: '2px',
                height: "100vh",
                left: "50%",
                background: 'linear-gradient(to bottom, rgba(230, 230, 230, 0.75), rgba(200, 200, 200, 0.5), transparent 92%)',
                boxShadow: '0 0 8px rgba(255, 255, 255, 0.7), inset 0 0 4px rgba(255, 255, 255, 0.95)',
                animationDuration: `${spider.animationDuration}s`,
                animationDelay: `${spider.delay}s`,
              }}
            />
            <div
              className="absolute animate-spider-swing"
              style={{
                fontSize: `${1.4 + spider.size * 0.9}rem`,
                animationDuration: `${spider.animationDuration}s`,
                animationDelay: `${spider.delay}s`,
                filter: 'drop-shadow(0 5px 10px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 8px rgba(138, 43, 226, 0.5))',
              }}
            >
              🕷️
            </div>
          </div>
        ))}
      </div>

      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {ghosts.map((ghost) => {
          const ghostX = (ghost.left / 100) * window.innerWidth;
          const ghostY = window.innerHeight * 0.3;
          const dx = mousePos.x - ghostX;
          const dy = mousePos.y - ghostY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const followRadius = 250;
          const followForce = distance < followRadius ? (1 - distance / followRadius) * 40 : 0;
          const angle = Math.atan2(dy, dx);
          const offsetX = followForce > 0 ? Math.cos(angle) * followForce : 0;
          const offsetY = followForce > 0 ? Math.sin(angle) * followForce : 0;

          return (
            <div
              key={ghost.id}
              className="absolute animate-ghost-float transition-transform duration-500"
              style={{
                left: `${ghost.left}%`,
                top: '25%',
                fontSize: `${ghost.size}rem`,
                animationDuration: `${ghost.animationDuration}s`,
                animationDelay: `${ghost.delay}s`,
                filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.7)) drop-shadow(0 0 30px rgba(138, 43, 226, 0.6))',
                opacity: 0.9,
                transform: `translate(${offsetX}px, ${offsetY}px)`,
              }}
            >
              👻
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes bat-straight {
          from { transform: translateX(0); }
          to { transform: translateX(-110vw); }
        }
        @keyframes bat-wave {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-27.5vw, -40px); }
          50% { transform: translate(-55vw, 0); }
          75% { transform: translate(-82.5vw, 40px); }
          100% { transform: translate(-110vw, 0); }
        }
        @keyframes bat-swoop {
          0% { transform: translate(0, 0); }
          40% { transform: translate(-40vw, 80px); }
          80% { transform: translate(-80vw, -30px); }
          100% { transform: translate(-110vw, 0); }
        }
        @keyframes spider-swing {
          0% { transform: translateY(-50px) rotate(0deg) scale(0.8); opacity: 0; }
          8% { opacity: 1; }
          95% { opacity: 1; }
          100% { transform: translateY(105vh) rotate(1800deg) scale(1.2); opacity: 0; }
        }
        @keyframes thread-descend {
          0% { opacity: 0; transform: scaleY(0); transform-origin: top; }
          10% { opacity: 1; }
          95% { transform: scaleY(1); opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes ghost-float {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(-30px, -25px); }
          66% { transform: translate(20px, -40px); }
        }
        .animate-bat-straight { animation: bat-straight linear infinite; }
        .animate-bat-wave { animation: bat-wave ease-in-out infinite; }
        .animate-bat-swoop { animation: bat-swoop ease-in-out infinite; }
        .animate-spider-swing { animation: spider-swing linear infinite; }
        .animate-thread-descend { animation: thread-descend linear infinite; }
        .animate-ghost-float { animation: ghost-float ease-in-out infinite; }
      `}</style>
    </>
  );
}