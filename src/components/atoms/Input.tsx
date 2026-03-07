import React, { forwardRef } from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  isError?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ isError, className, ...props }, ref) => {
    const errorStyle = isError ? 'border-red-500' : 'border-gray-300';
    return (
      <input
        ref={ref}
        className={`appearance-none block w-full px-4 py-3 border ${errorStyle} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
