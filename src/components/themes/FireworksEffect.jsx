import { useEffect, useRef } from "react";

export default function FireworksEffect() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const trailsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const createFirework = (x, y) => {
      const colors = [
        ['#ff0844', '#ff5c8d', '#ffffff'],
        ['#ffd700', '#ffed4e', '#ffffff'],
        ['#00d9ff', '#5ce1ff', '#ffffff'],
        ['#b337ff', '#d280ff', '#ffffff'],
        ['#00ff88', '#5dffb0', '#ffffff'],
      ];
      const colorSet = colors[Math.floor(Math.random() * colors.length)];
      
      for (let i = 0; i < 60; i++) {
        const angle = (Math.PI * 2 * i) / 60;
        const speed = 2 + Math.random() * 3;
        particlesRef.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.015 + Math.random() * 0.01,
          color: colorSet[Math.floor(Math.random() * colorSet.length)],
          size: 2 + Math.random() * 2,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.vx *= 0.99;
        p.life -= p.decay;

        if (p.life > 0) {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 15;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          return true;
        }
        return false;
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      requestAnimationFrame(animate);
    };

    const handleClick = (e) => {
      createFirework(e.clientX, e.clientY);
    };

    const autoFirework = setInterval(() => {
      createFirework(
        window.innerWidth * (0.3 + Math.random() * 0.4),
        window.innerHeight * (0.3 + Math.random() * 0.3)
      );
    }, 1800);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      clearInterval(autoFirework);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
}