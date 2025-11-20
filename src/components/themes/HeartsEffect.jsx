import { useEffect, useState } from "react";

export default function HeartsEffect() {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const autoHeartInterval = setInterval(() => {
      createHeart(Math.random() * 100, false);
    }, 2000);

    const handleClick = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      createHeart(x, true);
    };

    window.addEventListener('click', handleClick);

    return () => {
      clearInterval(autoHeartInterval);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  const createHeart = (leftPos, isClick) => {
    const colors = ['#ff69b4', '#ff1493', '#ff6b9d', '#ff4d6d', '#ff85a2', '#ffc0cb'];
    const id = Date.now() + Math.random();
    
    const heart = {
      id,
      left: leftPos,
      animationDuration: isClick ? 6 : 10 + Math.random() * 8,
      opacity: isClick ? 0.9 : 0.6 + Math.random() * 0.4,
      size: isClick ? 1.8 + Math.random() * 1 : 1.3 + Math.random() * 1,
      delay: 0,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      isClick,
    };

    setHearts(prev => [...prev, heart]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== id));
    }, heart.animationDuration * 1000);
  };

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className={heart.isClick ? "absolute animate-float-hearts-click" : "absolute animate-float-hearts"}
            style={{
              left: `${heart.left}%`,
              bottom: "-40px",
              fontSize: `${heart.size}rem`,
              opacity: heart.opacity,
              animationDuration: `${heart.animationDuration}s`,
              animationDelay: `${heart.delay}s`,
              filter: `drop-shadow(0 0 12px ${heart.color}) drop-shadow(0 6px 10px rgba(0, 0, 0, 0.25))`,
              color: heart.color,
            }}
          >
            💕
          </div>
        ))}
      </div>

      <div className="fixed bottom-4 left-4 pointer-events-auto z-50">
        <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs">
          Click to spread love! 💕
        </div>
      </div>

      <style jsx>{`
        @keyframes float-hearts {
          0% { transform: translateY(0) translateX(0) rotate(0deg) scale(0.7); opacity: 0; }
          12% { opacity: 1; }
          25% { transform: translateY(-25vh) translateX(40px) rotate(90deg) scale(1.1); }
          50% { transform: translateY(-50vh) translateX(-30px) rotate(180deg) scale(1); }
          75% { transform: translateY(-75vh) translateX(45px) rotate(270deg) scale(1.05); }
          88% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(-25px) rotate(360deg) scale(0.8); opacity: 0; }
        }
        @keyframes float-hearts-click {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          15% { transform: translateY(-15vh) scale(1.3); opacity: 1; }
          30% { transform: translateY(-30vh) translateX(30px) rotate(60deg) scale(1.1); }
          60% { transform: translateY(-60vh) translateX(-25px) rotate(180deg) scale(1); }
          85% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(20px) rotate(360deg) scale(0.6); opacity: 0; }
        }
        .animate-float-hearts { animation: float-hearts ease-in-out infinite; }
        .animate-float-hearts-click { animation: float-hearts-click ease-out forwards; }
      `}</style>
    </>
  );
}