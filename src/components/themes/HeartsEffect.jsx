import { useEffect, useState } from "react";

export default function HeartsEffect() {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    let animationFrame;

    const handleClick = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const colors = ['#ff69b4', '#ff1493', '#ffc0cb', '#ff6b9d'];
      
      for (let i = 0; i < 4; i++) {
        const id = Date.now() + Math.random() + i;
        const heart = {
          id,
          x: x + (Math.random() - 0.5) * 8,
          y: 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 1.3 + Math.random() * 0.8,
          speedX: (Math.random() - 0.5) * 1.5,
          speedY: -2.5 - Math.random() * 1.5,
        };
        setHearts(prev => [...prev, heart]);
        setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 3500);
      }
    };

    const autoInterval = setInterval(() => {
      const id = Date.now() + Math.random();
      const colors = ['#ff69b4', '#ff1493', '#ffc0cb', '#ff6b9d'];
      const heart = {
        id,
        x: Math.random() * 100,
        y: 105,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 1.1 + Math.random() * 0.7,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -1.2 - Math.random() * 0.8,
      };
      setHearts(prev => [...prev, heart]);
      setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 7000);
    }, 1800);

    const animate = () => {
      setHearts(prev => prev.map(heart => ({
        ...heart,
        x: heart.x + heart.speedX * 0.08,
        y: heart.y + heart.speedY * 0.08,
      })));
      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener('click', handleClick);
    animationFrame = requestAnimationFrame(animate);

    return () => {
      clearInterval(autoInterval);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="absolute"
          style={{
            left: `${heart.x}%`,
            top: `${heart.y}%`,
            fontSize: `${heart.size}rem`,
            color: heart.color,
            filter: `drop-shadow(0 0 6px ${heart.color})`,
            opacity: Math.max(0, Math.min(1, (110 - heart.y) / 18)),
            willChange: 'transform',
          }}
        >
          💕
        </div>
      ))}
    </div>
  );
}