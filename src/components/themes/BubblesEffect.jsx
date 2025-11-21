import { useEffect, useRef } from "react";

export default function BubblesEffect() {
  const canvasRef = useRef(null);
  const bubblesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const createBubble = (x, y) => {
      bubblesRef.current.push({
        x, y,
        size: 35 + Math.random() * 45,
        vy: 1 + Math.random() * 0.8,
        wobble: (Math.random() - 0.5) * 0.5,
        wobblePhase: Math.random() * Math.PI * 2,
        popped: false,
      });
    };

    const drawBubble = (bubble) => {
      const { x, y, size } = bubble;

      // Main bubble
      const gradient = ctx.createRadialGradient(x - size * 0.2, y - size * 0.2, 0, x, y, size / 2);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      gradient.addColorStop(0.3, 'rgba(173, 216, 230, 0.6)');
      gradient.addColorStop(0.7, 'rgba(135, 206, 250, 0.8)');
      gradient.addColorStop(1, 'rgba(100, 180, 255, 0.3)');

      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Outer ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Shine highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(x - size * 0.25, y - size * 0.25, size * 0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(x + size * 0.15, y + size * 0.2, size * 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Shadow
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(135, 206, 250, 0.4)';
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubblesRef.current = bubblesRef.current.filter(bubble => {
        if (bubble.popped) return false;

        bubble.y -= bubble.vy;
        bubble.x += Math.sin(bubble.wobblePhase) * bubble.wobble;
        bubble.wobblePhase += 0.05;

        if (bubble.y < -bubble.size) return false;

        drawBubble(bubble);
        return true;
      });

      ctx.shadowBlur = 0;
      requestAnimationFrame(animate);
    };

    const handleClick = (e) => {
      createBubble(e.clientX, canvas.height + 50);
    };

    const autoBubble = setInterval(() => {
      createBubble(Math.random() * canvas.width, canvas.height + 50);
    }, 1800);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      clearInterval(autoBubble);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
}