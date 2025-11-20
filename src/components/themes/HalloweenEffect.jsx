import { useEffect, useState } from "react";

export default function HalloweenEffect() {
  const [bats, setBats] = useState([]);
  const [spiders, setSpiders] = useState([]);

  useEffect(() => {
    const batElements = Array.from({ length: 15 }, (_, i) => ({
      id: `bat-${i}`,
      top: 10 + Math.random() * 60,
      animationDuration: 6 + Math.random() * 8,
      delay: Math.random() * 8,
      size: 1.2 + Math.random() * 0.8,
      path: i % 3,
    }));
    setBats(batElements);

    const spiderElements = Array.from({ length: 10 }, (_, i) => ({
      id: `spider-${i}`,
      left: 5 + (i * 10) + Math.random() * 5,
      animationDuration: 12 + Math.random() * 10,
      delay: Math.random() * 6,
      size: 1 + Math.random() * 0.6,
    }));
    setSpiders(spiderElements);
  }, []);

  return (
    <>
      {/* Enhanced spider webs with glow */}
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
          {Array.from({ length: 10 }).map((_, i) => (
            <g key={i} filter="url(#webGlow)">
              <circle cx={`${8 + i * 10}%`} cy="15" r="3" fill="rgba(200, 200, 200, 0.8)" />
              {Array.from({ length: 8 }).map((_, j) => (
                <line
                  key={j}
                  x1={`${8 + i * 10}%`}
                  y1="15"
                  x2={`${8 + i * 10 + (j - 3.5) * 4}%`}
                  y2="80"
                  stroke="rgba(200, 200, 200, 0.6)"
                  strokeWidth="1.5"
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* Enhanced bats with 3D shadows */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {bats.map((bat) => (
          <div
            key={bat.id}
            className={`absolute ${
              bat.path === 0 ? 'animate-fly-straight' : 
              bat.path === 1 ? 'animate-fly-wave' : 
              'animate-fly-diagonal'
            }`}
            style={{
              top: `${bat.top}%`,
              right: "-60px",
              fontSize: `${1.5 + bat.size}rem`,
              animationDuration: `${bat.animationDuration}s`,
              animationDelay: `${bat.delay}s`,
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))',
            }}
          >
            🦇
          </div>
        ))}
      </div>

      {/* Enhanced spiders with 3D silk effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {spiders.map((spider) => (
          <div
            key={spider.id}
            className="absolute"
            style={{
              left: `${spider.left}%`,
              top: "0",
            }}
          >
            {/* 3D silk thread with gradient */}
            <div
              className="absolute animate-thread"
              style={{
                width: '2px',
                height: "100vh",
                left: "50%",
                background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.3), transparent)',
                boxShadow: '0 0 4px rgba(255, 255, 255, 0.5), inset 0 0 2px rgba(255, 255, 255, 0.8)',
                animationDuration: `${spider.animationDuration}s`,
                animationDelay: `${spider.delay}s`,
              }}
            />
            {/* Spider with 3D effect */}
            <div
              className="absolute animate-crawl-down"
              style={{
                fontSize: `${1.2 + spider.size * 0.8}rem`,
                animationDuration: `${spider.animationDuration}s`,
                animationDelay: `${spider.delay}s`,
                filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.6))',
              }}
            >
              🕷️
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fly-straight {
          from { transform: translateX(0) scale(1); }
          50% { transform: translateX(-50vw) scale(1.1); }
          to { transform: translateX(calc(-100vw - 100px)) scale(1); }
        }
        @keyframes fly-wave {
          from { transform: translateX(0) translateY(0) rotate(0deg); }
          25% { transform: translateX(-25vw) translateY(-40px) rotate(-15deg); }
          50% { transform: translateX(-50vw) translateY(0) rotate(0deg); }
          75% { transform: translateX(-75vw) translateY(40px) rotate(15deg); }
          to { transform: translateX(calc(-100vw - 100px)) translateY(0) rotate(0deg); }
        }
        @keyframes fly-diagonal {
          from { transform: translateX(0) translateY(0) rotate(0deg); }
          to { transform: translateX(calc(-100vw - 100px)) translateY(120px) rotate(-20deg); }
        }
        @keyframes crawl-down {
          0% { transform: translateY(-30px) rotate(0deg) scale(0.8); opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(1080deg) scale(1.2); opacity: 0; }
        }
        @keyframes thread {
          0% { opacity: 0; transform: scaleY(0); transform-origin: top; }
          10% { opacity: 1; }
          95% { transform: scaleY(1); opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fly-straight { animation: fly-straight linear infinite; }
        .animate-fly-wave { animation: fly-wave ease-in-out infinite; }
        .animate-fly-diagonal { animation: fly-diagonal linear infinite; }
        .animate-crawl-down { animation: crawl-down linear infinite; }
        .animate-thread { animation: thread linear infinite; }
      `}</style>
    </>
  );
}