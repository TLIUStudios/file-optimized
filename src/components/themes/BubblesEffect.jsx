import { useEffect, useState } from "react";

export default function BubblesEffect() {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = ((window.innerHeight - e.clientY) / window.innerHeight) * 100;
      
      const newBubbles = Array.from({ length: 3 }, (_, i) => ({
        id: Date.now() + Math.random() + i,
        left: x + (Math.random() - 0.5) * 10,
        bottom: y,
        animationDuration: 5 + Math.random() * 6,
        delay: i * 0.1,
        size: 30 + Math.random() * 50,
        wobble: (Math.random() - 0.5) * 60,
        isClick: true,
      }));

      setBubbles(prev => [...prev, ...newBubbles]);
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => !newBubbles.find(nb => nb.id === b.id)));
      }, 8000);
    };

    const autoInterval = setInterval(() => {
      const autoBubble = {
        id: Date.now() + Math.random(),
        left: Math.random() * 100,
        bottom: -10,
        animationDuration: 8 + Math.random() * 10,
        delay: 0,
        size: 25 + Math.random() * 45,
        wobble: (Math.random() - 0.5) * 50,
        isClick: false,
      };

      setBubbles(prev => [...prev, autoBubble]);
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== autoBubble.id));
      }, autoBubble.animationDuration * 1000 + 2000);
    }, 2000);

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
      clearInterval(autoInterval);
    };
  }, []);

  const handleBubbleClick = (bubbleId, e) => {
    e.stopPropagation();
    setBubbles(prev => prev.filter(b => b.id !== bubbleId));
  };

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className={`absolute ${bubble.isClick ? 'animate-bubble-burst' : 'animate-bubble-rise'} pointer-events-auto cursor-pointer`}
            onClick={(e) => handleBubbleClick(bubble.id, e)}
            style={{
              left: `${bubble.left}%`,
              bottom: `${bubble.bottom}%`,
              animationDuration: `${bubble.animationDuration}s`,
              animationDelay: `${bubble.delay}s`,
              '--wobble': `${bubble.wobble}px`,
            }}
          >
            <div
              className="rounded-full relative transition-transform hover:scale-110"
              style={{
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.85), rgba(173, 216, 230, 0.5) 50%, rgba(135, 206, 250, 0.65))',
                boxShadow: `
                  inset 0 0 ${bubble.size * 0.35}px rgba(255, 255, 255, 0.7),
                  inset ${bubble.size * 0.18}px ${bubble.size * 0.18}px ${bubble.size * 0.25}px rgba(255, 255, 255, 0.5),
                  0 0 ${bubble.size * 0.5}px rgba(135, 206, 250, 0.5),
                  0 ${bubble.size * 0.12}px ${bubble.size * 0.35}px rgba(0, 0, 0, 0.25)
                `,
                border: '2px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              <div
                className="absolute rounded-full"
                style={{
                  top: '18%',
                  left: '22%',
                  width: '32%',
                  height: '32%',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95), transparent 70%)',
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  bottom: '22%',
                  right: '28%',
                  width: '22%',
                  height: '22%',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6), transparent 65%)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-4 right-4 pointer-events-auto z-50">
        <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs">
          Click bubbles to pop! 🫧
        </div>
      </div>

      <style jsx>{`
        @keyframes bubble-rise {
          0% { transform: translateY(0) translateX(0) scale(0.7); opacity: 0; }
          12% { opacity: 1; }
          25% { transform: translateY(-25vh) translateX(var(--wobble)) scale(1); }
          50% { transform: translateY(-50vh) translateX(calc(var(--wobble) * -0.8)) scale(1.08); }
          75% { transform: translateY(-75vh) translateX(calc(var(--wobble) * 0.6)) scale(0.98); }
          88% { opacity: 0.85; }
          100% { transform: translateY(-110vh) translateX(calc(var(--wobble) * -0.4)) scale(0.75); opacity: 0; }
        }
        @keyframes bubble-burst {
          0% { transform: scale(0); opacity: 0; }
          20% { transform: scale(1.2); opacity: 1; }
          100% { transform: translateY(-100vh) scale(0.8); opacity: 0.7; }
        }
        .animate-bubble-rise { animation: bubble-rise ease-in-out infinite; }
        .animate-bubble-burst { animation: bubble-burst ease-out forwards; }
      `}</style>
    </>
  );
}