import { useEffect, useRef } from "react";

export default function HalloweenEffect() {
  const containerRef = useRef(null);
  const batsRef = useRef([]);
  const ghostsRef = useRef([
    { x: 20, y: 25, baseY: 25 },
    { x: 50, y: 20, baseY: 20 },
    { x: 80, y: 28, baseY: 28 },
  ]);
  const frameRef = useRef(0);

  useEffect(() => {
    let lastTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;
    let time = 0;

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= frameInterval) {
        lastTime = currentTime - (deltaTime % frameInterval);
        time += 0.02;

        // Update bats
        batsRef.current.forEach(bat => {
          bat.x -= 0.5;
          bat.y = bat.baseY + Math.sin(time * 3 + bat.id) * 2;
        });
        batsRef.current = batsRef.current.filter(b => b.x > -10);

        // Update ghosts (gentle floating)
        ghostsRef.current.forEach((ghost, i) => {
          ghost.y = ghost.baseY + Math.sin(time + i * 2) * 3;
          ghost.wobble = Math.sin(time * 2 + i) * 5;
        });

        if (containerRef.current) {
          containerRef.current.innerHTML = 
            // Glowing orbs
            `<div style="position:absolute;top:5%;left:15%;width:50px;height:50px;background:radial-gradient(circle,rgba(255,140,0,0.25),transparent);border-radius:50%"></div>` +
            `<div style="position:absolute;top:8%;right:20%;width:40px;height:40px;background:radial-gradient(circle,rgba(138,43,226,0.2),transparent);border-radius:50%"></div>` +
            // Bats
            batsRef.current.map(b =>
              `<div style="position:absolute;left:${b.x}%;top:${b.y}%;font-size:22px;opacity:0.8">🦇</div>`
            ).join('') +
            // Ghosts
            ghostsRef.current.map(g =>
              `<div style="position:absolute;left:${g.x}%;top:${g.y}%;transform:translateX(${g.wobble}px);font-size:32px;opacity:0.6;filter:drop-shadow(0 0 10px rgba(138,43,226,0.5))">👻</div>`
            ).join('');
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    // Spawn bats periodically
    const batInterval = setInterval(() => {
      if (batsRef.current.length < 5) {
        batsRef.current.push({
          x: 105,
          baseY: 15 + Math.random() * 35,
          y: 25,
          id: Math.random(),
        });
      }
    }, 5000);

    // Initial bat
    batsRef.current.push({ x: 90, baseY: 20, y: 20, id: 1 });

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(batInterval);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      style={{ contain: 'strict' }}
    />
  );
}