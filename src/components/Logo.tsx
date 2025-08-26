import Image from 'next/image';
import Link from 'next/link';

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
  const logoElement = (
    <Image 
      src="/logo.png" 
      alt="ShareX AI - AI超级分享平台" 
      width={400}
      height={100}
      priority={priority}
      className={`w-auto ${sizeClasses[size]} ${className}`}
    />
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