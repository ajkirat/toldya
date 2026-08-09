import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'rose' | 'green' | 'yellow' | 'gray' | 'blue';

const variants: Record<Variant, string> = {
  rose:   'bg-rose-100 text-rose-700',
  green:  'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  gray:   'bg-gray-100 text-gray-600',
  blue:   'bg-blue-100 text-blue-700',
};

export function Badge({
  children,
  variant = 'gray',
  className,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
