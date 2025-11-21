import { useEffect, useRef } from "react";

export default function SakuraEffect() {
  const canvasRef = useRef(null);
  const petalsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 0; i < 30; i++) {
      petalsRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: 18 + Math.random() * 14,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0.8 + Math.random() * 0.7,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 4,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.03,
        opacity: 0.6 + Math.random() * 0.4,
      });
    }

    let mouseX = canvas.width / 2;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petalsRef.current.forEach(petal => {
        petal.x += petal.vx + Math.sin(petal.wobble) * 0.5;
        petal.y += petal.vy;
        petal.rotation += petal.rotationSpeed;
        petal.wobble += petal.wobbleSpeed;

        const distToMouse = Math.abs(petal.x - mouseX);
        if (distToMouse < 150) {
          const force = (150 - distToMouse) / 150;
          const direction = petal.x > mouseX ? 1 : -1;
          petal.x += direction * force * 3;
          petal.rotationSpeed += direction * force * 2;
        }

        if (petal.y > canvas.height + 50) {
          petal.y = -50;
          petal.x = Math.random() * canvas.width;
          petal.rotation = Math.random() * 360;
        }

        if (petal.x < -50) petal.x = canvas.width + 50;
        if (petal.x > canvas.width + 50) petal.x = -50;

        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate((petal.rotation * Math.PI) / 180);
        ctx.globalAlpha = petal.opacity;
        ctx.font = `${petal.size}px serif`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(255, 182, 193, 0.6)';
        ctx.fillText('🌸', -petal.size / 2, petal.size / 2);
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    const handleMouse = (e) => {
      mouseX = e.clientX;
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
}