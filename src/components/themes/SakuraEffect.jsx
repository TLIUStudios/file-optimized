import { useEffect, useState } from "react";

export default function SakuraEffect() {
  const [petals, setPetals] = useState([]);
  const [mouseX, setMouseX] = useState(50);

  useEffect(() => {
    // Create petals
    const initial = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * -50,
      rotation: Math.random() * 360,
      size: 14 + Math.random() * 10,
      speedY: 0.8 + Math.random() * 0.6,
      driftSpeed: (Math.random() - 0.5) * 0.3,
    }));
    setPetals(initial);

    // Mouse tracking
    const handleMouse = (e) => {
      setMouseX((e.clientX / window.innerWidth) * 100);
    };

    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Animate petals
  useEffect(() => {
    const interval = setInterval(() => {
      setPetals(prev => prev.map(petal => {
        let newX = petal.x + petal.driftSpeed;
        
        // Wind effect from mouse
        const distToMouse = Math.abs(petal.x - mouseX);
        if (distToMouse < 15) {
          const direction = petal.x > mouseX ? 1 : -1;
          newX += direction * (15 - distToMouse) * 0.15;
        }

        let newY = petal.y + petal.speedY;
        let newRotation = petal.rotation + 2;

        // Reset when off screen
        if (newY > 110) {
          return {
            ...petal,
            x: Math.random() * 100,
            y: Math.random() * -30,
            rotation: Math.random() * 360,
          };
        }

        return { ...petal, x: newX, y: newY, rotation: newRotation };
      }));
    }, 50);
    return () => clearInterval(interval);
  }, [mouseX]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {petals.map(petal => (
        <div
          key={petal.id}
          className="absolute transition-all duration-100"
          style={{
            left: `${petal.x}%`,
            top: `${petal.y}%`,
            fontSize: `${petal.size}px`,
            transform: `rotate(${petal.rotation}deg)`,
            filter: 'drop-shadow(0 2px 4px rgba(255,192,203,0.4))',
          }}
        >
          🌸
        </div>
      ))}
    </div>
  );
}