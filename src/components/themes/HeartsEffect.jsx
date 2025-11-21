import { useEffect, useRef } from "react";

export default function HeartsEffect() {
  const canvasRef = useRef(null);
  const heartsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#ff1493', '#ff69b4', '#ffc0cb', '#ff6b9d'];

    const createHeart = (x, y, burst = false) => {
      const count = burst ? 6 : 1;
      for (let i = 0; i < count; i++) {
        heartsRef.current.push({
          x, y,
          vx: burst ? (Math.random() - 0.5) * 4 : (Math.random() - 0.5) * 0.8,
          vy: burst ? -4 - Math.random() * 3 : -2 - Math.random() * 1.5,
          size: burst ? 30 + Math.random() * 20 : 25 + Math.random() * 15,
          rotation: (Math.random() - 0.5) * 60,
          rotationSpeed: (Math.random() - 0.5) * 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1,
          decay: burst ? 0.015 : 0.008,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      heartsRef.current = heartsRef.current.filter(heart => {
        heart.x += heart.vx;
        heart.y += heart.vy;
        heart.vx *= 0.99;
        heart.vy += 0.03;
        heart.rotation += heart.rotationSpeed;
        heart.life -= heart.decay;

        if (heart.life > 0) {
          ctx.save();
          ctx.translate(heart.x, heart.y);
          ctx.rotate((heart.rotation * Math.PI) / 180);
          ctx.globalAlpha = heart.life;
          ctx.font = `${heart.size}px serif`;
          ctx.shadowBlur = 20;
          ctx.shadowColor = heart.color;
          ctx.fillStyle = heart.color;
          ctx.fillText('💕', -heart.size / 2, heart.size / 2);
          ctx.restore();
          return true;
        }
        return false;
      });

      requestAnimationFrame(animate);
    };

    const handleClick = (e) => {
      createHeart(e.clientX, e.clientY, true);
    };

    const autoHeart = setInterval(() => {
      createHeart(Math.random() * canvas.width, canvas.height + 20);
    }, 1000);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      clearInterval(autoHeart);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
}