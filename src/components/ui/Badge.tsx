import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-neutral-900 text-neutral-50 hover:bg-neutral-800 shadow-neutral-900/20',
        secondary: 'border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-200 shadow-neutral-200/50',
        destructive: 'border-transparent bg-red-500 text-white hover:bg-red-600 shadow-red-500/20',
        success: 'border-transparent bg-green-500 text-white hover:bg-green-600 shadow-green-500/20',
        warning: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-600 shadow-yellow-500/20',
        info: 'border-transparent bg-blue-500 text-white hover:bg-blue-600 shadow-blue-500/20',
        outline: 'text-neutral-950 border-neutral-300 bg-white hover:bg-neutral-50 shadow-neutral-200/30',
        premium: 'border-transparent bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-purple-500/20',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
