import { useEffect, useState } from "react";

export default function ConfettiEffect() {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    let animationFrame;

    const handleClick = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      const colors = ['#ff0844', '#ffd23f', '#00d9ff', '#b337ff', '#00ff88', '#ff3d9e'];
      
      for (let i = 0; i < 25; i++) {
        const id = Date.now() + Math.random() + i;
        const piece = {
          id, x, y,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: ['rect', 'circle'][Math.floor(Math.random() * 2)],
          size: 7 + Math.random() * 7,
          speedX: (Math.random() - 0.5) * 3.5,
          speedY: -1.8 - Math.random() * 3.5,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 18,
        };
        setPieces(prev => [...prev, piece]);
        setTimeout(() => setPieces(prev => prev.filter(p => p.id !== id)), 2800);
      }
    };

    const autoInterval = setInterval(() => {
      const colors = ['#ff0844', '#ffd23f', '#00d9ff', '#b337ff', '#00ff88', '#ff3d9e'];
      for (let i = 0; i < 16; i++) {
        const id = Date.now() + Math.random() + i;
        const piece = {
          id, x: 40 + Math.random() * 20, y: -5,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: ['rect', 'circle'][Math.floor(Math.random() * 2)],
          size: 7 + Math.random() * 6,
          speedX: (Math.random() - 0.5) * 1.8,
          speedY: 0.8 + Math.random() * 1.8,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 13,
        };
        setPieces(prev => [...prev, piece]);
        setTimeout(() => setPieces(prev => prev.filter(p => p.id !== id)), 3500);
      }
    }, 2200);

    const animate = () => {
      setPieces(prev => prev.map(piece => ({
        ...piece,
        x: piece.x + piece.speedX * 0.08,
        y: piece.y + piece.speedY * 0.08,
        speedY: piece.speedY + 0.04,
        rotation: piece.rotation + piece.rotationSpeed,
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
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            transform: `rotate(${piece.rotation}deg)`,
            opacity: Math.max(0, 1 - piece.y / 100),
            willChange: 'transform',
          }}
        >
          {piece.shape === 'circle' ? (
            <div style={{ width: `${piece.size}px`, height: `${piece.size}px`, borderRadius: '50%', background: piece.color, boxShadow: `0 0 6px ${piece.color}` }} />
          ) : (
            <div style={{ width: `${piece.size}px`, height: `${piece.size * 0.6}px`, background: piece.color, boxShadow: `0 0 5px ${piece.color}` }} />
          )}
        </div>
      ))}
    </div>
  );
}