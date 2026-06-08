import { useRef, useCallback, type ReactNode } from 'react';

interface HolographicCardProps {
  children: ReactNode;
  className?: string;
}

export default function HolographicCard({ children, className = '' }: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateX = (mouseY / (rect.height / 2)) * -10;
    const rotateY = (mouseX / (rect.width / 2)) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    // Move glare
    const glareX = ((e.clientX - rect.left) / rect.width) * 100;
    const glareY = ((e.clientY - rect.top) / rect.height) * 100;
    glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 102, 0, 0.15) 0%, transparent 60%)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;

    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    card.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)';
    glare.style.background = 'transparent';

    setTimeout(() => {
      if (card) {
        card.style.transition = '';
      }
    }, 300);
  }, []);

  return (
    <div
      ref={cardRef}
      className={`card-3d relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
      <div
        ref={glareRef}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: 'overlay' }}
      />
    </div>
  );
}
