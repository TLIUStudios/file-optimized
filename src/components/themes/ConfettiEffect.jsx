import { useEffect, useState } from "react";

export default function ConfettiEffect() {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      const colors = ['#ff0844', '#ffd23f', '#00d9ff', '#b337ff', '#00ff88', '#ff3d9e'];
      
      // Create confetti burst
      for (let i = 0; i < 30; i++) {
        const id = Date.now() + Math.random() + i;
        const piece = {
          id,
          x,
          y,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: ['rect', 'circle'][Math.floor(Math.random() * 2)],
          size: 8 + Math.random() * 8,
          speedX: (Math.random() - 0.5) * 4,
          speedY: -2 - Math.random() * 4,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 20,
        };
        setPieces(prev => [...prev, piece]);
        setTimeout(() => setPieces(prev => prev.filter(p => p.id !== id)), 3000);
      }
    };

    // Auto confetti
    const interval = setInterval(() => {
      const colors = ['#ff0844', '#ffd23f', '#00d9ff', '#b337ff', '#00ff88', '#ff3d9e'];
      for (let i = 0; i < 20; i++) {
        const id = Date.now() + Math.random() + i;
        const piece = {
          id,
          x: 40 + Math.random() * 20,
          y: -5,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: ['rect', 'circle'][Math.floor(Math.random() * 2)],
          size: 8 + Math.random() * 7,
          speedX: (Math.random() - 0.5) * 2,
          speedY: 1 + Math.random() * 2,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 15,
        };
        setPieces(prev => [...prev, piece]);
        setTimeout(() => setPieces(prev => prev.filter(p => p.id !== id)), 4000);
      }
    }, 2000);

    window.addEventListener('click', handleClick);
    return () => {
      clearInterval(interval);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  // Animate
  useEffect(() => {
    const interval = setInterval(() => {
      setPieces(prev => prev.map(piece => ({
        ...piece,
        x: piece.x + piece.speedX * 0.1,
        y: piece.y + piece.speedY * 0.1,
        speedY: piece.speedY + 0.05, // Gravity
        rotation: piece.rotation + piece.rotationSpeed,
      })));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute transition-all duration-75"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            transform: `rotate(${piece.rotation}deg)`,
            opacity: Math.max(0, 1 - piece.y / 100),
          }}
        >
          {piece.shape === 'circle' ? (
            <div
              style={{
                width: `${piece.size}px`,
                height: `${piece.size}px`,
                borderRadius: '50%',
                background: piece.color,
                boxShadow: `0 0 8px ${piece.color}`,
              }}
            />
          ) : (
            <div
              style={{
                width: `${piece.size}px`,
                height: `${piece.size * 0.6}px`,
                background: piece.color,
                boxShadow: `0 0 6px ${piece.color}`,
              }}
            />
          )}
        </div>
      ))}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-2 rounded-lg text-xs backdrop-blur pointer-events-none">
        Click to celebrate! 🎉
      </div>
    </div>
  );
}