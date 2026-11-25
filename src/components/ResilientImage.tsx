import { useState } from 'react';
import { Flower2 } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#EFECE6] via-[#F5F3EE] to-[#E5E0D7] text-[#4C574F] p-6 text-center ${className}`}
      >
        <Flower2 className="w-8 h-8 mb-3 stroke-[1.25] opacity-70" aria-hidden="true" />
        <span className="font-serif text-base italic tracking-wide text-[#2D3B32]">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
