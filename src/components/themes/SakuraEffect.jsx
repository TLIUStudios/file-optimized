import { useEffect, useState } from "react";

export default function SakuraEffect() {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    const initial = Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * -50,
      rotation: Math.random() * 360,
      size: 14 + Math.random() * 9,
      speedY: 0.7 + Math.random() * 0.5,
      driftSpeed: (Math.random() - 0.5) * 0.25,
    }));
    setPetals(initial);

    let mouseX = 50;
    let animationFrame;

    const animate = () => {
      setPetals(prev => prev.map(petal => {
        let newX = petal.x + petal.driftSpeed;
        const distToMouse = Math.abs(petal.x - mouseX);
        if (distToMouse < 12) {
          const direction = petal.x > mouseX ? 1 : -1;
          newX += direction * (12 - distToMouse) * 0.12;
        }
        let newY = petal.y + petal.speedY;
        let newRotation = petal.rotation + 1.8;
        if (newY > 110) {
          return { ...petal, x: Math.random() * 100, y: Math.random() * -30, rotation: Math.random() * 360 };
        }
        return { ...petal, x: newX, y: newY, rotation: newRotation };
      }));
      animationFrame = requestAnimationFrame(animate);
    };

    const handleMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 100;
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
      {petals.map(petal => (
        <div
          key={petal.id}
          className="absolute"
          style={{
            left: `${petal.x}%`,
            top: `${petal.y}%`,
            fontSize: `${petal.size}px`,
            transform: `rotate(${petal.rotation}deg)`,
            filter: 'drop-shadow(0 2px 3px rgba(255,192,203,0.4))',
            willChange: 'transform',
          }}
        >
          🌸
        </div>
      ))}
    </div>
  );
}