import { useEffect, useState } from "react";

export default function FireworksEffect() {
  const [fireworks, setFireworks] = useState([]);

  useEffect(() => {
    const createFirework = () => {
      const id = Date.now() + Math.random();
      const firework = {
        id,
        left: 20 + Math.random() * 60,
        bottom: 20 + Math.random() * 40,
        color: ['#ff0844', '#ffb199', '#ffd23f', '#00d9ff', '#b337ff'][Math.floor(Math.random() * 5)],
      };
      
      setFireworks(prev => [...prev, firework]);
      
      setTimeout(() => {
        setFireworks(prev => prev.filter(f => f.id !== id));
      }, 2000);
    };

    const interval = setInterval(createFirework, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {fireworks.map((fw) => (
        <div
          key={fw.id}
          className="absolute"
          style={{
            left: `${fw.left}%`,
            bottom: `${fw.bottom}%`,
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-explode"
              style={{
                backgroundColor: fw.color,
                transform: `rotate(${i * 30}deg)`,
                animationDelay: '0s',
              }}
            />
          ))}
        </div>
      ))}
      <style jsx>{`
        @keyframes explode {
          0% {
            transform: translateX(0) translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(100px) translateY(-100px) scale(0);
            opacity: 0;
          }
        }
        .animate-explode {
          animation: explode 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}