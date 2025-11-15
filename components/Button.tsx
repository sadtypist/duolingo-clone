
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'practice';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wide";
  
  const variants = {
    primary: "bg-brand-green text-white shadow-[0_4px_0_0_#46a302] hover:bg-brand-green/90 active:shadow-none active:translate-y-[4px]",
    secondary: "bg-brand-blue text-white shadow-[0_4px_0_0_#1899d6] hover:bg-brand-blue/90 active:shadow-none active:translate-y-[4px]",
    danger: "bg-brand-red text-white shadow-[0_4px_0_0_#d63030] hover:bg-brand-red/90 active:shadow-none active:translate-y-[4px]",
    outline: "bg-white text-gray-500 border-2 border-gray-200 shadow-[0_4px_0_0_#e5e7eb] hover:bg-gray-50 hover:border-gray-300 active:shadow-none active:translate-y-[4px]",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100 shadow-none active:scale-95",
    practice: "bg-purple-500 text-white shadow-[0_4px_0_0_#7e22ce] hover:bg-purple-600 active:shadow-none active:translate-y-[4px]"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};