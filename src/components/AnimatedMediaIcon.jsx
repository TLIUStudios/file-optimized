import { useEffect, useState } from "react";
import { Image as ImageIcon, Film, Video, Music } from "lucide-react";

export default function AnimatedMediaIcon({ className = "w-6 h-6" }) {
  const icons = [
    { Icon: ImageIcon, key: 'image' },
    { Icon: Film, key: 'gif' },
    { Icon: Video, key: 'video' },
    { Icon: Music, key: 'audio' }
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % icons.length);
    }, 2000); // Change icon every 2 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const CurrentIcon = icons[currentIndex].Icon;
  
  return (
    <div className="relative">
      <CurrentIcon 
        className={`${className} transition-all duration-500 animate-in fade-in-0 zoom-in-95`} 
        key={currentIndex}
      />
    </div>
  );
}