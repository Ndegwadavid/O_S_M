import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  width?: number;
  height?: number;
  withText?: boolean;
}

export default function Logo({ width = 50, height = 50, withText = true }: LogoProps) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative">
        <Image 
          src="/logo.svg" 
          alt="OptiPlus Logo" 
          width={width} 
          height={height}
          className="object-contain"
          priority
        />
      </div>
      {withText && (
        <div className="text-primary-700 font-bold text-xl">
          OptiPlus<span className="text-gray-600 font-normal">Internal</span>
        </div>
      )}
    </Link>
  );
}