import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LazyImage({ src, alt, className, onClick }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "50px",
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {!isLoaded && <Skeleton className="absolute inset-0" />}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={className}
          onLoad={() => setIsLoaded(true)}
          onClick={onClick}
          style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 0.3s" }}
        />
      )}
    </div>
  );
}