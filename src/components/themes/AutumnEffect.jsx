import { useEffect, useState } from "react";

export default function AutumnEffect() {
  const [leaves, setLeaves] = useState([]);
  const [mouseX, setMouseX] = useState(50);
  const [mouseY, setMouseY] = useState(50);

  useEffect(() => {
    // Create leaves
    const initial = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * -50,
      rotation: Math.random() * 360,
      type: ['🍂', '🍁', '🍃'][Math.floor(Math.random() * 3)],
      size: 18 + Math.random() * 12,
      speedY: 0.6 + Math.random() * 0.5,
      driftSpeed: (Math.random() - 0.5) * 0.4,
    }));
    setLeaves(initial);

    // Mouse tracking
    const handleMouse = (e) => {
      setMouseX((e.clientX / window.innerWidth) * 100);
      setMouseY((e.clientY / window.innerHeight) * 100);
    };

    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Animate leaves
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaves(prev => prev.map(leaf => {
        let newX = leaf.x + leaf.driftSpeed;
        let newY = leaf.y + leaf.speedY;
        
        // Wind effect from mouse movement
        const dx = leaf.x - mouseX;
        const dy = leaf.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 20) {
          const force = (20 - dist) / 20;
          newX += (dx / dist) * force * 1.5;
          newY += (dy / dist) * force * 0.8;
        }

        let newRotation = leaf.rotation + 3;

        // Reset when off screen
        if (newY > 110 || newX < -5 || newX > 105) {
          return {
            ...leaf,
            x: Math.random() * 100,
            y: Math.random() * -30,
            rotation: Math.random() * 360,
          };
        }

        return { ...leaf, x: newX, y: newY, rotation: newRotation };
      }));
    }, 50);
    return () => clearInterval(interval);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {leaves.map(leaf => (
        <div
          key={leaf.id}
          className="absolute transition-all duration-100"
          style={{
            left: `${leaf.x}%`,
            top: `${leaf.y}%`,
            fontSize: `${leaf.size}px`,
            transform: `rotate(${leaf.rotation}deg)`,
            filter: 'drop-shadow(0 3px 5px rgba(139,69,19,0.3))',
          }}
        >
          {leaf.type}
        </div>
      ))}
    </div>
  );
}