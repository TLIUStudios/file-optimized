import { useEffect, useRef } from "react";

export default function FireworksEffect() {
  const containerRef = useRef(null);
  const fireworksRef = useRef([]);

  useEffect(() => {
    let frameId;

    const launchFirework = (x, y) => {
      const colors = [
        ['#ff0844', '#ff5c8d'],
        ['#ffd700', '#ffed4e'],
        ['#00d9ff', '#5ce1ff'],
        ['#b337ff', '#d280ff'],
        ['#00ff88', '#5dffb0'],
        ['#ff3d9e', '#ff7bc4']
      ];
      const colorPair = colors[Math.floor(Math.random() * colors.length)];
      const id = Date.now() + Math.random();
      
      const particles = Array.from({ length: 45 }, (_, i) => ({
        angle: (360 / 45) * i + (Math.random() - 0.5) * 10,
        distance: 0,
        speed: 2 + Math.random() * 0.8,
        size: 2 + Math.random() * 2,
      }));

      fireworksRef.current.push({ id, x, y, colors: colorPair, particles, time: 0 });

      setTimeout(() => {
        const idx = fireworksRef.current.findIndex(fw => fw.id === id);
        if (idx !== -1) fireworksRef.current.splice(idx, 1);
      }, 1800);
    };

    const render = () => {
      fireworksRef.current.forEach(fw => {
        if (fw.time < 28) {
          fw.particles.forEach(p => {
            p.distance += p.speed;
            p.speed *= 0.98;
          });
          fw.time++;
        }
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = fireworksRef.current.map(fw => {
          const particlesHTML = fw.particles.map((p, i) => {
            const rad = (p.angle * Math.PI) / 180;
            const x = Math.cos(rad) * p.distance;
            const y = Math.sin(rad) * p.distance;
            const opacity = Math.max(0, 1 - p.distance / 90);
            const color = i % 3 === 0 ? fw.colors[1] : fw.colors[0];
            
            return `<div class="absolute rounded-full" style="transform:translate3d(${x}px,${-y}px,0);background:${color};width:${p.size}px;height:${p.size}px;box-shadow:0 0 ${p.size * 4}px ${color};opacity:${opacity};will-change:transform;contain:layout style paint"></div>`;
          }).join('');

          const trailHTML = fw.time < 6 ? 
            `<div class="absolute w-1.5 rounded-full" style="left:-3px;bottom:-60px;height:60px;background:linear-gradient(to top,${fw.colors[0]},transparent);box-shadow:0 0 20px ${fw.colors[0]};opacity:${1 - fw.time / 6}"></div>` 
            : '';

          const flashHTML = fw.time < 10 ? 
            `<div class="absolute rounded-full" style="left:-20px;top:-20px;width:40px;height:40px;background:radial-gradient(circle,white,${fw.colors[0]},transparent);box-shadow:0 0 60px ${fw.colors[0]};opacity:${1 - fw.time / 10};transform:scale(${1 + fw.time / 5});will-change:transform"></div>` 
            : '';

          return `<div class="absolute" style="left:${fw.x}%;bottom:${fw.y}%;contain:layout style paint">${trailHTML}${particlesHTML}${flashHTML}</div>`;
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
      launchFirework(25 + Math.random() * 50, 45 + Math.random() * 35);
    }, 2000);

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