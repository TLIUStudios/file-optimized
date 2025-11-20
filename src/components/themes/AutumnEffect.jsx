import { useEffect, useState, useRef } from "react";

export default function AutumnEffect() {
  const [leaves, setLeaves] = useState([]);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const mouseTimeoutRef = useRef(null);

  useEffect(() => {
    const leafElements = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 10 + Math.random() * 12,
      opacity: 0.7 + Math.random() * 0.3,
      size: 18 + Math.random() * 14,
      delay: Math.random() * 6,
      leaf: ['🍂', '🍁', '🍃'][Math.floor(Math.random() * 3)],
    }));
    setLeaves(leafElements);

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      clearTimeout(mouseTimeoutRef.current);
      mouseTimeoutRef.current = setTimeout(() => {
        setMousePos({ x: -1000, y: -1000 });
      }, 120);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(mouseTimeoutRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {leaves.map((leaf) => {
        const leafX = (leaf.left / 100) * window.innerWidth;
        const leafY = 0;
        const dx = mousePos.x - leafX;
        const dy = mousePos.y - leafY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const blowRadius = 160;
        const blowForce = distance < blowRadius ? (1 - distance / blowRadius) * 100 : 0;
        const angle = Math.atan2(dy, dx);
        const offsetX = blowForce > 0 ? Math.cos(angle) * blowForce : 0;
        const offsetY = blowForce > 0 ? Math.sin(angle) * blowForce * 0.5 : 0;

        return (
          <div
            key={leaf.id}
            className="absolute animate-leaf-fall transition-transform duration-400 ease-out"
            style={{
              left: `${leaf.left}%`,
              top: "-40px",
              fontSize: `${leaf.size}px`,
              opacity: leaf.opacity,
              animationDuration: `${leaf.animationDuration}s`,
              animationDelay: `${leaf.delay}s`,
              filter: 'drop-shadow(0 0 6px rgba(139, 69, 19, 0.5)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.35))',
              transform: `translate(${offsetX}px, ${offsetY}px)`,
            }}
          >
            {leaf.leaf}
          </div>
        );
      })}
      <style jsx>{`
        @keyframes leaf-fall {
          0% { transform: translateY(0) translateX(0) rotateZ(0deg) rotateX(0deg); }
          20% { transform: translateY(20vh) translateX(-55px) rotateZ(144deg) rotateX(180deg); }
          40% { transform: translateY(40vh) translateX(45px) rotateZ(288deg) rotateX(360deg); }
          60% { transform: translateY(60vh) translateX(-40px) rotateZ(432deg) rotateX(540deg); }
          80% { transform: translateY(80vh) translateX(50px) rotateZ(576deg) rotateX(720deg); }
          100% { transform: translateY(100vh) translateX(-25px) rotateZ(720deg) rotateX(900deg); }
        }
        .animate-leaf-fall {
          animation: leaf-fall ease-in-out infinite;
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}