import { useEffect, useState } from "react";

export default function BubblesEffect() {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = 100 - (e.clientY / window.innerHeight) * 100;
      
      // Create bubbles at click
      for (let i = 0; i < 3; i++) {
        const id = Date.now() + Math.random() + i;
        const bubble = {
          id,
          x: x + (Math.random() - 0.5) * 5,
          y,
          size: 35 + Math.random() * 40,
          speedY: 0.8 + Math.random() * 0.6,
          wobble: (Math.random() - 0.5) * 0.3,
          phase: Math.random() * Math.PI * 2,
        };
        setBubbles(prev => [...prev, bubble]);
        setTimeout(() => setBubbles(prev => prev.filter(b => b.id !== id)), 8000);
      }
    };

    // Auto bubbles
    const interval = setInterval(() => {
      const id = Date.now() + Math.random();
      const bubble = {
        id,
        x: Math.random() * 100,
        y: -5,
        size: 30 + Math.random() * 45,
        speedY: 0.6 + Math.random() * 0.5,
        wobble: (Math.random() - 0.5) * 0.4,
        phase: Math.random() * Math.PI * 2,
      };
      setBubbles(prev => [...prev, bubble]);
      setTimeout(() => setBubbles(prev => prev.filter(b => b.id !== id)), 12000);
    }, 1800);

    // Click handler with pointer-events-auto on bubbles
    const handleBubbleClick = (id) => {
      setBubbles(prev => prev.filter(b => b.id !== id));
    };

    window.addEventListener('click', handleClick);
    window.bubbleClickHandler = handleBubbleClick;

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', handleClick);
      delete window.bubbleClickHandler;
    };
  }, []);

  // Animate bubbles
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles(prev => prev.map(bubble => {
        const wobbleX = Math.sin(bubble.phase) * bubble.wobble;
        return {
          ...bubble,
          x: bubble.x + wobbleX,
          y: bubble.y + bubble.speedY,
          phase: bubble.phase + 0.05,
        };
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className="absolute pointer-events-auto cursor-pointer hover:scale-110 transition-transform duration-200"
          style={{
            left: `${bubble.x}%`,
            bottom: `${bubble.y}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            window.bubbleClickHandler?.(bubble.id);
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(173,216,230,0.5) 50%, rgba(135,206,250,0.7))',
              boxShadow: `
                inset 0 0 ${bubble.size * 0.3}px rgba(255,255,255,0.8),
                inset ${bubble.size * 0.15}px ${bubble.size * 0.15}px ${bubble.size * 0.2}px rgba(255,255,255,0.6),
                0 0 ${bubble.size * 0.4}px rgba(135,206,250,0.6)
              `,
              border: '2px solid rgba(255,255,255,0.5)',
            }}
          >
            {/* Shine highlights */}
            <div
              className="absolute rounded-full"
              style={{
                top: '20%',
                left: '25%',
                width: '30%',
                height: '30%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.95), transparent 70%)',
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                bottom: '25%',
                right: '30%',
                width: '20%',
                height: '20%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.7), transparent 65%)',
              }}
            />
          </div>
        </div>
      ))}

      <div className="fixed bottom-6 right-6 bg-black/60 text-white px-3 py-2 rounded-lg text-xs backdrop-blur pointer-events-none">
        Click bubbles to pop! 🫧
      </div>
    </div>
  );
}