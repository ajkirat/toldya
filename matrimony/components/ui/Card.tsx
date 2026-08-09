import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl bg-white border border-gray-100 shadow-sm',
        hover && 'cursor-pointer transition-shadow hover:shadow-md active:shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
}
