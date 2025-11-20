import { useEffect, useState } from "react";

export default function HalloweenEffect() {
  const [bats, setBats] = useState([]);
  const [spiders, setSpiders] = useState([]);

  useEffect(() => {
    // Flying bats with varied behavior
    const batElements = Array.from({ length: 12 }, (_, i) => ({
      id: `bat-${i}`,
      top: 10 + Math.random() * 60,
      animationDuration: 6 + Math.random() * 8,
      delay: Math.random() * 8,
      size: 0.8 + Math.random() * 0.6,
      path: i % 3, // 0 = straight, 1 = wave, 2 = diagonal
    }));
    setBats(batElements);

    // Spiders crawling down with webs
    const spiderElements = Array.from({ length: 8 }, (_, i) => ({
      id: `spider-${i}`,
      left: 5 + (i * 12) + Math.random() * 5,
      animationDuration: 12 + Math.random() * 10,
      delay: Math.random() * 6,
      size: 0.7 + Math.random() * 0.5,
    }));
    setSpiders(spiderElements);
  }, []);

  return (
    <>
      {/* Spider webs at top */}
      <div className="fixed inset-x-0 top-0 pointer-events-none z-50 h-32 opacity-20">
        <svg width="100%" height="100%" className="absolute inset-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <g key={i}>
              <circle cx={`${10 + i * 12}%`} cy="10" r="2" fill="white" />
              {Array.from({ length: 6 }).map((_, j) => (
                <line
                  key={j}
                  x1={`${10 + i * 12}%`}
                  y1="10"
                  x2={`${10 + i * 12 + (j - 2.5) * 3}%`}
                  y2="50"
                  stroke="white"
                  strokeWidth="0.5"
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* Bats with different flight patterns */}
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
              right: "-50px",
              fontSize: `${1.2 + bat.size * 0.8}rem`,
              animationDuration: `${bat.animationDuration}s`,
              animationDelay: `${bat.delay}s`,
            }}
          >
            🦇
          </div>
        ))}
      </div>

      {/* Spiders crawling down silk threads */}
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
            {/* Silk thread */}
            <div
              className="absolute w-px bg-gradient-to-b from-white/40 via-white/20 to-transparent animate-thread"
              style={{
                height: "100vh",
                left: "50%",
                animationDuration: `${spider.animationDuration}s`,
                animationDelay: `${spider.delay}s`,
              }}
            />
            {/* Spider */}
            <div
              className="absolute animate-crawl-down"
              style={{
                fontSize: `${1 + spider.size * 0.6}rem`,
                animationDuration: `${spider.animationDuration}s`,
                animationDelay: `${spider.delay}s`,
              }}
            >
              🕷️
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fly-straight {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-100vw - 100px));
          }
        }
        @keyframes fly-wave {
          from {
            transform: translateX(0) translateY(0);
          }
          25% {
            transform: translateX(-25vw) translateY(-30px);
          }
          50% {
            transform: translateX(-50vw) translateY(0);
          }
          75% {
            transform: translateX(-75vw) translateY(30px);
          }
          to {
            transform: translateX(calc(-100vw - 100px)) translateY(0);
          }
        }
        @keyframes fly-diagonal {
          from {
            transform: translateX(0) translateY(0);
          }
          to {
            transform: translateX(calc(-100vw - 100px)) translateY(100px);
          }
        }
        @keyframes crawl-down {
          0% {
            transform: translateY(-30px) rotate(0deg);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes thread {
          0% {
            opacity: 0;
            transform: scaleY(0);
            transform-origin: top;
          }
          10% {
            opacity: 1;
          }
          95% {
            transform: scaleY(1);
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        .animate-fly-straight {
          animation: fly-straight linear infinite;
        }
        .animate-fly-wave {
          animation: fly-wave ease-in-out infinite;
        }
        .animate-fly-diagonal {
          animation: fly-diagonal linear infinite;
        }
        .animate-crawl-down {
          animation: crawl-down linear infinite;
        }
        .animate-thread {
          animation: thread linear infinite;
        }
      `}</style>
    </>
  );
}