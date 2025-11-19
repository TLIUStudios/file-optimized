import { useEffect, useState } from "react";

export default function HalloweenEffect() {
  const [creatures, setCreatures] = useState([]);
  const [spiders, setSpiders] = useState([]);

  useEffect(() => {
    // Flying bats
    const bats = Array.from({ length: 8 }, (_, i) => ({
      id: `bat-${i}`,
      top: Math.random() * 50,
      animationDuration: 8 + Math.random() * 6,
      delay: Math.random() * 5,
    }));
    setCreatures(bats);

    // Crawling spiders
    const spiderElements = Array.from({ length: 6 }, (_, i) => ({
      id: `spider-${i}`,
      left: 10 + (i * 15),
      animationDuration: 10 + Math.random() * 8,
      delay: Math.random() * 4,
    }));
    setSpiders(spiderElements);
  }, []);

  return (
    <>
      {/* Bats */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {creatures.map((bat) => (
          <div
            key={bat.id}
            className="absolute text-2xl animate-fly-across"
            style={{
              top: `${bat.top}%`,
              right: "-50px",
              animationDuration: `${bat.animationDuration}s`,
              animationDelay: `${bat.delay}s`,
            }}
          >
            🦇
          </div>
        ))}
      </div>

      {/* Spiders */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {spiders.map((spider) => (
          <div
            key={spider.id}
            className="absolute text-xl animate-crawl-down"
            style={{
              left: `${spider.left}%`,
              top: "-30px",
              animationDuration: `${spider.animationDuration}s`,
              animationDelay: `${spider.delay}s`,
            }}
          >
            🕷️
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fly-across {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-100vw - 100px));
          }
        }
        @keyframes crawl-down {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(180deg);
          }
        }
        .animate-fly-across {
          animation: fly-across linear infinite;
        }
        .animate-crawl-down {
          animation: crawl-down linear infinite;
        }
      `}</style>
    </>
  );
}