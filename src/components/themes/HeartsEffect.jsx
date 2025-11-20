import { useEffect, useState } from "react";

export default function HeartsEffect() {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const colors = ['#ff69b4', '#ff1493', '#ffc0cb', '#ff6b9d'];
      
      // Create burst of hearts
      for (let i = 0; i < 5; i++) {
        const id = Date.now() + Math.random() + i;
        const heart = {
          id,
          x: x + (Math.random() - 0.5) * 10,
          y: 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 1.5 + Math.random() * 1,
          speedX: (Math.random() - 0.5) * 2,
          speedY: -3 - Math.random() * 2,
        };
        setHearts(prev => [...prev, heart]);
        setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 4000);
      }
    };

    // Auto hearts
    const interval = setInterval(() => {
      const id = Date.now() + Math.random();
      const colors = ['#ff69b4', '#ff1493', '#ffc0cb', '#ff6b9d'];
      const heart = {
        id,
        x: Math.random() * 100,
        y: 105,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 1.2 + Math.random() * 0.8,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: -1.5 - Math.random(),
      };
      setHearts(prev => [...prev, heart]);
      setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 8000);
    }, 1500);

    window.addEventListener('click', handleClick);
    return () => {
      clearInterval(interval);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  // Animate hearts
  useEffect(() => {
    const interval = setInterval(() => {
      setHearts(prev => prev.map(heart => ({
        ...heart,
        x: heart.x + heart.speedX * 0.1,
        y: heart.y + heart.speedY * 0.1,
      })));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="absolute transition-all duration-100"
          style={{
            left: `${heart.x}%`,
            top: `${heart.y}%`,
            fontSize: `${heart.size}rem`,
            color: heart.color,
            filter: `drop-shadow(0 0 8px ${heart.color})`,
            opacity: Math.max(0, Math.min(1, (110 - heart.y) / 20)),
          }}
        >
          💕
        </div>
      ))}

      <div className="fixed bottom-6 left-6 bg-black/60 text-white px-3 py-2 rounded-lg text-xs backdrop-blur pointer-events-none">
        Click to spread love! 💕
      </div>
    </div>
  );
}