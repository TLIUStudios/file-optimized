import { useEffect, useRef } from "react";

export default function HalloweenEffect() {
  const canvasRef = useRef(null);
  const batsRef = useRef([]);
  const spidersRef = useRef([]);
  const pumpkinsRef = useRef([]);
  const ghostsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize elements
    for (let i = 0; i < 3; i++) {
      ghostsRef.current.push({
        x: (i + 1) * (canvas.width / 4),
        y: canvas.height * 0.4,
        targetY: canvas.height * 0.4,
        size: 40 + Math.random() * 20,
        wobble: 0,
      });
    }

    for (let i = 0; i < 2; i++) {
      pumpkinsRef.current.push({
        x: i === 0 ? canvas.width * 0.15 : canvas.width * 0.85,
        y: canvas.height - 80,
        size: 60,
        glow: 0,
      });
    }

    let mouseY = canvas.height / 2;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw spiderwebs
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
      ctx.lineWidth = 2;
      for (let i = 1; i <= 3; i++) {
        const x = i * (canvas.width / 4);
        ctx.beginPath();
        ctx.arc(x, 30, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220, 220, 220, 0.7)';
        ctx.fill();
        
        for (let j = -2; j <= 2; j++) {
          ctx.beginPath();
          ctx.moveTo(x, 30);
          ctx.lineTo(x + j * 50, canvas.height * 0.3);
          ctx.stroke();
        }
      }

      // Bats
      batsRef.current.forEach((bat, i) => {
        bat.x -= 1.5;
        bat.y += Math.sin(Date.now() / 300 + i) * 0.4;
        
        ctx.save();
        ctx.translate(bat.x, bat.y);
        ctx.font = `${bat.size}px serif`;
        ctx.fillStyle = '#000';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.fillText('🦇', 0, 0);
        ctx.restore();
      });
      batsRef.current = batsRef.current.filter(b => b.x > -100);

      // Spiders
      spidersRef.current.forEach((spider, i) => {
        spider.y += 0.4;
        spider.swing = Math.sin(Date.now() / 400) * 15;
        
        ctx.strokeStyle = 'rgba(180, 180, 180, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(spider.x, 0);
        ctx.lineTo(spider.x + spider.swing, spider.y);
        ctx.stroke();
        
        ctx.save();
        ctx.translate(spider.x + spider.swing, spider.y);
        ctx.font = '24px serif';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.fillText('🕷️', 0, 0);
        ctx.restore();
      });
      spidersRef.current = spidersRef.current.filter(s => s.y < canvas.height);

      // Ghosts
      ghostsRef.current.forEach((ghost, i) => {
        ghost.targetY = canvas.height * 0.4 + (mouseY - canvas.height / 2) * 0.3 + Math.sin(Date.now() / 1000 + i) * 20;
        ghost.y += (ghost.targetY - ghost.y) * 0.05;
        ghost.wobble = Math.sin(Date.now() / 800 + i) * 5;
        
        ctx.save();
        ctx.translate(ghost.x + ghost.wobble, ghost.y);
        ctx.font = `${ghost.size}px serif`;
        ctx.shadowBlur = 25;
        ctx.shadowColor = 'rgba(138, 43, 226, 0.8)';
        ctx.fillText('👻', 0, 0);
        ctx.restore();
      });

      // Pumpkins
      pumpkinsRef.current.forEach((pumpkin, i) => {
        pumpkin.glow = Math.sin(Date.now() / 1000 + i) * 0.3 + 0.7;
        
        ctx.save();
        ctx.translate(pumpkin.x, pumpkin.y);
        ctx.font = `${pumpkin.size}px serif`;
        ctx.shadowBlur = 30;
        ctx.shadowColor = `rgba(255, 140, 0, ${pumpkin.glow})`;
        ctx.fillText('🎃', 0, 0);
        ctx.restore();
      });

      // Fog
      const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height, 0, canvas.width / 2, canvas.height, canvas.width / 2);
      gradient.addColorStop(0, 'rgba(138, 43, 226, 0.15)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height - 200, canvas.width, 200);

      requestAnimationFrame(animate);
    };

    const handleMouse = (e) => {
      mouseY = e.clientY;
    };

    const batInterval = setInterval(() => {
      batsRef.current.push({
        x: canvas.width + 50,
        y: canvas.height * (0.2 + Math.random() * 0.5),
        size: 28 + Math.random() * 12,
      });
    }, 3000);

    const spiderInterval = setInterval(() => {
      spidersRef.current.push({
        x: Math.random() * canvas.width,
        y: 0,
        swing: 0,
      });
    }, 4000);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      clearInterval(batInterval);
      clearInterval(spiderInterval);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
}