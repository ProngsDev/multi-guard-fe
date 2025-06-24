import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none touch-manipulation',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm hover:from-blue-700 hover:to-blue-800 hover:shadow-md focus-visible:ring-blue-500 border border-blue-600',
        destructive: 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm hover:from-red-700 hover:to-red-800 hover:shadow-md focus-visible:ring-red-500 border border-red-600',
        outline: 'border-2 border-neutral-300 bg-white text-neutral-900 shadow-sm hover:bg-neutral-50 hover:border-neutral-400 focus-visible:ring-neutral-500 hover:shadow-md',
        secondary: 'bg-neutral-100 text-neutral-900 shadow-sm hover:bg-neutral-200 hover:shadow-md focus-visible:ring-neutral-500 border border-neutral-200',
        ghost: 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-neutral-500 hover:shadow-sm',
        link: 'text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 focus-visible:ring-blue-500 p-0 h-auto',
        success: 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-sm hover:from-green-700 hover:to-green-800 hover:shadow-md focus-visible:ring-green-500 border border-green-600',
        warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-sm hover:from-yellow-600 hover:to-yellow-700 hover:shadow-md focus-visible:ring-yellow-500 border border-yellow-500',
        premium: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm hover:from-purple-700 hover:to-purple-800 hover:shadow-md focus-visible:ring-purple-500 border border-purple-600',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-md',
        sm: 'h-8 px-3 text-sm rounded-md',
        default: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-6 text-base rounded-xl',
        xl: 'h-14 px-8 text-lg rounded-xl',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0 rounded-md',
        'icon-lg': 'h-12 w-12 p-0 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
