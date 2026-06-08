import { useRef, useCallback } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

interface CyclicTextCipherProps {
  text: string;
  className?: string;
  onClick?: () => void;
}

export default function CyclicTextCipher({ text, className = '', onClick }: CyclicTextCipherProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const isAnimating = useRef(false);

  const scramble = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const element = elementRef.current;
    if (!element) return;

    const originalChars = text.split('');
    const validIndices = originalChars
      .map((char, i) => (/[a-zA-Z0-9]/.test(char) ? i : -1))
      .filter(i => i !== -1);

    let frame = 0;
    const totalFrames = 30;

    const animate = () => {
      const progress = frame / totalFrames;
      const resolvedCount = Math.floor(progress * validIndices.length);

      const currentChars = originalChars.map((char, i) => {
        if (!/[a-zA-Z0-9]/.test(char)) return char;

        const validIndex = validIndices.indexOf(i);
        if (validIndex < resolvedCount) {
          return originalChars[i];
        }

        return CHARS[Math.floor(Math.random() * CHARS.length)];
      });

      element.textContent = currentChars.join('');

      frame++;
      if (frame <= totalFrames) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = text;
        isAnimating.current = false;
      }
    };

    requestAnimationFrame(animate);
  }, [text]);

  return (
    <span
      ref={elementRef}
      className={`scramble-text cursor-pointer ${className}`}
      onMouseEnter={scramble}
      onClick={() => {
        scramble();
        onClick?.();
      }}
    >
      {text}
    </span>
  );
}
