import { useEffect, useState } from "react";

export default function AutumnEffect() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    const initial = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * -50,
      rotation: Math.random() * 360,
      type: ['🍂', '🍁', '🍃'][Math.floor(Math.random() * 3)],
      size: 18 + Math.random() * 10,
      speedY: 0.5 + Math.random() * 0.4,
      driftSpeed: (Math.random() - 0.5) * 0.3,
    }));
    setLeaves(initial);

    let mouseX = 50;
    let mouseY = 50;
    let animationFrame;

    const animate = () => {
      setLeaves(prev => prev.map(leaf => {
        let newX = leaf.x + leaf.driftSpeed;
        let newY = leaf.y + leaf.speedY;
        
        const dx = leaf.x - mouseX;
        const dy = leaf.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 15) {
          const force = (15 - dist) / 15;
          newX += (dx / dist) * force * 1.2;
          newY += (dy / dist) * force * 0.6;
        }

        let newRotation = leaf.rotation + 2.5;

        if (newY > 110 || newX < -5 || newX > 105) {
          return { ...leaf, x: Math.random() * 100, y: Math.random() * -30, rotation: Math.random() * 360 };
        }

        return { ...leaf, x: newX, y: newY, rotation: newRotation };
      }));
      animationFrame = requestAnimationFrame(animate);
    };

    const handleMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 100;
      mouseY = (e.clientY / window.innerHeight) * 100;
    };

    window.addEventListener('mousemove', handleMouse);
    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {leaves.map(leaf => (
        <div
          key={leaf.id}
          className="absolute"
          style={{
            left: `${leaf.x}%`,
            top: `${leaf.y}%`,
            fontSize: `${leaf.size}px`,
            transform: `rotate(${leaf.rotation}deg)`,
            filter: 'drop-shadow(0 2px 4px rgba(139,69,19,0.3))',
            willChange: 'transform',
          }}
        >
          {leaf.type}
        </div>
      ))}
    </div>
  );
}