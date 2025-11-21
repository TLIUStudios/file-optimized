import { useEffect, useRef } from "react";

export default function FireworksEffect() {
  const containerRef = useRef(null);
  const fireworksRef = useRef([]);

  useEffect(() => {
    let frameId;

    const launchFirework = (x, y) => {
      const colors = ['#ff0844', '#ffd700', '#00d9ff', '#b337ff', '#00ff88', '#ff3d9e'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const id = Date.now() + Math.random();
      
      const particles = Array.from({ length: 35 }, (_, i) => {
        const angle = (360 / 35) * i;
        return { angle, distance: 0 };
      });

      fireworksRef.current.push({ id, x, y, color, particles, time: 0 });

      setTimeout(() => {
        const idx = fireworksRef.current.findIndex(fw => fw.id === id);
        if (idx !== -1) fireworksRef.current.splice(idx, 1);
      }, 1500);
    };

    const render = () => {
      fireworksRef.current.forEach(fw => {
        if (fw.time < 25) {
          fw.particles.forEach(p => p.distance += 2);
          fw.time++;
        }
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = fireworksRef.current.map(fw => {
          const particlesHTML = fw.particles.map((p, i) => {
            const rad = (p.angle * Math.PI) / 180;
            const x = Math.cos(rad) * p.distance;
            const y = Math.sin(rad) * p.distance;
            const opacity = Math.max(0, 1 - p.distance / 80);
            return `<div class="absolute w-2 h-2 rounded-full" style="transform:translate3d(${x}px,${-y}px,0);background:${fw.color};box-shadow:0 0 8px ${fw.color};opacity:${opacity};will-change:transform;contain:layout style paint"></div>`;
          }).join('');

          const flashHTML = fw.time < 8 ? 
            `<div class="absolute rounded-full" style="left:-15px;top:-15px;width:30px;height:30px;background:radial-gradient(circle,white,${fw.color});box-shadow:0 0 50px ${fw.color};opacity:${1 - fw.time / 8};transform:scale(${1 + fw.time / 4});will-change:transform"></div>` 
            : '';

          return `<div class="absolute" style="left:${fw.x}%;bottom:${fw.y}%;contain:layout style paint">${particlesHTML}${flashHTML}</div>`;
        }).join('');
      }

      frameId = requestAnimationFrame(render);
    };

    const handleClick = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = 100 - (e.clientY / window.innerHeight) * 100;
      launchFirework(x, y);
    };

    const interval = setInterval(() => {
      launchFirework(30 + Math.random() * 40, 50 + Math.random() * 30);
    }, 2800);

    window.addEventListener('click', handleClick, { passive: true });
    frameId = requestAnimationFrame(render);

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50" style={{ contain: 'layout style paint' }} />;
}