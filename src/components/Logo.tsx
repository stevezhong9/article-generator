import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  linkToHome?: boolean;
  priority?: boolean;
}

const sizeClasses = {
  sm: 'h-6',
  md: 'h-8', 
  lg: 'h-24'
};

export default function Logo({ 
  className = '', 
  size = 'md', 
  linkToHome = true,
  priority = false 
}: LogoProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logoElement = (
    <div className="relative inline-block">
      {isLoading && (
        <div className={`${sizeClasses[size]} w-32 bg-gray-200 animate-pulse rounded`} />
      )}
      {!imageError ? (
        <Image 
          src="/logo.png" 
          alt="SharetoX - AI超级分享平台" 
          width={300}
          height={75}
          priority={priority}
          className={`w-auto ${sizeClasses[size]} ${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setImageError(true);
            setIsLoading(false);
          }}
        />
      ) : (
        <div className={`${sizeClasses[size]} w-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center text-white font-bold`}>
          SharetoX
        </div>
      )}
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/" className="flex items-center">
        {logoElement}
      </Link>
    );
  }

  return logoElement;
}