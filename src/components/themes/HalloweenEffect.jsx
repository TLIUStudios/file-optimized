import { useEffect, useState } from "react";

export default function HalloweenEffect() {
  const [bats, setBats] = useState([]);
  const [spiders, setSpiders] = useState([]);
  const [ghosts, setGhosts] = useState([]);
  const [fog, setFog] = useState([]);

  useEffect(() => {
    // Bats with varied flight patterns
    const batElements = Array.from({ length: 18 }, (_, i) => ({
      id: `bat-${i}`,
      top: 10 + Math.random() * 70,
      animationDuration: 5 + Math.random() * 7,
      delay: Math.random() * 10,
      size: 1.3 + Math.random() * 0.9,
      path: i % 4,
    }));
    setBats(batElements);

    // Spiders descending
    const spiderElements = Array.from({ length: 12 }, (_, i) => ({
      id: `spider-${i}`,
      left: 5 + (i * 8) + Math.random() * 6,
      animationDuration: 14 + Math.random() * 12,
      delay: Math.random() * 8,
      size: 1.1 + Math.random() * 0.7,
      swingAmount: 15 + Math.random() * 25,
    }));
    setSpiders(spiderElements);

    // Floating ghosts
    const ghostElements = Array.from({ length: 6 }, (_, i) => ({
      id: `ghost-${i}`,
      left: 15 + i * 15 + Math.random() * 10,
      animationDuration: 12 + Math.random() * 8,
      delay: Math.random() * 6,
      size: 2 + Math.random() * 1,
    }));
    setGhosts(ghostElements);

    // Creeping fog
    const fogElements = Array.from({ length: 8 }, (_, i) => ({
      id: `fog-${i}`,
      left: i * 15 - 10,
      animationDuration: 20 + Math.random() * 15,
      delay: Math.random() * 10,
      opacity: 0.15 + Math.random() * 0.2,
    }));
    setFog(fogElements);
  }, []);

  return (
    <>
      {/* Eerie fog at bottom */}
      <div className="fixed bottom-0 inset-x-0 pointer-events-none z-50 h-48 overflow-hidden">
        {fog.map((f) => (
          <div
            key={f.id}
            className="absolute animate-fog-drift"
            style={{
              left: `${f.left}%`,
              bottom: '-20px',
              width: '400px',
              height: '150px',
              background: 'radial-gradient(ellipse at center, rgba(138, 43, 226, 0.3), rgba(75, 0, 130, 0.2), transparent)',
              filter: 'blur(30px)',
              opacity: f.opacity,
              animationDuration: `${f.animationDuration}s`,
              animationDelay: `${f.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Spooky web structure at top */}
      <div className="fixed inset-x-0 top-0 pointer-events-none z-50 h-48">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <filter id="webGlow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id="webGrad">
              <stop offset="0%" style={{ stopColor: 'rgba(220, 220, 220, 0.9)' }} />
              <stop offset="100%" style={{ stopColor: 'rgba(180, 180, 180, 0.6)' }} />
            </radialGradient>
          </defs>
          {Array.from({ length: 12 }).map((_, i) => (
            <g key={i} filter="url(#webGlow)">
              {/* Anchor point */}
              <circle cx={`${7 + i * 8.5}%`} cy="20" r="4" fill="url(#webGrad)" />
              {/* Web strands */}
              {Array.from({ length: 9 }).map((_, j) => (
                <line
                  key={j}
                  x1={`${7 + i * 8.5}%`}
                  y1="20"
                  x2={`${7 + i * 8.5 + (j - 4) * 5}%`}
                  y2="100"
                  stroke="rgba(210, 210, 210, 0.7)"
                  strokeWidth="1.8"
                />
              ))}
              {/* Radial web */}
              {[40, 60, 80].map((radius, idx) => (
                <circle
                  key={idx}
                  cx={`${7 + i * 8.5}%`}
                  cy="20"
                  r={radius}
                  fill="none"
                  stroke="rgba(200, 200, 200, 0.5)"
                  strokeWidth="1.5"
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* Flying bats with shadows */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {bats.map((bat) => (
          <div
            key={bat.id}
            className={`absolute ${
              bat.path === 0 ? 'animate-bat-straight' : 
              bat.path === 1 ? 'animate-bat-wave' : 
              bat.path === 2 ? 'animate-bat-swoop' :
              'animate-bat-circle'
            }`}
            style={{
              top: `${bat.top}%`,
              right: "-80px",
              fontSize: `${1.6 + bat.size}rem`,
              animationDuration: `${bat.animationDuration}s`,
              animationDelay: `${bat.delay}s`,
              filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 8px rgba(138, 43, 226, 0.4))',
            }}
          >
            🦇
          </div>
        ))}
      </div>

      {/* Descending spiders with swinging motion */}
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
            {/* Silk thread with shimmer */}
            <div
              className="absolute animate-thread-descend"
              style={{
                width: '2px',
                height: "100vh",
                left: "50%",
                background: 'linear-gradient(to bottom, rgba(230, 230, 230, 0.7), rgba(200, 200, 200, 0.5), transparent 90%)',
                boxShadow: `
                  0 0 6px rgba(255, 255, 255, 0.6),
                  inset 0 0 3px rgba(255, 255, 255, 0.9),
                  2px 0 4px rgba(138, 43, 226, 0.3)
                `,
                animationDuration: `${spider.animationDuration}s`,
                animationDelay: `${spider.delay}s`,
              }}
            />
            {/* Spider with swinging */}
            <div
              className="absolute animate-spider-swing"
              style={{
                fontSize: `${1.3 + spider.size * 0.9}rem`,
                animationDuration: `${spider.animationDuration}s`,
                animationDelay: `${spider.delay}s`,
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 6px rgba(138, 43, 226, 0.4))',
                '--swing': `${spider.swingAmount}px`,
              }}
            >
              🕷️
            </div>
          </div>
        ))}
      </div>

      {/* Floating ghosts */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {ghosts.map((ghost) => (
          <div
            key={ghost.id}
            className="absolute animate-ghost-float"
            style={{
              left: `${ghost.left}%`,
              top: '20%',
              fontSize: `${ghost.size}rem`,
              animationDuration: `${ghost.animationDuration}s`,
              animationDelay: `${ghost.delay}s`,
              filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 24px rgba(138, 43, 226, 0.5))',
              opacity: 0.85,
            }}
          >
            👻
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes bat-straight {
          from { transform: translateX(0) scaleX(1); }
          50% { transform: translateX(-50vw) scaleX(-1.1); }
          to { transform: translateX(-110vw) scaleX(1); }
        }
        @keyframes bat-wave {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-25vw, -50px) rotate(-12deg); }
          50% { transform: translate(-50vw, 0) rotate(0deg); }
          75% { transform: translate(-75vw, 50px) rotate(12deg); }
          100% { transform: translate(-110vw, 0) rotate(0deg); }
        }
        @keyframes bat-swoop {
          0% { transform: translate(0, 0) rotate(0deg); }
          30% { transform: translate(-30vw, 100px) rotate(20deg); }
          70% { transform: translate(-70vw, -50px) rotate(-20deg); }
          100% { transform: translate(-110vw, 0) rotate(0deg); }
        }
        @keyframes bat-circle {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(-25vw, -80px) rotate(-30deg) scale(1.2); }
          50% { transform: translate(-50vw, 0) rotate(0deg) scale(1); }
          75% { transform: translate(-75vw, 80px) rotate(30deg) scale(0.9); }
          100% { transform: translate(-110vw, 0) rotate(0deg) scale(1); }
        }
        @keyframes spider-swing {
          0% { transform: translateY(-40px) translateX(0) rotate(0deg) scale(0.7); opacity: 0; }
          5% { opacity: 1; }
          50% { transform: translateY(50vh) translateX(var(--swing)) rotate(720deg) scale(1); }
          95% { opacity: 1; }
          100% { transform: translateY(105vh) translateX(calc(var(--swing) * -0.5)) rotate(1440deg) scale(1.3); opacity: 0; }
        }
        @keyframes thread-descend {
          0% { opacity: 0; transform: scaleY(0); transform-origin: top; }
          8% { opacity: 1; }
          95% { transform: scaleY(1); opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes ghost-float {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          25% { transform: translate(-40px, -30px) scale(1.1); opacity: 0.9; }
          50% { transform: translate(20px, -50px) scale(0.95); opacity: 0.85; }
          75% { transform: translate(-30px, -20px) scale(1.05); opacity: 0.8; }
        }
        @keyframes fog-drift {
          0% { transform: translateX(0) scale(1); }
          50% { transform: translateX(100px) scale(1.2); }
          100% { transform: translateX(200px) scale(1); }
        }
        .animate-bat-straight { animation: bat-straight linear infinite; }
        .animate-bat-wave { animation: bat-wave ease-in-out infinite; }
        .animate-bat-swoop { animation: bat-swoop ease-in-out infinite; }
        .animate-bat-circle { animation: bat-circle ease-in-out infinite; }
        .animate-spider-swing { animation: spider-swing linear infinite; }
        .animate-thread-descend { animation: thread-descend linear infinite; }
        .animate-ghost-float { animation: ghost-float ease-in-out infinite; }
        .animate-fog-drift { animation: fog-drift linear infinite; }
      `}</style>
    </>
  );
}