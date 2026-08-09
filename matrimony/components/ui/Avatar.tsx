import Image from 'next/image';
import { cn, initials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  photo?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: { box: 'h-8 w-8 text-xs', img: 32 },
  md: { box: 'h-12 w-12 text-sm', img: 48 },
  lg: { box: 'h-20 w-20 text-lg', img: 80 },
  xl: { box: 'h-32 w-32 text-2xl', img: 128 },
};

export function Avatar({ name, photo, size = 'md', className }: AvatarProps) {
  const { box, img } = sizes[size];
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-600 font-semibold text-white overflow-hidden',
        box,
        className
      )}
    >
      {photo ? (
        <Image
          src={photo}
          alt={name}
          width={img}
          height={img}
          className="object-cover w-full h-full"
        />
      ) : (
        initials(name)
      )}
    </div>
  );
}
